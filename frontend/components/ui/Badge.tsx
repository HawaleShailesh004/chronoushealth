import { cn } from '@/lib/utils';

type Variant =
  | 'NONE'
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'EMERGENCY'
  | 'blue'
  | 'gray';

const variantMap: Record<Variant, string> = {
  NONE: 'bg-success-50 text-success-700 border-success-100',
  LOW: 'bg-success-50 text-success-700 border-success-100',
  MODERATE: 'bg-warning-50 text-warning-700 border-warning-100',
  HIGH: 'bg-danger-50 text-danger-700 border-danger-100',
  EMERGENCY: 'bg-danger-50 text-danger-700 border-danger-100',
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  gray: 'bg-ink-100 text-ink-600 border-ink-200',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  dot?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = 'gray',
  dot,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        'text-[10px] font-mono font-semibold uppercase tracking-[0.12em]',
        'px-2.5 py-0.5 rounded-full border',
        variantMap[variant],
        className
      )}
    >
      {dot && (
        <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current opacity-80" />
      )}
      {children}
    </span>
  );
}
