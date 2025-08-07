import type { VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative group',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 border-primary/30 border-[1.5px] relative top-[1px] rounded-[6px] text-primary hover:scale-[1.02] active:top-[.5px] active:scale-[.99]',
        destructive:
          'bg-destructive/10 border-destructive/30 border-[1.5px] relative top-[1px] rounded-[6px] text-destructive hover:scale-[1.02] active:top-[.5px] active:scale-[.99]',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:translate-y-[-1px] active:translate-y-[1px] active:transition-all',
        secondary:
          'bg-muted/30 border-border border-[1.5px] relative top-[1px] rounded-[6px] text-foreground hover:scale-[1.02] active:top-[.5px] active:scale-[.99]',
        ghost: 'hover:bg-accent/25 hover:backdrop-blur-sm border-transparent hover:border hover:border-border relative hover:scale-[1.02] active:top-[.5px] active:scale-[.99] rounded-sm',
        link: 'text-primary underline-offset-4 hover:underline opacity-70 hover:opacity-100',
        posthog: 'bg-primary/10 border-primary/30 border-[1.5px] relative top-[1px] rounded-[6px] text-primary group',
      },
      size: {
        default: 'px-3.5 py-1.5',
        sm: 'px-3 py-1 text-xs',
        lg: 'px-4 py-2 text-base',
        icon: 'h-9 w-9 p-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ButtonProps = {
  asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

const Button = ({ ref, className, variant, size, asChild = false, children, ...props }: ButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> }) => {
  const Comp = asChild ? Slot : 'button';

  if (variant === 'posthog') {
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <span className="relative text-center border-primary bg-background text-primary hover:text-primary rounded-[6px] text-[13px] font-bold px-3.5 py-1.5 translate-y-[-2px] hover:translate-y-[-3px] active:translate-y-[-1px] border-[1.5px] mx-[-1.5px] group-disabled:hover:!translate-y-[-2px] block active:transition-all active:duration-100 select-none">
          {children}
        </span>
      </Comp>
    );
  }

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    >
      {children}
    </Comp>
  );
};
Button.displayName = 'Button';

export { Button, buttonVariants };
