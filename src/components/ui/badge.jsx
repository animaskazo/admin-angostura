import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full text-[11px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-[#FFECEA] text-[#FF3B30]',
        outline: 'border border-border text-foreground',
        // Status variants
        occupied: 'bg-[#E8F8ED] text-[#34C759]',
        pending: 'bg-[#E1EFFF] text-[#007AFF]',
        paid_cash: 'bg-[#E8F8ED] text-[#34C759]',
        paid_transfer: 'bg-[#E8F8ED] text-[#34C759]',
        maintenance: 'bg-[#FFECEA] text-[#FF3B30]',
        cleaning: 'bg-[#FFF3E0] text-[#FF9500]',
        available: 'bg-[#E8F8ED] text-[#34C759]',
        cancelled: 'bg-[#F2F2F7] text-[#8E8E93]',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        default: 'px-2.5 py-1',
        lg: 'px-3 py-1.5 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Badge({ className, variant, size, dot = true, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: 'currentColor' }}
        />
      )}
      {props.children}
    </span>
  );
}

// Status badge with auto variant detection
function StatusBadge({ status, size = 'default', className }) {
  const labels = {
    occupied: 'Ocupado',
    pending: 'Pago Pendiente',
    paid_cash: 'Pagado Efectivo',
    paid_transfer: 'Pagado Transf.',
    maintenance: 'Mantenimiento',
    cleaning: 'Limpieza',
    available: 'Disponible',
    cancelled: 'Cancelado'
  };
  return (
    <Badge variant={status} size={size} className={className}>
      {labels[status] || status}
    </Badge>
  );
}

export { Badge, StatusBadge, badgeVariants };
