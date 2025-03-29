
const https = require('https');
const { URL } = require('url');

exports.handler = async function(event, context) {
  const apiUrl = process.env.API_URL || 'https://your-backend-url.com';
  const path = event.path.replace('/api/', '');
  const url = new URL(path, apiUrl);

  try {
    const response = await new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: url.hostname,
          path: url.pathname + url.search,
          method: event.httpMethod,
          headers: event.headers,
        },
        (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => resolve({
            statusCode: res.statusCode,
            body,
            headers: res.headers
          }));
        }
      );

      req.on('error', reject);

      if (event.body) {
        req.write(event.body);
      }
      req.end();
    });

    return {
      statusCode: response.statusCode,
      body: response.body,
      headers: response.headers
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to proxy request' })
    };
  }
};
