import {
  fileRequestBuilder,
  updateFileRequestBuilder,
  updateFileMetadataRequestBuilder,
  deleteFileRequestBuilder,
} from '../../fileRequestBuilder';
import { mockFormDataOptions } from './__mocks__/lambdaMockFormOptions';

type jsonBody = {
  name: string;
};

const options = {
  requestContext: {
    elb: {
      targetGroupArn: '',
    },
  },
  httpMethod: '',
  path: '',
  body: '' as any,
  isBase64Encoded: true,
  headers: {
    accept: 'application/json',
    'content-type': '',
  },
};

describe('fileRequestBuilder', () => {
  it('returns file-upload body based on given values', async () => {
    options.httpMethod = 'POST';
    options.path = '/api/alfresco/file/hallintaraportit';
    options.headers['content-type'] = 'multipart/form-data';
    options.isBase64Encoded = false;
    options.body = mockFormDataOptions;

    const requestOptions = await fileRequestBuilder(options, {
      'X-API-Key': '',
      'OAM-REMOTE-USER': '',
    });
    type Options = {
      method: string;
      body?: FormData | any;
      headers?: { 'X-API-Key': string; 'OAM-REMOTE-USER': string };
    };

    expect(requestOptions).toMatchObject<Options>({ method: options.httpMethod });
  });
  it('returns update-file body based on given values', async () => {
    options.httpMethod = 'PUT';
    options.path = '/api/alfresco/file/hallintaraportit/foo-123/content';
    options.body = 'BASE64STRING==';

    const requestOptions = await updateFileRequestBuilder(options, {
      'X-API-Key': '',
      'OAM-REMOTE-USER': '',
    });
    type Options = {
      method: string;
      body?: Buffer;
      headers?: { 'X-API-Key': string; 'OAM-REMOTE-USER': string };
    };

    expect(requestOptions).toMatchObject<Options>({ method: options.httpMethod });
  });
  it('returns update-file-content body based on given values', () => {
    options.httpMethod = 'PUT';
    options.path = '/api/alfresco/file/hallintaraportit/foo-123';
    options.body = { name: 'file_v2.1.txt' };

    const requestOptions = updateFileMetadataRequestBuilder(options, {
      'X-API-Key': '',
      'OAM-REMOTE-USER': '',
    });

    type Options = {
      method: string;
      body?: jsonBody;
      headers?: { 'X-API-Key': string; 'OAM-REMOTE-USER': string };
    };

    expect(requestOptions).toMatchObject<Options>({ method: options.httpMethod });
  });
  it('returns delete-request body based on given values', () => {
    options.httpMethod = 'DELETE';
    options.path = '/api/alfresco/file/hallintaraportit/foo-123';
    options.body = null;

    const requestOptions = deleteFileRequestBuilder({
      'X-API-Key': '',
      'OAM-REMOTE-USER': '',
    });

    type Options = {
      method: string;
      body?: null;
      headers?: { 'X-API-Key': string; 'OAM-REMOTE-USER': string };
    };

    expect(requestOptions).toMatchObject<Options>({ method: options.httpMethod });
  });
});
