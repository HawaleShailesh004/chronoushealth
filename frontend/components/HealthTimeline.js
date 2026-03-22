import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

/**
 * CRITICAL RECHARTS NOTE:
 * ReferenceLine x= must match a value that exists in the data array's
 * `label` field EXACTLY (our XAxis dataKey). If the medication date doesn't
 * align with a wearable day, we snap to the nearest wearable day.
 */
function findNearestChartLabel(chartRows, targetIsoDate) {
  if (!targetIsoDate || !chartRows?.length) return null;
  const targetMs = new Date(targetIsoDate).getTime();
  if (Number.isNaN(targetMs)) return null;

  let nearest = chartRows[0];
  let minDiff = Infinity;
  for (const row of chartRows) {
    const rowMs = new Date(row.date).getTime();
    if (Number.isNaN(rowMs)) continue;
    const diff = Math.abs(rowMs - targetMs);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = row;
    }
  }
  return nearest?.label ?? null;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        background: '#1E293B',
        border: 'none',
        borderRadius: '10px',
        padding: '12px 16px',
        color: '#F1F5F9',
        fontSize: '13px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
      }}
    >
      <p style={{ marginBottom: '6px', opacity: 0.6, fontSize: '11px' }}>
        {label}
      </p>
      {payload.map((entry, i) => {
        const unit =
          entry.name === 'Heart Rate'
            ? 'bpm'
            : entry.name === 'HRV'
              ? 'ms'
              : '';
        const v = entry.value;
        const formatted =
          typeof v === 'number' && !Number.isNaN(v) ? v.toFixed(1) : v;
        return (
          <p key={i} style={{ color: entry.color, marginBottom: '2px' }}>
            {entry.name}:{' '}
            <strong>
              {formatted}
              {unit ? ` ${unit}` : ''}
            </strong>
          </p>
        );
      })}
    </div>
  );
}

export default function HealthTimeline({
  wearableTimeline,
  medicationEvents,
  clinicalEvents: _clinicalEvents,
}) {
  void _clinicalEvents;

  if (!wearableTimeline || wearableTimeline.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
        Loading wearable data...
      </div>
    );
  }

  const chartData = wearableTimeline.map((day) => ({
    ...day,
    label: new Date(day.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  const medReferenceLines = (medicationEvents || [])
    .filter((e) => e.event_type === 'medication_start')
    .map((med) => {
      const chartX = findNearestChartLabel(chartData, med.date);
      return { ...med, chartX };
    })
    .filter((m) => m.chartX);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        <LegendItem color="#EF4444" label="Heart Rate (bpm)" />
        <LegendItem color="#3B82F6" label="HRV (ms)" />
        <LegendItem color="#8B5CF6" dashed label="Medication Start" />
      </div>

      <div style={{ width: 400, maxWidth: '100%' }}>
        <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E2E8F0"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            yAxisId="hr"
            orientation="left"
            domain={['auto', 'auto']}
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            tickLine={false}
            axisLine={false}
            label={{
              value: 'bpm',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 11, fill: '#94A3B8' },
            }}
          />
          <YAxis
            yAxisId="hrv"
            orientation="right"
            domain={['auto', 'auto']}
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            tickLine={false}
            axisLine={false}
            label={{
              value: 'ms',
              angle: 90,
              position: 'insideRight',
              style: { fontSize: 11, fill: '#94A3B8' },
            }}
          />
          <Tooltip content={<CustomTooltip />} />

          <Line
            yAxisId="hr"
            type="monotone"
            dataKey="heart_rate_resting"
            stroke="#EF4444"
            strokeWidth={2.5}
            dot={false}
            name="Heart Rate"
            activeDot={{ r: 5, fill: '#EF4444' }}
          />
          <Line
            yAxisId="hrv"
            type="monotone"
            dataKey="hrv"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={false}
            name="HRV"
            activeDot={{ r: 4, fill: '#3B82F6' }}
          />

          {medReferenceLines.map((med, i) => (
            <ReferenceLine
              key={`${med.chartX}-${med.drug}-${i}`}
              yAxisId="hr"
              x={med.chartX}
              stroke="#8B5CF6"
              strokeDasharray="5 3"
              strokeWidth={1.5}
              label={{
                value: `💊 ${(med.drug || '').split(' ')[0]}`,
                position: 'top',
                fontSize: 10,
                fill: '#8B5CF6',
              }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
      </div>

      <div
        style={{
          marginTop: '8px',
          fontSize: '12px',
          color: '#94A3B8',
          textAlign: 'right',
        }}
      >
        Shaded zone = 20% drift threshold from 30-day baseline
      </div>
    </div>
  );
}

function LegendItem({ color, label, dashed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div
        style={{
          width: '24px',
          height: 0,
          borderTop: dashed ? `2.5px dashed ${color}` : `2.5px solid ${color}`,
        }}
      />
      <span style={{ fontSize: '12px', color: '#64748B' }}>{label}</span>
    </div>
  );
}
