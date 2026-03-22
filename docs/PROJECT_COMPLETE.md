# ChronosHealth — What the project is and what data it uses

This document describes **what** ChronosHealth is, **where the data comes from**, **what we build from it**, and **what people see**—not how the code is wired.

---

## What ChronosHealth is

A **decision-support style demo** that tells one story: *the same vital-sign change means something different when you also know conditions, labs, and medications.*  

The product name in copy is **ChronosHealth**; the repo is often named **chronoushealth**.

**Tagline:** Universal Health Context Engine.

---

## Where the data comes from

Everything for a patient is tied to a **`patient_id`** (the demo patient is **Sarah**).

### 1. Clinical / EHR-style record (FHIR)

- **Source:** A **Synthea-generated FHIR bundle** stored as JSON per patient (e.g. under `backend/data/synthea_output/{patient_id}.json`).
- **What it gives us:**
  - **Who the patient is:** name, birth date, gender (and internal id).
  - **Conditions:** active problems with names and onset dates.
  - **Lab results:** test names, numeric values, units, dates (used as “recent labs”).
  - **Medication requests** from FHIR (part of the broader clinical picture; the app also layers a separate medication log below).

### 2. Wearable-style daily summary

- **Source:** A **JSON file** of daily rows per patient (e.g. `backend/data/terra_mock/{patient_id}_wearable.json`), produced or loaded for the demo.
- **What each day includes (among other fields):** resting heart rate, HRV, sleep efficiency, SpO₂, steps, plus metadata such as which synthetic “device” or source label applies.
- **What we use it for:** the **30-day-style curve** on the patient screen, **baseline vs recent** comparisons, and **drift alerts**.

### 3. Medication log (spreadsheet)

- **Source:** **`medications.csv`**, with rows keyed by **`patient_id`**.
- **What it gives us:** drug name, dose, units, frequency, start (and optional stop) dates, flags such as whether a drug is **new**, optional symptom notes.
- **What we use it for:** **medication start/stop events** on the timeline, **active medications** in summaries, and marking **new** drugs in UI and PDF. This is the main place the demo encodes **“Metformin just started”**-type facts for Sarah.

### What happens if files are missing

If the FHIR file or wearable file for an id **does not exist**, that patient **cannot** be loaded end-to-end—the API will not return a full timeline for them. The **doctor roster** may still list other names, but only patients with **both** files (and CSV rows as needed) get real timelines, alerts, AI, and PDFs.

---

## What we build: one “unified patient picture”

From the three sources above, the system assembles a **single patient record** that includes:

| Area | What it contains |
|------|------------------|
| **Identity** | Patient id, name, date of birth, gender, when the snapshot was generated. |
| **Wearable timeline** | One row per day with vitals and activity fields. |
| **Clinical events** | Time-ordered clinical items derived from FHIR (e.g. diagnoses, labs) for context and AI narrative. |
| **Medication events** | Starts (and stops) from the CSV, with drug, dose, timing, and **new** flags where provided. |
| **Active conditions** | Current problems from FHIR (name, onset, status). |
| **Active medications** | Current meds from the log (dose, start, **new** flag). |
| **Recent labs** | A short list of the most relevant recent lab results (test, value, unit, date). |
| **Wearable day count** | How many days of wearable rows are in the timeline. |
| **Data source labels** | Human-readable labels for where wearable vs clinical vs medication data came from (for trust/copy). |

That object is the **source of truth** for the API responses and for what the UI displays.

---

## What we detect: drift / alerts

Using **only the wearable timeline**, the system compares a **longer personal baseline** to **recent values** for:

- Resting heart rate  
- Heart rate variability (HRV)  
- Sleep efficiency  
- Blood oxygen (SpO₂)  

**What each alert contains:** which metric moved, baseline vs current, **percent deviation**, direction (up/down), and a **severity** level (from low to emergency-style buckets).  

**Overall severity** is the **worst** level among active alerts, or “all clear” if there are none.

---

## What the AI adds

When there **are** alerts, the system builds a **text context** from the unified record (conditions, meds, labs, wearable summary, alerts) and may **retrieve similar past text** from a **vector store** so the answer is not only “today’s numbers.”

**What the user gets back** (structured fields):

- **Risk level** (e.g. low / moderate / high / emergency)  
- **Primary cause** (one-line headline)  
- **Clinical assessment** (short narrative grounded in the supplied data)  
- **Recommendations** (bullet actions)  
- **Context sources** (which streams informed the answer—wearable, FHIR, medication log, etc.)  
- **How long to monitor** before reassessing (when the model sets it)  
- **Model name** (for transparency)

When there are **no** alerts, the system returns a **stable “all clear”** style assessment without calling the language model.

For **demos**, a **pre-saved JSON file** per patient can supply the same structured AI fields so the presentation does not depend on a live model call.

---

## What the PDF contains

A **clinical-style summary document** for the patient, including:

- Report title and generation timestamp  
- **Patient demographics** and reporting period (e.g. days of wearable data)  
- **AI section:** risk, primary cause, narrative, recommendations, optional monitoring note  
- **Active diagnoses** (if any)  
- **Current medications** (with a marker for **recently started** drugs)  
- **Wearable summary table:** baseline vs **latest day** and **percent change** for key vitals (when enough days exist)  
- **Disclaimer** that this is decision support, not a substitute for a clinician  

The PDF uses the **same cached AI text** as the demo when that file exists; otherwise it uses a freshly generated assessment.

---

## What the user sees (by screen)

### Landing

- **What:** Product message, short proof-style quote, high-level stats (e.g. streams unified, days of context), and entry points.
- **Actions:** Open **patient demo** (Sarah) or **physician panel**.

### Patient dashboard

- **What:**  
  - Header with **name, DOB, sex, how many days** of wearable data, and **which data types** feed the story.  
  - **Four headline vitals** (HR, HRV, sleep, SpO₂) using **latest day vs baseline**.  
  - **Chart** of HR and HRV over time, with **vertical markers** for **new medication starts** (aligned to the nearest day on the chart so the story lines up visually).  
  - **Lists** of active conditions and medications (with **New** on flagged meds).  
  - **Up to six** recent lab tiles.  
  - Either **“all clear”** or a list of **drift alerts** with severities.  
  - After requesting AI: **risk, cause, story, recommendations, sources**, optional follow-up timing, and a control to **download the PDF**.

### Physician panel

- **What:** A **roster** of demo patients with **alert count** and **severity badge** when the API returns them.  
- **After selecting a patient:** **Pre-appointment brief** (the AI clinical paragraph), **suggested discussion points** (recommendations), small **summary stats**, and a link to the **full patient dashboard** for that id.  
- **Note:** Only patients with real backend files behave fully; others may show empty or “no brief” states.

---

## Demo cache file (what it is)

For a patient id, a file like **`{patient_id}_demo_cache.json`** under backend data can hold:

- A frozen copy of the **timeline**  
- The **alerts** used when the cache was built  
- The **AI result** object  
- **Overall severity**  

**What it’s for:** repeatable demos and PDFs that always show the same narrative without re-running the model.

---

## Repository shape (minimal)

- **`backend/`** — API, data under `data/`, logic that ingests files and produces timeline, alerts, AI, PDF.  
- **`frontend/`** — Web UI that calls the API and renders the screens above.  
- **`docs/`** — Documents such as this one.

---

## Operational notes (what can go wrong)

- **Backend not running:** the patient and doctor screens cannot load timelines or alerts; the UI shows a connection error.  
- **Stale frontend build cache:** rarely, after deleting old source files, the dev server may error until the **`frontend/.next`** folder is removed and the app restarted.  
- **Doctor list vs reality:** the roster may show names that **do not** have FHIR + wearable files; only ids with both files get full data.

---

*This file describes outcomes and data. Update it when you add new data sources, new fields in the unified record, or new user-visible outputs.*
