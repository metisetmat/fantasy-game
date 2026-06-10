import { LATERAL_CORRIDORS, type LateralCorridor } from "../../core/zones";
import { BLITZ_ROSTER, CONTROL_ROSTER } from "../../data/teams";
import { TACTICAL_EXPLAINABILITY_MODE } from "../../config/debug";
import { INTENT_ENGINE_CONFIG } from "../../config/intentConfig";
import { SNAPSHOT_TRUTH_CONFIG } from "../../config/snapshotConfig";
import { TacticalStatus } from "../../systems/players";
import { getIntentAbbreviation } from "../../systems/intent";
import { AttackingDirection } from "../../systems/spatial/intention";
import { getTeamValue } from "../../systems/spatial/dynamicInfluence";
import type { TacticalSnapshot, SnapshotPlayerMarker } from "./tacticalSnapshotTypes";
import {
  actionLayerName,
  ballLayerName,
  fieldLayerName,
  influenceLayerName,
  legendLayerName,
  overloadLayerName,
  passingLaneLayerName,
  perceptionLayerName,
  playerMarkerLayerName,
  recoveryLayerName,
  scoringLayerName,
  trajectoryLayerName,
  truthAttributes,
  zoneGridLayerName,
} from "./layers";

const ZONES: readonly string[] = ["Z0", "Z1", "Z2", "Z3", "Z4", "Z5", "Z6", "Z7", "Z8"];
const CELL_WIDTH = 92;
const CELL_HEIGHT = 62;
const LEFT = 70;
const TOP = 70;
const GOAL_FRAME_WIDTH = 38;
const GOAL_FRAME_HEIGHT = 34;
const CROSSBAR_OFFSET = 24;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseZone(zone: string): { readonly z: string; readonly lane: string } {
  const [z, lane] = zone.split("-");
  return {
    z: z ?? "Z4",
    lane: lane ?? "C",
  };
}

function cellPoint(zone: string): { readonly x: number; readonly y: number } {
  const parsed = parseZone(zone);
  const zoneIndex = Math.max(0, ZONES.indexOf(parsed.z));
  const laneIndex = Math.max(0, LATERAL_CORRIDORS.indexOf(parsed.lane as LateralCorridor));

  return {
    x: LEFT + zoneIndex * CELL_WIDTH + CELL_WIDTH / 2,
    y: TOP + laneIndex * CELL_HEIGHT + CELL_HEIGHT / 2,
  };
}

function markerStyle(player: SnapshotPlayerMarker): string {
  if (player.state === "recovering") {
    return "stroke-dasharray=\"4 3\" stroke-width=\"3\"";
  }

  if (player.state === "delayed") {
    return "stroke-dasharray=\"2 4\" stroke-width=\"3\"";
  }

  if (player.state === "eliminated") {
    return "stroke-width=\"3\" opacity=\"0.65\"";
  }

  if (player.state === "covering") {
    return "stroke-width=\"3\"";
  }

  if (player.state === "target") {
    return "stroke-width=\"3\"";
  }

  return "";
}

function sortPlayersForRendering(players: readonly SnapshotPlayerMarker[]): readonly SnapshotPlayerMarker[] {
  return [...players].sort((left, right) => {
    const teamCompare = left.teamName.localeCompare(right.teamName);

    if (teamCompare !== 0) {
      return teamCompare;
    }

    return left.playerId.localeCompare(right.playerId);
  });
}

function markerPoint(player: SnapshotPlayerMarker, zoneIndex: number): { readonly x: number; readonly y: number } {
  const point = cellPoint(player.zone);
  const offsets = [
    { x: -22, y: -15 },
    { x: 0, y: -15 },
    { x: 22, y: -15 },
    { x: -22, y: 0 },
    { x: 0, y: 0 },
    { x: 22, y: 0 },
    { x: -22, y: 15 },
    { x: 0, y: 15 },
    { x: 22, y: 15 },
    { x: 0, y: 27 },
  ] as const;
  const offset = offsets[zoneIndex] ?? { x: ((zoneIndex % 5) - 2) * 14, y: 27 };

  return {
    x: point.x + offset.x,
    y: point.y + offset.y,
  };
}

function statusLabel(player: SnapshotPlayerMarker): string {
  if (player.state === "recovering") {
    return "R";
  }

  if (player.state === "delayed") {
    return "D";
  }

  if (player.state === "eliminated") {
    return "E";
  }

  if (player.state === "covering" || player.tacticalStatus === TacticalStatus.Covering) {
    return "C";
  }

  if (player.tacticalStatus === TacticalStatus.Supporting) {
    return "S";
  }

  if (player.tacticalStatus === TacticalStatus.Pressing) {
    return "P";
  }

  return "";
}

function intentEvolutionSuffix(player: SnapshotPlayerMarker): string {
  if (player.intentUrgency >= 80) {
    return "!!";
  }

  if (player.intentEvolutionDirection === "ESCALATING") {
    return "^";
  }

  if (player.intentEvolutionDirection === "DECAYING") {
    return "v";
  }

  return "";
}

function renderPlayer(player: SnapshotPlayerMarker, zoneIndex: number, timelineEventId: string): string {
  const point = markerPoint(player, zoneIndex);
  const fill = player.color === "blue" ? "#2563eb" : "#dc2626";
  const stateLabel = statusLabel(player);
  const intentLabel =
    INTENT_ENGINE_CONFIG.showIntentLabelsInSnapshots && player.primaryIntent !== null
      ? `${getIntentAbbreviation(player.primaryIntent)}${intentEvolutionSuffix(player)}`
      : "";

  const layerAttributes = truthAttributes({
    layer: playerMarkerLayerName,
    truthType: "PLAYER_MARKER",
    source: "PlayerMatchState",
    timelineEventId,
    playerId: player.playerId,
    teamId: player.teamId,
    zone: player.zone,
  });
  const roleIcon =
    player.role === "goalkeeper_free_safety"
      ? `<rect id="goalkeeper-frame-icon-${escapeXml(player.playerId)}" ${truthAttributes({ layer: playerMarkerLayerName, truthType: "GOALKEEPER_FRAME_COVERAGE", source: "PlayerMatchState", timelineEventId, playerId: player.playerId, teamId: player.teamId, zone: player.zone })} x="${point.x - 7}" y="${point.y - 18}" width="14" height="5" fill="none" stroke="#facc15" stroke-width="2" />`
      : "";

  return `<g id="player-${escapeXml(player.playerId)}" ${layerAttributes} data-team="${escapeXml(player.teamName)}" data-role="${escapeXml(player.role)}" data-initials="${escapeXml(player.roleInitials)}" data-primary-intent="${escapeXml(player.primaryIntent ?? "NONE")}" data-intent-age="${player.intentAgeTicks}" data-intent-priority="${player.intentPriority}" data-intent-urgency="${player.intentUrgency}" data-intent-evolution="${player.intentEvolutionDirection}" data-trajectory-id="${escapeXml(player.activeTrajectoryId ?? "NONE")}" data-movement-type="${escapeXml(player.movementType ?? "NONE")}" data-arrival-tick="${player.estimatedArrivalTick ?? -1}" data-facing-direction="${escapeXml(player.facingDirection ?? "NONE")}" data-perception-confidence="${player.perceptionConfidence}" data-awareness-radius="${player.awarenessRadius}" data-blind-side-exposure="${player.blindSideExposure}" data-reaction-delay="${player.reactionDelayTicks}">
    <circle cx="${point.x}" cy="${point.y}" r="11" fill="${fill}" stroke="#111827" ${markerStyle(player)} />
    ${player.hasBall ? `<circle id="ball-carrier-ring-${escapeXml(player.playerId)}" ${truthAttributes({ layer: playerMarkerLayerName, truthType: "BALL_CARRIER", source: "BallContext", timelineEventId, playerId: player.playerId, teamId: player.teamId, zone: player.zone })} cx="${point.x}" cy="${point.y}" r="15" fill="none" stroke="#facc15" stroke-width="3" />` : ""}
    <text class="player-label" ${truthAttributes({ layer: playerMarkerLayerName, truthType: "PLAYER_INITIALS", source: "PlayerMatchState", timelineEventId, playerId: player.playerId, teamId: player.teamId, zone: player.zone })} data-initials="${escapeXml(player.roleInitials)}" x="${point.x}" y="${point.y + 4}" text-anchor="middle" font-size="8" fill="#ffffff">${player.roleInitials}</text>
    ${intentLabel === "" ? "" : `<text x="${point.x}" y="${point.y + 21}" text-anchor="middle" font-size="7" font-weight="700" fill="#111827">${intentLabel}</text>`}
    ${stateLabel === "" ? "" : `<text x="${point.x + 10}" y="${point.y - 10}" text-anchor="middle" font-size="9" font-weight="700" fill="#111827">${stateLabel}</text>`}
    ${roleIcon}
  </g>`;
}

function renderPerceptionOverlays(players: readonly SnapshotPlayerMarker[], timelineEventId: string): string {
  if (!TACTICAL_EXPLAINABILITY_MODE) {
    return "";
  }

  const sortedPlayers = sortPlayersForRendering(players);

  return sortedPlayers
    .map((player) => {
      const zonePeers = sortedPlayers.filter((candidate) => candidate.zone === player.zone);
      const zoneIndex = zonePeers.findIndex((candidate) => candidate.playerId === player.playerId);
      const point = markerPoint(player, Math.max(0, zoneIndex));
      const angle = ((player.orientationAngle ?? 0) * Math.PI) / 180;
      const coneLength = 18 + player.awarenessRadius * 10;
      const spread = Math.PI / 5;
      const left = {
        x: point.x + Math.cos(angle + spread) * coneLength,
        y: point.y - Math.sin(angle + spread) * coneLength,
      };
      const right = {
        x: point.x + Math.cos(angle - spread) * coneLength,
        y: point.y - Math.sin(angle - spread) * coneLength,
      };
      const confidenceOpacity = Math.max(0.06, Math.min(0.18, player.perceptionConfidence / 650));
      const blindOpacity = Math.max(0.04, Math.min(0.16, player.blindSideExposure / 700));

      return `<g id="perception-${escapeXml(player.playerId)}" ${truthAttributes({ layer: perceptionLayerName, truthType: "VISION_CONE", source: "PerceptionState", timelineEventId, playerId: player.playerId, teamId: player.teamId, zone: player.zone })} data-perception-player-id="${escapeXml(player.playerId)}" data-scan-state="${escapeXml(player.scanningState ?? "NONE")}">
        <polygon id="vision-cone-${escapeXml(player.playerId)}" ${truthAttributes({ layer: perceptionLayerName, truthType: "VISION_CONE", source: "PerceptionState", timelineEventId, playerId: player.playerId, teamId: player.teamId, zone: player.zone })} points="${point.x},${point.y} ${left.x.toFixed(1)},${left.y.toFixed(1)} ${right.x.toFixed(1)},${right.y.toFixed(1)}" fill="#14b8a6" opacity="${confidenceOpacity.toFixed(2)}" stroke="#0f766e" stroke-width="1" stroke-dasharray="3 3">
          <title>${escapeXml(player.roleInitials)} vision cone: facing ${escapeXml(player.facingDirection ?? "NONE")}, confidence ${player.perceptionConfidence}/100, scan ${escapeXml(player.scanningState ?? "NONE")}</title>
        </polygon>
        <circle id="awareness-radius-${escapeXml(player.playerId)}" ${truthAttributes({ layer: perceptionLayerName, truthType: "AWARENESS_RADIUS", source: "PerceptionState", timelineEventId, playerId: player.playerId, teamId: player.teamId, zone: player.zone })} cx="${point.x}" cy="${point.y}" r="${Math.max(16, player.awarenessRadius * 17)}" fill="none" stroke="#0891b2" stroke-width="1" opacity="0.18" stroke-dasharray="2 5">
          <title>${escapeXml(player.roleInitials)} awareness radius ${player.awarenessRadius}, scan freshness ${player.scanFreshnessTicks} tick(s)</title>
        </circle>
        <circle id="blind-side-${escapeXml(player.playerId)}" ${truthAttributes({ layer: perceptionLayerName, truthType: "BLIND_SIDE", source: "PerceptionState", timelineEventId, playerId: player.playerId, teamId: player.teamId, zone: player.zone })} cx="${point.x - Math.cos(angle) * 18}" cy="${point.y + Math.sin(angle) * 18}" r="${6 + player.blindSideExposure / 18}" fill="#f97316" opacity="${blindOpacity.toFixed(2)}">
          <title>${escapeXml(player.roleInitials)} blind-side exposure ${player.blindSideExposure}/100, reaction delay ${player.reactionDelayTicks} tick(s)</title>
        </circle>
      </g>`;
    })
    .join("\n");
}

function renderTrajectoryArrows(players: readonly SnapshotPlayerMarker[], timelineEventId: string): string {
  if (!TACTICAL_EXPLAINABILITY_MODE) {
    return "";
  }

  const sortedPlayers = sortPlayersForRendering(players);

  return sortedPlayers
    .filter((player) => player.trajectoryTargetZone !== null && player.activeTrajectoryId !== null)
    .map((player) => {
      const zonePeers = sortedPlayers.filter((candidate) => candidate.zone === player.zone);
      const zoneIndex = zonePeers.findIndex((candidate) => candidate.playerId === player.playerId);
      const from = markerPoint(player, Math.max(0, zoneIndex));
      const to = cellPoint(player.trajectoryTargetZone ?? player.zone);
      const stroke = player.sprinting ? "#f97316" : player.color === "blue" ? "#1d4ed8" : "#b91c1c";
      const opacity = Math.min(0.9, 0.35 + player.intentUrgency / 170);
      const dash = player.sprinting ? "" : "stroke-dasharray=\"6 4\"";

      return `<line id="trajectory-${escapeXml(player.playerId)}" ${truthAttributes({ layer: trajectoryLayerName, truthType: "TRAJECTORY", source: "PlayerTrajectory", timelineEventId, playerId: player.playerId, teamId: player.teamId, zone: player.zone })} data-trajectory-id="${escapeXml(player.activeTrajectoryId ?? "NONE")}" data-trajectory-player-id="${escapeXml(player.playerId)}" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${stroke}" stroke-width="2" ${dash} opacity="${opacity.toFixed(2)}" marker-end="url(#arrow)">
        <title>${escapeXml(player.roleInitials)} ${escapeXml(player.movementType ?? "REPOSITION")} ${escapeXml(player.zone)} to ${escapeXml(player.trajectoryTargetZone ?? player.zone)}, ETA ${player.estimatedArrivalTick ?? "n/a"}</title>
      </line>`;
    })
    .join("\n");
}

function renderPlayers(players: readonly SnapshotPlayerMarker[], timelineEventId: string): string {
  const sortedPlayers = sortPlayersForRendering(players);

  return sortedPlayers
    .map((player) => {
      const zonePeers = sortedPlayers.filter((candidate) => candidate.zone === player.zone);
      const zoneIndex = zonePeers.findIndex((candidate) => candidate.playerId === player.playerId);

      return renderPlayer(player, Math.max(0, zoneIndex), timelineEventId);
    })
    .join("\n");
}

function renderZoneLabel(input: {
  readonly zoneId: string;
  readonly x: number;
  readonly y: number;
  readonly snapshot: TacticalSnapshot;
}): string {
  const labels = [
    ...(input.snapshot.shortSideZones.includes(input.zoneId) ? ["Short side"] : []),
    ...(input.snapshot.openSideZones.includes(input.zoneId) ? ["Open side"] : []),
    ...(input.snapshot.weakSideZones.includes(input.zoneId) ? ["Weak side"] : []),
  ];

  if (labels.length === 0) {
    return "";
  }

  return `<text x="${input.x + 6}" y="${input.y + CELL_HEIGHT - 7}" font-size="8" fill="#475569">${labels.join(" / ")}</text>`;
}

function renderInfluenceOverlays(snapshot: TacticalSnapshot): string {
  if (!TACTICAL_EXPLAINABILITY_MODE || !SNAPSHOT_TRUTH_CONFIG.showInfluenceBadges) {
    return "";
  }

  return snapshot.metadata.dangerMap
    .filter((zone) => zone.danger >= 55)
    .map((zone) => {
      const point = cellPoint(zone.zone);
      const opacity = Math.min(0.34, 0.08 + zone.danger / 360);

      return `<rect id="danger-${escapeXml(zone.zone)}" ${truthAttributes({ layer: influenceLayerName, truthType: "DANGER_FIELD", source: "DangerMap", timelineEventId: snapshot.metadata.sourceTimelineEventId, zone: zone.zone })} data-danger="${zone.danger}" x="${point.x - CELL_WIDTH / 2 + 3}" y="${point.y - CELL_HEIGHT / 2 + 3}" width="${CELL_WIDTH - 6}" height="${CELL_HEIGHT - 6}" fill="#ef4444" opacity="${opacity.toFixed(2)}" rx="3">
        <title>Danger ${zone.danger}/100 calculated from influence map</title>
      </rect>`;
    })
    .join("\n");
}

function renderPressureOverlays(snapshot: TacticalSnapshot): string {
  if (!TACTICAL_EXPLAINABILITY_MODE || !SNAPSHOT_TRUTH_CONFIG.showInfluenceBadges) {
    return "";
  }

  return snapshot.metadata.pressureMap
    .filter((zone) => zone.pressure >= 60)
    .map((zone) => {
      const point = cellPoint(zone.zone);
      const opacity = Math.min(0.28, 0.06 + zone.pressure / 420);

      return `<circle id="pressure-${escapeXml(zone.zone)}" ${truthAttributes({ layer: influenceLayerName, truthType: "PRESSURE_FIELD", source: "PressureMap", timelineEventId: snapshot.metadata.sourceTimelineEventId, zone: zone.zone })} data-pressure="${zone.pressure}" cx="${point.x}" cy="${point.y}" r="24" fill="#7c3aed" opacity="${opacity.toFixed(2)}">
        <title>Pressure ${zone.pressure}/100 calculated from influence map</title>
      </circle>`;
    })
    .join("\n");
}

function renderDynamicInfluenceOverlays(snapshot: TacticalSnapshot): string {
  if (!TACTICAL_EXPLAINABILITY_MODE || !SNAPSHOT_TRUTH_CONFIG.showInfluenceBadges) {
    return "";
  }

  return snapshot.metadata.dynamicInfluenceField.cells
    .filter((cell) => cell.openness >= 62 || cell.coverShadowValue >= 58 || cell.overloadValue >= 62)
    .map((cell) => {
      const point = cellPoint(cell.zone);
      const fill = cell.overloadValue >= 62 ? "#22c55e" : cell.coverShadowValue >= 58 ? "#0f172a" : "#38bdf8";
      const opacity = Math.min(0.24, 0.05 + Math.max(cell.openness, cell.coverShadowValue, cell.overloadValue) / 520);

      return `<rect id="influence-${escapeXml(cell.zone)}" ${truthAttributes({ layer: influenceLayerName, truthType: "INFLUENCE_FIELD", source: "DynamicInfluenceField", timelineEventId: snapshot.metadata.sourceTimelineEventId, zone: cell.zone })} data-openness="${cell.openness}" data-cover-shadow="${cell.coverShadowValue}" data-overload="${cell.overloadValue}" x="${point.x - CELL_WIDTH / 2 + 10}" y="${point.y - CELL_HEIGHT / 2 + 10}" width="${CELL_WIDTH - 20}" height="${CELL_HEIGHT - 20}" fill="${fill}" opacity="${opacity.toFixed(2)}" rx="14">
        <title>Dynamic influence ${cell.zone}: openness ${cell.openness}/100, cover shadow ${cell.coverShadowValue}/100, overload ${cell.overloadValue}/100, source players ${cell.sourcePlayers.map((player) => player.initials).slice(0, 5).join(", ")}</title>
      </rect>`;
    })
    .join("\n");
}

function renderProjectedArrivalGhosts(snapshot: TacticalSnapshot): string {
  if (!TACTICAL_EXPLAINABILITY_MODE) {
    return "";
  }

  return snapshot.metadata.dynamicInfluenceField.cells
    .flatMap((cell) => cell.projectedArrivalsByTeam)
    .filter((arrival) => arrival.arrivalDeltaTicks <= 3)
    .slice(0, 28)
    .map((arrival, index) => {
      const point = cellPoint(arrival.zone);
      const x = point.x + ((index % 3) - 1) * 12;
      const y = point.y + (Math.floor(index / 3) % 3 - 1) * 10;
      const fill = arrival.teamId === snapshot.possessionTeamId ? "#16a34a" : "#991b1b";

      return `<circle id="projected-arrival-${escapeXml(arrival.playerId)}-${index}" ${truthAttributes({ layer: trajectoryLayerName, truthType: "PROJECTED_ARRIVAL", source: "DynamicInfluenceField", timelineEventId: snapshot.metadata.sourceTimelineEventId, playerId: arrival.playerId, teamId: arrival.teamId, zone: arrival.zone })} cx="${x}" cy="${y}" r="5" fill="${fill}" opacity="0.34" stroke="#111827" stroke-dasharray="2 2">
        <title>Projected arrival ${escapeXml(arrival.playerInitials)} at ${escapeXml(arrival.zone)} in ${arrival.arrivalDeltaTicks} tick(s), ${escapeXml(arrival.movementType)}</title>
      </circle>`;
    })
    .join("\n");
}

function renderSelectedPassingLane(snapshot: TacticalSnapshot): string {
  const lane = snapshot.metadata.passingLaneAnalysis;

  if (!TACTICAL_EXPLAINABILITY_MODE || !SNAPSHOT_TRUTH_CONFIG.showPassingLane || lane === null) {
    return "";
  }

  const from = cellPoint(lane.fromZone);
  const to = cellPoint(lane.toZone);
  const stroke = lane.laneState === "CLOSED" ? "#dc2626" : lane.laneState === "CONTESTED" ? "#f97316" : "#16a34a";

  return `<g id="selected-action-vector" ${truthAttributes({ layer: actionLayerName, truthType: "ACTION_VECTOR", source: "CanonicalActionContext", timelineEventId: snapshot.metadata.sourceTimelineEventId, playerId: lane.fromPlayerId ?? undefined, teamId: snapshot.possessionTeamId, zone: lane.fromZone })} data-primary-actor="${escapeXml(lane.fromPlayerId ?? "")}" data-receiver-id="${escapeXml(lane.toPlayerId ?? "")}" data-action-type="PASS_OR_MOVE" data-from-zone="${escapeXml(lane.fromZone)}" data-to-zone="${escapeXml(lane.toZone)}">
    <line id="selected-passing-lane" ${truthAttributes({ layer: passingLaneLayerName, truthType: "PASSING_LANE", source: "DynamicInfluence.PassingLaneResult", timelineEventId: snapshot.metadata.sourceTimelineEventId, playerId: lane.fromPlayerId ?? undefined, teamId: snapshot.possessionTeamId, zone: lane.toZone })} data-primary-actor="${escapeXml(lane.fromPlayerId ?? "")}" data-receiver-id="${escapeXml(lane.toPlayerId ?? "")}" data-lane-id="${escapeXml(lane.laneId)}" data-lane-state="${escapeXml(lane.laneState)}" data-openness="${lane.openness}" data-pressure="${lane.pressure}" data-interception-risk="${lane.interceptionRisk}" data-timing-window="${lane.timingWindowTicks}" data-source-defenders="${escapeXml(lane.sourceDefenders.join("; "))}" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${stroke}" stroke-width="3" stroke-dasharray="8 4" marker-end="url(#arrow)" opacity="0.82">
      <title>Passing lane ${lane.fromZone} to ${lane.toZone}: ${lane.laneState}, openness ${lane.openness}/100, pressure ${lane.pressure}/100, interception risk ${lane.interceptionRisk}/100</title>
    </line>
    <text x="${(from.x + to.x) / 2}" y="${(from.y + to.y) / 2 - 8}" text-anchor="middle" font-size="9" font-weight="700" fill="${stroke}">${lane.laneState} / risk ${lane.interceptionRisk}</text>
  </g>`;
}

function parseOverloadNumbers(numbers: string): { readonly attackers: number; readonly defenders: number } {
  const match = /^(\d+(?:\.\d+)?)v(\d+(?:\.\d+)?)$/.exec(numbers.trim());

  if (match === null) {
    return { attackers: 0, defenders: 0 };
  }

  return {
    attackers: Number.parseFloat(match[1] ?? "0"),
    defenders: Number.parseFloat(match[2] ?? "0"),
  };
}

function renderOverloadWindows(snapshot: TacticalSnapshot): string {
  if (!TACTICAL_EXPLAINABILITY_MODE || !SNAPSHOT_TRUTH_CONFIG.showOverloadCounts) {
    return "";
  }

  return snapshot.metadata.overloadWindows
    .slice(0, 6)
    .map((window) => {
      const point = cellPoint(window.zone);
      const current = parseOverloadNumbers(window.currentNumbers);
      const projected = parseOverloadNumbers(window.projectedNumbers);

      return `<g id="overload-${escapeXml(window.zone)}" ${truthAttributes({ layer: overloadLayerName, truthType: "OVERLOAD", source: "DynamicInfluence.OverloadWindow", timelineEventId: snapshot.metadata.sourceTimelineEventId, zone: window.zone })} data-overload-zone="${escapeXml(window.zone)}" data-attackers-now="${current.attackers}" data-defenders-now="${current.defenders}" data-attackers-arriving="${Math.max(0, projected.attackers - current.attackers)}" data-defenders-arriving="${Math.max(0, projected.defenders - current.defenders)}" data-effective-advantage="${window.effectiveAdvantage}" data-window-ticks="${window.windowTicks}">
        <rect x="${point.x - 32}" y="${point.y - 23}" width="64" height="24" rx="4" fill="#ecfccb" stroke="#65a30d" stroke-width="1.5" opacity="0.92" />
        <text x="${point.x}" y="${point.y - 8}" text-anchor="middle" font-size="8" font-weight="700" fill="#365314">${escapeXml(window.currentNumbers)} now</text>
        <text x="${point.x}" y="${point.y}" text-anchor="middle" font-size="7" fill="#365314">eff +${window.effectiveAdvantage} / ${window.windowTicks}t</text>
        <title>Overload ${escapeXml(window.zone)}: current ${escapeXml(window.currentNumbers)}, projected ${escapeXml(window.projectedNumbers)}, effective advantage ${window.effectiveAdvantage}, window ${window.windowTicks} tick(s)</title>
      </g>`;
    })
    .join("\n");
}

function renderTargetInfluenceBadge(snapshot: TacticalSnapshot): string {
  if (!TACTICAL_EXPLAINABILITY_MODE || !SNAPSHOT_TRUTH_CONFIG.showInfluenceBadges) {
    return "";
  }

  const targetZone = snapshot.selectedTargetZone ?? snapshot.metadata.passingLaneAnalysis?.toZone ?? snapshot.ballZone;
  const cell = snapshot.metadata.dynamicInfluenceField.cells.find((candidate) => candidate.zone === targetZone);

  if (cell === undefined) {
    return "";
  }

  const point = cellPoint(targetZone);
  const attackingControl = getTeamValue(cell.controlValueByTeam, snapshot.metadata.dynamicInfluenceField.attackingTeamId);
  const defensiveControl = getTeamValue(cell.controlValueByTeam, snapshot.metadata.dynamicInfluenceField.defendingTeamId);
  const defensivePressure = getTeamValue(cell.pressureByTeam, snapshot.metadata.dynamicInfluenceField.defendingTeamId);
  const danger = getTeamValue(cell.dangerByTeam, snapshot.metadata.dynamicInfluenceField.attackingTeamId);

  return `<g id="target-influence-badge" ${truthAttributes({ layer: influenceLayerName, truthType: "INFLUENCE_FIELD", source: "DynamicInfluenceField", timelineEventId: snapshot.metadata.sourceTimelineEventId, teamId: snapshot.possessionTeamId, zone: targetZone })} data-attacking-control="${attackingControl}" data-defensive-control="${defensiveControl}" data-openness="${cell.openness}" data-pressure="${defensivePressure}" data-danger="${danger}" data-source-players="${escapeXml(cell.sourcePlayers.map((player) => player.playerId).join(";"))}">
    <rect x="${point.x - 42}" y="${point.y + 16}" width="84" height="24" rx="4" fill="#f8fafc" stroke="#0f172a" opacity="0.94" />
    <text x="${point.x}" y="${point.y + 26}" text-anchor="middle" font-size="7" font-weight="700" fill="#0f172a">ctrl ${attackingControl}/${defensiveControl}</text>
    <text x="${point.x}" y="${point.y + 36}" text-anchor="middle" font-size="7" fill="#0f172a">open ${cell.openness} press ${defensivePressure}</text>
    <title>Target influence ${escapeXml(targetZone)}: attacking control ${attackingControl}, defensive control ${defensiveControl}, openness ${cell.openness}, pressure ${defensivePressure}, danger ${danger}</title>
  </g>`;
}

function renderSupportTriangle(snapshot: TacticalSnapshot): string {
  const triangle = snapshot.metadata.supportTriangle;

  if (!TACTICAL_EXPLAINABILITY_MODE || triangle.supportZones.length < 2) {
    return "";
  }

  const points = [triangle.carrierZone, ...triangle.supportZones.slice(0, 2)]
    .map((zone) => {
      const point = cellPoint(zone);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  return `<polygon id="support-triangle" ${truthAttributes({ layer: actionLayerName, truthType: "SUPPORT_TRIANGLE", source: "SupportGeometry", timelineEventId: snapshot.metadata.sourceTimelineEventId, zone: triangle.carrierZone })} points="${points}" fill="#22c55e" opacity="0.12" stroke="#16a34a" stroke-width="2" stroke-dasharray="5 4">
    <title>Support triangle ${triangle.connected ? "connected" : "not connected"}, calculated from influence map</title>
  </polygon>`;
}

function renderRecoveryVectors(snapshot: TacticalSnapshot): string {
  if (!TACTICAL_EXPLAINABILITY_MODE || !SNAPSHOT_TRUTH_CONFIG.showRecoveryVectors) {
    return "";
  }

  return snapshot.metadata.recoveryVectors
    .map((vector) => {
      const from = cellPoint(vector.from);
      const to = cellPoint(vector.to);
      const opacity = Math.min(0.9, 0.35 + vector.urgency / 180);

      return `<line id="recovery-${escapeXml(vector.playerId)}" ${truthAttributes({ layer: recoveryLayerName, truthType: "RECOVERY_VECTOR", source: "RecoveryVector", timelineEventId: snapshot.metadata.sourceTimelineEventId, playerId: vector.playerId, zone: vector.to })} data-eta-ticks="${vector.etaTicks}" data-arrives-before-ball="${vector.arrivesBeforeBall}" data-arrives-before-attacker="${vector.arrivesBeforeAttacker}" data-blocks-lane="${escapeXml(vector.blocksLane ?? "NONE")}" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="#0f172a" stroke-width="2" stroke-dasharray="3 4" opacity="${opacity.toFixed(2)}" marker-end="url(#arrow)">
        <title>Recovery vector ${vector.from} to ${vector.to}, urgency ${vector.urgency}/100, calculated from influence map</title>
      </line>`;
    })
    .join("\n");
}

function renderGoalFrames(snapshot: TacticalSnapshot): string {
  if (!SNAPSHOT_TRUTH_CONFIG.showGoalFrame) {
    return "";
  }

  function renderFrame(input: {
    readonly id: string;
    readonly zone: string;
    readonly label: string;
  }): string {
    const point = cellPoint(input.zone);
    const x = point.x - GOAL_FRAME_WIDTH / 2;
    const y = point.y - GOAL_FRAME_HEIGHT / 2;

    return `<g id="${input.id}" class="goal-frame" ${truthAttributes({ layer: scoringLayerName, truthType: "GOAL_FRAME", source: "GoalFrame", timelineEventId: snapshot.metadata.sourceTimelineEventId, zone: input.zone })} data-goal-width-meters="8" data-post-height-meters="10" data-crossbar-height-meters="2.5" data-goal-zone="${escapeXml(input.zone)}">
      <rect x="${x}" y="${y}" width="${GOAL_FRAME_WIDTH}" height="${GOAL_FRAME_HEIGHT}" fill="none" stroke="#111827" stroke-width="2" />
      <line x1="${x}" y1="${y + CROSSBAR_OFFSET}" x2="${x + GOAL_FRAME_WIDTH}" y2="${y + CROSSBAR_OFFSET}" stroke="#111827" stroke-width="2" />
      <rect x="${x + 2}" y="${y + CROSSBAR_OFFSET + 1}" width="${GOAL_FRAME_WIDTH - 4}" height="${GOAL_FRAME_HEIGHT - CROSSBAR_OFFSET - 2}" fill="#dbeafe" opacity="0.28" data-truth-type="GOAL_TARGET_BELOW_CROSSBAR" />
      <rect x="${x + 2}" y="${y + 2}" width="${GOAL_FRAME_WIDTH - 4}" height="${CROSSBAR_OFFSET - 3}" fill="#fde68a" opacity="0.22" data-truth-type="DROP_PENALTY_TARGET_ABOVE_CROSSBAR" />
      <text x="${point.x}" y="${y - 4}" text-anchor="middle" font-size="8" font-weight="700" fill="#111827">${escapeXml(input.label)}</text>
      <title>${escapeXml(input.label)} goal frame on in-goal line: below crossbar is goal target, above crossbar is drop/penalty target.</title>
    </g>`;
  }

  return `${renderFrame({ id: "goal-frame-left", zone: "Z0-C", label: "Z0 frame" })}
  ${renderFrame({ id: "goal-frame-right", zone: "Z8-C", label: "Z8 frame" })}`;
}

function renderValidationBadge(snapshot: TacticalSnapshot): string {
  if (!SNAPSHOT_TRUTH_CONFIG.showValidationBadges) {
    return "";
  }

  return `<g id="snapshot-truth-badge" ${truthAttributes({ layer: "validation", truthType: "SNAPSHOT_TRUTH_STATUS", source: "SnapshotTruthContract", timelineEventId: snapshot.metadata.sourceTimelineEventId })}>
    <rect x="${LEFT}" y="42" width="218" height="18" rx="4" fill="#dcfce7" stroke="#16a34a" />
    <text x="${LEFT + 8}" y="55" font-size="10" font-weight="700" fill="#166534">Truth debug: layers, ids, action evidence enabled</text>
  </g>`;
}

export function renderTacticalSnapshotSvg(snapshot: TacticalSnapshot): string {
  const width = LEFT * 2 + ZONES.length * CELL_WIDTH;
  const height = TOP * 2 + LATERAL_CORRIDORS.length * CELL_HEIGHT + 70;
  const sortedPlayers = sortPlayersForRendering(snapshot.players);
  const carrier = sortedPlayers.find((player) => player.hasBall);
  const ball =
    carrier === undefined
      ? cellPoint(snapshot.ballZone)
      : markerPoint(
          carrier,
          Math.max(
            0,
            sortedPlayers
              .filter((player) => player.zone === carrier.zone)
              .findIndex((player) => player.playerId === carrier.playerId),
          ),
        );
  const target =
    snapshot.selectedTargetZone === null ? null : cellPoint(snapshot.selectedTargetZone);
  const directionArrow =
    snapshot.attackingDirection === AttackingDirection.Z1ToZ7
      ? `<line x1="${LEFT}" y1="35" x2="${width - LEFT}" y2="35" stroke="#111827" marker-end="url(#arrow)" /><text x="${width / 2}" y="25" text-anchor="middle" font-size="12">Attacking direction Z1 -> Z7 / grounding target Z8</text>`
      : `<line x1="${width - LEFT}" y1="35" x2="${LEFT}" y2="35" stroke="#111827" marker-end="url(#arrow)" /><text x="${width / 2}" y="25" text-anchor="middle" font-size="12">Attacking direction Z7 -> Z1 / grounding target Z0</text>`;
  const controlInitials = CONTROL_ROSTER.map((player) => player.initials).join(", ");
  const blitzInitials = BLITZ_ROSTER.map((player) => player.initials).join(", ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="#111827" />
    </marker>
  </defs>
  <rect id="snapshot-field" ${truthAttributes({ layer: fieldLayerName, truthType: "FIELD", source: "SnapshotRenderer", timelineEventId: snapshot.metadata.sourceTimelineEventId })} width="100%" height="100%" fill="#f8fafc" />
  <text x="${width / 2}" y="18" text-anchor="middle" font-size="14" font-weight="700">${escapeXml(snapshot.title)}</text>
  <text x="${width / 2}" y="52" text-anchor="middle" font-size="11" fill="#475569">Source tick ${snapshot.metadata.sourceTick} / ${escapeXml(snapshot.metadata.sourceTimelineEventId)} / world ${escapeXml(snapshot.metadata.worldStateHash)} / ball ${escapeXml(snapshot.metadata.ballState)} / possession ${escapeXml(snapshot.metadata.sourcePossessionTeamId)}</text>
  ${renderValidationBadge(snapshot)}
  <g id="action-truth-layer" ${truthAttributes({ layer: actionLayerName, truthType: "ACTION_CONTEXT", source: "CanonicalActionContext", timelineEventId: snapshot.metadata.sourceTimelineEventId, teamId: snapshot.possessionTeamId, zone: snapshot.selectedTargetZone ?? snapshot.ballZone })}></g>
  ${directionArrow}
  ${ZONES.map((zone, zoneIndex) =>
    LATERAL_CORRIDORS.map((lane, laneIndex) => {
      const x = LEFT + zoneIndex * CELL_WIDTH;
      const y = TOP + laneIndex * CELL_HEIGHT;
      const zoneId = `${zone}-${lane}`;
      const weak = snapshot.weakSideZones.includes(zoneId);
      const open = snapshot.openSideZones.includes(zoneId);
      const short = snapshot.shortSideZones.includes(zoneId);
      const selected = snapshot.selectedTargetZone === zoneId;
      const structuralHole = snapshot.metadata.structuralHoles.some((hole) => hole.startsWith(zoneId));
      const inGoal = zone === "Z0" || zone === "Z8";
      const fill = selected ? "#fde68a" : structuralHole ? "#fee2e2" : weak ? "#dcfce7" : open ? "#e0f2fe" : short ? "#f1f5f9" : inGoal ? "#e0e7ff" : "#ffffff";
      const dash = structuralHole ? "stroke-dasharray=\"7 3\"" : weak || open || short ? "stroke-dasharray=\"4 3\"" : "";

      return `<rect id="zone-${escapeXml(zoneId)}" ${truthAttributes({ layer: zoneGridLayerName, truthType: selected ? "SELECTED_TARGET" : "ZONE", source: "ZoneGrid", timelineEventId: snapshot.metadata.sourceTimelineEventId, zone: zoneId })} x="${x}" y="${y}" width="${CELL_WIDTH}" height="${CELL_HEIGHT}" fill="${fill}" stroke="#cbd5e1" ${dash} />
      <text x="${x + 6}" y="${y + 14}" font-size="10" fill="#334155">${zoneId}</text>
      ${structuralHole ? `<text x="${x + CELL_WIDTH - 8}" y="${y + 14}" text-anchor="end" font-size="9" font-weight="700" fill="#b91c1c">hole</text>` : ""}
      ${renderZoneLabel({ zoneId, x, y, snapshot })}`;
    }).join("\n"),
  ).join("\n")}
  ${renderGoalFrames(snapshot)}
  <g id="dynamic-influence-layer" ${truthAttributes({ layer: influenceLayerName, truthType: "INFLUENCE_FIELD", source: "DynamicInfluenceField", timelineEventId: snapshot.metadata.sourceTimelineEventId, teamId: snapshot.possessionTeamId, zone: snapshot.ballZone })}></g>
  ${renderInfluenceOverlays(snapshot)}
  ${renderDynamicInfluenceOverlays(snapshot)}
  ${renderTargetInfluenceBadge(snapshot)}
  ${renderPressureOverlays(snapshot)}
  ${renderSupportTriangle(snapshot)}
  ${renderSelectedPassingLane(snapshot)}
  ${renderRecoveryVectors(snapshot)}
  ${renderOverloadWindows(snapshot)}
  ${renderTrajectoryArrows(snapshot.players, snapshot.metadata.sourceTimelineEventId)}
  ${renderProjectedArrivalGhosts(snapshot)}
  ${renderPerceptionOverlays(snapshot.players, snapshot.metadata.sourceTimelineEventId)}
  ${renderPlayers(snapshot.players, snapshot.metadata.sourceTimelineEventId)}
  <circle id="ball-marker" ${truthAttributes({ layer: ballLayerName, truthType: "BALL", source: "BallState", timelineEventId: snapshot.metadata.sourceTimelineEventId, playerId: carrier?.playerId, teamId: carrier?.teamId ?? snapshot.possessionTeamId, zone: snapshot.ballZone })} data-ball-state="${escapeXml(snapshot.metadata.ballState)}" cx="${ball.x}" cy="${ball.y}" r="6" fill="#facc15" stroke="#111827" stroke-width="2" />
  ${target === null ? "" : `<circle id="selected-target-${escapeXml(snapshot.selectedTargetZone ?? "")}" ${truthAttributes({ layer: actionLayerName, truthType: "SELECTED_TARGET", source: "TargetSelection", timelineEventId: snapshot.metadata.sourceTimelineEventId, teamId: snapshot.possessionTeamId, zone: snapshot.selectedTargetZone ?? undefined })} cx="${target.x}" cy="${target.y}" r="18" fill="none" stroke="#f59e0b" stroke-width="3" />`}
  <g id="snapshot-legend" ${truthAttributes({ layer: legendLayerName, truthType: "LEGEND", source: "SnapshotRenderer", timelineEventId: snapshot.metadata.sourceTimelineEventId })}>
  <text x="${LEFT}" y="${height - 78}" font-size="11" fill="#111827">Player-derived: ${escapeXml(snapshot.metadata.playerDerivedNumerical)}.</text>
  <text x="${LEFT}" y="${height - 66}" font-size="11" fill="#111827">Structural laws: rest defense ${snapshot.metadata.attackingStructuralLaws.restDefenseSlots}, attack corridors ${snapshot.metadata.attackingStructuralLaws.attackCorridorTarget}/5, defensive corridors ${snapshot.metadata.defendingStructuralLaws.defensiveCorridorTarget}, cover shadow ${snapshot.metadata.defendingStructuralLaws.coverShadow}.</text>
  <text x="${LEFT}" y="${height - 54}" font-size="11" fill="#111827">Structural distortion: attack ${snapshot.metadata.attackingDistortion.level} (${snapshot.metadata.attackingDistortion.score}/100), defense ${snapshot.metadata.defendingDistortion.level} (${snapshot.metadata.defendingDistortion.score}/100).</text>
  <text x="${LEFT}" y="${height - 46}" font-size="10" fill="#111827">Influence overlays: red danger, purple pressure, green support triangle, dashed passing lane, overload badges, black recovery vectors, orange/blue/red trajectory arrows, green/blue/dark dynamic influence fields, ghost projected arrivals, teal vision cones, cyan awareness rings, orange blind-side exposure, goal-frame targets.</text>
  <text x="${LEFT}" y="${height - 38}" font-size="11" fill="#111827">Legend: blue CONTROL (${escapeXml(controlInitials)}), red BLITZ (${escapeXml(blitzInitials)}), yellow ball marker, amber target, red holes, D delayed, R recovering, E eliminated, S supporting, P pressing, C covering, solid arrow sprint, dashed arrow projected movement, teal cone facing/vision.</text>
  <text x="${LEFT}" y="${height - 20}" font-size="11" fill="#475569">${escapeXml(snapshot.legend)}</text>
  </g>
</svg>
`;
}
