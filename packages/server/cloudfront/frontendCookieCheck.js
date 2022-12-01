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

function handler(event, context, callback) {
  var request = event.request;
  var headers = request.headers;

  /* Check for session-id in request cookie in viewer-request event,
   * if session-id is absent, redirect the user to sign in page with original
   * request sent as redirect_url in query params.
   */

  /* Check for session-id in cookie, if present then proceed with request */
  var parsedCookies = parseCookies(headers);
  if (parsedCookies && parsedCookies['CloudFront-Key-Pair-Id']) {
    callback(null, request);
    return;
  }
  var dns = headers.host[0].value;

  /* URI encode the original request to be sent as redirect_url in query params */
  var encodedRedirectUrl = encodeURIComponent(`${request.uri}?${request.querystring}`);
  var response = {
    status: '302',
    statusDescription: 'Found',
    headers: {
      location: [
        {
          key: 'Location',
          value: `https://${dns}/api/sign-cookie?redirect_url=${encodedRedirectUrl}`,
        },
      ],
    },
  };
  callback(null, response);
}
