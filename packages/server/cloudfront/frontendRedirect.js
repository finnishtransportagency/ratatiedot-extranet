'use strict';

function handler(event) {
  var request = event.request;
  var headers = request.headers;

  var index = request.uri === '/index.html';
  var isReturnedrequest = headers.return === 'true';
  /* Check for session-id in cookie, if present then proceed with request */
  if (!index || isReturnedrequest) {
    return request;
  }
  var host = headers.host && headers.host.value;
  if (!host) {
    return request;
  }
  var response = {
    statusCode: 302,
    statusDescription: 'Found',
    headers: {
      location: {
        value: `https://${host}/api/return-login`,
      },
    },
  };
  return response;
}
