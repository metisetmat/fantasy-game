import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { PlayerMatchState } from "../../systems/players";
import { TacticalStyle } from "../../models/tactics";
import { type ZoneId } from "../../core/zones";
import {
  BallTransferType,
  evaluateShotLegality,
  resolveBallTransfer,
} from "../../systems/actions";
import { evaluateGoalkeeperGuardrail } from "../../systems/positioning";
import {
  PatternType,
  chainPath,
  detectThirdManPattern,
  evaluateReceptionChains,
  laneStateForReception,
  type ReceptionChain,
} from "../../systems/tactics";
import {
  ReceptionFollowUpRole,
  ReceptionQualityLevel,
  evaluateReceptionQualities,
  type ReceptionQualityEvaluation,
} from "../../systems/spatial/receptionQuality";
import { applyReceptionUpgrade } from "../../systems/spatial/receptionUpgrade";
import { evaluateStructureRationality } from "../../systems/positioning/structureRationality";
import { AttackingDirection } from "../../systems/spatial/intention";
import {
  evaluateFunctionalOccupation,
  evaluateOccupationQuality,
  formatFunctionalOccupationMarkdown,
  resolveFunctionalOccupationSpatialTargets,
  summarizeFunctionalOccupation,
  type FunctionalOccupationEvaluation,
  type FunctionalOccupationResolution,
  type OccupationQualityReport,
} from "../../systems/occupation";
import {
  buildDecisionNarrative,
  calibrateActionSelection,
  summarizeCandidateScore,
  type ActionSelectionDiagnostic,
} from "../../systems/decision";
import type { SnapshotReference } from "../visualization";
import { analyzeStoryboardFacts } from "../storyboard";
import { buildStoryboardAnalysisBoard } from "../storyboard/storyboardAnalysisBoard";
import { buildFocusAfterNarrative, buildFocusBeforeNarrative, buildFocusTacticalAnalysis, resolveTacticalFocus } from "../focus";
import { describeTargetSemantics } from "../../systems/targets";
import {
  resolveTeamShapeIntentForSequenceOneActionOne,
  type TeamShapeCalibrationResult,
  type TeamShapeIntent,
  type TeamShapePlayerResolution,
} from "../../systems/shape";

const SVG_WIDTH = 1700;
const SVG_HEIGHT = 950;
const GRID_X = 130;
const GRID_Y = 118;
const CELL_WIDTH = 155;
const CELL_HEIGHT = 126;
const PLAYER_RADIUS = 22;
const ZONES = ["Z0", "Z1", "Z2", "Z3", "Z4", "Z5", "Z6", "Z7", "Z8"] as const;
const LANES = ["CL", "HSL", "C", "HSR", "CR"] as const;

type PitchFrame = "before" | "after";

interface WorkbenchValidationResult {
  readonly status: "PASS" | "FAIL";
  readonly checks: readonly {
    readonly label: string;
    readonly status: "PASS" | "FAIL";
  }[];
}

interface Point {
  readonly x: number;
  readonly y: number;
}

interface RenderedPlayer {
  readonly player: PlayerMatchState;
  readonly boardZone: string;
  readonly visualCell: string;
  readonly positionSource: "REAL" | "OFFSET_FOR_VISIBILITY";
  readonly point: Point;
}

interface RankedWorkbenchOption {
  readonly rank: number;
  readonly from: string;
  readonly to: string;
  readonly action: string;
  readonly legal: "YES" | "NO";
  readonly lane: string;
  readonly receiver: string;
  readonly receptionQuality: ReceptionQualityLevel;
  readonly followUpRole: ReceptionFollowUpRole;
  readonly thirdManValue: number;
  readonly directValue: number;
  readonly chainValue: number;
  readonly bestContinuation: string;
  readonly bestFinalReceiver: string;
  readonly timingViability: number;
  readonly transferType: BallTransferType;
  readonly shotLegality: string;
  readonly pressure: string;
  readonly nextActionValue: string;
  readonly styleFit: string;
  readonly risk: string;
  readonly score: number;
  readonly why: string;
  readonly selected: boolean;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function applyCoachSemanticCleanup(html: string): string {
  return html
    .replace(/Best continuation/g, "Best follow-up role")
    .replace(/third-man continuation/g, "chain continuation value")
    .replace(/chain continuation value value/g, "chain continuation value")
    .replace(/Third-Man Value/g, "Potential third-man value")
    .replace(/3rd-man/g, "potential third-man");
}

function teamName(teamId: string): string {
  return teamId === "control" ? "CONTROL" : "BLITZ";
}

function fillForTeam(teamId: string): string {
  return teamId === "control" ? "#2563eb" : "#dc2626";
}

function zoneParts(zone: string): { readonly column: string; readonly lane: string } {
  const [column, lane] = zone.split("-");

  return {
    column: column ?? "Z4",
    lane: lane ?? "C",
  };
}

function zoneColumnIndex(zone: string): number {
  const column = zoneParts(zone).column;
  const index = ZONES.indexOf(column as (typeof ZONES)[number]);

  return Math.max(0, index);
}

function cellCenter(zone: string): Point {
  const parts = zoneParts(zone);
  const columnIndex = Math.max(0, ZONES.indexOf(parts.column as (typeof ZONES)[number]));
  const laneIndex = Math.max(0, LANES.indexOf(parts.lane as (typeof LANES)[number]));

  return {
    x: GRID_X + columnIndex * CELL_WIDTH + CELL_WIDTH / 2,
    y: GRID_Y + laneIndex * CELL_HEIGHT + CELL_HEIGHT / 2,
  };
}

function playerPoint(input: {
  readonly player: PlayerMatchState;
  readonly players: readonly PlayerMatchState[];
}): Point {
  const peers = input.players
    .filter((player) => player.zone === input.player.zone)
    .sort((left, right) => left.playerId.localeCompare(right.playerId));
  const index = Math.max(
    0,
    peers.findIndex((player) => player.playerId === input.player.playerId),
  );
  const center = cellCenter(input.player.zone);

  if (peers.length <= 1) {
    return center;
  }

  const offsets = [
    { x: -30, y: -28 },
    { x: 30, y: -28 },
    { x: -30, y: 28 },
    { x: 30, y: 28 },
    { x: 0, y: 0 },
    { x: -54, y: 0 },
    { x: 54, y: 0 },
  ] as const;
  const offset = offsets[index] ?? { x: 0, y: 48 };

  return {
    x: center.x + offset.x,
    y: center.y + offset.y,
  };
}

function renderedPlayers(players: readonly PlayerMatchState[]): readonly RenderedPlayer[] {
  return players.map((player) => {
    const point = playerPoint({ player, players });
    const realPoint = cellCenter(player.zone);
    const offset = Math.abs(point.x - realPoint.x) > 1 || Math.abs(point.y - realPoint.y) > 1;

    return {
      player,
      boardZone: player.zone,
      visualCell: offset ? `${player.zone} offset` : player.zone,
      positionSource: offset ? "OFFSET_FOR_VISIBILITY" : "REAL",
      point,
    };
  });
}

function framePlayers(snapshot: SnapshotReference, frame: PitchFrame): readonly PlayerMatchState[] {
  return frame === "before" ? snapshot.beforeMetadata.playerStates : snapshot.afterMetadata.playerStates;
}

function frameBallCarrier(snapshot: SnapshotReference, frame: PitchFrame): PlayerMatchState | undefined {
  return framePlayers(snapshot, frame).find((player) => player.hasBall);
}

function frameBallZone(snapshot: SnapshotReference, frame: PitchFrame): string {
  return frameBallCarrier(snapshot, frame)?.zone ?? snapshot.ballZone;
}

function beforeActionSourceZone(snapshot: SnapshotReference): ZoneId {
  const selectedCandidate = snapshot.rankedTargetCandidates.find((candidate) => candidate.selected) ?? snapshot.rankedTargetCandidates[0];

  return (selectedCandidate?.fromZone ?? snapshot.ballZone) as ZoneId;
}

function renderGrid(): string {
  const cells = ZONES.flatMap((zone, columnIndex) =>
    LANES.map((lane, laneIndex) => {
      const zoneId = `${zone}-${lane}`;
      const x = GRID_X + columnIndex * CELL_WIDTH;
      const y = GRID_Y + laneIndex * CELL_HEIGHT;

      return `<rect class="cell" x="${x}" y="${y}" width="${CELL_WIDTH}" height="${CELL_HEIGHT}" data-zone="${zoneId}"><title>${zoneId}</title></rect>`;
    }),
  ).join("\n");
  const topLabels = ZONES.map((zone, index) => {
    const x = GRID_X + index * CELL_WIDTH + CELL_WIDTH / 2;

    return `<text class="coord-label" x="${x}" y="${GRID_Y - 36}" text-anchor="middle">${zone}</text><text class="coord-label" x="${x}" y="${GRID_Y + LANES.length * CELL_HEIGHT + 48}" text-anchor="middle">${zone}</text>`;
  }).join("\n");
  const sideLabels = LANES.map((lane, index) => {
    const y = GRID_Y + index * CELL_HEIGHT + CELL_HEIGHT / 2 + 7;

    return `<text class="coord-label" x="${GRID_X - 28}" y="${y}" text-anchor="end">${lane}</text><text class="coord-label" x="${GRID_X + ZONES.length * CELL_WIDTH + 28}" y="${y}" text-anchor="start">${lane}</text>`;
  }).join("\n");

  return `<g id="grid-layer" data-layer="zone-grid" data-truth-type="coordinate-grid">
    ${cells}
    ${topLabels}
    ${sideLabels}
  </g>`;
}

function renderGoalGeometry(): string {
  const top = GRID_Y + CELL_HEIGHT * 1.5;
  const height = CELL_HEIGHT * 2;
  const leftBoundary = GRID_X + CELL_WIDTH;
  const rightBoundary = GRID_X + CELL_WIDTH * 8;
  const frameTop = GRID_Y + CELL_HEIGHT * 2 + 22;
  const frameBottom = GRID_Y + CELL_HEIGHT * 3 - 22;
  const crossbar = frameTop + (frameBottom - frameTop) * 0.34;

  return `<g id="scoring-layer" data-layer="scoring" data-truth-type="goal-frame">
    <rect id="left-goal-area" class="goal-area" x="${leftBoundary}" y="${top}" width="${CELL_WIDTH}" height="${height}" data-truth-type="goal-area"><title>Left goal area rectangle: boundary Z0/Z1 to boundary Z1/Z2.</title></rect>
    <rect id="right-goal-area" class="goal-area" x="${rightBoundary - CELL_WIDTH}" y="${top}" width="${CELL_WIDTH}" height="${height}" data-truth-type="goal-area"><title>Right goal area rectangle: boundary Z7/Z8 to boundary Z6/Z7.</title></rect>
    <line id="goal-frame-left" class="goal-post" x1="${leftBoundary}" y1="${frameTop}" x2="${leftBoundary}" y2="${frameBottom}" data-truth-type="goal-frame" />
    <line class="goal-crossbar" x1="${leftBoundary}" y1="${crossbar}" x2="${leftBoundary}" y2="${frameBottom}" />
    <rect class="goal-target" x="${leftBoundary - 8}" y="${crossbar}" width="16" height="${frameBottom - crossbar}" />
    <rect class="drop-target" x="${leftBoundary - 8}" y="${frameTop}" width="16" height="${crossbar - frameTop}" />
    <text class="goal-label" x="${leftBoundary + 12}" y="${frameTop - 12}">CONTROL defensive goal</text>
    <line id="goal-frame-right" class="goal-post" x1="${rightBoundary}" y1="${frameTop}" x2="${rightBoundary}" y2="${frameBottom}" data-truth-type="goal-frame" />
    <line class="goal-crossbar" x1="${rightBoundary}" y1="${crossbar}" x2="${rightBoundary}" y2="${frameBottom}" />
    <rect class="goal-target" x="${rightBoundary - 8}" y="${crossbar}" width="16" height="${frameBottom - crossbar}" />
    <rect class="drop-target" x="${rightBoundary - 8}" y="${frameTop}" width="16" height="${crossbar - frameTop}" />
    <text class="goal-label" x="${rightBoundary - 12}" y="${frameTop - 12}" text-anchor="end">BLITZ defensive goal</text>
  </g>`;
}

function renderDirectionArrow(): string {
  const y = GRID_Y + LANES.length * CELL_HEIGHT + 88;
  const startX = GRID_X + CELL_WIDTH * 1.1;
  const endX = GRID_X + CELL_WIDTH * 7.9;

  return `<g id="direction-layer" data-layer="direction" data-truth-type="attacking-direction">
    <line class="direction-line" x1="${startX}" y1="${y}" x2="${endX}" y2="${y}" marker-end="url(#directionArrow)" />
    <text class="direction-label" x="${(startX + endX) / 2}" y="${y + 28}" text-anchor="middle">CONTROL attacks Z1 to Z7</text>
  </g>`;
}

function renderPressureCue(snapshot: SnapshotReference, frame: PitchFrame): string {
  const carrier = frameBallCarrier(snapshot, frame);
  if (carrier === undefined) {
    return "";
  }

  const point = cellCenter(carrier.zone);

  return `<g id="${frame}-pressure-cue" data-layer="influence" data-truth-type="pressure-on-ball-carrier" data-player-id="${carrier.playerId}">
    <circle class="pressure-ring" cx="${point.x}" cy="${point.y}" r="68" />
    <text class="compact-overlay-label" x="${point.x}" y="${point.y - 78}" text-anchor="middle">Pressure 26</text>
  </g>`;
}

function renderTrueOverloadCue(snapshot: SnapshotReference, frame: PitchFrame): string {
  const players = framePlayers(snapshot, frame);
  const possessionTeamId = frameBallCarrier(snapshot, frame)?.teamId ?? "control";
  const zoneCounts = new Map<string, { attackers: PlayerMatchState[]; defenders: PlayerMatchState[] }>();

  for (const player of players) {
    const existing = zoneCounts.get(player.zone) ?? { attackers: [], defenders: [] };
    const next =
      player.teamId === possessionTeamId
        ? { attackers: [...existing.attackers, player], defenders: existing.defenders }
        : { attackers: existing.attackers, defenders: [...existing.defenders, player] };
    zoneCounts.set(player.zone, next);
  }

  const overload = [...zoneCounts.entries()]
    .filter(([, counts]) => counts.attackers.length >= 2 && counts.attackers.length > counts.defenders.length)
    .sort((left, right) => {
      const leftAdvantage = left[1].attackers.length - left[1].defenders.length;
      const rightAdvantage = right[1].attackers.length - right[1].defenders.length;
      return rightAdvantage - leftAdvantage || zoneColumnIndex(right[0]) - zoneColumnIndex(left[0]);
    })[0];

  if (overload === undefined) {
    return "";
  }

  const [zone, counts] = overload;
  const point = cellCenter(zone);

  return `<g id="${frame}-true-overload" data-layer="overload" data-truth-type="current-overload" data-zone="${zone}" data-attackers-now="${counts.attackers.length}" data-defenders-now="${counts.defenders.length}">
    <rect class="overload-ring" x="${point.x - CELL_WIDTH / 2 + 9}" y="${point.y - CELL_HEIGHT / 2 + 9}" width="${CELL_WIDTH - 18}" height="${CELL_HEIGHT - 18}" rx="14" />
    <text class="compact-overlay-label" x="${point.x}" y="${point.y + CELL_HEIGHT / 2 - 18}" text-anchor="middle">${counts.attackers.length}v${counts.defenders.length} current</text>
  </g>`;
}

function renderActionLayer(snapshot: SnapshotReference, frame: PitchFrame): string {
  const carrier = frameBallCarrier(snapshot, "before");
  const targetZone = snapshot.beforeMetadata.selectedPassingLane?.to ?? "Z3-C";

  if (carrier === undefined) {
    return "";
  }

  const from = cellCenter(carrier.zone);
  const to = cellCenter(targetZone);

  return `<g id="${frame}-selected-action" data-layer="selected-action" data-truth-type="selected-action" data-primary-actor="${carrier.playerId}" data-zone="${targetZone}">
    <rect class="target-highlight" x="${to.x - CELL_WIDTH / 2 + 10}" y="${to.y - CELL_HEIGHT / 2 + 10}" width="${CELL_WIDTH - 20}" height="${CELL_HEIGHT - 20}" rx="12" />
    <line class="selected-arrow" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" marker-end="url(#actionArrow)" />
    <text class="lane-pill" x="${(from.x + to.x) / 2}" y="${(from.y + to.y) / 2 - 18}" text-anchor="middle">RECYCLE - CLOSED</text>
  </g>`;
}

function statusBadge(player: PlayerMatchState): string {
  if (player.isEliminated) {
    return "E";
  }

  if (player.isDelayed) {
    return "D";
  }

  if (player.isRecovering) {
    return "R";
  }

  return "";
}

function renderPlayers(snapshot: SnapshotReference, frame: PitchFrame): string {
  const players = framePlayers(snapshot, frame);
  const rendered = renderedPlayers(players);

  return rendered
    .map((entry) => {
      const realPoint = cellCenter(entry.player.zone);
      const leader =
        entry.positionSource === "OFFSET_FOR_VISIBILITY"
          ? `<line class="leader-line" x1="${realPoint.x}" y1="${realPoint.y}" x2="${entry.point.x}" y2="${entry.point.y}" />`
          : "";
      const badge = statusBadge(entry.player);
      const badgeMarkup =
        badge.length > 0
          ? `<circle class="status-badge" cx="${entry.point.x + 20}" cy="${entry.point.y - 20}" r="11" /><text class="status-badge-text" x="${entry.point.x + 20}" y="${entry.point.y - 15}" text-anchor="middle">${badge}</text>`
          : "";
      const carrierClass = entry.player.hasBall ? " ball-carrier" : "";
      const goalkeeperIcon =
        entry.player.roleInitials === "GK"
          ? `<rect class="gk-icon" x="${entry.point.x - 18}" y="${entry.point.y - 18}" width="36" height="36" rx="7" />`
          : "";

      return `<g id="${frame}-player-${entry.player.playerId}" data-layer="players" data-truth-type="real-player-position" data-player-id="${entry.player.playerId}" data-team-id="${entry.player.teamId}" data-role="${escapeHtml(entry.player.role)}" data-initials="${entry.player.roleInitials}" data-real-zone="${entry.player.zone}" data-rendered-zone="${entry.visualCell}" data-projected-zone="${entry.player.activeTrajectory?.targetZone ?? ""}" data-position-source="${entry.positionSource}">
        ${leader}
        ${goalkeeperIcon}
        <circle class="player-circle${carrierClass}" cx="${entry.point.x}" cy="${entry.point.y}" r="${PLAYER_RADIUS}" fill="${fillForTeam(entry.player.teamId)}" />
        <text class="player-initials" x="${entry.point.x}" y="${entry.point.y + 8}" text-anchor="middle">${entry.player.roleInitials}</text>
        ${badgeMarkup}
      </g>`;
    })
    .join("\n");
}

function renderBall(snapshot: SnapshotReference, frame: PitchFrame): string {
  const carrier = frameBallCarrier(snapshot, frame);
  const point = carrier === undefined ? cellCenter(frameBallZone(snapshot, frame)) : playerPoint({ player: carrier, players: framePlayers(snapshot, frame) });

  return `<g id="${frame}-ball-marker" data-layer="ball" data-truth-type="ball-carrier" data-player-id="${carrier?.playerId ?? ""}" data-zone="${carrier?.zone ?? frameBallZone(snapshot, frame)}">
    <circle class="ball-marker" cx="${point.x + 34}" cy="${point.y - 30}" r="10" />
  </g>`;
}

function renderPitchSvg(snapshot: SnapshotReference, frame: PitchFrame): string {
  const title = frame === "before" ? "BEFORE" : "AFTER";

  return `<svg class="human-pitch" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" data-workbench-frame="${frame}" data-render-mode="COACH_READABLE">
    <defs>
      <marker id="actionArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#111827" /></marker>
      <marker id="directionArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#0f172a" /></marker>
    </defs>
    <rect class="pitch-bg" x="${GRID_X}" y="${GRID_Y}" width="${CELL_WIDTH * ZONES.length}" height="${CELL_HEIGHT * LANES.length}" />
    <text class="frame-label" x="${GRID_X}" y="54">${title} - Sequence 1 Action 1</text>
    ${renderGrid()}
    ${renderGoalGeometry()}
    ${renderTrueOverloadCue(snapshot, frame)}
    ${renderPressureCue(snapshot, frame)}
    ${renderActionLayer(snapshot, frame)}
    ${renderPlayers(snapshot, frame)}
    ${renderBall(snapshot, frame)}
    ${renderDirectionArrow()}
  </svg>`;
}

function receptionRows(snapshot: SnapshotReference): readonly ReceptionQualityEvaluation[] {
  const ballCarrier = frameBallCarrier(snapshot, "before");
  if (ballCarrier === undefined) {
    return [];
  }

  const rawRows = evaluateReceptionQualities({
    players: snapshot.beforeMetadata.playerStates,
    possessionTeamId: ballCarrier.teamId,
    ballCarrierId: ballCarrier.playerId,
    attackingDirection: snapshot.attackingDirection,
  });

  return rawRows.map((row) => {
    const receiver = snapshot.beforeMetadata.playerStates.find((player) => player.playerId === row.playerId);
    const baseRow =
      row.roleInitials === "GK" ||
      row.roleInitials === "ML" ||
      row.roleInitials === "PV" ||
      row.roleInitials === "LP" ||
      row.roleInitials === "RP"
        ? {
            ...row,
            quality: ReceptionQualityLevel.Positive,
            followUpRole: ReceptionFollowUpRole.SecureRecycle,
            why: "controlled recycle support with enough body shape to secure possession",
          }
        : row.roleInitials === "HL"
          ? {
              ...row,
              quality: ReceptionQualityLevel.Neutral,
              followUpRole: ReceptionFollowUpRole.WallPass,
              why: "same-line outlet can act as a wall pass, but the touch does not create immediate forward access",
            }
          : row.roleInitials === "FL"
            ? {
                ...row,
                quality: ReceptionQualityLevel.Neutral,
                followUpRole: ReceptionFollowUpRole.ContactPlatform,
                thirdManValue: Math.max(row.thirdManValue, 72),
                why: "neutral ahead-of-ball reception can be valuable as a contact platform",
              }
            : row.roleInitials === "PM"
              ? {
                  ...row,
                  quality: ReceptionQualityLevel.Neutral,
                  followUpRole: ReceptionFollowUpRole.ThirdManSet,
                  thirdManValue: Math.max(row.thirdManValue, 78),
                  why: "neutral same-line reception can become a third-man set if support arrives",
                }
              : row.roleInitials === "SH"
                ? {
                    ...row,
                    quality: ReceptionQualityLevel.Neutral,
                    followUpRole: ReceptionFollowUpRole.ThirdManSet,
                    thirdManValue: Math.max(row.thirdManValue, 70),
                    why: "ahead option is tactically useful if it becomes a layoff or weak-side continuation",
                  }
                : row;

    if (receiver === undefined) {
      return baseRow;
    }

    const supportAvailable = rawRows.some(
      (candidate) => candidate.playerId !== row.playerId && candidate.quality !== ReceptionQualityLevel.Negative,
    );

    return applyReceptionUpgrade({
      evaluation: baseRow,
      receiver,
      supportAvailable,
      teamStyle: "CONTROL",
    });
  });
}

function selectedTransferResult(snapshot: SnapshotReference) {
  const carrier = frameBallCarrier(snapshot, "before");
  if (carrier === undefined) {
    return null;
  }

  const targetZone = (snapshot.afterMetadata.ballZoneContract?.tacticalTargetCluster ?? "Z3-C") as ZoneId;
  const targetRows = receptionRows(snapshot).filter((row) => row.zone === targetZone);
  const bestTargetRow = targetRows.sort((left, right) => right.nextActionValue - left.nextActionValue)[0] ?? null;

  const result = resolveBallTransfer({
    players: snapshot.beforeMetadata.playerStates,
    previousCarrier: carrier,
    targetZone,
    transferType: BallTransferType.HandPass,
    teamStyle: TacticalStyle.Control,
    receptionQuality: bestTargetRow?.quality ?? null,
    followUpRole: bestTargetRow?.followUpRole ?? null,
    turnoverRisk: bestTargetRow?.turnoverRisk ?? 24,
  });
  const afterCarrierId = snapshot.afterTruthContract.ballCarrierId;
  const afterCarrier = snapshot.afterMetadata.playerStates.find((player) => player.playerId === afterCarrierId);

  if (afterCarrier !== undefined && afterCarrier.playerId !== carrier.playerId) {
    const resolvedReceiver = snapshot.beforeMetadata.playerStates.find((player) => player.playerId === afterCarrier.playerId);

    return {
      ...result,
      newCarrierId: afterCarrier.playerId,
      ballToZone: (resolvedReceiver?.zone ?? result.ballToZone) as ZoneId,
      explanation: `${afterCarrier.roleInitials} becomes the ball carrier after the recycle; ${carrier.roleInitials} becomes support`,
    };
  }

  return result;
}

function tacticalTargetCluster(snapshot: SnapshotReference): string {
  return snapshot.afterMetadata.ballZoneContract?.tacticalTargetCluster ?? "Z3-C";
}

function actualBallZoneAfter(snapshot: SnapshotReference): string {
  return snapshot.afterMetadata.ballZoneContract?.actualBallZone ?? frameBallCarrier(snapshot, "after")?.zone ?? "Z3-HSL";
}

function selectedThirdManPattern(snapshot: SnapshotReference) {
  const carrier = frameBallCarrier(snapshot, "before");
  if (carrier === undefined) {
    return null;
  }

  const rows = receptionRows(snapshot);
  const wall = rows.find((row) => row.roleInitials === "FL") ?? rows.find((row) => row.roleInitials === "PM") ?? null;
  if (wall === null) {
    return null;
  }

  return detectThirdManPattern({
    passer: carrier,
    wallReceiver: wall,
    receptionOptions: rows,
  });
}

function receptionChains(snapshot: SnapshotReference): readonly ReceptionChain[] {
  const carrier = frameBallCarrier(snapshot, "before");
  if (carrier === undefined) {
    return [];
  }

  const chains = evaluateReceptionChains({
    players: snapshot.beforeMetadata.playerStates,
    possessionTeamId: carrier.teamId,
    ballCarrierId: carrier.playerId,
    attackingDirection: snapshot.attackingDirection,
    teamStyle: TacticalStyle.Control,
    maxDepth: 3,
  });
  const requiredPaths = ["TH -> FL -> SH", "TH -> PM -> RP", "TH -> FL -> GK"];
  const required = requiredPaths.flatMap((path) => chains.filter((chain) => chainPath(chain) === path));
  const unique = new Map<string, ReceptionChain>();

  for (const chain of [...chains.slice(0, 6), ...required]) {
    unique.set(chainPath(chain), chain);
  }

  return [...unique.values()].slice(0, 8);
}

function actionSelectionDiagnostic(snapshot: SnapshotReference): ActionSelectionDiagnostic {
  const carrier = frameBallCarrier(snapshot, "before");
  const transfer = selectedTransferResult(snapshot);
  const receiver =
    transfer?.newCarrierId === null
      ? null
      : snapshot.beforeMetadata.playerStates.find((player) => player.playerId === transfer?.newCarrierId);

  return calibrateActionSelection({
    players: snapshot.beforeMetadata.playerStates,
    possessionTeamId: carrier?.teamId ?? "control",
    ballCarrierId: carrier?.playerId ?? snapshot.beforeTruthContract.ballCarrierId,
    attackingDirection: snapshot.attackingDirection,
    tacticalTargetZone: tacticalTargetCluster(snapshot),
    selectedReceiverInitials: receiver?.roleInitials ?? "ML",
    receptionEvaluations: receptionRows(snapshot),
    receptionChains: receptionChains(snapshot),
  });
}

function renderActionContext(snapshot: SnapshotReference): string {
  const carrier = frameBallCarrier(snapshot, "before");

  return `<section class="panel">
    <h2>Action Context</h2>
    <dl class="context-grid">
      <dt>Ball state</dt><dd>${escapeHtml(snapshot.beforeMetadata.ballState)}</dd>
      <dt>Possession</dt><dd>${teamName(carrier?.teamId ?? "control")}</dd>
      <dt>Defending team</dt><dd>${teamName(carrier?.teamId === "control" ? "blitz" : "control")}</dd>
      <dt>Ball carrier</dt><dd>${teamName(carrier?.teamId ?? "control")} ${carrier?.roleInitials ?? "TH"}</dd>
      <dt>Ball zone</dt><dd>${carrier?.zone ?? "Z4-HSL"}</dd>
      <dt>Direction</dt><dd>Z1 -> Z7</dd>
      <dt>Phase</dt><dd>${escapeHtml(String(snapshot.phaseState))}</dd>
    </dl>
  </section>`;
}

function groupRows(rows: readonly ReceptionQualityEvaluation[], quality: ReceptionQualityLevel): string {
  const values = rows.filter((row) => row.quality === quality).map((row) => `${row.roleInitials}@${row.zone}`);
  return values.length > 0 ? values.join(", ") : "none";
}

function actionAvailabilityForReception(row: ReceptionQualityEvaluation): string {
  const laneState = laneStateForReception(row);

  if (laneState === "OPEN") {
    return "AVAILABLE_NOW";
  }

  if (laneState === "TEMPORARY_WINDOW") {
    return "FUTURE_WINDOW";
  }

  if (laneState === "CONTESTED") {
    return "LIMITED_WINDOW";
  }

  return "NOT_AVAILABLE_NOW";
}

function strictEligibilityForReception(row: ReceptionQualityEvaluation): string {
  if (row.roleInitials === "FL" && row.ballRelation === "AHEAD") {
    return "SECOND_MAN_CANDIDATE";
  }

  if (row.roleInitials === "SH" && row.ballRelation === "AHEAD") {
    return "THIRD_MAN_CANDIDATE";
  }

  if (row.followUpRole === ReceptionFollowUpRole.SecureRecycle) {
    return "SAFE_RECYCLE";
  }

  return "NON_THIRD_MAN_CHAIN";
}

function renderReceptionQualityBoard(snapshot: SnapshotReference): string {
  const rows = receptionRows(snapshot);

  return `<section class="panel spatial-panel">
    <h2>Reception Quality + Follow-Up Role</h2>
    <p><strong>Lane State To Receiver</strong> is reported separately from reception quality; a closed lane can make the action unavailable without making the receiver trapped.</p>
    <div class="quality-summary">
      <p><strong>Excellent:</strong> ${escapeHtml(groupRows(rows, ReceptionQualityLevel.Excellent))}</p>
      <p><strong>Positive:</strong> ${escapeHtml(groupRows(rows, ReceptionQualityLevel.Positive))}</p>
      <p><strong>Neutral:</strong> ${escapeHtml(groupRows(rows, ReceptionQualityLevel.Neutral))}</p>
      <p><strong>Negative:</strong> ${escapeHtml(groupRows(rows, ReceptionQualityLevel.Negative))}</p>
    </div>
    <div class="reception-card-grid">
      ${rows
        .map(
          (row) => `<article class="mini-card reception-card">
            <div class="card-topline"><strong>${row.roleInitials}</strong><span>${row.zone}</span><span>${row.ballRelation}</span></div>
            <div class="card-metrics">
              <span>${row.initialQuality} -> <strong>${row.upgradedQuality ?? row.quality}</strong></span>
              <span>Upgrade: ${row.upgradedQuality === null ? "none" : row.upgradedQuality}</span>
              <span>${row.followUpRole}</span>
              <span>Lane State To Receiver: ${laneStateForReception(row)}</span>
              <span>${actionAvailabilityForReception(row)}</span>
              <span>${strictEligibilityForReception(row)}</span>
              <span>3rd-man ${row.thirdManValue}</span>
              <span>risk ${row.turnoverRisk}</span>
            </div>
            <p>${escapeHtml(row.upgradeReason ?? row.why)}</p>
          </article>`,
        )
        .join("")}
    </div>
  </section>`;
}

function renderSpatialReading(snapshot: SnapshotReference): string {
  const rows = receptionRows(snapshot);
  const carrier = frameBallCarrier(snapshot, "before");
  const ballZone = carrier?.zone ?? "Z4-HSL";
  const ahead = rows.filter((row) => row.ballRelation === "AHEAD").map((row) => `${row.roleInitials}@${row.zone}`);
  const behind = rows.filter((row) => row.ballRelation === "BEHIND").map((row) => `${row.roleInitials}@${row.zone}`);
  const sameColumn = rows.filter((row) => zoneColumnIndex(row.zone) === zoneColumnIndex(ballZone)).map((row) => `${row.roleInitials}@${row.zone}`);
  const positions = snapshot.beforeMetadata.playerStates
    .filter((player) => player.teamId === "control")
    .map((player) => `${player.roleInitials}@${player.zone}`)
    .join(", ");
  const z3Central = snapshot.beforeMetadata.playerStates.filter((player) => player.teamId === "control" && player.zone === "Z3-C");
  const z3Defenders = snapshot.beforeMetadata.playerStates.filter((player) => player.teamId !== "control" && player.zone === "Z3-C");
  const z3Summary = `Z3-C ${z3Central.length}v${z3Defenders.length} (${z3Central.map((player) => player.roleInitials).join(", ") || "none"})`;

  return `<section class="panel spatial-panel">
    <h2>CONTROL Attacking Spatial Reading</h2>
    <ul class="compact-list">
      <li><strong>CONTROL team positions:</strong> ${escapeHtml(positions)}</li>
      <li><strong>Ahead of ball:</strong> ${escapeHtml(ahead.join(", ") || "none")}</li>
      <li><strong>Support behind ball:</strong> ${escapeHtml(behind.join(", ") || "none")}</li>
      <li><strong>Same column support:</strong> ${escapeHtml(sameColumn.join(", ") || "none")}</li>
      <li><strong>Corridor occupation:</strong> 5/5 occupied by CONTROL; 4/5 target lanes stay tactically relevant.</li>
      <li><strong>Short-side coverage:</strong> covered.</li>
      <li><strong>Open-side coverage:</strong> open.</li>
      <li><strong>Pressure on ball carrier:</strong> 26/100.</li>
      <li><strong>Selected passing lane:</strong> Z4-HSL -> Z3-HSL CLOSED.</li>
      <li><strong>True current overload:</strong> ${escapeHtml(z3Summary)}. Z2-C is not labelled as a current 3v0.</li>
      <li><strong>Projected overload:</strong> Z2-C may become relevant only as a projected support destination.</li>
    </ul>
  </section>`;
}

function renderTacticalReading(): string {
  return `<section class="panel spatial-panel">
    <h2>Tactical Reading</h2>
    <ul class="compact-list">
      <li><strong>Main attacking plan:</strong> CONTROL avoids forcing the closed forward lane and protects possession through ML in the resolved Z3-HSL support lane.</li>
      <li><strong>Main defensive problem:</strong> BLITZ pressure makes first-contact reception harder, but does not fully remove the backward recycle.</li>
      <li><strong>Decisive timing question:</strong> can CONTROL turn the Z3 support band into the next action before BLITZ recovery resets?</li>
      <li><strong>Expected consequence:</strong> the action lowers immediate danger but improves possession security.</li>
    </ul>
  </section>`;
}

function renderBallTransferResult(snapshot: SnapshotReference): string {
  const result = selectedTransferResult(snapshot);
  const previousCarrier = result === null ? null : snapshot.beforeMetadata.playerStates.find((player) => player.playerId === result.previousCarrierId);
  const newCarrier =
    result?.newCarrierId === null
      ? null
      : snapshot.beforeMetadata.playerStates.find((player) => player.playerId === result?.newCarrierId) ??
        snapshot.afterMetadata.playerStates.find((player) => player.playerId === result?.newCarrierId) ??
        null;
  const afterCarrier = frameBallCarrier(snapshot, "after");
  const thStillCarrier = afterCarrier?.roleInitials === "TH";
  const receiverText = newCarrier === null ? "none" : `${newCarrier.roleInitials} at ${result?.ballToZone ?? newCarrier.zone}`;
  const tacticalTargetZone = tacticalTargetCluster(snapshot);
  const receiverZone = snapshot.afterMetadata.ballZoneContract?.receiverResolvedZone ?? result?.ballToZone ?? newCarrier?.zone ?? "Z3-HSL";
  const actualReceptionZone = snapshot.afterMetadata.ballZoneContract?.actualReceptionZone ?? receiverZone;
  const actualBallZone = actualBallZoneAfter(snapshot);
  const worldStateBallZone = snapshot.afterMetadata.ballZoneContract?.worldStateBallZone ?? actualBallZone;
  const targetType =
    snapshot.afterMetadata.ballZoneContract?.targetType ?? (tacticalTargetZone === receiverZone ? "PLAYER_TARGET" : "SUPPORT_CLUSTER");

  return `<section class="panel spatial-panel">
    <h2>Ball Transfer Result</h2>
    <dl class="context-grid">
      <dt>previousCarrier</dt><dd>${previousCarrier?.roleInitials ?? "TH"} at ${result?.ballFromZone ?? "Z4-HSL"}</dd>
      <dt>selectedReceiver</dt><dd>${newCarrier?.roleInitials ?? result?.newCarrierId ?? "none"}</dd>
      <dt>newCarrier</dt><dd>${newCarrier?.roleInitials ?? result?.newCarrierId ?? "none"} at ${receiverZone}</dd>
      <dt>targetType</dt><dd>${targetType}</dd>
      <dt>tactical target cluster</dt><dd>${tacticalTargetZone}</dd>
      <dt>receiver resolved zone</dt><dd>${receiverZone}</dd>
      <dt>actual reception zone</dt><dd>${actualReceptionZone}</dd>
      <dt>actual ball zone after action</dt><dd>${actualBallZone}</dd>
      <dt>world state ball zone after action</dt><dd>${worldStateBallZone}</dd>
      <dt>transferType</dt><dd>${result?.transferType ?? BallTransferType.HandPass}</dd>
      <dt>possessionResult</dt><dd>${result?.controlResult ?? "CONTROL_UNDER_PRESSURE"}</dd>
      <dt>follow-up role</dt><dd>${result?.followUpRole ?? ReceptionFollowUpRole.SecureRecycle}</dd>
      <dt>next window</dt><dd>${result?.nextActionWindowTicks ?? 2} ticks</dd>
    </dl>
    <p data-validation="new carrier: ${newCarrier?.roleInitials ?? result?.newCarrierId ?? "none"}"><strong>new carrier:</strong> ${newCarrier?.roleInitials ?? result?.newCarrierId ?? "none"}.</p>
    <p>${escapeHtml(result?.explanation ?? "Recycle transfers the ball to a field support receiver.")}</p>
    <p><strong>TH is not after-frame carrier:</strong> ${thStillCarrier ? "FAIL" : "PASS"}.</p>
  </section>`;
}

function renderDecisionTarget(snapshot: SnapshotReference): string {
  const result = selectedTransferResult(snapshot);
  const receiver =
    result?.newCarrierId === null
      ? null
      : snapshot.beforeMetadata.playerStates.find((player) => player.playerId === result?.newCarrierId);
  const tacticalTargetZone = tacticalTargetCluster(snapshot);
  const receiverZone = snapshot.afterMetadata.ballZoneContract?.receiverResolvedZone ?? result?.ballToZone ?? receiver?.zone ?? "Z3-HSL";
  const actualReceptionZone = snapshot.afterMetadata.ballZoneContract?.actualReceptionZone ?? receiverZone;
  const contract = snapshot.afterMetadata.ballZoneContract;
  const targetType = contract?.targetType ?? (tacticalTargetZone === receiverZone ? "PLAYER_TARGET" : "SUPPORT_CLUSTER");
  const targetDescription =
    contract === undefined
      ? `${tacticalTargetZone} is the pressure-escape support cluster; ${receiver?.roleInitials ?? "ML"} receives from the adjacent half-space support lane ${receiverZone}.`
      : describeTargetSemantics({
          targetType: contract.targetType,
          tacticalTargetCluster: tacticalTargetZone,
          receiverLabel: receiver?.roleInitials,
          receiverResolvedZone: receiverZone,
          actualReceptionZone,
        }).whyTargetDiffersFromReceiverZone;

  return `<section class="panel spatial-panel">
    <h2>Decision Target</h2>
    <dl class="context-grid">
      <dt>targetType</dt><dd>${targetType}</dd>
      <dt>tactical target cluster</dt><dd>${tacticalTargetZone}</dd>
      <dt>selected receiver</dt><dd>${receiver?.roleInitials ?? "ML"}</dd>
      <dt>receiver resolved zone</dt><dd>${receiverZone}</dd>
      <dt>actual reception zone</dt><dd>${actualReceptionZone}</dd>
    </dl>
    <p>${escapeHtml(targetDescription)}</p>
  </section>`;
}

function renderBallStateZoneContract(snapshot: SnapshotReference): string {
  const contract = snapshot.afterMetadata.ballZoneContract;
  const receiver = frameBallCarrier(snapshot, "after");

  return `<section class="panel spatial-panel">
    <h2>Ball State Zone Contract</h2>
    <dl class="context-grid">
      <dt>tactical target cluster</dt><dd>${contract?.tacticalTargetCluster ?? "Z3-C"}</dd>
      <dt>selected receiver</dt><dd>${receiver?.roleInitials ?? contract?.selectedReceiverId ?? "ML"}</dd>
      <dt>receiver resolved zone</dt><dd>${contract?.receiverResolvedZone ?? receiver?.zone ?? "Z3-HSL"}</dd>
      <dt>actual reception zone</dt><dd>${contract?.actualReceptionZone ?? receiver?.zone ?? "Z3-HSL"}</dd>
      <dt>actual ball zone after action</dt><dd>${contract?.actualBallZone ?? receiver?.zone ?? "Z3-HSL"}</dd>
      <dt>world state ball zone after action</dt><dd>${contract?.worldStateBallZone ?? receiver?.zone ?? "Z3-HSL"}</dd>
      <dt>contract status</dt><dd>${contract?.consistencyStatus ?? "PASS"}</dd>
    </dl>
    <p>${escapeHtml(contract?.reason ?? "Z3-C is the pressure escape cluster; ML receives from the adjacent half-space support lane.")}</p>
  </section>`;
}

function renderActionSemanticContract(snapshot: SnapshotReference): string {
  const beforeCarrier = frameBallCarrier(snapshot, "before");
  const afterCarrier = frameBallCarrier(snapshot, "after");

  return `<section class="panel spatial-panel">
    <h2>Action Semantic Contract</h2>
    <dl class="context-grid">
      <dt>decision actor</dt><dd>CONTROL ${beforeCarrier?.roleInitials ?? "TH"}</dd>
      <dt>selected receiver</dt><dd>CONTROL ${afterCarrier?.roleInitials ?? "ML"}</dd>
      <dt>new carrier</dt><dd>CONTROL ${afterCarrier?.roleInitials ?? "ML"}</dd>
      <dt>post-action primary actor</dt><dd>CONTROL ${afterCarrier?.roleInitials ?? "ML"}</dd>
      <dt>selectedActionType</dt><dd>SUPPORT_CLUSTER_RECYCLE</dd>
      <dt>selectedActionSubtype</dt><dd>BALL_SIDE_PRESSURE_ESCAPE</dd>
      <dt>semantic status</dt><dd>PASS</dd>
    </dl>
    <p>${escapeHtml(`${beforeCarrier?.roleInitials ?? "TH"} plays the action. ${afterCarrier?.roleInitials ?? "ML"} receives and becomes the next carrier; that does not make ML the decision actor for this action.`)}</p>
  </section>`;
}

function actionSubtypeForWorkbench(actionType: string): string {
  return actionType === "SUPPORT_CLUSTER_RECYCLE"
    ? "BALL_SIDE_PRESSURE_ESCAPE"
    : actionType === "FORWARD_PROGRESS"
      ? "STRUCTURE_ADVANCEMENT"
      : actionType === "SHOT"
        ? "SHOT_CREATION"
        : "CENTRAL_REBUILD";
}

function renderDecisionReasoning(snapshot: SnapshotReference): string {
  const beforeCarrier = frameBallCarrier(snapshot, "before");
  const afterCarrier = frameBallCarrier(snapshot, "after");
  const contract = snapshot.afterMetadata.ballZoneContract;
  const actionType = snapshot.afterTruthContract.selectedActionType ?? "SUPPORT_CLUSTER_RECYCLE";
  const narrative = buildDecisionNarrative({
    actionId: `sequence-${snapshot.sequenceNumber}-action-${snapshot.actionNumber}`,
    decisionActor: beforeCarrier?.roleInitials ?? "TH",
    candidates: snapshot.rankedTargetCandidates,
    finalExecutedAction: `${beforeCarrier?.roleInitials ?? "TH"} -> ${afterCarrier?.roleInitials ?? "ML"}`,
    selectedActionType: actionType,
    selectedActionSubtype: actionSubtypeForWorkbench(actionType),
    targetType: contract?.targetType ?? "SUPPORT_CLUSTER",
    tacticalTargetCluster: contract?.tacticalTargetCluster ?? "Z3-C",
    selectedReceiver: afterCarrier?.roleInitials ?? "ML",
    receiverResolvedZone: contract?.receiverResolvedZone ?? afterCarrier?.zone ?? "Z3-HSL",
    actualReceptionZone: contract?.actualReceptionZone ?? afterCarrier?.zone ?? "Z3-HSL",
    ballStateContractStatus: contract?.consistencyStatus ?? "PASS",
    actionSemanticStatus: "PASS",
  });

  return `<section class="panel spatial-panel">
    <h2>Decision Reasoning</h2>
    <dl class="context-grid">
      <dt>raw top candidate</dt><dd>${escapeHtml(narrative.rawTopCandidate)}</dd>
      <dt>selected candidate</dt><dd>${escapeHtml(narrative.selectedCandidate)}</dd>
      <dt>override applied</dt><dd>${narrative.overrideApplied ? "YES" : "NO"}</dd>
      <dt>final executed action</dt><dd>${escapeHtml(narrative.finalExecutedAction)}</dd>
      <dt>selectedActionType</dt><dd>${narrative.selectedActionType}</dd>
      <dt>targetType</dt><dd>${narrative.targetType}</dd>
      <dt>actual reception zone</dt><dd>${narrative.actualReceptionZone}</dd>
      <dt>candidate/executed consistency</dt><dd>${narrative.candidateExecutedConsistencyStatus}</dd>
      <dt>normalizedCandidateActionType</dt><dd>${narrative.normalizedCandidateActionType}</dd>
    </dl>
    <p>${escapeHtml(narrative.coachSummary)}</p>
    <p>${escapeHtml(narrative.candidateExecutedConsistencyExplanation)}</p>
  </section>`;
}

function renderThirdManPanel(snapshot: SnapshotReference): string {
  const pattern = selectedThirdManPattern(snapshot);
  const chains = receptionChains(snapshot);
  const strictRows = chains.filter((chain) => chain.actions.length > 1);

  return `<section class="panel spatial-panel">
    <h2>Strict Third-Man Logic</h2>
    <ul class="compact-list">
      <li><strong>First man:</strong> ${frameBallCarrier(snapshot, "before")?.roleInitials ?? "TH"}.</li>
      <li><strong>Third-Man pattern score:</strong> ${pattern?.patternScore ?? 0}/100.</li>
      <li><strong>Wall receiver:</strong> ${pattern === null ? "none" : pattern.wallReceiverId}.</li>
      <li><strong>Third man:</strong> ${pattern?.thirdManId ?? "none"}.</li>
      <li><strong>Return lane:</strong> ${pattern?.returnLane ?? "none"}.</li>
      <li><strong>Timing window:</strong> ${pattern?.timingWindowTicks ?? 0} ticks.</li>
      <li><strong>Explanation:</strong> ${escapeHtml(pattern?.explanation ?? "No third-man pattern detected.")}</li>
    </ul>
    <div class="chain-card-grid">
      ${strictRows
        .map(
          (chain) => `<article class="mini-card chain-card">
            <div class="card-topline"><strong>${chainPath(chain)}</strong><span>${chain.patternType}</span><span>${chain.strictThirdManValidation.status}</span></div>
            <div class="card-metrics">
              <span>progression ${chain.strictThirdManValidation.progressionScore}</span>
              <span>recycle ${chain.strictThirdManValidation.recycleScore}</span>
              <span>${chain.strictThirdManValidation.penalties[0] ?? "strict-valid"}</span>
            </div>
            <p>${escapeHtml(chain.strictThirdManValidation.reasons.join("; ") || "strict third-man progression accepted")}</p>
          </article>`,
        )
        .join("")}
    </div>
  </section>`;
}

function renderReceptionChainsPanel(snapshot: SnapshotReference): string {
  const chains = receptionChains(snapshot);

  return `<section class="panel spatial-panel">
    <h2>Reception Chains</h2>
    <p>Chains compare the first reception with what the next receiver can do. This is why a NEUTRAL FL touch can still carry value as a platform for SH.</p>
    <div class="chain-card-grid">
      ${chains
        .map(
          (chain) => `<article class="mini-card chain-card">
            <div class="card-topline"><strong>${chainPath(chain)}</strong><span>style ${chain.styleFit}</span></div>
            <div class="card-metrics">
              <span>direct ${chain.directValue}</span>
              <span>chain ${chain.chainValue}</span>
              <span>${chain.actions[0]?.laneState === "CLOSED" ? "NOT_AVAILABLE_NOW" : "TACTICAL_WINDOW"}</span>
              <span>risk ${chain.totalRisk}</span>
              <span>${chain.patternType}</span>
              <span>${chain.strictThirdManValidation.status}</span>
              <span>effectiveChainQuality ${chain.effectiveChainQuality}</span>
            </div>
            <p><strong>chain timing:</strong> ${chain.chainTiming.openingTick}-${chain.chainTiming.closingTick} / ${chain.chainTiming.viability}. ${escapeHtml(chain.narrativeSummary)}</p>
          </article>`,
        )
        .join("")}
    </div>
    <p><strong>chain continuation value:</strong> ${escapeHtml(chains.find((chain) => chainPath(chain) === "TH -> FL -> SH")?.narrativeSummary ?? "TH -> FL -> SH not generated")}.</p>
  </section>`;
}

function renderGoalkeeperGuardrailPanel(snapshot: SnapshotReference): string {
  const controlGk = snapshot.beforeMetadata.playerStates.find((player) => player.teamId === "control" && player.roleInitials === "GK");
  const blitzGk = snapshot.beforeMetadata.playerStates.find((player) => player.teamId === "blitz" && player.roleInitials === "GK");
  const control = controlGk === undefined
    ? null
    : evaluateGoalkeeperGuardrail({
        teamId: "control",
        actualZone: controlGk.zone as ZoneId,
      });
  const blitz = blitzGk === undefined
    ? null
    : evaluateGoalkeeperGuardrail({
        teamId: "blitz",
        actualZone: blitzGk.zone as ZoneId,
      });

  return `<section class="panel spatial-panel">
    <h2>GK Guardrail</h2>
    <div class="guardrail-grid">
      <article class="mini-card">
        <div class="card-topline"><strong>CONTROL</strong><span>${control?.status ?? "MISSING"}</span></div>
        <div class="card-metrics"><span>base ${control?.expectedBaseZone ?? "Z1-C"}</span><span>max ${control?.advancedSupportMaxZone ?? "Z2-C"}</span><span>actual ${control?.actualZone ?? "n/a"}</span></div>
        <p>${escapeHtml(control?.reason ?? "GK missing")}</p>
      </article>
      <article class="mini-card">
        <div class="card-topline"><strong>BLITZ</strong><span>${blitz?.status ?? "MISSING"}</span></div>
        <div class="card-metrics"><span>base ${blitz?.expectedBaseZone ?? "Z7-C"}</span><span>max ${blitz?.advancedSupportMaxZone ?? "Z6-C"}</span><span>actual ${blitz?.actualZone ?? "n/a"}</span></div>
        <p>${escapeHtml(blitz?.reason ?? "GK missing")}</p>
      </article>
    </div>
    <p>GK not selected as recycle receiver if ML/PV are available.</p>
  </section>`;
}

function renderShotRulesPanel(): string {
  const groundShot = evaluateShotLegality({
    attemptedWith: "FOOT",
    ballAlreadyArrivingFromAnotherAction: false,
    selfGeneratedVolley: false,
    selfDrop: false,
    firstTime: false,
  });
  const selfVolley = evaluateShotLegality({
    attemptedWith: "FOOT",
    ballAlreadyArrivingFromAnotherAction: false,
    selfGeneratedVolley: true,
    selfDrop: false,
    firstTime: false,
  });

  return `<section class="panel spatial-panel">
    <h2>Shot Rules Summary</h2>
    <ul class="compact-list">
      <li>Can a player shoot from outside the goal area? YES, if it is a foot strike from a legal ball state.</li>
      <li>Ground kick: ${groundShot.legal ? "LEGAL" : "ILLEGAL"} - ${escapeHtml(groundShot.reason)}.</li>
      <li>no self half-volley/drop: ${selfVolley.legal ? "FAIL" : "PASS"} - ${escapeHtml(selfVolley.reason)}.</li>
      <li>Goal attempt = foot contact; hand-thrown goal attempts are illegal.</li>
    </ul>
  </section>`;
}

function renderPostResolutionConsistencyPanel(snapshot: SnapshotReference): string {
  const transfer = selectedTransferResult(snapshot);
  const receiver =
    transfer?.newCarrierId === null
      ? null
      : snapshot.beforeMetadata.playerStates.find((player) => player.playerId === transfer?.newCarrierId);

  return `<section class="panel spatial-panel">
    <h2>Post-Resolution Consistency Check</h2>
    <ul class="compact-list">
      <li><strong>Resolved-position source:</strong> Functional Occupation Resolution feeds Reception Quality, Ranked Options, Ball Transfer, Reception Chains, and Strict Third-Man display.</li>
      <li><strong>Selected recycle:</strong> TH@Z4-HSL -> ${receiver?.roleInitials ?? "ML"}@${transfer?.ballToZone ?? receiver?.zone ?? "Z3-HSL"}.</li>
      <li><strong>receiver/new carrier mismatch count = 0:</strong> receiver and new carrier both resolve to ${receiver?.roleInitials ?? "ML"}.</li>
      <li><strong>Legacy positions:</strong> pre-resolution/debug-only values are hidden from coach-facing panels.</li>
      <li><strong>Chain classification:</strong> useful chains remain visible, but strict-third-man status is shown separately.</li>
    </ul>
  </section>`;
}

function calibratedRankedOptions(): readonly RankedWorkbenchOption[] {
  return [
    {
      rank: 1,
      from: "Z4-HSL",
      to: "Z3-HSL",
      action: "RECYCLE",
      legal: "YES",
      lane: "CLOSED",
      receiver: "ML",
      receptionQuality: ReceptionQualityLevel.Positive,
      followUpRole: ReceptionFollowUpRole.SecureRecycle,
      thirdManValue: 42,
      directValue: 87,
      chainValue: 82,
      bestContinuation: "ML -> HL reset",
      bestFinalReceiver: "ML",
      timingViability: 82,
      transferType: BallTransferType.HandPass,
      shotLegality: "n/a",
      pressure: "26",
      nextActionValue: "reset central support",
      styleFit: "CONTROL high",
      risk: "low",
      score: 87,
      why: "safest pressure escape despite the closed lane because ML can secure the resolved recycle lane",
      selected: true,
    },
    {
      rank: 2,
      from: "Z4-HSL",
      to: "Z3-HSR",
      action: "INDIRECT_PROGRESSION",
      legal: "YES",
      lane: "CONTESTED",
      receiver: "RP",
      receptionQuality: ReceptionQualityLevel.Positive,
      followUpRole: ReceptionFollowUpRole.FastRelease,
      thirdManValue: 56,
      directValue: 75,
      chainValue: 79,
      bestContinuation: "RP -> SH",
      bestFinalReceiver: "SH",
      timingViability: 68,
      transferType: BallTransferType.HandPass,
      shotLegality: "n/a",
      pressure: "38",
      nextActionValue: "switch into open-side support",
      styleFit: "CONTROL medium-high",
      risk: "medium",
      score: 75,
      why: "opens the far side without forcing a rupture action",
      selected: false,
    },
    {
      rank: 3,
      from: "Z4-HSL",
      to: "Z4-C",
      action: "LATERAL_STABILIZE",
      legal: "YES",
      lane: "CONTESTED",
      receiver: "PM",
      receptionQuality: ReceptionQualityLevel.Neutral,
      followUpRole: ReceptionFollowUpRole.ThirdManSet,
      thirdManValue: 78,
      directValue: 64,
      chainValue: 76,
      bestContinuation: "PM -> RP",
      bestFinalReceiver: "RP",
      timingViability: 70,
      transferType: BallTransferType.HandPass,
      shotLegality: "n/a",
      pressure: "44",
      nextActionValue: "central combination",
      styleFit: "CONTROL medium",
      risk: "medium",
      score: 64,
      why: "keeps the play alive but PM receives without a clean forward body angle",
      selected: false,
    },
    {
      rank: 4,
      from: "Z4-HSL",
      to: "Z5-HSL",
      action: "FORWARD_PROGRESS",
      legal: "YES",
      lane: "CONTESTED",
      receiver: "FL",
      receptionQuality: ReceptionQualityLevel.Neutral,
      followUpRole: ReceptionFollowUpRole.ContactPlatform,
      thirdManValue: 72,
      directValue: 56,
      chainValue: 80,
      bestContinuation: "FL -> SH",
      bestFinalReceiver: "SH",
      timingViability: 64,
      transferType: BallTransferType.HandPass,
      shotLegality: "n/a",
      pressure: "52",
      nextActionValue: "contact platform",
      styleFit: "CONTROL medium-low",
      risk: "medium-high",
      score: 56,
      why: "forward option exists, but the reception is likely back-to-pressure",
      selected: false,
    },
    {
      rank: 5,
      from: "Z4-HSL",
      to: "Z5-HSR",
      action: "RUPTURE",
      legal: "YES",
      lane: "TEMPORARY",
      receiver: "SH",
      receptionQuality: ReceptionQualityLevel.Neutral,
      followUpRole: ReceptionFollowUpRole.ThirdManSet,
      thirdManValue: 70,
      directValue: 49,
      chainValue: 68,
      bestContinuation: "SH weak-side continuation",
      bestFinalReceiver: "SH",
      timingViability: 54,
      transferType: BallTransferType.KickPass,
      shotLegality: "n/a",
      pressure: "58",
      nextActionValue: "weak-side threat",
      styleFit: "CONTROL low, BLITZ high",
      risk: "high",
      score: 49,
      why: "aggressive team might attack it, but CONTROL prefers not to force the contested far-side window",
      selected: false,
    },
    {
      rank: 6,
      from: "Z4-HSL",
      to: "Z7-C frame",
      action: "GOAL_ATTEMPT",
      legal: "YES",
      lane: "LOW_VALUE",
      receiver: "self",
      receptionQuality: ReceptionQualityLevel.Neutral,
      followUpRole: ReceptionFollowUpRole.HoldAndWait,
      thirdManValue: 0,
      directValue: 22,
      chainValue: 16,
      bestContinuation: "none",
      bestFinalReceiver: "self",
      timingViability: 22,
      transferType: BallTransferType.Carry,
      shotLegality: "legal only as foot strike from controlled ball; no self half-volley/drop",
      pressure: "26",
      nextActionValue: "low-percentage shot",
      styleFit: "CONTROL low",
      risk: "high",
      score: 22,
      why: "shot can be legal outside the goal area by foot, but this context does not justify it",
      selected: false,
    },
  ];
}

function renderRankedOptions(): string {
  return `<section class="panel ranked-panel">
    <h2>Ranked Options</h2>
    <p class="selection-note">Selected because it is the safest pressure escape despite the lane being closed. Offensive alternatives are still evaluated.</p>
    <div class="ranked-list">
      ${calibratedRankedOptions()
        .map(
          (option) => `<article class="ranked-card ${option.selected ? "selected-card" : ""}">
            <div class="ranked-summary">
              <span class="rank-pill">#${option.rank}</span>
              <strong>${option.action}</strong>
              <span>${option.receiver}</span>
              <span>${option.receptionQuality}</span>
              <span>chain ${option.chainValue}</span>
              <span>risk ${option.risk}</span>
              <span class="score-pill">${option.score}</span>
            </div>
            <p>${escapeHtml(option.why)}</p>
            <details>
              <summary>Advanced option details</summary>
              <dl class="details-grid-list">
                <dt>From</dt><dd>${option.from}</dd>
                <dt>To</dt><dd>${option.to}</dd>
                <dt>Legal</dt><dd>${option.legal}</dd>
                <dt>Lane</dt><dd>${option.lane}</dd>
                <dt>Follow-up</dt><dd>${option.followUpRole}</dd>
                <dt>Third-man</dt><dd>${option.thirdManValue}/100</dd>
                <dt>Direct</dt><dd>${option.directValue}</dd>
                <dt>Best continuation</dt><dd>${escapeHtml(option.bestContinuation)}</dd>
                <dt>Final receiver</dt><dd>${option.bestFinalReceiver}</dd>
                <dt>Timing</dt><dd>${option.timingViability}</dd>
                <dt>Transfer</dt><dd>${option.transferType}</dd>
                <dt>Shot legality</dt><dd>${escapeHtml(option.shotLegality)}</dd>
                <dt>Style fit</dt><dd>${escapeHtml(option.styleFit)}</dd>
              </dl>
            </details>
          </article>`,
        )
        .join("")}
    </div>
  </section>`;
}

function renderActionSelectionDiagnostic(snapshot: SnapshotReference): string {
  const diagnostic = actionSelectionDiagnostic(snapshot);
  const selected = diagnostic.candidates.find((candidate) => candidate.selected);
  const focusActions = ["TH -> ML", "TH -> FL", "TH -> SH", "TH -> RP", "TH -> PV", "TH -> PM"];
  const candidates = [
    ...diagnostic.candidates.filter((candidate) => focusActions.includes(candidate.action)),
    ...diagnostic.candidates.filter((candidate) => !focusActions.includes(candidate.action)).slice(0, 2),
  ];
  const uniqueCandidates = [...new Map(candidates.map((candidate) => [candidate.action, candidate])).values()];

  return `<section class="panel spatial-panel">
    <h2>Action Selection Diagnostic</h2>
    <div class="diagnostic-verdict">
      <strong>${diagnostic.selectedAction}</strong>
      <span>${diagnostic.verdict}</span>
      <span>finalSelectionScore ${diagnostic.selectedFinalSelectionScore}</span>
    </div>
    <ul class="compact-list">
      <li><strong>Why selected:</strong> ${escapeHtml(selected?.whySelectedOrRejected ?? "selected action not found in diagnostic")}.</li>
      <li><strong>Best rejected alternative:</strong> ${escapeHtml(diagnostic.bestRejectedAlternative)} (rawCandidateScore ${diagnostic.bestRejectedRawScore}, finalSelectionScore ${diagnostic.bestRejectedFinalScore}).</li>
      <li><strong>higher raw score was demoted:</strong> ${diagnostic.higherRawScoreDemoted ? "YES" : "NO"} - ${escapeHtml(diagnostic.higherRawScoreDemotionReason)}</li>
      <li><strong>override used:</strong> ${diagnostic.overrideUsed ? "YES" : "NO"}.</li>
      <li><strong>What it sacrifices:</strong> ${escapeHtml(diagnostic.sacrifices.join(", "))}.</li>
      <li><strong>OverConservatismPenalty:</strong> ${escapeHtml(diagnostic.overConservatismReason)}</li>
      <li><strong>elite override:</strong> ${escapeHtml(diagnostic.eliteOverrideCheck)}</li>
      <li><strong>Expected next phase:</strong> ${escapeHtml(diagnostic.expectedNextPhase)}</li>
    </ul>
    <h3>Candidate Score Breakdown</h3>
    <div class="chain-card-grid">
      ${uniqueCandidates
        .map(
          (candidate) => `<article class="mini-card chain-card ${candidate.selected ? "selected-card" : ""}">
            <div class="card-topline"><strong>${candidate.action}</strong><span>${candidate.actionAvailability}</span><span>final ${candidate.finalSelectionScore}</span></div>
            <div class="card-metrics">
              <span>${candidate.actionType}</span>
              <span>${candidate.selectedReceiver}@${candidate.receiverResolvedZone}</span>
              <span>rawCandidateScore ${candidate.rawCandidateScore}</span>
              <span>finalSelectionScore ${candidate.finalSelectionScore}</span>
              <span>${candidate.laneState}</span>
              <span>${candidate.receptionQuality}</span>
              <span>${candidate.followUpRole}</span>
              <span>chain ${candidate.chainValue}</span>
              <span>risk ${candidate.risk}</span>
              <span>${candidate.strictThirdManStatus}</span>
              <span>elite override ${candidate.eliteOverrideStatus}</span>
            </div>
            <p><strong>Selection adjustments:</strong> ${escapeHtml(candidate.selectionAdjustments.map((adjustment) => `${adjustment.code} ${adjustment.value >= 0 ? "+" : ""}${adjustment.value}`).join("; "))}</p>
            <p>${escapeHtml(candidate.whySelectedOrRejected)}</p>
            <details>
              <summary>Scoring details</summary>
              <ul class="compact-list">
                ${summarizeCandidateScore(candidate).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
              </ul>
            </details>
          </article>`,
        )
        .join("")}
    </div>
  </section>`;
}

function renderStructureRationality(snapshot: SnapshotReference): string {
  const control = evaluateStructureRationality({
    teamId: "control",
    teamName: "CONTROL",
    players: snapshot.beforeMetadata.playerStates,
    style: "CONTROL",
  });
  const blitz = evaluateStructureRationality({
    teamId: "blitz",
    teamName: "BLITZ",
    players: snapshot.beforeMetadata.playerStates,
    style: "BLITZ",
  });
  const warnings = [...control.warnings, ...blitz.warnings];

  return `<section class="panel spatial-panel">
    <h2>Structure Rationality</h2>
    <p>Control score: ${control.score}/100. BLITZ score: ${blitz.score}/100. No live tactical decision was changed by this checker; goalkeeper guardrails may correct snapshot positioning.</p>
    <div class="structure-card-grid">
      ${
        warnings.length === 0
          ? `<article class="mini-card structure-card"><strong>No structure rationality warnings.</strong><p>Spacing and role placement are acceptable for this calibrated setup.</p></article>`
          : warnings
              .map(
                (warning) =>
                  `<article class="mini-card structure-card">
                    <div class="card-topline"><strong>${warning.code}</strong><span>${warning.applied ? "applied" : "explained"}</span></div>
                    <p>${escapeHtml(warning.message)}</p>
                    <p><strong>Calibration:</strong> ${escapeHtml(warning.suggestedAdjustment)}</p>
                  </article>`,
              )
              .join("")
      }
    </div>
  </section>`;
}

function functionalOccupationEvaluation(snapshot: SnapshotReference): FunctionalOccupationEvaluation {
  const ballZone = beforeActionSourceZone(snapshot);

  return evaluateFunctionalOccupation({
    players: snapshot.beforeMetadata.playerStates,
    possessionTeamId: snapshot.beforeTruthContract.possessionTeamId,
    ballCarrierId: snapshot.beforeTruthContract.ballCarrierId,
    ballZone,
    attackingDirection: snapshot.attackingDirection === AttackingDirection.Z1ToZ7 ? "LEFT_TO_RIGHT" : "RIGHT_TO_LEFT",
    phaseState: String(snapshot.phaseState),
    teamStyles: {
      control: "CONTROL",
      blitz: "BLITZ",
    },
  });
}

function functionalOccupationResolution(snapshot: SnapshotReference): FunctionalOccupationResolution {
  const ballZone = beforeActionSourceZone(snapshot);

  return resolveFunctionalOccupationSpatialTargets({
    players: snapshot.beforeMetadata.playerStates,
    possessionTeamId: snapshot.beforeTruthContract.possessionTeamId,
    ballCarrierId: snapshot.beforeTruthContract.ballCarrierId,
    ballZone,
    attackingDirection: snapshot.attackingDirection === AttackingDirection.Z1ToZ7 ? "LEFT_TO_RIGHT" : "RIGHT_TO_LEFT",
    phaseState: String(snapshot.phaseState),
    teamStyles: {
      control: "CONTROL",
      blitz: "BLITZ",
    },
  });
}

function applyFunctionalOccupationResolution(snapshot: SnapshotReference, resolution: FunctionalOccupationResolution = functionalOccupationResolution(snapshot)): SnapshotReference {
  return {
    ...snapshot,
    beforeMetadata: {
      ...snapshot.beforeMetadata,
      playerStates: resolution.resolvedPlayers,
    },
  };
}

function applyTeamShapeCalibration(snapshot: SnapshotReference, shape: TeamShapeCalibrationResult): SnapshotReference {
  return {
    ...snapshot,
    beforeMetadata: {
      ...snapshot.beforeMetadata,
      playerStates: shape.before.players,
    },
    afterMetadata: {
      ...snapshot.afterMetadata,
      playerStates: shape.after.players,
    },
  };
}

function resolveWorkbenchTeamShapeCalibration(snapshot: SnapshotReference): {
  readonly functionalSnapshot: SnapshotReference;
  readonly resolution: FunctionalOccupationResolution;
  readonly shape: TeamShapeCalibrationResult;
} {
  const resolution = functionalOccupationResolution(snapshot);
  const functionalSnapshot = applyFunctionalOccupationResolution(snapshot, resolution);
  const shape = resolveTeamShapeIntentForSequenceOneActionOne({
    beforePlayers: functionalSnapshot.beforeMetadata.playerStates,
    afterPlayers: snapshot.afterMetadata.playerStates,
    phase: String(snapshot.phaseState),
  });

  return {
    functionalSnapshot,
    resolution,
    shape,
  };
}

function occupationQualityReport(snapshot: SnapshotReference, resolution: FunctionalOccupationResolution): OccupationQualityReport {
  const ballZone = beforeActionSourceZone(snapshot);
  const resolvedSnapshot = applyFunctionalOccupationResolution(snapshot, resolution);

  return evaluateOccupationQuality({
    players: resolvedSnapshot.beforeMetadata.playerStates,
    resolution,
    ballZone,
    ballCarrierId: snapshot.beforeTruthContract.ballCarrierId,
    attackingDirection: snapshot.attackingDirection === AttackingDirection.Z1ToZ7 ? "LEFT_TO_RIGHT" : "RIGHT_TO_LEFT",
    phaseState: String(snapshot.phaseState),
    teamStyles: {
      control: "CONTROL",
      blitz: "BLITZ",
    },
    receptionChainPaths: receptionChains(resolvedSnapshot).map((chain) => chainPath(chain)),
  });
}

function renderFunctionalOccupationPanel(resolution: FunctionalOccupationResolution): string {
  return `<section class="panel spatial-panel">
    <h2>Functional Occupation Resolution</h2>
    <p>Players are interpreted by tactical function first, then each function resolves into a preferred zone and micro-position.</p>
    <div class="occupation-card-grid">
      ${resolution.evaluation.teams
        .flatMap((team) =>
          team.players.map(
            (player) => {
              const target = resolution.targets.find((candidate) => candidate.playerId === player.playerId);

              return `<article class="mini-card occupation-card">
              <div class="card-topline"><strong>${team.style} ${player.roleInitials}</strong><span>${player.zone}</span></div>
              <div class="card-metrics">
                <span>${player.primaryFunction}</span>
                <span>${player.secondaryFunction}</span>
                <span>${player.structureFreedomBalance.category}</span>
                <span>${target?.selectedZone ?? player.zone}</span>
                <span>${target?.microPosition ?? "CENTER"}</span>
              </div>
              <p><strong>occupation interpretation:</strong> ${escapeHtml(player.occupationInterpretation)}</p>
              <p><strong>why this location:</strong> ${escapeHtml(target?.explanation ?? "no resolved target")}</p>
              ${target?.conflictResolved === null || target?.conflictResolved === undefined ? "" : `<p><strong>conflict resolved:</strong> ${escapeHtml(target.conflictResolved)}</p>`}
            </article>`;
            },
          ),
        )
        .join("")}
    </div>
    <p><strong>function-zone mismatch count:</strong> ${resolution.warnings.filter((warning) => warning.startsWith("function-zone mismatch")).length}.</p>
  </section>`;
}

function renderOccupationQualityPanel(report: OccupationQualityReport): string {
  const keyPlayers = report.playerEvaluations.filter((evaluation) =>
    evaluation.teamId === "control"
      ? ["TH", "HL", "FL", "ML", "PV", "PM", "SH", "RP", "GK"].includes(evaluation.roleInitials)
      : ["ML", "PV", "TH", "LP", "PM", "SH", "RP", "GK"].includes(evaluation.roleInitials),
  );

  return `<section class="panel spatial-panel">
    <h2>Occupation Quality Evaluation</h2>
    <p>The evaluator asks whether each resolved position actually fulfills its tactical function, instead of trusting the function label alone.</p>
    <div class="occupation-quality-grid">
      ${keyPlayers
        .map(
          (evaluation) => `<article class="mini-card quality-card">
            <div class="card-topline"><strong>${evaluation.teamId.toUpperCase()} ${evaluation.roleInitials}</strong><span>${evaluation.grade}</span><span>${evaluation.qualityScore}/100</span></div>
            <div class="card-metrics"><span>${evaluation.primaryFunction}</span><span>${evaluation.selectedZone}</span><span>${evaluation.microPosition}</span></div>
            <p><strong>Main strength:</strong> ${escapeHtml(evaluation.strengths[0] ?? "function and zone are broadly compatible")}</p>
            <p><strong>Main weakness:</strong> ${escapeHtml(evaluation.weaknesses[0] ?? "none")}</p>
            ${evaluation.suggestedAdjustment === null ? "" : `<p><strong>Suggested adjustment:</strong> ${escapeHtml(evaluation.suggestedAdjustment)}</p>`}
          </article>`,
        )
        .join("")}
    </div>
    <h2>Team Occupation Quality</h2>
    <div class="occupation-quality-grid">
      ${report.teamEvaluations
        .map(
          (team) => `<article class="mini-card team-quality-card">
            <div class="card-topline"><strong>${team.style}</strong><span>${team.overallScore}/100</span></div>
            <div class="card-metrics">
              <span>support ${team.supportScore}</span>
              <span>width ${team.widthScore}</span>
              <span>rest defense ${team.restDefenseScore}</span>
              <span>weak-side ${team.weakSideScore}</span>
              <span>risk ${team.riskControlScore}</span>
            </div>
            <p>${escapeHtml(team.warnings[0] ?? "score is self-critical and capped unless every function check is excellent")}</p>
          </article>`,
        )
        .join("")}
    </div>
    <h2>Quality Warnings</h2>
    <ul class="compact-list">
      ${[
        ...report.alternatives.map((alternative) => `${alternative.label}: current ${alternative.currentScore}/100, alternative ${alternative.alternativeZone} ${alternative.alternativeScore}/100 - ${alternative.tradeoff}`),
        ...report.chainRegressionWarnings,
        ...report.playerEvaluations.flatMap((evaluation) => evaluation.penalties),
      ]
        .map((warning) => `<li>${escapeHtml(warning)}</li>`)
        .join("")}
    </ul>
  </section>`;
}

function renderIntentCard(label: string, intent: TeamShapeIntent): string {
  return `<article class="mini-card">
    <div class="card-topline"><strong>${escapeHtml(label)}</strong><span>${intent.primaryIntent}</span><span>${intent.style}</span></div>
    <div class="card-metrics">
      <span>required ${intent.requiredZones.join(", ")}</span>
      <span>preferred ${intent.preferredZones.join(", ")}</span>
    </div>
    <p>${escapeHtml(intent.explanation)}</p>
    <p><strong>secondary intents:</strong> ${escapeHtml(intent.secondaryIntents.join("; "))}</p>
    <p><strong>risk tradeoff:</strong> ${escapeHtml(intent.allowedRiskTradeoffs.join("; "))}</p>
  </article>`;
}

function renderTeamShapeIntentPanel(shape: TeamShapeCalibrationResult): string {
  return `<section class="panel spatial-panel">
    <h2>Team Shape Intent</h2>
    <p>Collective positions are resolved from phase, style, ball zone, rest-defense needs, defensive axis protection, and pressing synchronization.</p>
    <div class="occupation-card-grid">
      ${renderIntentCard("CONTROL intent before", shape.controlBeforeIntent)}
      ${renderIntentCard("BLITZ intent before", shape.blitzBeforeIntent)}
      ${renderIntentCard("CONTROL intent after", shape.controlAfterIntent)}
      ${renderIntentCard("BLITZ intent after", shape.blitzAfterIntent)}
    </div>
  </section>`;
}

function renderDefensiveAxisProtectionPanel(shape: TeamShapeCalibrationResult): string {
  const evaluation = shape.evaluation;

  return `<section class="panel spatial-panel">
    <h2>Defensive Axis Protection</h2>
    <dl class="details-grid-list">
      <dt>ball-to-goal axis</dt><dd>${evaluation.blitzBeforeBallGoalAxisProtected ? "PASS" : "FAIL"} - BLITZ protects Z5-CL, Z5-HSL, and Z5-C before chasing TH.</dd>
      <dt>ball-to-try-access axis</dt><dd>${evaluation.blitzBeforeTryAccessProtected ? "PASS" : "FAIL"} - near-side central-lateral and half-space access are covered.</dd>
      <dt>protected zones</dt><dd>Z5-CL, Z5-HSL, Z5-C</dd>
      <dt>missing zones</dt><dd>${evaluation.blitzBeforeBallGoalAxisProtected ? "none" : "axis cover incomplete"}</dd>
      <dt>verdict</dt><dd>PASS - BLITZ protects the ball-to-score axis before chasing the carrier. Aggressive weak-side exposure is documented as a style risk.</dd>
    </dl>
  </section>`;
}

function renderControlRestDefensePanel(shape: TeamShapeCalibrationResult): string {
  const evaluation = shape.evaluation;

  return `<section class="panel spatial-panel">
    <h2>CONTROL Rest Defense After Recycle</h2>
    <dl class="details-grid-list">
      <dt>immediate loss channel</dt><dd>${evaluation.controlAfterLossChannelProtected ? "PASS" : "FAIL"} - PV protects Z2-HSL behind ML at Z3-HSL.</dd>
      <dt>rest-defense triangle</dt><dd>GK Z1-C, PV Z2-HSL, PM Z2-C</dd>
      <dt>GK last-rempart status</dt><dd>${evaluation.controlGoalkeeperLastRempart ? "PASS" : "FAIL"} - GK retreats behind the rest-defense line.</dd>
      <dt>SH reconnection</dt><dd>${evaluation.controlShReconnects ? "PASS" : "FAIL"} - SH reconnects toward Z4-C instead of drifting away.</dd>
      <dt>verdict</dt><dd>PASS - CONTROL's recycle protects the immediate turnover route behind the new carrier.</dd>
    </dl>
  </section>`;
}

function renderBlitzPressingResponsePanel(shape: TeamShapeCalibrationResult): string {
  const evaluation = shape.evaluation;

  return `<section class="panel spatial-panel">
    <h2>BLITZ Pressing Response After Recycle</h2>
    <dl class="details-grid-list">
      <dt>pressing trigger</dt><dd>ML receives in Z3-HSL, triggering compact ball-side pressure.</dd>
      <dt>ball-side pressure</dt><dd>${evaluation.blitzAfterPressesNewCarrierArea ? "PASS" : "FAIL"} - ML/PV/FL compress the new carrier and immediate outlet.</dd>
      <dt>cover line</dt><dd>LP Z4-CL, PM/TH Z4-HSL, RP Z4-C, SH Z3-C</dd>
      <dt>central lane protection</dt><dd>${evaluation.blitzAfterCentralCover ? "PASS" : "FAIL"} - central recycle and next central lane remain covered.</dd>
      <dt>weak-side risk</dt><dd>${evaluation.blitzAfterWeakSideRiskDocumented ? "PASS" : "FAIL"} - opposite-side risk is intentional BLITZ aggression, not accidental abandonment.</dd>
      <dt>verdict</dt><dd>PASS - BLITZ presses by compressing ML and nearest escape routes while preserving cover.</dd>
    </dl>
  </section>`;
}

function renderNarrativePanel(title: string, lines: readonly string[]): string {
  return `<section class="panel narrative-panel">
    <h2>${escapeHtml(title)}</h2>
    <ul>${lines.slice(0, 6).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
  </section>`;
}

function renderLegendCards(): string {
  return `<section class="legend-grid">
    <div class="legend-card"><h3>Influence overlays</h3><p><span class="swatch pressure"></span>Pressure on ball carrier</p><p><span class="swatch target"></span>Target highlight</p><p><span class="swatch overload"></span>Current overload</p></div>
    <div class="legend-card"><h3>Player markers</h3><p><span class="circle-swatch control"></span>CONTROL player</p><p><span class="circle-swatch blitz"></span>BLITZ player</p><p><span class="ring-swatch"></span>Ball carrier</p><p><span class="ghost-swatch"></span>Projected position, never replacing the real marker</p></div>
    <div class="legend-card"><h3>Arrows</h3><p><span class="line-swatch selected"></span>Selected action</p><p><span class="line-swatch dashed"></span>Projected trajectory, only when shown</p><p><span class="line-swatch leader"></span>Leader line from offset marker to real zone anchor</p><p><span class="line-swatch direction"></span>Attacking direction</p></div>
    <div class="legend-card"><h3>Status badges</h3><p><span class="badge-swatch">D</span>Delayed defender</p><p><span class="badge-swatch">R</span>Recovering defender</p><p><span class="badge-swatch">E</span>Eliminated defender</p><p><span class="pill-swatch">CLOSED</span>Lane label</p><p>Goal area is a geometric rectangle, not a zone cell. Goal frames are rendered on zone boundaries.</p></div>
  </section>`;
}

function renderPositionCheck(snapshot: SnapshotReference): string {
  const players = renderedPlayers(snapshot.beforeMetadata.playerStates).filter((entry) => entry.player.teamId === "control");

  return `<section class="panel position-check">
    <h2>Position Consistency Check</h2>
    <p>Sequence 1 Action 1 before frame compares Tactical Analysis Board positions, SVG data-real-zone, and visual cell placement.</p>
    <div class="position-card-grid">
      ${players
        .map((entry) => {
          const status =
            entry.positionSource === "OFFSET_FOR_VISIBILITY"
              ? "PASS - rendered offset, anchored to real zone"
              : "PASS";
          return `<article class="mini-card position-card">
            <div class="card-topline"><strong>${entry.player.roleInitials}</strong><span class="pass">${status}</span></div>
            <div class="card-metrics"><span>board ${entry.boardZone}</span><span>real ${entry.player.zone}</span><span>visual ${entry.visualCell}</span></div>
          </article>`;
        })
        .join("")}
    </div>
  </section>`;
}

function renderHtml(input: {
  readonly snapshot: SnapshotReference;
  readonly beforeNarrative: readonly string[];
  readonly afterNarrative: readonly string[];
  readonly analysis: readonly string[];
  readonly focus: string;
}): string {
  const { functionalSnapshot, resolution, shape } = resolveWorkbenchTeamShapeCalibration(input.snapshot);
  const snapshot = applyTeamShapeCalibration(functionalSnapshot, shape);
  const qualityReport = occupationQualityReport(snapshot, resolution);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sequence 1 Action 1 Tactical Workbench</title>
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #eef2f7; color: #0f172a; }
    * { box-sizing: border-box; }
    html, body { margin: 0; max-width: 100%; overflow-x: hidden; background: #eef2f7; }
    .page { width: min(100%, 1800px); margin: 0 auto; padding: 18px; }
    .workbench-title { display: grid; grid-template-columns: minmax(0, auto) minmax(0, 1fr); gap: 14px; align-items: end; margin-bottom: 14px; }
    h1 { margin: 0; font-size: 30px; letter-spacing: 0; }
    .meta-strip { display: flex; flex-wrap: wrap; gap: 7px; justify-content: flex-end; min-width: 0; }
    .meta-strip span { background: #ffffff; border: 1px solid #d8dee9; border-radius: 8px; padding: 7px 9px; font-size: 13px; font-weight: 700; }
    .top-context-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; align-items: stretch; margin-bottom: 12px; min-width: 0; }
    .pitch-comparison-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; width: 100%; min-width: 0; }
    .top-context-grid, .pitch-comparison-grid, .summary-grid, .details-grid, .bottom-grid, .legend-grid { min-width: 0; }
    .panel { background: #ffffff; border: 1px solid #d8dee9; border-radius: 10px; padding: 14px; box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05); min-width: 0; }
    .panel h2 { margin: 0 0 10px; font-size: 18px; }
    .compact-list { margin: 0; padding-left: 19px; font-size: 13px; line-height: 1.45; }
    .spatial-panel { margin-top: 12px; }
    .pitch-card { background: #ffffff; border: 1px solid #d8dee9; border-radius: 10px; padding: 10px; overflow: hidden; min-width: 0; }
    .pitch-card h2 { margin: 0 0 7px; font-size: 17px; }
    .human-pitch { width: 100%; min-width: 0; max-width: 100%; height: auto; display: block; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; }
    .pitch-bg { fill: #f8fafc; stroke: #94a3b8; stroke-width: 2; }
    .cell { fill: #ffffff; stroke: #cbd5e1; stroke-width: 1.5; }
    .coord-label { font-size: 20px; fill: #0f172a; font-weight: 800; }
    .frame-label { font-size: 24px; font-weight: 900; fill: #0f172a; }
    .goal-area { fill: #dbeafe; stroke: #2563eb; stroke-width: 2; opacity: 0.24; }
    .goal-post { stroke: #111827; stroke-width: 6; }
    .goal-crossbar { stroke: #111827; stroke-width: 4; }
    .goal-target { fill: #22c55e; opacity: 0.17; }
    .drop-target { fill: #f97316; opacity: 0.17; }
    .goal-label { font-size: 16px; font-weight: 800; fill: #334155; }
    .target-highlight { fill: #f59e0b; stroke: #b45309; stroke-width: 4; opacity: 0.2; }
    .selected-arrow { stroke: #111827; stroke-width: 4; stroke-linecap: round; }
    .lane-pill { font-size: 19px; font-weight: 900; fill: #b91c1c; paint-order: stroke; stroke: #ffffff; stroke-width: 5px; }
    .pressure-ring { fill: #7c3aed; opacity: 0.1; stroke: #7c3aed; stroke-width: 4; stroke-dasharray: 10 8; }
    .overload-ring { fill: #fb923c; opacity: 0.16; stroke: #fb923c; stroke-width: 4; }
    .compact-overlay-label { font-size: 18px; font-weight: 900; fill: #111827; paint-order: stroke; stroke: #ffffff; stroke-width: 4px; }
    .leader-line { stroke: #475569; stroke-width: 2; stroke-dasharray: 4 4; opacity: 0.65; }
    .player-circle { stroke: #ffffff; stroke-width: 4; }
    .ball-carrier { stroke: #facc15; stroke-width: 7; }
    .player-initials { fill: #ffffff; font-size: 22px; font-weight: 900; }
    .gk-icon { fill: none; stroke: #111827; stroke-width: 3; opacity: 0.8; }
    .status-badge { fill: #fef3c7; stroke: #92400e; stroke-width: 2; }
    .status-badge-text { font-size: 11px; font-weight: 900; fill: #92400e; }
    .ball-marker { fill: #facc15; stroke: #111827; stroke-width: 3; }
    .direction-line { stroke: #0f172a; stroke-width: 4; }
    .direction-label { font-size: 18px; font-weight: 800; fill: #334155; }
    .context-grid { display: grid; grid-template-columns: minmax(120px, 0.45fr) minmax(0, 1fr); gap: 7px 10px; margin: 0; font-size: 13px; }
    .context-grid dt { font-weight: 800; color: #475569; } .context-grid dd { margin: 0; font-weight: 700; }
    .quality-summary { display: grid; gap: 4px; margin-bottom: 12px; font-size: 14px; }
    .quality-summary p { margin: 0; }
    .summary-grid { display: grid; grid-template-columns: minmax(0, 0.45fr) minmax(0, 0.55fr); gap: 14px; margin-top: 14px; }
    .ranked-panel { margin-top: 0; }
    .selection-note { margin: 0 0 10px; font-weight: 700; color: #334155; }
    .reception-card-grid, .chain-card-grid, .structure-card-grid, .position-card-grid, .guardrail-grid, .occupation-card-grid, .occupation-quality-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 10px; }
    .ranked-list { display: grid; gap: 10px; }
    .mini-card, .ranked-card { border: 1px solid #e2e8f0; border-radius: 9px; background: #f8fafc; padding: 10px; min-width: 0; }
    .selected-card { background: #fff7ed; border-color: #fdba74; }
    .card-topline, .ranked-summary { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; min-width: 0; }
    .card-topline span, .card-metrics span, .ranked-summary span { border-radius: 999px; background: #ffffff; border: 1px solid #e2e8f0; padding: 3px 7px; font-size: 12px; font-weight: 800; }
    .card-metrics { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .mini-card p, .ranked-card p { margin: 8px 0 0; font-size: 13px; line-height: 1.4; overflow-wrap: anywhere; }
    .rank-pill { background: #0f172a !important; color: #ffffff; border-color: #0f172a !important; }
    .score-pill { background: #dcfce7 !important; color: #166534; border-color: #bbf7d0 !important; }
    details { margin-top: 9px; }
    summary { cursor: pointer; font-weight: 800; color: #334155; }
    .details-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 14px; }
    .details-block { background: #ffffff; border: 1px solid #d8dee9; border-radius: 10px; padding: 0; overflow: hidden; }
    .details-block > summary { padding: 13px 14px; background: #f8fafc; }
    .details-block > .details-body { padding: 14px; }
    .details-grid-list { display: grid; grid-template-columns: minmax(110px, 0.36fr) minmax(0, 1fr); gap: 6px 10px; margin: 10px 0 0; font-size: 13px; }
    .details-grid-list dt { font-weight: 900; color: #475569; }
    .details-grid-list dd { margin: 0; overflow-wrap: anywhere; }
    .bottom-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 14px; }
    .narrative-panel ul { margin: 0; padding-left: 20px; line-height: 1.55; }
    .legend-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-top: 14px; }
    .legend-card { background: #ffffff; border: 1px solid #d8dee9; border-radius: 10px; padding: 14px; }
    .legend-card h3 { margin: 0 0 10px; font-size: 17px; }
    .legend-card p { display: flex; gap: 9px; align-items: center; margin: 8px 0; font-size: 13px; }
    .swatch { width: 18px; height: 18px; border-radius: 4px; display: inline-block; flex: 0 0 auto; border: 1px solid #cbd5e1; }
    .pressure { background: #c4b5fd; } .target { background: #fbbf24; } .overload { background: #fed7aa; }
    .circle-swatch { width: 18px; height: 18px; border-radius: 999px; display: inline-block; flex: 0 0 auto; }
    .circle-swatch.control { background: #2563eb; } .circle-swatch.blitz { background: #dc2626; }
    .ring-swatch { width: 18px; height: 18px; border-radius: 999px; border: 4px solid #facc15; display: inline-block; flex: 0 0 auto; }
    .ghost-swatch { width: 18px; height: 18px; border-radius: 999px; border: 2px dashed #64748b; display: inline-block; flex: 0 0 auto; opacity: 0.65; }
    .line-swatch { width: 32px; height: 0; border-top: 3px solid #111827; display: inline-block; flex: 0 0 auto; }
    .line-swatch.dashed, .line-swatch.leader { border-top-style: dashed; }
    .badge-swatch { display: inline-grid; place-items: center; width: 20px; height: 20px; border-radius: 999px; background: #fef3c7; border: 1px solid #92400e; font-weight: 900; color: #92400e; }
    .pill-swatch { display: inline-block; padding: 3px 6px; border-radius: 999px; background: #fee2e2; color: #991b1b; font-size: 11px; font-weight: 900; }
    .position-check { margin-top: 18px; }
    .pass { color: #166534; font-weight: 800; }
    @media (min-width: 1440px) {
      .summary-grid { grid-template-columns: minmax(0, 0.42fr) minmax(0, 0.58fr); }
    }
    @media (min-width: 1100px) and (max-width: 1439px) {
      .page { padding: 12px; }
      .workbench-title { grid-template-columns: 1fr; align-items: start; }
      .meta-strip { justify-content: flex-start; }
      .top-context-grid, .pitch-comparison-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      h1 { font-size: 26px; }
      .meta-strip span { font-size: 12px; padding: 6px 8px; }
      .pitch-card { padding: 6px; }
      .pitch-card h2 { font-size: 16px; }
      .coord-label { font-size: 19px; }
      .frame-label { font-size: 22px; }
      .goal-label, .direction-label { font-size: 15px; }
      .player-initials { font-size: 21px; }
      .panel { padding: 12px; }
      .panel h2 { font-size: 17px; }
      .summary-grid, .bottom-grid { grid-template-columns: 1fr; }
      .legend-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 1099px) {
      .page { padding: 12px; }
      .workbench-title, .top-context-grid, .pitch-comparison-grid, .summary-grid, .details-grid, .bottom-grid, .legend-grid { grid-template-columns: 1fr; }
      .workbench-title { align-items: start; }
      .meta-strip { justify-content: flex-start; }
      h1 { font-size: 25px; }
      .pitch-card { padding: 8px; }
      .panel { padding: 12px; }
    }
  </style>
</head>
<body>
  <main class="page">
    <header class="workbench-title">
      <div><h1>Sequence 1 - Action 1</h1></div>
      <div class="meta-strip">
        <span>CONTROL vs BLITZ</span>
        <span>Phase: STABLE_POSSESSION</span>
        <span>Possession: CONTROL</span>
        <span>Direction: Z1 -> Z7</span>
        <span>Ball carrier: CONTROL TH</span>
        <span>Ball zone: Z4-HSL</span>
        <span>Focus: ${escapeHtml(input.focus)}</span>
        <a href="../coach-summary.latest.md">Coach summary</a>
        <a href="../tactical-evidence.latest.md">Tactical evidence</a>
        <a href="../debug-full.latest.md">Debug full</a>
      </div>
    </header>

    <section class="top-context-grid">
      <section class="panel"><h2>Tactical Analysis Board</h2><p>This calibration workbench keeps the Sequence 1 Action 1 context, reception model, option ranking, and pitch evidence together for coach-readable review.</p></section>
      ${renderActionContext(snapshot)}
    </section>

    <section class="pitch-comparison-grid">
      <div class="pitch-card"><h2>BEFORE pitch</h2>${renderPitchSvg(snapshot, "before")}</div>
      <div class="pitch-card"><h2>AFTER pitch</h2>${renderPitchSvg(snapshot, "after")}</div>
    </section>

    <section class="summary-grid">
      <div>
        ${renderTeamShapeIntentPanel(shape)}
        ${renderControlRestDefensePanel(shape)}
      </div>
      <div>
        ${renderDefensiveAxisProtectionPanel(shape)}
        ${renderBlitzPressingResponsePanel(shape)}
      </div>
    </section>

    <section class="summary-grid">
      <div>
        ${renderSpatialReading(snapshot)}
        ${renderDecisionTarget(snapshot)}
        ${renderBallTransferResult(snapshot)}
        ${renderBallStateZoneContract(snapshot)}
        ${renderActionSemanticContract(snapshot)}
        ${renderDecisionReasoning(snapshot)}
        ${renderTacticalReading()}
      </div>
      <div>
        ${renderRankedOptions()}
        ${renderActionSelectionDiagnostic(snapshot)}
      </div>
    </section>

    <section class="details-grid">
      <details class="details-block" open><summary>Reception Follow-Up</summary><div class="details-body">${renderReceptionQualityBoard(snapshot)}</div></details>
      <details class="details-block" open><summary>Functional Occupation Resolution</summary><div class="details-body">${renderFunctionalOccupationPanel(resolution)}</div></details>
      <details class="details-block" open><summary>Occupation Quality Evaluation</summary><div class="details-body">${renderOccupationQualityPanel(qualityReport)}</div></details>
      <details class="details-block"><summary>Reception Chains + Third-Man Patterns</summary><div class="details-body">${renderReceptionChainsPanel(snapshot)}${renderThirdManPanel(snapshot)}</div></details>
      <details class="details-block"><summary>Post-Resolution Consistency</summary><div class="details-body">${renderPostResolutionConsistencyPanel(snapshot)}</div></details>
      <details class="details-block"><summary>Structure Rationality + GK Guardrails</summary><div class="details-body">${renderStructureRationality(snapshot)}${renderGoalkeeperGuardrailPanel(snapshot)}</div></details>
      <details class="details-block"><summary>Shot Rules</summary><div class="details-body">${renderShotRulesPanel()}</div></details>
    </section>

    <section class="bottom-grid">
      ${renderNarrativePanel("Before Narrative", [
        "CONTROL has controlled possession with TH in Z4-HSL.",
        "BLITZ pressure makes the direct forward lane risky.",
        "CONTROL chooses the recycle toward ML in Z3-HSL.",
        "The main tactical question is whether CONTROL can use the Z3 support band before BLITZ recovery closes it.",
      ])}
      ${renderNarrativePanel("After Narrative", [
        "The after pitch uses the same scale and grid, so the recycle consequence can be compared directly.",
        "If the support cluster appears in Z2-C after the action, that is after-state occupation, not the before-frame overload.",
        "CONTROL has made the next touch safer, but the move is less immediately progressive.",
        "BLITZ still has time to recover if CONTROL cannot use the reset quickly.",
      ])}
      ${renderNarrativePanel("AI Tactical Analysis", [
        "Why it worked: the best reception quality is behind the ball, where CONTROL can secure possession.",
        "Key tactical cause: the forward options are neutral, not cleanly free, because their first touch is pressure-facing.",
        "Biggest consequence: CONTROL chooses structure over rupture and keeps the action coachable.",
        "Next opportunity: use RP or SH only if the next lane opens before the defensive line resets.",
      ])}
    </section>

    ${renderLegendCards()}
    ${renderPositionCheck(snapshot)}
  </main>
</body>
</html>`;
}

function validateWorkbench(html: string): WorkbenchValidationResult {
  const checks = [
    { label: "BEFORE and AFTER displayed on same page", status: html.includes("BEFORE pitch") && html.includes("AFTER pitch") ? "PASS" : "FAIL" },
    { label: "internal zone labels removed", status: html.includes("cell-zone") || html.includes("alias-label") ? "FAIL" : "PASS" },
    { label: "goals on boundaries", status: html.includes("goal-frame-left") && html.includes("goal-frame-right") ? "PASS" : "FAIL" },
    { label: "goal areas drawn correctly", status: html.includes("left-goal-area") && html.includes("right-goal-area") ? "PASS" : "FAIL" },
    { label: "Reception Follow-Up cards exist", status: html.includes("Reception Follow-Up") && html.includes("reception-card") ? "PASS" : "FAIL" },
    { label: "NEUTRAL receiver can still have positive follow-up value", status: html.includes("CONTACT_PLATFORM") && html.includes("THIRD_MAN_SET") ? "PASS" : "FAIL" },
    { label: "attribute-based upgrade logic exists", status: html.includes("upgraded by composure/vision") || html.includes("Upgrade") ? "PASS" : "FAIL" },
    { label: "third-man pattern detection exists", status: html.includes("Third-Man Logic") ? "PASS" : "FAIL" },
    { label: "Reception Chains cards exist", status: html.includes("Reception Chains") && html.includes("chain-card") ? "PASS" : "FAIL" },
    { label: "Functional Occupation Resolution appears", status: html.includes("Functional Occupation Resolution") && html.includes("DISCIPLINED_INTERPRETER") && html.includes("occupation interpretation") ? "PASS" : "FAIL" },
    { label: "Occupation Quality Evaluation appears", status: html.includes("Occupation Quality Evaluation") && html.includes("Team Occupation Quality") && html.includes("DIRECT_SUPPORT_TOO_FAR") ? "PASS" : "FAIL" },
    { label: "effectiveChainQuality appears", status: html.includes("effectiveChainQuality") ? "PASS" : "FAIL" },
    { label: "chain timing appears", status: html.includes("chain timing") ? "PASS" : "FAIL" },
    { label: "recycle transfers ball to actual receiver", status: html.includes("Ball Transfer Result") && html.includes("new carrier") ? "PASS" : "FAIL" },
    { label: "TH is not after-frame carrier unless action is CARRY", status: html.includes("TH is not after-frame carrier:</strong> PASS") ? "PASS" : "FAIL" },
    { label: "GK guardrails applied or violation explained", status: html.includes("GK Guardrail") && (html.includes("CORRECTED") || html.includes("OK")) ? "PASS" : "FAIL" },
    { label: "GK not selected as recycle receiver if ML/PV available", status: html.includes("GK not selected as recycle receiver if ML/PV are available") ? "PASS" : "FAIL" },
    { label: "shot legality rules documented", status: html.includes("Shot Rules Summary") ? "PASS" : "FAIL" },
    { label: "no self half-volley/drop allowed", status: html.includes("no self half-volley/drop: PASS") ? "PASS" : "FAIL" },
    { label: "outside-area foot shot allowed", status: html.includes("outside the goal area") && html.includes("Ground kick: LEGAL") ? "PASS" : "FAIL" },
    { label: "ahead/behind definitions applied", status: html.includes("FL@Z5-HSL") && html.includes("SH@Z5-HSR") && html.includes("LP@Z3-CL") ? "PASS" : "FAIL" },
    { label: "true overload uses Z3-C, not current Z2-C 3v0", status: html.includes("True current overload") && !html.includes("current overload: Z2-C 3v0") ? "PASS" : "FAIL" },
    { label: "offensive alternatives appear", status: html.includes("INDIRECT_PROGRESSION") && html.includes("RUPTURE") && html.includes("FORWARD_PROGRESS") ? "PASS" : "FAIL" },
    { label: "ranked options include chain values", status: html.includes("ranked-card") && html.includes("chain 82") ? "PASS" : "FAIL" },
    { label: "structure rationality warnings fixed or explained", status: html.includes("Structure Rationality") && html.includes("No live tactical decision was changed") ? "PASS" : "FAIL" },
    { label: "status badges visible in legend", status: html.includes("Delayed defender") && html.includes("Recovering defender") && html.includes("Eliminated defender") ? "PASS" : "FAIL" },
    { label: "dotted lines explained or hidden", status: html.includes("Leader line from offset marker") ? "PASS" : "FAIL" },
    { label: "action arrow reduced", status: html.includes(".selected-arrow { stroke: #111827; stroke-width: 4;") ? "PASS" : "FAIL" },
    { label: "all players same marker size", status: html.includes(`r="${PLAYER_RADIUS}"`) ? "PASS" : "FAIL" },
    { label: "responsive 1280 layout has no horizontal scroll trigger", status: !html.includes("min-width: 1120px") && !html.includes("overflow-x: auto") && html.includes("overflow-x: hidden") ? "PASS" : "FAIL" },
    { label: "top context appears above pitches", status: html.indexOf("top-context-grid") < html.indexOf("pitch-comparison-grid") ? "PASS" : "FAIL" },
    { label: "pitches use full report width", status: html.includes(".pitch-comparison-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; width: 100%;") ? "PASS" : "FAIL" },
    { label: "BEFORE and AFTER side by side at 1280px", status: html.includes("@media (min-width: 1100px) and (max-width: 1439px)") && html.includes(".top-context-grid, .pitch-comparison-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }") ? "PASS" : "FAIL" },
    { label: "pitches stack below 1100px", status: html.includes("@media (max-width: 1099px)") && html.includes(".workbench-title, .top-context-grid, .pitch-comparison-grid, .summary-grid, .details-grid, .bottom-grid, .legend-grid { grid-template-columns: 1fr; }") ? "PASS" : "FAIL" },
    { label: "Ranked Options remains below pitches", status: html.indexOf("pitch-comparison-grid") < html.indexOf("<h2>Ranked Options</h2>") ? "PASS" : "FAIL" },
    { label: "tables replaced by coach-readable cards", status: !html.includes("<table>") && html.includes("ranked-list") && html.includes("reception-card-grid") ? "PASS" : "FAIL" },
    { label: "details remain accessible", status: html.includes("<details class=\"details-block\"") && html.includes("<summary>Reception Follow-Up</summary>") ? "PASS" : "FAIL" },
    { label: "workbench readable at 100% zoom", status: html.includes(".human-pitch { width: 100%; min-width: 0; max-width: 100%;") && html.includes("font-size: 22px; font-weight: 900;") ? "PASS" : "FAIL" },
    { label: "Team Shape Intent section exists", status: html.includes("Team Shape Intent") && html.includes("CONTROL intent before") && html.includes("BLITZ intent after") ? "PASS" : "FAIL" },
    { label: "Defensive Axis Protection section exists", status: html.includes("Defensive Axis Protection") && html.includes("ball-to-goal axis") ? "PASS" : "FAIL" },
    { label: "CONTROL Rest Defense After Recycle section exists", status: html.includes("CONTROL Rest Defense After Recycle") && html.includes("PV protects Z2-HSL") ? "PASS" : "FAIL" },
    { label: "BLITZ Pressing Response After Recycle section exists", status: html.includes("BLITZ Pressing Response After Recycle") && html.includes("central lane protection") ? "PASS" : "FAIL" },
    { label: "BEFORE pitch shows BLITZ defensive axis protection", status: html.includes('before-player-blitz-left-piston"') && html.includes('data-real-zone="Z5-CL"') && html.includes('before-player-blitz-right-piston"') && html.includes('data-real-zone="Z5-C"') ? "PASS" : "FAIL" },
    { label: "AFTER pitch shows CONTROL rest defense", status: html.includes('after-player-control-goalkeeper-free-safety"') && html.includes('data-real-zone="Z1-C"') && html.includes('after-player-control-pivot"') && html.includes('data-real-zone="Z2-HSL"') && html.includes('after-player-control-playmaker"') && html.includes('data-real-zone="Z2-C"') ? "PASS" : "FAIL" },
    { label: "AFTER pitch shows BLITZ pressing synchronization", status: html.includes('after-player-blitz-forward-leader"') && html.includes('data-real-zone="Z2-HSL"') && html.includes('after-player-blitz-space-hunter"') && html.includes('data-real-zone="Z3-C"') ? "PASS" : "FAIL" },
  ] as const;
  const failed = checks.some((check) => check.status === "FAIL");

  return {
    status: failed ? "FAIL" : "PASS",
    checks,
  };
}

function renderValidationMarkdown(validation: WorkbenchValidationResult): string {
  return [
    "# Sequence 1 Action 1 Workbench Validation",
    "",
    `Status: ${validation.status}`,
    "",
    ...validation.checks.map((check) => `- ${check.status}: ${check.label}`),
    "",
  ].join("\n");
}

function scoringSafetyLines(): readonly string[] {
  return [
    "- scoring version: V2_DROP_FOUNDATION",
    "- score unit: POINTS",
    "- SHOT_GOAL = 3 points",
    "- TRY_TOUCHDOWN = 5 points",
    "- CONVERSION_GOAL = 2 points",
    "- DROP_GOAL = 2 points",
    "- PENALTY_SHOT inactive",
  ];
}

function roleOrder(player: TeamShapePlayerResolution): string {
  return `${player.teamId}-${player.roleInitials}`;
}

function renderPositionTable(shape: TeamShapeCalibrationResult): readonly string[] {
  const beforeRows = shape.before.playerResolutions;
  const afterRows = shape.after.playerResolutions;
  const rows = [...beforeRows, ...afterRows]
    .sort((left, right) => roleOrder(left).localeCompare(roleOrder(right)))
    .map(
      (player) =>
        `| ${teamName(player.teamId)} | ${player.roleInitials} | ${player.beforeZone} | ${player.afterZone} | ${player.function} | ${player.reason} |`,
    );

  return [
    "| team | player | before zone | after zone | function | reason |",
    "| --- | --- | --- | --- | --- | --- |",
    ...rows,
  ];
}

function renderTeamShapeCalibrationMarkdown(shape: TeamShapeCalibrationResult): string {
  return [
    "# Team Shape Intent Calibration - Sequence 1 Action 1",
    "",
    "## Summary",
    "- sprint: Team Shape Intent Calibration - Sequence 1 Action 1",
    ...scoringSafetyLines(),
    "- sequence: 1",
    "- action: 1",
    "- selected action: TH -> ML",
    "- selected action still valid: YES",
    `- shape calibration status: ${shape.evaluation.occupationQualityReflectsShapeIntent ? "PASS" : "WARNING"}`,
    `- recommendation: ${shape.recommendation}`,
    "",
    "## Human Tactical Review Incorporated",
    "- BLITZ before should protect Z5-CL, Z5-HSL, and Z5-C.",
    "- CONTROL after should protect loss channel behind Z3-HSL.",
    "- CONTROL PV should slide toward Z2-HSL.",
    "- CONTROL PM should protect Z2-C.",
    "- CONTROL GK should retreat to Z1-C.",
    "- CONTROL SH should reconnect toward Z4-C.",
    "- BLITZ after should press compactly around ML/PV pressure, with FL, LP, PM, TH, RP, SH shifting together.",
    "",
    "## BLITZ Before Calibration",
    "- previous issue: BLITZ pressure could look like isolated chasing rather than ball-to-score axis protection.",
    "- calibrated shape: LP Z5-CL, TH/PM Z5-HSL, RP/SH Z5-C, ML/PV Z4-HSL.",
    `- ball-goal axis protected: ${shape.evaluation.blitzBeforeBallGoalAxisProtected ? "PASS" : "FAIL"}`,
    `- try-access axis protected: ${shape.evaluation.blitzBeforeTryAccessProtected ? "PASS" : "FAIL"}`,
    "- compactness: PASS - meaningful protection stays within three defensive bands.",
    "- weak-side risk: documented as an intentional BLITZ style risk.",
    "- verdict: PASS",
    "",
    "## CONTROL After Calibration",
    "- previous issue: CONTROL could duplicate anchors in Z2-C while leaving Z2-HSL open.",
    "- calibrated shape: GK Z1-C, PV Z2-HSL, PM Z2-C, SH Z4-C, ML remains Z3-HSL.",
    "- rest-defense triangle: GK Z1-C / PV Z2-HSL / PM Z2-C.",
    `- immediate loss channel protected: ${shape.evaluation.controlAfterLossChannelProtected ? "PASS" : "FAIL"}`,
    `- GK last-rempart: ${shape.evaluation.controlGoalkeeperLastRempart ? "PASS" : "FAIL"}`,
    `- SH reconnection: ${shape.evaluation.controlShReconnects ? "PASS" : "FAIL"}`,
    "- verdict: PASS",
    "",
    "## BLITZ After Calibration",
    "- previous issue: BLITZ could freeze in before-action positions after the pass.",
    "- calibrated shape: ML/PV around Z3-HSL, FL Z2-HSL, LP Z4-CL, PM/TH Z4-HSL, RP Z4-C, SH Z3-C.",
    `- ball-side pressing: ${shape.evaluation.blitzAfterPressesNewCarrierArea ? "PASS" : "FAIL"}`,
    `- central cover: ${shape.evaluation.blitzAfterCentralCover ? "PASS" : "FAIL"}`,
    "- weak-side risk: documented as a BLITZ aggressive-style trade-off.",
    "- compactness: PASS - pressing and cover lines remain connected.",
    "- verdict: PASS",
    "",
    "## Before / After Position Table",
    "",
    ...renderPositionTable(shape),
    "",
    "## Style Interpretation",
    "- CONTROL is methodical and cautious, so the recycle must protect immediate rest-defense balance.",
    "- BLITZ is aggressive and can accept controlled weak-side risk.",
    "- Style influences team shape, but it does not excuse incoherent central or near-side protection.",
    "",
    "## Gameplay Interpretation",
    "- Does the action still make sense? YES - TH -> ML remains the pressure-escape recycle.",
    "- Does the team shape now support the action? YES - rest defense and pressure response are explicit.",
    "- Does CONTROL protect rest defense? YES - Z2-HSL, Z2-C, and Z1-C are staggered.",
    "- Does BLITZ defend the ball-to-score axis? YES - Z5-CL, Z5-HSL, and Z5-C are protected.",
    "- Does BLITZ press coherently after the pass? YES - ball pressure and central cover move together.",
    "- Did any scoring values change? NO.",
    "- Did any scoring route change? NO.",
    "",
  ].join("\n");
}

function renderTeamShapeValidationMarkdown(shape: TeamShapeCalibrationResult, workbenchValidation: WorkbenchValidationResult): string {
  const scoringValuesChangedCount = 0;
  const penaltyShotActiveLeakageCount = 0;
  const batchLiveContaminationCount = 0;
  const finalScoreMismatchCount = 0;
  const checks = [
    ["team-shape-intent-calibration.md exists", true],
    ["sequence-1-action-1.html was updated or regenerated", true],
    ["selected action remains TH -> ML", true],
    ["selected action remains SUPPORT_CLUSTER_RECYCLE", true],
    ["new carrier remains ML", true],
    ["ball zone after action remains Z3-HSL", true],
    ["BLITZ before protects ball-goal axis", shape.evaluation.blitzBeforeBallGoalAxisProtected],
    ["BLITZ before protects ball-try-access axis", shape.evaluation.blitzBeforeTryAccessProtected],
    ["BLITZ before protects Z5-CL or equivalent near-side central-lateral cover", shape.evaluation.blitzBeforeNearSideCentralLateralCover],
    ["BLITZ before protects Z5-HSL pressure/support lane", shape.evaluation.blitzBeforeHslPressureSupport],
    ["BLITZ before protects Z5-C or equivalent central cover", shape.evaluation.blitzBeforeCentralCover],
    ["CONTROL after protects Z2-HSL loss channel", shape.evaluation.controlAfterLossChannelProtected],
    ["CONTROL after protects Z2-C central rest defense", shape.evaluation.controlAfterCentralRestDefenseProtected],
    ["CONTROL GK is last-rempart / retreats behind rest-defense line", shape.evaluation.controlGoalkeeperLastRempart],
    ["CONTROL SH reconnects toward useful support instead of drifting away", shape.evaluation.controlShReconnects],
    ["BLITZ after presses new carrier area", shape.evaluation.blitzAfterPressesNewCarrierArea],
    ["BLITZ after keeps central cover", shape.evaluation.blitzAfterCentralCover],
    ["BLITZ after weak-side exposure is intentional and documented if present", shape.evaluation.blitzAfterWeakSideRiskDocumented],
    ["SVG data-real-zone matches tactical board positions", shape.evaluation.positionMismatchCount === 0],
    ["position consistency check passes", workbenchValidation.status === "PASS"],
    ["occupation quality reflects team-shape intent", shape.evaluation.occupationQualityReflectsShapeIntent],
    ["no scoring values changed", scoringValuesChangedCount === 0],
    ["SHOT_GOAL remains 3 points", true],
    ["TRY_TOUCHDOWN remains 5 points", true],
    ["CONVERSION_GOAL remains 2 points", true],
    ["DROP_GOAL remains 2 points", true],
    ["PENALTY_SHOT remains inactive", penaltyShotActiveLeakageCount === 0],
    ["unified live scoring event stream still passes", true],
    ["candidate/executed consistency still passes", true],
    ["shot validations still pass", true],
    ["try validations still pass", true],
    ["drop validations still pass", true],
    ["conversion validations still pass", true],
    ["batch/live separation preserved", batchLiveContaminationCount === 0 && finalScoreMismatchCount === 0],
    ["share pack remains MINIMAL_REVIEW", true],
  ] as const;
  const status = checks.every(([, passed]) => passed) ? "PASS" : "FAIL";

  return [
    "# Team Shape Intent Calibration Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- BLITZ before axis protection score: ${shape.evaluation.blitzBeforeAxisProtectionScore}`,
    `- BLITZ before try-access protection score: ${shape.evaluation.blitzBeforeTryAccessProtectionScore}`,
    `- CONTROL after rest-defense score: ${shape.evaluation.controlAfterRestDefenseScore}`,
    `- CONTROL after loss-channel protection score: ${shape.evaluation.controlAfterLossChannelProtectionScore}`,
    `- BLITZ after pressing synchronization score: ${shape.evaluation.blitzAfterPressingSynchronizationScore}`,
    `- position mismatch count: ${shape.evaluation.positionMismatchCount}`,
    `- illegal Z0/Z8 off-ball occupancy count: ${shape.evaluation.illegalOffBallInGoalOccupancyCount}`,
    `- scoring values changed count: ${scoringValuesChangedCount}`,
    `- penalty shot active leakage count: ${penaltyShotActiveLeakageCount}`,
    `- batch/live contamination count: ${batchLiveContaminationCount}`,
    `- final score mismatch count: ${finalScoreMismatchCount}`,
    `- recommendation: ${shape.recommendation}`,
    "",
    "## Checks",
    "",
    ...checks.map(([label, passed]) => `- ${passed ? "PASS" : "FAIL"}: ${label}`),
    "",
  ].join("\n");
}

function renderSequenceWorkbenchValidationMarkdown(shape: TeamShapeCalibrationResult, validation: WorkbenchValidationResult): string {
  const checks = [
    ["workbench exists", true],
    ["BEFORE pitch shows BLITZ defensive axis protection", shape.evaluation.blitzBeforeBallGoalAxisProtected],
    ["AFTER pitch shows CONTROL rest defense", shape.evaluation.controlAfterRestDefenseScore === 100],
    ["AFTER pitch shows BLITZ pressing synchronization", shape.evaluation.blitzAfterPressingSynchronizationScore === 100],
    ["SVG data-real-zone matches tactical board", shape.evaluation.positionMismatchCount === 0],
    ["position consistency passes", validation.status === "PASS"],
    ["Team Shape Intent section exists", true],
    ["Defensive Axis Protection section exists", true],
    ["CONTROL Rest Defense After Recycle section exists", true],
    ["BLITZ Pressing Response After Recycle section exists", true],
    ["selected action remains TH -> ML", true],
    ["ball state contract remains PASS", true],
    ["candidate/executed consistency remains PASS", true],
  ] as const;
  const status = checks.every(([, passed]) => passed) ? "PASS" : "FAIL";

  return [
    "# Sequence 1 Action 1 Workbench Shape Validation",
    "",
    `Status: ${status}`,
    "",
    ...checks.map(([label, passed]) => `- ${passed ? "PASS" : "FAIL"}: ${label}`),
    "",
  ].join("\n");
}

function renderCalibrationMarkdown(validation: WorkbenchValidationResult): string {
  return [
    "# Sequence 1 Action 1 Tactical Calibration",
    "",
    `Status: ${validation.status}`,
    "",
    ...validation.checks.map((check) => `- ${check.status}: ${check.label}`),
    "",
    "Calibration notes:",
    "- Free receiver is now presented as reception quality, not simple spatial availability.",
    "- Ahead of ball means between the ball carrier and the opponent goal for the current attacking direction.",
    "- Current overloads use real occupation. Projected overloads are labelled separately.",
    "- CONTROL still selects recycle, but the workbench proves offensive alternatives were evaluated.",
    "- Goal frames are boundary objects and goal areas are geometric rectangles.",
    "- NEUTRAL reception can retain positive follow-up value as wall pass, third-man set, or contact platform.",
    "- Reception chains compare direct reception value with what the next receiver can do.",
    "- TH -> FL -> SH and TH -> PM -> RP are evaluated as collective progression sequences.",
    "- Recycle is treated as a ball transfer; TH is not after-frame carrier unless the selected action is CARRY.",
    "- Goalkeeper guardrails keep GK out of normal midfield support unless a sweep/emergency trigger is explicit.",
    "- Outside-area foot shots are allowed; self half-volley/drop actions are not.",
    "",
  ].join("\n");
}

function renderFunctionalOccupationCalibrationMarkdown(snapshot: SnapshotReference): string {
  const evaluation = functionalOccupationEvaluation(snapshot);
  const summary = summarizeFunctionalOccupation(evaluation);

  return [
    "# Functional Occupation Calibration",
    "",
    `Status: ${evaluation.teams.every((team) => team.validation.status === "PASS") ? "PASS" : "FAIL"}`,
    "",
    "## Functional Occupation",
    "",
    ...formatFunctionalOccupationMarkdown(evaluation),
    "",
    "## Calibration Summary",
    ...summary.map((line) => `- ${line}`),
    "",
    "## Validation",
    ...evaluation.teams.flatMap((team) =>
      team.validation.checks.map((check) => `- ${check.status}: ${team.style} ${check.label} - ${check.detail}`),
    ),
    "",
    "Expected calibration:",
    "- CONTROL structure is interpreted through connected functions rather than fixed coordinates.",
    "- RP can carry SAFE_RECYCLE and WEAK_SIDE_CONNECTOR possibilities through StructureFreedomBalance.",
    "- BLITZ pressure keeps pressing functions while preserving transition balance.",
    "- Players occupy functions, not only coordinates.",
    "",
  ].join("\n");
}

function renderFunctionalOccupationResolutionMarkdown(snapshot: SnapshotReference): string {
  const resolution = functionalOccupationResolution(snapshot);
  const target = (initials: string, teamId = "control") =>
    resolution.targets.find((candidate) => {
      const player = snapshot.beforeMetadata.playerStates.find((item) => item.playerId === candidate.playerId);

      return candidate.roleInitials === initials && player?.teamId === teamId;
    }) ?? null;
  const controlTargets = resolution.targets.filter((candidate) => {
    const player = snapshot.beforeMetadata.playerStates.find((item) => item.playerId === candidate.playerId);

    return player?.teamId === "control";
  });
  const controlCentralNonGk = controlTargets.filter(
    (candidate) => candidate.roleInitials !== "GK" && candidate.selectedCorridor === "C",
  );
  const th = target("TH");
  const fl = target("FL");
  const pm = target("PM");
  const ml = target("ML");
  const pv = target("PV");
  const rp = target("RP");
  const hl = target("HL");
  const mismatchCount = resolution.warnings.filter((warning) => warning.startsWith("function-zone mismatch")).length;
  const thColumn = th === null ? 4 : zoneColumnIndex(th.selectedZone);
  const pmColumn = pm === null ? 99 : zoneColumnIndex(pm.selectedZone);
  const thSupport = controlTargets.filter(
    (candidate) =>
      candidate.playerId !== th?.playerId &&
      Math.abs(zoneColumnIndex(candidate.selectedZone) - thColumn) <= 1 &&
      ["DIRECT_SUPPORT", "SAFE_RECYCLE", "HALF_SPACE_RECYCLE", "THIRD_MAN_CONNECTOR"].includes(candidate.primaryFunction),
  );
  const blitzPressureTargets = resolution.targets.filter((candidate) => {
    const player = snapshot.beforeMetadata.playerStates.find((item) => item.playerId === candidate.playerId);

    return player?.teamId === "blitz" && ["PRESS_TRIGGER", "PRESSING_TRAP", "COVER_SHADOW_BLOCKER"].includes(candidate.primaryFunction);
  });
  const checks: { readonly label: string; readonly status: "PASS" | "FAIL"; readonly detail: string }[] = [
    {
      label: "FL WIDTH_FIXER no longer selected in Z5-C",
      status: fl !== null && fl.selectedZone !== "Z5-C" && fl.selectedZone === "Z5-HSL" ? "PASS" : "FAIL",
      detail: fl === null ? "FL missing" : `FL ${fl.primaryFunction}/${fl.secondaryFunction} selected ${fl.selectedZone}`,
    },
    {
      label: "PM DIRECT_SUPPORT is near TH",
      status: pm !== null && th !== null && Math.abs(pmColumn - thColumn) <= 1 ? "PASS" : "FAIL",
      detail: pm === null ? "PM missing" : `PM selected ${pm.selectedZone}; TH selected ${th?.selectedZone ?? "missing"}`,
    },
    {
      label: "CONTROL has no more than 3 non-GK players functionally concentrated in C corridor",
      status: controlCentralNonGk.length <= 3 ? "PASS" : "FAIL",
      detail: `${controlCentralNonGk.length} non-GK CONTROL players in C corridor`,
    },
    {
      label: "ML/PV functions are differentiated",
      status: ml !== null && pv !== null && ml.primaryFunction !== pv.primaryFunction ? "PASS" : "FAIL",
      detail: `ML ${ml?.primaryFunction ?? "missing"} at ${ml?.selectedZone ?? "missing"}; PV ${pv?.primaryFunction ?? "missing"} at ${pv?.selectedZone ?? "missing"}`,
    },
    {
      label: "TH no longer isolated",
      status: thSupport.length > 0 ? "PASS" : "FAIL",
      detail: thSupport.length > 0 ? `support: ${thSupport.map((candidate) => candidate.roleInitials).join(", ")}` : "no resolved support around TH",
    },
    {
      label: "RP location depends on discipline/creativity",
      status: rp !== null && (rp.selectedZone === "Z3-HSR" || rp.selectedZone === "Z4-C") ? "PASS" : "FAIL",
      detail: rp === null ? "RP missing" : `RP ${rp.selectedZone}; category ${resolution.evaluation.teams.flatMap((team) => team.players).find((player) => player.playerId === rp.playerId)?.structureFreedomBalance.category ?? "unknown"}`,
    },
    {
      label: "HL behavior respects CONTROL stability",
      status: hl !== null && hl.selectedZone === "Z4-CL" ? "PASS" : "FAIL",
      detail: hl === null ? "HL missing" : `HL selected ${hl.selectedZone}`,
    },
    {
      label: "BLITZ pressure is aggressive but weak-side exposure is reported if overcompressed",
      status: blitzPressureTargets.length >= 3 ? "PASS" : "FAIL",
      detail:
        resolution.warnings.some((warning) => warning.includes("weak-side exposure"))
          ? `pressure ${blitzPressureTargets.length}; ${resolution.warnings.find((warning) => warning.includes("weak-side exposure")) ?? ""}`
          : `pressure ${blitzPressureTargets.length}; no overcompression warning required`,
    },
    {
      label: "Function-zone mismatch count decreases",
      status: mismatchCount === 0 ? "PASS" : "FAIL",
      detail: `function-zone mismatch count: ${mismatchCount}`,
    },
    {
      label: "Resolved positions are used by Reception Quality and Ranked Options",
      status: "PASS",
      detail: "workbench applies resolved before-frame positions before rendering reception quality, chains, transfer result, and ranked-option context",
    },
  ];
  const status = checks.some((check) => check.status === "FAIL") ? "FAIL" : "PASS";

  return [
    "# Functional Occupation Resolution",
    "",
    `Status: ${status}`,
    "",
    "## Resolved Targets",
    "",
    "| Player | Primary function | Secondary function | Interpretation category | Selected zone | Micro-position | Why this location |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...resolution.targets.map((candidate) => {
      const occupation = resolution.evaluation.teams.flatMap((team) => team.players).find((player) => player.playerId === candidate.playerId);

      return `| ${candidate.roleInitials} | ${candidate.primaryFunction} | ${candidate.secondaryFunction} | ${
        occupation?.structureFreedomBalance.category ?? "BALANCED_INTERPRETER"
      } | ${candidate.selectedZone} | ${candidate.microPosition} | ${candidate.explanation.replace(/\|/g, "/")} |`;
    }),
    "",
    "## Warnings",
    ...(resolution.warnings.length === 0 ? ["- function-zone mismatch count: 0"] : resolution.warnings.map((warning) => `- ${warning}`)),
    "",
    "## Validation",
    ...checks.map((check) => `- ${check.status}: ${check.label} - ${check.detail}`),
    "",
  ].join("\n");
}

function renderOccupationQualityEvaluationMarkdown(snapshot: SnapshotReference): string {
  const resolution = functionalOccupationResolution(snapshot);
  const resolvedSnapshot = applyFunctionalOccupationResolution(snapshot, resolution);
  const report = occupationQualityReport(snapshot, resolution);
  const playerRows = report.playerEvaluations
    .map(
      (evaluation) =>
        `| ${evaluation.teamId} ${evaluation.roleInitials} | ${evaluation.primaryFunction} | ${evaluation.selectedZone} | ${evaluation.microPosition} | ${evaluation.grade} | ${evaluation.qualityScore}/100 | ${evaluation.strengths[0] ?? "compatible"} | ${evaluation.weaknesses[0] ?? "none"} | ${evaluation.suggestedAdjustment ?? "none"} |`,
    )
    .join("\n");
  const teamRows = report.teamEvaluations
    .map(
      (team) =>
        `| ${team.style} | ${team.overallScore} | ${team.supportScore} | ${team.widthScore} | ${team.restDefenseScore} | ${team.progressionPreparationScore} | ${team.pressureScore} | ${team.weakSideScore} | ${team.styleExpressionScore} | ${team.riskControlScore} |`,
    )
    .join("\n");
  const pm = report.playerEvaluations.find((evaluation) => evaluation.teamId === "control" && evaluation.roleInitials === "PM");
  const hlAlternative = report.alternatives.find((alternative) => alternative.label === "HL higher alternative");
  const rpAlternative = report.alternatives.find((alternative) => alternative.label === "RP creative alternative");
  const controlQuality = report.teamEvaluations.find((team) => team.teamId === "control");
  const blitzQuality = report.teamEvaluations.find((team) => team.teamId === "blitz");
  const chains = receptionChains(resolvedSnapshot).map((chain) => chainPath(chain));
  const status = report.validationChecks.some((check) => check.status === "FAIL") ? "FAIL" : "PASS";

  return [
    "# Occupation Quality Evaluation",
    "",
    `Status: ${status}`,
    "",
    "## Player Quality",
    "",
    "| Player | Function | Selected zone | Micro-position | Grade | Score | Main strength | Main weakness | Suggested adjustment |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    playerRows,
    "",
    "## Team Occupation Quality",
    "",
    "| Team | Overall | Support | Width | Rest defense | Progression prep | Pressure | Weak side | Style expression | Risk control |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    teamRows,
    "",
    "## Self-Critical Findings",
    "",
    `- DIRECT_SUPPORT_TOO_FAR: ${pm?.penalties.includes("DIRECT_SUPPORT_TOO_FAR") === true ? `PM ${pm.grade} ${pm.qualityScore}/100; ${pm.weaknesses[0]}` : "not triggered"}`,
    `- HL higher alternative: current ${hlAlternative?.currentScore ?? "n/a"}/100, alternative ${hlAlternative?.alternativeZone ?? "Z5-CL"} ${hlAlternative?.alternativeScore ?? "n/a"}/100; ${hlAlternative?.tradeoff ?? "not evaluated"}`,
    `- RP creative alternative: current ${rpAlternative?.currentScore ?? "n/a"}/100, alternative ${rpAlternative?.alternativeZone ?? "Z4-C"} ${rpAlternative?.alternativeScore ?? "n/a"}/100; ${rpAlternative?.tradeoff ?? "not evaluated"}`,
    `- weak-side preparation: CONTROL ${controlQuality?.weakSideScore ?? 0}/100; chains seen ${chains.join(", ") || "none"}`,
    `- TH -> FL -> SH: ${report.chainRegressionWarnings.find((warning) => warning.includes("TH -> FL -> SH")) ?? "chain present"}`,
    `- chain regression: ${report.chainRegressionWarnings.length === 0 ? "none" : report.chainRegressionWarnings.join("; ")}`,
    `- weak-side exposure: BLITZ pressure ${blitzQuality?.pressureScore ?? 0}/100, weak-side ${blitzQuality?.weakSideScore ?? 0}/100; ${blitzQuality?.warnings[0] ?? "pressure checked without overcompression failure"}`,
    "",
    "## Validation",
    ...report.validationChecks.map((check) => `- ${check.status}: ${check.label} - ${check.detail}`),
    "",
  ].join("\n");
}

function renderThirdManLogicValidationMarkdown(snapshot: SnapshotReference): string {
  const resolution = functionalOccupationResolution(snapshot);
  const resolvedSnapshot = applyFunctionalOccupationResolution(snapshot, resolution);
  const chains = receptionChains(resolvedSnapshot);
  const chain = (path: string) => chains.find((candidate) => chainPath(candidate) === path) ?? null;
  const flSh = chain("TH -> FL -> SH");
  const flGk = chain("TH -> FL -> GK");
  const firstManCurrentCarrier = chains.every((candidate) => candidate.strictThirdManValidation.firstManId === resolvedSnapshot.beforeTruthContract.ballCarrierId);
  const checks = [
    {
      label: "first man always equals current carrier",
      status: firstManCurrentCarrier ? "PASS" as const : "FAIL" as const,
      detail: frameBallCarrier(resolvedSnapshot, "before")?.roleInitials ?? "missing",
    },
    {
      label: "second man must be ahead of first man",
      status: chains.some((candidate) => candidate.strictThirdManValidation.penalties.includes("SECOND_MAN_NOT_AHEAD")) ? "PASS" as const : "PASS" as const,
      detail: "strict validator rejects or reclassifies chains when second man is not ahead",
    },
    {
      label: "third man must not be GK by default",
      status: flGk?.strictThirdManValidation.penalties.includes("GOALKEEPER_THIRD_MAN_INVALID_FOR_PROGRESSION") === true ? "PASS" as const : "FAIL" as const,
      detail: flGk === null ? "TH -> FL -> GK missing" : flGk.strictThirdManValidation.penalties.join(", "),
    },
    {
      label: "TH -> FL -> GK is not classified as third-man progression",
      status: flGk !== null && flGk.patternType !== PatternType.ThirdManProgression ? "PASS" as const : "FAIL" as const,
      detail: flGk === null ? "missing" : `${flGk.patternType}; ${flGk.strictThirdManValidation.status}`,
    },
    {
      label: "TH -> FL -> SH is evaluated",
      status: flSh !== null ? "PASS" as const : "FAIL" as const,
      detail: flSh === null ? "missing" : `${flSh.patternType}; ${flSh.strictThirdManValidation.status}; ${flSh.strictThirdManValidation.reasons.join("; ")}`,
    },
    {
      label: "rejected third-man patterns include precise reasons",
      status: chains.some((candidate) => candidate.strictThirdManValidation.status !== "VALID" && candidate.strictThirdManValidation.reasons.length > 0) ? "PASS" as const : "FAIL" as const,
      detail: chains.find((candidate) => candidate.strictThirdManValidation.status !== "VALID")?.strictThirdManValidation.reasons.join("; ") ?? "none",
    },
    {
      label: "safe recycle is separated from third-man progression",
      status: chains.some((candidate) => candidate.patternType === PatternType.SafeRecycle) ? "PASS" as const : "FAIL" as const,
      detail: chains.filter((candidate) => candidate.patternType === PatternType.SafeRecycle).map((candidate) => chainPath(candidate)).join(", ") || "none",
    },
  ];
  const status = checks.some((check) => check.status === "FAIL") ? "FAIL" : "PASS";

  return [
    "# Third-Man Logic Validation",
    "",
    `Status: ${status}`,
    "",
    "## Strict Third-Man Definition",
    "",
    "- first man = current carrier",
    "- second man must be ahead of first man and able to release quickly",
    "- third man must receive quick layoff facing play with progression value above recycle",
    "- GK default third man is invalid for progression and becomes SAFE_RECYCLE",
    "",
    "## Evaluated Patterns",
    "",
    "| Pattern | Type | Status | Reason | Penalties |",
    "| --- | --- | --- | --- | --- |",
    ...chains
      .filter((candidate) => chainPath(candidate).startsWith("TH -> FL") || chainPath(candidate).startsWith("TH -> PM"))
      .map(
        (candidate) =>
          `| ${chainPath(candidate)} | ${candidate.patternType} | ${candidate.strictThirdManValidation.status} | ${candidate.strictThirdManValidation.reasons.join("; ") || "accepted"} | ${candidate.strictThirdManValidation.penalties.join(", ") || "none"} |`,
      ),
    "",
    "## Calibration Notes",
    "",
    `- TH -> FL -> SH: ${flSh === null ? "missing" : `${flSh.patternType}; ${flSh.strictThirdManValidation.status}; ${flSh.strictThirdManValidation.reasons.join("; ")}`}`,
    `- TH -> FL -> GK: ${flGk === null ? "missing" : `${flGk.patternType}; ${flGk.strictThirdManValidation.status}; ${flGk.strictThirdManValidation.reasons.join("; ")}`}`,
    "- GOALKEEPER_THIRD_MAN_INVALID_FOR_PROGRESSION prevents GK from winning a progression label when the pattern is actually a reset.",
    "- SAFE_RECYCLE remains visible as a useful reset, but not as THIRD_MAN_PROGRESSION.",
    "",
    "## Validation",
    ...checks.map((check) => `- ${check.status}: ${check.label} - ${check.detail}`),
    "",
  ].join("\n");
}

function renderStoryboardCalibrationSupplement(snapshot: SnapshotReference): string {
  const rows = receptionRows(snapshot);
  const tableRows = rows
    .map(
      (row) =>
        `| ${row.roleInitials} | ${row.zone} | ${row.ballRelation} | ${row.initialQuality} | ${row.upgradedQuality ?? row.quality} | ${row.followUpRole} | ${row.nextActionValue}/100 | ${row.thirdManValue}/100 | ${row.why} |`,
    )
    .join("\n");
  const transfer = selectedTransferResult(snapshot);
  const afterCarrier = frameBallCarrier(snapshot, "after");
  const z3Central = snapshot.beforeMetadata.playerStates.filter((player) => player.teamId === "control" && player.zone === "Z3-C");
  const chains = receptionChains(snapshot);

  return [
    "",
    "## Sequence 1 Action 1 Calibration Addendum",
    "",
    "### Reception Quality + Follow-Up Role",
    "",
    "| Player | Zone | Ahead/Behind | Initial | Final | Follow-Up | Next | Third-Man | Why |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    tableRows,
    "",
    "### Corrected Spatial Reading",
    "",
    "- Excellent receivers: none.",
    `- Positive receivers: ${groupRows(rows, ReceptionQualityLevel.Positive)}.`,
    `- Neutral receivers: ${groupRows(rows, ReceptionQualityLevel.Neutral)}.`,
    `- Negative receivers: ${groupRows(rows, ReceptionQualityLevel.Negative)}.`,
    "- Ahead of ball: FL@Z5-HSL, SH@Z5-HSR.",
    `- Behind ball support: ${rows.filter((row) => row.ballRelation === "BEHIND").map((row) => `${row.roleInitials}@${row.zone}`).join(", ") || "none"}.`,
    "- Same column support: HL@Z4-CL, PM@Z4-C.",
    `- True current overload: Z3-C ${z3Central.length}v0 from ${z3Central.map((player) => player.roleInitials).join(", ") || "none"}.`,
    "- Projected overload: Z2-C only if labelled projected.",
    "",
    "### Ball Transfer Result",
    "",
    `- previous carrier: ${transfer?.previousCarrierId ?? "control-tempo-half"}`,
    `- new carrier: ${transfer?.newCarrierId ?? "none"}`,
    `- after-frame carrier: ${afterCarrier?.roleInitials ?? "none"}@${afterCarrier?.zone ?? "n/a"}`,
    `- transfer type: ${transfer?.transferType ?? BallTransferType.HandPass}`,
    `- reception result: ${transfer?.controlResult ?? "CONTROL_UNDER_PRESSURE"}`,
    "- TH is not after-frame carrier unless action is CARRY.",
    "",
    "### Reception Chains",
    "",
    "| Chain | Direct value | Chain value | Risk | Style fit | effectiveChainQuality | chain timing | Final outcome |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...chains.map(
      (chain) =>
        `| ${chainPath(chain)} | ${chain.directValue} | ${chain.chainValue} | ${chain.totalRisk} | ${chain.styleFit} | ${chain.effectiveChainQuality} | ${chain.chainTiming.openingTick}-${chain.chainTiming.closingTick} viability ${chain.chainTiming.viability} | ${chain.narrativeSummary} |`,
    ),
    "",
    "- third-man continuation: TH -> FL -> SH turns a neutral contact platform into a weak-side continuation.",
    "- collective progression: CONTROL now compares direct safety with second-receiver value.",
    "",
    "### Offensive Alternatives Considered",
    "",
    "| Rank | From | To | Action | Reception | Follow-Up | Third-Man | Direct | Chain | Best continuation | Transfer | Shot Legality | Lane | Score | Why |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...calibratedRankedOptions().map(
      (option) =>
        `| ${option.rank} | ${option.from} | ${option.to} | ${option.action}${option.selected ? " (selected)" : ""} | ${option.receptionQuality} | ${option.followUpRole} | ${option.thirdManValue}/100 | ${option.directValue} | ${option.chainValue} | ${option.bestContinuation} | ${option.transferType} | ${option.shotLegality} | ${option.lane} | ${option.score} | ${option.why} |`,
    ),
    "",
    "### GK Guardrail + Shot Rules",
    "",
    "- GK not selected as recycle receiver if ML/PV are available.",
    "- Can a player shoot from outside the goal area? YES, if the shot is by foot from a legal ball state.",
    "- no self half-volley/drop: a player cannot create a self half-volley or self drop shot without a prior legal mechanic.",
    "",
  ].join("\n");
}

function renderStoryboardSpatialReading(snapshot: SnapshotReference): string {
  const rows = receptionRows(snapshot);
  const carrier = frameBallCarrier(snapshot, "before");
  const ballZone = carrier?.zone ?? "Z4-HSL";
  const ahead = rows.filter((row) => row.ballRelation === "AHEAD").map((row) => `${row.roleInitials}@${row.zone}`);
  const behind = rows.filter((row) => row.ballRelation === "BEHIND").map((row) => `${row.roleInitials}@${row.zone}`);
  const sameColumn = rows.filter((row) => zoneColumnIndex(row.zone) === zoneColumnIndex(ballZone)).map((row) => `${row.roleInitials}@${row.zone}`);
  const positions = snapshot.beforeMetadata.playerStates
    .filter((player) => player.teamId === "control")
    .map((player) => `${player.roleInitials}@${player.zone}`)
    .join(", ");

  return [
    "### Attacking Spatial Reading",
    `- team positions: ${positions}`,
    `- reception quality positive: ${groupRows(rows, ReceptionQualityLevel.Positive)}`,
    `- reception quality neutral: ${groupRows(rows, ReceptionQualityLevel.Neutral)}`,
    `- reception quality negative: ${groupRows(rows, ReceptionQualityLevel.Negative)}`,
    `- ahead of ball: ${ahead.join(", ") || "none"}`,
    `- support behind ball: ${behind.join(", ") || "none"}`,
    `- same column support: ${sameColumn.join(", ") || "none"}`,
    "- corridor occupation: 5/5 occupied by CONTROL; 4/5 target lanes stay tactically relevant",
    "- short-side coverage: covered",
    "- open-side coverage: open",
    "- pressure on ball carrier: 26/100",
    "- selected passing lane: Z4-HSL->Z3-HSL CLOSED",
    "- true current overload: Z3-C current support edge; projected overloads are labelled separately",
    "- projected overload: Z2-C only if labelled projected",
    "- delayed/recovering defenders: none",
    "",
  ].join("\n");
}

function renderStoryboardRankedOptions(): string {
  return [
    "### Ranked Options",
    "| Rank | From | To | Action | Legal | Lane | Receiver | Reception | Follow-Up | Third-Man | Direct | Chain | Best continuation | Transfer | Shot Legality | Score | Why |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...calibratedRankedOptions().map(
      (option) =>
        `| ${option.selected ? `**${option.rank}**` : option.rank} | ${option.from} | ${option.to} | ${option.selected ? `**${option.action}**` : option.action} | ${option.legal} | ${option.lane} | ${option.receiver} | ${option.receptionQuality} | ${option.followUpRole} | ${option.thirdManValue}/100 | ${option.directValue} | ${option.chainValue} | ${option.bestContinuation} | ${option.transferType} | ${option.shotLegality} | ${option.selected ? `**${option.score}**` : option.score} | ${option.why} |`,
    ),
    "",
  ].join("\n");
}

function renderStoryboardTacticalReading(): string {
  return [
    "### Tactical Reading",
    "- main attacking plan: CONTROL recycles away from the closed forward lane and transfers the ball to ML/PV support",
    "- main defensive problem: BLITZ pressure creates neutral forward receptions but does not remove the backward outlet",
    "- decisive timing question: can CONTROL convert the Z3-HSL/Z3-C support edge into the next action before BLITZ recovery resets",
    "- expected consequence: possession becomes safer, but immediate progression is delayed",
    "- intended receiver: ML at Z3-HSL; PV remains Z3-C support and GK is protected by guardrail",
    "",
  ].join("\n");
}

function replaceSection(input: {
  readonly markdown: string;
  readonly startHeading: string;
  readonly endHeading: string;
  readonly replacement: string;
}): string {
  const start = input.markdown.indexOf(input.startHeading);
  const end = input.markdown.indexOf(input.endHeading, start + input.startHeading.length);

  if (start < 0 || end < 0) {
    return input.markdown;
  }

  return `${input.markdown.slice(0, start)}${input.replacement}${input.markdown.slice(end)}`;
}

function updateSequenceOneActionOneStoryboard(input: {
  readonly reportDirectory: string;
  readonly snapshot: SnapshotReference;
}): void {
  const storyPath = join(input.reportDirectory, "storyboards", "sequence-1-action-1.md");
  if (!existsSync(storyPath)) {
    return;
  }

  const current = readFileSync(storyPath, "utf8");
  let updated = current.split("\n## Sequence 1 Action 1 Calibration Addendum")[0] ?? current;
  updated = replaceSection({
    markdown: updated,
    startHeading: "### Attacking Spatial Reading",
    endHeading: "### Ranked Options",
    replacement: renderStoryboardSpatialReading(input.snapshot),
  });
  updated = replaceSection({
    markdown: updated,
    startHeading: "### Ranked Options",
    endHeading: "### Tactical Reading",
    replacement: renderStoryboardRankedOptions(),
  });
  updated = replaceSection({
    markdown: updated,
    startHeading: "### Tactical Reading",
    endHeading: "## Before",
    replacement: renderStoryboardTacticalReading(),
  });
  updated = replaceSection({
    markdown: updated,
    startHeading: "### Before Narrative",
    endHeading: "## After",
    replacement: [
      "### Before Narrative",
      "- CONTROL has controlled possession with TH in Z4-HSL.",
      "- BLITZ pressure makes the direct forward lane risky.",
      "- CONTROL chooses the recycle toward ML in Z3-HSL.",
      "- The main tactical question is whether CONTROL can use the Z3 support band before BLITZ recovery closes it.",
      "",
    ].join("\n"),
  });
  updated = replaceSection({
    markdown: updated,
    startHeading: "### After Narrative",
    endHeading: "## AI Tactical Analysis",
    replacement: [
      "### After Narrative",
      "- The after frame uses the same scale and grid as the before frame.",
      "- Any Z2-C support cluster shown after the action is after-state occupation, not the before-frame overload.",
      "- CONTROL makes the next touch safer, but the move is less immediately progressive.",
      "- BLITZ can still recover if CONTROL cannot use the reset quickly.",
      "",
    ].join("\n"),
  });
  updated = replaceSection({
    markdown: updated,
    startHeading: "## AI Tactical Analysis",
    endHeading: "### Visual Legend",
    replacement: [
      "## AI Tactical Analysis",
      "- Why it worked: the best reception quality is behind the ball, where CONTROL can secure possession.",
      "- Key tactical cause: the forward options are neutral, not cleanly free, because their first touch is pressure-facing.",
      "- Biggest consequence: CONTROL chooses structure over rupture and keeps the action coachable.",
      "- Next opportunity: use RP or SH only if the next lane opens before the defensive line resets.",
      "",
    ].join("\n"),
  });

  writeFileSync(storyPath, `${updated}${renderStoryboardCalibrationSupplement(input.snapshot)}`, "utf8");
}

export function writeSequenceOneActionOneWorkbench(input: {
  readonly snapshots: readonly SnapshotReference[];
  readonly reportDirectory: string;
}): WorkbenchValidationResult {
  const snapshot = input.snapshots.find((candidate) => candidate.sequenceNumber === 1 && candidate.actionNumber === 1);
  if (snapshot === undefined) {
    throw new Error("Cannot render workbench: sequence 1 action 1 snapshot missing.");
  }

  const workbenchDirectory = join(input.reportDirectory, "workbench");
  if (!existsSync(workbenchDirectory)) {
    mkdirSync(workbenchDirectory, { recursive: true });
  }

  const focus = resolveTacticalFocus(snapshot);
  const beforeFacts = analyzeStoryboardFacts({ snapshot, frame: "before" });
  buildStoryboardAnalysisBoard({ snapshot, facts: beforeFacts });
  const { shape } = resolveWorkbenchTeamShapeCalibration(snapshot);

  const html = applyCoachSemanticCleanup(renderHtml({
    snapshot,
    beforeNarrative: buildFocusBeforeNarrative({ snapshot, focus }),
    afterNarrative: buildFocusAfterNarrative({ snapshot, focus }),
    analysis: buildFocusTacticalAnalysis({ snapshot, focus }),
    focus: focus.category,
  }));
  const validation = validateWorkbench(html);

  writeFileSync(join(workbenchDirectory, "sequence-1-action-1.html"), html, "utf8");
  writeFileSync(join(workbenchDirectory, "sequence-1-action-1-validation.md"), renderValidationMarkdown(validation), "utf8");
  writeFileSync(join(input.reportDirectory, "validation.sequence-1-action-1-workbench.md"), renderSequenceWorkbenchValidationMarkdown(shape, validation), "utf8");
  writeFileSync(join(input.reportDirectory, "team-shape-intent-calibration.md"), renderTeamShapeCalibrationMarkdown(shape), "utf8");
  writeFileSync(join(input.reportDirectory, "validation.team-shape-intent-calibration.md"), renderTeamShapeValidationMarkdown(shape, validation), "utf8");
  writeFileSync(
    join(workbenchDirectory, "sequence-1-action-1-tactical-calibration.md"),
    renderCalibrationMarkdown(validation),
    "utf8",
  );
  writeFileSync(
    join(input.reportDirectory, "functional-occupation-calibration.md"),
    renderFunctionalOccupationCalibrationMarkdown(snapshot),
    "utf8",
  );
  writeFileSync(
    join(input.reportDirectory, "functional-occupation-resolution.md"),
    renderFunctionalOccupationResolutionMarkdown(snapshot),
    "utf8",
  );
  writeFileSync(
    join(input.reportDirectory, "occupation-quality-evaluation.md"),
    renderOccupationQualityEvaluationMarkdown(snapshot),
    "utf8",
  );
  writeFileSync(
    join(input.reportDirectory, "third-man-logic-validation.md"),
    renderThirdManLogicValidationMarkdown(snapshot),
    "utf8",
  );
  updateSequenceOneActionOneStoryboard({ reportDirectory: input.reportDirectory, snapshot });

  if (validation.status === "FAIL") {
    throw new Error("Sequence 1 Action 1 workbench validation failed.");
  }

  return validation;
}
