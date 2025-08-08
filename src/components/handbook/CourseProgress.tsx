'use client';

import Link from 'next/link';
import { CircularProgress, LessonProgressRing } from '@/components/mdx/ProgressIndicator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLessonProgress, useSectionProgress } from '@/lib/progress-tracking';

type CourseSection = {
  id: string;
  title: string;
  description: string;
  lessons: Array<{
    id: string;
    title: string;
    duration: string;
    order: number;
  }>;
  estimatedHours: string;
  order: number;
};

type CourseProgressProps = {
  courseId: string;
  title: string;
  sections: CourseSection[];
  locale?: string;
};

export function CourseProgress({ courseId, title, sections, locale = 'en' }: CourseProgressProps) {
  // Calculate overall course progress
  const totalLessons = sections.reduce((acc, section) => acc + section.lessons.length, 0);
  const completedLessons = 0; // Would calculate from progress manager
  const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Course Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">{title}</CardTitle>
              <p className="text-muted-foreground mt-1">
                {sections.length}
                {' '}
                sections •
                {totalLessons}
                {' '}
                lessons
              </p>
            </div>
            <div className="flex items-center gap-4">
              <CircularProgress
                percentage={overallProgress}
                size={80}
                strokeWidth={6}
                variant={overallProgress === 100 ? 'success' : 'default'}
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Course Progress</span>
              <span>
                {Math.round(overallProgress)}
                % Complete
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/30">
                <span className="text-blue-600 text-xl">📖</span>
              </div>
              <div>
                <h3 className="font-semibold">Continue Learning</h3>
                <p className="text-sm text-muted-foreground">Pick up where you left off</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/30">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div>
                <h3 className="font-semibold">Review</h3>
                <p className="text-sm text-muted-foreground">Strengthen your knowledge</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900/30">
                <span className="text-purple-600 text-xl">🎯</span>
              </div>
              <div>
                <h3 className="font-semibold">Practice Test</h3>
                <p className="text-sm text-muted-foreground">Test your knowledge</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Course Content</h2>

        {sections
          .sort((a, b) => a.order - b.order)
          .map(section => (
            <SectionCard
              key={section.id}
              section={section}
              courseId={courseId}
              locale={locale}
            />
          ))}
      </div>
    </div>
  );
}

function SectionCard({
  section,
  courseId,
  locale,
}: {
  section: CourseSection;
  courseId: string;
  locale: string;
}) {
  const lessonIds = section.lessons.map(lesson => lesson.id);
  const { progress } = useSectionProgress(section.id, lessonIds);

  const isExpanded = false; // Would be managed by state

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LessonProgressRing
              completed={progress.lessonsCompleted}
              total={progress.lessonsTotal}
              size={32}
            />
            <div>
              <CardTitle className="text-lg">{section.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {section.description}
                {' '}
                •
                {section.estimatedHours}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="secondary">
              {progress.lessonsCompleted}
              /
              {progress.lessonsTotal}
              {' '}
              lessons
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="p-1"
              onClick={() => { /* Toggle expand */ }}
            >
              {isExpanded ? '−' : '+'}
            </Button>
          </div>
        </div>

        {/* Section Progress Bar */}
        <div className="mt-3">
          <Progress value={progress.completionPercentage} className="h-1.5" />
        </div>
      </CardHeader>

      {/* Expandable Lesson List */}
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {section.lessons
              .sort((a, b) => a.order - b.order)
              .map(lesson => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  sectionId={section.id}
                  courseId={courseId}
                  locale={locale}
                />
              ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function LessonItem({
  lesson,
  sectionId,
  courseId,
  locale,
}: {
  lesson: { id: string; title: string; duration: string };
  sectionId: string;
  courseId: string;
  locale: string;
}) {
  const { progress } = useLessonProgress(lesson.id);

  const statusIcons = {
    not_started: '⚪',
    in_progress: '🔵',
    completed: '✅',
  };

  const statusColors = {
    not_started: 'text-gray-400',
    in_progress: 'text-blue-600',
    completed: 'text-green-600',
  };

  const status = progress?.status || 'not_started';

  return (
    <Link
      href={`/${locale}/handbook/${courseId}/${sectionId}/${lesson.id}`}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      <span className={`text-lg ${statusColors[status]}`}>
        {statusIcons[status]}
      </span>

      <div className="flex-1">
        <h4 className={`font-medium group-hover:text-primary transition-colors ${
          status === 'completed' ? 'text-muted-foreground' : ''
        }`}
        >
          {lesson.title}
        </h4>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{lesson.duration}</span>
          {progress?.bookmarked && (
            <Badge variant="outline" className="text-xs">
              📑 Bookmarked
            </Badge>
          )}
        </div>
      </div>

      {status === 'in_progress' && (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Continue
        </Badge>
      )}
    </Link>
  );
}
