'use client';

import { TopNavigation } from '@/components/navigation/TopNavigation';
import { SubNavigation } from '@/components/navigation/SubNavigation';
import { Footer } from '@/components/ui/footer';

type LeftSidebarLayoutProps = {
  locale: string;
  children: React.ReactNode;
  sidebar: React.ReactNode;
  sidebarWidth?: 'sm' | 'md' | 'lg';
};

export function LeftSidebarLayout({ locale, children, sidebar, sidebarWidth = 'md' }: LeftSidebarLayoutProps) {
  const sidebarWidthClasses = {
    sm: 'w-48',
    md: 'w-64',
    lg: 'w-80'
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <TopNavigation locale={locale} />
      <SubNavigation locale={locale} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <aside className={`${sidebarWidthClasses[sidebarWidth]} bg-secondary border-r border-border p-4 overflow-y-auto`}>
          {sidebar}
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}