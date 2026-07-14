# Compliance Signal Monitor — Agentic Workflow

A plain-language explanation of how a multi-agent system turns a raw regulatory
update into a reviewed, machine-checkable compliance rule.

> Portfolio note: describes components and flow only — no proprietary rule content,
> internal identifiers, schema details, or client names.

---

## System at a glance

```
                        ┌───────────────────────────────┐
                        │   Scheduled trigger (cron)     │
                        └───────────────┬───────────────┘
                                        ▼
                        ┌───────────────────────────────┐
                        │  Source watcher → change       │
                        │  detector → triage (LLM)       │
                        └───────────────┬───────────────┘
                                        ▼
                              ╔═════════════════╗
                              ║   SIGNAL STORE  ║
                              ╚════════╤════════╝
                                       ▼
        ┌──────────────────────────────────────────────────────────┐
        │           MULTI-AGENT RULE-GENERATION PIPELINE             │
        │                     (orchestrated)                         │
        │                                                            │
        │   Interpreter → [applicable?] → Coding → [grounded?]       │
        │        → Schema-Mapping → Rule-Authoring                   │
        │        → SQL Validator (code) → Critic (LLM) → Packager    │
        └───────────────────────────┬──────────────────────────────┘
                                     ▼
                          ┌────────────────────┐
                          │   VERDICT ROUTING   │
                          └──────────┬─────────┘
             ┌───────────────────────┼───────────────────────┐
             ▼                       ▼                        ▼
     ┌──────────────┐       ┌──────────────┐        ┌──────────────┐
     │  Not         │       │  Needs human │        │  Ready draft │
     │  applicable  │       │  review      │        │              │
     └──────────────┘       └──────────────┘        └──────────────┘
             │                       │                        │
             └───────────────────────┼────────────────────────┘
                                      ▼
                       ╔══════════════════════════════╗
                       ║  DRAFT RULES + AUDIT TRAIL    ║
                       ╚══════════════╤═══════════════╝
                                      ▼
              ┌──────────────────────────────────────────┐
              │  Reviewer dashboard  ·  Email digest       │
              │  Trace viewer  ·  Eval dashboard (offline)  │
              └──────────────────────────────────────────┘
```

Two things flow *out to the side* of the pipeline continuously:
every model call is written to an **audit log**, and an offline
**evaluation harness** re-scores the whole pipeline against a golden set.

---

## The problem

Compliance teams have to monitor a public healthcare-compliance work-plan source,
decide which updates actually matter, and translate each relevant one into a concrete
detection rule that can run against claims data. Done by hand, this is slow, easy to
fall behind on, and hard to audit. The system automates the funnel end to end while
keeping a human in control of what actually ships.

---

## Why multiple agents instead of one prompt

A single model asked to "read this regulatory item and write a detection rule" tends
to do every sub-task mediocrely and hallucinate confidently — inventing codes, data
fields, or logic that look plausible but don't exist. The design instead splits the
work into narrow, single-responsibility agents, each with one job it can be held
accountable for, and inserts **deterministic checks between the reasoning steps** so
errors are caught mechanically rather than trusted.

The guiding principle: **let language models do judgment, let code do verification.**

---

## The pipeline, stage by stage

An orchestrator runs the stages in order, enforces a cost/error budget, and records
everything. Each stage consumes the previous stage's structured output.

Legend:  `( LLM )` = language-model agent   ·   `[ CODE ]` = deterministic check (no LLM)

```
   ( Interpreter )
        │  extracts the concern + applicability judgment
        ▼
   [ applicable? ] ── no ──▶ Outcome: NOT APPLICABLE  (stop, no rule)
        │ yes
        ▼
   ( Reference-Coding )
        │  looks up official codes via tools
        ▼
   [ all codes grounded? ] ── no ──▶ Flag: NEEDS REVIEW
        │ yes
        ▼
   ( Schema-Mapping )   maps concern → real data fields
        │
        ▼
   ( Rule-Authoring )   drafts the detection query
        │
        ▼
   [ SQL Validator ]    parse · unknown field/table · lint   ◀── pure code
        │
        ▼
   ( Critic )           carries validator findings + logic review
        │
        ▼
   [ Packager ]         assemble audit trail + verdict
        │
        ▼
   [ verdict routing ]  ──▶ READY DRAFT  or  NEEDS REVIEW
```

**1. Concern Interpreter**
Reads the regulatory item and extracts the underlying compliance concern in plain,
structured form — what's in scope, what's out of scope. It also makes an early
**applicability judgment**: is this even the kind of concern that maps to a
claim-level billing rule? Many items (grant oversight, IT-security audits, program
administration) are not, and are gated out here before any expensive work happens.

**2. Reference-Coding agent**
Looks up the official medical/billing codes relevant to the concern using dedicated
lookup tools (not from memory). A **grounding post-check** then verifies that every
code in the output actually came back from a tool call — if the agent tried to invent
a code, the run is flagged rather than trusted.

**3. Schema-Mapping agent**
Maps the concern onto the real data fields available in the claims dataset, using a
validated catalog of what fields actually exist. This keeps the eventual rule anchored
to columns that are really there.

**4. Rule-Authoring agent**
Drafts the actual detection query, using only the codes and fields the earlier stages
validated, plus a set of reusable, pre-approved logic fragments for common patterns.

**5. Deterministic SQL Validator (no LLM)**
Parses the drafted query into a syntax tree and checks it mechanically: does it parse,
does it reference only real tables and fields, does it avoid hand-rolling logic that
should use a shared fragment? Because this step is pure code, hallucinated fields or
tables are caught with certainty — *before* any model is asked to reason about the
rule's quality. This is the key move: syntax and existence are settled deterministically
so the LLM reviewer can focus purely on logic.

**6. Reviewer agent ("Critic")**
Reviews the drafted rule. It treats the validator's findings as authoritative and
carries them forward, then adds only the judgment a parser can't make: does the logic
actually match the stated concern (scope drift), and is it written cleanly? It returns
a pass/fail verdict with specific, typed issues.

**7. Packager (no LLM)**
Assembles the complete audit trail — every stage's input and output, the verdict, the
cost — into a single record and writes the draft rule to storage with its review status.

---

## Confidence-based routing (what escalates vs. what ships)

The system never silently auto-approves risky output. Every run resolves to one of
three outcomes, decided by mechanical gates rather than a single confidence score:

```
                          ┌─────────────────────┐
   applicability gate ───▶│   NOT APPLICABLE    │  no rule authored
                          └─────────────────────┘

   grounding fails  ─┐
                     ├──────▶┌─────────────────────┐
   critic fails     ─┘       │   NEEDS HUMAN       │  held + reviewer notes
                             │   REVIEW            │
                             └─────────────────────┘

   parsed clean +            ┌─────────────────────┐
   grounded + ───────────────▶│   READY DRAFT       │  surfaced for approval
   critic passed             └─────────────────────┘
```


- **Not applicable** — the Interpreter's applicability gate determined the item isn't a
  billing-rule concern. No rule is authored; recorded for completeness. (Expected, not
  an error.)
- **Needs human review** — code grounding failed, or the Critic found issues. A rule
  exists, but it's held with the reviewer's notes attached explaining exactly why.
- **Ready draft** — parsed clean, codes grounded, Critic passed. Still surfaced to a
  human for final approval, but with no outstanding flags.

This routing is what makes the automation safe to run: the guardrails escalate anything
uncertain instead of pushing it downstream.

---

## Traceability and audit

Every step is logged at three levels of granularity:

- **Per run** — the pipeline version, final status, total cost, and review verdict.
- **Per model call** — which agent, which model, token counts, cost, and the full
  input and output payloads.
- **Per tool call** — each reference-code lookup the coding agent made.

The result is that any output — a ready rule or a flagged one — can be traced back
through every decision that produced it, including what each agent saw and said. A
reviewer can open a single run and watch the system "think" step by step.

---

## Measuring quality (offline evaluation)

Separately from the live flow, an evaluation harness re-runs the pipeline against a
fixed **golden reference set** of known-good examples and scores each result on a rubric
(did it complete, are the fields valid, does the query parse, did the reviewer pass,
etc.). Scores are stored over time and surfaced in a dashboard alongside the specific
issues the reviewer flagged. This catches quality regressions when prompts or models
change — evaluation rigor that's rare to build but essential for trusting an agentic
system in a compliance setting.

---

## What makes the design non-trivial (interview summary)

- **Separation of judgment and verification** — LLMs reason; deterministic code checks
  existence and syntax, so hallucinations are caught mechanically, not hopefully.
- **Grounding enforcement** — the coding agent literally cannot ship a code it didn't
  look up; the post-check proves it.
- **Confidence-based escalation** — three explicit outcomes gated by real checks, never
  a silent auto-approve.
- **Full audit traceability** — every call, token, and cost logged and replayable.
- **Continuous evaluation** — a golden-set harness scores the whole pipeline so quality
  is measured, not assumed.
