import { useRouter } from 'next/router';

export default function Landing() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0F4C81 0%, #1a6fa8 100%)',
        padding: '24px',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div
          style={{
            fontSize: '48px',
            marginBottom: '12px',
          }}
        >
          ⏱
        </div>
        <h1
          style={{
            fontSize: '42px',
            fontWeight: '800',
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            marginBottom: '8px',
          }}
        >
          ChronosHealth
        </h1>
        <p
          style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.75)',
            maxWidth: '420px',
            lineHeight: '1.5',
          }}
        >
          Universal Health Context Engine
        </p>
        <p
          style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.5)',
            marginTop: '8px',
            fontStyle: 'italic',
          }}
        >
          &quot;Your health has a story. We read all of it.&quot;
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <RoleButton
          icon="🩺"
          title="Patient View"
          subtitle="Sarah M., 42F — Demo Patient"
          onClick={() => router.push('/patient?id=sarah')}
          primary
        />
        <RoleButton
          icon="👨‍⚕️"
          title="Physician View"
          subtitle="Dr. Patel — Patient Panel"
          onClick={() => router.push('/doctor')}
        />
      </div>

      <div
        style={{
          marginTop: '48px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {['Wearable Data', 'FHIR Records', 'Medication Logs', 'AI Reasoning'].map(
          (label) => (
            <span
              key={label}
              style={{
                background: 'rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.85)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              {label}
            </span>
          )
        )}
      </div>
    </div>
  );
}

function RoleButton({ icon, title, subtitle, onClick, primary }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: primary ? '#FFFFFF' : 'rgba(255,255,255,0.12)',
        color: primary ? '#0F4C81' : '#FFFFFF',
        border: primary ? 'none' : '1px solid rgba(255,255,255,0.3)',
        borderRadius: '16px',
        padding: '20px 32px',
        cursor: 'pointer',
        textAlign: 'left',
        minWidth: '220px',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '17px', fontWeight: '700' }}>{title}</div>
      <div
        style={{
          fontSize: '13px',
          opacity: 0.7,
          marginTop: '4px',
        }}
      >
        {subtitle}
      </div>
    </button>
  );
}
