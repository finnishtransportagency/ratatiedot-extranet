import JWT, { JwtPayload } from 'jsonwebtoken';
import Axios from 'axios';
import { log } from './logger';
import { createPublicKey } from 'crypto';

function jwkToPem(webKey: string | Buffer) {
  const pubKey = createPublicKey({
    key: webKey,
    format: 'jwk',
  });

  return pubKey.export({ format: 'pem', type: 'spki' }).toString();
}

let cachedKeys: Record<string, string> | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
const MAX_RETRIES = 2;

// Fetch JWK's from Cognito with caching and retry for transient errors
const getPublicKeys = async (issuerUrl: string) => {
  if (cachedKeys && Date.now() < cacheExpiry) {
    return cachedKeys;
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const publicKeys = await Axios.get(issuerUrl + '/.well-known/jwks.json');
      cachedKeys = {};
      for (const key of publicKeys.data.keys) {
        cachedKeys[key.kid] = jwkToPem(key);
      }
      cacheExpiry = Date.now() + CACHE_TTL_MS;
      return cachedKeys;
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code;
      const isTransient = ['EPIPE', 'ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED'].includes(errorCode ?? '');
      if (attempt < MAX_RETRIES && isTransient) {
        log.warn(`JWKS fetch failed with ${errorCode}, retrying (attempt ${attempt + 1}/${MAX_RETRIES})`);
        continue;
      }
      throw err;
    }
  }

  throw new Error('Failed to fetch JWKS public keys');
};

const validateJwtToken = async (
  token: string | undefined,
  dataToken: string | undefined,
  issuers: string[],
): Promise<JwtPayload | undefined> => {
  if (!token) {
    log.error('IAM JWT Token missing');
    return;
  }
  if (!dataToken) {
    log.error('IAM JWT Data Token missing');
    return;
  }
  // Split token into parts
  const tokenParts = token.split('.');
  if (tokenParts.length < 2) {
    log.error('Invalid token');
    return;
  }

  // Parse header & payload from token parts
  const tokenHeader = JSON.parse(Buffer.from(tokenParts[0], 'base64').toString('utf-8'));
  const tokenPayload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString('utf-8'));

  // Fetch public keys from Cognito
  let publicKeys = await getPublicKeys(tokenPayload.iss);
  let publicKey = publicKeys[tokenHeader.kid];

  // If key not found, cache may be stale (e.g. Cognito key rotation) — invalidate and retry
  if (!publicKey) {
    log.warn(`Public key ${tokenHeader.kid} not found in cache, refreshing JWKS`);
    cachedKeys = null;
    cacheExpiry = 0;
    publicKeys = await getPublicKeys(tokenPayload.iss);
    publicKey = publicKeys[tokenHeader.kid];
    if (!publicKey) {
      log.error('Public key not found after JWKS refresh');
      return;
    }
  }

  if (!issuers.includes(tokenPayload.iss)) {
    log.error('Invalid issuer');
    return;
  }

  // Verify token
  const result = JWT.verify(token, publicKey, { issuer: tokenPayload.iss }) as JwtPayload;
  if (!result) {
    log.error('Failed to verify JWT');
    return;
  }

  // Check use access
  if (result.token_use !== 'access') {
    log.error('Invalid token use');
    return;
  }

  // Return decoded data token
  return JWT.decode(dataToken.replace(/=/g, '')) as JwtPayload;
};

export { validateJwtToken };
