import { getSecuredStringParameter } from './parameterStore';

const geoviiteAPIKeyName = process.env.GEOVIITE_API_KEY_NAME || '';
const geoviiteAPIUrl = process.env.GEOVIITE_API_URL || '';

let geoviiteApiKey = '';

export const getGeoviiteOptions = async (headers?: Record<string, string>) => {
  if (!geoviiteApiKey) {
    geoviiteApiKey = await getSecuredStringParameter(geoviiteAPIKeyName);
  }
  return {
    headers: {
      ...headers,
      'x-api-key': geoviiteApiKey,
    },
  };
};

export const getGeoviiteUrlBase = () => geoviiteAPIUrl;
