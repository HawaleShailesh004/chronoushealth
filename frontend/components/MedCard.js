export default function MedCard({ med }) {
  if (!med) return null;
  return (
    <div
      className="card"
      style={{
        marginBottom: 12,
        borderLeft: med.is_new ? '4px solid var(--color-warning)' : undefined,
      }}
    >
      <strong>{med.drug}</strong>
      <span style={{ color: 'var(--color-text-secondary)', marginLeft: 8 }}>
        {med.dose} · {med.frequency}
      </span>
      {med.is_new && (
        <span
          className="badge"
          style={{
            marginLeft: 12,
            background: '#FEF3C7',
            color: '#D97706',
            fontSize: 11,
          }}
        >
          New
        </span>
      )}
      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 6 }}>
        Since {med.start_date}
      </p>
    </div>
  );
}
