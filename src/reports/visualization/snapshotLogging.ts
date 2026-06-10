import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { PlayerRole } from "../../models/player";
import type { ZoneId } from "../../core/zones";
import type { TacticalPhaseState } from "../../systems/tacticalState";
import type { AttackingDirection } from "../../systems/spatial/intention";
import { buildTacticalSnapshot } from "./buildTacticalSnapshot";
import { renderTacticalSnapshotSvg } from "./renderTacticalSnapshotSvg";
import type { TacticalSnapshotMetadata } from "./tacticalSnapshotTypes";
import { createSnapshotTruthContract, type SnapshotTruthContract } from "./snapshotTruthContract";
import { classifyTacticalAction } from "../../systems/actions";

export interface SnapshotRankedTargetCandidate {
  readonly rank: number;
  readonly fromZone: string;
  readonly toZone: string;
  readonly actionType: string;
  readonly legal: "YES" | "NO";
  readonly baseScore: string;
  readonly modifiersSummary: string;
  readonly finalScore: string;
  readonly selected: boolean;
  readonly preOverrideRank: number | null;
  readonly postOverrideRank: number | null;
  readonly overrideReason: string | null;
}

function assertSnapshotMetadata(metadata: TacticalSnapshotMetadata): void {
  const validation = metadata.renderValidation;
  const warnings = [
    ...(validation.controlPlayersRendered === validation.controlPlayersExpected
      ? []
      : [`CONTROL players rendered ${validation.controlPlayersRendered}/${validation.controlPlayersExpected}`]),
    ...(validation.blitzPlayersRendered === validation.blitzPlayersExpected
      ? []
      : [`BLITZ players rendered ${validation.blitzPlayersRendered}/${validation.blitzPlayersExpected}`]),
    ...(validation.ballCarrierCount === 1 ? [] : [`ball carriers rendered ${validation.ballCarrierCount}/1`]),
    ...(validation.allPlayerStatesRendered ? [] : ["not every player state rendered"]),
    ...(validation.controlRosterMatched ? [] : ["CONTROL roster did not match rendered players"]),
    ...(validation.blitzRosterMatched ? [] : ["BLITZ roster did not match rendered players"]),
    ...(validation.controlRoleInitialsMatched ? [] : ["CONTROL role initials did not match roster"]),
    ...(validation.blitzRoleInitialsMatched ? [] : ["BLITZ role initials did not match roster"]),
    ...(validation.markerRolesMatchedPlayerStates ? [] : ["rendered marker roles did not match PlayerMatchState"]),
    ...(validation.markerInitialsMatchedPlayerStates ? [] : ["rendered marker initials did not match PlayerMatchState"]),
    ...validation.warnings,
  ];

  if (warnings.length > 0) {
    throw new Error(`Snapshot validation failed: ${warnings[0]}`);
  }
}

function extractSvgAttributeGroups(svg: string, attributeName: string): readonly string[] {
  const pattern = new RegExp(`${attributeName}="([^"]+)"`, "g");
  const values: string[] = [];
  let match = pattern.exec(svg);

  while (match !== null) {
    const value = match[1];
    if (value !== undefined) {
      values.push(value);
    }
    match = pattern.exec(svg);
  }

  return values;
}

function extractPlayerMarkerAttributeGroups(svg: string, attributeName: string): readonly string[] {
  const pattern = new RegExp(`<g id="player-[^"]+"[^>]*${attributeName}="([^"]+)"`, "g");
  const values: string[] = [];
  let match = pattern.exec(svg);

  while (match !== null) {
    const value = match[1];
    if (value !== undefined) {
      values.push(value);
    }
    match = pattern.exec(svg);
  }

  return values;
}

function extractPlayerLabelAttributeGroups(svg: string, attributeName: string): readonly string[] {
  const pattern = new RegExp(`<text class="player-label"[^>]*${attributeName}="([^"]+)"`, "g");
  const values: string[] = [];
  let match = pattern.exec(svg);

  while (match !== null) {
    const value = match[1];
    if (value !== undefined) {
      values.push(value);
    }
    match = pattern.exec(svg);
  }

  return values;
}

function assertRenderedSvgTruth(input: {
  readonly svg: string;
  readonly metadata: TacticalSnapshotMetadata;
  readonly label: string;
}): void {
  const markerPlayerIds = extractPlayerMarkerAttributeGroups(input.svg, "data-player-id");
  const labelPlayerIds = extractPlayerLabelAttributeGroups(input.svg, "data-player-id");
  const labelInitials = extractPlayerLabelAttributeGroups(input.svg, "data-initials");
  const primaryIntents = extractPlayerMarkerAttributeGroups(input.svg, "data-primary-intent");
  const facingDirections = extractPlayerMarkerAttributeGroups(input.svg, "data-facing-direction");
  const perceptionConfidence = extractPlayerMarkerAttributeGroups(input.svg, "data-perception-confidence");
  const uniqueMarkerIds = new Set(markerPlayerIds);
  const officialPlayerIds = new Set(input.metadata.playerStates.map((player) => player.playerId));
  const missingOfficialIds = [...officialPlayerIds].filter((playerId) => !uniqueMarkerIds.has(playerId));
  const legacyInitials = new Set(["LA", "RA", "P", "PR", "FS"]);
  const legacyLabels = labelInitials.filter((initials) => legacyInitials.has(initials));
  const errors = [
    ...(uniqueMarkerIds.size === 20 ? [] : [`${input.label}: ${uniqueMarkerIds.size}/20 unique player markers rendered`]),
    ...(labelPlayerIds.length === 20 ? [] : [`${input.label}: ${labelPlayerIds.length}/20 player labels rendered`]),
    ...(missingOfficialIds.length === 0 ? [] : [`${input.label}: missing official player ids ${missingOfficialIds.join(", ")}`]),
    ...(legacyLabels.length === 0 ? [] : [`${input.label}: legacy labels present ${legacyLabels.join(", ")}`]),
    ...(primaryIntents.length === 20 ? [] : [`${input.label}: ${primaryIntents.length}/20 primary intent markers rendered`]),
    ...(primaryIntents.some((intent) => intent.length === 0) ? [`${input.label}: empty primary intent metadata`] : []),
    ...(facingDirections.length === 20 ? [] : [`${input.label}: ${facingDirections.length}/20 facing direction markers rendered`]),
    ...(perceptionConfidence.length === 20
      ? []
      : [`${input.label}: ${perceptionConfidence.length}/20 perception confidence markers rendered`]),
    ...(input.svg.includes("vision cone") ? [] : [`${input.label}: missing perception/vision overlay`]),
    ...(input.svg.includes("data-layer=") ? [] : [`${input.label}: missing layer truth attributes`]),
    ...(input.svg.includes("data-truth-type=") ? [] : [`${input.label}: missing truth-type attributes`]),
    ...(input.svg.includes("id=\"goal-frame-left\"") && input.svg.includes("id=\"goal-frame-right\"")
      ? []
      : [`${input.label}: missing goal-frame truth elements`]),
    ...(input.svg.includes("id=\"ball-marker\"") ? [] : [`${input.label}: missing certified ball marker`]),
  ];

  if (errors.length > 0) {
    throw new Error(`Snapshot SVG validation failed: ${errors[0]}`);
  }
}

export interface SnapshotReference {
  readonly sequenceNumber: number;
  readonly actionNumber: number;
  readonly attackingTeamName: string;
  readonly defendingTeamName: string;
  readonly ballCarrierRole: PlayerRole;
  readonly ballZone: ZoneId;
  readonly attackingDirection: AttackingDirection;
  readonly phaseState: TacticalPhaseState;
  readonly sourceTick: number;
  readonly sourceTimelineEventId: string;
  readonly beforePath: string;
  readonly afterPath: string;
  readonly beforeMetadata: TacticalSnapshotMetadata;
  readonly afterMetadata: TacticalSnapshotMetadata;
  readonly beforeTruthContract: SnapshotTruthContract;
  readonly afterTruthContract: SnapshotTruthContract;
  readonly rankedTargetCandidates: readonly SnapshotRankedTargetCandidate[];
}

function parseRankedTargetCandidates(logs: readonly { readonly text: string }[]): readonly SnapshotRankedTargetCandidate[] {
  const rankedStart = logs.findIndex((line) => line.text === "Ranked target candidates:");
  if (rankedStart < 0) {
    return [];
  }

  const selectedTargetLine = logs.find((line) => line.text.startsWith("Selected target:"))?.text ?? "";
  const selectedTarget = selectedTargetLine.replace("Selected target:", "").replace(".", "").trim();
  const preOverrideRank = Number.parseInt(
    logs.find((line) => line.text.startsWith("Pre-override rank:"))?.text.replace(/\D/g, "") ?? "",
    10,
  );
  const overrideApplied = logs.some((line) => line.text === "Override applied: YES.");
  const candidateRows: SnapshotRankedTargetCandidate[] = [];

  for (let index = rankedStart + 3; index < logs.length; index += 1) {
    const text = logs[index]?.text ?? "";
    if (!text.startsWith("|")) {
      break;
    }

    const cells = text
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0);

    if (cells.length < 8) {
      continue;
    }

    const rank = Number.parseInt(cells[0] ?? "", 10);
    if (Number.isNaN(rank)) {
      continue;
    }

    const toZone = cells[2] ?? "";
    candidateRows.push({
      rank,
      fromZone: cells[1] ?? "",
      toZone,
      actionType: cells[3] ?? "",
      legal: cells[4] === "NO" ? "NO" : "YES",
      baseScore: cells[5] ?? "",
      modifiersSummary: cells[6] ?? "",
      finalScore: cells[7] ?? "",
      selected: toZone === selectedTarget,
      preOverrideRank: overrideApplied && toZone === selectedTarget && !Number.isNaN(preOverrideRank) ? preOverrideRank : null,
      postOverrideRank: overrideApplied && toZone === selectedTarget ? 1 : null,
      overrideReason: overrideApplied && toZone === selectedTarget ? "tactical selection rule promoted the chosen option" : null,
    });
  }

  return candidateRows;
}

export function writeTacticalSnapshots(input: {
  readonly result: MiniMatchResult;
  readonly reportDirectory: string;
}): readonly SnapshotReference[] {
  const snapshotDirectory = join(input.reportDirectory, "snapshots");

  if (!existsSync(snapshotDirectory)) {
    mkdirSync(snapshotDirectory, { recursive: true });
  }

  for (const fileName of readdirSync(snapshotDirectory)) {
    if (fileName.endsWith(".svg") || fileName === "snapshot-manifest.json") {
      unlinkSync(join(snapshotDirectory, fileName));
    }
  }

  return input.result.state.records.flatMap((record) =>
    record.result.steps.map((step, index): SnapshotReference => {
      const actionNumber = index + 1;
      const baseName = `sequence-${record.sequenceNumber}-action-${actionNumber}`;
      const beforeFile = `${baseName}-before.svg`;
      const afterFile = `${baseName}-after.svg`;
      const beforeSnapshot = buildTacticalSnapshot({ record, step, actionNumber, after: false });
      const afterSnapshot = buildTacticalSnapshot({ record, step, actionNumber, after: true });
      assertSnapshotMetadata(beforeSnapshot.metadata);
      assertSnapshotMetadata(afterSnapshot.metadata);
      const attackingMarker = afterSnapshot.players.find((player) => player.hasBall);
      const attackingTeamName = attackingMarker?.teamName ?? record.setup.possessionTeam.teamName;
      const defendingTeamName =
        attackingTeamName === record.setup.possessionTeam.teamName
          ? record.setup.pressingTeam.teamName
          : record.setup.possessionTeam.teamName;

      const beforeSvg = renderTacticalSnapshotSvg(beforeSnapshot);
      const afterSvg = renderTacticalSnapshotSvg(afterSnapshot);
      assertRenderedSvgTruth({ svg: beforeSvg, metadata: beforeSnapshot.metadata, label: beforeFile });
      assertRenderedSvgTruth({ svg: afterSvg, metadata: afterSnapshot.metadata, label: afterFile });
      writeFileSync(join(snapshotDirectory, beforeFile), beforeSvg, "utf8");
      writeFileSync(join(snapshotDirectory, afterFile), afterSvg, "utf8");
      const beforeCarrier = beforeSnapshot.players.find((player) => player.hasBall);
      const afterCarrier = afterSnapshot.players.find((player) => player.hasBall);
      const beforeDefendingTeamId =
        beforeCarrier?.teamId === record.setup.possessionTeam.teamId
          ? record.setup.pressingTeam.teamId
          : record.setup.possessionTeam.teamId;
      const afterDefendingTeamId =
        afterCarrier?.teamId === record.setup.possessionTeam.teamId
          ? record.setup.pressingTeam.teamId
          : record.setup.possessionTeam.teamId;
      const beforeTruthContract = createSnapshotTruthContract({
        snapshot: beforeSnapshot,
        snapshotId: `${baseName}-before`,
        phaseState: step.contextBefore.tacticalPhaseState,
        defendingTeamId: beforeDefendingTeamId,
        selectedActionType: classifyTacticalAction({
          moveType: step.interaction,
          eventType: step.interaction,
          possessionTeamId: step.ballContextBefore.possessionTeamId,
          fromZone: step.ballContextBefore.ballLocation,
          ballZoneContract: step.ballZoneContract,
        }).selectedActionType,
      });
      const afterTruthContract = createSnapshotTruthContract({
        snapshot: afterSnapshot,
        snapshotId: `${baseName}-after`,
        phaseState: step.contextBefore.tacticalPhaseState,
        defendingTeamId: afterDefendingTeamId,
        selectedActionType: classifyTacticalAction({
          moveType: step.interaction,
          eventType: step.interaction,
          possessionTeamId: step.ballContextBefore.possessionTeamId,
          fromZone: step.ballContextBefore.ballLocation,
          ballZoneContract: step.ballZoneContract,
        }).selectedActionType,
      });

      return {
        sequenceNumber: record.sequenceNumber,
        actionNumber,
        attackingTeamName,
        defendingTeamName,
        ballCarrierRole: afterSnapshot.ballCarrierRole,
        ballZone: afterSnapshot.ballZone,
        attackingDirection: afterSnapshot.attackingDirection,
        phaseState: step.contextBefore.tacticalPhaseState,
        sourceTick: step.tick,
        sourceTimelineEventId: `dt-s${record.sequenceNumber}-a${actionNumber}`,
        beforePath: `snapshots/${beforeFile}`,
        afterPath: `snapshots/${afterFile}`,
        beforeMetadata: beforeSnapshot.metadata,
        afterMetadata: afterSnapshot.metadata,
        beforeTruthContract,
        afterTruthContract,
        rankedTargetCandidates: parseRankedTargetCandidates(step.logs),
      };
    }),
  );
}
