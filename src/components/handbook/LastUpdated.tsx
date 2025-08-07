'use client';

import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

type LastUpdatedProps = {
  lastUpdated: Date;
  variant?: 'default' | 'compact';
  className?: string;
};

export function LastUpdated({ lastUpdated, variant = 'default', className }: LastUpdatedProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  const getIcon = () => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));

    // Use clock icon for recent updates (within 7 days), calendar for older ones
    return diffInDays < 7 ? Clock : Calendar;
  };

  const formattedDate = formatDate(lastUpdated);
  const Icon = getIcon();
  const isRecent = formattedDate === 'Today' || formattedDate === 'Yesterday' || formattedDate.includes('days ago');

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-1.5 text-xs text-muted-foreground', className)}>
        <Icon className="h-3 w-3" />
        <time dateTime={lastUpdated.toISOString()}>
          Last updated
          {' '}
          {formattedDate.toLowerCase()}
        </time>
      </div>
    );
  }

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors',
      isRecent
        ? 'bg-green-50 text-green-700 border border-green-200'
        : 'bg-muted/50 text-muted-foreground border border-border',
      className,
    )}
    >
      <Icon className={cn(
        'h-4 w-4',
        isRecent ? 'text-green-600' : 'text-muted-foreground',
      )}
      />
      <time dateTime={lastUpdated.toISOString()}>
        Last updated
        {' '}
        {formattedDate.toLowerCase()}
      </time>
    </div>
  );
}
