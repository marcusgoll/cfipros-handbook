import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function PrivatePilotHandbook(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const studyUnits = [
    {
      id: 'principles-of-flight',
      title: 'Principles of Flight',
      description: 'Basic aerodynamics, lift, drag, thrust, and weight',
      lessons: 8,
      duration: '2.5 hours',
      completed: 0,
      icon: '✈️',
    },
    {
      id: 'aircraft-systems',
      title: 'Aircraft Systems',
      description: 'Engine, electrical, hydraulic, and avionics systems',
      lessons: 12,
      duration: '4 hours',
      completed: 0,
      icon: '⚙️',
    },
    {
      id: 'regulations',
      title: 'Federal Aviation Regulations',
      description: 'Part 61, 91, and NTSB 830 requirements',
      lessons: 15,
      duration: '5 hours',
      completed: 0,
      icon: '📋',
    },
    {
      id: 'weather',
      title: 'Weather Systems',
      description: 'Meteorology, weather reports, and forecasting',
      lessons: 10,
      duration: '3.5 hours',
      completed: 0,
      icon: '🌤️',
    },
    {
      id: 'navigation',
      title: 'Navigation',
      description: 'Dead reckoning, pilotage, and radio navigation',
      lessons: 9,
      duration: '3 hours',
      completed: 0,
      icon: '🧭',
    },
    {
      id: 'airspace',
      title: 'Airspace',
      description: 'Class A through G airspace and special use areas',
      lessons: 7,
      duration: '2 hours',
      completed: 0,
      icon: '🏗️',
    },
    {
      id: 'performance',
      title: 'Aircraft Performance',
      description: 'Weight & balance, performance charts, and limitations',
      lessons: 6,
      duration: '2 hours',
      completed: 0,
      icon: '📊',
    },
    {
      id: 'flight-operations',
      title: 'Flight Operations',
      description: 'Airport operations, radio communications, and emergencies',
      lessons: 11,
      duration: '3.5 hours',
      completed: 0,
      icon: '🎯',
    },
  ];

  const totalLessons = studyUnits.reduce((sum, unit) => sum + unit.lessons, 0);
  const completedLessons = studyUnits.reduce((sum, unit) => sum + unit.completed, 0);
  const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Private Pilot Handbook</h1>
          <p className="text-muted-foreground mt-1">
            Master the knowledge areas required for your Private Pilot Certificate
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
              {totalLessons}
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

      {/* Study Units Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {studyUnits.map((unit, index) => {
          const isLocked = index > 0 && studyUnits[index - 1]?.completed === 0;

          return (
            <Card
              key={unit.id}
              className={`overflow-hidden transition-all duration-300 ${
                isLocked
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:shadow-lg cursor-pointer group'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{unit.icon}</span>
                  {isLocked && (
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </div>
                <CardTitle className="text-lg">{unit.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{unit.description}</p>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {unit.lessons}
                      {' '}
                      lessons
                    </span>
                    <span>{unit.duration}</span>
                  </div>

                  {unit.completed > 0 && (
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${(unit.completed / unit.lessons) * 100}%` }}
                      />
                    </div>
                  )}

                  <Button
                    variant={isLocked ? 'ghost' : 'default'}
                    className="w-full"
                    disabled={isLocked}
                    asChild={!isLocked}
                  >
                    {isLocked
                      ? (
                          'Locked'
                        )
                      : (
                          <Link href={`/${locale}/handbook/private-pilot/${unit.id}`}>
                            {unit.completed > 0 ? 'Continue' : 'Start'}
                          </Link>
                        )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-sm text-primary">📚</span>
              </div>
              <div>
                <p className="text-sm font-medium">Total Study Units</p>
                <p className="text-2xl font-bold">{studyUnits.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-sm text-primary">📖</span>
              </div>
              <div>
                <p className="text-sm font-medium">Total Lessons</p>
                <p className="text-2xl font-bold">{totalLessons}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-sm text-primary">⏱️</span>
              </div>
              <div>
                <p className="text-sm font-medium">Study Time</p>
                <p className="text-2xl font-bold">25h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
