// This is a simple proxy function for Netlify to forward API requests to our backend
// when deploying frontend and backend separately

const https = require('https');
const { URL } = require('url');

// Get the URL of our API server from environment variables
const API_URL = process.env.API_URL || 'https://your-backend-url.onrender.com';

exports.handler = async (event, context) => {
  // Extract path from the event
  const path = event.path.replace('/.netlify/functions/proxy', '');
  const url = new URL(path, API_URL);
  
  // Forward query parameters
  if (event.queryStringParameters) {
    Object.keys(event.queryStringParameters).forEach(key => {
      url.searchParams.append(key, event.queryStringParameters[key]);
    });
  }

  // Set up request options
  const options = {
    method: event.httpMethod,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Forward authorization headers if they exist
  if (event.headers.authorization) {
    options.headers.authorization = event.headers.authorization;
  }

  // Add cookies if they exist
  if (event.headers.cookie) {
    options.headers.cookie = event.headers.cookie;
  }

  try {
    // For POST, PUT, PATCH requests, forward the request body
    let requestBody;
    if (['POST', 'PUT', 'PATCH'].includes(event.httpMethod) && event.body) {
      requestBody = event.body;
      options.headers['Content-Length'] = Buffer.byteLength(requestBody);
    }

    // Make the request to the backend API
    const response = await new Promise((resolve, reject) => {
      const req = https.request(url, options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: responseBody,
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (requestBody) {
        req.write(requestBody);
      }
      
      req.end();
    });

    // Return the response from the backend API
    return {
      statusCode: response.statusCode,
      headers: {
        'Content-Type': response.headers['content-type'] || 'application/json',
      },
      body: response.body,
    };
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to connect to API server' }),
    };
  }
};