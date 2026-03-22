"""
Full API integration test.
Run with uvicorn already started in another terminal:

    uvicorn main:app --reload --port 8000
"""

import sys

import requests

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

BASE = "http://localhost:8000"


def test(name, method, url, expected_keys=None):
    r = getattr(requests, method)(url, timeout=120)
    assert r.status_code == 200, f"{name}: HTTP {r.status_code} — {r.text[:200]}"
    data = r.json()
    if expected_keys:
        for key in expected_keys:
            assert key in data, f"{name}: missing key '{key}'"
    print(f"  ✓ {name}")
    return data


print("=" * 50)
print("API INTEGRATION TEST")
print("=" * 50)

# Health check
test("Health check", "get", f"{BASE}/health", ["status"])

# Timeline
t = test(
    "Timeline",
    "get",
    f"{BASE}/patient/sarah/timeline",
    [
        "wearable_timeline",
        "clinical_events",
        "medication_events",
        "active_medications",
        "active_conditions",
    ],
)
assert len(t["wearable_timeline"]) >= 25, "Need 25+ wearable records"
assert len(t["active_medications"]) >= 1, "Need active medications"
assert len(t["active_conditions"]) >= 1, "Need active conditions"
print(f"     {len(t['wearable_timeline'])} wearable records")
print(f"     {len(t['clinical_events'])} clinical events")
print(f"     {len(t['active_medications'])} active medications")

# Alerts
a = test(
    "Alerts",
    "get",
    f"{BASE}/patient/sarah/alerts",
    ["overall_severity", "alert_count", "alerts"],
)
assert a["alert_count"] >= 2, f"Need 2+ alerts, got {a['alert_count']}"
assert a["overall_severity"] in ["MODERATE", "HIGH", "EMERGENCY"]
print(f"     {a['alert_count']} alerts, severity: {a['overall_severity']}")

# Cached analysis
c = test(
    "Cached analysis",
    "get",
    f"{BASE}/patient/sarah/analyze/cached",
    ["ai_assessment"],
)
ai = c["ai_assessment"]
assert ai is not None, "ai_assessment is null"
assert ai["risk_level"] in ["LOW", "MODERATE", "HIGH", "EMERGENCY"]
assert len(ai["clinical_assessment"]) > 30
assert len(ai["recommendations"]) >= 2
print(f"     Risk: {ai['risk_level']}")
print(f"     Cause: {ai['primary_cause']}")

print("\n" + "=" * 50)
print("ALL API TESTS PASSED ✓")
print("=" * 50)
print("\nBackend is demo-ready.")
print("DO NOT touch the AI prompt until after Week 3 testing.")
