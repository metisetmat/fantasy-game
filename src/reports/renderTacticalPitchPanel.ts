import {
  COACH_REPORT_PHASE_CONTROLLED_EMPTY_STATE,
  type TacticalPitchPanelModel,
  type TacticalPitchZoneSignal,
} from "./coachReportPhaseVisuals";

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
        <rect class="phase-zone" x="${x}" y="${y}" width="84" height="52" rx="10" ry="10"></rect>
      </g>`;
  }

  return `
    <g>
      <rect class="${zoneClass(signal)}" x="${x}" y="${y}" width="84" height="52" rx="10" ry="10"></rect>
      <text class="phase-zone-label" x="${labelX}" y="${labelY}" text-anchor="middle">${escapeAttribute(signal.zone)}</text>
      <text class="phase-zone-value" x="${labelX}" y="${valueY}" text-anchor="middle">${escapeAttribute(String(signal.value))}</text>
    </g>`;
}

function renderPitchSvg(panel: TacticalPitchPanelModel): string {
  const cells: string[] = [];

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      cells.push(renderSignalCell(signalAtCell(panel.zoneSignals, row, col), row, col));
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

export function renderTacticalPitchPanel(panel: TacticalPitchPanelModel): string {
  const explanationList = panel.zoneSignals.slice(0, 3).map((signal) =>
    `<li>${escapeAttribute(signal.zone)} — ${signal.explanation}</li>`
  ).join("");

  if (!panel.pitchSvgAvailable) {
    return `
      <article class="report-pitch-panel">
        <h3>${panel.title}</h3>
        <div class="report-pitch-placeholder phase-zone phase-zone--empty">
          ${panel.emptyStateReason ?? COACH_REPORT_PHASE_CONTROLLED_EMPTY_STATE}
        </div>
        <p class="phase-panel-reading">${panel.coachReading}</p>
        <p class="phase-panel-check"><strong>&Agrave; v&eacute;rifier :</strong> ${panel.nextMatchCheck}</p>
      </article>`;
  }

  return `
    <article class="report-pitch-panel">
      <h3>${panel.title}</h3>
      ${renderPitchSvg(panel)}
      <p class="phase-panel-reading">${panel.coachReading}</p>
      <p class="phase-panel-check"><strong>&Agrave; v&eacute;rifier :</strong> ${panel.nextMatchCheck}</p>
      <ul class="report-phase-bullet-list">
        ${explanationList}
      </ul>
    </article>`;
}
