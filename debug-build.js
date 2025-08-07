#!/usr/bin/env node

const { spawn } = require('node:child_process');

// Set environment variables for debugging
process.env.NEXT_PUBLIC_SENTRY_DISABLED = 'true';
process.env.NODE_ENV = 'production';
process.env.CLERK_SECRET_KEY = 'test_value';

console.log('Starting debug build...');
console.log('Environment:');
console.log('- NEXT_PUBLIC_SENTRY_DISABLED:', process.env.NEXT_PUBLIC_SENTRY_DISABLED);
console.log('- NODE_ENV:', process.env.NODE_ENV);

const child = spawn('npx', ['next', 'build'], {
  stdio: 'inherit',
  env: process.env,
});

child.on('error', (error) => {
  console.error('Build failed with error:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log('Build exited with code:', code);
  process.exit(code);
});

// Kill after 5 minutes to prevent hanging
setTimeout(() => {
  console.log('Build timeout after 5 minutes, killing process...');
  child.kill('SIGTERM');
  process.exit(1);
}, 5 * 60 * 1000);
