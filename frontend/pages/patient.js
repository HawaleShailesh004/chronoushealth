import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  downloadReport,
  getAlerts,
  getCachedAnalysis,
  getTimeline,
} from '../lib/api';
import AlertCard from '../components/AlertCard';
import AIReport from '../components/AIReport';

const HealthTimeline = dynamic(() => import('../components/HealthTimeline'), {
  ssr: false,
});

export default function PatientDashboard() {
  const router = useRouter();
  const id = router.isReady
    ? typeof router.query.id === 'string'
      ? router.query.id
      : 'sarah'
    : null;

  const [timeline, setTimeline] = useState(null);
  const [alertData, setAlertData] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    loadData(id);
  }, [id]);

  async function loadData(patientId) {
    setLoading(true);
    setError(null);
    try {
      const [t, a] = await Promise.all([
        getTimeline(patientId),
        getAlerts(patientId),
      ]);
      setTimeline(t);
      setAlertData(a);
    } catch (err) {
      setError('Backend not reachable. Start uvicorn on port 8000.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze() {
    if (!id) return;
    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const result = await getCachedAnalysis(id);
      setAiResult(result);
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleDownloadReport() {
    if (!id) return;
    setReportLoading(true);
    try {
      const blob = await downloadReport(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chronoshealth-report-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Report download failed:', err);
      alert('Report generation failed. Check that uvicorn is running.');
    } finally {
      setReportLoading(false);
    }
  }

  if (!router.isReady || loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;
  if (!timeline) return null;

  const severityCount = alertData?.alert_count || 0;
  const activeConditions = timeline.active_conditions || [];
  const activeMedications = timeline.active_medications || [];
  const recentLabs = timeline.recent_labs || [];

  return (
    <>
      <Head>
        <title>ChronosHealth — {timeline.patient_name}</title>
      </Head>

      <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
        <nav
          style={{
            background: '#0F4C81',
            padding: '0 24px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') router.push('/');
            }}
            style={{
              color: '#FFFFFF',
              fontWeight: '800',
              fontSize: '18px',
              cursor: 'pointer',
            }}
            onClick={() => router.push('/')}
          >
            ⏱ ChronosHealth
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {severityCount > 0 && (
              <span
                style={{
                  background: '#EF4444',
                  color: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '3px 12px',
                  fontSize: '13px',
                  fontWeight: '700',
                }}
              >
                🔴 {severityCount} Alert{severityCount > 1 ? 's' : ''}
              </span>
            )}
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
              {timeline.patient_name}
            </span>
          </div>
        </nav>

        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '24px 24px',
            display: 'grid',
            gridTemplateColumns: '1fr minmax(280px, 380px)',
            gap: '24px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <h1 style={{ fontSize: '22px', fontWeight: '800' }}>
                    {timeline.patient_name}
                  </h1>
                  <p
                    style={{
                      color: '#64748B',
                      fontSize: '14px',
                      marginTop: '4px',
                    }}
                  >
                    DOB: {timeline.patient_dob} · {timeline.patient_gender} ·{' '}
                    {timeline.wearable_days} days of wearable data
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '12px', color: '#94A3B8' }}>Data Sources</p>
                  <div
                    style={{
                      display: 'flex',
                      gap: '6px',
                      marginTop: '4px',
                      flexWrap: 'wrap',
                      justifyContent: 'flex-end',
                    }}
                  >
                    {['Wearable', 'FHIR', 'Medications'].map((s) => (
                      <span
                        key={s}
                        style={{
                          background: '#EFF6FF',
                          color: '#1D4ED8',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '600',
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  marginBottom: '20px',
                }}
              >
                Health Timeline — Last 30 Days
              </h2>
              <HealthTimeline
                wearableTimeline={timeline.wearable_timeline}
                medicationEvents={timeline.medication_events}
                clinicalEvents={timeline.clinical_events}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
              }}
            >
              <InfoCard
                title="Active Conditions"
                items={activeConditions.map((c) => ({
                  label: c.condition,
                  sub: `Since ${c.onset_date}`,
                }))}
                emptyLabel="No active conditions"
                icon="📋"
              />
              <InfoCard
                title="Active Medications"
                items={activeMedications.map((m) => ({
                  label: m.drug,
                  sub: `${m.dose} · Since ${m.start_date}`,
                  highlight: m.is_new,
                }))}
                emptyLabel="No active medications"
                icon="💊"
              />
            </div>

            <div className="card">
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: '700',
                  marginBottom: '14px',
                }}
              >
                🧪 Recent Lab Results
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '10px',
                }}
              >
                {recentLabs.slice(0, 6).map((lab, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '10px 12px',
                    }}
                  >
                    <p style={{ fontSize: '11px', color: '#94A3B8' }}>{lab.date}</p>
                    <p
                      style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        marginTop: '2px',
                      }}
                    >
                      {lab.test}
                    </p>
                    <p
                      style={{
                        fontSize: '16px',
                        fontWeight: '800',
                        color: '#0F4C81',
                      }}
                    >
                      {lab.value}{' '}
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '400',
                          color: '#64748B',
                        }}
                      >
                        {lab.unit}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <AlertCard
              alerts={alertData?.alerts || []}
              overallSeverity={alertData?.overall_severity || 'NONE'}
              onAnalyze={handleAnalyze}
              loading={analyzing}
            />
            {aiResult && (
              <AIReport
                result={aiResult}
                onDownloadReport={handleDownloadReport}
                reportLoading={reportLoading}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function InfoCard({ title, items, emptyLabel, icon }) {
  return (
    <div className="card">
      <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>
        {icon} {title}
      </h3>
      {items.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#94A3B8' }}>{emptyLabel}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                padding: '8px 10px',
                background: item.highlight ? '#FEF3C7' : '#F8FAFC',
                border: `1px solid ${item.highlight ? '#FDE68A' : '#E2E8F0'}`,
                borderRadius: '8px',
              }}
            >
              <p style={{ fontSize: '13px', fontWeight: '600' }}>
                {item.label}
                {item.highlight && (
                  <span
                    style={{
                      marginLeft: '6px',
                      fontSize: '10px',
                      background: '#D97706',
                      color: '#FFF',
                      padding: '1px 6px',
                      borderRadius: '8px',
                    }}
                  >
                    NEW
                  </span>
                )}
              </p>
              <p
                style={{
                  fontSize: '11px',
                  color: '#94A3B8',
                  marginTop: '2px',
                }}
              >
                {item.sub}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        background: '#F8FAFC',
      }}
    >
      <div style={{ fontSize: '32px', animation: 'pulse 1.5s infinite' }}>⏱</div>
      <p style={{ color: '#64748B', fontSize: '16px' }}>
        Loading patient data<span className="loading-dots" />
      </p>
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div className="card" style={{ maxWidth: '400px', textAlign: 'center' }}>
        <p style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</p>
        <h2 style={{ marginBottom: '8px' }}>Connection Error</h2>
        <p style={{ color: '#64748B', fontSize: '14px' }}>{message}</p>
        <p style={{ color: '#94A3B8', fontSize: '12px', marginTop: '12px' }}>
          Run: <code>uvicorn main:app --reload --port 8000</code>
        </p>
      </div>
    </div>
  );
}
