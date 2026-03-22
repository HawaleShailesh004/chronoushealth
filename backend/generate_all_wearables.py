"""
Generate synthetic wearable JSON for demo patients (james, priya, marcus).
Run from backend/:  python generate_all_wearables.py

Requires FHIR files to exist for each id (e.g. copy sarah.json to james.json …).
"""

from pathlib import Path
import sys

_BACKEND = Path(__file__).resolve().parent
sys.path.insert(0, str(_BACKEND))

from ingestion.wearable_generator import generate_wearable_timeline, save_wearable_data

PATIENTS = [
    {
        "patient_id": "james",
        "baseline_hr": 72.0,
        "baseline_hrv": 38.0,
        "baseline_spo2": 96.0,
        "baseline_sleep_efficiency": 74.0,
        "drift_start_day": 24,
        "drift_magnitude": 0.45,
    },
    {
        "patient_id": "priya",
        "baseline_hr": 68.0,
        "baseline_hrv": 44.0,
        "baseline_spo2": 97.2,
        "baseline_sleep_efficiency": 76.0,
        "drift_start_day": 26,
        "drift_magnitude": 0.28,
    },
    {
        "patient_id": "marcus",
        "baseline_hr": 58.0,
        "baseline_hrv": 62.0,
        "baseline_spo2": 98.2,
        "baseline_sleep_efficiency": 85.0,
        "drift_start_day": 28,
        "drift_magnitude": 0.06,
    },
]


def main():
    for cfg in PATIENTS:
        pid = cfg["patient_id"]
        params = {k: v for k, v in cfg.items() if k != "patient_id"}
        data = generate_wearable_timeline(patient_id=pid, days=30, **params)
        out = _BACKEND / "data" / "terra_mock" / f"{pid}_wearable.json"
        save_wearable_data(data, str(out))
        print(f"OK {pid} -> {out.relative_to(_BACKEND)}")
    print("\nDone.")


if __name__ == "__main__":
    main()
