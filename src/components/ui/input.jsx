import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-[8px] border border-border bg-secondary px-3 py-1',
        'text-sm text-foreground placeholder:text-muted-foreground',
        'transition-all duration-200',
        'focus:outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/15',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
