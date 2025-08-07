import * as Sentry from '@sentry/nextjs';

// Aviation-specific business metrics for the CFI Handbook
export type AviationMetrics = {
  lessons: {
    totalViews: number;
    completionRate: number;
    avgTimePerLesson: number;
    popularLessons: Array<{
      id: string;
      title: string;
      views: number;
      completions: number;
    }>;
  };
  users: {
    activeStudents: number;
    activeCFIs: number;
    avgSessionDuration: number;
    retentionRate: number;
  };
  content: {
    totalLessons: number;
    recentlyUpdated: number;
    feedbackScore: number;
    reportedIssues: number;
  };
  performance: {
    avgLoadTime: number;
    searchAccuracy: number;
    mobileUsage: number;
    accessibilityScore: number;
  };
};

// Track aviation-specific events
export class AviationEventTracker {
  // Track lesson interactions
  static trackLessonStart(lessonId: string, userId?: string, metadata?: Record<string, any>) {
    Sentry.addBreadcrumb({
      category: 'lesson.interaction',
      message: 'Lesson started',
      level: 'info',
      data: {
        lesson_id: lessonId,
        user_id: userId,
        ...metadata,
      },
    });

    Sentry.withScope((scope) => {
      scope.setTag('lesson_id', lessonId);
      scope.setTag('lesson_category', this.getLessonCategory(lessonId));
      // Disabled: scope.setMeasurement('lesson_started', 1);
    });
  }

  static trackLessonCompletion(
    lessonId: string,
    userId?: string,
    completionTime?: number,
    score?: number,
  ) {
    Sentry.addBreadcrumb({
      category: 'lesson.interaction',
      message: 'Lesson completed',
      level: 'info',
      data: {
        lesson_id: lessonId,
        user_id: userId,
        completion_time: completionTime,
        score,
      },
    });

    Sentry.withScope((scope) => {
      scope.setTag('lesson_id', lessonId);
      scope.setTag('lesson_category', this.getLessonCategory(lessonId));
      scope.setTag('score_range', score ? this.getScoreRange(score) : 'unknown');
      // Disabled: scope.setMeasurement('lesson_completed', 1);

      if (completionTime) {
        // Disabled: scope.setMeasurement('completion_time_seconds', completionTime);
      }
    });
  }

  static trackLessonProgress(lessonId: string, progress: number, userId?: string) {
    // Only track significant progress milestones
    const milestones = [25, 50, 75, 90];
    const milestone = milestones.find(m => progress >= m && progress < m + 5);

    if (milestone) {
      Sentry.withScope((scope) => {
        scope.setTag('lesson_id', lessonId);
        scope.setTag('milestone', milestone.toString());
        scope.setTag('lesson_category', this.getLessonCategory(lessonId));
        // Disabled: scope.setMeasurement('progress_milestone', 1);
      });
    }
  }

  // Track search and navigation
  static trackSearch(query: string, resultCount: number, responseTime: number, userId?: string) {
    Sentry.addBreadcrumb({
      category: 'search.query',
      message: 'Search performed',
      level: 'info',
      data: {
        query_length: query.length,
        result_count: resultCount,
        response_time: responseTime,
        has_results: resultCount > 0,
      },
    });

    Sentry.withScope((scope) => {
      scope.setTag('has_results', resultCount > 0 ? 'true' : 'false');
      scope.setTag('query_type', this.getQueryType(query));
      // Disabled: scope.setMeasurement('search_query', 1);
      // Disabled: scope.setMeasurement('search_response_time_ms', responseTime);
    });
  }

  static trackNavigationPath(fromPage: string, toPage: string, userId?: string) {
    Sentry.addBreadcrumb({
      category: 'navigation.path',
      message: 'Page navigation',
      level: 'info',
      data: {
        from_page: fromPage,
        to_page: toPage,
      },
    });

    Sentry.withScope((scope) => {
      scope.setTag('from_section', this.getPageSection(fromPage));
      scope.setTag('to_section', this.getPageSection(toPage));
      // Disabled: scope.setMeasurement('navigation_transition', 1);
    });
  }

  // Track user feedback and issues
  static trackUserFeedback(
    type: 'positive' | 'negative' | 'suggestion',
    rating?: number,
    lessonId?: string,
    comment?: string,
  ) {
    Sentry.addBreadcrumb({
      category: 'user.feedback',
      message: `User feedback: ${type}`,
      level: type === 'negative' ? 'warning' : 'info',
      data: {
        feedback_type: type,
        rating,
        lesson_id: lessonId,
        has_comment: !!comment,
      },
    });

    Sentry.withScope((scope) => {
      scope.setTag('feedback_type', type);
      scope.setTag('rating_range', rating ? this.getRatingRange(rating) : 'unknown');
      scope.setTag('has_comment', comment ? 'true' : 'false');
      // Disabled: scope.setMeasurement('feedback_submitted', 1);
    });

    // Report negative feedback as potential issues
    if (type === 'negative') {
      Sentry.captureMessage('Negative user feedback received', {
        level: 'warning',
        tags: {
          feature: 'user-feedback',
          feedback_type: type,
        },
        contexts: {
          feedback: {
            type,
            rating,
            lesson_id: lessonId,
            comment: comment?.substring(0, 500),
          },
        },
      });
    }
  }

  static trackContentIssue(
    issueType: 'incorrect_info' | 'broken_link' | 'formatting' | 'accessibility' | 'other',
    lessonId?: string,
    description?: string,
  ) {
    Sentry.captureMessage('Content issue reported', {
      level: 'warning',
      tags: {
        feature: 'content-quality',
        issue_type: issueType,
      },
      contexts: {
        content_issue: {
          type: issueType,
          lesson_id: lessonId,
          description: description?.substring(0, 500),
          timestamp: new Date().toISOString(),
        },
      },
    });

    Sentry.withScope((scope) => {
      scope.setTag('issue_type', issueType);
      scope.setTag('lesson_category', lessonId ? this.getLessonCategory(lessonId) : 'unknown');
      // Disabled: scope.setMeasurement('content_issue_reported', 1);
    });
  }

  // Track certification and achievement progress
  static trackCertificationProgress(
    certificationType: 'private_pilot' | 'instrument' | 'commercial' | 'cfi',
    progress: number,
    userId?: string,
  ) {
    Sentry.withScope((scope) => {
      scope.setTag('certification_type', certificationType);
      scope.setTag('progress_range', this.getProgressRange(progress));
      // Disabled: scope.setMeasurement('certification_progress_percent', progress);
    });

    // Track milestone achievements
    const milestones = [25, 50, 75, 90, 100];
    const achievedMilestone = milestones.find(m => progress >= m && progress < m + 1);

    if (achievedMilestone) {
      Sentry.withScope((scope) => {
        scope.setTag('certification_type', certificationType);
        scope.setTag('milestone', achievedMilestone.toString());
        // Disabled: scope.setMeasurement('certification_milestone', 1);
      });
    }
  }

  // Utility methods for categorization
  private static getLessonCategory(lessonId: string): string {
    if (lessonId.includes('principles-of-flight')) {
      return 'aerodynamics';
    }
    if (lessonId.includes('aircraft-systems')) {
      return 'systems';
    }
    if (lessonId.includes('regulations')) {
      return 'regulations';
    }
    if (lessonId.includes('procedures')) {
      return 'procedures';
    }
    if (lessonId.includes('weather')) {
      return 'weather';
    }
    if (lessonId.includes('navigation')) {
      return 'navigation';
    }
    return 'general';
  }

  private static getScoreRange(score: number): string {
    if (score >= 90) {
      return '90-100';
    }
    if (score >= 80) {
      return '80-89';
    }
    if (score >= 70) {
      return '70-79';
    }
    if (score >= 60) {
      return '60-69';
    }
    return 'below-60';
  }

  private static getRatingRange(rating: number): string {
    if (rating >= 4.5) {
      return '4.5-5';
    }
    if (rating >= 4) {
      return '4-4.4';
    }
    if (rating >= 3) {
      return '3-3.9';
    }
    if (rating >= 2) {
      return '2-2.9';
    }
    return '1-1.9';
  }

  private static getProgressRange(progress: number): string {
    if (progress >= 90) {
      return '90-100';
    }
    if (progress >= 75) {
      return '75-89';
    }
    if (progress >= 50) {
      return '50-74';
    }
    if (progress >= 25) {
      return '25-49';
    }
    return '0-24';
  }

  private static getQueryType(query: string): string {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('weather') || lowerQuery.includes('metar') || lowerQuery.includes('taf')) {
      return 'weather';
    }
    if (lowerQuery.includes('regulation') || lowerQuery.includes('far') || lowerQuery.includes('part')) {
      return 'regulations';
    }
    if (lowerQuery.includes('aircraft') || lowerQuery.includes('system') || lowerQuery.includes('engine')) {
      return 'systems';
    }
    if (lowerQuery.includes('flight') || lowerQuery.includes('procedure') || lowerQuery.includes('checklist')) {
      return 'procedures';
    }
    if (lowerQuery.includes('navigation') || lowerQuery.includes('gps') || lowerQuery.includes('vor')) {
      return 'navigation';
    }

    return 'general';
  }

  private static getPageSection(page: string): string {
    if (page.includes('/handbook/')) {
      return 'handbook';
    }
    if (page.includes('/dashboard/')) {
      return 'dashboard';
    }
    if (page.includes('/search/')) {
      return 'search';
    }
    if (page.includes('/profile/')) {
      return 'profile';
    }
    return 'other';
  }
}

// Aviation business intelligence
export class AviationBusinessIntelligence {
  // Calculate lesson effectiveness metrics
  static calculateLessonEffectiveness(lessonId: string): Promise<{
    completionRate: number;
    avgScore: number;
    timeToCompletion: number;
    userSatisfaction: number;
    issueCount: number;
  }> {
    // In production, this would query your analytics database
    return Promise.resolve({
      completionRate: 0.85,
      avgScore: 87.3,
      timeToCompletion: 1200, // seconds
      userSatisfaction: 4.2,
      issueCount: 2,
    });
  }

  // Identify trending topics and search patterns
  static identifyTrendingTopics(): Promise<Array<{
    topic: string;
    searchVolume: number;
    growthRate: number;
    avgRating: number;
  }>> {
    // In production, this would analyze search and engagement data
    return Promise.resolve([
      { topic: 'weather patterns', searchVolume: 156, growthRate: 0.23, avgRating: 4.1 },
      { topic: 'aircraft systems', searchVolume: 134, growthRate: 0.18, avgRating: 4.3 },
      { topic: 'flight procedures', searchVolume: 112, growthRate: 0.15, avgRating: 4.0 },
    ]);
  }

  // Generate content recommendations
  static generateContentRecommendations(): Promise<Array<{
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
    reasoning: string;
    estimatedImpact: number;
  }>> {
    return Promise.resolve([
      {
        recommendation: 'Create more interactive weather interpretation exercises',
        priority: 'high',
        reasoning: 'High search volume for weather topics with lower completion rates',
        estimatedImpact: 0.15,
      },
      {
        recommendation: 'Add video explanations to complex aircraft systems lessons',
        priority: 'medium',
        reasoning: 'Users spend 40% more time on lessons with visual aids',
        estimatedImpact: 0.12,
      },
    ]);
  }
}

// Initialize aviation metrics collection
export function initializeAviationMetrics() {
  // Report initial metrics
  Sentry.addBreadcrumb({
    category: 'system.startup',
    message: 'Aviation metrics system initialized',
    level: 'info',
    data: {
      timestamp: Date.now(),
      version: '1.0.0',
    },
  });

  // Set up periodic business intelligence reporting
  if (typeof setInterval !== 'undefined') {
    setInterval(async () => {
      try {
        const trendingTopics = await AviationBusinessIntelligence.identifyTrendingTopics();

        trendingTopics.forEach((topic) => {
          Sentry.withScope((scope) => {
            scope.setTag('topic', topic.topic.replace(/\s+/g, '_'));
            scope.setTag('growth_trend', topic.growthRate > 0.1 ? 'growing' : 'stable');
            // Disabled: scope.setMeasurement('topic_popularity', topic.searchVolume);
          });
        });
      } catch (error) {
        Sentry.captureException(error, {
          tags: { feature: 'aviation-metrics', task: 'business-intelligence' },
        });
      }
    }, 3600000); // Every hour
  }
}
