import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getAlerts, getCachedAnalysis, SEVERITY_CONFIG } from '../lib/api';

const DEMO_PATIENTS = [
  { id: 'sarah', name: 'Sarah M.', age: 42, gender: 'F' },
];

export default function DoctorDashboard() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllPatients();
  }, []);

  async function loadAllPatients() {
    setLoading(true);
    const results = await Promise.all(
      DEMO_PATIENTS.map(async (p) => {
        try {
          const alertData = await getAlerts(p.id);
          return { ...p, alertData };
        } catch {
          return {
            ...p,
            alertData: {
              overall_severity: 'NONE',
              alert_count: 0,
              alerts: [],
            },
          };
        }
      })
    );
    setPatients(results);
    if (results.length > 0) {
      await selectPatient(results[0]);
    }
    setLoading(false);
  }

  async function selectPatient(patient) {
    setSelected(patient);
    setBrief(null);
    try {
      const result = await getCachedAnalysis(patient.id);
      setBrief(result);
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', color: '#64748B' }}>Loading patients...</div>
    );
  }

  return (
    <>
      <Head>
        <title>ChronosHealth — Physician View</title>
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
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
            Dr. Patel — Physician Panel
          </span>
        </nav>

        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: 'minmax(260px, 320px) 1fr',
            gap: '24px',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '16px',
                fontWeight: '700',
                marginBottom: '14px',
              }}
            >
              Patient Panel
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {patients.map((p) => {
                const sev = p.alertData?.overall_severity || 'NONE';
                const config = SEVERITY_CONFIG[sev] || SEVERITY_CONFIG.NONE;
                const isSelected = selected?.id === p.id;
                return (
                  <div
                    key={p.id}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') selectPatient(p);
                    }}
                    onClick={() => selectPatient(p)}
                    style={{
                      padding: '14px 16px',
                      background: isSelected ? '#EFF6FF' : '#FFFFFF',
                      border: isSelected
                        ? '2px solid #0F4C81'
                        : '1px solid #E2E8F0',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '14px' }}>
                        {p.name}, {p.age}
                        {p.gender}
                      </p>
                      <p
                        style={{
                          fontSize: '12px',
                          color: '#64748B',
                          marginTop: '3px',
                        }}
                      >
                        {p.alertData?.alert_count || 0} alert
                        {p.alertData?.alert_count !== 1 ? 's' : ''} detected
                      </p>
                    </div>
                    <span
                      className="badge"
                      style={{
                        background: config.bg,
                        color: config.color,
                        fontSize: '11px',
                      }}
                    >
                      ● {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h2
              style={{
                fontSize: '16px',
                fontWeight: '700',
                marginBottom: '14px',
              }}
            >
              Pre-Appointment Brief
            </h2>
            {selected && brief ? (
              <div className="card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                  }}
                >
                  <h3 style={{ fontWeight: '700' }}>{selected.name}</h3>
                  <button
                    type="button"
                    onClick={() => router.push(`/patient?id=${selected.id}`)}
                    style={{
                      background: '#0F4C81',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    Full Dashboard →
                  </button>
                </div>

                <div
                  style={{
                    background: '#F0F9FF',
                    border: '1px solid #BAE6FD',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    marginBottom: '16px',
                  }}
                >
                  <p
                    style={{
                      fontSize: '11px',
                      color: '#0369A1',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '6px',
                    }}
                  >
                    AI Pre-Appointment Brief
                  </p>
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#0C4A6E',
                      lineHeight: '1.6',
                    }}
                  >
                    {brief?.ai_assessment?.clinical_assessment}
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#64748B',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}
                  >
                    Suggested Discussion Points
                  </p>
                  {(brief?.ai_assessment?.recommendations || []).map((rec, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        gap: '8px',
                        marginBottom: '6px',
                      }}
                    >
                      <span style={{ color: '#0F4C81', fontWeight: '700' }}>
                        →
                      </span>
                      <p style={{ fontSize: '13px', color: '#334155' }}>{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                className="card"
                style={{ color: '#64748B', textAlign: 'center', padding: '40px' }}
              >
                Select a patient to view their pre-appointment brief
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
