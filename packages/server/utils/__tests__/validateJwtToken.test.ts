import { describe, it, expect, vi, beforeEach } from 'vitest';
import JWT from 'jsonwebtoken';
import { generateKeyPairSync } from 'crypto';

// Mock Axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

// Mock logger
vi.mock('../logger', () => ({
  log: {
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  },
}));

import Axios from 'axios';
import { validateJwtToken } from '../validateJwtToken';

const ISSUER = 'https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_test';
const ISSUERS = [ISSUER];

// Generate real RSA key pair for signing/verifying JWTs
function generateTestKeyPair(kid: string) {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });

  const jwk = publicKey.export({ format: 'jwk' });

  return {
    kid,
    privateKey,
    jwk: { ...jwk, kid, use: 'sig', alg: 'RS256' },
  };
}

function createTestToken(
  payload: Record<string, unknown>,
  privateKey: ReturnType<typeof generateKeyPairSync>['privateKey'],
  kid: string,
) {
  return JWT.sign(payload, privateKey, {
    algorithm: 'RS256',
    keyid: kid,
  });
}

function createTestDataToken(payload: Record<string, unknown>) {
  // Data token is decoded (not verified), so we can sign with any key
  return JWT.sign(payload, 'data-token-secret');
}

const mockedAxiosGet = vi.mocked(Axios.get);

describe('validateJwtToken', () => {
  const keyPair = generateTestKeyPair('test-kid-1');

  const makeJwksResponse = (...keys: Array<{ kid: string; jwk: Record<string, unknown> }>) => ({
    data: { keys: keys.map((k) => k.jwk) },
  });

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('retry on transient errors', () => {
    it('should retry on EPIPE and succeed', async () => {
      const token = createTestToken({ token_use: 'access', iss: ISSUER }, keyPair.privateKey, keyPair.kid);
      const dataToken = createTestDataToken({ uid: 'user-1', roles: 'test_role' });

      mockedAxiosGet.mockRejectedValueOnce({ code: 'EPIPE' }).mockResolvedValueOnce(makeJwksResponse(keyPair));

      const result = await validateJwtToken(token, dataToken, ISSUERS);
      expect(result).toBeDefined();
      expect(result?.uid).toBe('user-1');
      expect(mockedAxiosGet).toHaveBeenCalledTimes(2);
    });

    it('should retry on ECONNRESET and succeed', async () => {
      const token = createTestToken({ token_use: 'access', iss: ISSUER }, keyPair.privateKey, keyPair.kid);
      const dataToken = createTestDataToken({ uid: 'user-1' });

      mockedAxiosGet.mockRejectedValueOnce({ code: 'ECONNRESET' }).mockResolvedValueOnce(makeJwksResponse(keyPair));

      const result = await validateJwtToken(token, dataToken, ISSUERS);
      expect(result).toBeDefined();
      expect(mockedAxiosGet).toHaveBeenCalledTimes(2);
    });

    it('should throw after exhausting retries on transient errors', async () => {
      const token = createTestToken({ token_use: 'access', iss: ISSUER }, keyPair.privateKey, keyPair.kid);
      const dataToken = createTestDataToken({ uid: 'user-1' });

      mockedAxiosGet.mockRejectedValueOnce({ code: 'EPIPE' }).mockRejectedValueOnce({ code: 'EPIPE' });

      await expect(validateJwtToken(token, dataToken, ISSUERS)).rejects.toEqual({ code: 'EPIPE' });
      expect(mockedAxiosGet).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-transient errors', async () => {
      const token = createTestToken({ token_use: 'access', iss: ISSUER }, keyPair.privateKey, keyPair.kid);
      const dataToken = createTestDataToken({ uid: 'user-1' });

      mockedAxiosGet.mockRejectedValueOnce({ code: 'ENOTFOUND' });

      await expect(validateJwtToken(token, dataToken, ISSUERS)).rejects.toEqual({ code: 'ENOTFOUND' });
      expect(mockedAxiosGet).toHaveBeenCalledTimes(1);
    });
  });

  describe('input validation', () => {
    it('should return undefined when token is missing', async () => {
      const result = await validateJwtToken(undefined, 'data-token', ISSUERS);
      expect(result).toBeUndefined();
    });

    it('should return undefined when dataToken is missing', async () => {
      const result = await validateJwtToken('some-token', undefined, ISSUERS);
      expect(result).toBeUndefined();
    });

    it('should return undefined when token has fewer than 2 parts', async () => {
      const result = await validateJwtToken('invalidtoken', 'data-token', ISSUERS);
      expect(result).toBeUndefined();
    });

    it('should return undefined when issuer is not in allowed issuers', async () => {
      const token = createTestToken({ token_use: 'access', iss: ISSUER }, keyPair.privateKey, keyPair.kid);
      const dataToken = createTestDataToken({ uid: 'user-1' });

      mockedAxiosGet.mockResolvedValueOnce(makeJwksResponse(keyPair));

      const result = await validateJwtToken(token, dataToken, ['https://other-issuer.example.com']);
      expect(result).toBeUndefined();
    });

    it('should return undefined when token_use is not access', async () => {
      const token = createTestToken({ token_use: 'id', iss: ISSUER }, keyPair.privateKey, keyPair.kid);
      const dataToken = createTestDataToken({ uid: 'user-1' });

      mockedAxiosGet.mockResolvedValueOnce(makeJwksResponse(keyPair));

      const result = await validateJwtToken(token, dataToken, ISSUERS);
      expect(result).toBeUndefined();
    });
  });
});
