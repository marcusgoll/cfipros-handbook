'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type SubNavigationProps = {
  locale: string;
};

// SVG Icons for each handbook type
const PrivatePilotIcon = ({ className }: { className?: string }) => (
  <svg className={`h-4 w-4 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const CommercialPilotIcon = ({ className }: { className?: string }) => (
  <svg className={`h-4 w-4 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const InstrumentPilotIcon = ({ className }: { className?: string }) => (
  <svg className={`h-4 w-4 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const ATPIcon = ({ className }: { className?: string }) => (
  <svg className={`h-4 w-4 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68z" />
  </svg>
);

const FlightInstructorIcon = ({ className }: { className?: string }) => (
  <svg className={`h-4 w-4 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export function SubNavigation({ locale }: SubNavigationProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const handbookItems = [
    {
      title: 'Private Pilot',
      href: `/${locale}/handbook/private-pilot`,
      icon: PrivatePilotIcon,
      chartColor: 'chart-1',
      active: pathname.startsWith(`/${locale}/handbook/private-pilot`),
    },
    {
      title: 'Commercial Pilot',
      href: `/${locale}/handbook/commercial-pilot`,
      icon: CommercialPilotIcon,
      chartColor: 'chart-2',
      active: pathname.startsWith(`/${locale}/handbook/commercial-pilot`),
      disabled: true,
    },
    {
      title: 'Instrument Pilot',
      href: `/${locale}/handbook/instrument-pilot`,
      icon: InstrumentPilotIcon,
      chartColor: 'chart-3',
      active: pathname.startsWith(`/${locale}/handbook/instrument-pilot`),
      disabled: true,
    },
    {
      title: 'ATP',
      href: `/${locale}/handbook/atp`,
      icon: ATPIcon,
      chartColor: 'chart-4',
      active: pathname.startsWith(`/${locale}/handbook/atp`),
      disabled: true,
    },
    {
      title: 'Flight Instructor',
      href: `/${locale}/handbook/flight-instructor`,
      icon: FlightInstructorIcon,
      chartColor: 'chart-5',
      active: pathname.startsWith(`/${locale}/handbook/flight-instructor`),
      disabled: true,
    },
  ];

  // Check for overflow on mount and resize
  useEffect(() => {
    const checkOverflow = () => {
      if (navRef.current) {
        const hasOverflow = navRef.current.scrollWidth > navRef.current.clientWidth;
        const isAtEnd = navRef.current.scrollLeft + navRef.current.clientWidth >= navRef.current.scrollWidth - 1;
        setShowRightArrow(hasOverflow && !isAtEnd);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    
    // Also check on scroll
    const handleScroll = () => checkOverflow();
    const currentRef = navRef.current;
    currentRef?.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('resize', checkOverflow);
      currentRef?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollRight = () => {
    if (navRef.current) {
      navRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Only show sub-navigation on handbook pages
  if (!pathname.includes('/handbook')) {
    return null;
  }

  return (
    <div className="z-40 w-full border-b bg-secondary border-border">
      <div className="w-full px-6">
        <div className="relative">
          <nav 
            ref={navRef}
            className="flex items-center justify-center gap-4 py-2 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {handbookItems.map((item) => (
              <Link
                key={item.href}
                href={item.disabled ? '#' : item.href}
                className={cn(
                  'flex items-center gap-2 px-2.5 py-1.5 text-sm font-medium whitespace-nowrap rounded-md transition-all group',
                  item.active
                    ? `bg-${item.chartColor}/10 text-${item.chartColor} border border-${item.chartColor}/20 shadow-sm ring-1 ring-opacity-20`
                    : item.disabled
                    ? 'text-muted-foreground/50 cursor-not-allowed opacity-60'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
                onClick={(e) => item.disabled && e.preventDefault()}
              >
                {React.createElement(item.icon, { className: `text-${item.chartColor}` })}
                <span>
                  {item.title}
                </span>
                {item.disabled && (
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                    Soon
                  </span>
                )}
              </Link>
            ))}
          </nav>
          
          {/* Right scroll indicator */}
          {showRightArrow && (
            <button 
              onClick={scrollRight}
              className="absolute right-0 top-0 h-full flex items-center bg-gradient-to-l from-background via-background to-transparent pl-8 pr-4"
              aria-label="Scroll right"
            >
              <svg 
                className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}