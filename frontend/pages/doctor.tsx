import type { NextPage } from 'next';
import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/ui/Card';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import {
  getAlerts,
  getCachedAnalysis,
  type AlertsResponse,
  type AnalysisResponse,
} from '@/lib/api';
import { cn } from '@/lib/utils';

interface DemoPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  alertData?: AlertsResponse;
}

const DEMO_PATIENTS: DemoPatient[] = [
  { id: 'sarah', name: 'Sarah Mitchell', age: 42, gender: 'F' },
  { id: 'james', name: 'James Kowalski', age: 67, gender: 'M' },
  { id: 'priya', name: 'Priya Lakshmanan', age: 55, gender: 'F' },
  { id: 'marcus', name: 'Marcus Webb', age: 38, gender: 'M' },
];

const SEVERITY_SORT: Record<string, number> = {
  EMERGENCY: 0,
  HIGH: 1,
  MODERATE: 2,
  LOW: 3,
  NONE: 4,
};

const ROSTER_ORDER = DEMO_PATIENTS.map((p) => p.id);

function riskLevelStatStyle(severity: string) {
  switch (severity) {
    case 'EMERGENCY':
      return {
        color: 'text-danger-700',
        attention: 'emergency' as const,
      };
    case 'HIGH':
      return {
        color: 'text-danger-600',
        attention: 'high' as const,
      };
    case 'MODERATE':
      return { color: 'text-warning-700', attention: undefined };
    case 'LOW':
      return { color: 'text-blue-700', attention: undefined };
    default:
      return { color: 'text-success-700', attention: undefined };
  }
}

const DoctorDashboard: NextPage = () => {
  const router = useRouter();
  const [patients, setPatients] = useState<DemoPatient[]>(DEMO_PATIENTS);
  const [selected, setSelected] = useState<
    (DemoPatient & { brief?: AnalysisResponse }) | null
  >(null);
  const [loadingBrief, setLoadingBrief] = useState(false);

  const selectPatient = useCallback(async (patient: DemoPatient) => {
    setSelected({ ...patient, brief: undefined });
    setLoadingBrief(true);
    try {
      const brief = await getCachedAnalysis(patient.id);
      setSelected({ ...patient, brief });
    } catch {
      setSelected({ ...patient, brief: undefined });
    } finally {
      setLoadingBrief(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const results = await Promise.all(
        DEMO_PATIENTS.map(async (p) => {
          try {
            const alertData = await getAlerts(p.id);
            return { ...p, alertData };
          } catch {
            return {
              ...p,
              alertData: {
                patient_id: p.id,
                patient_name: p.name,
                overall_severity: 'NONE' as const,
                alert_count: 0,
                alerts: [],
              },
            };
          }
        })
      );
      if (cancelled) return;
      const sorted = [...results].sort((a, b) => {
        const sevA = SEVERITY_SORT[a.alertData?.overall_severity ?? 'NONE'] ?? 4;
        const sevB = SEVERITY_SORT[b.alertData?.overall_severity ?? 'NONE'] ?? 4;
        if (sevA !== sevB) return sevA - sevB;
        const cA = a.alertData?.alert_count ?? 0;
        const cB = b.alertData?.alert_count ?? 0;
        if (cA !== cB) return cB - cA;
        return ROSTER_ORDER.indexOf(a.id) - ROSTER_ORDER.indexOf(b.id);
      });
      setPatients(sorted);
      if (sorted[0]) await selectPatient(sorted[0]);
    })();
    return () => {
      cancelled = true;
    };
  }, [selectPatient]);

  return (
    <>
      <Head>
        <title>ChronosHealth — Physician Panel</title>
      </Head>

      <div className="min-h-screen bg-ink-50">
        <Navbar role="doctor" />

        <div className="max-w-[1200px] mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-[minmax(240px,280px)_1fr] gap-6 min-h-[calc(100vh-56px)]">
          <div>
            <div className="flex items-center justify-between mb-3 px-1 gap-2">
              <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.08em] text-ink-400">
                Patient Roster
              </p>
              <span className="text-[9px] font-mono text-ink-300 whitespace-nowrap">
                sorted by risk
              </span>
            </div>
            <div className="space-y-2">
              {patients.map((p, i) => (
                <motion.button
                  key={p.id}
                  type="button"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.3 }}
                  onClick={() => selectPatient(p)}
                  className={cn(
                    'w-full text-left px-3.5 py-3 rounded-xl border transition-all duration-150',
                    'flex items-center justify-between gap-2',
                    selected?.id === p.id
                      ? 'bg-blue-50 border-blue-100 shadow-sm'
                      : 'bg-white border-ink-200 hover:border-ink-300 hover:shadow-sm'
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink-950 font-display truncate">
                      {p.name}
                    </p>
                    <p className="text-[10px] font-mono text-ink-400 mt-0.5">
                      {p.age}
                      {p.gender} · {p.alertData?.alert_count ?? 0} alert
                      {(p.alertData?.alert_count ?? 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {p.alertData && (
                    <SeverityBadge severity={p.alertData.overall_severity} />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-5"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="font-display text-[24px] font-800 text-ink-950 tracking-tight leading-none mb-1">
                      Pre-Appointment Brief
                    </h1>
                    <p className="text-[12px] font-mono text-ink-400">
                      {selected.name} · {selected.age}
                      {selected.gender} · Today
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push(`/patient?id=${selected.id}`)}
                    className="px-4 py-2 bg-blue-600 text-white text-[12px] font-semibold font-display rounded-xl hover:bg-blue-700 transition-colors hover:shadow-blue shrink-0"
                  >
                    Full Dashboard →
                  </button>
                </div>

                {selected.alertData && (() => {
                  const ad = selected.alertData;
                  const risk = riskLevelStatStyle(ad.overall_severity);
                  const briefStats: {
                    label: string;
                    value: string;
                    color: string;
                    attention?: 'high' | 'emergency';
                  }[] = [
                    {
                      label: 'Alerts Detected',
                      value: String(ad.alert_count),
                      color:
                        ad.alert_count > 0
                          ? 'text-danger-600'
                          : 'text-success-600',
                    },
                    {
                      label: 'Risk Level',
                      value: ad.overall_severity,
                      color: risk.color,
                      ...(risk.attention ? { attention: risk.attention } : {}),
                    },
                    {
                      label: 'Data Sources',
                      value: '3',
                      color: 'text-blue-600',
                    },
                  ];
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {briefStats.map((stat) => (
                        <Card key={stat.label} className="p-4 text-center">
                          {stat.attention ? (
                            <motion.p
                              className={cn(
                                'font-mono text-[20px] font-semibold leading-none mb-1 tracking-tight',
                                stat.color
                              )}
                              animate={
                                stat.attention === 'emergency'
                                  ? {
                                      opacity: [1, 0.55, 1],
                                      scale: [1, 1.06, 1],
                                    }
                                  : {
                                      opacity: [1, 0.72, 1],
                                      scale: [1, 1.035, 1],
                                    }
                              }
                              transition={{
                                duration:
                                  stat.attention === 'emergency' ? 1.1 : 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                            >
                              {stat.value}
                            </motion.p>
                          ) : (
                            <p
                              className={cn(
                                'font-mono text-[20px] font-medium leading-none mb-1',
                                stat.color
                              )}
                            >
                              {stat.value}
                            </p>
                          )}
                          <p className="text-[10px] font-mono text-ink-400 uppercase tracking-wide">
                            {stat.label}
                          </p>
                        </Card>
                      ))}
                    </div>
                  );
                })()}

                {loadingBrief ? (
                  <Card className="p-6 flex items-center justify-center h-32">
                    <div className="flex items-center gap-3 text-ink-400">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[13px] font-mono">
                        Loading clinical brief…
                      </span>
                    </div>
                  </Card>
                ) : selected.brief?.ai_assessment ? (
                  <Card animate delay={0.1} className="p-5 border-l-[4px] border-l-blue-600">
                    <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.1em] text-blue-600 mb-3">
                      AI Pre-Appointment Brief
                    </p>
                    <p className="text-[14px] text-ink-600 leading-[1.72]">
                      {selected.brief.ai_assessment.clinical_assessment}
                    </p>
                  </Card>
                ) : (
                  <Card className="p-6 text-center">
                    <p className="text-[13px] text-ink-400 font-mono">
                      No brief available for this patient
                    </p>
                  </Card>
                )}

                {selected.brief?.ai_assessment?.recommendations && (
                  <Card animate delay={0.15} className="p-5">
                    <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.08em] text-ink-400 mb-4">
                      Suggested Discussion Points
                    </p>
                    <div className="divide-y divide-ink-100">
                      {selected.brief.ai_assessment.recommendations.map(
                        (rec, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.08 }}
                            className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                          >
                            <span className="font-mono text-[12px] font-bold text-blue-600 flex-shrink-0 mt-0.5">
                              →
                            </span>
                            <span className="text-[13px] text-ink-600 leading-snug">
                              {rec}
                            </span>
                          </motion.div>
                        )
                      )}
                    </div>
                  </Card>
                )}
              </motion.div>
            ) : (
              <div className="flex items-center justify-center min-h-[200px]">
                <p className="text-[13px] font-mono text-ink-400">
                  Select a patient to view their brief
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default DoctorDashboard;
