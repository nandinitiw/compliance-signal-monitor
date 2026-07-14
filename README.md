# Compliance Signal Monitor

**A multi-agent AI system that turns regulatory updates into reviewed, machine-checkable compliance rules — grounded, routed, and fully auditable.**

> **About this repository.** These are the **design and architecture artifacts** for a
> system I built during an engineering role at a healthcare-compliance startup. It
> contains documentation, diagrams, and a presentation only — **no proprietary source
> code, data, schemas, or client content** is included. Everything here is sanitized and
> describes the system at the level of components and data flow.

---

## The problem

Compliance teams have to monitor a public healthcare-compliance work-plan source, decide
which updates actually matter, and translate each relevant one into a concrete detection
rule that can run against claims data. Done by hand, this is slow, easy to fall behind on,
and hard to audit. This system automates the funnel end to end while keeping a human in
control of what actually ships.

---

## Architecture

![System architecture and data flow](architecture-diagram.png)

A scheduled watcher ingests new regulatory items and triages them into prioritized
*signals*. Each signal flows into an orchestrated pipeline of specialized agents that
drafts a detection rule, verifies it, reviews it, and packages it with a full audit
trail — routing every result to one of three outcomes. An offline evaluation harness
scores the whole pipeline against a golden set.

---

## How it works

The pipeline splits the work across **seven specialized agents**, with **deterministic
checks between the reasoning steps**:

```
Interpreter → Coding → Schema → Rule Author → SQL Validator → Critic → Packager
```

The guiding principle: **let language models do judgment, let code do verification.**

- **Interpreter** — extracts the compliance concern and judges whether it's even a
  billing-rule concern (non-applicable items stop early).
- **Coding** — looks up official billing/diagnosis codes via tools; a grounding check
  proves every code came from a real lookup, so nothing is invented.
- **Schema-Mapping** — maps the concern onto real data fields.
- **Rule Author** — drafts the detection query using only validated fields and codes.
- **SQL Validator** *(no LLM)* — parses the query into a syntax tree and rejects invented
  fields or tables **before** any model reviews it.
- **Critic** — reviews the logic, carrying the validator's findings forward.
- **Packager** *(no LLM)* — assembles the audit trail and the final verdict.

Full walkthrough with diagrams: **[agentic-workflow.md](agentic-workflow.md)**.

---

## What makes the design non-trivial

- **Judgment vs. verification** — LLMs reason; deterministic code confirms existence and
  syntax, so hallucinations are caught mechanically rather than hopefully.
- **Grounding enforcement** — an agent literally cannot ship a code it didn't look up; the
  post-check proves it.
- **Confidence-based escalation** — three explicit outcomes (*not applicable*,
  *needs human review*, *ready draft*) gated by real checks, never a silent auto-approve.
- **Full audit traceability** — every run, model call, and tool call is logged (tokens,
  cost, inputs/outputs) and replayable.
- **Continuous evaluation** — a golden-set harness re-scores the pipeline so quality is
  measured, not assumed. Fixing a validator false-positive bug moved the composite eval
  score from ~58 to ~87 and cut the genuine human-review rate from ~52% to ~24%.

---

## Repository contents

| File | What it is |
|------|------------|
| [`agentic-workflow.md`](agentic-workflow.md) | Plain-language walkthrough of the multi-agent workflow, with ASCII flow diagrams |
| [`architecture-diagram.md`](architecture-diagram.md) | Architecture diagram (Mermaid source) + interview explainer + screenshot notes |
| [`architecture-diagram.png`](architecture-diagram.png) / [`.svg`](architecture-diagram.svg) / [`.mmd`](architecture-diagram.mmd) | Rendered diagram (raster / vector / Mermaid source) |
| [`Compliance-Signal-Monitor.pptx`](Compliance-Signal-Monitor.pptx) | 10-slide presentation of the system |
| [`build-deck.js`](build-deck.js) | The script that generates the slide deck (PptxGenJS) |

---

## Tech context

Built with a TypeScript / Next.js application, a Postgres-backed data and audit layer, a
scheduled ingestion job, and an LLM-agent pipeline with per-agent model routing and
tool-use. *(Implementation code is not included in this repository.)*
