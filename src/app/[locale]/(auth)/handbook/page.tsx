import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FullWidthLayout } from '@/components/layouts/FullWidthLayout';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Handbook',
  });

  return {
    title: t('meta_title'),
  };
}

// SVG Icons for each handbook type
const PrivatePilotIcon = () => (
  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const CommercialPilotIcon = () => (
  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const InstrumentPilotIcon = () => (
  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const ATPIcon = () => (
  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68z" />
  </svg>
);

const FlightInstructorIcon = () => (
  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export default async function HandbookPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  const handbooks = [
    {
      id: 'private-pilot',
      title: 'Private Pilot',
      description: 'Everything you need to know to become a private pilot. Covers principles of flight, aircraft systems, weather, navigation, and regulations.',
      icon: <PrivatePilotIcon />,
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10',
      status: 'available',
      units: 12,
      lessons: 102,
      estimatedTime: '40 hours',
      href: `/${locale}/handbook/private-pilot`,
    },
    {
      id: 'instrument-pilot',
      title: 'Instrument Pilot',
      description: 'Master the skills of flying by instruments. Learn about IFR procedures, approach plates, weather minimums, and instrument navigation.',
      icon: <InstrumentPilotIcon />,
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
      status: 'coming-soon',
      units: 10,
      lessons: 85,
      estimatedTime: '35 hours',
      releaseDate: 'Q2 2025',
      href: `/${locale}/handbook/instrument-pilot`,
    },
    {
      id: 'commercial-pilot',
      title: 'Commercial Pilot',
      description: 'Take your flying career to the next level. Advanced maneuvers, commercial operations, and professional pilot responsibilities.',
      icon: <CommercialPilotIcon />,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
      status: 'coming-soon',
      units: 8,
      lessons: 72,
      estimatedTime: '30 hours',
      releaseDate: 'Q3 2025',
      href: `/${locale}/handbook/commercial-pilot`,
    },
    {
      id: 'atp',
      title: 'Airline Transport Pilot',
      description: 'The pinnacle of pilot certifications. Advanced aerodynamics, airline operations, crew resource management, and transport category aircraft.',
      icon: <ATPIcon />,
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
      status: 'coming-soon',
      units: 15,
      lessons: 120,
      estimatedTime: '50 hours',
      releaseDate: 'Q4 2025',
      href: `/${locale}/handbook/atp`,
    },
    {
      id: 'flight-instructor',
      title: 'Flight Instructor',
      description: 'Learn how to teach others to fly. Fundamentals of instruction, lesson planning, and advanced flight training techniques.',
      icon: <FlightInstructorIcon />,
      color: 'text-chart-5',
      bgColor: 'bg-chart-5/10',
      status: 'coming-soon',
      units: 6,
      lessons: 48,
      estimatedTime: '25 hours',
      releaseDate: 'Q1 2026',
      href: `/${locale}/handbook/flight-instructor`,
    },
  ];

  return (
    <FullWidthLayout locale={locale} maxWidth="7xl" padding="lg">
      <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Flight Training Handbooks</h1>
        <p className="text-lg text-muted-foreground">
          Comprehensive study materials for every stage of your aviation journey. 
          From your first flight to airline transport pilot, we've got you covered.
        </p>
      </div>

      {/* Handbooks Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {handbooks.map((handbook) => (
          <Card 
            key={handbook.id} 
            className={`relative overflow-hidden transition-all duration-300 ${
              handbook.status === 'available' 
                ? 'hover:shadow-xl cursor-pointer' 
                : 'opacity-75'
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className={handbook.color}>{handbook.icon}</div>
                {handbook.status === 'available' ? (
                  <Badge variant="default">Available</Badge>
                ) : (
                  <Badge variant="secondary">Coming Soon</Badge>
                )}
              </div>
              <CardTitle className="text-xl">{handbook.title}</CardTitle>
              <CardDescription className="mt-2">
                {handbook.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Units</p>
                    <p className="font-semibold">{handbook.units}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Lessons</p>
                    <p className="font-semibold">{handbook.lessons}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-semibold">{handbook.estimatedTime}</p>
                  </div>
                </div>

                {/* Release Date for Coming Soon */}
                {handbook.releaseDate && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      Expected release: <span className="font-medium">{handbook.releaseDate}</span>
                    </p>
                  </div>
                )}

                {/* Action Button */}
                {handbook.status === 'available' ? (
                  <Button asChild className="w-full">
                    <Link href={handbook.href}>Start Learning</Link>
                  </Button>
                ) : (
                  <Button disabled className="w-full">
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Coming Soon
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center py-8 border-t">
        <h2 className="text-2xl font-semibold mb-3">Ready to Start Your Aviation Journey?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Begin with the Private Pilot handbook and work your way up through the ratings. 
          Each handbook builds on the knowledge from the previous ones.
        </p>
        <Button asChild size="lg">
          <Link href={`/${locale}/handbook/private-pilot`}>
            Start with Private Pilot
          </Link>
        </Button>
      </div>
      </div>
    </FullWidthLayout>
  );
}