#!/usr/bin/env node

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

console.log('🚀 CFI Handbook Build Optimization');
console.log('=====================================');

// Step 1: Pre-build cleanup and optimization
console.log('\n1️⃣ Pre-build Cleanup...');

// Clear Next.js cache
if (fs.existsSync('.next')) {
  console.log('   ✅ Clearing .next cache');
  execSync('rimraf .next', { stdio: 'inherit' });
}

// Clear npm cache if needed
if (process.env.CLEAR_NPM_CACHE === 'true') {
  console.log('   ✅ Clearing npm cache');
  execSync('npm cache clean --force', { stdio: 'inherit' });
}

// Step 2: Environment optimization
console.log('\n2️⃣ Environment Setup...');

const requiredEnvVars = {
  NODE_ENV: 'production',
  NEXT_TELEMETRY_DISABLED: '1',
  NEXT_PUBLIC_SENTRY_DISABLED: 'true',
  ESLINT_NO_DEV_ERRORS: 'true',
  NODE_OPTIONS: '--max-old-space-size=2048',
};

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!process.env[key]) {
    process.env[key] = value;
    console.log(`   ✅ Set ${key}=${value}`);
  }
});

// Step 3: Dependency check
console.log('\n3️⃣ Dependency Verification...');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const criticalDeps = ['next', 'react', 'react-dom'];

  criticalDeps.forEach((dep) => {
    if (packageJson.dependencies[dep]) {
      console.log(`   ✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`   ⚠️  Missing critical dependency: ${dep}`);
    }
  });
} catch (error) {
  console.log('   ⚠️  Could not verify dependencies');
}

// Step 4: Build execution with monitoring
console.log('\n4️⃣ Build Execution...');

const buildStartTime = Date.now();

try {
  // Use the optimized build script
  execSync('npm run build:main', {
    stdio: 'inherit',
    timeout: 600000, // 10 minutes max
    env: process.env,
  });

  const buildTime = Math.round((Date.now() - buildStartTime) / 1000);
  console.log(`\n✅ Build completed successfully in ${buildTime}s`);
} catch (error) {
  const buildTime = Math.round((Date.now() - buildStartTime) / 1000);
  console.error(`\n❌ Build failed after ${buildTime}s:`, error.message);

  // Build diagnostics
  console.log('\n🔍 Build Diagnostics:');

  // Check for common issues
  if (fs.existsSync('.next/trace')) {
    console.log('   ⚠️  Build trace detected - analyzing...');
    // Could add trace analysis here
  }

  if (error.message.includes('EMFILE') || error.message.includes('ENFILE')) {
    console.log('   ⚠️  File descriptor limit reached - consider increasing ulimit');
  }

  if (error.message.includes('heap out of memory')) {
    console.log('   ⚠️  Memory limit reached - consider increasing NODE_OPTIONS');
  }

  process.exit(1);
}

// Step 5: Build validation
console.log('\n5️⃣ Build Validation...');

const buildDir = '.next';
const requiredFiles = [
  '.next/BUILD_ID',
  '.next/static',
  '.next/server',
];

let validationPassed = true;

requiredFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file} exists`);
  } else {
    console.log(`   ❌ ${file} missing`);
    validationPassed = false;
  }
});

// Check build size
if (fs.existsSync('.next/static')) {
  const stats = execSync('du -sh .next/static 2>/dev/null || echo "Size check skipped"', { encoding: 'utf8' });
  console.log(`   📊 Static assets size: ${stats.trim()}`);
}

console.log('\n🎉 Build optimization complete!');
console.log(`Status: ${validationPassed ? '✅ PASSED' : '❌ FAILED'}`);

if (!validationPassed) {
  process.exit(1);
}
