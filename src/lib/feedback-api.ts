import type { PageFeedbackSubmission } from '@/types/page-feedback';

export async function submitPageFeedback(feedback: PageFeedbackSubmission): Promise<{
  success: boolean;
  feedbackId?: string;
  error?: string;
}> {
  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedback),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit feedback');
    }

    return {
      success: true,
      feedbackId: data.feedbackId,
    };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getPageFeedbackStats(pageId: string): Promise<{
  success: boolean;
  stats?: {
    totalFeedback: number;
    positiveCount: number;
    negativeCount: number;
    helpfulPercentage: number;
  };
  error?: string;
}> {
  try {
    const response = await fetch(`/api/feedback?pageId=${encodeURIComponent(pageId)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch feedback stats');
    }

    return {
      success: true,
      stats: {
        totalFeedback: data.totalFeedback,
        positiveCount: data.positiveCount,
        negativeCount: data.negativeCount,
        helpfulPercentage: data.helpfulPercentage,
      },
    };
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
