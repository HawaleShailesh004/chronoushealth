"""
PDF Report Generator using ReportLab.

Uses BytesIO so the PDF is never written to disk —
generated in memory, returned directly as HTTP response bytes.
This is the pattern used by FastAPI + ReportLab in production.
"""

from datetime import datetime
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


def _pct_change(baseline, current):
    """Helper: format percentage change between baseline and current."""
    try:
        b = float(baseline)
        c = float(current)
        if b == 0:
            return "N/A"
        pct = ((c - b) / b) * 100
        sign = "+" if pct > 0 else ""
        return f"{sign}{pct:.1f}%"
    except (TypeError, ValueError):
        return "N/A"


def generate_clinical_report(timeline: dict, ai_result: dict) -> bytes:
    """
    Generate a clinical PDF report from the unified patient timeline
    and AI assessment.

    Returns raw PDF bytes ready to stream via FastAPI Response.
    """
    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ChronosTitle",
        parent=styles["Title"],
        fontSize=22,
        textColor=colors.HexColor("#0F4C81"),
        spaceAfter=4,
    )
    section_style = ParagraphStyle(
        "SectionHeader",
        parent=styles["Heading2"],
        fontSize=12,
        textColor=colors.HexColor("#0F4C81"),
        spaceBefore=16,
        spaceAfter=6,
        borderPad=4,
    )
    body_style = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontSize=10,
        leading=15,
        textColor=colors.HexColor("#334155"),
    )
    small_style = ParagraphStyle(
        "Small",
        parent=styles["Normal"],
        fontSize=9,
        textColor=colors.HexColor("#64748B"),
    )

    story = []

    story.append(Paragraph("⏱ ChronosHealth", title_style))
    story.append(Paragraph("Clinical Summary Report", styles["Heading2"]))
    story.append(
        Paragraph(
            f"Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}",
            small_style,
        )
    )
    story.append(
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0"))
    )
    story.append(Spacer(1, 12))

    story.append(Paragraph("Patient Information", section_style))
    gender = str(timeline.get("patient_gender") or "Unknown").capitalize()
    patient_data = [
        ["Name", timeline.get("patient_name", "Unknown")],
        ["Date of Birth", timeline.get("patient_dob", "Unknown")],
        ["Gender", gender],
        ["Report Period", f"Last {timeline.get('wearable_days', 30)} days"],
    ]
    patient_table = Table(patient_data, colWidths=[1.5 * inch, 4 * inch])
    patient_table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#64748B")),
                (
                    "ROWBACKGROUNDS",
                    (0, 0),
                    (-1, -1),
                    [colors.HexColor("#F8FAFC"), colors.white],
                ),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(patient_table)

    story.append(Paragraph("AI Clinical Assessment", section_style))

    risk = ai_result.get("risk_level", "UNKNOWN")
    risk_colors = {
        "LOW": "#059669",
        "MODERATE": "#D97706",
        "HIGH": "#DC2626",
        "EMERGENCY": "#7C3AED",
    }
    risk_color = risk_colors.get(risk, "#64748B")

    story.append(
        Paragraph(
            f"<b>Risk Level:</b> <font color='{risk_color}'><b>{risk}</b></font>",
            body_style,
        )
    )
    story.append(Spacer(1, 6))
    story.append(
        Paragraph(
            f"<b>Primary Cause:</b> {ai_result.get('primary_cause', 'Unknown')}",
            body_style,
        )
    )
    story.append(Spacer(1, 8))
    story.append(Paragraph(ai_result.get("clinical_assessment", ""), body_style))

    story.append(Paragraph("Recommended Actions", section_style))
    for rec in ai_result.get("recommendations", []):
        story.append(Paragraph(f"• {rec}", body_style))

    if ai_result.get("monitor_duration_days", 0) > 0:
        story.append(Spacer(1, 6))
        story.append(
            Paragraph(
                f"<i>Monitor for {ai_result['monitor_duration_days']} days before reassessing.</i>",
                small_style,
            )
        )

    conditions = timeline.get("active_conditions", [])
    if conditions:
        story.append(Paragraph("Active Diagnoses", section_style))
        cond_data = [["Condition", "Onset Date", "Status"]]
        for c in conditions[:10]:
            cond_data.append(
                [
                    c.get("condition", ""),
                    c.get("onset_date", ""),
                    str(c.get("status", "")).capitalize(),
                ]
            )
        cond_table = Table(cond_data, colWidths=[3 * inch, 1.5 * inch, 1 * inch])
        cond_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F4C81")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    (
                        "ROWBACKGROUNDS",
                        (0, 1),
                        (-1, -1),
                        [colors.HexColor("#F8FAFC"), colors.white],
                    ),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                    ("PADDING", (0, 0), (-1, -1), 5),
                ]
            )
        )
        story.append(cond_table)

    meds = timeline.get("active_medications", [])
    if meds:
        story.append(Paragraph("Current Medications", section_style))
        med_data = [["Medication", "Dose", "Frequency", "Started"]]
        for m in meds:
            new_flag = " ★" if m.get("is_new") else ""
            med_data.append(
                [
                    m.get("drug", "") + new_flag,
                    m.get("dose", ""),
                    m.get("frequency", ""),
                    m.get("start_date", ""),
                ]
            )
        med_table = Table(med_data, colWidths=[2.5 * inch, 1 * inch, 1.2 * inch, 1 * inch])
        med_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F4C81")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    (
                        "ROWBACKGROUNDS",
                        (0, 1),
                        (-1, -1),
                        [colors.HexColor("#FFFBEB"), colors.white],
                    ),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                    ("PADDING", (0, 0), (-1, -1), 5),
                ]
            )
        )
        story.append(med_table)
        story.append(Paragraph("★ = Recently started medication", small_style))

    wearable = timeline.get("wearable_timeline", [])
    if len(wearable) >= 5:
        story.append(Paragraph("Wearable Data Summary", section_style))
        baseline = wearable[:26]
        current = wearable[-1]

        def safe_avg(records, key):
            vals = [r[key] for r in records if r.get(key) is not None]
            return round(sum(vals) / len(vals), 1) if vals else "N/A"

        vitals_data = [
            ["Metric", "30-Day Baseline", "Current", "Change"],
            [
                "Resting HR (bpm)",
                str(safe_avg(baseline, "heart_rate_resting")),
                str(current.get("heart_rate_resting", "N/A")),
                _pct_change(
                    safe_avg(baseline, "heart_rate_resting"),
                    current.get("heart_rate_resting"),
                ),
            ],
            [
                "HRV (ms)",
                str(safe_avg(baseline, "hrv")),
                str(current.get("hrv", "N/A")),
                _pct_change(safe_avg(baseline, "hrv"), current.get("hrv")),
            ],
            [
                "Sleep Efficiency (%)",
                str(safe_avg(baseline, "sleep_efficiency")),
                str(current.get("sleep_efficiency", "N/A")),
                _pct_change(
                    safe_avg(baseline, "sleep_efficiency"),
                    current.get("sleep_efficiency"),
                ),
            ],
            [
                "SpO2 (%)",
                str(safe_avg(baseline, "spo2")),
                str(current.get("spo2", "N/A")),
                _pct_change(safe_avg(baseline, "spo2"), current.get("spo2")),
            ],
        ]
        vitals_table = Table(
            vitals_data, colWidths=[2 * inch, 1.5 * inch, 1.2 * inch, 1 * inch]
        )
        vitals_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F4C81")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    (
                        "ROWBACKGROUNDS",
                        (0, 1),
                        (-1, -1),
                        [colors.HexColor("#F8FAFC"), colors.white],
                    ),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                    ("PADDING", (0, 0), (-1, -1), 5),
                ]
            )
        )
        story.append(vitals_table)

    story.append(Spacer(1, 24))
    story.append(
        HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E2E8F0"))
    )
    story.append(Spacer(1, 6))
    story.append(
        Paragraph(
            "Generated by ChronosHealth AI (gpt-4o-mini + RAG) · "
            "This report is a decision support tool and does not constitute "
            "medical advice. Always consult a qualified healthcare provider.",
            small_style,
        )
    )

    doc.build(story)
    return buffer.getvalue()
