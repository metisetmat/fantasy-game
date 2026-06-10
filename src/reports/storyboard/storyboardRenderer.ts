import type { PlayerMatchState } from "../../systems/players";
import type { SnapshotReference } from "../visualization";
import type { FocusVisualPlan, TacticalFocus } from "../focus";
import { TACTICAL_STORYBOARD_CONFIG } from "./storyboardConfig";
import {
  STORYBOARD_CELL_HEIGHT,
  STORYBOARD_CELL_WIDTH,
  STORYBOARD_LEFT,
  STORYBOARD_TOP,
  STORYBOARD_ZONES,
  storyboardCellPoint,
  storyboardMarkerPoint,
} from "./storyboardLayout";
import type {
  StoryboardAnalysisBoard,
  StoryboardCamera,
  StoryboardKeyActor,
  StoryboardRankedOption,
  StoryboardTacticalFacts,
  TacticalStoryboardPage,
} from "./tacticalStoryboard";

interface CameraBounds {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fillForTeam(teamId: string): string {
  return teamId === "control" ? "#2563eb" : "#dc2626";
}

function cameraBounds(camera: StoryboardCamera): CameraBounds {
  const [xText, yText, widthText, heightText] = camera.viewBox.split(" ");

  return {
    x: Number.parseFloat(xText ?? "0"),
    y: Number.parseFloat(yText ?? "0"),
    width: Number.parseFloat(widthText ?? "960"),
    height: Number.parseFloat(heightText ?? "520"),
  };
}

function rectIntersectsCamera(input: {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly camera: CameraBounds;
}): boolean {
  return (
    input.x + input.width >= input.camera.x &&
    input.x <= input.camera.x + input.camera.width &&
    input.y + input.height >= input.camera.y &&
    input.y <= input.camera.y + input.camera.height
  );
}

function isKeyActor(player: PlayerMatchState, keyActors: readonly StoryboardKeyActor[]): boolean {
  return keyActors.some((actor) => actor.playerId === player.playerId);
}

function keyActorReason(player: PlayerMatchState, keyActors: readonly StoryboardKeyActor[]): string | null {
  return keyActors.find((actor) => actor.playerId === player.playerId)?.reason ?? null;
}

function labelPlayerIds(input: {
  readonly players: readonly PlayerMatchState[];
  readonly keyActors: readonly StoryboardKeyActor[];
  readonly visualPlan: FocusVisualPlan;
}): ReadonlySet<string> {
  const ordered = [
    ...input.visualPlan.primaryPlayerIds,
    ...input.visualPlan.secondaryPlayerIds,
    ...input.keyActors.map((actor) => actor.playerId),
    ...input.players.filter((player) => player.hasBall).map((player) => player.playerId),
  ];
  const ids: string[] = [];

  for (const playerId of ordered) {
    if (!ids.includes(playerId)) {
      ids.push(playerId);
    }
  }

  return new Set(ids.slice(0, TACTICAL_STORYBOARD_CONFIG.maxOnFieldLabels));
}

function renderGrid(camera: StoryboardCamera): string {
  const bounds = cameraBounds(camera);
  const zones = STORYBOARD_ZONES.flatMap((zone, zoneIndex) =>
    ["CL", "HSL", "C", "HSR", "CR"].flatMap((lane, laneIndex) => {
      const zoneId = `${zone}-${lane}`;
      const x = STORYBOARD_LEFT + zoneIndex * STORYBOARD_CELL_WIDTH;
      const y = STORYBOARD_TOP + laneIndex * STORYBOARD_CELL_HEIGHT;
      const centerX = x + STORYBOARD_CELL_WIDTH / 2;
      const centerY = y + STORYBOARD_CELL_HEIGHT / 2;

      if (
        centerX < bounds.x ||
        centerX > bounds.x + bounds.width ||
        centerY < bounds.y ||
        centerY > bounds.y + bounds.height
      ) {
        return [];
      }

      const inGoal = zone === "Z0" || zone === "Z8";
      const fill = inGoal ? "#e0e7ff" : "#ffffff";
      const label = camera.includedZones.includes(zoneId) || camera.focusZone === zoneId
        ? `<text data-zone-label="true" x="${x + 7}" y="${y + 18}" font-size="${TACTICAL_STORYBOARD_CONFIG.minZoneLabelFontSize}" fill="#64748b">${zoneId}</text>`
        : "";

      return [`<rect id="storyboard-zone-${zoneId}" data-layer="zone-grid" data-storyboard-layer="zone-grid" data-zone="${zoneId}" x="${x}" y="${y}" width="${STORYBOARD_CELL_WIDTH}" height="${STORYBOARD_CELL_HEIGHT}" fill="${fill}" stroke="#cbd5e1" />
      ${label}`];
    }),
  );

  return `<g id="storyboard-grid" data-layer="zone-grid" data-camera-key="${escapeXml(camera.cameraKey)}">${zones.join("\n")}</g>`;
}

function renderGoalFrames(camera: StoryboardCamera, forceShow: boolean): string {
  const bounds = cameraBounds(camera);
  const frames = [
    { id: "storyboard-goal-frame-left", point: storyboardCellPoint("Z0-C") },
    { id: "storyboard-goal-frame-right", point: storyboardCellPoint("Z8-C") },
  ];

  return frames
    .filter((frame) =>
      forceShow ||
      (frame.point.x >= bounds.x &&
        frame.point.x <= bounds.x + bounds.width &&
        frame.point.y >= bounds.y &&
        frame.point.y <= bounds.y + bounds.height),
    )
    .map(
      (frame) => `<g id="${frame.id}" class="goal-frame" data-layer="scoring" data-truth-type="goal-frame">
      <rect x="${frame.point.x - 24}" y="${frame.point.y - 22}" width="48" height="44" fill="none" stroke="#111827" stroke-width="3" />
      <line x1="${frame.point.x - 24}" y1="${frame.point.y + 9}" x2="${frame.point.x + 24}" y2="${frame.point.y + 9}" stroke="#111827" stroke-width="3" />
    </g>`,
    )
    .join("\n");
}

function focusLabel(category: string): string {
  return category.replace(/_/g, " ").slice(0, 24);
}

function renderInfluenceCue(input: {
  readonly facts: StoryboardTacticalFacts;
  readonly focus: TacticalFocus;
  readonly visualPlan: FocusVisualPlan;
}): string {
  if (!input.visualPlan.showDangerCue) {
    return "";
  }

  const zone = input.visualPlan.focusZone ?? input.facts.dangerZone ?? input.facts.overloadZone ?? input.facts.selectedTargetZone;

  if (zone === null) {
    return "";
  }

  const point = storyboardCellPoint(zone);

  return `<g id="storyboard-focus-cue" data-layer="focus-cue" data-storyboard-layer="focus-cue" data-truth-type="focus-zone" data-focus-category="${escapeXml(input.focus.category)}" data-zone="${escapeXml(zone)}">
    <circle cx="${point.x}" cy="${point.y}" r="40" fill="#f97316" opacity="0.13" />
    <circle cx="${point.x}" cy="${point.y}" r="29" fill="none" stroke="#f97316" stroke-width="5" stroke-dasharray="7 5" />
    <text data-major-label="focus" x="${point.x}" y="${point.y - 36}" text-anchor="middle" font-size="14" font-weight="700" fill="#c2410c">${escapeXml(focusLabel(input.focus.category))}</text>
  </g>`;
}

function renderActionLane(input: {
  readonly facts: StoryboardTacticalFacts;
  readonly snapshot: SnapshotReference;
  readonly visualPlan: FocusVisualPlan;
}): string {
  if (!input.visualPlan.showActionLane) {
    return "";
  }

  const actor = input.facts.primaryActor ?? input.facts.ballCarrier;
  const targetZone = input.facts.selectedTargetZone ?? input.facts.receiver?.zone ?? null;

  if (actor === null || targetZone === null) {
    return "";
  }

  const from = storyboardCellPoint(actor.zone);
  const to = storyboardCellPoint(targetZone);
  const laneState = input.facts.passingLaneState ?? "WATCH";
  const stroke = laneState === "OPEN" ? "#16a34a" : laneState === "CLOSED" ? "#dc2626" : "#f97316";
  const label = laneState === "OPEN" ? "lane opens" : laneState === "CLOSED" ? "lane closes" : "lane contested";

  return `<g id="storyboard-selected-action" data-layer="primary-action" data-storyboard-layer="primary-action" data-truth-type="selected-action" data-primary-actor="${escapeXml(actor.playerId)}" data-target-zone="${escapeXml(targetZone)}" data-lane-state="${escapeXml(laneState)}" data-timeline-event-id="${escapeXml(input.snapshot.sourceTimelineEventId)}">
    <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${stroke}" stroke-width="7" stroke-linecap="round" marker-end="url(#storyboard-arrow)" opacity="0.92" />
    <text data-major-label="action" x="${(from.x + to.x) / 2}" y="${(from.y + to.y) / 2 - 14}" text-anchor="middle" font-size="16" font-weight="700" fill="${stroke}">${escapeXml(label)}</text>
  </g>`;
}

function renderRecoveryCues(input: {
  readonly snapshot: SnapshotReference;
  readonly visualPlan: FocusVisualPlan;
}): string {
  if (!input.visualPlan.showRecovery) {
    return "";
  }

  return input.snapshot.afterMetadata.recoveryVectors
    .slice(0, 1)
    .map((vector) => {
      const from = storyboardCellPoint(vector.from);
      const to = storyboardCellPoint(vector.to);

      return `<g id="storyboard-recovery-${escapeXml(vector.playerId)}" data-layer="recovery" data-storyboard-layer="recovery" data-truth-type="recovery-vector" data-player-id="${escapeXml(vector.playerId)}">
        <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="#0f172a" stroke-width="4" stroke-dasharray="7 6" marker-end="url(#storyboard-arrow)" opacity="0.68" />
        <text data-major-label="recovery" x="${(from.x + to.x) / 2}" y="${(from.y + to.y) / 2 + 18}" text-anchor="middle" font-size="14" font-weight="700" fill="#0f172a">late</text>
      </g>`;
    })
    .join("\n");
}

function hasVisibilityOffset(input: {
  readonly player: PlayerMatchState;
  readonly players: readonly PlayerMatchState[];
}): boolean {
  return input.players.filter((player) => player.zone === input.player.zone).length > 1;
}

function intentAbbreviation(player: PlayerMatchState): string {
  return player.primaryIntent?.type.split("_").map((part) => part[0]).join("") ?? "";
}

function renderTrajectoryAndProjection(input: {
  readonly player: PlayerMatchState;
  readonly players: readonly PlayerMatchState[];
  readonly labelled: boolean;
  readonly renderProjection: boolean;
}): string {
  if (!input.renderProjection) {
    return "";
  }

  const targetZone = input.player.activeTrajectory?.targetZone ?? input.player.intentTargetZone;
  if (targetZone === null || targetZone === input.player.zone) {
    return "";
  }

  const from = storyboardMarkerPoint({ player: input.player, players: input.players });
  const to = storyboardCellPoint(targetZone);
  const fill = fillForTeam(input.player.teamId);
  const opacity = 0.42;
  const projectionLabel = input.labelled
    ? `<text x="${to.x}" y="${to.y + 4}" text-anchor="middle" font-size="12" font-weight="700" fill="${fill}" opacity="0.62">${escapeXml(input.player.roleInitials)} proj</text>`
    : "";

  return `<g id="storyboard-trajectory-${escapeXml(input.player.playerId)}" data-layer="trajectory" data-truth-type="trajectory" data-player-id="${escapeXml(input.player.playerId)}" data-real-zone="${escapeXml(input.player.zone)}" data-projected-zone="${escapeXml(targetZone)}">
      <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${fill}" stroke-width="4" stroke-dasharray="8 7" opacity="${opacity}" marker-end="url(#storyboard-arrow)" />
    </g>
    <g id="storyboard-projected-${escapeXml(input.player.playerId)}" data-layer="projected-player" data-truth-type="projected-player-position" data-player-id="${escapeXml(input.player.playerId)}" data-team-id="${escapeXml(input.player.teamId)}" data-role="${escapeXml(input.player.role)}" data-real-zone="${escapeXml(input.player.zone)}" data-rendered-zone="${escapeXml(targetZone)}" data-projected-zone="${escapeXml(targetZone)}" data-position-source="PROJECTED">
      <circle cx="${to.x}" cy="${to.y}" r="10" fill="#ffffff" stroke="${fill}" stroke-width="3" stroke-dasharray="5 4" opacity="${opacity}" />
      ${projectionLabel}
    </g>`;
}

function renderPlayers(input: {
  readonly players: readonly PlayerMatchState[];
  readonly keyActors: readonly StoryboardKeyActor[];
  readonly visualPlan: FocusVisualPlan;
}): string {
  const labels = labelPlayerIds(input);

  return [...input.players]
    .sort((left, right) => left.teamId.localeCompare(right.teamId) || left.playerId.localeCompare(right.playerId))
    .map((player) => {
      const anchor = storyboardCellPoint(player.zone);
      const point = storyboardMarkerPoint({ player, players: input.players });
      const key = isKeyActor(player, input.keyActors);
      const primary = input.visualPlan.primaryPlayerIds.includes(player.playerId);
      const secondary = input.visualPlan.secondaryPlayerIds.includes(player.playerId);
      const fill = fillForTeam(player.teamId);
      const labelOpacity = primary ? 1 : secondary ? 0.82 : key || !TACTICAL_STORYBOARD_CONFIG.dimNonKeyPlayers ? 0.62 : 0.36;
      const radius = primary ? 20 : secondary ? 17 : 11;
      const reason = keyActorReason(player, input.keyActors);
      const stroke = player.hasBall ? "#facc15" : primary ? "#111827" : secondary ? "#475569" : "#cbd5e1";
      const strokeWidth = player.hasBall ? 6 : primary ? 5 : secondary ? 3 : 1;
      const offset = hasVisibilityOffset({ player, players: input.players });
      const labelled = labels.has(player.playerId);
      const renderProjection = primary || secondary || key || player.hasBall;
      const projectedZone = renderProjection ? player.activeTrajectory?.targetZone ?? player.intentTargetZone ?? "" : "";
      const leaderLine = offset
        ? `<line id="storyboard-leader-${escapeXml(player.playerId)}" data-layer="leader-line" data-truth-type="offset-leader-line" data-player-id="${escapeXml(player.playerId)}" x1="${anchor.x}" y1="${anchor.y}" x2="${point.x}" y2="${point.y}" stroke="#64748b" stroke-width="2" stroke-dasharray="3 3" opacity="0.55" />`
        : "";
      const initials = labelled
        ? `<text data-major-label="player" data-player-label="initials" x="${point.x}" y="${point.y + 6}" text-anchor="middle" font-size="${TACTICAL_STORYBOARD_CONFIG.minPlayerLabelFontSize}" font-weight="800" fill="#ffffff" opacity="${labelOpacity}">${escapeXml(player.roleInitials)}</text>`
        : "";
      const intentLabel =
        labelled && primary && player.primaryIntent !== null
          ? `<text data-major-label="intent" x="${point.x}" y="${point.y + 31}" text-anchor="middle" font-size="13" font-weight="700" fill="#111827">${escapeXml(intentAbbreviation(player))}</text>`
          : "";
      const trajectory = renderTrajectoryAndProjection({
        player,
        players: input.players,
        labelled,
        renderProjection,
      });

      return `${trajectory}
      ${leaderLine}
      <g id="storyboard-player-${escapeXml(player.playerId)}" data-layer="player" data-storyboard-layer="player" data-truth-type="real-player-position" data-player-id="${escapeXml(player.playerId)}" data-team-id="${escapeXml(player.teamId)}" data-role="${escapeXml(player.role)}" data-real-zone="${escapeXml(player.zone)}" data-rendered-zone="${escapeXml(player.zone)}" data-projected-zone="${escapeXml(projectedZone)}" data-position-source="${offset ? "OFFSET_FOR_VISIBILITY" : "REAL"}" data-key-actor="${key ? "true" : "false"}" data-key-reason="${escapeXml(reason ?? "context")}">
        <circle cx="${point.x}" cy="${point.y}" r="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="1" />
        ${initials}
        ${intentLabel}
      </g>`;
    })
    .join("\n");
}

function renderBall(facts: StoryboardTacticalFacts, players: readonly PlayerMatchState[]): string {
  const carrier = facts.ballCarrier;

  if (carrier === null) {
    return "";
  }

  const point = storyboardMarkerPoint({ player: carrier, players });

  return `<circle id="storyboard-ball" data-layer="ball" data-truth-type="ball-carrier" data-player-id="${escapeXml(carrier.playerId)}" cx="${point.x + 23}" cy="${point.y - 21}" r="10" fill="#facc15" stroke="#111827" stroke-width="3" />`;
}

function cameraTextPoint(camera: StoryboardCamera): { readonly x: number; readonly y: number } {
  const bounds = cameraBounds(camera);

  return {
    x: bounds.x + 18,
    y: bounds.y + 30,
  };
}

function shortDeltaLabel(category: string): string {
  switch (category) {
    case "WEAK_SIDE_ATTACK":
      return "weak side opens";
    case "OVERLOAD_CREATION":
      return "overload changes";
    case "DELAYED_RECOVERY":
      return "recovery late";
    case "FINISHING_WINDOW":
      return "finish window";
    case "PRESS_BREAK":
      return "press breaks";
    default:
      return "shape changes";
  }
}

export function renderStoryboardFrameSvg(input: {
  readonly title: string;
  readonly snapshot: SnapshotReference;
  readonly frame: "before" | "after";
  readonly facts: StoryboardTacticalFacts;
  readonly keyActors: readonly StoryboardKeyActor[];
  readonly camera: StoryboardCamera;
  readonly focus: TacticalFocus;
  readonly visualPlan: FocusVisualPlan;
}): string {
  const metadata = input.frame === "before" ? input.snapshot.beforeMetadata : input.snapshot.afterMetadata;
  const players = metadata.playerStates;
  const fullWidth = STORYBOARD_LEFT * 2 + STORYBOARD_ZONES.length * STORYBOARD_CELL_WIDTH;
  const fullHeight = STORYBOARD_TOP * 2 + 5 * STORYBOARD_CELL_HEIGHT;
  const titlePoint = cameraTextPoint(input.camera);
  const title = input.title.replace("Sequence ", "Seq ");
  const forceGoalFrame = input.snapshot.afterTruthContract.selectedActionType?.includes("FINISHING") ?? false;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${TACTICAL_STORYBOARD_CONFIG.storyboardSvgWidth}" height="${TACTICAL_STORYBOARD_CONFIG.storyboardSvgHeight}" viewBox="${input.camera.viewBox}" data-storyboard-frame="${input.frame}" data-camera-mode="${input.camera.mode}" data-camera-key="${escapeXml(input.camera.cameraKey)}" data-field-width-ratio="${TACTICAL_STORYBOARD_CONFIG.fieldWidthRatio}" data-source-tick="${metadata.sourceTick}" data-timeline-event-id="${escapeXml(metadata.sourceTimelineEventId)}">
  <defs>
    <marker id="storyboard-arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#111827" />
    </marker>
  </defs>
  <rect id="storyboard-field-bg" data-layer="field" data-truth-type="field" x="0" y="0" width="${fullWidth}" height="${fullHeight}" fill="#f8fafc" />
  ${renderGrid(input.camera)}
  ${renderGoalFrames(input.camera, forceGoalFrame)}
  ${renderInfluenceCue({ facts: input.facts, focus: input.focus, visualPlan: input.visualPlan })}
  ${renderActionLane({ facts: input.facts, snapshot: input.snapshot, visualPlan: input.visualPlan })}
  ${renderRecoveryCues({ snapshot: input.snapshot, visualPlan: input.visualPlan })}
  ${renderPlayers({ players, keyActors: input.keyActors, visualPlan: input.visualPlan })}
  ${renderBall(input.facts, players)}
  ${
    input.frame === "after"
      ? `<g id="storyboard-delta" data-layer="delta" data-storyboard-layer="delta" data-focus-category="${escapeXml(input.focus.category)}"><rect x="${titlePoint.x}" y="${titlePoint.y + 28}" width="170" height="28" rx="6" fill="#fff7ed" stroke="#f97316" /><text data-major-label="delta" x="${titlePoint.x + 10}" y="${titlePoint.y + 47}" font-size="15" font-weight="700" fill="#9a3412">${escapeXml(shortDeltaLabel(input.focus.category))}</text></g>`
      : ""
  }
  <text data-title="true" x="${titlePoint.x}" y="${titlePoint.y}" font-size="${TACTICAL_STORYBOARD_CONFIG.minTitleFontSize}" font-weight="800" fill="#0f172a">${escapeXml(title)}</text>
</svg>
`;
}

function bulletList(items: readonly string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

function renderBoardList(items: readonly string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

function renderRankedOptionRow(option: StoryboardRankedOption): string {
  const rank = option.selected ? `**${option.rank}**` : `${option.rank}`;
  const action = option.selected ? `**${option.actionType}**` : option.actionType;
  const score = option.selected ? `**${option.score}**` : option.score;
  const override = option.overrideReason === null ? "" : ` Override: ${option.overrideReason}.`;

  return `| ${rank} | ${option.fromZone} | ${option.toZone} | ${action} | ${option.legal} | ${option.lane} | ${option.receiver} | ${score} | ${option.why}${override} |`;
}

function renderRankedOptions(options: readonly StoryboardRankedOption[]): string {
  return [
    "| Rank | From | To | Action | Legal | Lane | Receiver | Score | Why |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...options.map(renderRankedOptionRow),
  ].join("\n");
}

function renderAnalysisBoard(board: StoryboardAnalysisBoard): string {
  return [
    "## Tactical Analysis Board",
    "",
    "### Action Context",
    renderBoardList(board.actionContext),
    "",
    "### Attacking Spatial Reading",
    renderBoardList(board.attackingSpatialReading),
    "",
    "### Ranked Options",
    renderRankedOptions(board.rankedOptions),
    "",
    "### Tactical Reading",
    renderBoardList(board.tacticalReading),
  ].join("\n");
}

export function renderStoryboardMarkdown(page: TacticalStoryboardPage): string {
  return [
    `# ${page.title}`,
    "",
    `Source timeline event: \`${page.sourceSnapshot.sourceTimelineEventId}\``,
    `Camera: \`${page.beforeFrame.camera.mode}\` / \`${page.beforeFrame.camera.cameraKey}\``,
    `Primary focus: \`${page.focus.category}\` - ${page.focus.tacticalTension}`,
    "",
    renderAnalysisBoard(page.analysisBoard),
    "",
    "## Before",
    `![Before tactical storyboard](${page.beforeFrame.svgFileName})`,
    "",
    "### Before Narrative",
    bulletList(page.beforeNarrative),
    "",
    "## After",
    `![After tactical storyboard](${page.afterFrame.svgFileName})`,
    "",
    "### After Narrative",
    bulletList(page.afterNarrative),
    "",
    "## AI Tactical Analysis",
    bulletList(page.aiTacticalAnalysis),
    "",
    "### Visual Legend",
    bulletList(page.visualLegend),
    "",
    "### Debug Links",
    `- debug snapshot before: ../${page.sourceSnapshot.beforePath}`,
    `- debug snapshot after: ../${page.sourceSnapshot.afterPath}`,
    `- timeline event: \`${page.sourceSnapshot.sourceTimelineEventId}\``,
    "",
  ].join("\n");
}
