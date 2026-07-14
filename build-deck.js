const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const Fa = require("react-icons/fa");

// ---------------------------------------------------------------- palette
const NAVY = "0F2A43";     // dominant dark
const NAVY2 = "163A5A";    // lighter navy panel
const TEAL = "0D9488";     // primary accent
const TEALL = "5EEAD4";    // light teal
const AMBER = "D97706";    // gates / caution
const GREEN = "16A34A";    // pass / ready
const RED = "DC2626";      // needs review
const SLATE = "334155";    // body text
const MUTE = "64748B";     // muted
const CARD = "F1F6F8";     // card tint
const WHITE = "FFFFFF";

const HEAD = "Cambria";
const BODY = "Calibri";

const shadow = () => ({ type: "outer", color: "000000", blur: 7, offset: 3, angle: 90, opacity: 0.12 });

// ---------------------------------------------------------------- icons
async function png(IconComponent, color, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

async function main() {
  const I = {};
  const need = {
    shield: Fa.FaShieldAlt, robot: Fa.FaRobot, warn: Fa.FaExclamationTriangle,
    scale: Fa.FaBalanceScale, brain: Fa.FaBrain, code: Fa.FaCode,
    diagram: Fa.FaProjectDiagram, check2: Fa.FaCheckDouble, branch: Fa.FaCodeBranch,
    clip: Fa.FaClipboardList, chart: Fa.FaChartLine, bulb: Fa.FaLightbulb,
    ban: Fa.FaBan, user: Fa.FaUserCheck, bolt: Fa.FaBolt, search: Fa.FaSearch,
    layers: Fa.FaLayerGroup, file: Fa.FaFileMedical, sitemap: Fa.FaSitemap,
  };
  for (const [k, C] of Object.entries(need)) {
    I[k] = {};
    I[k].teal = await png(C, "#0D9488");
    I[k].white = await png(C, "#FFFFFF");
    I[k].navy = await png(C, "#0F2A43");
    I[k].amber = await png(C, "#D97706");
    I[k].green = await png(C, "#16A34A");
    I[k].red = await png(C, "#DC2626");
  }

  const p = new pptxgen();
  p.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
  p.author = "Nandini Tiwari";
  p.title = "Compliance Signal Monitor — Multi-Agent System";
  const W = 13.3, H = 7.5, M = 0.7;

  // helper: icon in a filled circle
  function iconCircle(slide, x, y, d, iconData, fill) {
    slide.addShape(p.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, shadow: shadow() });
    const ip = d * 0.5;
    slide.addImage({ data: iconData, x: x + (d - ip) / 2, y: y + (d - ip) / 2, w: ip, h: ip });
  }

  // helper: section title on light slides
  function lightHeader(slide, iconData, kicker, title) {
    iconCircle(slide, M, 0.55, 0.7, iconData, TEAL);
    slide.addText(kicker.toUpperCase(), {
      x: M + 0.95, y: 0.5, w: 9, h: 0.3, margin: 0,
      fontFace: BODY, fontSize: 12, bold: true, color: TEAL, charSpacing: 2,
    });
    slide.addText(title, {
      x: M + 0.95, y: 0.78, w: W - M - 1.9, h: 0.7, margin: 0,
      fontFace: HEAD, fontSize: 30, bold: true, color: NAVY,
    });
  }

  // ============================================================ SLIDE 1 — Title
  {
    const s = p.addSlide();
    s.background = { color: NAVY };
    // faint motif: large diagram icon lower-right
    s.addImage({ data: I.sitemap.navy, x: 8.7, y: 1.7, w: 5.2, h: 5.2, transparency: 82 });
    iconCircle(s, M, 1.5, 1.0, I.shield.white, TEAL);
    s.addText("MULTI-AGENT AI  ·  COMPLIANCE INFRASTRUCTURE", {
      x: M, y: 2.75, w: 11, h: 0.35, margin: 0,
      fontFace: BODY, fontSize: 14, bold: true, color: TEALL, charSpacing: 2,
    });
    s.addText("Compliance Signal Monitor", {
      x: M, y: 3.1, w: 11.5, h: 1.0, margin: 0,
      fontFace: HEAD, fontSize: 52, bold: true, color: WHITE,
    });
    s.addText("A multi-agent system that turns regulatory updates into reviewed,\nmachine-checkable compliance rules — grounded, routed, and fully auditable.", {
      x: M, y: 4.2, w: 11, h: 0.9, margin: 0,
      fontFace: BODY, fontSize: 18, color: "C9D6E2", lineSpacingMultiple: 1.15,
    });
    s.addText([
      { text: "Nandini Tiwari", options: { bold: true, color: WHITE } },
      { text: "   ·   Software Engineering — AI Pipeline & Agent Design", options: { color: "8FA6BC" } },
    ], { x: M, y: 6.4, w: 11, h: 0.4, margin: 0, fontFace: BODY, fontSize: 14 });
    s.addNotes("Open with the one-liner: I built a multi-agent system that turns regulatory updates into machine-checkable compliance rules. The hard part wasn't producing output — it was producing output trustworthy enough to act on.");
  }

  // ============================================================ SLIDE 2 — Problem
  {
    const s = p.addSlide();
    s.background = { color: WHITE };
    lightHeader(s, I.warn.white, "The problem", "Turning regulation into runnable rules is slow and manual");
    s.addText("Compliance teams must watch a public healthcare-compliance work-plan source, decide which updates matter, and translate each relevant one into a concrete detection rule that runs against claims data. By hand, this is a bottleneck.", {
      x: M, y: 1.75, w: 5.4, h: 1.6, margin: 0,
      fontFace: BODY, fontSize: 16, color: SLATE, lineSpacingMultiple: 1.2,
    });
    s.addText("The goal: automate the whole funnel — while keeping a human in control of what ships.", {
      x: M, y: 3.5, w: 5.4, h: 1.0, margin: 0,
      fontFace: BODY, fontSize: 16, italic: true, bold: true, color: TEAL, lineSpacingMultiple: 1.15,
    });
    const rows = [
      [I.file, "Volume", "New and updated items appear continuously; easy to fall behind."],
      [I.scale, "Translation", "Each concern must become precise, valid detection logic — not prose."],
      [I.search, "Auditability", "Every decision must be explainable and traceable for compliance."],
    ];
    let ry = 1.75;
    rows.forEach(([ic, t, d]) => {
      s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 6.5, y: ry, w: 6.1, h: 1.5, rectRadius: 0.08, fill: { color: CARD }, shadow: shadow() });
      iconCircle(s, 6.75, ry + 0.4, 0.7, ic.white, TEAL);
      s.addText(t, { x: 7.7, y: ry + 0.25, w: 4.6, h: 0.4, margin: 0, fontFace: BODY, fontSize: 17, bold: true, color: NAVY });
      s.addText(d, { x: 7.7, y: ry + 0.68, w: 4.7, h: 0.7, margin: 0, fontFace: BODY, fontSize: 13, color: MUTE, lineSpacingMultiple: 1.05 });
      ry += 1.72;
    });
    s.addNotes("Frame the funnel: monitor -> triage -> translate to a rule. Manual, slow, and hard to audit. Emphasize the auditability requirement — it's a compliance setting.");
  }

  // ============================================================ SLIDE 3 — Thesis
  {
    const s = p.addSlide();
    s.background = { color: NAVY };
    s.addText("THE CORE PRINCIPLE", { x: M, y: 0.7, w: 11, h: 0.35, margin: 0, fontFace: BODY, fontSize: 13, bold: true, color: TEALL, charSpacing: 2 });
    s.addText("Let models judge. Let code verify.", {
      x: M, y: 1.05, w: 12, h: 0.9, margin: 0, fontFace: HEAD, fontSize: 40, bold: true, color: WHITE,
    });
    s.addText("LLMs hallucinate confidently — inventing a billing code or a data field that looks perfectly plausible. So reasoning steps are separated by hard, deterministic checks that catch errors mechanically instead of trusting them.", {
      x: M, y: 2.05, w: 11.8, h: 0.9, margin: 0, fontFace: BODY, fontSize: 16, color: "C9D6E2", lineSpacingMultiple: 1.15,
    });
    // two cards
    const card = (x, ic, tag, title, body, accent) => {
      s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y: 3.3, w: 5.75, h: 3.4, rectRadius: 0.1, fill: { color: NAVY2 }, shadow: shadow() });
      iconCircle(s, x + 0.45, 3.75, 0.95, ic, accent);
      s.addText(tag, { x: x + 1.65, y: 3.85, w: 3.9, h: 0.35, margin: 0, fontFace: BODY, fontSize: 12, bold: true, color: accent === TEAL ? TEALL : "F5C77E", charSpacing: 2 });
      s.addText(title, { x: x + 1.65, y: 4.18, w: 3.9, h: 0.55, margin: 0, fontFace: HEAD, fontSize: 22, bold: true, color: WHITE });
      s.addText(body, { x: x + 0.45, y: 5.05, w: 4.9, h: 1.5, margin: 0, fontFace: BODY, fontSize: 14.5, color: "C9D6E2", lineSpacingMultiple: 1.2 });
    };
    card(M, I.brain.white, "( LANGUAGE MODEL )", "Judgment", "Interpreting the concern, choosing relevant codes, mapping intent to data, drafting logic, reviewing for scope and quality.", TEAL);
    card(M + 6.15, I.code.white, "[ DETERMINISTIC CODE ]", "Verification", "Proving codes were really looked up, parsing the query, rejecting fields or tables that don't exist — with certainty, not hope.", AMBER);
    s.addNotes("This is the quotable thesis — say it verbatim. It signals you think about agents the right way: models do judgment, code does verification.");
  }

  // ============================================================ SLIDE 4 — Pipeline
  {
    const s = p.addSlide();
    s.background = { color: WHITE };
    lightHeader(s, I.diagram.white, "How it works", "Seven specialized agents, checked between each step");
    const stages = [
      ["1", "Interpreter", "extracts the concern", TEAL, "LLM"],
      ["2", "Coding", "looks up official codes", TEAL, "LLM"],
      ["3", "Schema Map", "maps to real fields", TEAL, "LLM"],
      ["4", "Rule Author", "drafts the query", TEAL, "LLM"],
      ["5", "SQL Validator", "parse · field check", AMBER, "CODE"],
      ["6", "Critic", "reviews the logic", TEAL, "LLM"],
      ["7", "Packager", "assembles + verdict", AMBER, "CODE"],
    ];
    const n = stages.length, gap = 0.25, cw = (W - 2 * M - gap * (n - 1)) / n;
    let x = M;
    stages.forEach(([num, t, d, ac, kind]) => {
      s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y: 2.15, w: cw, h: 2.35, rectRadius: 0.08, fill: { color: kind === "CODE" ? "FDF3E6" : CARD }, shadow: shadow() });
      iconCircle(s, x + cw / 2 - 0.35, 2.4, 0.7, kind === "CODE" ? I.code.white : I.brain.white, ac);
      s.addText(num, { x: x + 0.12, y: 2.28, w: 0.5, h: 0.4, margin: 0, fontFace: HEAD, fontSize: 20, bold: true, color: ac });
      s.addText(t, { x: x + 0.08, y: 3.25, w: cw - 0.16, h: 0.55, margin: 0, align: "center", fontFace: BODY, fontSize: 13.5, bold: true, color: NAVY });
      s.addText(d, { x: x + 0.05, y: 3.75, w: cw - 0.1, h: 0.55, margin: 0, align: "center", fontFace: BODY, fontSize: 10.5, color: MUTE, lineSpacingMultiple: 1.0 });
      s.addText(kind, { x: x, y: 4.18, w: cw, h: 0.25, margin: 0, align: "center", fontFace: BODY, fontSize: 8.5, bold: true, color: ac, charSpacing: 1 });
      if (x + cw < W - M - 0.1) {
        s.addText("›", { x: x + cw - 0.02, y: 2.9, w: gap + 0.04, h: 0.6, margin: 0, align: "center", fontFace: BODY, fontSize: 22, bold: true, color: MUTE });
      }
      x += cw + gap;
    });
    // inline gates note
    s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: M, y: 5.1, w: W - 2 * M, h: 1.55, rectRadius: 0.08, fill: { color: NAVY }, shadow: shadow() });
    iconCircle(s, M + 0.4, 5.45, 0.85, I.branch.white, TEAL);
    s.addText("Two decision gates run inside the pipeline", { x: M + 1.5, y: 5.35, w: 10, h: 0.4, margin: 0, fontFace: BODY, fontSize: 16, bold: true, color: WHITE });
    s.addText([
      { text: "Applicable?  ", options: { bold: true, color: TEALL } },
      { text: "non-billing items stop early (not applicable).      ", options: { color: "C9D6E2" } },
      { text: "Grounded?  ", options: { bold: true, color: TEALL } },
      { text: "an invented code is flagged before the query is ever written.", options: { color: "C9D6E2" } },
    ], { x: M + 1.5, y: 5.78, w: 10.9, h: 0.7, margin: 0, fontFace: BODY, fontSize: 13.5, lineSpacingMultiple: 1.1 });
    s.addNotes("Walk left to right. Note the two orange stages are pure code, not LLMs. The gates are the escalation points — applicability and grounding.");
  }

  // ============================================================ SLIDE 5 — Guardrails
  {
    const s = p.addSlide();
    s.background = { color: WHITE };
    lightHeader(s, I.check2.white, "Guardrails", "Deterministic checks catch what LLMs get wrong");
    const g = (x, ic, title, body, catchLabel, catchVal) => {
      s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y: 1.85, w: 5.75, h: 4.7, rectRadius: 0.1, fill: { color: CARD }, shadow: shadow() });
      iconCircle(s, x + 0.5, 2.25, 1.0, ic, TEAL);
      s.addText(title, { x: x + 0.5, y: 3.45, w: 4.8, h: 0.55, margin: 0, fontFace: HEAD, fontSize: 21, bold: true, color: NAVY });
      s.addText(body, { x: x + 0.5, y: 4.05, w: 4.85, h: 1.5, margin: 0, fontFace: BODY, fontSize: 14.5, color: SLATE, lineSpacingMultiple: 1.2 });
      s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: x + 0.5, y: 5.55, w: 4.85, h: 0.75, rectRadius: 0.06, fill: { color: "E3EFEC" } });
      s.addText([
        { text: catchLabel + "  ", options: { bold: true, color: TEAL } },
        { text: catchVal, options: { color: SLATE } },
      ], { x: x + 0.7, y: 5.55, w: 4.5, h: 0.75, margin: 0, valign: "middle", fontFace: BODY, fontSize: 12.5, lineSpacingMultiple: 1.05 });
    };
    g(M, I.check2.white, "Grounding enforcement", "The coding agent cannot ship a code it didn't retrieve from a lookup tool. A post-check verifies every output code came from a real tool call.", "Catches:", "fabricated billing / diagnosis codes");
    g(M + 6.15, I.code.white, "Deterministic SQL validator", "Before the reviewer weighs in, the drafted query is parsed into a syntax tree and checked against the real schema — no LLM involved.", "Catches:", "invented fields, unknown tables, bad syntax");
    s.addNotes("Key point: because syntax and existence are settled by code, the LLM critic can focus purely on logic. Mention the validator false-positive bug you fixed if asked.");
  }

  // ============================================================ SLIDE 6 — Routing
  {
    const s = p.addSlide();
    s.background = { color: WHITE };
    lightHeader(s, I.branch.white, "Confidence routing", "Three outcomes — never a silent auto-approve");
    const out = [
      [I.ban, "Not applicable", "AMBER", AMBER, "Interpreter's gate found no billing-rule concern.", "No rule authored — recorded for completeness."],
      [I.user, "Needs human review", "RED", RED, "Code grounding failed, or the Critic found issues.", "Held with reviewer notes explaining exactly why."],
      [I.check2, "Ready draft", "GREEN", GREEN, "Parsed clean, codes grounded, Critic passed.", "Surfaced for final human approval — no flags."],
    ];
    const n = 3, gap = 0.4, cw = (W - 2 * M - gap * (n - 1)) / n;
    let x = M;
    out.forEach(([ic, t, _c, ac, trig, res]) => {
      s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y: 1.95, w: cw, h: 4.5, rectRadius: 0.1, fill: { color: CARD }, shadow: shadow() });
      iconCircle(s, x + cw / 2 - 0.55, 2.35, 1.1, ic.white, ac);
      s.addText(t, { x: x + 0.2, y: 3.65, w: cw - 0.4, h: 0.5, margin: 0, align: "center", fontFace: HEAD, fontSize: 19, bold: true, color: NAVY });
      s.addText("TRIGGER", { x: x + 0.35, y: 4.25, w: cw - 0.7, h: 0.28, margin: 0, fontFace: BODY, fontSize: 10, bold: true, color: ac, charSpacing: 1.5 });
      s.addText(trig, { x: x + 0.35, y: 4.5, w: cw - 0.7, h: 0.85, margin: 0, fontFace: BODY, fontSize: 12.5, color: SLATE, lineSpacingMultiple: 1.1 });
      s.addText("RESULT", { x: x + 0.35, y: 5.4, w: cw - 0.7, h: 0.28, margin: 0, fontFace: BODY, fontSize: 10, bold: true, color: ac, charSpacing: 1.5 });
      s.addText(res, { x: x + 0.35, y: 5.65, w: cw - 0.7, h: 0.75, margin: 0, fontFace: BODY, fontSize: 12.5, color: SLATE, lineSpacingMultiple: 1.1 });
      x += cw + gap;
    });
    s.addNotes("This is the safety story — every run resolves to one of three outcomes by real checks, not a single confidence number. Nothing auto-approves silently.");
  }

  // ============================================================ SLIDE 7 — Traceability
  {
    const s = p.addSlide();
    s.background = { color: NAVY };
    iconCircle(s, M, 0.6, 0.7, I.clip.white, TEAL);
    s.addText("TRACEABILITY & AUDIT", { x: M + 0.95, y: 0.55, w: 9, h: 0.3, margin: 0, fontFace: BODY, fontSize: 12, bold: true, color: TEALL, charSpacing: 2 });
    s.addText("Every decision is logged and replayable", { x: M + 0.95, y: 0.83, w: 11, h: 0.6, margin: 0, fontFace: HEAD, fontSize: 30, bold: true, color: WHITE });
    const lv = [
      [I.sitemap, "Per run", "Pipeline version, final status, total cost, and the review verdict."],
      [I.robot, "Per model call", "Which agent, which model, token counts, cost, and full input / output payloads."],
      [I.search, "Per tool call", "Each reference-code lookup the coding agent made, individually recorded."],
    ];
    let y = 1.95;
    lv.forEach(([ic, t, d]) => {
      s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: M, y, w: 8.0, h: 1.35, rectRadius: 0.08, fill: { color: NAVY2 }, shadow: shadow() });
      iconCircle(s, M + 0.35, y + 0.33, 0.7, ic.white, TEAL);
      s.addText(t, { x: M + 1.3, y: y + 0.2, w: 6.4, h: 0.4, margin: 0, fontFace: BODY, fontSize: 17, bold: true, color: WHITE });
      s.addText(d, { x: M + 1.3, y: y + 0.62, w: 6.5, h: 0.6, margin: 0, fontFace: BODY, fontSize: 13, color: "C9D6E2", lineSpacingMultiple: 1.05 });
      y += 1.5;
    });
    // side callout
    s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 9.2, y: 1.95, w: 3.4, h: 4.35, rectRadius: 0.1, fill: { color: TEAL }, shadow: shadow() });
    iconCircle(s, 9.2 + 1.2, 2.35, 1.0, I.search.white, NAVY);
    s.addText("Open one run and watch the system “think” — step by step, with what each agent saw and said.", {
      x: 9.5, y: 3.6, w: 2.8, h: 2.4, margin: 0, align: "center", fontFace: BODY, fontSize: 16, bold: true, color: WHITE, lineSpacingMultiple: 1.2,
    });
    s.addNotes("Traceability is a first-class feature, not an afterthought. In a compliance setting you must be able to answer 'why did it do that' for any output.");
  }

  // ============================================================ SLIDE 8 — Evaluation + chart
  {
    const s = p.addSlide();
    s.background = { color: WHITE };
    lightHeader(s, I.chart.white, "Quality evaluation", "Measuring the pipeline, not assuming it works");
    s.addText("An offline harness re-runs the full pipeline against a fixed golden reference set and scores each result on a rubric — completion, valid fields, query parses, reviewer verdict. Scores are tracked over time to catch regressions when a prompt or model changes.", {
      x: M, y: 1.8, w: 5.5, h: 2.1, margin: 0, fontFace: BODY, fontSize: 15.5, color: SLATE, lineSpacingMultiple: 1.25,
    });
    s.addText("A fixed validator bug was inflating the review rate — resolving it dropped genuine manual review from ~52% to ~24% without missing real errors.", {
      x: M, y: 4.0, w: 5.5, h: 1.5, margin: 0, fontFace: BODY, fontSize: 14.5, italic: true, bold: true, color: TEAL, lineSpacingMultiple: 1.2,
    });
    s.addChart(p.charts.BAR, [{
      name: "Composite score", labels: ["Baseline", "After fixes"], values: [57.9, 86.8],
    }], {
      x: 6.6, y: 1.95, w: 6.0, h: 4.5, barDir: "col",
      chartColors: [TEAL],
      chartArea: { fill: { color: WHITE } },
      catAxisLabelColor: SLATE, catAxisLabelFontSize: 13, catAxisLabelFontBold: true,
      valAxisLabelColor: MUTE, valAxisHidden: false, valAxisMinVal: 0, valAxisMaxVal: 100,
      valGridLine: { color: "E2E8F0", size: 0.5 }, catGridLine: { style: "none" },
      showValue: true, dataLabelPosition: "outEnd", dataLabelColor: NAVY, dataLabelFontBold: true, dataLabelFontSize: 15,
      showLegend: false, showTitle: true, title: "Pipeline eval score (of 100)", titleColor: NAVY, titleFontSize: 14, titleFontFace: BODY,
      barGapWidthPct: 60,
    });
    s.addNotes("Evaluation rigor is rare in portfolios and impressive here. Tell the false-positive story: a guardrail that cries wolf is nearly as bad as none.");
  }

  // ============================================================ SLIDE 9 — Results
  {
    const s = p.addSlide();
    s.background = { color: WHITE };
    lightHeader(s, I.bolt.white, "Results", "Reliable, cheap, and honest about uncertainty");
    const stats = [
      ["25 / 25", "runs completed with zero crashes in batch testing", GREEN],
      ["~24%", "genuine human-review rate, down from 52% after guardrail fixes", TEAL],
      ["~11¢", "average cost per signal processed end to end", NAVY],
      ["15 / 15", "SQL-validator unit tests passing, incl. hallucination guards", AMBER],
    ];
    const n = 4, gap = 0.4, cw = (W - 2 * M - gap * (n - 1)) / n;
    let x = M;
    stats.forEach(([big, lab, ac]) => {
      s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y: 2.1, w: cw, h: 3.9, rectRadius: 0.1, fill: { color: CARD }, shadow: shadow() });
      s.addText(big, { x: x + 0.15, y: 2.75, w: cw - 0.3, h: 1.0, margin: 0, align: "center", fontFace: HEAD, fontSize: 40, bold: true, color: ac });
      s.addShape(p.shapes.LINE, { x: x + cw / 2 - 0.4, y: 3.85, w: 0.8, h: 0, line: { color: ac, width: 2 } });
      s.addText(lab, { x: x + 0.3, y: 4.05, w: cw - 0.6, h: 1.7, margin: 0, align: "center", fontFace: BODY, fontSize: 13.5, color: SLATE, lineSpacingMultiple: 1.2 });
      x += cw + gap;
    });
    s.addText("The system flags its own uncertainty instead of shipping bad SQL — the review rate reflects real issues caught, not noise.", {
      x: M, y: 6.25, w: W - 2 * M, h: 0.5, margin: 0, align: "center", fontFace: BODY, fontSize: 14, italic: true, color: MUTE,
    });
    s.addNotes("Lead with reliability (zero crashes), then the honesty of the review rate. The 52->24 drop shows engineering judgment, not just building.");
  }

  // ============================================================ SLIDE 10 — Why it matters
  {
    const s = p.addSlide();
    s.background = { color: NAVY };
    s.addImage({ data: I.bulb.navy, x: 9.0, y: 1.6, w: 5.0, h: 5.0, transparency: 84 });
    iconCircle(s, M, 0.7, 0.9, I.bulb.white, TEAL);
    s.addText("WHY THE DESIGN MATTERS", { x: M + 1.15, y: 0.72, w: 9, h: 0.32, margin: 0, fontFace: BODY, fontSize: 13, bold: true, color: TEALL, charSpacing: 2 });
    s.addText("Building agents you can trust to act", { x: M + 1.15, y: 1.02, w: 11, h: 0.6, margin: 0, fontFace: HEAD, fontSize: 30, bold: true, color: WHITE });
    const pts = [
      ["Judgment vs. verification", "LLMs reason; deterministic code confirms existence and syntax — hallucinations are caught mechanically, not hopefully."],
      ["Grounding enforcement", "An agent literally cannot ship a fact it didn't look up; the post-check proves it."],
      ["Confidence-based escalation", "Three explicit outcomes gated by real checks — never a silent auto-approve."],
      ["Traceable & continuously evaluated", "Every call logged and replayable; a golden-set harness scores quality instead of assuming it."],
    ];
    let y = 2.05;
    pts.forEach(([t, d]) => {
      iconCircle(s, M, y + 0.05, 0.5, I.check2.white, TEAL);
      s.addText(t, { x: M + 0.75, y: y - 0.05, w: 7.6, h: 0.4, margin: 0, fontFace: BODY, fontSize: 17, bold: true, color: WHITE });
      s.addText(d, { x: M + 0.75, y: y + 0.35, w: 7.7, h: 0.65, margin: 0, fontFace: BODY, fontSize: 13, color: "C9D6E2", lineSpacingMultiple: 1.1 });
      y += 1.15;
    });
    s.addText("The same instinct scales to any autonomous agent acting with real-world consequences.", {
      x: M, y: 6.75, w: 11.5, h: 0.5, margin: 0, fontFace: BODY, fontSize: 15, italic: true, bold: true, color: TEALL,
    });
    s.addNotes("Close on the transferable lesson: verification between reasoning steps and measuring agent quality. This is the instinct that matters for any system that acts on its own.");
  }

  await p.writeFile({ fileName: "Compliance-Signal-Monitor.pptx" });
  console.log("done");
}

main().catch(e => { console.error(e); process.exit(1); });
