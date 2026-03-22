import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'NONE'
    | 'LOW'
    | 'MODERATE'
    | 'HIGH'
    | 'EMERGENCY'
    | 'blue'
    | 'gray';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const variantMap = {
  NONE: 'bg-success-50 text-success-700 border-success-100',
  LOW: 'bg-success-50 text-success-700 border-success-100',
  MODERATE: 'bg-warning-50 text-warning-700 border-warning-100',
  HIGH: 'bg-danger-50 text-danger-700 border-danger-100',
  EMERGENCY: 'bg-danger-50 text-danger-700 border-danger-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  gray: 'bg-ink-100 text-ink-500 border-ink-200',
};

const dotMap = {
  NONE: 'bg-success-500',
  LOW: 'bg-success-500',
  MODERATE: 'bg-warning-500',
  HIGH: 'bg-danger-500',
  EMERGENCY: 'bg-danger-600',
  blue: 'bg-blue-600',
  gray: 'bg-ink-400',
};

export function Badge({
  children,
  variant = 'gray',
  size = 'sm',
  dot,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono font-medium border rounded-full',
        size === 'sm' ? 'text-[10px] px-2.5 py-0.5' : 'text-xs px-3 py-1',
        variantMap[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full flex-shrink-0',
            dotMap[variant]
          )}
        />
      )}
      {children}
    </span>
  );
}
