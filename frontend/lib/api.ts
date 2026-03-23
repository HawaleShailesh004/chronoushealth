import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

export interface WearableRecord {
  date: string;
  heart_rate_resting: number | null;
  hrv: number | null;
  spo2: number | null;
  sleep_efficiency: number | null;
  sleep_duration_hours: number | null;
  steps: number | null;
  data_source: string;
}

export interface ClinicalEvent {
  date: string;
  event_type: string;
  title: string;
  detail?: string;
  value?: number;
  unit?: string;
  test_name?: string;
  status?: string;
  data_source: string;
}

export interface MedicationEvent {
  date: string;
  event_type: string;
  drug: string;
  dose: string;
  frequency: string;
  symptom_reported?: string;
  is_new?: boolean;
  data_source: string;
}

export interface ActiveMedication {
  drug: string;
  dose: string;
  frequency: string;
  start_date: string;
  is_new: boolean;
  source: string;
}

export interface ActiveCondition {
  condition: string;
  onset_date: string;
  status: string;
}

export interface LabResult {
  test: string;
  value: number;
  unit: string;
  date: string;
}

export interface BaselineZoneStat {
  mean: number;
  zone_low: number;
  zone_high: number;
}

export interface PatientTimeline {
  patient_id: string;
  patient_name: string;
  patient_gender: string;
  patient_dob: string;
  generated_at: string;
  wearable_timeline: WearableRecord[];
  clinical_events: ClinicalEvent[];
  medication_events: MedicationEvent[];
  active_medications: ActiveMedication[];
  active_conditions: ActiveCondition[];
  recent_labs: LabResult[];
  wearable_days: number;
  baseline_stats?: {
    heart_rate_resting?: BaselineZoneStat;
    hrv?: BaselineZoneStat;
    sleep_efficiency?: BaselineZoneStat;
    spo2?: BaselineZoneStat;
  };
}

export interface DriftAlert {
  metric: string;
  metric_name: string;
  unit: string;
  baseline_mean: number;
  baseline_stdev: number;
  current_value: number;
  raw_deviation: number;
  deviation_pct: number;
  direction: 'UP' | 'DOWN';
  direction_symbol: '↑' | '↓';
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'EMERGENCY';
  concerning_direction: string;
}

export interface AlertsResponse {
  patient_id: string;
  patient_name: string;
  overall_severity: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'EMERGENCY';
  alert_count: number;
  alerts: DriftAlert[];
}

export interface EvidenceChainItem {
  finding: string;
  source: string;
  source_label: string;
  relevance: string;
}

export interface AIAssessment {
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'EMERGENCY';
  primary_cause: string;
  clinical_assessment: string;
  recommendations: string[];
  context_sources: string[];
  evidence_chain?: EvidenceChainItem[];
  monitor_duration_days: number;
  ai_model: string;
  similar_events_used?: number;
}

export interface AnalysisResponse {
  patient_id?: string;
  patient_name?: string;
  overall_severity?: string;
  alerts?: DriftAlert[];
  ai_assessment: AIAssessment | null;
  source?: string;
}

export const SEVERITY_CONFIG = {
  NONE: {
    label: 'All Clear',
    textColor: 'text-success-700',
    bgColor: 'bg-success-50',
    borderColor: 'border-success-100',
    dotColor: 'bg-success-500',
  },
  LOW: {
    label: 'Low',
    textColor: 'text-success-700',
    bgColor: 'bg-success-50',
    borderColor: 'border-success-100',
    dotColor: 'bg-success-500',
  },
  MODERATE: {
    label: 'Moderate',
    textColor: 'text-warning-700',
    bgColor: 'bg-warning-50',
    borderColor: 'border-warning-100',
    dotColor: 'bg-warning-500',
  },
  HIGH: {
    label: 'High',
    textColor: 'text-danger-700',
    bgColor: 'bg-danger-50',
    borderColor: 'border-danger-100',
    dotColor: 'bg-danger-600',
  },
  EMERGENCY: {
    label: 'Emergency',
    textColor: 'text-danger-700',
    bgColor: 'bg-danger-50',
    borderColor: 'border-danger-100',
    dotColor: 'bg-danger-600',
  },
} as const;

export async function getTimeline(patientId: string): Promise<PatientTimeline> {
  const res = await api.get(`/patient/${patientId}/timeline`);
  return res.data;
}

export async function getAlerts(patientId: string): Promise<AlertsResponse> {
  const res = await api.get(`/patient/${patientId}/alerts`);
  return res.data;
}

export async function getCachedAnalysis(
  patientId: string
): Promise<AnalysisResponse> {
  const res = await api.get(`/patient/${patientId}/analyze/cached`);
  return res.data;
}

export async function downloadReport(patientId: string): Promise<Blob> {
  const res = await api.post(
    `/patient/${patientId}/report`,
    {},
    { responseType: 'blob' }
  );
  return res.data;
}
