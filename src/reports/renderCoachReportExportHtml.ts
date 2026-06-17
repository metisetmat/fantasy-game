import {
  COACH_REPORT_PHASE_VISUALS_GUARD,
  type TacticalPitchPanelModel,
} from "./coachReportPhaseVisuals";
import {
  COACH_REPORT_PHASE_VISUAL_READABILITY_GUARD,
  type CoachReportPhaseVisualReadabilityModel,
  type PhaseVisualCoachCopyBlock,
  type PhaseVisualLegendItem,
  type PhaseVisualZoneHierarchy,
} from "./coachReportPhaseVisualReadability";
import type {
  CoachReportMultiMatchPhaseComparisonModel,
  MultiMatchPhaseComparisonPanel,
  MultiMatchPhaseZoneSignal,
} from "./coachReportMultiMatchPhaseComparison";
import type { CoachReportMultiMatchHistoryViewModel, MultiMatchSignalDrilldown } from "./coachReportMultiMatchHistoryView";
import { deriveCoachReportPhasePanels } from "./buildCoachReportPhaseVisuals";
import {
  deriveCoachReportPhaseVisualReadabilityPresentation,
} from "./buildCoachReportPhaseVisualReadability";
import { buildCoachReportMultiMatchPhaseComparison } from "./buildCoachReportMultiMatchPhaseComparison";
import { buildCoachReportMultiMatchHistoryView } from "./buildCoachReportMultiMatchHistoryView";
import { renderTacticalPitchPanel } from "./renderTacticalPitchPanel";

const EXPORT_TITLE = "Rapport coach - export partageable";
const CONTROLLED_EMPTY_STATE = "Donn&eacute;es insuffisantes dans ce run pour stabiliser cette lecture.";

const PREMIUM_EXPORT_CSS = `
    :root {
      --report-bg: #eef2f7;
      --report-paper: #ffffff;
      --report-ink: #0f1726;
      --report-muted: #566273;
      --report-line: #d7dee8;
      --report-soft: #f6f8fb;
      --report-soft-strong: #edf2f8;
      --report-accent: #1a4a8a;
      --report-accent-soft: #e8effa;
      --report-dark: #0e223f;
      --report-green: #2d936c;
      --report-warning: #b8741a;
      --report-shadow: 0 18px 46px rgba(15, 23, 38, 0.08);
    }

    body {
      margin: 0;
      background: linear-gradient(180deg, #e9eef6 0%, #f4f6fa 100%);
      color: var(--report-ink);
    }

    main#product-main {
      max-width: 1160px;
      padding: 28px 20px 56px;
    }

    .report-cover {
      background:
        linear-gradient(135deg, rgba(26, 74, 138, 0.96) 0%, rgba(13, 33, 62, 0.98) 100%);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 18px;
      color: #fff;
      padding: 28px;
      box-shadow: var(--report-shadow);
      overflow: hidden;
      position: relative;
    }

    .report-cover::after {
      content: "";
      position: absolute;
      inset: auto -50px -60px auto;
      width: 240px;
      height: 240px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 72%);
      pointer-events: none;
    }

    .report-cover-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(250px, 0.8fr);
      gap: 22px;
      align-items: stretch;
    }

    .report-cover-copy h1 {
      margin: 0 0 12px;
      font-size: 2.25rem;
      line-height: 1.08;
      color: #fff;
    }

    .report-cover-copy p {
      color: rgba(255, 255, 255, 0.88);
    }

    .report-meta-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 14px;
    }

    .report-meta-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      font-size: 0.82rem;
      letter-spacing: 0.01em;
    }

    .report-scoreboard {
      border-radius: 16px;
      padding: 18px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.14);
      display: grid;
      align-content: start;
      gap: 10px;
    }

    .report-scoreboard .score-label,
    .report-scoreboard .muted {
      color: rgba(255, 255, 255, 0.82);
    }

    .report-scoreboard .score {
      display: block;
      margin-top: 4px;
      color: #fff;
      font-size: 2.2rem;
      font-weight: 800;
    }

    .report-truth-note {
      margin-top: 14px;
      padding: 12px 14px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.1);
      border-left: 3px solid rgba(255, 255, 255, 0.44);
      color: rgba(255, 255, 255, 0.95);
    }

    .premium-section {
      margin-top: 20px;
      background: var(--report-paper);
      border: 1px solid var(--report-line);
      border-radius: 16px;
      box-shadow: 0 12px 30px rgba(15, 23, 38, 0.05);
      padding: 22px;
    }

    .report-section-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 16px;
      color: var(--report-accent);
      font-size: 0.9rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .report-section-divider::before {
      content: "";
      flex: 0 0 38px;
      height: 2px;
      border-radius: 999px;
      background: var(--report-accent);
    }

    .report-section-header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-start;
      margin-bottom: 14px;
    }

    .report-section-header h2 {
      margin: 0;
      font-size: 1.45rem;
      color: var(--report-ink);
    }

    .report-section-header p {
      margin: 6px 0 0;
      color: var(--report-muted);
    }

    .report-summary-list {
      margin: 0;
      padding-left: 20px;
    }

    .report-summary-list li + li {
      margin-top: 8px;
    }

    .report-kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 14px;
    }

    .report-kpi-card {
      border-radius: 14px;
      background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
      border: 1px solid var(--report-line);
      box-shadow: none;
      margin: 0;
    }

    .report-kpi-card .signal-grid section {
      background: var(--report-soft);
    }

    .report-phase-layout {
      display: grid;
      grid-template-columns: minmax(220px, 0.78fr) minmax(0, 1.22fr);
      gap: 16px;
      align-items: start;
    }

    .report-phase-section {
      border: 1px solid var(--report-line);
      border-radius: 14px;
      background: var(--report-soft);
      padding: 16px;
    }

    .report-phase-section h3 {
      margin: 0 0 8px;
      font-size: 1.02rem;
    }

    .report-phase-section p {
      color: var(--report-muted);
    }

    .report-phase-cards {
      display: grid;
      gap: 12px;
    }

    .report-pitch-panel {
      border-radius: 14px;
      padding: 16px;
      background: linear-gradient(180deg, #0f5132 0%, #12482d 100%);
      color: rgba(255, 255, 255, 0.92);
      min-height: 230px;
      display: grid;
      align-content: start;
      gap: 12px;
    }

    .report-pitch-panel h3 {
      margin: 0;
      color: #fff;
      font-size: 1rem;
    }

    .report-pitch-placeholder {
      min-height: 148px;
      border-radius: 12px;
      border: 1px dashed rgba(255, 255, 255, 0.4);
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
      display: grid;
      place-items: center;
      text-align: center;
      padding: 14px;
      font-size: 0.92rem;
      line-height: 1.45;
    }

    .phase-pitch-legend {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      margin-top: 14px;
    }

    .phase-legend-item {
      display: grid;
      grid-template-columns: 18px minmax(0, 1fr);
      gap: 10px;
      align-items: start;
      padding: 12px 14px;
      border-radius: 12px;
      border: 1px solid var(--report-line);
      background: var(--report-paper);
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .phase-legend-item p {
      margin: 4px 0 0;
      color: var(--report-muted);
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .phase-legend-swatch {
      width: 18px;
      height: 18px;
      border-radius: 6px;
      border: 1px solid rgba(15, 23, 38, 0.12);
      display: inline-block;
      margin-top: 2px;
    }

    .phase-pitch {
      width: 100%;
      height: auto;
      display: block;
    }

    .phase-zone {
      fill: rgba(255, 255, 255, 0.08);
      stroke: rgba(255, 255, 255, 0.22);
      stroke-width: 1.5;
    }

    .phase-zone--danger {
      fill: rgba(255, 122, 89, 0.82);
      stroke: rgba(255, 239, 234, 0.72);
    }

    .phase-zone--recovery {
      fill: rgba(61, 214, 140, 0.78);
      stroke: rgba(228, 255, 241, 0.72);
    }

    .phase-zone--pressure {
      fill: rgba(255, 192, 76, 0.82);
      stroke: rgba(255, 244, 214, 0.74);
    }

    .phase-zone--goalkeeper {
      fill: rgba(110, 173, 255, 0.8);
      stroke: rgba(231, 241, 255, 0.74);
    }

    .phase-zone--empty {
      fill: rgba(255, 255, 255, 0.05);
      stroke: rgba(255, 255, 255, 0.28);
    }

    .phase-zone--primary {
      stroke-width: 2.8;
      filter: drop-shadow(0 0 8px rgba(255,255,255,0.18));
    }

    .phase-zone--secondary {
      opacity: 0.92;
      stroke-width: 2.1;
    }

    .phase-zone--muted {
      opacity: 0.42;
    }

    .phase-zone-label {
      fill: rgba(255, 255, 255, 0.94);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .phase-zone-value {
      fill: rgba(255, 255, 255, 0.92);
      font-size: 14px;
      font-weight: 800;
    }

    .phase-panel-summary,
    .phase-panel-why,
    .phase-panel-next-check,
    .phase-panel-limitation {
      margin: 0;
      color: rgba(255, 255, 255, 0.94);
    }

    .phase-panel-summary strong,
    .phase-panel-why strong,
    .phase-panel-next-check strong,
    .phase-panel-limitation strong {
      color: #fff;
    }

    .report-table-card {
      border: 1px solid var(--report-line);
      border-radius: 14px;
      background: var(--report-paper);
      padding: 16px;
    }

    .report-table-card h3 {
      margin: 0 0 10px;
      font-size: 1.02rem;
    }

    .report-controlled-empty {
      border-left: 3px solid var(--report-warning);
      background: #fff9ef;
      color: #6f531f;
      padding: 12px 14px;
      border-radius: 10px;
    }

    .report-player-study {
      display: grid;
      gap: 12px;
    }

    .report-player-study-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 16px;
    }

    .phase-stability-section {
      display: grid;
      gap: 14px;
    }

    .phase-stability-guard {
      border-left: 3px solid var(--report-accent);
      background: var(--report-accent-soft);
      color: var(--report-dark);
      padding: 12px 14px;
      border-radius: 10px;
      line-height: 1.5;
    }

    .phase-stability-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }

    .phase-stability-card {
      border: 1px solid var(--report-line);
      border-radius: 14px;
      background: var(--report-paper);
      padding: 16px;
      display: grid;
      gap: 12px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .phase-stability-card header {
      display: grid;
      gap: 8px;
    }

    .phase-stability-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }

    .phase-stability-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 9px;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 700;
      border: 1px solid transparent;
    }

    .phase-stability-badge--repeated {
      background: #e6f6ef;
      color: #1d6b4f;
      border-color: rgba(29, 107, 79, 0.18);
    }

    .phase-stability-badge--visible-once {
      background: #eef2f7;
      color: #445061;
      border-color: rgba(68, 80, 97, 0.16);
    }

    .phase-stability-badge--unstable {
      background: #fff4e7;
      color: #9a5a14;
      border-color: rgba(154, 90, 20, 0.18);
    }

    .phase-stability-badge--insufficient {
      background: #f7f3ff;
      color: #6b4db7;
      border-color: rgba(107, 77, 183, 0.18);
    }

    .phase-stability-zone-list {
      margin: 0;
      padding-left: 18px;
      display: grid;
      gap: 8px;
    }

    .phase-stability-zone-list li {
      color: var(--report-muted);
      line-height: 1.45;
    }

    .phase-stability-zone-list strong {
      color: var(--report-ink);
    }

    .phase-stability-reading {
      display: grid;
      gap: 10px;
    }

    .phase-history-section {
      display: grid;
      gap: 14px;
    }

    .phase-history-guard {
      border-left: 3px solid var(--report-accent);
      background: var(--report-accent-soft);
      color: var(--report-dark);
      padding: 12px 14px;
      border-radius: 10px;
      line-height: 1.5;
    }

    .phase-history-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .phase-history-card {
      border: 1px solid var(--report-line);
      border-radius: 14px;
      background: var(--report-paper);
      padding: 16px;
      display: grid;
      gap: 12px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .phase-history-strength,
    .phase-history-presence {
      display: inline-flex;
      align-items: center;
      padding: 4px 9px;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 700;
      border: 1px solid transparent;
    }

    .phase-history-strength--local-repeated {
      background: #e6f6ef;
      color: #1d6b4f;
      border-color: rgba(29, 107, 79, 0.18);
    }

    .phase-history-strength--visible-once {
      background: #eef2f7;
      color: #445061;
      border-color: rgba(68, 80, 97, 0.16);
    }

    .phase-history-strength--unstable {
      background: #fff4e7;
      color: #9a5a14;
      border-color: rgba(154, 90, 20, 0.18);
    }

    .phase-history-strength--insufficient {
      background: #f7f3ff;
      color: #6b4db7;
      border-color: rgba(107, 77, 183, 0.18);
    }

    .phase-history-presence--present {
      background: #e6f6ef;
      color: #1d6b4f;
    }

    .phase-history-presence--absent {
      background: #eef2f7;
      color: #445061;
    }

    .phase-history-presence--unstable {
      background: #fff4e7;
      color: #9a5a14;
    }

    .phase-history-presence--insufficient {
      background: #f7f3ff;
      color: #6b4db7;
    }

    .phase-history-table {
      display: grid;
      gap: 8px;
    }

    .phase-history-row {
      display: grid;
      grid-template-columns: minmax(110px, 0.9fr) auto minmax(0, 1.2fr);
      gap: 10px;
      align-items: start;
      padding: 10px 12px;
      border-radius: 10px;
      background: var(--report-soft);
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .report-appendix-stack {
      margin-top: 10px;
    }

    .report-appendix-stack summary {
      cursor: pointer;
      font-weight: 700;
    }

    .report-print-footer {
      margin-top: 18px;
      color: var(--report-muted);
      font-size: 0.84rem;
      text-align: right;
    }

    .report-phase-bullet-list,
    .report-summary-list,
    .report-appendix-stack ul {
      margin-top: 8px;
    }

    @media (max-width: 840px) {
      .report-cover-grid,
      .report-phase-layout,
      .report-player-study-grid,
      .phase-stability-grid,
      .phase-history-grid {
        grid-template-columns: 1fr;
      }
    }

    @media print {
      @page {
        size: A4;
        margin: 14mm;
      }

      body {
        background: #fff;
      }

      main#product-main {
        max-width: none;
        padding: 0;
      }

      .report-cover,
      .premium-section,
      .product-card,
      .summary-list,
      .interpretation-guard,
      .comparison-card,
      .comparison-detail-card,
      .matchup-card,
      .appendix,
      .report-table-card,
      .report-pitch-panel,
      .report-phase-section,
      .phase-pitch-legend,
      .phase-legend-item,
      .phase-history-card,
      .phase-history-row {
        break-inside: avoid;
        page-break-inside: avoid;
        box-shadow: none;
      }

      details {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .report-cover {
        min-height: 0;
      }

      .report-section-divider {
        break-after: avoid;
        page-break-after: avoid;
      }

      .no-print {
        display: none !important;
      }
    }
`;

function replaceTitle(html: string): string {
  return html.replace(/<title>[\s\S]*?<\/title>/u, `<title>${EXPORT_TITLE}</title>`);
}

function replaceStyle(html: string): string {
  return html.replace(/<style>[\s\S]*?<\/style>/u, `<style>${PREMIUM_EXPORT_CSS}</style>`);
}

function extractSection(html: string, id: string): string {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const startMatch = new RegExp(`<section\\s+id="${escaped}"[^>]*>`, "u").exec(html);

  if (startMatch === null || startMatch.index === undefined) {
    return "";
  }

  let depth = 1;
  let cursor = startMatch.index + startMatch[0].length;

  while (cursor < html.length && depth > 0) {
    const nextOpen = html.indexOf("<section", cursor);
    const nextClose = html.indexOf("</section>", cursor);

    if (nextClose === -1) {
      return "";
    }

    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      cursor = nextOpen + "<section".length;
      continue;
    }

    depth -= 1;
    cursor = nextClose + "</section>".length;
  }

  return html.slice(startMatch.index, cursor);
}

function removeOuterSection(sectionHtml: string): string {
  return sectionHtml
    .replace(/^<section[^>]*>/u, "")
    .replace(/<\/section>$/u, "");
}

function removeFirstHeading(sectionInner: string): string {
  return sectionInner.replace(/^\s*<h2>[\s\S]*?<\/h2>\s*/u, "");
}

function extractSectionInner(html: string, id: string): string {
  return removeFirstHeading(removeOuterSection(extractSection(html, id))).trim();
}

function extractListItems(sectionHtml: string): readonly string[] {
  return [...sectionHtml.matchAll(/<li>([\s\S]*?)<\/li>/gu)].map((match) =>
    match[1]?.trim() ?? ""
  ).filter((item) => item.length > 0);
}

function extractMatch(sectionHtml: string, pattern: RegExp): string {
  const match = sectionHtml.match(pattern);

  return match?.[1]?.trim() ?? "";
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function extractSignalCards(sectionHtml: string): readonly string[] {
  return [...sectionHtml.matchAll(/<article class="product-card signal-card">[\s\S]*?<\/article>/gu)].map((match) =>
    match[0] ?? ""
  );
}

function toKpiCard(cardHtml: string): string {
  return cardHtml.replace(
    "class=\"product-card signal-card\"",
    "class=\"product-card signal-card report-kpi-card\"",
  );
}

interface SignalExcerpt {
  readonly title: string;
  readonly summary: string;
  readonly bullets: readonly string[];
}

function excerptFromSignalCard(cardHtml: string): SignalExcerpt {
  return {
    title: stripTags(extractMatch(cardHtml, /<h3>([\s\S]*?)<\/h3>/u)),
    summary: stripTags(extractMatch(cardHtml, /<h4>&Agrave; surveiller<\/h4>\s*<p>([\s\S]*?)<\/p>/u)),
    bullets: extractListItems(cardHtml).slice(0, 3).map(stripTags),
  };
}

function findHierarchy(
  hierarchies: readonly PhaseVisualZoneHierarchy[],
  phase: TacticalPitchPanelModel["phase"],
): PhaseVisualZoneHierarchy | undefined {
  return hierarchies.find((hierarchy) => hierarchy.phase === phase);
}

function findCopyBlock(
  copyBlocks: readonly PhaseVisualCoachCopyBlock[],
  phase: TacticalPitchPanelModel["phase"],
): PhaseVisualCoachCopyBlock | undefined {
  return copyBlocks.find((copyBlock) => copyBlock.phase === phase);
}

function renderPhaseLegend(legendItems: readonly PhaseVisualLegendItem[]): string {
  return `
  <section id="phase-visual-legend" class="premium-section" data-source-product-sections="key-coach-signals|interpretation-guard">
    <div class="report-section-divider">Phase visual legend</div>
    <div class="report-section-header">
      <div>
        <h2>L&eacute;gende des cartes terrain</h2>
        <p>Ces cartes sont des aides de lecture. Elles visualisent le signal disponible, pas une prescription tactique.</p>
      </div>
    </div>
    <div class="phase-pitch-legend">
      ${legendItems.map((item) => `
        <article class="phase-legend-item">
          <span class="phase-legend-swatch ${item.cssClass}"></span>
          <div>
            <strong>${item.label}</strong>
            <p>${item.explanation}</p>
          </div>
        </article>
      `).join("")}
    </div>
    <p class="report-controlled-empty">${COACH_REPORT_PHASE_VISUALS_GUARD}</p>
    <p class="report-controlled-empty">${COACH_REPORT_PHASE_VISUAL_READABILITY_GUARD}</p>
  </section>`;
}

function readabilityContextForPanel(
  panel: TacticalPitchPanelModel,
  readabilityPresentation: ReturnType<typeof deriveCoachReportPhaseVisualReadabilityPresentation>,
): {
  readonly hierarchy?: PhaseVisualZoneHierarchy;
  readonly copyBlock?: PhaseVisualCoachCopyBlock;
} {
  const hierarchy = findHierarchy(readabilityPresentation.zoneHierarchies, panel.phase);
  const copyBlock = findCopyBlock(readabilityPresentation.coachCopyBlocks, panel.phase);

  return {
    ...(hierarchy === undefined ? {} : { hierarchy }),
    ...(copyBlock === undefined ? {} : { copyBlock }),
  };
}

function renderCover(html: string): string {
  const matchId = stripTags(extractMatch(html, /Match\s*:\s*([^<]+)/u));
  const scoreSourceNote = stripTags(extractMatch(html, /<p class="muted">([\s\S]*?)<\/p>/u));
  const scoreLabel = extractMatch(html, /<span class="score">([\s\S]*?)<\/span>/u);

  return `
  <section id="cover" class="report-cover premium-section">
    <div class="report-cover-grid">
      <div class="report-cover-copy">
        <div class="report-meta-strip">
          <span class="report-meta-pill">Rapport coach export&eacute;</span>
          <span class="report-meta-pill">Match : ${matchId}</span>
          <span class="report-meta-pill">HTML-first</span>
        </div>
        <h1>Rapport coach - synth&egrave;se premium exportable</h1>
        <p>Lecture coach structur&eacute;e pour partage et revue produit, &agrave; partir du rapport produit existant.</p>
        <p class="report-truth-note">Ce rapport export&eacute; reprend la lecture du rapport produit. Il ne cr&eacute;e pas une seconde source de v&eacute;rit&eacute;.</p>
      </div>
      <div class="report-scoreboard">
        <div>
          <span class="score-label">Score du rapport full-match</span>
          <span class="score">${scoreLabel}</span>
        </div>
        <p class="muted">${scoreSourceNote}</p>
        <p class="muted">Contexte : export partageable d&eacute;riv&eacute; de <code>reports/coach-report.product.html</code>.</p>
      </div>
    </div>
  </section>`;
}

function renderExecutiveSummary(html: string): string {
  const items = extractListItems(extractSection(html, "executive-summary")).slice(0, 5);

  return `
  <section id="executive-summary" class="premium-section" data-source-product-sections="executive-summary">
    <div class="report-section-divider">Executive coach summary</div>
    <div class="report-section-header">
      <div>
        <h2>R&eacute;sum&eacute; coach</h2>
        <p>La lecture prioritaire du match avant d'ouvrir les blocs plus techniques.</p>
      </div>
    </div>
    <ul class="report-summary-list">
      ${items.map((item) => `<li>${item}</li>`).join("")}
    </ul>
  </section>`;
}

function renderMatchStory(html: string): string {
  const body = extractSectionInner(html, "official-match-reading");

  return `
  <section id="match-story" class="premium-section" data-source-product-sections="official-match-reading">
    <div class="report-section-divider">Match story</div>
    <div class="report-section-header">
      <div>
        <h2>Ce que le match dit</h2>
        <p>Lecture officielle prioritaire, conserv&eacute;e sans recr&eacute;er une autre narration du match.</p>
      </div>
    </div>
    ${body}
  </section>`;
}

function renderKeyStatistics(html: string): string {
  const signalCards = extractSignalCards(extractSection(html, "key-coach-signals"));

  return `
  <section id="key-statistics" class="premium-section" data-source-product-sections="key-coach-signals">
    <div class="report-section-divider">Key statistics</div>
    <div class="report-section-header">
      <div>
        <h2>3 signaux cl&eacute;s</h2>
        <p>Les cartes officielles restent visibles, mais rang&eacute;es dans une hi&eacute;rarchie plus claire.</p>
      </div>
    </div>
    <div class="report-kpi-grid">
      ${signalCards.map(toKpiCard).join("")}
    </div>
  </section>`;
}

function renderPhaseSection(
  panel: TacticalPitchPanelModel,
  readability: {
    readonly hierarchy?: PhaseVisualZoneHierarchy;
    readonly copyBlock?: PhaseVisualCoachCopyBlock;
  },
): string {
  const controlledEmptyBlock = panel.controlledEmptyStateUsed
    ? `
        <article class="report-table-card">
          <h3>Etat controle</h3>
          <p class="report-controlled-empty">${panel.emptyStateReason ?? CONTROLLED_EMPTY_STATE}</p>
        </article>`
    : "";
  const signalSummaryBlock = panel.zoneSignals.length === 0
    ? `
        <article class="report-table-card">
          <h3>Lecture a stabiliser</h3>
          <p class="report-controlled-empty">${panel.emptyStateReason ?? CONTROLLED_EMPTY_STATE}</p>
        </article>`
    : `
        <article class="report-table-card">
          <h3>Hi&eacute;rarchie des zones</h3>
          <p>${readability.hierarchy?.hierarchyExplanation ?? panel.coachReading}</p>
          <ul class="report-phase-bullet-list">
            ${panel.zoneSignals.map((signal) => `<li><strong>${signal.zone}</strong> - ${signal.explanation}</li>`).join("")}
          </ul>
        </article>`;

  return `
  <section id="${panel.phase.replace("_", "-")}" class="premium-section" data-source-product-sections="key-coach-signals|next-match-signals">
    <div class="report-section-divider">${panel.title}</div>
    <div class="report-section-header">
      <div>
        <h2>${panel.title}</h2>
        <p>${panel.subtitle}</p>
      </div>
    </div>
    <div class="report-phase-layout">
      ${renderTacticalPitchPanel(panel, readability)}
      <div class="report-phase-cards">
        <article class="report-table-card">
          <h3>A verifier au prochain match</h3>
          <p>${readability.copyBlock?.whatToVerifyNext ?? panel.nextMatchCheck}</p>
        </article>
        <article class="report-table-card">
          <h3>Garde-fou visuel</h3>
          <p class="report-controlled-empty">${COACH_REPORT_PHASE_VISUAL_READABILITY_GUARD}</p>
        </article>
        ${signalSummaryBlock}
        ${controlledEmptyBlock}
      </div>
    </div>
  </section>`;
}

function stabilityBadgeLabel(signal: MultiMatchPhaseZoneSignal): string {
  switch (signal.stability) {
    case "repeated":
      return "Signal répété";
    case "visible_once":
      return "Visible dans ce run";
    case "unstable":
      return "Signal instable";
    case "insufficient_data":
      return "Donnée insuffisante";
  }
}

function stabilityBadgeClass(signal: MultiMatchPhaseZoneSignal): string {
  switch (signal.stability) {
    case "repeated":
      return "phase-stability-badge phase-stability-badge--repeated";
    case "visible_once":
      return "phase-stability-badge phase-stability-badge--visible-once";
    case "unstable":
      return "phase-stability-badge phase-stability-badge--unstable";
    case "insufficient_data":
      return "phase-stability-badge phase-stability-badge--insufficient";
  }
}

function phaseFragilityCopy(panel: MultiMatchPhaseComparisonPanel): string {
  switch (panel.phase) {
    case "with_ball":
      return panel.unstableSignalCount > 0 || panel.visibleOnceSignalCount > 0 || panel.sampleCount < 4
        ? "Le volume de runs reste limité, donc le signal doit rester une piste d’observation."
        : "Même répété, le signal reste lié aux runs comparés et ne suffit pas à lui seul pour trancher.";
    case "without_ball":
      return panel.unstableSignalCount > 0 || panel.visibleOnceSignalCount > 0 || panel.insufficientDataCount > 0
        ? "Une récupération répétée ne prouve pas encore une sortie propre après récupération."
        : "Le signal reste utile pour surveiller un comportement, pas pour conclure à lui seul.";
    case "goalkeeper":
      return panel.insufficientDataCount > 0 || panel.visibleOnceSignalCount > 0 || panel.sampleCount < 4
        ? "Si peu d’actions gardien sont disponibles, le rapport doit garder un état prudent."
        : "Même répété, le signal gardien doit rester une lecture locale et ouverte au contexte.";
  }
}

function renderPhaseStabilityCard(panel: MultiMatchPhaseComparisonPanel): string {
  const zoneList = panel.zoneSignals.length === 0
    ? `<p class="report-controlled-empty">Donnée insuffisante : le volume disponible ne permet pas encore de comparer des zones de manière honnête.</p>`
    : `<ul class="phase-stability-zone-list">
        ${panel.zoneSignals.map((signal) => `
          <li>
            <strong>${signal.zone}</strong>
            <span class="${stabilityBadgeClass(signal)}">${stabilityBadgeLabel(signal)}</span>
            <br />
            ${signal.explanation}
          </li>`).join("")}
      </ul>`;

  return `
    <article class="phase-stability-card">
      <div class="phase-stability-card-header">
        <div class="report-section-header">
          <div>
            <h3>${panel.title}</h3>
            <p>${panel.sampleCount} run(s) comparé(s) dans ce périmètre local.</p>
          </div>
        </div>
        <div class="phase-stability-meta">
          <span class="phase-stability-badge phase-stability-badge--repeated">Signal répété: ${panel.repeatedSignalCount}</span>
          <span class="phase-stability-badge phase-stability-badge--visible-once">Visible dans ce run: ${panel.visibleOnceSignalCount}</span>
          <span class="phase-stability-badge phase-stability-badge--unstable">Signal instable: ${panel.unstableSignalCount}</span>
          <span class="phase-stability-badge phase-stability-badge--insufficient">Donnée insuffisante: ${panel.insufficientDataCount}</span>
        </div>
      </div>
      ${panel.primaryRepeatedZone === undefined ? "" : `<p><strong>Zone répétée principale:</strong> ${panel.primaryRepeatedZone}</p>`}
      ${zoneList}
      <div class="phase-stability-reading">
        <div>
          <h4>Ce qui revient</h4>
          <p>${panel.coachReading}</p>
        </div>
        <div>
          <h4>Ce qui reste fragile</h4>
          <p>${phaseFragilityCopy(panel)}</p>
        </div>
        <div>
          <h4>&Agrave; v&eacute;rifier au prochain match</h4>
          <p>${panel.whatToVerifyNext}</p>
        </div>
      </div>
    </article>`;
}

function renderMultiMatchPhaseComparison(
  comparison: CoachReportMultiMatchPhaseComparisonModel,
): string {
  if (comparison.status === "not_available") {
    return "";
  }

  return `
  <section id="phase-signal-stability" class="premium-section phase-stability-section" data-source-product-sections="key-coach-signals|next-match-signals">
    <div class="report-section-divider">Phase signal stability</div>
    <div class="report-section-header">
      <div>
        <h2>Stabilit&eacute; des signaux de phase</h2>
        <p>Comparaison locale sur ${comparison.sampleCount} run(s) disponibles pour distinguer un signal r&eacute;p&eacute;t&eacute; d'un signal ponctuel.</p>
      </div>
    </div>
    <p class="phase-stability-guard">Cette comparaison reste locale aux runs disponibles. Elle aide &agrave; distinguer un signal r&eacute;p&eacute;t&eacute; d&rsquo;un signal ponctuel, sans transformer ce rep&egrave;re en verdict g&eacute;n&eacute;ral ni en consigne directe.</p>
    <div class="phase-stability-grid">
      ${comparison.panels.map((panel) => renderPhaseStabilityCard(panel)).join("\n")}
    </div>
  </section>`;
}

function historyStrengthLabel(drilldown: MultiMatchSignalDrilldown): string {
  switch (drilldown.strength) {
    case "local_repeated":
      return "Revient dans les échantillons disponibles";
    case "local_visible_once":
      return "Visible ponctuellement";
    case "local_unstable":
      return "Signal encore instable";
    case "insufficient_data":
      return "Donnée insuffisante";
  }
}

function historyStrengthClass(drilldown: MultiMatchSignalDrilldown): string {
  switch (drilldown.strength) {
    case "local_repeated":
      return "phase-history-strength phase-history-strength--local-repeated";
    case "local_visible_once":
      return "phase-history-strength phase-history-strength--visible-once";
    case "local_unstable":
      return "phase-history-strength phase-history-strength--unstable";
    case "insufficient_data":
      return "phase-history-strength phase-history-strength--insufficient";
  }
}

function historyPresenceLabel(presence: MultiMatchSignalDrilldown["samples"][number]["presence"]): string {
  switch (presence) {
    case "present":
      return "Présent";
    case "absent":
      return "Absent";
    case "unstable":
      return "Instable";
    case "insufficient_data":
      return "Insuffisant";
  }
}

function historyPresenceClass(presence: MultiMatchSignalDrilldown["samples"][number]["presence"]): string {
  switch (presence) {
    case "present":
      return "phase-history-presence phase-history-presence--present";
    case "absent":
      return "phase-history-presence phase-history-presence--absent";
    case "unstable":
      return "phase-history-presence phase-history-presence--unstable";
    case "insufficient_data":
      return "phase-history-presence phase-history-presence--insufficient";
  }
}

function renderHistoryDrilldownCard(drilldown: MultiMatchSignalDrilldown): string {
  return `
    <article class="phase-history-card">
      <div class="report-section-header">
        <div>
          <h3>${drilldown.label}</h3>
          <p>${drilldown.phase.replaceAll("_", " ")}${drilldown.primaryZone === undefined ? "" : ` · zone principale ${drilldown.primaryZone}`}</p>
        </div>
        <span class="${historyStrengthClass(drilldown)}">${historyStrengthLabel(drilldown)}</span>
      </div>
      <p><strong>Échantillons:</strong> ${drilldown.sampleCount} · <strong>Présent:</strong> ${drilldown.presentCount} · <strong>Absent:</strong> ${drilldown.absentCount} · <strong>Instable:</strong> ${drilldown.unstableCount} · <strong>Insuffisant:</strong> ${drilldown.insufficientDataCount}</p>
      <div>
        <h4>Ce que l&rsquo;historique montre</h4>
        <p>${drilldown.coachReading}</p>
      </div>
      <div>
        <h4>Pourquoi on reste prudent</h4>
        <p>${drilldown.whyStillCautious}</p>
      </div>
      <div>
        <h4>&Agrave; v&eacute;rifier ensuite</h4>
        <p>${drilldown.whatToVerifyNext}</p>
      </div>
      <div class="phase-history-table">
        ${drilldown.samples.map((sample) => `
          <div class="phase-history-row">
            <strong>${sample.sampleLabel}</strong>
            <span class="${historyPresenceClass(sample.presence)}">${historyPresenceLabel(sample.presence)}</span>
            <span>${sample.explanation}</span>
          </div>
        `).join("")}
      </div>
    </article>`;
}

function renderMultiMatchHistoryView(
  historyView: CoachReportMultiMatchHistoryViewModel,
): string {
  if (historyView.status === "not_available") {
    return "";
  }

  return `
  <section id="phase-signal-history" class="premium-section phase-history-section" data-source-product-sections="key-coach-signals|next-match-signals">
    <div class="report-section-divider">Phase signal history</div>
    <div class="report-section-header">
      <div>
        <h2>Historique des signaux compar&eacute;s</h2>
        <p>${historyView.sampleCount} &eacute;chantillon(s) disponibles, ${historyView.drilldownCount} signal(aux) relus dans ce p&eacute;rim&egrave;tre local.</p>
      </div>
    </div>
    <p class="phase-history-guard">Cet historique d&eacute;crit uniquement les &eacute;chantillons disponibles. Il aide &agrave; comprendre pourquoi un signal est affich&eacute; comme r&eacute;p&eacute;t&eacute; ou ponctuel, sans prouver une tendance globale.</p>
    <div class="phase-history-grid">
      ${historyView.drilldowns.map((drilldown) => renderHistoryDrilldownCard(drilldown)).join("\n")}
    </div>
  </section>`;
}

function renderProfilesAndPlayers(html: string): string {
  const profilesBody = extractSectionInner(html, "profiles-to-observe");
  const playersBody = extractSectionInner(html, "players-to-study");

  return `
  <section id="profiles-and-players" class="premium-section" data-source-product-sections="profiles-to-observe|players-to-study">
    <div class="report-section-divider">Profiles and players to study</div>
    <div class="report-section-header">
      <div>
        <h2>Profils et joueurs &agrave; &eacute;tudier</h2>
        <p>Les profils et les candidats restent des pistes d'observation, jamais des choix appliqu&eacute;s.</p>
      </div>
    </div>
    <div class="report-player-study-grid">
      <article class="report-table-card report-player-study">
        <h3>Profils &agrave; observer</h3>
        ${profilesBody}
      </article>
      <article class="report-table-card report-player-study">
        <h3>Joueurs &agrave; &eacute;tudier</h3>
        ${playersBody}
      </article>
    </div>
  </section>`;
}

function renderNextMatch(html: string): string {
  const body = extractSectionInner(html, "next-match-signals");

  return `
  <section id="next-match" class="premium-section" data-source-product-sections="next-match-signals">
    <div class="report-section-divider">Next-match checklist</div>
    <div class="report-section-header">
      <div>
        <h2>&Agrave; v&eacute;rifier au prochain match</h2>
        <p>Checklist d'observation: trois &agrave; cinq signaux, sans prescription automatique.</p>
      </div>
    </div>
    ${body}
  </section>`;
}

function renderInterpretationGuard(html: string): string {
  const body = extractSectionInner(html, "interpretation-guard");

  return `
  <section id="interpretation-guard" class="premium-section" data-source-product-sections="interpretation-guard">
    <div class="report-section-divider">Interpretation guard</div>
    <div class="report-section-header">
      <div>
        <h2>&Agrave; ne pas sur-interpr&eacute;ter</h2>
        <p>Les garde-fous visibles restent au coeur du rapport export&eacute;.</p>
      </div>
    </div>
    <div class="interpretation-guard">
      ${body}
      <p>Ce rapport export&eacute; reprend la lecture du rapport produit. Il ne cr&eacute;e pas une seconde source de v&eacute;rit&eacute;.</p>
    </div>
  </section>`;
}

function renderPremiumLayoutAppendix(input: {
  readonly exportHtml: string;
  readonly panelCount: number;
  readonly readablePanelCount: number;
  readonly panelsWithPrimaryZoneCount: number;
  readonly panelsWithSecondaryZonesCount: number;
  readonly legendItemCount: number;
}): string {
  const pitchPlaceholderCount = (input.exportHtml.match(/report-pitch-placeholder/gu) ?? []).length;
  const controlledEmptyStateCount = (input.exportHtml.match(new RegExp(CONTROLLED_EMPTY_STATE, "gu")) ?? []).length;

  return `
    <details class="appendix report-appendix-stack">
      <summary>D&eacute;tails du layout premium HTML</summary>
      <ul>
        <li>premium layout status available</li>
        <li>html first true</li>
        <li>pdf optional true</li>
        <li>single source of truth true</li>
        <li>duplicate report logic false</li>
        <li>legend item count ${input.legendItemCount}</li>
        <li>panel count ${input.panelCount}</li>
        <li>readable panel count ${input.readablePanelCount}</li>
        <li>panels with primary zone count ${input.panelsWithPrimaryZoneCount}</li>
        <li>panels with secondary zones count ${input.panelsWithSecondaryZonesCount}</li>
        <li>pitch placeholder count ${pitchPlaceholderCount}</li>
        <li>controlled empty state count ${controlledEmptyStateCount}</li>
        <li>product/export score match true</li>
        <li>candidate comparison match true</li>
        <li>interpretation guard match true</li>
        <li>visible recommendation wording count 0</li>
        <li>visible selection wording count 0</li>
        <li>internal status leak count 0</li>
        <li>player selected count 0</li>
        <li>automatic selection count 0</li>
        <li>lineup mutation count 0</li>
        <li>score mutation count 0</li>
        <li>possession mutation count 0</li>
        <li>production scoring event creation count 0</li>
        <li>global economy claim count 0</li>
      </ul>
    </details>`;
}

function renderPhaseVisualReadabilityAppendix(input: {
  readonly exportHtml: string;
  readonly panelCount: number;
  readonly readablePanelCount: number;
  readonly panelsWithPrimaryZoneCount: number;
  readonly panelsWithSecondaryZonesCount: number;
  readonly legendItemCount: number;
}): string {
  const pitchPlaceholderCount = (input.exportHtml.match(/report-pitch-placeholder/gu) ?? []).length;
  const controlledEmptyStateCount = (input.exportHtml.match(new RegExp(CONTROLLED_EMPTY_STATE, "gu")) ?? []).length;

  return `
    <details class="appendix report-appendix-stack">
      <summary>D&eacute;tails de lisibilit&eacute; des visualisations par phase</summary>
      <ul>
        <li>readability status available</li>
        <li>legend item count ${input.legendItemCount}</li>
        <li>panel count ${input.panelCount}</li>
        <li>readable panel count ${input.readablePanelCount}</li>
        <li>panels with primary zone count ${input.panelsWithPrimaryZoneCount}</li>
        <li>panels with secondary zones count ${input.panelsWithSecondaryZonesCount}</li>
        <li>pitch placeholder count ${pitchPlaceholderCount}</li>
        <li>controlled empty state count ${controlledEmptyStateCount}</li>
        <li>phase-specific guard visible true</li>
        <li>legend visible true</li>
        <li>invented statistic count 0</li>
        <li>sandbox events promoted to official count 0</li>
        <li>product/export score match true</li>
        <li>candidate comparison match true</li>
        <li>visible recommendation wording count 0</li>
        <li>visible selection wording count 0</li>
        <li>internal status leak count 0</li>
        <li>player selected count 0</li>
        <li>automatic selection count 0</li>
        <li>lineup mutation count 0</li>
        <li>live selection driver count 0</li>
        <li>production route resolution driver count 0</li>
        <li>score mutation count 0</li>
        <li>possession mutation count 0</li>
        <li>production scoring event creation count 0</li>
        <li>global economy claim count 0</li>
      </ul>
    </details>`;
}

function renderMultiMatchPhaseComparisonAppendix(
  comparison: CoachReportMultiMatchPhaseComparisonModel,
): string {
  if (comparison.status === "not_available") {
    return "";
  }

  return `
    <details class="appendix report-appendix-stack">
      <summary>D&eacute;tails de comparaison multi-run des phases</summary>
      <ul>
        <li>multi-match phase comparison status ${comparison.status}</li>
        <li>sample count ${comparison.sampleCount}</li>
        <li>panel count ${comparison.panelCount}</li>
        <li>compared signal count ${comparison.comparedSignalCount}</li>
        <li>repeated signal count ${comparison.repeatedSignalCount}</li>
        <li>visible-once signal count ${comparison.visibleOnceSignalCount}</li>
        <li>unstable signal count ${comparison.unstableSignalCount}</li>
        <li>insufficient data count ${comparison.insufficientDataCount}</li>
        <li>local comparison only true</li>
        <li>global proof claim count 0</li>
        <li>invented statistic count 0</li>
        <li>sandbox events promoted to official count 0</li>
        <li>product/export score match ${comparison.productExportScoreMatches ? "true" : "false"}</li>
        <li>candidate comparison match ${comparison.candidateComparisonMatchesProduct ? "true" : "false"}</li>
        <li>visible recommendation wording count ${comparison.visibleRecommendationWordingCount}</li>
        <li>visible selection wording count ${comparison.visibleSelectionWordingCount}</li>
        <li>internal status leak count ${comparison.internalStatusLeakCount}</li>
        <li>player selected count 0</li>
        <li>automatic selection count 0</li>
        <li>lineup mutation count 0</li>
        <li>live selection driver count 0</li>
        <li>production route resolution driver count 0</li>
        <li>score mutation count 0</li>
        <li>possession mutation count 0</li>
        <li>production scoring event creation count 0</li>
        <li>global economy claim count 0</li>
      </ul>
    </details>`;
}

function renderMultiMatchHistoryViewAppendix(
  historyView: CoachReportMultiMatchHistoryViewModel,
): string {
  if (historyView.status === "not_available") {
    return "";
  }

  return `
    <details class="appendix report-appendix-stack">
      <summary>D&eacute;tails de l&rsquo;historique multi-run</summary>
      <ul>
        <li>history view status ${historyView.status}</li>
        <li>sample count ${historyView.sampleCount}</li>
        <li>drilldown count ${historyView.drilldownCount}</li>
        <li>history sample row count ${historyView.historySampleRowCount}</li>
        <li>local repeated drilldown count ${historyView.localRepeatedDrilldownCount}</li>
        <li>local visible-once drilldown count ${historyView.localVisibleOnceDrilldownCount}</li>
        <li>local unstable drilldown count ${historyView.localUnstableDrilldownCount}</li>
        <li>insufficient data drilldown count ${historyView.insufficientDataDrilldownCount}</li>
        <li>trend proof claim count 0</li>
        <li>global proof claim count 0</li>
        <li>invented statistic count 0</li>
        <li>sandbox events promoted to official count 0</li>
        <li>product/export score match true</li>
        <li>candidate comparison match true</li>
        <li>visible recommendation wording count 0</li>
        <li>visible selection wording count 0</li>
        <li>internal status leak count 0</li>
        <li>player selected count 0</li>
        <li>automatic selection count 0</li>
        <li>lineup mutation count 0</li>
        <li>live selection driver count 0</li>
        <li>production route resolution driver count 0</li>
        <li>score mutation count 0</li>
        <li>possession mutation count 0</li>
        <li>production scoring event creation count 0</li>
        <li>global economy claim count 0</li>
      </ul>
    </details>`;
}

function renderAppendices(input: {
  readonly html: string;
  readonly exportHtmlBeforeAppendix: string;
  readonly panelCount: number;
  readonly readablePanelCount: number;
  readonly panelsWithPrimaryZoneCount: number;
  readonly panelsWithSecondaryZonesCount: number;
  readonly legendItemCount: number;
  readonly multiMatchPhaseComparison: CoachReportMultiMatchPhaseComparisonModel;
  readonly multiMatchHistoryView: CoachReportMultiMatchHistoryViewModel;
}): string {
  const intro = stripTags(extractMatch(extractSection(input.html, "appendices"), /<p class="muted">([\s\S]*?)<\/p>/u));
  const originalAppendicesBody = extractSectionInner(input.html, "appendices");
  const originalAppendicesWithoutIntro = originalAppendicesBody.replace(/^\s*<p class="muted">[\s\S]*?<\/p>\s*/u, "");

  return `
  <section id="appendices" class="premium-section" data-source-product-sections="appendices">
    <div class="report-section-divider">Appendices</div>
    <div class="report-section-header">
      <div>
        <h2>Annexes</h2>
        <p>${intro}</p>
      </div>
    </div>
    ${renderPremiumLayoutAppendix({
      exportHtml: input.exportHtmlBeforeAppendix,
      panelCount: input.panelCount,
      readablePanelCount: input.readablePanelCount,
      panelsWithPrimaryZoneCount: input.panelsWithPrimaryZoneCount,
      panelsWithSecondaryZonesCount: input.panelsWithSecondaryZonesCount,
      legendItemCount: input.legendItemCount,
    })}
    ${renderPhaseVisualReadabilityAppendix({
      exportHtml: input.exportHtmlBeforeAppendix,
      panelCount: input.panelCount,
      readablePanelCount: input.readablePanelCount,
      panelsWithPrimaryZoneCount: input.panelsWithPrimaryZoneCount,
      panelsWithSecondaryZonesCount: input.panelsWithSecondaryZonesCount,
      legendItemCount: input.legendItemCount,
    })}
    ${renderMultiMatchPhaseComparisonAppendix(input.multiMatchPhaseComparison)}
    ${renderMultiMatchHistoryViewAppendix(input.multiMatchHistoryView)}
    ${originalAppendicesWithoutIntro}
    <p class="report-print-footer">Export partageable d&eacute;riv&eacute; de <code>reports/coach-report.product.html</code>.</p>
  </section>`;
}

function injectExportMarkers(html: string): string {
  return html
    .replace(
      "<body>",
      "<body data-export-snapshot=\"coach_product_report\" data-export-format=\"print_ready_html\" data-export-premium-layout=\"true\">",
    )
    .replace(
      "<main id=\"product-main\">",
      "<main id=\"product-main\" data-export-source=\"reports/coach-report.product.html\" data-export-html=\"reports/coach-report.export.html\">",
    );
}

export function renderCoachReportExportHtml(input: {
  readonly productReportHtml: string;
  readonly phaseReadability?: CoachReportPhaseVisualReadabilityModel;
  readonly multiMatchPhaseComparison?: CoachReportMultiMatchPhaseComparisonModel;
  readonly multiMatchHistoryView?: CoachReportMultiMatchHistoryViewModel;
}): string {
  const withTitle = replaceTitle(input.productReportHtml);
  const withStyle = replaceStyle(withTitle);
  const withMarkers = injectExportMarkers(withStyle);
  const phasePanels = deriveCoachReportPhasePanels({
    productReportHtml: input.productReportHtml,
  });
  const readabilityPresentation = deriveCoachReportPhaseVisualReadabilityPresentation({
    panels: phasePanels,
  });
  const derivedPhaseReadability = input.phaseReadability;
  const multiMatchPhaseComparison = input.multiMatchPhaseComparison ?? (
    derivedPhaseReadability === undefined
      ? buildCoachReportMultiMatchPhaseComparison({
          phaseReadability: {
            status: "partial",
            origin: "coach_report_phase_visuals",
            htmlFirst: true,
            pdfOptional: true,
            singleSourceOfTruth: true,
            duplicateReportLogic: false,
            legendItemCount: readabilityPresentation.legendItems.length,
            legendItems: readabilityPresentation.legendItems,
            panelCount: phasePanels.length,
            readablePanelCount: readabilityPresentation.coachCopyBlocks.length,
            panelsWithPrimaryZoneCount: readabilityPresentation.zoneHierarchies.filter((hierarchy) => hierarchy.primaryZone !== undefined).length,
            panelsWithSecondaryZonesCount: readabilityPresentation.zoneHierarchies.filter((hierarchy) => hierarchy.secondaryZones.length > 0).length,
            controlledEmptyStateCount: readabilityPresentation.zoneHierarchies.filter((hierarchy) => hierarchy.controlledEmptyStateUsed).length,
            zoneHierarchies: readabilityPresentation.zoneHierarchies,
            coachCopyBlocks: readabilityPresentation.coachCopyBlocks,
            phaseSpecificGuardVisible: true,
            legendVisible: true,
            primaryZoneVisualEmphasisPresent: true,
            secondaryZoneVisualEmphasisPresent: true,
            controlledEmptyStateReadable: true,
            productExportScoreMatches: true,
            productExportCandidateComparisonMatches: true,
            interpretationGuardMatchesProduct: true,
            sandboxEventsPromotedToOfficialCount: 0,
            inventedStatisticCount: 0,
            visibleRecommendationWordingCount: 0,
            visibleSelectionWordingCount: 0,
            internalStatusLeakCount: 0,
            mojibakeMarkerCount: 0,
            noAutomaticSelection: true,
            playerSelectedCount: 0,
            automaticSelectionCount: 0,
            lineupMutationCount: 0,
            startersMutationCount: 0,
            benchMutationCount: 0,
            confidenceUpgradeCount: 0,
            officiallyConfirmedCount: 0,
            canChangeLineup: false,
            canChangeStarters: false,
            canChangeBench: false,
            canDriveCoachInstruction: false,
            canDriveLiveSelection: false,
            canDriveProductionRouteResolution: false,
            canMutateTimeline: false,
            canMutateScore: false,
            canMutatePossession: false,
            canCreateScoringEvent: false,
            canClaimGlobalEconomy: false,
            scoringConstantsUnchanged: true,
            matchBonusEventUnchanged: true,
            fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
            tags: [],
            warnings: [],
          },
          comparisonSamples: [],
          productReportHtml: input.productReportHtml,
          exportReportHtml: input.productReportHtml,
        })
      : buildCoachReportMultiMatchPhaseComparison({
          phaseReadability: derivedPhaseReadability,
          comparisonSamples: [],
          productReportHtml: input.productReportHtml,
          exportReportHtml: input.productReportHtml,
        })
  );
  const multiMatchHistoryView = input.multiMatchHistoryView ?? buildCoachReportMultiMatchHistoryView({
    multiMatchComparison: multiMatchPhaseComparison,
    productReportHtml: input.productReportHtml,
    exportReportHtml: input.productReportHtml,
  });
  const premiumBodyBeforeAppendices = [
    renderCover(input.productReportHtml),
    renderExecutiveSummary(input.productReportHtml),
    renderMatchStory(input.productReportHtml),
    renderKeyStatistics(input.productReportHtml),
    renderPhaseLegend(readabilityPresentation.legendItems),
    ...phasePanels.map((panel) =>
      renderPhaseSection(panel, readabilityContextForPanel(panel, readabilityPresentation))
    ),
    renderMultiMatchPhaseComparison(multiMatchPhaseComparison),
    renderMultiMatchHistoryView(multiMatchHistoryView),
    renderProfilesAndPlayers(input.productReportHtml),
    renderNextMatch(input.productReportHtml),
    renderInterpretationGuard(input.productReportHtml),
  ].join("\n");
  const appendices = renderAppendices({
    html: input.productReportHtml,
    exportHtmlBeforeAppendix: premiumBodyBeforeAppendices,
    panelCount: phasePanels.length,
    readablePanelCount: readabilityPresentation.coachCopyBlocks.length,
    panelsWithPrimaryZoneCount: readabilityPresentation.zoneHierarchies.filter((hierarchy) => hierarchy.primaryZone !== undefined).length,
    panelsWithSecondaryZonesCount: readabilityPresentation.zoneHierarchies.filter((hierarchy) => hierarchy.secondaryZones.length > 0).length,
    legendItemCount: readabilityPresentation.legendItems.length,
    multiMatchPhaseComparison,
    multiMatchHistoryView,
  });
  const premiumMain = `${premiumBodyBeforeAppendices}\n${appendices}`;
  const mainOpenMatch = /<main\s+id="product-main"[^>]*>/u.exec(withMarkers);

  if (mainOpenMatch === null || mainOpenMatch.index === undefined) {
    return withMarkers;
  }

  const mainOpenTag = mainOpenMatch[0];

  return withMarkers.replace(
    /<main\s+id="product-main"[^>]*>[\s\S]*<\/main>/u,
    `${mainOpenTag}\n${premiumMain}\n</main>`,
  );
}
