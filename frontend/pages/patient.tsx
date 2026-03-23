import type { NextPage } from 'next';
import Head from 'next/head';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { VitalCard } from '@/components/VitalCard';
import { AlertCard } from '@/components/AlertCard';
import { AIReport } from '@/components/AIReport';
import { Card } from '@/components/ui/Card';
import {
  getTimeline,
  getAlerts,
  getCachedAnalysis,
  downloadReport,
  type PatientTimeline,
  type AlertsResponse,
  type AnalysisResponse,
  type WearableRecord,
} from '@/lib/api';
import { cn } from '@/lib/utils';

const HealthTimeline = dynamic(
  () => import('@/components/HealthTimeline'),
  { ssr: false }
);

function mean(vals: (number | null | undefined)[]) {
  const nums = vals.filter(
    (v): v is number => v != null && typeof v === 'number' && !Number.isNaN(v)
  );
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function pctAbsChange(baseline: number, current: number) {
  if (!baseline) return '0.0%';
  const p = ((current - baseline) / baseline) * 100;
  return `${Math.abs(p).toFixed(1)}%`;
}

function buildVitals(timeline: PatientTimeline) {
  const w = timeline.wearable_timeline;
  if (!w.length) return [];
  const nBase = Math.min(26, Math.max(1, w.length - 1));
  const baseline = w.slice(0, nBase);
  const cur = w[w.length - 1];

  const row = (key: keyof WearableRecord) => ({
    b: mean(baseline.map((r) => r[key] as number | null)),
    c: (cur[key] as number | null) ?? 0,
  });

  const hr = row('heart_rate_resting');
  const hrv = row('hrv');
  const sleep = row('sleep_efficiency');
  const spo2 = row('spo2');

  return [
    {
      label: 'Resting HR',
      value: hr.c,
      unit: 'beats / min',
      delta: pctAbsChange(hr.b, hr.c),
      deltaDir: hr.c >= hr.b ? ('up' as const) : ('down' as const),
      severity: hr.c > hr.b * 1.15 ? ('crit' as const) : ('ok' as const),
      delay: 0.05,
    },
    {
      label: 'HRV (RMSSD)',
      value: hrv.c,
      unit: 'milliseconds',
      delta: pctAbsChange(hrv.b, hrv.c),
      deltaDir: hrv.c >= hrv.b ? ('up' as const) : ('down' as const),
      severity: hrv.c < hrv.b * 0.9 ? ('warn' as const) : ('ok' as const),
      delay: 0.1,
    },
    {
      label: 'Sleep Quality',
      value: sleep.c,
      unit: '% efficiency',
      delta: pctAbsChange(sleep.b, sleep.c),
      deltaDir: sleep.c >= sleep.b ? ('up' as const) : ('down' as const),
      severity: sleep.c < sleep.b * 0.9 ? ('warn' as const) : ('ok' as const),
      delay: 0.15,
    },
    {
      label: 'SpO2',
      value: spo2.c,
      unit: '% oxygen sat.',
      delta: pctAbsChange(spo2.b, spo2.c),
      deltaDir: spo2.c >= spo2.b ? ('up' as const) : ('down' as const),
      severity: 'neutral' as const,
      delay: 0.2,
    },
  ];
}

const PatientDashboard: NextPage = () => {
  const router = useRouter();
  const patientId = router.isReady
    ? typeof router.query.id === 'string'
      ? router.query.id
      : 'sarah'
    : null;

  const [timeline, setTimeline] = useState<PatientTimeline | null>(null);
  const [alertData, setAlertData] = useState<AlertsResponse | null>(null);
  const [aiResult, setAiResult] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (pid: string) => {
    setLoading(true);
    setError(null);
    try {
      const [t, a] = await Promise.all([getTimeline(pid), getAlerts(pid)]);
      setTimeline(t);
      setAlertData(a);
    } catch {
      setError('Cannot reach backend. Start uvicorn on port 8000.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!patientId) return;
    loadData(patientId);
  }, [patientId, loadData]);

  const handleAnalyze = async () => {
    if (!patientId) return;
    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const result = await getCachedAnalysis(patientId);
      setAiResult(result);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!patientId) return;
    setReportLoading(true);
    try {
      const blob = await downloadReport(patientId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nadi-${patientId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } finally {
      setReportLoading(false);
    }
  };

  const vitals = useMemo(
    () => (timeline ? buildVitals(timeline) : []),
    [timeline]
  );

  if (!router.isReady) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center">
        <p className="text-ink-400 font-mono text-sm">Loading…</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-56px)]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center animate-pulse">
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden>
                <polyline
                  points="0,7 3,7 5,1 7,13 9,7 11,7 12.5,3.5 14,10.5 15.5,7 18,7"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="font-mono text-xs text-ink-400">
              Loading patient data…
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ink-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-56px)]">
          <Card className="max-w-sm w-full p-8 text-center mx-4">
            <p className="text-3xl mb-4">⚠️</p>
            <h2 className="font-display font-700 text-ink-950 mb-2">
              Connection Error
            </h2>
            <p className="mb-4 text-sm text-ink-500">{error}</p>
            <code className="block rounded-lg border border-ink-100 bg-ink-50 px-3 py-2 font-mono text-xs text-ink-400">
              uvicorn main:app --reload --port 8000
            </code>
          </Card>
        </div>
      </div>
    );
  }

  if (!timeline || !alertData) return null;

  return (
    <>
      <Head>
        <title>Nadi — {timeline.patient_name}</title>
      </Head>

      <div className="min-h-screen bg-ink-50">
        <Navbar
          alertCount={alertData.alert_count}
          patientName={timeline.patient_name}
          role="patient"
        />

        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 px-8 py-10 lg:grid-cols-[1fr_380px] lg:gap-10">
          <div className="flex flex-col gap-8">
            <Card animate delay={0} className="p-6">
              <div className="flex items-center gap-6">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 font-display text-sm font-700 text-white">
                  {timeline.patient_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <h1 className="mb-2 font-display text-lg font-700 leading-none tracking-[-0.02em] text-ink-950">
                    {timeline.patient_name}
                  </h1>
                  <p className="font-mono text-xs tracking-wide text-ink-400">
                    DOB {timeline.patient_dob} · {timeline.patient_gender} ·{' '}
                    {timeline.wearable_days} days monitored
                  </p>
                </div>
                <div className="ml-auto flex flex-wrap items-center justify-end gap-2.5">
                  {['Wearable', 'FHIR R4', 'Medications'].map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-ink-200 bg-ink-100 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-600"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
              {vitals.map((v) => (
                <VitalCard key={v.label} {...v} />
              ))}
            </div>

            <Card animate delay={0.15} className="p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <h2 className="font-display text-sm font-semibold tracking-[-0.01em] text-ink-950">
                  30-Day Health Timeline
                </h2>
                <div className="flex flex-wrap items-center gap-5">
                  {[
                    {
                      kind: 'dot' as const,
                      color: 'bg-danger-600',
                      label: 'Heart Rate',
                    },
                    { kind: 'dot' as const, color: 'bg-blue-600', label: 'HRV' },
                    {
                      kind: 'zone' as const,
                      color: 'border border-danger-100 bg-danger-50',
                      label: 'Normal zones',
                    },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div
                        className={cn(
                          l.kind === 'zone'
                            ? 'w-3 h-3 rounded-sm shrink-0'
                            : 'w-2 h-2 rounded-full shrink-0',
                          l.color
                        )}
                      />
                      <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-ink-400">
                        {l.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <HealthTimeline
                wearableTimeline={timeline.wearable_timeline}
                medicationEvents={timeline.medication_events}
                baselineStats={timeline.baseline_stats}
              />
            </Card>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {[
                {
                  title: 'Active Conditions',
                  items: timeline.active_conditions.map((c) => ({
                    primary: c.condition,
                    secondary: `Since ${c.onset_date}`,
                    highlight: false as const,
                  })),
                },
                {
                  title: 'Active Medications',
                  items: timeline.active_medications.map((m) => ({
                    primary: m.drug,
                    secondary: `${m.dose} · since ${m.start_date}`,
                    highlight: m.is_new,
                    badge: m.is_new ? ('New' as const) : undefined,
                  })),
                },
              ].map((section) => (
                <Card key={section.title} animate delay={0.2} className="p-6">
                  <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-label text-ink-400">
                    {section.title}
                  </p>
                  <div className="max-h-[280px] space-y-3 overflow-y-auto pr-1">
                    {section.items.length === 0 ? (
                      <p className="text-sm leading-relaxed tracking-wide text-ink-400">
                        None listed
                      </p>
                    ) : (
                      section.items.map((item, i) => (
                        <div
                          key={i}
                          className={cn(
                            'rounded-xl border px-4 py-3.5',
                            item.highlight
                              ? 'bg-warning-50 border-warning-100'
                              : 'bg-ink-50 border-ink-100'
                          )}
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold tracking-wide text-ink-900">
                              {item.primary}
                            </span>
                            {'badge' in item && item.badge && (
                              <span className="rounded border border-warning-100 bg-warning-50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-warning-700">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 font-mono text-[10px] tracking-wide text-ink-400">
                            {item.secondary}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <Card animate delay={0.25} className="p-6">
              <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-label text-ink-400">
                Recent Lab Results
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {timeline.recent_labs.slice(0, 6).map((lab, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-ink-100 bg-ink-50 px-4 py-3.5"
                  >
                    <p className="mb-1.5 font-mono text-[10px] tracking-wide text-ink-400">
                      {lab.date}
                    </p>
                    <p className="mb-2 text-xs font-semibold leading-snug tracking-wide text-ink-700">
                      {lab.test}
                    </p>
                    <p className="font-mono text-lg font-medium leading-none text-ink-950">
                      {lab.value}
                      <span className="ml-1 font-mono text-[10px] text-ink-400">
                        {lab.unit}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <AlertCard
              alerts={alertData.alerts}
              overallSeverity={alertData.overall_severity}
              onAnalyze={handleAnalyze}
              loading={analyzing}
            />

            <AnimatePresence>
              {aiResult?.ai_assessment && (
                <AIReport
                  result={aiResult}
                  onDownloadReport={handleDownloadReport}
                  reportLoading={reportLoading}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientDashboard;
