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
        body: 'LS1YLUlOU09NTklBLUJPVU5EQVJZCkNvbnRlbnQtRGlzcG9zaXRpb246IGZvcm0tZGF0YTsgbmFtZT0iZmlsZWRhdGEiOyBmaWxlbmFtZT0idGVzdGZpbGUwMDAyLnR4dCIKQ29udGVudC1UeXBlOiB0ZXh0L3BsYWluCgpUaGlzIGZpbGUgd2FzIHVwbG9hZGVkIHZpYSBBbGZyZXNjbyBBUEkKCi0tWC1JTlNPTU5JQS1CT1VOREFSWQpDb250ZW50LURpc3Bvc2l0aW9uOiBmb3JtLWRhdGE7IG5hbWU9Im5vZGVUeXBlIgoKY206Y29udGVudAotLVgtSU5TT01OSUEtQk9VTkRBUlkKQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSJuYW1lIgoKdGVzdGZpbGUwMDAyLnR4dAotLVgtSU5TT01OSUEtQk9VTkRBUlktLQo=',
        isBase64Encoded: true,
        headers: {
          accept: 'multipart/form-data',
          'content-length': '360',
          'content-type': 'multipart/form-data; boundary=X-INSOMNIA-BOUNDARY',
          host: 'localhost:3004',
          'oam-remote-user': 'LX348422',
          'user-agent': 'insomnia/2022.7.2',
          'x-amzn-trace-id': 'Root=1-63d132c6-4ffc016c2cc7a55547c684dd',
          'x-api-key': '5sr7ArpBUa7vuHnuCpTZr5I5XIGV9eO78qpp9Tqd',
          'x-forwarded-for': '100.64.58.29',
          'x-forwarded-port': '80',
          'x-forwarded-proto': 'http',
        },
      },
      {
        'X-API-Key': 'ASD',
        'OAM-REMOTE-USER': 'LX123123',
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
