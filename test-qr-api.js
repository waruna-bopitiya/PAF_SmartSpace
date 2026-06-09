const http = require('http');

// Test if the API is responding to QR code requests
const testQRCodeAPI = async () => {
  console.log('Testing QR Code API...\n');
  
  // First, let's just test if the backend is running
  console.log('1. Testing backend connectivity...');
  try {
    const result = await makeRequest('/bookings', 'GET', null, {});
    console.log('Backend response status:', result.status);
    console.log('Backend response:', result.body.slice(0, 200));
  } catch (error) {
    console.error('Backend error:', error.message);
  }
  
  // Now test the QR code endpoint with a sample booking ID
  console.log('\n2. Testing QR code endpoint with mock booking ID...');
  const mockBookingId = '507f1f77bcf86cd799439011'; // MongoDB ObjectID format
  
  try {
    const result = await makeRequest(`/bookings/${mockBookingId}/qr-code`, 'GET', null, {});
    console.log('QR Code API Status:', result.status);
    console.log('Response:', result.body);
  } catch (error) {
    console.error('QR Code API Error:', error.message);
  }
};

const makeRequest = (path, method, data, headers) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

testQRCodeAPI().catch(console.error);
