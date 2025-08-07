'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type Section = {
  id: string;
  title: string;
  level: number;
};

export function JumpToSection() {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    // Find only H2 headings in the main content
    const headings = document.querySelectorAll('main h2');
    const sectionList: Section[] = [];

    headings.forEach((heading, index) => {
      const id = heading.id || `h2-section-${index}`;
      if (!heading.id) {
        heading.id = id;
      }

      sectionList.push({
        id,
        title: heading.textContent || '',
        level: 2, // Always level 2 since we're only showing H2s
      });
    });

    setSections(sectionList);

    // Set up intersection observer for active section tracking
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -66%',
        threshold: 0,
      },
    );

    headings.forEach((heading) => {
      observer.observe(heading);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  if (sections.length === 0) {
    return (
      <div className="text-xs text-muted-foreground text-center py-4">
        No H2 sections found on this page
      </div>
    );
  }

  return (
    <nav className="space-y-1 max-h-[40vh] overflow-y-auto overflow-x-hidden">
      {sections.map(section => (
        <button
          key={section.id}
          onClick={() => scrollToSection(section.id)}
          className={cn(
            'block w-full text-left px-2 py-1.5 text-xs rounded-md transition-all duration-200 hover:bg-primary/10 hover:text-primary group cursor-pointer',
            activeSection === section.id
              ? 'text-primary bg-primary/15 font-medium shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
            'hover:translate-x-1 active:scale-[0.98]',
          )}
          title={section.title}
        >
          <span className="block truncate transition-transform duration-200 group-hover:translate-x-1">{section.title}</span>
        </button>
      ))}
    </nav>
  );
}
