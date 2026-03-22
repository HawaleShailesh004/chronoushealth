"""Demo roster display patches when FHIR bundles are reused across patient ids."""

from __future__ import annotations

DEMO_TIMELINE_OVERRIDES: dict[str, dict] = {
    "james": {
        "patient_id": "james",
        "patient_name": "James Kowalski",
        "patient_gender": "male",
        "patient_dob": "1959-06-01",
    },
    "priya": {
        "patient_id": "priya",
        "patient_name": "Priya Lakshmanan",
        "patient_gender": "female",
        "patient_dob": "1970-09-15",
    },
    "marcus": {
        "patient_id": "marcus",
        "patient_name": "Marcus Webb",
        "patient_gender": "male",
        "patient_dob": "1987-11-22",
    },
}


def apply_demo_timeline_patch(patient_id: str, timeline: dict) -> dict:
    patch = DEMO_TIMELINE_OVERRIDES.get(patient_id)
    if not patch:
        return timeline
    return {**timeline, **patch}
