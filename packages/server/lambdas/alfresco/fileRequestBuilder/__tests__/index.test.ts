import {
  fileRequestBuilder,
  updateFileRequestBuilder,
  updateFileMetadataRequestBuilder,
  deleteFileRequestBuilder,
} from '../../fileRequestBuilder';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: '' as any,
  isBase64Encoded: true,
  headers: {
    accept: 'application/json',
    'content-type': '',
  },
};

describe('fileRequestBuilder', () => {
  it('returns file-upload body based on given values', async () => {
    const boundary = 'someBoundaryString';
    const fileContent = Buffer.from('test file content');
    const filename = 'test.pdf';

    // Create proper multipart form data
    const multiPartBody = Buffer.from(
      `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="filedata"; filename="${filename}"\r\n` +
        `Content-type: application/pdf\r\n\r\n` +
        `${fileContent.toString()}\r\n` +
        `--${boundary}--\r\n`,
    );
    options.httpMethod = 'POST';
    options.path = '/api/alfresco/file/hallintaraportit';
    options.headers['content-type'] = `multipart/form-data; boundary=${boundary}`;
    options.isBase64Encoded = false;
    options.body = multiPartBody;

    const requestOptions = await fileRequestBuilder(options, {
      'X-API-Key': '',
      'OAM-REMOTE-USER': '',
    });
    type Options = {
      method: string;
      body?: FormData;
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
