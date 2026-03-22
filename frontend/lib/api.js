/**
 * All API calls go through here — single source of truth.
 * If the backend URL changes, change it in ONE place.
 */

import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 second timeout — prevents hanging
});

export async function getTimeline(patientId) {
  const res = await api.get(`/patient/${patientId}/timeline`);
  return res.data;
}

export async function getAlerts(patientId) {
  const res = await api.get(`/patient/${patientId}/alerts`);
  return res.data;
}

export async function getCachedAnalysis(patientId) {
  // ALWAYS use cached endpoint — never live AI during demo
  const res = await api.get(`/patient/${patientId}/analyze/cached`);
  return res.data;
}

export async function downloadReport(patientId) {
  const res = await api.post(
    `/patient/${patientId}/report`,
    {},
    { responseType: 'blob' } // Critical: must be blob for PDF download
  );
  return res.data;
}

export const SEVERITY_CONFIG = {
  NONE:      { color: '#6B7280', bg: '#F3F4F6', label: 'All Clear' },
  LOW:       { color: '#059669', bg: '#D1FAE5', label: 'Low' },
  MODERATE:  { color: '#D97706', bg: '#FEF3C7', label: 'Moderate' },
  HIGH:      { color: '#DC2626', bg: '#FEE2E2', label: 'High' },
  EMERGENCY: { color: '#7C3AED', bg: '#EDE9FE', label: 'Emergency' },
};
