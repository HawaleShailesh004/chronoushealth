import { SEVERITY_CONFIG } from '../lib/api';

export default function AIReport({ result, onDownloadReport, reportLoading }) {
  if (!result) return null;

  const ai = result.ai_assessment || result;
  const config = SEVERITY_CONFIG[ai.risk_level] || SEVERITY_CONFIG.NONE;

  return (
    <div className="card" style={{ marginTop: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
        }}
      >
        <div>
          <h3 style={{ fontSize: '17px', fontWeight: '700' }}>
            🤖 ChronosHealth AI Reasoning
          </h3>
          <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
            Model: {ai.ai_model} · Sources: {(ai.context_sources || []).length} data streams
          </p>
        </div>
        <span
          className="badge"
          style={{
            background: config.bg,
            color: config.color,
            fontSize: '15px',
            padding: '6px 16px',
          }}
        >
          ● {ai.risk_level}
        </span>
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
            fontSize: '12px',
            color: '#0369A1',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '6px',
          }}
        >
          Most Likely Cause
        </p>
        <p style={{ fontSize: '15px', fontWeight: '600', color: '#0C4A6E' }}>
          {ai.primary_cause}
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p
          style={{
            fontSize: '12px',
            color: '#64748B',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '8px',
          }}
        >
          Clinical Assessment
        </p>
        <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#334155' }}>
          {ai.clinical_assessment}
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p
          style={{
            fontSize: '12px',
            color: '#64748B',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '10px',
          }}
        >
          Recommended Actions
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(ai.recommendations || []).map((rec, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}
            >
              <span
                style={{
                  color: '#10B981',
                  fontWeight: '700',
                  flexShrink: 0,
                  marginTop: '1px',
                }}
              >
                ✓
              </span>
              <p style={{ fontSize: '14px', color: '#334155' }}>{rec}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}
      >
        <span style={{ fontSize: '12px', color: '#94A3B8', marginRight: '4px' }}>
          Context used:
        </span>
        {(ai.context_sources || []).map((source, i) => (
          <span
            key={i}
            style={{
              background: '#F1F5F9',
              color: '#475569',
              padding: '2px 10px',
              borderRadius: '12px',
              fontSize: '12px',
              border: '1px solid #E2E8F0',
            }}
          >
            {source}
          </span>
        ))}
      </div>

      {ai.monitor_duration_days > 0 && (
        <div
          style={{
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#92400E',
          }}
        >
          ⏱ Monitor for {ai.monitor_duration_days} day
          {ai.monitor_duration_days > 1 ? 's' : ''} before reassessing
        </div>
      )}

      <button
        type="button"
        onClick={onDownloadReport}
        disabled={reportLoading}
        style={{
          width: '100%',
          padding: '12px',
          background: reportLoading ? '#94A3B8' : '#059669',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '10px',
          fontSize: '15px',
          fontWeight: '600',
          cursor: reportLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {reportLoading ? 'Generating...' : "📄 Generate Doctor's Report (PDF)"}
      </button>

      <p
        style={{
          fontSize: '11px',
          color: '#94A3B8',
          textAlign: 'center',
          marginTop: '12px',
          fontStyle: 'italic',
        }}
      >
        ChronosHealth AI is a decision support tool. Not a substitute for professional medical
        advice.
      </p>
    </div>
  );
}
