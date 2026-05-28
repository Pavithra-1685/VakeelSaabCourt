
# Final Product Direction

#Vakeel Saab

### AI Legal Drafting Tool for Indian Advocates

A professional AI drafting assistant that:

* converts rough legal facts into court-ready drafts
* follows Indian legal drafting conventions
* suggests applicable Indian legal provisions
* maintains advocate-style formatting
* exports professional documents
* keeps revision history

---

# Final Core Features

## Included

### 1. AI Legal Draft Generator

* FIR Complaints
* Bail Petitions
* Affidavits
* Legal Notices
* Writ Petitions
* Criminal Complaints
* Civil Pleadings
* Counter Affidavits
* Written Statements

---

### 2. Indian Law Section Suggestion Engine

Strictly:

* IPC
* BNS
* CrPC
* BNSS
* Indian Evidence Act

Rules:

* No hallucinated sections
* Only valid Indian legal provisions
* AI must cite sections conservatively
* Section retrieval layer required

---

### 3. Rich Legal Editor

* professional drafting editor
* editable AI output
* formatting toolbar
* court-style spacing
* legal headings
* auto-save

---

### 4. Document History

Keep:

* previous drafts
* reopened drafts
* duplicate draft
* export again

Storage:

* SQLite initially

---

### 5. Version Control

Keep:

* revision snapshots
* restore older versions
* compare edits

Simple implementation:

* save editor state after every generation/edit

---

### 6. DOCX + PDF Export

Professional formatting:

* margins
* headings
* spacing
* advocate-ready structure

---

# FINAL TECH STACK

## Frontend

* React.js
* Tailwind CSS
* Framer Motion
* TipTap Editor
* Lucide Icons (minimal use)

## Backend

* FastAPI
* Groq API
* Python

## Database

* SQLite initially

## Export

* python-docx
* reportlab

---

# WHY GROQ IS A GOOD CHOICE

For this product:

* fast responses
* low latency drafting
* cheaper than OpenAI
* excellent for structured prompting

Recommended models:

* `llama-3.3-70b-versatile`
* `deepseek-r1-distill-llama-70b`

---

# DESIGN SYSTEM

## Design Philosophy

### Keywords

* Minimal
* Dominant
* Professional
* Litigation-inspired
* Editorial
* Quiet luxury
* Premium SaaS

Avoid:

* colorful startup gradients
* emojis
* playful illustrations
* glassmorphism overload

This should feel like:

* a premium legal drafting chamber
* not a student AI project

---

# COLOR PALETTE

## Primary

* Pure White `#FFFFFF`

## Secondary

* Matte Black `#0F0F0F`

## Neutral Greys

* `#1A1A1A`
* `#2A2A2A`
* `#6B6B6B`
* `#D9D9D9`
* `#F5F5F5`

---

# TYPOGRAPHY

## Headings

# Galaxie Copernicus

Use for:

* titles
* legal document headings
* landing hero section

This gives:

* editorial authority
* law-journal feel
* premium legal aesthetic

---

## Body/UI

# Styrene B

Use for:

* UI
* buttons
* labels
* forms
* editor UI

This creates:

* strong professional structure
* modern SaaS feel

---

# UI STYLE

## Layout

* spacious
* strong alignment
* large margins
* sharp hierarchy

## Components

* thin borders
* soft shadows
* monochrome buttons
* minimal animations

---

# SVG GRAPHICS INSTEAD OF EMOJIS

Correct decision.

Use:

* courthouse SVGs
* legal scale SVGs
* document seal graphics
* Indian constitutional motifs
* litigation-style line illustrations

Avoid:

* emojis
* cartoon graphics
* generic AI art

---

# LAWYER-SPECIFIC UX

This is VERY important.

The app should feel designed for advocates.

---

# Legal Drafting UX Features

## Court Formatting

Automatically maintain:

* proper spacing
* petitioner/respondent alignment
* prayer formatting
* verification formatting

---

## Legal Tone Enforcement

The AI must:

* avoid casual language
* avoid American legal structure
* follow Indian High Court drafting style

---

# STRICT INDIAN LAW COMPLIANCE

Critical architecture rule:

The AI should NEVER freely invent laws.

You need:

## Legal Retrieval Layer

Create a structured JSON/database:

```json
{
  "act": "IPC",
  "section": "420",
  "title": "Cheating and dishonestly inducing delivery of property",
  "keywords": ["cheating", "fraud", "money"]
}
```

The workflow:

```text
User Input
   ↓
Keyword Extraction
   ↓
Retrieve Relevant Indian Sections
   ↓
Pass ONLY retrieved sections to AI
   ↓
Generate Draft
```

This prevents hallucinations.

Very important for legal-tech credibility.

---

# AI SYSTEM PROMPT

Your prompt should strongly constrain the model.

Example:

```text
You are an Indian legal drafting assistant.

STRICT RULES:

- Follow Indian High Court drafting conventions.
- Use only supplied legal provisions.
- Never fabricate sections.
- Maintain formal advocate language.
- Generate court-ready structure.
- Preserve factual accuracy.
- Use Indian legal terminology only.
- Maintain professional litigation tone.
```

---

# FINAL PRODUCT STRUCTURE

```text
lexdraft-ai/

frontend/
│
├── components/
├── pages/
├── editor/
├── history/
├── assets/svg/
├── styles/
└── App.jsx

backend/
│
├── routes/
├── services/
├── prompts/
├── legal_db/
├── exporters/
├── models/
└── main.py
```

---

# MVP SCREEN FLOW

```text
Landing Page
   ↓
Draft Workspace
   ↓
Generated Draft
   ↓
Edit + Versions
   ↓
Export
```

---

# LANDING PAGE FEEL

Think:

* Indian legal-tech firm
* premium litigation software
* editorial minimalism

Hero line example:

> “Professional Indian Legal Drafting — Powered by AI.”

Subheading:

> “Generate court-ready legal drafts using structured Indian legal intelligence.”

---

# MOST IMPORTANT THING

Your competitive advantage is NOT:

* authentication
* dashboards
* fancy AI branding

It is:

## drafting quality

*

## Indian legal accuracy

*

## professional legal formatting

That is what lawyers will actually pay for.
