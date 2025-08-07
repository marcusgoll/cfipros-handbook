import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex w-full rounded-lg border text-premium focus-premium relative transition-all duration-200 ease-out file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/70 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: [
          'border-input bg-background/50 backdrop-blur-sm shadow-sm',
          'hover:border-primary/30 hover:shadow-md',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 focus-visible:border-primary/50',
          'focus-visible:shadow-lg focus-visible:bg-background',
        ],
        premium: [
          'border-premium bg-gradient-surface shadow-md',
          'hover:border-glow hover:shadow-lg hover:glow-primary',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2',
          'focus-visible:shadow-xl focus-visible:glow-primary focus-visible:scale-[1.01]',
        ],
        glass: [
          'glass border-premium shadow-lg',
          'hover:glass-strong hover:shadow-xl',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2',
          'focus-visible:shadow-2xl focus-visible:scale-[1.01]',
        ],
        outline: [
          'border-border bg-transparent shadow-sm',
          'hover:border-primary/40 hover:bg-accent/20',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2',
          'focus-visible:border-primary/60 focus-visible:bg-background/80',
        ],
        filled: [
          'border-transparent bg-muted shadow-sm',
          'hover:bg-muted/80 hover:shadow-md',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2',
          'focus-visible:bg-background focus-visible:shadow-lg',
        ],
        error: [
          'border-destructive/50 bg-destructive/5 shadow-sm glow-error',
          'hover:border-destructive/70 hover:shadow-md',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30 focus-visible:ring-offset-2',
          'focus-visible:border-destructive focus-visible:shadow-lg',
        ],
        success: [
          'border-green-500/50 bg-green-50 shadow-sm glow-success',
          'hover:border-green-500/70 hover:shadow-md',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/30 focus-visible:ring-offset-2',
          'focus-visible:border-green-500 focus-visible:shadow-lg',
        ],
      },
      size: {
        sm: 'h-8 px-2.5 py-1.5 text-xs rounded-md',
        default: 'h-10 px-4 py-2.5 text-sm',
        lg: 'h-12 px-5 py-3 text-base rounded-xl',
        xl: 'h-14 px-6 py-3.5 text-lg rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type InputProps = {
  /** Left icon */
  leftIcon?: React.ReactNode;
  /** Right icon */
  rightIcon?: React.ReactNode;
  /** Show loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Success message */
  success?: string;
} & React.InputHTMLAttributes<HTMLInputElement> & VariantProps<typeof inputVariants>;

const LoadingSpinner = ({ className }: { className?: string }) => (
  <svg
    className={cn('animate-spin', className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const Input = ({ ref, className, variant, size, type, leftIcon, rightIcon, loading = false, error, success, ...props }: InputProps & { ref?: React.RefObject<HTMLInputElement | null> }) => {
  // Auto-detect variant based on state
  const effectiveVariant = error ? 'error' : success ? 'success' : variant;

  // If we have icons or loading, wrap in a container
  if (leftIcon || rightIcon || loading) {
    return (
      <div className="relative">
        <div className="relative flex items-center">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 z-10 flex items-center justify-center text-muted-foreground">
              {leftIcon}
            </div>
          )}

          <input
            type={type}
            className={cn(
              inputVariants({ variant: effectiveVariant, size, className }),
              leftIcon && 'pl-10',
              (rightIcon || loading) && 'pr-10',
            )}
            ref={ref}
            {...props}
          />

          {/* Right icon or loading */}
          {loading
            ? (
                <div className="absolute right-3 z-10 flex items-center justify-center text-muted-foreground">
                  <LoadingSpinner className="size-4" />
                </div>
              )
            : rightIcon
              ? (
                  <div className="absolute right-3 z-10 flex items-center justify-center text-muted-foreground">
                    {rightIcon}
                  </div>
                )
              : null}
        </div>

        {/* Error or success message */}
        {error && (
          <p className="mt-1.5 text-sm text-destructive animate-slide-down">
            {error}
          </p>
        )}
        {success && !error && (
          <p className="mt-1.5 text-sm text-green-600 animate-slide-down">
            {success}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        type={type}
        className={cn(inputVariants({ variant: effectiveVariant, size, className }))}
        ref={ref}
        {...props}
      />

      {/* Error or success message */}
      {error && (
        <p className="mt-1.5 text-sm text-destructive animate-slide-down">
          {error}
        </p>
      )}
      {success && !error && (
        <p className="mt-1.5 text-sm text-green-600 animate-slide-down">
          {success}
        </p>
      )}
    </div>
  );
};

Input.displayName = 'Input';

export { Input, inputVariants };
