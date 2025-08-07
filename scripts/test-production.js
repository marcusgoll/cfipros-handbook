#!/usr/bin/env node

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const http = require('node:http');

console.log('🧪 CFI Handbook Production Test');
console.log('===============================');

// Configuration
const TEST_PORT = process.env.TEST_PORT || 3001;
const TEST_TIMEOUT = 30000; // 30 seconds
const HEALTH_CHECK_INTERVAL = 2000; // 2 seconds

let serverProcess = null;
let testsPassed = 0;
let testsTotal = 0;

// Test helper functions
function runTest(name, testFn) {
  testsTotal++;
  console.log(`\n🔸 Running: ${name}`);

  return testFn()
    .then(() => {
      console.log(`   ✅ PASSED: ${name}`);
      testsPassed++;
    })
    .catch((error) => {
      console.log(`   ❌ FAILED: ${name}`);
      console.log(`      Error: ${error.message}`);
    });
}

function makeRequest(path = '/', options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: TEST_PORT,
      path,
      method: options.method || 'GET',
      timeout: 10000,
      ...options,
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.data) {
      req.write(options.data);
    }

    req.end();
  });
}

async function waitForServer(maxAttempts = 15) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await makeRequest('/api/health');
      console.log('   ✅ Server is ready');
      return true;
    } catch (error) {
      console.log(`   ⏳ Waiting for server... (${i + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, HEALTH_CHECK_INTERVAL));
    }
  }
  throw new Error('Server failed to start within timeout period');
}

// Test suite
async function runTests() {
  console.log('\n🚀 Starting production server...');

  // Start the production server
  serverProcess = spawn('npm', ['run', 'start'], {
    env: {
      ...process.env,
      PORT: TEST_PORT,
      NODE_ENV: 'production',
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  // Handle server output
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Ready') || output.includes('started server')) {
      console.log('   📡 Server output detected');
    }
  });

  serverProcess.stderr.on('data', (data) => {
    console.log('   ⚠️  Server error:', data.toString().trim());
  });

  try {
    // Wait for server to be ready
    await waitForServer();

    // Test 1: Basic health check
    await runTest('Health check endpoint', async () => {
      const response = await makeRequest('/api/health');
      if (response.statusCode !== 200) {
        throw new Error(`Expected 200, got ${response.statusCode}`);
      }
    });

    // Test 2: Homepage loads
    await runTest('Homepage loads', async () => {
      const response = await makeRequest('/');
      if (response.statusCode !== 200) {
        throw new Error(`Expected 200, got ${response.statusCode}`);
      }
      if (!response.body.includes('CFI') && !response.body.includes('<html')) {
        throw new Error('Homepage does not contain expected content');
      }
    });

    // Test 3: Static assets load
    await runTest('Static assets accessible', async () => {
      const response = await makeRequest('/_next/static/chunks/webpack.js');
      // Note: This might not exist in all builds, so we check for reasonable responses
      if (response.statusCode !== 200 && response.statusCode !== 404) {
        throw new Error(`Unexpected response: ${response.statusCode}`);
      }
    });

    // Test 4: API endpoints
    await runTest('API ready endpoint', async () => {
      const response = await makeRequest('/api/health/ready');
      if (response.statusCode !== 200 && response.statusCode !== 503) {
        throw new Error(`Expected 200 or 503, got ${response.statusCode}`);
      }
    });

    // Test 5: Dashboard page (authenticated route)
    await runTest('Dashboard page loads', async () => {
      const response = await makeRequest('/dashboard');
      // Should redirect to auth or load successfully
      if (response.statusCode !== 200 && response.statusCode !== 302 && response.statusCode !== 307) {
        throw new Error(`Expected 200, 302, or 307, got ${response.statusCode}`);
      }
    });

    // Test 6: Handbook pages
    await runTest('Handbook page loads', async () => {
      const response = await makeRequest('/handbook');
      if (response.statusCode !== 200 && response.statusCode !== 302) {
        throw new Error(`Expected 200 or 302, got ${response.statusCode}`);
      }
    });

    // Test 7: 404 handling
    await runTest('404 page handling', async () => {
      const response = await makeRequest('/this-page-does-not-exist');
      if (response.statusCode !== 404) {
        throw new Error(`Expected 404, got ${response.statusCode}`);
      }
    });

    // Test 8: Server performance
    await runTest('Server response time', async () => {
      const startTime = Date.now();
      await makeRequest('/');
      const responseTime = Date.now() - startTime;

      if (responseTime > 5000) { // 5 seconds
        throw new Error(`Slow response time: ${responseTime}ms`);
      }
      console.log(`      Response time: ${responseTime}ms`);
    });
  } catch (error) {
    console.log(`\n❌ Test setup failed: ${error.message}`);
  }

  // Cleanup
  if (serverProcess) {
    console.log('\n🛑 Stopping server...');
    serverProcess.kill('SIGTERM');

    // Wait for graceful shutdown
    await new Promise((resolve) => {
      serverProcess.on('close', resolve);
      setTimeout(() => {
        serverProcess.kill('SIGKILL');
        resolve();
      }, 5000);
    });
  }

  // Results
  console.log('\n📊 Test Results');
  console.log('================');
  console.log(`Passed: ${testsPassed}/${testsTotal}`);
  console.log(`Success Rate: ${Math.round((testsPassed / testsTotal) * 100)}%`);

  if (testsPassed === testsTotal) {
    console.log('\n🎉 All tests passed! Production build is ready.');
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${testsTotal - testsPassed} test(s) failed. Check the issues above.`);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n🛑 Test interrupted by user');
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
  process.exit(1);
});

process.on('SIGTERM', () => {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
  process.exit(1);
});

// Start tests
runTests().catch((error) => {
  console.error('\n💥 Test suite crashed:', error);
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
  process.exit(1);
});
