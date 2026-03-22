"""
ChronosHealth FastAPI Backend.

Endpoints:
GET  /health                         → system health check
GET  /patient/{id}/timeline          → full unified patient timeline
GET  /patient/{id}/alerts            → detected anomalies
POST /patient/{id}/analyze           → AI reasoning (live call)
GET  /patient/{id}/analyze/cached    → cached AI result (use for demo)
"""

import json
from contextlib import asynccontextmanager
from pathlib import Path

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from engine.anomaly_detector import detect_drift, get_overall_severity
from engine.rag_engine import analyze_with_ai, store_patient_history
from engine.schema_mapper import build_patient_timeline
from ingestion.fhir_parser import parse_patient_fhir
from ingestion.wearable_generator import load_wearable_data

_BACKEND = Path(__file__).resolve().parent


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-load Sarah's data into Pinecone on startup."""
    print("ChronosHealth API starting...")
    try:
        timeline = load_patient_data("sarah")
        store_patient_history(timeline)
        print("Patient history loaded into Pinecone OK")
    except Exception as e:
        print(f"Warning: startup pre-load failed: {e}")
        print("Will retry on first request.")
    yield


app = FastAPI(
    title="ChronosHealth API",
    description="Universal Health Context Engine",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_patient_data(patient_id: str) -> dict:
    """
    Load and build the full unified timeline for a patient.
    Raises HTTPException if patient not found.

    Expects:
    - data/synthea_output/{patient_id}.json (FHIR bundle)
    - data/terra_mock/{patient_id}_wearable.json
    - rows in data/medications.csv with patient_id matching route param
    """
    fhir_path = _BACKEND / "data" / "synthea_output" / f"{patient_id}.json"
    wearable_path = _BACKEND / "data" / "terra_mock" / f"{patient_id}_wearable.json"

    if not fhir_path.is_file():
        raise HTTPException(
            status_code=404,
            detail=f"Patient FHIR file not found: {fhir_path.relative_to(_BACKEND)}",
        )
    if not wearable_path.is_file():
        raise HTTPException(
            status_code=404,
            detail=f"Wearable data not found: {wearable_path.relative_to(_BACKEND)}",
        )

    fhir = parse_patient_fhir(str(fhir_path))
    wearable = load_wearable_data(str(wearable_path))

    meds_path = _BACKEND / "data" / "medications.csv"
    meds_df = pd.read_csv(meds_path)
    patient_meds = meds_df[meds_df["patient_id"] == patient_id].copy()

    return build_patient_timeline(fhir, wearable, patient_meds)


@app.get("/health")
def health_check():
    """System health check — call this first to verify API is running."""
    return {
        "status": "ok",
        "service": "ChronosHealth API",
        "version": "1.0.0",
    }


@app.get("/patient/{patient_id}/timeline")
def get_timeline(patient_id: str):
    """
    Returns the full Unified Patient Timeline for a patient.
    Includes: wearable data, clinical events, medication events,
              active conditions, active medications, recent labs.
    """
    timeline = load_patient_data(patient_id)
    return timeline


@app.get("/patient/{patient_id}/alerts")
def get_alerts(patient_id: str):
    """
    Returns detected health drifts for a patient.
    Each alert includes: metric, baseline, current value,
                         deviation %, severity.
    """
    timeline = load_patient_data(patient_id)
    alerts = detect_drift(timeline["wearable_timeline"])
    overall = get_overall_severity(alerts)

    return {
        "patient_id": patient_id,
        "patient_name": timeline.get("patient_name"),
        "overall_severity": overall,
        "alert_count": len(alerts),
        "alerts": alerts,
    }


@app.post("/patient/{patient_id}/analyze")
def analyze_patient(patient_id: str):
    """
    LIVE AI reasoning call.
    Sends patient context to GPT-4o-mini via RAG.

    DO NOT call this during the demo presentation.
    Use /analyze/cached instead.
    """
    timeline = load_patient_data(patient_id)
    alerts = detect_drift(timeline["wearable_timeline"])
    result = analyze_with_ai(timeline, alerts)

    return {
        "patient_id": patient_id,
        "patient_name": timeline.get("patient_name"),
        "overall_severity": get_overall_severity(alerts),
        "alerts": alerts,
        "ai_assessment": result,
    }


@app.get("/patient/{patient_id}/analyze/cached")
def get_cached_analysis(patient_id: str):
    """
    Returns pre-cached AI analysis.
    USE THIS DURING THE DEMO — never live-call AI during presentation.

    If cache doesn't exist, falls back to live call.
    """
    cache_path = _BACKEND / "data" / f"{patient_id}_demo_cache.json"

    if cache_path.is_file():
        with open(cache_path, encoding="utf-8") as f:
            cached = json.load(f)
        return {
            "patient_id": patient_id,
            "patient_name": cached.get("timeline", {}).get("patient_name"),
            "overall_severity": cached.get("overall_severity"),
            "alerts": cached.get("alerts", []),
            "ai_assessment": cached.get("ai_result"),
            "timeline": cached.get("timeline"),
            "source": "cache",
        }

    timeline = load_patient_data(patient_id)
    alerts = detect_drift(timeline["wearable_timeline"])
    result = analyze_with_ai(timeline, alerts)
    return {
        "patient_id": patient_id,
        "patient_name": timeline.get("patient_name"),
        "overall_severity": get_overall_severity(alerts),
        "alerts": alerts,
        "ai_assessment": result,
        "source": "live",
    }
