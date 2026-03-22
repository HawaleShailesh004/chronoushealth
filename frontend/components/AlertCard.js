import { SEVERITY_CONFIG } from '../lib/api';

export default function AlertCard({ alerts, overallSeverity, onAnalyze, loading }) {
  const config = SEVERITY_CONFIG[overallSeverity] || SEVERITY_CONFIG.NONE;

  if (!alerts || alerts.length === 0) {
    return (
      <div className="card" style={{ borderLeft: '4px solid #10B981' }}>
        <p style={{ color: '#10B981', fontWeight: '600' }}>
          ✓ All vitals within normal range
        </p>
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        borderLeft: `4px solid ${config.color}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
            🔴 Health Drift Detected
          </h3>
          <p style={{ fontSize: '13px', color: '#64748B' }}>
            {alerts.length} metric{alerts.length > 1 ? 's' : ''} outside normal range
          </p>
        </div>
        <span
          className="badge"
          style={{
            background: config.bg,
            color: config.color,
            fontSize: '14px',
          }}
        >
          ● {config.label}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {alerts.map((alert, i) => (
          <AlertRow key={i} alert={alert} />
        ))}
      </div>

      <button
        type="button"
        onClick={onAnalyze}
        disabled={loading}
        style={{
          marginTop: '20px',
          width: '100%',
          padding: '12px',
          background: loading ? '#94A3B8' : '#0F4C81',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '10px',
          fontSize: '15px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {loading ? (
          <>
            <span
              style={{
                animation: 'spin 1s linear infinite',
                display: 'inline-block',
              }}
            >
              ⟳
            </span>
            Analyzing all health data
            <span className="loading-dots" />
          </>
        ) : (
          '🤖 Ask ChronosHealth AI'
        )}
      </button>
    </div>
  );
}

function AlertRow({ alert }) {
  const severityColor =
    {
      MODERATE: '#D97706',
      HIGH: '#DC2626',
      EMERGENCY: '#7C3AED',
      LOW: '#059669',
    }[alert.severity] || '#64748B';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 14px',
        background: '#F8FAFC',
        borderRadius: '8px',
        border: '1px solid #E2E8F0',
      }}
    >
      <div>
        <p style={{ fontSize: '14px', fontWeight: '600' }}>{alert.metric_name}</p>
        <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
          Baseline: {alert.baseline_mean} {alert.unit}
        </p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p
          style={{
            fontSize: '18px',
            fontWeight: '700',
            color: severityColor,
          }}
        >
          {alert.direction_symbol}
          {alert.deviation_pct}%
        </p>
        <p style={{ fontSize: '13px', color: '#64748B' }}>
          {alert.current_value} {alert.unit}
        </p>
      </div>
      <span
        className="badge"
        style={{
          background: `${severityColor}18`,
          color: severityColor,
          fontSize: '11px',
        }}
      >
        {alert.severity}
      </span>
    </div>
  );
}
