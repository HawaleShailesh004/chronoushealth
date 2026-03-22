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
      severity: 'blue' as const,
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
      a.download = `chronoshealth-${patientId}.pdf`;
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
            <p className="text-[13px] font-mono text-ink-400">
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
            <p className="text-[13px] text-ink-500 mb-4">{error}</p>
            <code className="text-[11px] bg-ink-50 border border-ink-100 px-3 py-2 rounded-lg text-ink-400 block">
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
        <title>ChronosHealth — {timeline.patient_name}</title>
      </Head>

      <div className="min-h-screen bg-ink-50">
        <Navbar
          alertCount={alertData.alert_count}
          patientName={timeline.patient_name}
          role="patient"
        />

        <div className="max-w-[1200px] mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <div className="flex flex-col gap-5">
            <Card animate delay={0} className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-display font-700 text-[15px] flex-shrink-0">
                  {timeline.patient_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <h1 className="font-display text-[20px] font-700 text-ink-950 tracking-tight leading-none mb-1">
                    {timeline.patient_name}
                  </h1>
                  <p className="text-[11px] font-mono text-ink-400">
                    DOB {timeline.patient_dob} · {timeline.patient_gender} ·{' '}
                    {timeline.wearable_days} days monitored
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
                  {['Wearable', 'FHIR R4', 'Medications', 'RAG + AI'].map(
                    (t, i) => {
                      const colors = [
                        'bg-success-50 text-success-700 border-success-100',
                        'bg-blue-50 text-blue-600 border-blue-100',
                        'bg-warning-50 text-warning-700 border-warning-100',
                        'bg-purple-50 text-purple-700 border-purple-100',
                      ];
                      return (
                        <span
                          key={t}
                          className={cn(
                            'text-[9px] font-mono font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md border',
                            colors[i]
                          )}
                        >
                          {t}
                        </span>
                      );
                    }
                  )}
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {vitals.map((v) => (
                <VitalCard key={v.label} {...v} />
              ))}
            </div>

            <Card animate delay={0.15} className="p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="font-display text-[13px] font-600 text-ink-950 tracking-tight">
                  30-Day Health Timeline
                </h2>
                <div className="flex items-center gap-4 flex-wrap">
                  {[
                    { kind: 'dot' as const, color: 'bg-danger-500', label: 'Heart Rate' },
                    { kind: 'dot' as const, color: 'bg-blue-600', label: 'HRV' },
                    {
                      kind: 'zone' as const,
                      color: 'bg-danger-100 border border-danger-200',
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
                      <span className="text-[10px] font-mono text-ink-400 uppercase tracking-wide">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <Card key={section.title} animate delay={0.2} className="p-4">
                  <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.08em] text-ink-400 mb-3">
                    {section.title}
                  </p>
                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                    {section.items.length === 0 ? (
                      <p className="text-[12px] text-ink-400">None listed</p>
                    ) : (
                      section.items.map((item, i) => (
                        <div
                          key={i}
                          className={cn(
                            'px-3 py-2.5 rounded-xl border',
                            item.highlight
                              ? 'bg-warning-50 border-warning-100'
                              : 'bg-ink-50 border-ink-100'
                          )}
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[12px] font-semibold text-ink-900">
                              {item.primary}
                            </span>
                            {'badge' in item && item.badge && (
                              <span className="text-[9px] font-mono font-semibold uppercase px-1.5 py-0.5 bg-warning-100 text-warning-700 border border-warning-200 rounded">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-ink-400 mt-0.5">
                            {item.secondary}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <Card animate delay={0.25} className="p-4">
              <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.08em] text-ink-400 mb-3">
                Recent Lab Results
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {timeline.recent_labs.slice(0, 6).map((lab, i) => (
                  <div
                    key={i}
                    className="px-3 py-2.5 bg-ink-50 border border-ink-100 rounded-xl"
                  >
                    <p className="text-[10px] font-mono text-ink-400 mb-1">
                      {lab.date}
                    </p>
                    <p className="text-[11px] font-semibold text-ink-700 mb-1 leading-tight">
                      {lab.test}
                    </p>
                    <p className="font-mono text-[18px] font-medium text-ink-950 leading-none">
                      {lab.value}
                      <span className="text-[10px] text-ink-400 ml-1">
                        {lab.unit}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
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
