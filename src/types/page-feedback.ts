export type PageFeedbackData = {
  id?: string;
  pageId: string;
  userId?: string;
  sessionId?: string;
  feedbackType: 'positive' | 'negative' | 'detailed';
  helpful?: boolean;
  emoji?: 'confused' | 'ready' | 'perfect' | 'needs-work';
  comment?: string;
  difficulty?: 'too-easy' | 'just-right' | 'too-hard';
  completionTime?: number;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type PageFeedbackSubmission = {
  pageId: string;
  feedbackType: PageFeedbackData['feedbackType'];
  helpful?: boolean;
  emoji?: PageFeedbackData['emoji'];
  comment?: string;
  difficulty?: PageFeedbackData['difficulty'];
  completionTime?: number;
};

export type PageFeedbackAnalytics = {
  pageId: string;
  totalFeedback: number;
  positiveCount: number;
  negativeCount: number;
  helpfulPercentage: number;
  averageCompletionTime?: number;
  commonEmojis: Array<{
    emoji: string;
    count: number;
    percentage: number;
  }>;
  difficultyDistribution: {
    tooEasy: number;
    justRight: number;
    tooHard: number;
  };
  recentComments: Array<{
    comment: string;
    emoji?: string;
    difficulty?: string;
    createdAt: Date;
  }>;
};
