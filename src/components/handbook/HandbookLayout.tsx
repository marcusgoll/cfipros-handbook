'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarToggle,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

type HandbookLayoutProps = {
  children: React.ReactNode;
  locale: string;
};

export function HandbookLayout({ children, locale }: HandbookLayoutProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  // Private Pilot Handbook structure
  const handbookStructure = {
    'private-pilot': {
      title: 'Private Pilot Handbook',
      units: [
        {
          title: 'Unit 1: Principles of Flight',
          href: `/${locale}/handbook/private-pilot/principles-of-flight`,
          lessons: [
            { title: 'The Four Forces', href: `/${locale}/handbook/private-pilot/principles-of-flight/four-forces` },
            { title: 'Lift and Bernoulli\'s Principle', href: `/${locale}/handbook/private-pilot/principles-of-flight/lift-bernoulli` },
            { title: 'Drag and Its Types', href: `/${locale}/handbook/private-pilot/principles-of-flight/drag-types` },
            { title: 'Thrust and Power', href: `/${locale}/handbook/private-pilot/principles-of-flight/thrust-power` },
            { title: 'Weight and Balance', href: `/${locale}/handbook/private-pilot/principles-of-flight/weight-balance` },
          ],
        },
        {
          title: 'Unit 2: Aircraft Systems',
          href: `/${locale}/handbook/private-pilot/aircraft-systems`,
          lessons: [
            { title: 'Engine Systems', href: `/${locale}/handbook/private-pilot/aircraft-systems/engine-systems` },
            { title: 'Electrical Systems', href: `/${locale}/handbook/private-pilot/aircraft-systems/electrical-systems` },
            { title: 'Hydraulic Systems', href: `/${locale}/handbook/private-pilot/aircraft-systems/hydraulic-systems` },
            { title: 'Flight Control Systems', href: `/${locale}/handbook/private-pilot/aircraft-systems/flight-controls` },
            { title: 'Avionics', href: `/${locale}/handbook/private-pilot/aircraft-systems/avionics` },
          ],
        },
        {
          title: 'Unit 3: Weather',
          href: `/${locale}/handbook/private-pilot/weather`,
          lessons: [
            { title: 'Atmosphere', href: `/${locale}/handbook/private-pilot/weather/atmosphere` },
            { title: 'Weather Patterns', href: `/${locale}/handbook/private-pilot/weather/patterns` },
            { title: 'Weather Reports', href: `/${locale}/handbook/private-pilot/weather/reports` },
            { title: 'Weather Hazards', href: `/${locale}/handbook/private-pilot/weather/hazards` },
          ],
        },
      ],
    },
  };

  // Determine which handbook we're in
  const currentHandbook = pathname.includes('private-pilot') ? 'private-pilot' : null;
  const structure = currentHandbook ? handbookStructure[currentHandbook] : null;

  if (!structure) {
    // If not in a specific handbook, just show the content without sidebar
    return <div className="w-full">{children}</div>;
  }

  return (
    <SidebarProvider defaultOpen={isOpen}>
      <div className="flex w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Table of Contents</h2>
            <p className="text-xs text-muted-foreground mt-1">{structure.title}</p>
          </SidebarHeader>

          <SidebarContent>
            <nav className="space-y-2 p-2">
              {structure.units.map((unit, unitIndex) => (
                <div key={unitIndex} className="space-y-1">
                  <Link
                    href={unit.href}
                    className={cn(
                      'block px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      pathname === unit.href
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted text-foreground',
                    )}
                  >
                    {unit.title}
                  </Link>

                  {unit.lessons.map((lesson, lessonIndex) => {
                    const isActive = pathname === lesson.href;
                    return (
                      <Link
                        key={lessonIndex}
                        href={lesson.href}
                        className={cn(
                          'block pl-6 pr-3 py-1.5 text-sm rounded-md transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                        )}
                      >
                        {lesson.title}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background px-4 py-2 lg:hidden">
            <SidebarToggle />
            <span className="text-sm font-medium">Table of Contents</span>
          </div>

          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
