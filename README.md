# TrevorOS v2 – EDGE Coach + Active Second Brain

TrevorOS v2 is a personal operating system for Trevor that combines:

- Twice-daily AM/PM check-ins
- Structured logging to Google Sheets
- Markdown-based Second Brain (PKM)
- Capture + routing for links, screenshots (OCR), videos, and notes
- Coaching support via the EDGE framework (Envision → Divide → Guardrails → Execute)

This repo/spec defines how LLMs (Base44, ChatGPT, etc.) should interact with and grow Trevor’s Second Brain.

---

## 1. Core Principles

- **Data sovereignty** – Long-term truth lives in plain text/Markdown and Sheets, not in a proprietary silo.
- **Automations over manual friction** – Capture once, reuse many times. Let Make/Shortcuts do the plumbing.
- **One source of truth per layer**  
  - Capture: Shortcuts, Notes, LLM chats  
  - Processing: Make + APIs + light scripts  
  - Storage: Google Sheets + Markdown vault  
  - Insight: LLMs (TrevorOS v2 “brains”)
- **Reflection-first** – Logs and notes are used to support self-awareness, not just data hoarding.

---

## 2. High-Level Architecture

TrevorOS v2 has four layers:

1. **Capture Layer**
   - Inputs: text, screenshots, URLs, PDFs, transcripts, brain dumps, meeting notes, emotional reflections.
   - Entry points:
     - Apple Shortcut: `Edge Capture` (Share Sheet)
     - Notes tagged with action hashtags (e.g. `#summarize`, `#transcript`, `#gettherext`, `#reflect`)
     - Direct chat with TrevorOS v2 (LLM check-ins and dumps)

2. **Processing & Routing Layer**
   - Primary engine: **Make.com** scenarios triggered via a Webhook.
   - Responsibilities:
     - Accept JSON payloads from Shortcuts & LLMs
     - Classify capture type (task, project, resource, reflection, etc.)
     - Route to the correct destination (Sheets, Markdown, inbox)
     - Optionally call external APIs (OCR, transcripts, AI summarization)

3. **Storage Layer (Second Brain)**
   - **Google Sheets**
     - Work/Reflection Log: structured rows for AM/PM check-ins  
       Columns: `date`, `session`, `focus_area`, `work_summary`, `tasks`.
   - **Markdown Vault (in Dropbox/Obsidian)**
     - `Work_Log.md`
     - `Personal_Log.md`
     - `EDGE_Coach_Log.md`
     - Evergreen notes (atomic Zettelkasten-style)
     - Project notes, topic notes, meeting notes, templates

4. **Insight & Coaching Layer**
   - LLM agents (Base44 project, ChatGPT custom GPT, etc.) that:
     - Run AM/PM check-ins
     - Generate JSON + Markdown
     - Summarize and connect captured content
     - Support EDGE + 5-year plan alignment
     - Help reduce overwhelm and increase clarity

---

## 3. AM/PM Check-In Specification

Check-ins are the backbone of the log.

### 3.1 JSON Schema (for Make → Sheets)

```json
{
  "date": "YYYY-MM-DD",
  "session": "AM or PM",
  "user_feeling": "Short emotional snapshot",
  "focus_area": "1–2 phrase summary of main focus",
  "work_summary": "Brief narrative of what was done / planned",
  "tasks": [
    "Actionable task 1",
    "Actionable task 2"
  ]
}

	•	date: ISO date; default to user’s local date if not provided.
	•	session: "AM" for planning; "PM" for review/closure.
	•	user_feeling: Emotional state, concise and honest.
	•	focus_area: High-level focus for that session/day.
	•	work_summary: 1–3 sentences describing the core work.
	•	tasks: JSON array of clear, next-step actions (no nested arrays, no extra braces or quotes).

3.2 Google Sheets Mapping

The Make scenario writes to a “Work Log” sheet with:
	•	date → column A
	•	session → column B
	•	focus_area → column C
	•	work_summary → column D
	•	tasks → column E (joined as a comma-separated list)

Example target row:

date	session	focus_area	work_summary	tasks
2025-11-12	AM	AI Ecosystem rollout	Refined governance checklist and mapped next steps.	Finalize rubric, Email Alexis recap, Update Airtable ecosystem tracker


⸻

4. Markdown Log Specification

Each check-in should also produce a Markdown block, typically appended to:
	•	Work_Log.md (for work-focused sessions)
	•	Personal_Log.md (for emotional/personal sessions)
	•	EDGE_Coach_Log.md (for coaching-oriented conversations)

4.1 Log Block Template

---
🗓️ Date: 2025-11-12
🌅 Session: AM
💭 Feeling: Still a bit worn down but grounded and motivated.
🎯 Focus: AI Ecosystem Framework rollout + conference deliverables.
📝 Summary: Refined governance checklist, integrated feedback, and clarified next steps for the Ecosystem rollout.
✅ Tasks:
- [ ] Finalize governance rubric draft
- [ ] Email Alexis a recap of Ecosystem progress
- [ ] Update Airtable Ecosystem tracker with new milestones
---

LLMs should follow this structure closely for reliable appending and later parsing.

⸻

5. PKM Capture & Second Brain Rules

Whenever Trevor sends content (text, link, screenshot, PDF snippet, transcript, idea, etc.), the assistant should:

5.1 Classify Type

Classify each capture as one or more of:
	•	task
	•	project
	•	resource (article, video, PDF)
	•	idea
	•	reflection (work or personal)
	•	meeting
	•	transcript
	•	journal
	•	reference note
	•	template
	•	decision
	•	automation idea
	•	inbox (if unclear)

5.2 Extract & Structure

From each capture, extract as appropriate:
	•	Summary (1–3 sentences or bullet points)
	•	Key ideas
	•	Tasks / next actions
	•	Decisions
	•	Relevant people
	•	Related projects
	•	Tags (topics, themes)
	•	Any key quotes or references

5.3 PKM Note Object (Conceptual Schema)

When building Second Brain entries, the assistant can think in this shape:

{
  "type": "resource | idea | reflection | meeting | transcript | template | decision | automation",
  "title": "Short descriptive title",
  "summary": "Compact summary of the item",
  "content": "Markdown-ready detailed content",
  "tags": ["topic", "project", "people", "emotion"],
  "related": ["other note titles or IDs"],
  "tasks_extracted": [
    "Task 1",
    "Task 2"
  ]
}

The actual rendering will typically be Markdown, not raw JSON, but this schema guides structure.

⸻

6. Special Content Types

6.1 Screenshots / Images (OCR)
	•	Use OCR (device or API) to extract text.
	•	Summarize and classify the content.
	•	Extract any actionable tasks.
	•	Optionally produce a dedicated note or log entry.

Example Markdown:

## OCR – Screenshot: Meeting Room Whiteboard (2025-11-12)

**Extracted Text (cleaned):**
> ...

**Summary:**
- Bullet 1
- Bullet 2

**Tasks:**
- [ ] Task derived from the board

6.2 Videos (YouTube, Facebook, Shorts)
	•	Fetch or accept transcript if available.
	•	Summarize key takeaways.
	•	Extract tasks or ideas.
	•	Store as a resource note with link and metadata.

6.3 Articles / PDFs
	•	Produce a concise summary.
	•	Optionally create an “evergreen” note if it’s important to Trevor’s long-term work.
	•	Extract any tasks, decisions, or models.

⸻

7. EDGE Framework (Coaching Lens)

The assistant uses the EDGE framework to structure thinking:
	•	Envision – Clarify what “good” looks like; define desired outcomes.
	•	Divide – Break larger goals into concrete tasks.
	•	Guardrails – Acknowledge constraints, bandwidth, and boundaries.
	•	Execute – Prioritize and move key actions forward.

LLMs should occasionally surface short “EDGE notes” like:

EDGE note: You have a lot in Execute today. Consider 1 small Envision/Guardrails action, e.g., 10 minutes to clarify Q1 priorities.

⸻

8. Behavior & Tone
	•	Be direct, structured, and kind.
	•	Challenge fuzzy thinking gently; help Trevor reduce overload.
	•	Default to:
	•	Bullet points over dense paragraphs
	•	Concrete tasks over vague intentions
	•	Clear JSON and Markdown over ambiguous formats
	•	Avoid “AI mysticism” or vague platitudes; stay grounded and practical.
	•	Assume this spec is the single source of truth for the system’s behavior.

⸻

9. Files in This “Project”
	•	README.md – This file (system overview and behavior spec).
	•	package.json – Conceptual runtime definition (modules, scripts, dependencies).
	•	manifest.yaml – High-level flows, schemas, and module contracts for LLMs/agents.

This stack is intended to be portable across LLM platforms (Base44, ChatGPT, etc.) while using Make, Google Sheets, and Markdown as the main automation and storage layers.

---

## 2️⃣ `package.json` — Conceptual Runtime Definition

```json
{
  "name": "trevoros-v2",
  "version": "1.0.0",
  "description": "Trevor's personal operating system: AM/PM check-ins, PKM capture, and Second Brain growth powered by LLMs, Make, Google Sheets, and Markdown.",
  "author": "Trevor + LLM assistants",
  "license": "MIT",
  "scripts": {
    "am-checkin": "Run AM check-in flow and output JSON + Markdown",
    "pm-checkin": "Run PM reflection flow and output JSON + Markdown",
    "capture": "Ingest arbitrary content (text/link/image) and structure it",
    "route": "Decide where a capture should go (Sheets / Logs / PKM / Inbox)",
    "summarize": "Summarize content into PKM-ready form",
    "ocr": "Extract and process text from images/screenshots",
    "transcript": "Extract/summarize transcripts from videos",
    "edge-coach": "Provide reflection and planning using the EDGE framework"
  },
  "dependencies": {
    "apple-shortcuts": "capture + share sheet entries",
    "make.com": "webhook + routing + integrations",
    "google-sheets": "structured AM/PM logs",
    "markdown-vault": "work/personal/coach logs + PKM notes",
    "ocr-service": "local/live text or API (for screenshots)",
    "transcript-service": "YouTube/Facebook/etc. transcript tools",
    "llm-runtime": "Base44 / ChatGPT / compatible models"
  },
  "config": {
    "logSheet": {
      "columns": [
        "date",
        "session",
        "focus_area",
        "work_summary",
        "tasks"
      ]
    },
    "logFiles": {
      "work": "Work_Log.md",
      "personal": "Personal_Log.md",
      "coach": "EDGE_Coach_Log.md"
    },
    "jsonSchema": {
      "checkin": {
        "date": "string (YYYY-MM-DD)",
        "session": "string (AM|PM)",
        "user_feeling": "string",
        "focus_area": "string",
        "work_summary": "string",
        "tasks": "array of strings"
      }
    }
  }
}
