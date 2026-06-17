import {
  COACH_REPORT_PHASE_CONTROLLED_EMPTY_STATE,
  type TacticalPitchPanelModel,
  type TacticalPitchZoneSignal,
} from "./coachReportPhaseVisuals";
import type {
  PhaseVisualCoachCopyBlock,
  PhaseVisualZoneHierarchy,
} from "./coachReportPhaseVisualReadability";

function escapeAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

type PitchCell = {
  readonly row: number;
  readonly col: number;
};

function zoneCell(zone: string): PitchCell {
  const match = /^Z(\d+)-([A-Z]+)/u.exec(zone);
  const zoneIndex = Number(match?.[1] ?? "4");
  const suffix = match?.[2] ?? "C";
  const row = Math.max(0, Math.min(2, 2 - Math.floor(zoneIndex / 3)));

  if (suffix === "C") {
    return { row, col: 1 };
  }
  if (suffix.startsWith("C") && suffix.endsWith("L")) {
    return { row, col: 0 };
  }
  if (suffix.startsWith("C") && suffix.endsWith("R")) {
    return { row, col: 2 };
  }
  if (suffix.includes("L") && !suffix.includes("R")) {
    return { row, col: 0 };
  }
  if (suffix.includes("R") && !suffix.includes("L")) {
    return { row, col: 2 };
  }

  return { row, col: 1 };
}

function zoneClass(signal: TacticalPitchZoneSignal): string {
  switch (signal.kind) {
    case "danger_zone":
    case "progression_zone":
      return "phase-zone phase-zone--danger";
    case "recovery_zone":
      return "phase-zone phase-zone--recovery";
    case "pressure_instability_zone":
      return "phase-zone phase-zone--pressure";
    case "goalkeeper_response_zone":
      return "phase-zone phase-zone--goalkeeper";
    case "controlled_empty_state":
      return "phase-zone phase-zone--empty";
  }
}

function signalAtCell(
  signals: readonly TacticalPitchZoneSignal[],
  row: number,
  col: number,
): TacticalPitchZoneSignal | undefined {
  return signals.find((signal) => {
    const cell = zoneCell(signal.zone);

    return cell.row === row && cell.col === col;
  });
}

function renderSignalCell(
  signal: TacticalPitchZoneSignal | undefined,
  panel: TacticalPitchPanelModel,
  row: number,
  col: number,
): string {
  const x = 16 + col * 96;
  const y = 16 + row * 64;
  const labelX = x + 48;
  const labelY = y + 26;
  const valueY = y + 44;

  if (signal === undefined) {
    return `
      <g>
        <rect class="phase-zone phase-zone--muted" x="${x}" y="${y}" width="84" height="52" rx="10" ry="10"></rect>
      </g>`;
  }

  const emphasisClass = panel.primarySignal?.zone === signal.zone
    ? "phase-zone--primary"
    : panel.secondarySignals.some((secondary) => secondary.zone === signal.zone)
      ? "phase-zone--secondary"
      : "phase-zone--muted";

  return `
    <g>
      <rect class="${zoneClass(signal)} ${emphasisClass}" x="${x}" y="${y}" width="84" height="52" rx="10" ry="10"></rect>
      <text class="phase-zone-label" x="${labelX}" y="${labelY}" text-anchor="middle">${escapeAttribute(signal.zone)}</text>
      <text class="phase-zone-value" x="${labelX}" y="${valueY}" text-anchor="middle">${escapeAttribute(String(signal.value))}</text>
    </g>`;
}

function renderPitchSvg(panel: TacticalPitchPanelModel): string {
  const cells: string[] = [];

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      cells.push(renderSignalCell(signalAtCell(panel.zoneSignals, row, col), panel, row, col));
    }
  }

  return `
    <svg class="phase-pitch phase-pitch-grid" viewBox="0 0 320 230" role="img" aria-label="${escapeAttribute(panel.title)}">
      <rect x="8" y="8" width="304" height="214" rx="18" ry="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.24)" stroke-width="2"></rect>
      <line x1="110" y1="16" x2="110" y2="214" stroke="rgba(255,255,255,0.18)" stroke-width="2"></line>
      <line x1="206" y1="16" x2="206" y2="214" stroke="rgba(255,255,255,0.18)" stroke-width="2"></line>
      <line x1="16" y1="80" x2="304" y2="80" stroke="rgba(255,255,255,0.18)" stroke-width="2"></line>
      <line x1="16" y1="144" x2="304" y2="144" stroke="rgba(255,255,255,0.18)" stroke-width="2"></line>
      <circle cx="160" cy="115" r="20" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"></circle>
      ${cells.join("")}
    </svg>`;
}

function fallbackCopy(panel: TacticalPitchPanelModel): PhaseVisualCoachCopyBlock {
  return {
    phase: panel.phase,
    whatItShows: panel.coachReading,
    whyItMatters: panel.subtitle,
    whatToVerifyNext: panel.nextMatchCheck,
    limitation: panel.emptyStateReason ?? COACH_REPORT_PHASE_CONTROLLED_EMPTY_STATE,
  };
}

function fallbackHierarchy(panel: TacticalPitchPanelModel): PhaseVisualZoneHierarchy {
  const secondaryZones = panel.secondarySignals.map((signal) => signal.zone);

  return {
    phase: panel.phase,
    ...(panel.primarySignal === undefined
      ? {}
      : {
          primaryZone: panel.primarySignal.zone,
          primaryZoneLabel: panel.primarySignal.label,
          primaryZoneValue: panel.primarySignal.value,
        }),
    secondaryZones,
    hierarchyExplanation: panel.controlledEmptyStateUsed
      ? panel.emptyStateReason ?? COACH_REPORT_PHASE_CONTROLLED_EMPTY_STATE
      : panel.primarySignal === undefined
        ? "Aucune zone principale n'est assez stable pour &ecirc;tre affich&eacute;e."
        : `${panel.primarySignal.zone} porte le signal principal ; ${secondaryZones.join(", ") || "pas de zone secondaire stabilis&eacute;e"} donnent le contexte.`,
    controlledEmptyStateUsed: panel.controlledEmptyStateUsed,
  };
}

export function renderTacticalPitchPanel(
  panel: TacticalPitchPanelModel,
  readability?: {
    readonly hierarchy?: PhaseVisualZoneHierarchy;
    readonly copyBlock?: PhaseVisualCoachCopyBlock;
  },
): string {
  const copyBlock = readability?.copyBlock ?? fallbackCopy(panel);
  const hierarchy = readability?.hierarchy ?? fallbackHierarchy(panel);
  const hierarchyItems = [
    hierarchy.primaryZone === undefined
      ? `<li><strong>Zone principale :</strong> donn&eacute;e insuffisante dans ce run</li>`
      : `<li><strong>Zone principale :</strong> ${escapeAttribute(hierarchy.primaryZone)}${hierarchy.primaryZoneLabel === undefined ? "" : ` - ${hierarchy.primaryZoneLabel}`}${hierarchy.primaryZoneValue === undefined ? "" : ` (${hierarchy.primaryZoneValue})`}</li>`,
    `<li><strong>Zones secondaires :</strong> ${hierarchy.secondaryZones.length === 0 ? "aucune zone secondaire stabilis&eacute;e" : hierarchy.secondaryZones.map(escapeAttribute).join(", ")}</li>`,
  ].join("");

  if (!panel.pitchSvgAvailable) {
    return `
      <article class="report-pitch-panel">
        <h3>${panel.title}</h3>
        <p class="phase-panel-why">${panel.subtitle}</p>
        <div class="report-pitch-placeholder phase-zone phase-zone--empty">
          ${panel.emptyStateReason ?? COACH_REPORT_PHASE_CONTROLLED_EMPTY_STATE}
        </div>
        <ul class="report-phase-bullet-list">
          ${hierarchyItems}
        </ul>
        <p class="phase-panel-summary phase-panel-reading"><strong>Ce que &ccedil;a montre :</strong> ${copyBlock.whatItShows}</p>
        <p class="phase-panel-why"><strong>Pourquoi c'est utile :</strong> ${copyBlock.whyItMatters}</p>
        <p class="phase-panel-next-check"><strong>&Agrave; v&eacute;rifier :</strong> ${copyBlock.whatToVerifyNext}</p>
        <p class="phase-panel-limitation"><strong>Limite :</strong> ${copyBlock.limitation}</p>
      </article>`;
  }

  return `
    <article class="report-pitch-panel">
      <h3>${panel.title}</h3>
      <p class="phase-panel-why">${panel.subtitle}</p>
      ${renderPitchSvg(panel)}
      <ul class="report-phase-bullet-list">
        ${hierarchyItems}
      </ul>
      <p class="phase-panel-summary phase-panel-reading"><strong>Ce que &ccedil;a montre :</strong> ${copyBlock.whatItShows}</p>
      <p class="phase-panel-why"><strong>Pourquoi c'est utile :</strong> ${copyBlock.whyItMatters}</p>
      <p class="phase-panel-next-check"><strong>&Agrave; v&eacute;rifier :</strong> ${copyBlock.whatToVerifyNext}</p>
      <p class="phase-panel-limitation"><strong>Limite :</strong> ${copyBlock.limitation}</p>
    </article>`;
}
