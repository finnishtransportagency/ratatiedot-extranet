#!/usr/bin/env node
/**
 * Local API Wrapper for testing CDK/SAM Lambdas
 *
 * This file is completely isolated and can be deleted when done testing.
 * No dependencies required - uses only Node.js built-in modules.
 *
 * Usage:
 *   node local-api-wrapper.js
 *
 * Then test:
 *   curl "http://localhost:3001/api/balises"
 *   curl "http://localhost:3001/api/balises?id_min=24000&id_max=25000"
 */

const http = require('http');
const url = require('url');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const CONFIG = {
  port: 3001,
  samTemplate: './cdk.rataextra/rataextra.template.json',
  environment: 'local',
  profile: '178238255639_Rataextra-dev', // Change this to your AWS profile
};

// Lambda function mappings - ADD NEW LAMBDAS HERE
const LAMBDA_ROUTES = [
  {
    method: 'GET',
    path: '/api/balises',
    lambdaName: 'stack-backend/getbalisesFC47DB5A',
    description: 'Get balises with optional filtering',
  },
  // ADD MORE ROUTES HERE:
  // {
  //   method: 'GET',
  //   path: '/api/notices',
  //   lambdaName: 'stack-backend/getnoticesEE098360',
  //   description: 'Get notices'
  // },
];

/**
 * Parse URL query parameters
 */
function parseQuery(queryString) {
  if (!queryString) return {};

  const params = {};
  const pairs = queryString.split('&');

  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
    }
  }

  return params;
}

/**
 * Parse request body
 */
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : null);
      } catch {
        resolve(body || null);
      }
    });
  });
}

/**
 * Convert HTTP request to ALBEvent format
 */
function createALBEvent(req, body, queryParams) {
  const queryStringParameters = Object.keys(queryParams).length > 0 ? queryParams : null;

  return {
    requestContext: {
      elb: {
        targetGroupArn: 'arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/local-test/1234567890123456',
      },
    },
    httpMethod: req.method,
    path: url.parse(req.url).pathname,
    queryStringParameters,
    headers: {
      ...req.headers,
      host: req.headers.host || 'localhost:3001',
      'user-agent': req.headers['user-agent'] || 'local-api-wrapper/1.0',
    },
    body: body ? JSON.stringify(body) : null,
    isBase64Encoded: false,
  };
}

/**
 * Invoke a Lambda function via SAM CLI
 */
async function invokeLambda(lambdaName, albEvent) {
  const tempDir = os.tmpdir();
  const eventFile = path.join(tempDir, `alb-event-${Date.now()}.json`);

  try {
    // Write event to temporary file
    fs.writeFileSync(eventFile, JSON.stringify(albEvent, null, 2));

    console.log(`🚀 Invoking ${lambdaName}...`);

    // Build SAM command
    const samCommand = [
      'ENVIRONMENT=' + CONFIG.environment,
      'sam local invoke',
      `"${lambdaName}"`,
      '-t',
      CONFIG.samTemplate,
      '--event',
      `"${eventFile}"`,
      '--profile',
      CONFIG.profile,
    ].join(' ');

    // Execute SAM command
    const result = execSync(samCommand, {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    });

    // Parse Lambda response
    const lines = result.split('\n').filter((line) => line.trim());
    const lastLine = lines[lines.length - 1];

    let lambdaResponse;
    try {
      lambdaResponse = JSON.parse(lastLine);
    } catch (parseError) {
      console.error('Failed to parse Lambda response:', lastLine);
      throw new Error('Invalid Lambda response format');
    }

    return lambdaResponse;
  } catch (error) {
    console.error('❌ Lambda invocation failed:', error.message);
    throw error;
  } finally {
    // Clean up temp file
    try {
      if (fs.existsSync(eventFile)) {
        fs.unlinkSync(eventFile);
      }
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp file:', cleanupError.message);
    }
  }
}

/**
 * Send JSON response
 */
function sendJSON(res, data, statusCode = 200) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

/**
 * Send error response
 */
function sendError(res, message, statusCode = 500) {
  sendJSON(res, { error: message }, statusCode);
}

/**
 * Handle Lambda route
 */
async function handleLambdaRoute(req, res, lambdaName) {
  try {
    const parsedUrl = url.parse(req.url, true);
    const body = await parseBody(req);
    const albEvent = createALBEvent(req, body, parsedUrl.query);

    const lambdaResponse = await invokeLambda(lambdaName, albEvent);

    // Set response status
    const statusCode = lambdaResponse.statusCode || 200;

    // Set response headers
    const headers = { 'Content-Type': 'application/json' };
    if (lambdaResponse.headers) {
      Object.assign(headers, lambdaResponse.headers);
    }

    res.writeHead(statusCode, headers);

    // Send response body
    if (lambdaResponse.body) {
      try {
        const bodyObj = JSON.parse(lambdaResponse.body);
        res.end(JSON.stringify(bodyObj, null, 2));
      } catch {
        res.end(lambdaResponse.body);
      }
    } else {
      res.end(JSON.stringify(lambdaResponse, null, 2));
    }
  } catch (error) {
    console.error(`❌ Error handling ${req.method} ${req.url}:`, error.message);
    sendError(res, `Internal server error: ${error.message}`);
  }
}

/**
 * Route matcher
 */
function matchRoute(method, pathname) {
  for (const route of LAMBDA_ROUTES) {
    if (route.method.toUpperCase() === method.toUpperCase()) {
      // Simple path matching - you can make this more sophisticated if needed
      if (pathname === route.path || pathname.startsWith(route.path.replace('*', ''))) {
        return route;
      }
    }
  }
  return null;
}

/**
 * Request handler
 */
async function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Health check
  if (method === 'GET' && pathname === '/health') {
    return sendJSON(res, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      routes: LAMBDA_ROUTES.length,
    });
  }

  // Root endpoint - list all routes
  if (method === 'GET' && pathname === '/') {
    const baseUrl = `http://localhost:${CONFIG.port}`;
    return sendJSON(res, {
      message: 'Local Lambda API Wrapper',
      baseUrl,
      routes: LAMBDA_ROUTES.map((route) => ({
        method: route.method,
        endpoint: `${baseUrl}${route.path}`,
        description: route.description,
        lambda: route.lambdaName,
      })),
      examples: [`${baseUrl}/api/balises`, `${baseUrl}/api/balises?id_min=24000&id_max=25000`, `${baseUrl}/health`],
    });
  }

  // Try to match Lambda routes
  const matchedRoute = matchRoute(method, pathname);
  if (matchedRoute) {
    return await handleLambdaRoute(req, res, matchedRoute.lambdaName);
  }

  // 404 - Route not found
  sendError(res, `Route not found: ${method} ${pathname}`, 404);
}

// Create HTTP server
const server = http.createServer(handleRequest);

// Start server
server.listen(CONFIG.port, () => {
  console.log('\n🎉 Local Lambda API Wrapper Started!');
  console.log(`📡 Server running on: http://localhost:${CONFIG.port}`);
  console.log(`📋 Available endpoints:`);

  LAMBDA_ROUTES.forEach((route) => {
    console.log(`   ${route.method.padEnd(6)} http://localhost:${CONFIG.port}${route.path}`);
  });

  console.log(`\n💡 Examples:`);
  console.log(`   curl "http://localhost:${CONFIG.port}/api/balises"`);
  console.log(`   curl "http://localhost:${CONFIG.port}/api/balises?id_min=24000&id_max=25000"`);
  console.log(`   curl "http://localhost:${CONFIG.port}/health"`);

  console.log(`\n🔧 Configuration:`);
  console.log(`   SAM Template: ${CONFIG.samTemplate}`);
  console.log(`   AWS Profile: ${CONFIG.profile}`);
  console.log(`   Environment: ${CONFIG.environment}`);

  console.log(`\n📝 To add new endpoints, edit the LAMBDA_ROUTES array in this file`);
  console.log(`\n🛑 To stop: Ctrl+C`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Local Lambda API Wrapper...');
  process.exit(0);
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
