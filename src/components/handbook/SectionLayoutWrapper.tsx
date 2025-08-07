'use client';

import { usePathname } from 'next/navigation';
import { HandbookTableOfContents } from '@/components/handbook/HandbookTableOfContents';
import { JumpToSection } from '@/components/handbook/JumpToSection';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { HolyGrailLayout } from '@/components/layouts/HolyGrailLayout';

type SectionLayoutWrapperProps = {
  locale: string;
  children: React.ReactNode;
};

export function SectionLayoutWrapper({ locale, children }: SectionLayoutWrapperProps) {
  const pathname = usePathname();

  // Check if we're on an inner handbook page (3+ segments after handbook)
  const pathSegments = pathname.split('/').filter(Boolean);
  const handbookIndex = pathSegments.indexOf('handbook');
  const isInnerPage = handbookIndex !== -1 && pathSegments.length > handbookIndex + 2;

  // For inner pages, use HolyGrail layout
  if (isInnerPage) {
    const handbookType = pathSegments[handbookIndex + 1] || 'private-pilot'; // e.g., 'private-pilot'

    // Left sidebar with full Table of Contents
    const leftSidebar = (
      <HandbookTableOfContents locale={locale} handbookType={handbookType} />
    );

    // Right sidebar with jump to section
    const rightSidebar = (
      <div className="space-y-4">
        {/* Jump to Section */}
        <div className="text-xs text-muted-foreground">Jump to:</div>
        <JumpToSection />
      </div>
    );

    return (
      <HolyGrailLayout locale={locale} leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
        {children}
      </HolyGrailLayout>
    );
  }

  // For other pages, use ContainerLayout
  return (
    <ContainerLayout locale={locale} maxWidth="6xl">
      {children}
    </ContainerLayout>
  );
}
