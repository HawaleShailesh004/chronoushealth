import { cn } from '@/lib/utils';
import type { AlertsResponse } from '@/lib/api';

type Severity = AlertsResponse['overall_severity'];

const cfg: Record<
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
  const { label, cls } = cfg[severity] ?? cfg.NONE;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        'text-[10px] font-mono font-semibold uppercase tracking-[0.12em]',
        'rounded-full border px-3 py-1.5',
        cls,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}
