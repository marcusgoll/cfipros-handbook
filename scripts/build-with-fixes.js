#!/usr/bin/env node

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

console.log('🔧 Running build with fixes...');

// Step 1: Set required environment variables
process.env.NEXT_PUBLIC_SENTRY_DISABLED = 'true';
process.env.NODE_ENV = 'production';
process.env.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || 'test_key';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5433/postgres';

console.log('✅ Environment variables set');

// Step 2: Check for critical missing files
const criticalFiles = [
  'src/types/handbook.ts',
  'src/components/ui/card.tsx',
  'src/components/ui/badge.tsx',
];

for (const file of criticalFiles) {
  if (!fs.existsSync(file)) {
    console.log(`⚠️  Missing critical file: ${file}`);
  }
}

// Step 3: Create missing UI components that are imported
const cardComponent = `import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';`;

if (!fs.existsSync('src/components/ui/card.tsx')) {
  fs.writeFileSync('src/components/ui/card.tsx', cardComponent);
  console.log('✅ Created missing Card component');
}

const badgeComponent = `import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        {
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80': variant === 'default',
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80': variant === 'destructive',
          'text-foreground': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';`;

if (!fs.existsSync('src/components/ui/badge.tsx')) {
  fs.writeFileSync('src/components/ui/badge.tsx', badgeComponent);
  console.log('✅ Created missing Badge component');
}

// Step 4: Try the build
try {
  console.log('🚀 Starting Next.js build...');
  execSync('npx next build', {
    stdio: 'inherit',
    timeout: 300000, // 5 minutes
    env: process.env,
  });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
