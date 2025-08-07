#!/usr/bin/env node

const { exec } = require('node:child_process');
const os = require('node:os');

function cleanup() {
  console.log('🧹 Cleaning up orphaned development processes...');

  if (os.platform() === 'win32') {
    // Windows cleanup
    exec('netstat -ano | findstr :3000', (error, stdout) => {
      if (stdout) {
        const lines = stdout.split('\n');
        const pids = new Set();

        lines.forEach((line) => {
          const match = line.match(/LISTENING\s+(\d+)/);
          if (match) {
            pids.add(match[1]);
          }
        });

        pids.forEach((pid) => {
          exec(`taskkill /PID ${pid} /F`, (killError) => {
            if (!killError) {
              console.log(`✅ Killed process ${pid} on port 3000`);
            }
          });
        });
      }
    });

    // Clean up any pglite-server processes
    exec('tasklist | findstr pglite', (error, stdout) => {
      if (stdout) {
        const lines = stdout.split('\n');
        lines.forEach((line) => {
          const match = line.match(/(\d+)\s+Console/);
          if (match) {
            const pid = match[1];
            exec(`taskkill /PID ${pid} /F`, (killError) => {
              if (!killError) {
                console.log(`✅ Killed pglite process ${pid}`);
              }
            });
          }
        });
      }
    });
  } else {
    // Unix/Linux/Mac cleanup
    exec('lsof -ti:3000', (error, stdout) => {
      if (stdout) {
        const pids = stdout.trim().split('\n');
        pids.forEach((pid) => {
          exec(`kill -9 ${pid}`, (killError) => {
            if (!killError) {
              console.log(`✅ Killed process ${pid} on port 3000`);
            }
          });
        });
      }
    });
  }

  // Clean .next directory
  exec('npx rimraf .next', (error) => {
    if (!error) {
      console.log('✅ Cleaned .next directory');
    }
  });

  console.log('🎯 Cleanup complete!');
}

cleanup();
