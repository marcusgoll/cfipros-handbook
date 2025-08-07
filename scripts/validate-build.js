#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

console.log('🔍 CFI Handbook Build Validation');
console.log('=================================');

let validationPassed = true;
const issues = [];
const warnings = [];

// Step 1: Check build artifacts
console.log('\n1️⃣ Build Artifacts Validation...');

const requiredFiles = [
  { path: '.next/BUILD_ID', description: 'Build ID file' },
  { path: '.next/static', description: 'Static assets directory' },
  { path: '.next/server', description: 'Server-side build' },
  { path: '.next/static/chunks', description: 'JavaScript chunks' },
  { path: '.next/server/pages', description: 'Server pages' },
];

requiredFiles.forEach(({ path: filePath, description }) => {
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${description}: ${filePath}`);
  } else {
    console.log(`   ❌ Missing ${description}: ${filePath}`);
    issues.push(`Missing ${description}: ${filePath}`);
    validationPassed = false;
  }
});

// Step 2: Build size analysis
console.log('\n2️⃣ Build Size Analysis...');

try {
  const staticDir = '.next/static';
  if (fs.existsSync(staticDir)) {
    const getDirectorySize = (dirPath) => {
      let totalSize = 0;
      const files = fs.readdirSync(dirPath);

      files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          totalSize += getDirectorySize(filePath);
        } else {
          totalSize += stats.size;
        }
      });

      return totalSize;
    };

    const totalSize = getDirectorySize(staticDir);
    const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);

    console.log(`   📊 Total static assets: ${sizeMB} MB`);

    if (totalSize > 50 * 1024 * 1024) { // 50MB threshold
      warnings.push(`Large bundle size: ${sizeMB} MB - consider optimization`);
      console.log(`   ⚠️  Large bundle size: ${sizeMB} MB`);
    }
  }
} catch (error) {
  console.log('   ⚠️  Could not analyze build size');
  warnings.push('Could not analyze build size');
}

// Step 3: Critical pages validation
console.log('\n3️⃣ Critical Pages Validation...');

const criticalPages = [
  'pages/index.js',
  'pages/_app.js',
  'pages/_document.js',
  'pages/404.js',
];

criticalPages.forEach((pagePath) => {
  const serverPath = path.join('.next/server', pagePath);
  if (fs.existsSync(serverPath)) {
    console.log(`   ✅ ${pagePath}`);
  } else {
    // Try alternative paths for App Router
    const alternatives = [
      path.join('.next/server/app', pagePath.replace('pages/', '').replace('.js', '/page.js')),
      path.join('.next/server/app', pagePath.replace('pages/', '')),
    ];

    const found = alternatives.some(alt => fs.existsSync(alt));
    if (found) {
      console.log(`   ✅ ${pagePath} (App Router)`);
    } else {
      console.log(`   ⚠️  ${pagePath} not found`);
      warnings.push(`Critical page not found: ${pagePath}`);
    }
  }
});

// Step 4: JavaScript chunks validation
console.log('\n4️⃣ JavaScript Chunks Validation...');

const chunksDir = '.next/static/chunks';
if (fs.existsSync(chunksDir)) {
  const chunks = fs.readdirSync(chunksDir).filter(file => file.endsWith('.js'));
  console.log(`   ✅ Found ${chunks.length} JavaScript chunks`);

  // Check for essential chunks
  const hasFrameworkChunk = chunks.some(chunk => chunk.includes('framework'));
  const hasMainChunk = chunks.some(chunk => chunk.includes('main'));

  if (hasFrameworkChunk) {
    console.log('   ✅ Framework chunk found');
  } else {
    warnings.push('Framework chunk not found');
    console.log('   ⚠️  Framework chunk not found');
  }

  if (hasMainChunk) {
    console.log('   ✅ Main application chunk found');
  } else {
    warnings.push('Main application chunk not found');
    console.log('   ⚠️  Main application chunk not found');
  }
} else {
  issues.push('JavaScript chunks directory missing');
  validationPassed = false;
  console.log('   ❌ JavaScript chunks directory missing');
}

// Step 5: Environment configuration validation
console.log('\n5️⃣ Environment Configuration...');

const envChecks = [
  { key: 'NODE_ENV', expected: 'production' },
  { key: 'NEXT_TELEMETRY_DISABLED', expected: '1' },
];

envChecks.forEach(({ key, expected }) => {
  const value = process.env[key];
  if (value === expected) {
    console.log(`   ✅ ${key}=${value}`);
  } else {
    console.log(`   ⚠️  ${key}=${value} (expected: ${expected})`);
    warnings.push(`Environment variable ${key} not set to expected value`);
  }
});

// Step 6: Build metadata validation
console.log('\n6️⃣ Build Metadata...');

try {
  const buildId = fs.readFileSync('.next/BUILD_ID', 'utf8').trim();
  console.log(`   ✅ Build ID: ${buildId}`);

  const buildManifest = path.join('.next', 'build-manifest.json');
  if (fs.existsSync(buildManifest)) {
    const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
    const pageCount = Object.keys(manifest.pages || {}).length;
    console.log(`   ✅ Build manifest: ${pageCount} pages`);
  } else {
    warnings.push('Build manifest not found');
    console.log('   ⚠️  Build manifest not found');
  }
} catch (error) {
  issues.push('Could not read build metadata');
  console.log('   ❌ Could not read build metadata');
}

// Final report
console.log('\n📋 Validation Summary');
console.log('====================');

if (validationPassed && issues.length === 0) {
  console.log('✅ Build validation PASSED');
} else {
  console.log('❌ Build validation FAILED');
}

if (issues.length > 0) {
  console.log('\n🚨 Critical Issues:');
  issues.forEach(issue => console.log(`   • ${issue}`));
}

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  warnings.forEach(warning => console.log(`   • ${warning}`));
}

console.log(`\nIssues: ${issues.length} | Warnings: ${warnings.length}`);

// Exit with appropriate code
process.exit(validationPassed && issues.length === 0 ? 0 : 1);
