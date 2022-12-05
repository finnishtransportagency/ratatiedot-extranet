'use strict';

// Based on example code found from https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-examples.html
function parseCookies(headers) {
  var parsedCookie = {};
  if (headers.cookie) {
    headers.cookie[0].value.split(';').forEach((cookie) => {
      if (cookie) {
        var parts = cookie.split('=');
        parsedCookie[parts[0].trim()] = parts[1].trim();
      }
    });
  }
  return parsedCookie;
}

function handler(event) {
  var request = event.request;
  var headers = request.headers;

  var index = request.uri === '/' || request.uri === '/index.html';
  if (!index) {
    return request;
  }

  /* Check for return cookie, if present then proceed with request */
  var parsedCookies = parseCookies(headers);
  var isReturnedrequest = parsedCookies && parsedCookies['Return'];
  if (isReturnedrequest) {
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
