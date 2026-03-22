import { cn } from '@/lib/utils';
import type { AlertsResponse } from '@/lib/api';

type Severity = AlertsResponse['overall_severity'];

const config: Record<
  Severity,
  { label: string; cls: string }
> = {
  NONE: {
    label: 'All Clear',
    cls: 'bg-success-50 text-success-700 border-success-100',
  },
  LOW: {
    label: 'Low',
    cls: 'bg-success-50 text-success-700 border-success-100',
  },
  MODERATE: {
    label: 'Moderate',
    cls: 'bg-warning-50 text-warning-700 border-warning-100',
  },
  HIGH: {
    label: 'High',
    cls: 'bg-danger-50 text-danger-700 border-danger-100',
  },
  EMERGENCY: {
    label: 'Emergency',
    cls: 'bg-danger-50 text-danger-700 border-danger-100',
  },
};

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  const { label, cls } = config[severity] ?? config.NONE;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold',
        'tracking-wide uppercase px-2.5 py-1 rounded-full border',
        cls,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}
