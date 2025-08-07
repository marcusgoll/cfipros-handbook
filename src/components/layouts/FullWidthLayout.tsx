'use client';

import { SubNavigation } from '@/components/navigation/SubNavigation';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { Footer } from '@/components/ui/footer';

type FullWidthLayoutProps = {
  locale: string;
  children: React.ReactNode;
  maxWidth?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl';
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

export function FullWidthLayout({ locale, children, maxWidth = 'none', padding = 'lg' }: FullWidthLayoutProps) {
  const maxWidthClasses = {
    'none': 'w-full',
    'sm': 'max-w-sm mx-auto',
    'md': 'max-w-md mx-auto',
    'lg': 'max-w-lg mx-auto',
    'xl': 'max-w-xl mx-auto',
    '2xl': 'max-w-2xl mx-auto',
    '7xl': 'max-w-7xl mx-auto',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <TopNavigation locale={locale} />
      <SubNavigation locale={locale} />

      {/* Main Content Area */}
      <main className={`flex-1 ${paddingClasses[padding]}`}>
        <div className={maxWidthClasses[maxWidth]}>
          {children}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
