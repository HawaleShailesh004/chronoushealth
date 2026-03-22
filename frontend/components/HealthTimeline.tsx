'use client';

import { useEffect, useRef } from 'react';
import type { Chart } from 'chart.js';
import type {
  WearableRecord,
  MedicationEvent,
  PatientTimeline,
} from '@/lib/api';

interface Props {
  wearableTimeline: WearableRecord[];
  medicationEvents: MedicationEvent[];
  baselineStats?: PatientTimeline['baseline_stats'];
}

function formatLabel(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/** Map medication ISO date to nearest chart label index (matches X axis categories). */
function nearestIndexForMed(
  wearable: WearableRecord[],
  labels: string[],
  medDate: string
): number {
  if (!wearable.length || !labels.length) return 0;
  const target = new Date(medDate).getTime();
  if (Number.isNaN(target)) return Math.max(0, labels.length - 1);

  let bestIdx = 0;
  let bestDiff = Infinity;
  wearable.forEach((row, i) => {
    const t = new Date(row.date).getTime();
    if (Number.isNaN(t)) return;
    const diff = Math.abs(t - target);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  });
  return Math.min(bestIdx, labels.length - 1);
}

export default function HealthTimeline({
  wearableTimeline,
  medicationEvents,
  baselineStats,
}: Props) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !wearableTimeline.length) return;

    let cancelled = false;

    async function build() {
      const { Chart, registerables } = await import('chart.js');
      const annotationPlugin = (await import('chartjs-plugin-annotation')).default;
      Chart.register(...registerables, annotationPlugin);

      if (cancelled || !chartRef.current) return;

      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }

      const labels = wearableTimeline.map((d) => formatLabel(d.date));
      const hrData = wearableTimeline.map((d) => d.heart_rate_resting);
      const hrvData = wearableTimeline.map((d) => d.hrv);

      const annotations: Record<string, unknown> = {};
      const lastX = Math.max(0, labels.length - 1);
      const hrZ = baselineStats?.heart_rate_resting;
      const hrvZ = baselineStats?.hrv;
      if (
        hrZ != null &&
        hrZ.zone_low != null &&
        hrZ.zone_high != null
      ) {
        annotations.hr_zone = {
          type: 'box',
          xScaleID: 'x',
          yScaleID: 'yHR',
          xMin: 0,
          xMax: lastX,
          yMin: hrZ.zone_low,
          yMax: hrZ.zone_high,
          backgroundColor: 'rgba(217, 45, 32, 0.06)',
          borderWidth: 0,
          label: {
            display: true,
            content: 'HR baseline zone',
            color: 'rgba(217,45,32,0.45)',
            font: { size: 8, family: 'JetBrains Mono, monospace' },
            position: { x: 'start', y: 'start' },
            backgroundColor: 'transparent',
            borderWidth: 0,
            padding: 4,
          },
        };
      }
      if (
        hrvZ != null &&
        hrvZ.zone_low != null &&
        hrvZ.zone_high != null
      ) {
        annotations.hrv_zone = {
          type: 'box',
          xScaleID: 'x',
          yScaleID: 'yHRV',
          xMin: 0,
          xMax: lastX,
          yMin: hrvZ.zone_low,
          yMax: hrvZ.zone_high,
          backgroundColor: 'rgba(27, 79, 204, 0.05)',
          borderWidth: 0,
          label: {
            display: true,
            content: 'HRV baseline zone',
            color: 'rgba(27,79,204,0.4)',
            font: { size: 8, family: 'JetBrains Mono, monospace' },
            position: { x: 'end', y: 'start' },
            backgroundColor: 'transparent',
            borderWidth: 0,
            padding: 4,
          },
        };
      }

      (medicationEvents || [])
        .filter((e) => e.event_type === 'medication_start' && e.is_new)
        .forEach((med, i) => {
          const xVal = nearestIndexForMed(
            wearableTimeline,
            labels,
            med.date
          );
          const shortDrug = (med.drug || '').split(' ')[0] || 'Med';
          annotations[`med_${i}`] = {
            type: 'line',
            xMin: xVal,
            xMax: xVal,
            borderColor: 'rgba(181,71,8,0.6)',
            borderWidth: 1.5,
            borderDash: [5, 3],
            label: {
              display: true,
              content: shortDrug,
              color: '#B54708',
              font: {
                size: 9,
                family: 'JetBrains Mono, monospace',
                weight: '500',
              },
              backgroundColor: 'rgba(255,250,235,0.95)',
              borderColor: '#FEC84B',
              borderWidth: 1,
              borderRadius: 4,
              padding: { x: 6, y: 3 },
              position: 'start',
            },
          };
        });

      chartInstance.current = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Heart Rate',
              data: hrData as (number | null)[],
              borderColor: '#D92D20',
              backgroundColor: 'rgba(217,45,32,0.04)',
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 4,
              pointHoverBackgroundColor: '#D92D20',
              yAxisID: 'yHR',
              tension: 0.4,
              fill: true,
            },
            {
              label: 'HRV',
              data: hrvData as (number | null)[],
              borderColor: '#1B4FCC',
              backgroundColor: 'rgba(27,79,204,0.04)',
              borderWidth: 1.5,
              pointRadius: 0,
              pointHoverRadius: 3,
              pointHoverBackgroundColor: '#1B4FCC',
              yAxisID: 'yHRV',
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#0A0F1E',
              borderColor: '#374151',
              borderWidth: 1,
              titleColor: '#9CA3AF',
              bodyColor: '#F9FAFB',
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: (ctx) => {
                  const y = ctx.parsed.y;
                  if (y == null) return `  ${ctx.dataset.label}: —`;
                  return `  ${ctx.dataset.label}: ${y.toFixed(1)}`;
                },
              },
            },
            // chartjs-plugin-annotation options vs strict Chart.js plugin typings
            annotation: { annotations } as never,
          },
          scales: {
            x: {
              border: { display: false },
              grid: { color: 'rgba(0,0,0,0.04)' },
              ticks: {
                color: '#9CA3AF',
                font: { size: 9, family: 'JetBrains Mono, monospace' },
                maxTicksLimit: 8,
                maxRotation: 0,
              },
            },
            yHR: {
              position: 'left',
              border: { display: false },
              grid: { color: 'rgba(0,0,0,0.04)' },
              ticks: {
                color: '#9CA3AF',
                font: { size: 9, family: 'JetBrains Mono, monospace' },
              },
              title: {
                display: true,
                text: 'bpm',
                color: '#9CA3AF',
                font: { size: 9 },
              },
            },
            yHRV: {
              position: 'right',
              border: { display: false },
              grid: { display: false },
              ticks: {
                color: '#9CA3AF',
                font: { size: 9, family: 'JetBrains Mono, monospace' },
              },
              title: {
                display: true,
                text: 'ms',
                color: '#9CA3AF',
                font: { size: 9 },
              },
            },
          },
        },
      });
    }

    build();
    return () => {
      cancelled = true;
      chartInstance.current?.destroy();
      chartInstance.current = null;
    };
  }, [wearableTimeline, medicationEvents, baselineStats]);

  if (!wearableTimeline?.length) {
    return (
      <div className="py-10 text-center text-sm text-ink-400 font-mono">
        Loading wearable data…
      </div>
    );
  }

  return (
    <div className="relative h-[220px] w-full">
      <canvas ref={chartRef} />
    </div>
  );
}
