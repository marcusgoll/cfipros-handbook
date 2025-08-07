import type { NextRequest } from 'next/server';
import type { PageFeedbackSubmission } from '@/types/page-feedback';
import { auth } from '@clerk/nextjs/server';
import { desc, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';
import { requireAdmin, validateRequiredFields } from '@/lib/auth-utils';
import { createErrorResponse, ErrorHandler } from '@/lib/error-handling';
import { db, ensureMigrated } from '@/libs/DB';
import { pageFeedbackSchema } from '@/models/Schema';

export async function POST(request: NextRequest) {
  try {
    await ensureMigrated();

    const { userId, sessionId } = await auth();
    const body: PageFeedbackSubmission = await request.json();

    // Validate required fields
    validateRequiredFields(body, ['pageId', 'feedbackType']);

    // Generate session ID if user is not authenticated
    const effectiveSessionId = userId || sessionId || nanoid();

    // Get request metadata
    const userAgent = request.headers.get('user-agent') || undefined;
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : request.headers.get('x-real-ip')
        || undefined;
    const referrer = request.headers.get('referer') || undefined;

    // Insert feedback into database
    const feedbackData = {
      pageId: body.pageId,
      userId: userId || undefined,
      sessionId: effectiveSessionId,
      feedbackType: body.feedbackType,
      helpful: body.helpful !== undefined ? (body.helpful ? 1 : 0) : undefined,
      emoji: body.emoji || undefined,
      comment: body.comment?.trim() || undefined,
      difficulty: body.difficulty || undefined,
      completionTime: body.completionTime || undefined,
      userAgent,
      ipAddress,
      referrer,
    };

    const [result] = await db
      .insert(pageFeedbackSchema)
      .values(feedbackData)
      .returning({ id: pageFeedbackSchema.id });

    return NextResponse.json({
      success: true,
      feedbackId: result.id,
      message: 'Feedback submitted successfully',
    }, { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureMigrated();

    // Require admin authentication
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');

    if (!pageId) {
      throw ErrorHandler.createError(
        'INVALID_INPUT',
        'Missing required parameter: pageId',
        400,
      );
    }

    // Get feedback summary for the page
    const feedback = await db
      .select()
      .from(pageFeedbackSchema)
      .where(eq(pageFeedbackSchema.pageId, pageId))
      .orderBy(desc(pageFeedbackSchema.createdAt))
      .limit(100);

    const totalFeedback = feedback.length;
    const positiveCount = feedback.filter(f => f.feedbackType === 'positive' || f.helpful === 1).length;
    const negativeCount = feedback.filter(f => f.feedbackType === 'negative' || f.helpful === 0).length;
    const helpfulPercentage = totalFeedback > 0 ? Math.round((positiveCount / totalFeedback) * 100) : 0;

    return NextResponse.json({
      pageId,
      totalFeedback,
      positiveCount,
      negativeCount,
      helpfulPercentage,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
