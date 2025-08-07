import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { LeftSidebarLayout } from '@/components/layouts/LeftSidebarLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Sidebar Component
const PrivatePilotSidebar = ({ locale, studyUnits }: { locale: string; studyUnits: any[] }) => (
  <div>
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2 text-foreground">Private Pilot</h3>
      <p className="text-sm text-muted-foreground">
        Study units for your Private Pilot Certificate
      </p>
    </div>

    <nav className="space-y-1">
      <Link
        href={`/${locale}/handbook/private-pilot`}
        className="block px-3 py-2 rounded-md text-sm bg-chart-1/10 text-chart-1 border border-chart-1/20"
      >
        📚 Overview
      </Link>

      {studyUnits.map((unit, index) => {
        const isLocked = index > 0 && studyUnits[index - 1]?.completed === 0;

        if (isLocked) {
          return (
            <div
              key={unit.id}
              className="block px-3 py-2 rounded-md text-sm text-muted-foreground/50 cursor-not-allowed opacity-60"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span>{unit.icon}</span>
                  <span className="truncate">{unit.title}</span>
                </span>
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          );
        }

        return (
          <Link
            key={unit.id}
            href={`/${locale}/handbook/private-pilot/${unit.id}`}
            className="block px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>{unit.icon}</span>
                <span className="truncate">{unit.title}</span>
              </span>
            </div>
            {unit.completed > 0 && (
              <div className="mt-1 w-full bg-muted rounded-full h-1">
                <div
                  className="bg-chart-1 h-1 rounded-full"
                  style={{ width: `${(unit.completed / unit.lessons) * 100}%` }}
                />
              </div>
            )}
          </Link>
        );
      })}
    </nav>

    <div className="mt-8 p-4 bg-chart-1/10 border border-chart-1/20 rounded-lg">
      <h4 className="text-sm font-medium mb-2 text-chart-1">Study Progress</h4>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Units Completed</span>
          <span className="font-medium">
            0 /
            {studyUnits.length}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Total Lessons</span>
          <span className="font-medium">{studyUnits.reduce((sum, unit) => sum + unit.lessons, 0)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Est. Time</span>
          <span className="font-medium">25 hours</span>
        </div>
      </div>
    </div>

    <div className="mt-6">
      <h4 className="text-sm font-medium mb-3 text-foreground">Quick Links</h4>
      <div className="space-y-2">
        <button type="button" className="w-full text-left flex items-center text-xs text-muted-foreground hover:text-foreground">
          <svg className="h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Study Guide
        </button>
        <button type="button" className="w-full text-left flex items-center text-xs text-muted-foreground hover:text-foreground">
          <svg className="h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Practice Tests
        </button>
        <button type="button" className="w-full text-left flex items-center text-xs text-muted-foreground hover:text-foreground">
          <svg className="h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          FAA Resources
        </button>
      </div>
    </div>
  </div>
);

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

  // Main Content Component
  const MainContent = () => (
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
            <div className="w-8 h-8 rounded-full bg-chart-1/20 flex items-center justify-center">
              <span className="text-xs font-medium text-chart-1">
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
          className="bg-chart-1 h-2 rounded-full transition-all duration-300"
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
                        className="bg-chart-1 h-1.5 rounded-full transition-all duration-300"
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
              <div className="w-8 h-8 bg-chart-1/20 rounded-full flex items-center justify-center">
                <span className="text-sm text-chart-1">📚</span>
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
              <div className="w-8 h-8 bg-chart-1/20 rounded-full flex items-center justify-center">
                <span className="text-sm text-chart-1">📖</span>
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
              <div className="w-8 h-8 bg-chart-1/20 rounded-full flex items-center justify-center">
                <span className="text-sm text-chart-1">⏱️</span>
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

  return (
    <LeftSidebarLayout
      locale={locale}
      sidebar={<PrivatePilotSidebar locale={locale} studyUnits={studyUnits} />}
      sidebarWidth="md"
    >
      <MainContent />
    </LeftSidebarLayout>
  );
}
