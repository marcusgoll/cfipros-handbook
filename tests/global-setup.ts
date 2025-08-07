import type { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Clean up any hanging processes from previous test runs
  if (process.platform === 'win32') {
    try {
      const { exec } = await import('node:child_process');
      const { promisify } = await import('node:util');
      const execAsync = promisify(exec);

      // Kill any processes on test ports
      await execAsync('netstat -ano | findstr :5433').then(async (result) => {
        if (result.stdout) {
          const lines = result.stdout.split('\n');
          for (const line of lines) {
            const match = line.match(/\s+(\d+)$/);
            if (match) {
              try {
                await execAsync(`taskkill //PID ${match[1]} //F`);
              } catch {
                // Process may have already been killed
              }
            }
          }
        }
      }).catch(() => {
        // No processes found on port, which is fine
      });

      await execAsync('netstat -ano | findstr :3000').then(async (result) => {
        if (result.stdout) {
          const lines = result.stdout.split('\n');
          for (const line of lines) {
            const match = line.match(/\s+(\d+)$/);
            if (match) {
              try {
                await execAsync(`taskkill //PID ${match[1]} //F`);
              } catch {
                // Process may have already been killed
              }
            }
          }
        }
      }).catch(() => {
        // No processes found on port, which is fine
      });
    } catch (error) {
      console.warn('Could not clean up processes:', error);
    }
  }

  // Set up environment variables for testing
  Object.assign(process.env, { NODE_ENV: 'test' });
  process.env.NEXT_TELEMETRY_DISABLED = '1';
  process.env.NEXT_PUBLIC_SENTRY_DISABLED = 'true';

  // Handle Railway deployment environment
  if (process.env.RAILWAY_ENVIRONMENT_NAME) {
    console.log('Running in Railway environment, skipping local server setup');
    // Set the base URL to the Railway deployment URL if available
    if (process.env.RAILWAY_PUBLIC_DOMAIN) {
      process.env.PLAYWRIGHT_BASE_URL = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
    }
  }

  return async () => {
    // Global teardown - clean up any test artifacts
    console.log('Global teardown completed');
  };
}

export default globalSetup;
