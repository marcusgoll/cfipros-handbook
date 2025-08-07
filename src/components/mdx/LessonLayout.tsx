import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type LessonLayoutProps = {
  children: React.ReactNode;
  metadata: {
    title: string;
    description: string;
    duration: string;
    category: string;
    order: number;
  };
  locale: string;
  categoryTitle: string;
  unitId: string;
  lessonId: string;
  nextLesson?: {
    id: string;
    title: string;
  };
  previousLesson?: {
    id: string;
    title: string;
  };
};

export function LessonLayout({
  children,
  metadata,
  locale,
  categoryTitle,
  unitId,
  lessonId,
  nextLesson,
  previousLesson,
}: LessonLayoutProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/${locale}/handbook/private-pilot`} className="hover:text-foreground">
          Private Pilot
        </Link>
        <span>›</span>
        <Link href={`/${locale}/handbook/private-pilot/${unitId}`} className="hover:text-foreground">
          {categoryTitle}
        </Link>
        <span>›</span>
        <span>{metadata.title}</span>
      </div>

      {/* Lesson Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{metadata.title}</h1>
            <p className="text-muted-foreground mt-1">
              {metadata.description}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              Duration:
              {metadata.duration}
            </span>
          </div>
        </div>
      </div>

      {/* MDX Content */}
      <div className="prose prose-slate max-w-none">
        <Card>
          <CardContent className="p-8">
            {children}
          </CardContent>
        </Card>
      </div>

      {/* Navigation and Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
        {previousLesson
          ? (
              <Button asChild variant="outline">
                <Link href={`/${locale}/handbook/private-pilot/${unitId}/${previousLesson.id}`}>
                  ←
                  {' '}
                  {previousLesson.title}
                </Link>
              </Button>
            )
          : (
              <Button asChild variant="outline">
                <Link href={`/${locale}/handbook/private-pilot/${unitId}`}>
                  ← Back to Unit
                </Link>
              </Button>
            )}

        <div className="flex-1" />

        {nextLesson && (
          <Button asChild>
            <Link href={`/${locale}/handbook/private-pilot/${unitId}/${nextLesson.id}`}>
              {nextLesson.title}
              {' '}
              →
            </Link>
          </Button>
        )}
      </div>

      {/* Progress Footer */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-primary font-medium">Lesson Progress</span>
            {nextLesson && (
              <span className="text-muted-foreground">
                Next:
                {nextLesson.title}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
