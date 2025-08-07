import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createErrorResponse, ErrorHandler } from '@/lib/error-handling';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      throw ErrorHandler.createError(
        'UNAUTHORIZED',
        'Authentication required to download resources',
        401,
      );
    }

    // Get resource details (mock implementation)
    const resource = await getResourceById(id);

    if (!resource) {
      throw ErrorHandler.createError(
        'INVALID_INPUT',
        'Resource not found',
        404,
      );
    }

    if (!resource.isActive) {
      throw ErrorHandler.createError(
        'INVALID_INPUT',
        'Resource is no longer available',
        410,
      );
    }

    // Check user access permissions
    const userAccessLevel = getUserAccessLevel(userId);
    const hasAccess = checkResourceAccess(resource.accessLevel, userAccessLevel);

    if (!hasAccess.allowed) {
      throw ErrorHandler.createError(
        'INSUFFICIENT_PERMISSIONS',
        hasAccess.reason || 'Insufficient permissions to download this resource',
        403,
        {
          resourceAccessLevel: resource.accessLevel,
          userAccessLevel,
          upgradeRequired: hasAccess.upgradeRequired,
        },
      );
    }

    // For free users, check download limits
    if (userAccessLevel === 'free') {
      const monthlyDownloads = await getUserMonthlyDownloads(userId);
      const FREE_MONTHLY_LIMIT = 5;

      if (monthlyDownloads >= FREE_MONTHLY_LIMIT) {
        throw ErrorHandler.createError(
          'RATE_LIMIT_EXCEEDED',
          'Free tier monthly download limit reached',
          429,
          {
            limit: FREE_MONTHLY_LIMIT,
            used: monthlyDownloads,
            upgradeRequired: true,
          },
        );
      }
    }

    // Log the download
    await logResourceDownload({
      resourceId: id,
      userId,
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress: getClientIP(request),
    });

    // Increment download count
    await incrementDownloadCount(id);

    // Generate secure download URL or serve file directly
    const downloadResponse = await generateDownloadResponse(resource);

    return downloadResponse;
  } catch (error) {
    return createErrorResponse(error);
  }
}

async function getResourceById(id: string) {
  // Mock implementation - replace with actual database query
  const mockResources = [
    {
      id: '1',
      title: 'Cessna 172 Preflight Checklist',
      accessLevel: 'free',
      fileUrl: '/resources/cessna-172-preflight.pdf',
      fileType: 'application/pdf',
      fileSize: 245760,
      isActive: true,
    },
    {
      id: '2',
      title: 'Weather Briefing Quick Reference',
      accessLevel: 'premium',
      fileUrl: '/resources/weather-briefing-reference.pdf',
      fileType: 'application/pdf',
      fileSize: 512000,
      isActive: true,
    },
  ];

  return mockResources.find(r => r.id === id);
}

function getUserAccessLevel(userId: string): 'free' | 'premium' | 'lifetime' {
  // TODO: Implement actual user subscription check
  return 'premium'; // Mock implementation
}

function checkResourceAccess(
  resourceLevel: string,
  userLevel: 'free' | 'premium' | 'lifetime',
): { allowed: boolean; reason?: string; upgradeRequired?: boolean } {
  if (resourceLevel === 'free') {
    return { allowed: true };
  }

  if (resourceLevel === 'premium') {
    if (userLevel === 'free') {
      return {
        allowed: false,
        reason: 'Premium subscription required to download this resource',
        upgradeRequired: true,
      };
    }
    return { allowed: true };
  }

  if (resourceLevel === 'exclusive') {
    if (userLevel !== 'lifetime') {
      return {
        allowed: false,
        reason: 'Lifetime membership required to download this exclusive resource',
        upgradeRequired: true,
      };
    }
    return { allowed: true };
  }

  return { allowed: false, reason: 'Unknown access level' };
}

async function getUserMonthlyDownloads(userId: string): Promise<number> {
  // TODO: Implement actual database query for user's monthly downloads
  return 3; // Mock implementation
}

async function logResourceDownload(download: {
  resourceId: string;
  userId: string;
  userAgent?: string;
  ipAddress?: string;
}) {
  // TODO: Implement actual database logging
}

async function incrementDownloadCount(resourceId: string) {
  // TODO: Implement actual database update
}

async function generateDownloadResponse(resource: any): Promise<Response> {
  // In production, this would either:
  // 1. Generate a signed URL for cloud storage (S3, etc.)
  // 2. Stream the file directly from server storage
  // 3. Redirect to a CDN URL

  // Mock implementation: redirect to static file
  const downloadUrl = resource.fileUrl;

  return NextResponse.json({
    success: true,
    downloadUrl,
    filename: resource.title + getFileExtension(resource.fileType),
    fileSize: resource.fileSize,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
  });
}

function getClientIP(request: NextRequest): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0]?.trim();
  }

  return realIP || undefined;
}

function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt',
    'image/jpeg': '.jpg',
    'image/png': '.png',
  };

  return extensions[mimeType] || '';
}
