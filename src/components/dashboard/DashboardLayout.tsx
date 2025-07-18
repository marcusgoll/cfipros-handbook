'use client';

import { SignedIn, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
  SidebarProvider,
  SidebarToggle,
} from '@/components/ui/sidebar';

type DashboardLayoutProps = {
  children: React.ReactNode;
  locale: string;
};

export function DashboardLayout({ children, locale }: DashboardLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    {
      title: 'Dashboard',
      href: `/${locale}/dashboard`,
      icon: (
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
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      active: pathname === `/${locale}/dashboard`,
    },
    {
      title: 'Handbook',
      href: `/${locale}/handbook`,
      icon: (
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
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      active: pathname.startsWith(`/${locale}/handbook`),
      badge: 'NEW',
    },
    {
      title: 'Practice Tests',
      href: `/${locale}/dashboard/practice`,
      icon: (
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
      active: pathname.startsWith(`/${locale}/dashboard/practice`),
    },
    {
      title: 'ACS Extractor',
      href: `/${locale}/dashboard/acs-extractor`,
      icon: (
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
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      active: pathname.startsWith(`/${locale}/dashboard/acs-extractor`),
    },
    {
      title: 'Progress',
      href: `/${locale}/dashboard/progress`,
      icon: (
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      active: pathname.startsWith(`/${locale}/dashboard/progress`),
    },
    {
      title: 'Resources',
      href: `/${locale}/dashboard/resources`,
      icon: (
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
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      active: pathname.startsWith(`/${locale}/dashboard/resources`),
    },
    {
      title: 'Bookmarks',
      href: `/${locale}/dashboard/bookmarks`,
      icon: (
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
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      ),
      active: pathname.startsWith(`/${locale}/dashboard/bookmarks`),
    },
  ];

  const settingsNavItems = [
    {
      title: 'Profile',
      href: `/${locale}/dashboard/user-profile`,
      icon: (
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      active: pathname.startsWith(`/${locale}/dashboard/user-profile`),
    },
    {
      title: 'Subscription',
      href: `/${locale}/dashboard/subscription`,
      icon: (
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
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
      active: pathname.startsWith(`/${locale}/dashboard/subscription`),
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarHeader>
            <Link href={`/${locale}/dashboard`} className="flex items-center space-x-2">
              <div className="text-xl font-bold text-primary">CFIPros</div>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Study
                </h3>
                <SidebarNav items={navItems} />
              </div>

              <div>
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Settings
                </h3>
                <SidebarNav items={settingsNavItems} />
              </div>
            </div>
          </SidebarContent>

          <SidebarFooter>
            <div className="flex items-center justify-between px-3">
              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'h-8 w-8',
                    },
                  }}
                />
              </SignedIn>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${locale}`}>
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </Link>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col">
          {/* Dashboard Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6">
            <div className="flex items-center gap-4">
              <SidebarToggle className="lg:hidden" />

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-primary">CFIPros</span>
                <span className="text-muted-foreground">›</span>
                <span className="text-foreground">Dashboard</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="hidden sm:flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5 w-64">
                <svg
                  className="h-4 w-4 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="search"
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none text-sm flex-1 placeholder:text-muted-foreground"
                />
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-2">
                <SignedIn>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: 'h-8 w-8',
                      },
                    }}
                  />
                </SignedIn>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
