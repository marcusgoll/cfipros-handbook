'use client';

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { cn } from '@/lib/utils';

type TopNavigationProps = {
  locale: string;
};

export function TopNavigation({ locale }: TopNavigationProps) {
  const pathname = usePathname();
  const isHandbookPage = pathname.includes('/handbook');

  const navItems = [
    {
      title: 'Dashboard',
      href: `/${locale}/dashboard`,
      active: pathname === `/${locale}/dashboard`,
    },
    {
      title: 'Handbook',
      href: `/${locale}/handbook`,
      active: pathname.startsWith(`/${locale}/handbook`),
      hasSubmenu: true,
    },
    {
      title: 'ACS Extractor',
      href: `/${locale}/dashboard/acs-extractor`,
      active: pathname.startsWith(`/${locale}/dashboard/acs-extractor`),
    },
    {
      title: 'Resources',
      href: `/${locale}/dashboard/resources`,
      active: pathname.startsWith(`/${locale}/dashboard/resources`),
    },
    {
      title: 'Company',
      href: `/${locale}/company`,
      active: pathname.startsWith(`/${locale}/company`),
    },
  ];

  return (
    <header className="z-50 w-full border-b bg-background border-border">
      <div className="w-full px-6">
        <div className="flex h-12 items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">CFIPros</span>
          </Link>

          {/* Main Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-all relative',
                  item.active && isHandbookPage
                    ? 'bg-muted text-foreground border-b-2 border-chart-1 rounded-b-none'
                    : item.active
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* User Menu */}
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'h-8 w-8',
                  },
                }}
              />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="sm">Sign In</Button>
              </SignInButton>
            </SignedOut>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Toggle menu"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
