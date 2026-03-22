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
      <div className="bg-white border border-ink-200 rounded-2xl p-4 shadow-card">
        <div className="flex items-center gap-2 text-success-700">
          <span className="text-base">✓</span>
          <span className="text-sm font-semibold">
            All vitals within normal range
          </span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
      className="bg-white border border-ink-200 rounded-2xl shadow-card overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-ink-100">
        <div>
          <h3 className="text-[13px] font-semibold text-ink-950 font-display">
            Health Drift Detected
          </h3>
          <p className="text-[11px] text-ink-400 font-mono mt-0.5">
            {alerts.length} metric{alerts.length > 1 ? 's' : ''} outside baseline
          </p>
        </div>
        <SeverityBadge severity={overallSeverity} />
      </div>

      <div className="p-3 space-y-2">
        {alerts.map((alert, i) => (
          <motion.div
            key={alert.metric}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i + 0.25 }}
            className="flex items-center justify-between px-3 py-2.5 bg-ink-50 border border-ink-100 rounded-xl"
          >
            <div>
              <p className="text-[12px] font-semibold text-ink-900">
                {alert.metric_name}
              </p>
              <p className="text-[10px] text-ink-400 font-mono mt-0.5">
                Baseline: {alert.baseline_mean} {alert.unit}
              </p>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  'text-[15px] font-mono font-semibold leading-none',
                  alert.severity === 'HIGH' || alert.severity === 'EMERGENCY'
                    ? 'text-danger-600'
                    : 'text-warning-700'
                )}
              >
                {alert.direction_symbol}
                {alert.deviation_pct}%
              </p>
              <p className="text-[10px] text-ink-400 font-mono mt-1">
                {alert.current_value} {alert.unit}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={loading}
          className={cn(
            'w-full py-3 rounded-xl text-[13px] font-semibold font-display',
            'transition-all duration-200 flex items-center justify-center gap-2',
            loading
              ? 'bg-ink-100 text-ink-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue active:scale-[0.98]'
          )}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin w-4 h-4"
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
            <>
              <span className="text-sm">→</span>
              Ask ChronosHealth AI
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
