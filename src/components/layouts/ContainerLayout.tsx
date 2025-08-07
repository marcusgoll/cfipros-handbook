'use client';

import { SubNavigation } from '@/components/navigation/SubNavigation';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { Footer } from '@/components/ui/footer';

type ContainerLayoutProps = {
  locale: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
};

export function ContainerLayout({
  locale,
  children,
  maxWidth = '4xl',
  padding = 'lg',
}: ContainerLayoutProps) {
  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <TopNavigation locale={locale} />
      <SubNavigation locale={locale} />

      {/* Main Content Area */}
      <main className={`flex-1 ${paddingClasses[padding]}`}>
        <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>
          {children}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
