import { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  value: number;
  unit: string;
  delta: string;
  deltaDir: 'up' | 'down';
  severity: 'crit' | 'warn' | 'ok' | 'blue';
  delay?: number;
}

const severityConfig = {
  crit: {
    value: 'text-danger-600',
    bar: 'bg-danger-500',
    delta: 'bg-danger-50 text-danger-700 border-danger-100',
  },
  warn: {
    value: 'text-warning-700',
    bar: 'bg-warning-500',
    delta: 'bg-warning-50 text-warning-700 border-warning-100',
  },
  ok: {
    value: 'text-success-700',
    bar: 'bg-success-500',
    delta: 'bg-success-50 text-success-700 border-success-100',
  },
  blue: {
    value: 'text-blue-600',
    bar: 'bg-blue-500',
    delta: 'bg-blue-50 text-blue-700 border-blue-100',
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
      duration: 1.2,
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
  const cfg = severityConfig[severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      }}
      className="relative bg-white border border-ink-200 rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-shadow overflow-hidden"
    >
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 h-[3px] rounded-b-2xl',
          cfg.bar
        )}
      />

      <p className="text-[10px] font-mono font-medium uppercase tracking-[0.08em] text-ink-400 mb-2">
        {label}
      </p>

      <div
        className={cn(
          'text-[30px] font-mono font-medium leading-none mb-1',
          cfg.value
        )}
      >
        <AnimatedNumber target={value} delay={delay + 0.1} />
      </div>

      <p className="text-[10px] font-mono text-ink-400 mb-3">{unit}</p>

      <span
        className={cn(
          'inline-flex items-center gap-1 text-[9px] font-mono font-semibold',
          'px-2 py-0.5 rounded-md border uppercase tracking-wide',
          cfg.delta
        )}
      >
        {deltaDir === 'up' ? '↑' : '↓'} {delta}
      </span>
    </motion.div>
  );
}
