import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { PlayerMatchState } from "../../systems/players";
import type { SnapshotReference } from "../visualization";

type AlignmentStatus = "PASS" | "FAIL";

interface SvgPlayerMarker {
  readonly playerId: string;
  readonly teamId: string;
  readonly role: string;
  readonly realZone: string;
  readonly renderedZone: string;
  readonly projectedZone: string | null;
  readonly positionSource: string;
}

interface AlignmentRow {
  readonly snapshotId: string;
  readonly playerId: string;
  readonly initials: string;
  readonly reportZone: string;
  readonly realZone: string;
  readonly renderedZone: string;
  readonly projectedZone: string | null;
  readonly status: AlignmentStatus;
  readonly reason: string;
}

export interface WorldStateVisualAlignmentResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly rows: readonly AlignmentRow[];
}

function attr(group: string, name: string): string {
  return new RegExp(`${name}="([^"]*)"`).exec(group)?.[1] ?? "";
}

function parseSvgPlayerMarkers(svg: string): readonly SvgPlayerMarker[] {
  const groupPattern = /<g id="storyboard-player-[^"]+"[^>]*>/g;
  const markers: SvgPlayerMarker[] = [];
  let match = groupPattern.exec(svg);

  while (match !== null) {
    const group = match[0] ?? "";
    const projectedZone = attr(group, "data-projected-zone");
    markers.push({
      playerId: attr(group, "data-player-id"),
      teamId: attr(group, "data-team-id"),
      role: attr(group, "data-role"),
      realZone: attr(group, "data-real-zone"),
      renderedZone: attr(group, "data-rendered-zone"),
      projectedZone: projectedZone.length === 0 ? null : projectedZone,
      positionSource: attr(group, "data-position-source"),
    });
    match = groupPattern.exec(svg);
  }

  return markers;
}

function validateMarker(input: {
  readonly svg: string;
  readonly snapshotId: string;
  readonly player: PlayerMatchState;
  readonly marker: SvgPlayerMarker | undefined;
}): AlignmentRow {
  if (input.marker === undefined) {
    return {
      snapshotId: input.snapshotId,
      playerId: input.player.playerId,
      initials: input.player.roleInitials,
      reportZone: input.player.zone,
      realZone: "missing",
      renderedZone: "missing",
      projectedZone: null,
      status: "FAIL",
      reason: "missing real player marker",
    };
  }

  const projectedRequiresGhost =
    input.marker.projectedZone !== null && input.marker.projectedZone !== input.player.zone
      ? input.svg.includes(`id="storyboard-projected-${input.player.playerId}"`)
      : true;
  const offsetRequiresLeader =
    input.marker.positionSource === "OFFSET_FOR_VISIBILITY"
      ? input.svg.includes(`id="storyboard-leader-${input.player.playerId}"`)
      : true;
  const errors = [
    ...(input.marker.realZone === input.player.zone ? [] : [`real zone ${input.marker.realZone} differs from PlayerMatchState ${input.player.zone}`]),
    ...(input.marker.renderedZone === input.player.zone
      ? []
      : [`rendered zone ${input.marker.renderedZone} differs from real zone ${input.player.zone}`]),
    ...(input.marker.role === input.player.role ? [] : [`role ${input.marker.role} differs from PlayerMatchState ${input.player.role}`]),
    ...(input.marker.teamId === input.player.teamId ? [] : [`team ${input.marker.teamId} differs from PlayerMatchState ${input.player.teamId}`]),
    ...(input.marker.positionSource === "REAL" || input.marker.positionSource === "OFFSET_FOR_VISIBILITY"
      ? []
      : [`invalid real marker position source ${input.marker.positionSource}`]),
    ...(projectedRequiresGhost ? [] : ["projected zone metadata exists without ghost marker"]),
    ...(offsetRequiresLeader ? [] : ["offset marker has no leader line to real zone anchor"]),
  ];

  return {
    snapshotId: input.snapshotId,
    playerId: input.player.playerId,
    initials: input.player.roleInitials,
    reportZone: input.player.zone,
    realZone: input.marker.realZone,
    renderedZone: input.marker.renderedZone,
    projectedZone: input.marker.projectedZone,
    status: errors.length === 0 ? "PASS" : "FAIL",
    reason: errors.length === 0 ? "real marker matches PlayerMatchState; projection is separate when present" : errors.join("; "),
  };
}

function snapshotRows(input: {
  readonly snapshot: SnapshotReference;
  readonly reportDirectory: string;
  readonly beforeAfter: "before" | "after";
}): readonly AlignmentRow[] {
  const fileName = `sequence-${input.snapshot.sequenceNumber}-action-${input.snapshot.actionNumber}-${input.beforeAfter}.svg`;
  const snapshotId = `sequence-${input.snapshot.sequenceNumber}-action-${input.snapshot.actionNumber}-${input.beforeAfter}`;
  const svgPath = join(input.reportDirectory, "storyboards", fileName);
  const svg = readFileSync(svgPath, "utf8");
  const markers = parseSvgPlayerMarkers(svg);
  const metadata = input.beforeAfter === "before" ? input.snapshot.beforeMetadata : input.snapshot.afterMetadata;

  return metadata.playerStates.map((player) =>
    validateMarker({
      svg,
      snapshotId,
      player,
      marker: markers.find((marker) => marker.playerId === player.playerId),
    }),
  );
}

function formatPlayerZones(players: readonly PlayerMatchState[]): string {
  return players.map((player) => `${player.roleInitials}@${player.zone}`).join(", ");
}

function renderSequenceOneAudit(input: {
  readonly snapshots: readonly SnapshotReference[];
  readonly rows: readonly AlignmentRow[];
}): readonly string[] {
  const snapshot = input.snapshots.find((candidate) => candidate.sequenceNumber === 1 && candidate.actionNumber === 1);
  if (snapshot === undefined) {
    return ["## sequence-1-action-1-before audit", "", "- snapshot missing from current run"];
  }

  const attackingTeamId = snapshot.beforeMetadata.sourcePossessionTeamId;
  const receptionCandidates = snapshot.beforeMetadata.playerStates.filter(
    (player) => player.teamId === attackingTeamId && player.isAvailableReceiver && !player.hasBall,
  );
  const beforeRows = input.rows.filter((row) => row.snapshotId === "sequence-1-action-1-before");
  const mismatches = beforeRows.filter((row) => row.status === "FAIL");
  const rootCause =
    mismatches.length === 0
      ? "No current mismatch: the storyboard renders solid real markers from PlayerMatchState, keeps projected positions as ghosts, and marks visibility offsets with leader lines. If older opened SVGs looked shifted, they were likely pre-cleanup/debug outputs or projected/offset positions without explicit truth metadata."
      : `Current mismatch remains in ${mismatches.length} player marker(s); see table above.`;

  return [
    "## sequence-1-action-1-before audit",
    "",
    `- report positions (legacy geometric reception candidates): ${formatPlayerZones(receptionCandidates) || "none"}`,
    `- PlayerMatchState positions: ${formatPlayerZones(snapshot.beforeMetadata.playerStates)}`,
    `- SVG data-real-zone: ${beforeRows.map((row) => `${row.initials}@${row.realZone}`).join(", ")}`,
    `- SVG visual anchor zone: ${beforeRows.map((row) => `${row.initials}@${row.renderedZone}`).join(", ")}`,
    `- root cause: ${rootCause}`,
  ];
}

function renderAlignmentMarkdown(input: {
  readonly snapshots: readonly SnapshotReference[];
  readonly rows: readonly AlignmentRow[];
}): string {
  const failed = input.rows.filter((row) => row.status === "FAIL");

  return [
    "# world-state visual alignment",
    "",
    `- snapshots checked: ${input.snapshots.length * 2}`,
    `- player markers checked: ${input.rows.length}`,
    `- failures: ${failed.length}`,
    "",
    "## Alignment Rows",
    "",
    "| Snapshot | Player | Report zone | Real zone | Rendered zone | Projected zone | Status | Reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...input.rows.map(
      (row) =>
        `| ${row.snapshotId} | ${row.initials} (${row.playerId}) | ${row.reportZone} | ${row.realZone} | ${row.renderedZone} | ${row.projectedZone ?? "none"} | ${row.status} | ${row.reason} |`,
    ),
    "",
    ...renderSequenceOneAudit(input),
    "",
  ].join("\n");
}

export function validateWorldStateVisualAlignment(input: {
  readonly snapshots: readonly SnapshotReference[];
  readonly reportDirectory: string;
}): WorldStateVisualAlignmentResult {
  const rows = input.snapshots.flatMap((snapshot) => [
    ...snapshotRows({ snapshot, reportDirectory: input.reportDirectory, beforeAfter: "before" }),
    ...snapshotRows({ snapshot, reportDirectory: input.reportDirectory, beforeAfter: "after" }),
  ]);
  const reportPath = join(input.reportDirectory, "world-state-visual-alignment.md");

  writeFileSync(reportPath, renderAlignmentMarkdown({ snapshots: input.snapshots, rows }), "utf8");

  return {
    valid: rows.every((row) => row.status === "PASS"),
    reportPath,
    rows,
  };
}
