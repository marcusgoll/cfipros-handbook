import { auth, clerkClient } from '@clerk/nextjs/server';
import { ErrorHandler } from '@/lib/error-handling';

/**
 * Authentication and authorization utilities for API routes
 */

export type AuthenticatedUser = {
  userId: string;
  user: any;
  isAdmin: boolean;
};

/**
 * Requires user authentication
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const { userId } = await auth();

  if (!userId) {
    throw ErrorHandler.createError(
      'UNAUTHORIZED',
      'Authentication required',
      401,
    );
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const isAdmin = user.publicMetadata?.role === 'admin';

  return {
    userId,
    user,
    isAdmin,
  };
}

/**
 * Requires admin privileges
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const authData = await requireAuth();

  if (!authData.isAdmin) {
    throw ErrorHandler.createError(
      'INSUFFICIENT_PERMISSIONS',
      'Admin privileges required',
      403,
    );
  }

  return authData;
}

/**
 * Optional authentication - returns user data if authenticated, null otherwise
 */
export async function optionalAuth(): Promise<AuthenticatedUser | null> {
  try {
    return await requireAuth();
  } catch (error) {
    return null;
  }
}

/**
 * Rate limiting check (placeholder for future implementation)
 */
export async function checkRateLimit(userId: string, action: string): Promise<void> {
  // TODO: Implement rate limiting logic
  // For now, this is a placeholder
}

/**
 * Input validation helper
 */
export function validateRequiredFields(data: Record<string, any>, fields: string[]): void {
  const missing = fields.filter(field => !data[field]);

  if (missing.length > 0) {
    throw ErrorHandler.createError(
      'INVALID_INPUT',
      `Missing required fields: ${missing.join(', ')}`,
      400,
    );
  }
}
