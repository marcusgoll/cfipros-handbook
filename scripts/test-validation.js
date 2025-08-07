#!/usr/bin/env node

/**
 * Test validation script for CFI Handbook
 * Ensures all tests are properly configured and can run in various environments
 */

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

console.log('🧪 CFI Handbook Test Validation\n');

/**
 * Execute command with proper error handling
 */
function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 120000, // 2 minutes timeout
    });
    console.log('✅ Passed\n');
    return { success: true, output };
  } catch (error) {
    console.log(`❌ Failed: ${error.message}\n`);
    return { success: false, error: error.message };
  }
}

/**
 * Check if file exists
 */
function checkFile(filePath, description) {
  console.log(`📁 ${description}...`);
  if (fs.existsSync(filePath)) {
    console.log('✅ Found\n');
    return true;
  } else {
    console.log('❌ Missing\n');
    return false;
  }
}

/**
 * Kill processes on specific ports (Windows)
 */
function killPortProcesses(port) {
  try {
    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const lines = result.split('\n');

    for (const line of lines) {
      const match = line.match(/\s+(\d+)$/);
      if (match) {
        try {
          execSync(`taskkill //PID ${match[1]} //F`, { stdio: 'ignore' });
          console.log(`Killed process ${match[1]} on port ${port}`);
        } catch {
          // Process may have already been killed
        }
      }
    }
  } catch {
    // No processes found on port, which is fine
  }
}

async function main() {
  const results = {
    configFiles: 0,
    unitTests: 0,
    e2eTests: 0,
    coverage: 0,
    railwayConfig: 0,
    total: 5,
  };

  // 1. Check configuration files
  console.log('1️⃣ Checking Test Configuration Files');
  const vitest = checkFile('vitest.config.mts', 'Vitest configuration');
  const playwright = checkFile('playwright.config.ts', 'Playwright configuration');
  const globalSetup = checkFile('tests/global-setup.ts', 'Playwright global setup');

  if (vitest && playwright && globalSetup) {
    results.configFiles = 1;
  }

  // 2. Run unit tests
  console.log('2️⃣ Running Unit Tests (Vitest)');
  const unitTest = runCommand('npm run test', 'Unit tests execution');
  if (unitTest.success) {
    results.unitTests = 1;
  }

  // 3. Test coverage
  console.log('3️⃣ Checking Test Coverage');
  const coverage = runCommand('npm run test:coverage', 'Test coverage analysis');
  if (coverage.success) {
    results.coverage = 1;
  }

  // 4. Clean up ports and run E2E tests
  console.log('4️⃣ Running E2E Tests (Playwright)');
  console.log('Cleaning up ports...');
  killPortProcesses(5433);
  killPortProcesses(3000);

  // Wait a moment for ports to be released
  await new Promise(resolve => setTimeout(resolve, 2000));

  const e2eTest = runCommand('npm run test:e2e', 'E2E tests execution');
  if (e2eTest.success) {
    results.e2eTests = 1;
  }

  // 5. Check Railway configuration
  console.log('5️⃣ Checking Railway Deployment Configuration');
  const railwayJson = checkFile('railway.json', 'Railway JSON config');
  const railwayToml = checkFile('railway.toml', 'Railway TOML config');
  const healthCheck = checkFile('src/app/api/health/route.ts', 'Health check endpoint');
  const readinessCheck = checkFile('src/app/api/health/ready/route.ts', 'Readiness probe endpoint');
  const livenessCheck = checkFile('src/app/api/health/live/route.ts', 'Liveness probe endpoint');
  const envExample = checkFile('.env.example', 'Environment variables example');
  const railwayDocs = checkFile('docs/deployment/railway-environment-variables.md', 'Railway deployment docs');
  const clerkDocs = checkFile('docs/deployment/clerk-railway-integration.md', 'Clerk integration docs');

  // Railway configuration validation
  let railwayConfigValid = true;
  if (railwayJson && fs.existsSync('railway.json')) {
    try {
      const config = JSON.parse(fs.readFileSync('railway.json', 'utf8'));
      if (!config.deploy?.healthcheckPath) {
        console.log('❌ railway.json missing healthcheck configuration');
        railwayConfigValid = false;
      }
      if (!config.resources?.memory) {
        console.log('❌ railway.json missing resource allocation');
        railwayConfigValid = false;
      }
      if (config.deploy?.healthcheckPath && config.deploy.healthcheckPath !== '/api/health') {
        console.log('⚠️  Health check path should be /api/health');
      }
    } catch (error) {
      console.log('❌ railway.json is not valid JSON');
      railwayConfigValid = false;
    }
  }

  if (railwayJson && railwayToml && healthCheck && readinessCheck
    && livenessCheck && envExample && railwayDocs && clerkDocs && railwayConfigValid) {
    results.railwayConfig = 1;
  }

  // Summary
  console.log('📊 Test Validation Summary');
  console.log('='.repeat(50));
  console.log(`Configuration Files: ${results.configFiles ? '✅' : '❌'}`);
  console.log(`Unit Tests: ${results.unitTests ? '✅' : '❌'}`);
  console.log(`Test Coverage: ${results.coverage ? '✅' : '❌'}`);
  console.log(`E2E Tests: ${results.e2eTests ? '✅' : '❌'}`);
  console.log(`Railway Config: ${results.railwayConfig ? '✅' : '❌'}`);
  console.log('='.repeat(50));

  const passed = Object.values(results).reduce((sum, val) => sum + val, 0) - results.total;
  const total = results.total;

  console.log(`Overall: ${passed}/${total} checks passed`);

  if (passed === total) {
    console.log('🎉 All tests are properly configured and passing!');
    process.exit(0);
  } else {
    console.log('⚠️  Some test issues need to be resolved.');
    console.log('\n🔧 Recommendations:');

    if (!results.configFiles) {
      console.log('- Check test configuration files are present and valid');
    }
    if (!results.unitTests) {
      console.log('- Fix failing unit tests or configuration issues');
    }
    if (!results.coverage) {
      console.log('- Review test coverage and add missing tests');
    }
    if (!results.e2eTests) {
      console.log('- Resolve E2E test setup issues (ports, permissions, etc.)');
    }
    if (!results.railwayConfig) {
      console.log('- Ensure Railway deployment configuration is complete');
    }

    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Test validation failed:', error);
  process.exit(1);
});
