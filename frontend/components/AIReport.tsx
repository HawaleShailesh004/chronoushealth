import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { AnalysisResponse } from '@/lib/api';

interface Props {
  result: AnalysisResponse;
  onDownloadReport: () => void;
  reportLoading: boolean;
}

const riskCfg = {
  LOW: 'bg-success-50 text-success-700 border-success-100',
  MODERATE: 'bg-warning-50 text-warning-700 border-warning-100',
  HIGH: 'bg-danger-50 text-danger-700 border-danger-100',
  EMERGENCY: 'bg-danger-50 text-danger-700 border-danger-100',
} as const;

const sourceCfg: Record<string, string> = {
  wearable_timeline: 'bg-success-50 text-success-700 border-success-100',
  fhir_conditions: 'bg-blue-50 text-blue-700 border-blue-100',
  medication_log: 'bg-warning-50 text-warning-700 border-warning-100',
  lab_results: 'bg-ink-100 text-ink-600 border-ink-200',
};

export function AIReport({
  result,
  onDownloadReport,
  reportLoading,
}: Props) {
  const ai = result.ai_assessment;
  if (!ai) return null;

  const riskClass = riskCfg[ai.risk_level] ?? riskCfg.MODERATE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card"
    >
      <div className="flex items-start justify-between border-b border-ink-100 px-5 pb-4 pt-5">
        <div>
          <h3 className="font-display text-sm font-semibold tracking-[-0.01em] text-ink-950">
            AI Clinical Reasoning
          </h3>
          <p className="mt-1 font-mono text-[10px] tracking-wide text-ink-400">
            {ai.ai_model} · RAG · {ai.context_sources?.length ?? 0} sources
          </p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em]',
            riskClass
          )}
        >
          {ai.risk_level}
        </span>
      </div>

      <div className="space-y-5 p-5">
        <div className="border-l-[3px] border-blue-600 py-1 pl-4">
          <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-label text-blue-600">
            Primary cause
          </p>
          <p className="text-sm font-semibold leading-relaxed tracking-wide text-ink-950">
            {ai.primary_cause}
          </p>
        </div>

        <p className="text-sm leading-[1.7] tracking-wide text-ink-700">
          {ai.clinical_assessment}
        </p>

        <div>
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-label text-ink-400">
            Recommended actions
          </p>
          <div className="space-y-3">
            {(ai.recommendations ?? []).map((rec, i) => {
              const lower = rec.toLowerCase();
              const isUrgent =
                lower.includes('immediate') ||
                lower.includes('emergency') ||
                lower.includes('urgent');
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-3"
                >
                  <span
                    className={cn(
                      'mt-0.5 flex-shrink-0 text-xs font-bold',
                      isUrgent ? 'text-danger-600' : 'text-success-700'
                    )}
                  >
                    {isUrgent ? '⚠' : '✓'}
                  </span>
                  <span
                    className={cn(
                      'text-sm leading-relaxed tracking-wide',
                      isUrgent
                        ? 'font-medium text-danger-700'
                        : 'text-ink-700'
                    )}
                  >
                    {rec}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {ai.evidence_chain && ai.evidence_chain.length > 0 ? (
          <div>
            <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-label text-ink-400">
              Evidence chain
            </p>
            <div className="space-y-2.5">
              {ai.evidence_chain.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 rounded-lg border border-ink-100 bg-ink-50 px-4 py-3"
                >
                  <span
                    className={cn(
                      'mt-0.5 flex-shrink-0 rounded border px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide',
                      sourceCfg[item.source] ??
                        'border-ink-200 bg-ink-100 text-ink-600'
                    )}
                  >
                    {item.source_label}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-relaxed tracking-wide text-ink-900">
                      {item.finding}
                    </p>
                    <p className="mt-1 text-[10px] tracking-wide text-ink-400">
                      {item.relevance}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          (ai.context_sources?.length ?? 0) > 0 && (
            <div>
              <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-label text-ink-400">
                Context used
              </p>
              <div className="flex flex-wrap gap-2">
                {(ai.context_sources ?? []).map((src) => (
                  <span
                    key={src}
                    className="rounded-md border border-ink-100 bg-ink-50 px-2.5 py-1 font-mono text-[10px] tracking-wide text-ink-500"
                  >
                    {src}
                  </span>
                ))}
              </div>
            </div>
          )
        )}

        {ai.monitor_duration_days > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-warning-100 bg-warning-50 px-4 py-3">
            <span className="text-sm text-warning-700">⏱</span>
            <span className="font-mono text-xs tracking-wide text-warning-700">
              Monitor {ai.monitor_duration_days} day
              {ai.monitor_duration_days > 1 ? 's' : ''} before reassessing
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onDownloadReport}
          disabled={reportLoading}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold tracking-wide transition-all duration-150',
            reportLoading
              ? 'cursor-not-allowed border-ink-100 bg-ink-50 text-ink-400'
              : 'border-ink-200 bg-ink-50 text-ink-700 hover:border-ink-300 hover:bg-ink-100'
          )}
        >
          {reportLoading ? 'Generating…' : "📄 Generate Doctor's Report (PDF)"}
        </button>

        <p className="text-center text-[10px] italic tracking-wide text-ink-400">
          Decision support only. Not a substitute for clinical judgment.
        </p>
      </div>
    </motion.div>
  );
}
