#!/usr/bin/env node

const { spawn } = require('node:child_process');
const path = require('node:path');

let dbProcess = null;
let nextProcess = null;

// Function to kill all processes
function cleanup() {
  console.log('\n🛑 Shutting down development servers...');

  if (nextProcess) {
    console.log('  Stopping Next.js server...');
    nextProcess.kill('SIGTERM');
  }

  if (dbProcess) {
    console.log('  Stopping database server...');
    dbProcess.kill('SIGTERM');
  }

  setTimeout(() => {
    process.exit(0);
  }, 1000);
}

// Handle process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

function startDatabase() {
  console.log('🗄️  Starting database server...');

  const isWindows = process.platform === 'win32';

  dbProcess = spawn('npx', ['pglite-server', '--db=local.db', '--port=5433'], {
    stdio: 'pipe',
    cwd: process.cwd(),
    shell: isWindows,
  });

  dbProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Server listening')) {
      console.log('✅ Database server started');
      startNextJS();
    }
    console.log(`[DB] ${output.trim()}`);
  });

  dbProcess.stderr.on('data', (data) => {
    console.log(`[DB Error] ${data.toString().trim()}`);
  });

  dbProcess.on('close', (code) => {
    console.log(`Database server exited with code ${code}`);
    if (code !== 0 && nextProcess) {
      cleanup();
    }
  });
}

function startNextJS() {
  console.log('⚡ Starting Next.js server...');

  const isWindows = process.platform === 'win32';

  nextProcess = spawn('npx', ['next', 'dev', '--turbopack'], {
    stdio: 'inherit',
    cwd: process.cwd(),
    shell: isWindows,
  });

  nextProcess.on('close', (code) => {
    console.log(`Next.js server exited with code ${code}`);
    cleanup();
  });
}

console.log('🚀 Starting CFI Handbook development environment...');
console.log('   Press Ctrl+C to stop all servers');
console.log('');

// Start the database first
startDatabase();
