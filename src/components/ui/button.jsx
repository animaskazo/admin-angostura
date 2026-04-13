import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-[hsl(211,100%,44%)] hover:-translate-y-px hover:shadow-apple-blue active:translate-y-0',
        secondary:
          'bg-card text-foreground border border-border shadow-apple-sm hover:bg-secondary hover:-translate-y-px active:translate-y-0',
        ghost:
          'text-muted-foreground hover:bg-secondary hover:text-foreground',
        destructive:
          'bg-[#FFECEA] text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white',
        outline:
          'border border-border bg-transparent hover:bg-secondary text-foreground',
        link:
          'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-7 rounded-[8px] px-3 text-xs',
        lg: 'h-11 rounded-[14px] px-6 text-[15px]',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
