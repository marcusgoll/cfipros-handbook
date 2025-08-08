'use client';

import type { StudyRecommendation } from '@/types/progress';
import Link from 'next/link';
import { CircularProgress } from '@/components/mdx/ProgressIndicator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  generateStudyRecommendations,
  getLessonProgressManager,
  getSectionProgressManager,
} from '@/lib/progress-tracking';

type StudyDashboardProps = {
  locale?: string;
};

export function StudyDashboard({ locale = 'en' }: StudyDashboardProps) {
  const lessonManager = getLessonProgressManager();
  const sectionManager = getSectionProgressManager();

  const allProgress = lessonManager.getAllProgress();
  const bookmarkedLessons = lessonManager.getBookmarkedLessons();
  const inProgressLessons = lessonManager.getInProgressLessons();
  const completedLessons = lessonManager.getCompletedLessons();
  const recommendations = generateStudyRecommendations(lessonManager, sectionManager);

  // Calculate statistics
  const totalLessons = 50; // Would be calculated from course structure
  const completionRate = totalLessons > 0 ? (completedLessons.length / totalLessons) * 100 : 0;
  const currentStreak = 3; // Would be calculated from actual data
  const totalTimeSpent = allProgress.reduce((acc, lesson) => acc + (lesson.timeSpent || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
              <p className="text-muted-foreground">
                Ready to continue your Private Pilot journey?
              </p>
            </div>
            <CircularProgress
              percentage={completionRate}
              size={80}
              strokeWidth={6}
              variant={completionRate > 75 ? 'success' : 'default'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Completed"
          value={completedLessons.length}
          subtitle="lessons"
          icon="✅"
          color="green"
        />
        <StatCard
          title="In Progress"
          value={inProgressLessons.length}
          subtitle="lessons"
          icon="🔵"
          color="blue"
        />
        <StatCard
          title="Study Streak"
          value={currentStreak}
          subtitle="days"
          icon="🔥"
          color="orange"
        />
        <StatCard
          title="Time Spent"
          value={Math.round(totalTimeSpent / 60)}
          subtitle="hours"
          icon="⏱️"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Study Recommendations */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-blue-600">💡</span>
                Recommended for You
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations.length > 0
                ? (
                    recommendations.map(rec => (
                      <RecommendationCard key={rec.lessonId} recommendation={rec} locale={locale} />
                    ))
                  )
                : (
                    <div className="text-center py-8 text-muted-foreground">
                      <span className="text-4xl mb-4 block">🎉</span>
                      <p className="font-medium">All caught up!</p>
                      <p className="text-sm">Check back later for new recommendations</p>
                    </div>
                  )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Bookmarked Lessons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="text-amber-600">📑</span>
                Bookmarked
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookmarkedLessons.length > 0
                ? (
                    <div className="space-y-2">
                      {bookmarkedLessons.slice(0, 3).map(lesson => (
                        <div key={lesson.lessonId} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0"></div>
                          <Link
                            href={`/${locale}/handbook/lesson/${lesson.lessonId}`}
                            className="text-sm hover:text-primary truncate"
                          >
                            {lesson.lessonId}
                          </Link>
                        </div>
                      ))}
                      {bookmarkedLessons.length > 3 && (
                        <Button variant="ghost" size="sm" className="w-full mt-2">
                          View All (
                          {bookmarkedLessons.length}
                          )
                        </Button>
                      )}
                    </div>
                  )
                : (
                    <p className="text-sm text-muted-foreground">
                      No bookmarked lessons yet
                    </p>
                  )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="text-green-600">⚡</span>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/${locale}/handbook/search`}>
                  🔍 Search Lessons
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/${locale}/handbook/practice`}>
                  🎯 Practice Questions
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/${locale}/handbook/progress`}>
                  📊 View Progress
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
  color: 'green' | 'blue' | 'orange' | 'purple';
}) {
  const colorClasses = {
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30',
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <span className="text-lg">{icon}</span>
          </div>
          <div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm text-muted-foreground">
              {title}
              {' '}
              {subtitle}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecommendationCard({
  recommendation,
  locale,
}: {
  recommendation: StudyRecommendation;
  locale: string;
}) {
  const typeIcons = {
    continue: '▶️',
    review: '🔄',
    practice: '🎯',
    next: '➡️',
  };

  const typeColors = {
    continue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30',
    review: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30',
    practice: 'bg-green-100 text-green-800 dark:bg-green-900/30',
    next: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30',
  };

  return (
    <Link
      href={`/${locale}/handbook/lesson/${recommendation.lessonId}`}
      className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{typeIcons[recommendation.type]}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium group-hover:text-primary transition-colors">
              {recommendation.title}
            </h4>
            <Badge variant="secondary" className={typeColors[recommendation.type]}>
              {recommendation.type}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {recommendation.reason}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              ⏱️
              {recommendation.estimatedTime}
              {' '}
              min
            </span>
            <span>•</span>
            <span>{recommendation.category}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
