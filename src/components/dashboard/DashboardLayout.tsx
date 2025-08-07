'use client';

import { SubNavigation } from '@/components/navigation/SubNavigation';
import { TopNavigation } from '@/components/navigation/TopNavigation';

type DashboardLayoutProps = {
  children: React.ReactNode;
  locale: string;
};

export function DashboardLayout({ children, locale }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavigation locale={locale} />
      <SubNavigation locale={locale} />

      {/* Dashboard Content */}
      <main className="flex-1 bg-muted/30">
        <div className="w-full px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
