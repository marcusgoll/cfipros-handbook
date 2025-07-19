import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function PrinciplesOfFlightUnit(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const lessons = [
    {
      id: 'four-forces',
      title: 'The Four Forces of Flight',
      description: 'Understanding lift, weight, thrust, and drag',
      duration: '20 min',
      completed: false,
    },
    {
      id: 'airfoil-theory',
      title: 'Airfoil Theory and Design',
      description: 'How wing shape affects lift generation',
      duration: '25 min',
      completed: false,
    },
    {
      id: 'angle-of-attack',
      title: 'Angle of Attack',
      description: 'Relationship between AOA and lift coefficient',
      duration: '15 min',
      completed: false,
    },
    {
      id: 'stall-characteristics',
      title: 'Stall Characteristics',
      description: 'Critical angle of attack and stall recovery',
      duration: '30 min',
      completed: false,
    },
    {
      id: 'wing-design',
      title: 'Wing Design Variations',
      description: 'Aspect ratio, wing loading, and planform effects',
      duration: '20 min',
      completed: false,
    },
    {
      id: 'control-surfaces',
      title: 'Flight Control Surfaces',
      description: 'Primary and secondary flight controls',
      duration: '25 min',
      completed: false,
    },
    {
      id: 'stability',
      title: 'Aircraft Stability',
      description: 'Static and dynamic stability concepts',
      duration: '20 min',
      completed: false,
    },
    {
      id: 'performance-factors',
      title: 'Performance Factors',
      description: 'Density altitude, weight, and configuration effects',
      duration: '25 min',
      completed: false,
    },
  ];

  const completedLessons = lessons.filter(lesson => lesson.completed).length;
  const progressPercentage = Math.round((completedLessons / lessons.length) * 100);
  const totalDuration = lessons.reduce((sum, lesson) => {
    const minutes = Number.parseInt(lesson.duration);
    return sum + minutes;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href={`/${locale}/handbook/private-pilot`} className="hover:text-foreground">
              Private Pilot
            </Link>
            <span>›</span>
            <span>Principles of Flight</span>
          </div>
          <h1 className="text-3xl font-bold">Principles of Flight</h1>
          <p className="text-muted-foreground mt-1">
            Master the fundamental aerodynamic concepts that make flight possible
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">
                {progressPercentage}
                %
              </span>
            </div>
            <span className="text-muted-foreground">
              {completedLessons}
              {' '}
              of
              {lessons.length}
              {' '}
              lessons
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Unit Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            Unit Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-sm text-primary">📖</span>
              </div>
              <div>
                <p className="text-sm font-medium">
                  {lessons.length}
                  {' '}
                  Lessons
                </p>
                <p className="text-xs text-muted-foreground">Interactive content</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-sm text-primary">⏱️</span>
              </div>
              <div>
                <p className="text-sm font-medium">
                  {Math.floor(totalDuration / 60)}
                  h
                  {' '}
                  {totalDuration % 60}
                  m
                </p>
                <p className="text-xs text-muted-foreground">Estimated time</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-sm text-primary">✅</span>
              </div>
              <div>
                <p className="text-sm font-medium">
                  {lessons.length}
                  {' '}
                  Activities
                </p>
                <p className="text-xs text-muted-foreground">Practical exercises</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lessons List */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Lessons</h2>
        {lessons.map((lesson, index) => {
          const isLocked = index > 0 && !lessons[index - 1]?.completed;

          return (
            <Card
              key={lesson.id}
              className={`transition-all duration-300 ${
                lesson.completed
                  ? 'bg-primary/5 border-primary/20'
                  : isLocked
                    ? 'opacity-60'
                    : 'hover:shadow-md'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      {lesson.completed
                        ? (
                            <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )
                        : isLocked
                          ? (
                              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            )
                          : (
                              <span className="text-sm font-medium text-muted-foreground">{index + 1}</span>
                            )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium ${lesson.completed ? 'text-primary' : 'text-foreground'}`}>
                          {lesson.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{lesson.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{lesson.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={lesson.completed ? 'outline' : isLocked ? 'ghost' : 'default'}
                      size="sm"
                      disabled={isLocked}
                      asChild={!isLocked}
                    >
                      {isLocked
                        ? (
                            'Locked'
                          )
                        : lesson.completed
                          ? (
                              <Link href={`/${locale}/handbook/private-pilot/principles-of-flight/${lesson.id}`}>
                                Review
                              </Link>
                            )
                          : (
                              <Link href={`/${locale}/handbook/private-pilot/principles-of-flight/${lesson.id}`}>
                                Start
                              </Link>
                            )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="flex-1">
          <Link href={`/${locale}/handbook/private-pilot/principles-of-flight/${lessons[0]?.id || 'four-forces'}`}>
            {completedLessons > 0 ? 'Continue Learning' : 'Start First Lesson'}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/${locale}/handbook/private-pilot`}>
            Back to Private Pilot
          </Link>
        </Button>
      </div>
    </div>
  );
}
