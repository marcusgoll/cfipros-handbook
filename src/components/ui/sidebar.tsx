'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SidebarContext = React.createContext<{
  isOpen: boolean;
  toggle: () => void;
}>({
      isOpen: true,
      toggle: () => {},
    });

export function useSidebar() {
  const context = React.use(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

type SidebarProviderProps = {
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export function SidebarProvider({ children, defaultOpen = true }: SidebarProviderProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const toggle = React.useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return (
    <SidebarContext value={{ isOpen, toggle }}>
      {children}
    </SidebarContext>
  );
}

export function Sidebar({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  const { isOpen } = useSidebar();

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex h-full w-64 flex-col bg-card border-r transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0',
        !isOpen && '-translate-x-full lg:-translate-x-full',
        className,
      )}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex h-16 items-center border-b px-6', className)}>
      {children}
    </div>
  );
}

export function SidebarContent({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex-1 overflow-y-auto px-3 py-4', className)}>
      {children}
    </div>
  );
}

export function SidebarFooter({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('border-t p-4', className)}>
      {children}
    </div>
  );
}

export function SidebarToggle({ className }: React.HTMLAttributes<HTMLButtonElement>) {
  const { toggle } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={cn('h-9 w-9', className)}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
      >
        <path
          d="M3 12H21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 6H21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 18H21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
}

type SidebarNavProps = {
  items: {
    title: string;
    href?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    active?: boolean;
    badge?: string | number;
  }[];
};

export function SidebarNav({ items }: SidebarNavProps) {
  return (
    <nav className="space-y-1">
      {items.map((item, index) => (
        <Button
          key={index}
          variant={item.active ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start',
            item.active && 'bg-muted',
          )}
          onClick={item.onClick}
          asChild={!!item.href}
        >
          {item.href
            ? (
                <a href={item.href}>
                  {item.icon && <span className="mr-3">{item.icon}</span>}
                  {item.title}
                  {item.badge && (
                    <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                      {item.badge}
                    </span>
                  )}
                </a>
              )
            : (
                <>
                  {item.icon && <span className="mr-3">{item.icon}</span>}
                  {item.title}
                  {item.badge && (
                    <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
        </Button>
      ))}
    </nav>
  );
}
