'use client';

import { Progress } from '@/components/ui/progress';

type ProgressIndicatorProps = {
  current: number;
  total: number;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  showCounts?: boolean;
  variant?: 'default' | 'success' | 'warning';
};

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3'
};

const variantColors = {
  default: 'bg-primary',
  success: 'bg-green-500',
  warning: 'bg-amber-500'
};

export function ProgressIndicator({
  current,
  total,
  title,
  size = 'md',
  showPercentage = true,
  showCounts = false,
  variant = 'default'
}: ProgressIndicatorProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  return (
    <div className="space-y-2">
      {title && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{title}</span>
          <div className="flex items-center gap-2 text-muted-foreground">
            {showCounts && (
              <span>
                {current}/{total}
              </span>
            )}
            {showPercentage && (
              <span>{percentage}%</span>
            )}
          </div>
        </div>
      )}
      
      <Progress 
        value={percentage} 
        className={`${sizeClasses[size]} ${variantColors[variant]}`}
      />
    </div>
  );
}

// Circular progress indicator inspired by Khan Academy
export function CircularProgress({
  percentage,
  size = 60,
  strokeWidth = 4,
  variant = 'default'
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning';
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  const colors = {
    default: '#3B82F6', // blue-500
    success: '#10B981', // emerald-500
    warning: '#F59E0B'  // amber-500
  };
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted-foreground/20"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[variant]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}

// Progress ring for lessons (Khan Academy style)
export function LessonProgressRing({
  completed,
  total,
  size = 24
}: {
  completed: number;
  total: number;
  size?: number;
}) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  const isComplete = completed === total && total > 0;
  
  if (isComplete) {
    return (
      <div 
        className="inline-flex items-center justify-center rounded-full bg-green-500 text-white"
        style={{ width: size, height: size }}
      >
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 16 16" fill="currentColor">
          <path d="M13.485 1.515a2 2 0 0 1 0 2.828l-7.07 7.071a2 2 0 0 1-2.83 0l-3.535-3.536a2 2 0 0 1 2.83-2.828L5 7.172l5.657-5.657a2 2 0 0 1 2.828 0z"/>
        </svg>
      </div>
    );
  }
  
  return (
    <CircularProgress
      percentage={percentage}
      size={size}
      strokeWidth={2}
      variant={percentage > 0 ? 'default' : 'default'}
    />
  );
}