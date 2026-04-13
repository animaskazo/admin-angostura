import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-[8px] border border-border bg-secondary px-3 py-2',
        'text-sm text-foreground placeholder:text-muted-foreground',
        'resize-y transition-all duration-200',
        'focus:outline-none focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/15',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
