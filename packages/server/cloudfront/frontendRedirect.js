'use strict';

/**
 * Check if asking for file or page. For pages (including /index.html), check if cookie "Return" is set.
 * If cookie is missing, redirect to /api/return-login to check SSO session
 * @param {CloudFrontFunctionsEvent} event aws-lambda.CloudFrontFunctionsEvent
 * @returns Original request or redirect
 */
function handler(event) {
  var request = event.request;
  var headers = request.headers;
  var cookies = request.cookies;

  var index = request.uri === '/' || request.uri === '/index.html';
  var isFile = request.uri.split('.').length > 1;

  if (!index && isFile) {
    return request;
  }

  /* Check for return cookie, if present then proceed with request */
  var isReturnedRequest = cookies && (cookies['AWSELBAuthSessionCookie-0'] || cookies['AWSELBAuthSessionCookie-1']);
  if (isReturnedRequest) {
    return request;
  }
  var host = headers.host && headers.host.value;
  if (!host) {
    return request;
  }
  var encodedRedirectUrl = encodeURIComponent(`${request.uri}`);
  var response = {
    statusCode: 302,
    statusDescription: 'Found',
    headers: {
      location: {
        value: `https://${host}/api/return-login?redirect_url=${encodedRedirectUrl}`,
      },
    },
  };
  return response;
}
