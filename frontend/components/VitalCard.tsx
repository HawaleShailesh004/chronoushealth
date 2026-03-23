import { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  value: number;
  unit: string;
  delta: string;
  deltaDir: 'up' | 'down';
  severity: 'crit' | 'warn' | 'ok' | 'neutral';
  delay?: number;
}

const severityMap = {
  crit: {
    value: 'text-danger-600',
    bar: 'bg-danger-600',
    delta: 'border-danger-100 bg-danger-50 text-danger-700',
  },
  warn: {
    value: 'text-warning-700',
    bar: 'bg-warning-500',
    delta: 'border-warning-100 bg-warning-50 text-warning-700',
  },
  ok: {
    value: 'text-success-700',
    bar: 'bg-success-500',
    delta: 'border-success-100 bg-success-50 text-success-700',
  },
  neutral: {
    value: 'text-blue-600',
    bar: 'bg-blue-600',
    delta: 'border-blue-100 bg-blue-50 text-blue-700',
  },
};

function AnimatedNumber({
  target,
  delay,
}: {
  target: number;
  delay: number;
}) {
  const [display, setDisplay] = useState(0);
  const decimals = target % 1 !== 0 ? 1 : 0;

  useEffect(() => {
    const controls = animate(0, target, {
      duration: 1.1,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [target, delay]);

  return <span>{display.toFixed(decimals)}</span>;
}

export function VitalCard({
  label,
  value,
  unit,
  delta,
  deltaDir,
  severity,
  delay = 0,
}: Props) {
  const s = severityMap[severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      }}
      className="relative overflow-hidden rounded-2xl border border-ink-200 bg-white p-5 shadow-card"
    >
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 h-[3px] rounded-b-2xl',
          s.bar
        )}
      />

      <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-label text-ink-400">
        {label}
      </p>

      <div
        className={cn(
          'mb-2 font-mono text-[28px] font-medium leading-none tracking-tight',
          s.value
        )}
      >
        <AnimatedNumber target={value} delay={delay + 0.1} />
      </div>

      <p className="mb-4 font-mono text-xs tracking-wide text-ink-400">
        {unit}
      </p>

      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide',
          s.delta
        )}
      >
        {deltaDir === 'up' ? '↑' : '↓'} {delta}
      </span>
    </motion.div>
  );
}
