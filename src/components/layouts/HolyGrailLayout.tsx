'use client';

import { SubNavigation } from '@/components/navigation/SubNavigation';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { Footer } from '@/components/ui/footer';

type HolyGrailLayoutProps = {
  locale: string;
  children: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
};

export function HolyGrailLayout({ locale, children, leftSidebar, rightSidebar }: HolyGrailLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <TopNavigation locale={locale} />
      <SubNavigation locale={locale} />

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        {leftSidebar && (
          <aside className="w-64 bg-secondary border-r border-border p-4">
            {leftSidebar}
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>

        {/* Right Sidebar */}
        {rightSidebar && (
          <aside className="w-64 bg-secondary border-l border-border p-4">
            {rightSidebar}
          </aside>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
