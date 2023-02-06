import { fileRequestBuilder } from '../../fileRequestBuilder';

describe('fileRequestBuilder', () => {
  it('returns body based on given values', async () => {
    const requestOptions = await fileRequestBuilder(
      {
        requestContext: {
          elb: {
            targetGroupArn: '',
          },
        },
        httpMethod: 'POST',
        path: '/api/alfresco/file/hallintaraportit',
        body: 'BASE64STRING==',
        isBase64Encoded: true,
        headers: {
          accept: 'multipart/form-data',
        },
      },
      {
        'X-API-Key': '',
        'OAM-REMOTE-USER': '',
      },
    );

    type Options = {
      method: string;
      body?: FormData | any;
      headers?: { 'X-API-Key': string; 'OAM-REMOTE-USER': string };
    };

    expect(requestOptions).toMatchObject<Options>({ method: 'POST' });
  });
});
