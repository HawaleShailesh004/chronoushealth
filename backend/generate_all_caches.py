"""
Build demo_cache.json for james, priya, marcus.
Run from backend/:  python generate_all_caches.py

Uses the same timeline assembly as the API (FHIR + wearable + meds + demo display patch).
"""

import json
import sys
from pathlib import Path

_BACKEND = Path(__file__).resolve().parent
sys.path.insert(0, str(_BACKEND))

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

import pandas as pd

from ingestion.fhir_parser import parse_patient_fhir
from ingestion.wearable_generator import load_wearable_data
from engine.schema_mapper import build_patient_timeline
from engine.demo_overrides import apply_demo_timeline_patch
from engine.anomaly_detector import detect_drift, get_overall_severity
from engine.rag_engine import analyze_with_ai, store_patient_history

PATIENT_IDS = ["james", "priya", "marcus"]


def main():
    meds_df = pd.read_csv(_BACKEND / "data" / "medications.csv")
    for pid in PATIENT_IDS:
        print(f"\n{pid}...", flush=True)
        try:
            fhir = parse_patient_fhir(
                str(_BACKEND / "data" / "synthea_output" / f"{pid}.json")
            )
            wearable = load_wearable_data(
                str(_BACKEND / "data" / "terra_mock" / f"{pid}_wearable.json")
            )
            patient_meds = meds_df[meds_df["patient_id"] == pid].copy()
            timeline = apply_demo_timeline_patch(
                pid, build_patient_timeline(fhir, wearable, patient_meds)
            )
            print("  indexing...", flush=True)
            try:
                store_patient_history(timeline)
            except Exception as e:
                print(f"  Pinecone: {e}", flush=True)
            alerts = detect_drift(timeline["wearable_timeline"])
            print("  AI analyze...", flush=True)
            ai_result = analyze_with_ai(timeline, alerts)
            pkg = {
                "timeline": timeline,
                "alerts": alerts,
                "overall_severity": get_overall_severity(alerts),
                "ai_result": ai_result,
            }
            out = _BACKEND / "data" / f"{pid}_demo_cache.json"
            with open(out, "w", encoding="utf-8") as f:
                json.dump(pkg, f, indent=2, default=str)
            print(
                f"  severity={pkg['overall_severity']} alerts={len(alerts)} -> {out.name}",
                flush=True,
            )
        except Exception as e:
            print(f"  FAILED: {e}", flush=True)


if __name__ == "__main__":
    main()
