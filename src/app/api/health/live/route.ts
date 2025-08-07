import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Liveness probe - simple check that the application is running
// This should be very lightweight and always return 200 unless the process is dead
export async function GET(_request: NextRequest) {
  // Simple liveness check - just return that the process is alive
  const memUsage = process.memoryUsage();

  return NextResponse.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    pid: process.pid,
    memory: {
      used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
    },
    railway: {
      environment: process.env.RAILWAY_ENVIRONMENT || 'unknown',
      deploymentId: process.env.RAILWAY_DEPLOYMENT_ID,
      service: process.env.RAILWAY_SERVICE_NAME || 'cfi-handbook',
      gitCommit: process.env.RAILWAY_GIT_COMMIT_SHA?.substring(0, 8),
    },
    nodeVersion: process.version,
    platform: process.platform,
  });
}
