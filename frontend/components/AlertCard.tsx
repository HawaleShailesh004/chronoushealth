import { motion } from 'framer-motion';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { cn } from '@/lib/utils';
import type { DriftAlert, AlertsResponse } from '@/lib/api';

interface Props {
  alerts: DriftAlert[];
  overallSeverity: AlertsResponse['overall_severity'];
  onAnalyze: () => void;
  loading: boolean;
}

export function AlertCard({
  alerts,
  overallSeverity,
  onAnalyze,
  loading,
}: Props) {
  if (!alerts.length) {
    return (
      <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-success-700">✓</span>
          <span className="text-sm font-semibold leading-relaxed tracking-wide text-ink-700">
            All vitals within normal range
          </span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card"
    >
      <div className="flex items-center justify-between border-b border-ink-100 px-4 pb-3 pt-4">
        <div>
          <h3 className="font-display text-sm font-semibold text-ink-950">
            Health Drift Detected
          </h3>
          <p className="mt-0.5 font-mono text-xs text-ink-400">
            {alerts.length} metric{alerts.length > 1 ? 's' : ''} outside
            baseline
          </p>
        </div>
        <SeverityBadge severity={overallSeverity} />
      </div>

      <div className="space-y-3 p-4">
        {alerts.map((alert, i) => (
          <motion.div
            key={alert.metric}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 * i + 0.2 }}
            className="flex items-center justify-between rounded-xl border border-ink-100 bg-ink-50 px-4 py-3.5"
          >
            <div>
              <p className="text-sm font-semibold tracking-wide text-ink-900">
                {alert.metric_name}
              </p>
              <p className="mt-1 font-mono text-[10px] tracking-wide text-ink-400">
                Baseline: {alert.baseline_mean} {alert.unit}
              </p>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  'font-mono text-[15px] font-semibold leading-none tracking-tight',
                  alert.severity === 'HIGH' || alert.severity === 'EMERGENCY'
                    ? 'text-danger-600'
                    : 'text-warning-700'
                )}
              >
                {alert.direction_symbol}
                {alert.deviation_pct}%
              </p>
              <p className="mt-1.5 font-mono text-[10px] tracking-wide text-ink-400">
                {alert.current_value} {alert.unit}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={loading}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200',
            loading
              ? 'cursor-not-allowed bg-ink-100 text-ink-400'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue active:scale-[0.98]'
          )}
        >
          {loading ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Analyzing all health data…
            </>
          ) : (
            'Ask Nadi AI →'
          )}
        </button>
      </div>
    </motion.div>
  );
}
