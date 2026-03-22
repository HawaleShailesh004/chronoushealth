import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { AnalysisResponse } from '@/lib/api';

interface Props {
  result: AnalysisResponse;
  onDownloadReport: () => void;
  reportLoading: boolean;
}

const riskConfig = {
  LOW: {
    label: 'Low Risk',
    cls: 'bg-success-50 text-success-700 border-success-100',
  },
  MODERATE: {
    label: 'Moderate Risk',
    cls: 'bg-warning-50 text-warning-700 border-warning-100',
  },
  HIGH: {
    label: 'High Risk',
    cls: 'bg-danger-50 text-danger-700 border-danger-100',
  },
  EMERGENCY: {
    label: 'Emergency',
    cls: 'bg-danger-50 text-danger-700 border-danger-100',
  },
};

export function AIReport({
  result,
  onDownloadReport,
  reportLoading,
}: Props) {
  const ai = result.ai_assessment;
  if (!ai) return null;

  const risk = riskConfig[ai.risk_level] ?? riskConfig.MODERATE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      }}
      className="bg-white border border-ink-200 rounded-2xl shadow-card overflow-hidden"
    >
      <div className="px-4 pt-4 pb-3 bg-gradient-to-r from-blue-50 to-white border-b border-ink-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[13px] font-semibold text-ink-950 font-display">
              AI Clinical Reasoning
            </h3>
            <p className="text-[10px] text-ink-400 font-mono mt-0.5">
              {ai.ai_model} · RAG · {ai.context_sources?.length ?? 0} sources
            </p>
          </div>
          <span
            className={cn(
              'text-[10px] font-mono font-semibold uppercase tracking-wider',
              'px-2.5 py-1 rounded-full border shrink-0',
              risk.cls
            )}
          >
            {risk.label}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="pl-3 border-l-[3px] border-blue-600 bg-blue-50 rounded-r-xl py-2.5 pr-3">
          <p className="text-[9px] font-mono font-semibold uppercase tracking-[0.1em] text-blue-600 mb-1">
            Most Likely Cause
          </p>
          <p className="text-[12px] font-semibold text-ink-950 leading-snug">
            {ai.primary_cause}
          </p>
        </div>

        <p className="text-[12px] text-ink-600 leading-relaxed">
          {ai.clinical_assessment}
        </p>

        <div>
          <p className="text-[9px] font-mono font-semibold uppercase tracking-[0.1em] text-ink-400 mb-2.5">
            Recommended Actions
          </p>
          <div className="space-y-2">
            {(ai.recommendations ?? []).map((rec, i) => {
              const lower = rec.toLowerCase();
              const isWarning =
                lower.includes('emergency') ||
                lower.includes('immediate') ||
                lower.includes('urgent');
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-2.5"
                >
                  <span
                    className={cn(
                      'flex-shrink-0 text-[11px] mt-0.5 font-bold',
                      isWarning ? 'text-danger-600' : 'text-success-600'
                    )}
                  >
                    {isWarning ? '⚠' : '✓'}
                  </span>
                  <span
                    className={cn(
                      'text-[12px] leading-snug',
                      isWarning
                        ? 'text-danger-700 font-medium'
                        : 'text-ink-600'
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
            <p className="text-[9px] font-mono font-semibold uppercase tracking-[0.1em] text-ink-400 mb-2.5">
              Evidence chain
            </p>
            <div className="space-y-2">
              {ai.evidence_chain.map((item, i) => {
                const sourceColors: Record<string, string> = {
                  wearable_timeline:
                    'bg-success-50 text-success-700 border-success-100',
                  fhir_conditions:
                    'bg-blue-50 text-blue-700 border-blue-100',
                  medication_log:
                    'bg-warning-50 text-warning-700 border-warning-100',
                  lab_results:
                    'bg-purple-50 text-purple-700 border-purple-100',
                };
                const colorCls =
                  sourceColors[item.source] ??
                  'bg-ink-50 text-ink-500 border-ink-100';

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-2.5 px-3 py-2 bg-ink-50 border border-ink-100 rounded-lg"
                  >
                    <span
                      className={cn(
                        'flex-shrink-0 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border mt-0.5',
                        colorCls
                      )}
                    >
                      {item.source_label}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-ink-900 leading-snug">
                        {item.finding}
                      </p>
                      <p className="text-[10px] text-ink-400 mt-0.5 leading-snug">
                        {item.relevance}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-[9px] font-mono font-semibold uppercase tracking-[0.1em] text-ink-400 mb-2">
              Context used
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(ai.context_sources ?? []).map((src) => (
                <span
                  key={src}
                  className="text-[9px] font-mono px-2 py-0.5 bg-ink-50 border border-ink-100 text-ink-400 rounded-md"
                >
                  {src}
                </span>
              ))}
            </div>
          </div>
        )}

        {ai.monitor_duration_days > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-warning-50 border border-warning-100 rounded-xl">
            <span className="text-warning-600 text-sm">⏱</span>
            <span className="text-[11px] font-mono text-warning-700">
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
            'w-full py-2.5 rounded-xl text-[12px] font-semibold font-display',
            'border transition-all duration-150 flex items-center justify-center gap-2',
            reportLoading
              ? 'border-ink-100 bg-ink-50 text-ink-400 cursor-not-allowed'
              : 'border-ink-200 bg-ink-50 text-ink-700 hover:bg-ink-100 hover:border-ink-300'
          )}
        >
          {reportLoading ? 'Generating…' : "📄 Generate Doctor's Report (PDF)"}
        </button>

        <p className="text-[10px] text-ink-300 text-center italic">
          Decision support only. Not a substitute for clinical judgment.
        </p>
      </div>
    </motion.div>
  );
}
