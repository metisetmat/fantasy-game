import { SupportStatus, type PlayerMatchState } from "../../systems/players";
import {
  ReceptionQualityLevel,
  applyReceptionUpgrade,
  evaluateReceptionQualities,
  type ReceptionQualityEvaluation,
} from "../../systems/spatial";
import type { SnapshotReference } from "../visualization";
import type { StoryboardAnalysisBoard, StoryboardRankedOption, StoryboardTacticalFacts } from "./tacticalStoryboard";

function formatPlayer(player: PlayerMatchState | null): string {
  if (player === null) {
    return "none";
  }

  return `${player.roleInitials}@${player.zone}`;
}

function formatPlayers(players: readonly PlayerMatchState[], limit = 8): string {
  if (players.length === 0) {
    return "none";
  }

  const listed = players.slice(0, limit).map((player) => `${player.roleInitials}@${player.zone}`).join(", ");
  return players.length > limit ? `${listed}, +${players.length - limit}` : listed;
}

function findPlayer(players: readonly PlayerMatchState[], playerId: string | null): PlayerMatchState | null {
  if (playerId === null || playerId === "") {
    return null;
  }

  return players.find((player) => player.playerId === playerId) ?? null;
}

function selectedActionLabel(snapshot: SnapshotReference): string {
  return snapshot.afterTruthContract.selectedActionType ?? "SELECTED_ACTION";
}

function laneLabel(snapshot: SnapshotReference): string {
  const lane = snapshot.afterMetadata.passingLaneAnalysis;
  if (lane === null) {
    return "not evaluated";
  }

  return `${lane.laneState} (${lane.fromZone}->${lane.toZone})`;
}

function receiverLabel(snapshot: SnapshotReference, toZone: string): string {
  const players = snapshot.beforeMetadata.playerStates;
  const receiver = findPlayer(players, snapshot.afterTruthContract.receiverId);
  if (receiver !== null && receiver.zone === toZone) {
    return formatPlayer(receiver);
  }

  const zonalReceiver =
    players.find(
      (player) =>
        player.teamId === snapshot.beforeMetadata.sourcePossessionTeamId &&
        player.zone === toZone &&
        player.isAvailableReceiver &&
        !player.hasBall,
    ) ??
    players.find(
      (player) => player.teamId === snapshot.beforeMetadata.sourcePossessionTeamId && player.zone === toZone && !player.hasBall,
    );

  return formatPlayer(zonalReceiver ?? receiver);
}

function convertRankedOptions(snapshot: SnapshotReference): readonly StoryboardRankedOption[] {
  const selectedTarget = snapshot.afterTruthContract.selectedTargetZone;
  const candidates = snapshot.rankedTargetCandidates;

  if (candidates.length > 0) {
    return candidates.map((candidate) => ({
      rank: candidate.rank,
      fromZone: candidate.fromZone,
      toZone: candidate.toZone,
      actionType: candidate.actionType,
      legal: candidate.legal,
      lane: candidate.toZone === selectedTarget ? laneLabel(snapshot) : "candidate",
      receiver: receiverLabel(snapshot, candidate.toZone),
      score: candidate.finalScore,
      why: candidate.modifiersSummary,
      selected: candidate.selected,
      preOverrideRank: candidate.preOverrideRank,
      postOverrideRank: candidate.postOverrideRank,
      overrideReason: candidate.overrideReason,
    }));
  }

  const lane = snapshot.afterMetadata.passingLaneAnalysis;
  const selectedZone = selectedTarget ?? snapshot.ballZone;
  const selectedScore = lane === null ? "n/a" : `${Math.max(0, Math.min(100, lane.openness - Math.round(lane.interceptionRisk * 0.25)))}`;
  const selected: StoryboardRankedOption = {
    rank: 1,
    fromZone: lane?.fromZone ?? snapshot.ballZone,
    toZone: selectedZone,
    actionType: selectedActionLabel(snapshot),
    legal: "YES",
    lane: laneLabel(snapshot),
    receiver: receiverLabel(snapshot, selectedZone),
    score: selectedScore,
    why: lane === null ? "selected target from event contract" : `openness ${lane.openness}, risk ${lane.interceptionRisk}`,
    selected: true,
    preOverrideRank: null,
    postOverrideRank: null,
    overrideReason: null,
  };
  const overloadAlternatives = snapshot.afterMetadata.overloadWindows
    .filter((window) => window.zone !== selectedZone)
    .slice(0, 3)
    .map((window, index): StoryboardRankedOption => ({
      rank: index + 2,
      fromZone: snapshot.ballZone,
      toZone: window.zone,
      actionType: "OVERLOAD",
      legal: "YES",
      lane: `window ${window.windowTicks}`,
      receiver: receiverLabel(snapshot, window.zone),
      score: `${window.confidence}`,
      why: `${window.currentNumbers} now, ${window.projectedNumbers} projected`,
      selected: false,
      preOverrideRank: null,
      postOverrideRank: null,
      overrideReason: null,
    }));

  return [selected, ...overloadAlternatives];
}

function attackers(snapshot: SnapshotReference): readonly PlayerMatchState[] {
  return snapshot.beforeMetadata.playerStates.filter((player) => player.teamId === snapshot.beforeMetadata.sourcePossessionTeamId);
}

function defenders(snapshot: SnapshotReference): readonly PlayerMatchState[] {
  return snapshot.beforeMetadata.playerStates.filter((player) => player.teamId !== snapshot.beforeMetadata.sourcePossessionTeamId);
}

function findReceptionPlayer(snapshot: SnapshotReference, playerId: string): PlayerMatchState | null {
  return snapshot.beforeMetadata.playerStates.find((player) => player.playerId === playerId) ?? null;
}

function teamStyleForReport(teamName: string): "CONTROL" | "BLITZ" {
  return teamName.toUpperCase().includes("BLITZ") ? "BLITZ" : "CONTROL";
}

function receptionEvaluations(snapshot: SnapshotReference): readonly ReceptionQualityEvaluation[] {
  return evaluateReceptionQualities({
    players: snapshot.beforeMetadata.playerStates,
    possessionTeamId: snapshot.beforeTruthContract.possessionTeamId,
    ballCarrierId: snapshot.beforeTruthContract.ballCarrierId,
    attackingDirection: snapshot.attackingDirection,
  }).map((evaluation) => {
    const receiver = findReceptionPlayer(snapshot, evaluation.playerId);

    if (receiver === null) {
      return evaluation;
    }

    return applyReceptionUpgrade({
      evaluation,
      receiver,
      supportAvailable: receiver.supportStatus !== SupportStatus.Isolated,
      teamStyle: teamStyleForReport(snapshot.attackingTeamName),
    });
  });
}

function formatReceptionCandidates(input: {
  readonly evaluations: readonly ReceptionQualityEvaluation[];
  readonly levels: readonly ReceptionQualityLevel[];
}): string {
  const candidates = input.evaluations.filter((evaluation) => input.levels.includes(evaluation.quality));

  if (candidates.length === 0) {
    return "none";
  }

  return candidates
    .slice(0, 8)
    .map((evaluation) => `${evaluation.roleInitials}@${evaluation.zone} ${evaluation.quality} ${evaluation.followUpRole}`)
    .join(", ");
}

export function buildStoryboardAnalysisBoard(input: {
  readonly snapshot: SnapshotReference;
  readonly facts: StoryboardTacticalFacts;
}): StoryboardAnalysisBoard {
  const snapshot = input.snapshot;
  const beforeCarrier = snapshot.beforeMetadata.playerStates.find((player) => player.hasBall) ?? null;
  const receiver = findPlayer(snapshot.beforeMetadata.playerStates, snapshot.beforeTruthContract.receiverId);
  const delayedDefenders = defenders(snapshot).filter((player) => player.isDelayed || player.isRecovering);
  const supportBehindBall = attackers(snapshot).filter((player) => player.isGoalSide && !player.hasBall);
  const lane = snapshot.afterMetadata.passingLaneAnalysis;
  const bestOverload = snapshot.afterMetadata.overloadWindows[0];
  const reception = receptionEvaluations(snapshot);
  const selectedOption = convertRankedOptions(snapshot).find((option) => option.selected);
  const ballZone = beforeCarrier?.zone ?? snapshot.ballZone;
  const sameColumnSupport = reception.filter((evaluation) => evaluation.zone.split("-")[0] === ballZone.split("-")[0]);

  return {
    actionContext: [
      `ball state: ${snapshot.beforeMetadata.ballState}`,
      `possession team: ${snapshot.attackingTeamName}`,
      `defending team: ${snapshot.defendingTeamName}`,
      `ball carrier: ${formatPlayer(beforeCarrier)}`,
      `ball zone: ${ballZone}`,
      `attacking direction: ${snapshot.attackingDirection}`,
      `phase state: ${snapshot.phaseState}`,
    ],
    attackingSpatialReading: [
      `team positions: ${formatPlayers(attackers(snapshot), 10)}`,
      `positive/excellent reception candidates: ${formatReceptionCandidates({
        evaluations: reception,
        levels: [ReceptionQualityLevel.Excellent, ReceptionQualityLevel.Positive],
      })}`,
      `neutral follow-up candidates: ${formatReceptionCandidates({
        evaluations: reception,
        levels: [ReceptionQualityLevel.Neutral],
      })}`,
      `ahead-of-ball reception candidates: ${reception
        .filter((evaluation) => evaluation.ballRelation === "AHEAD")
        .map((evaluation) => `${evaluation.roleInitials}@${evaluation.zone} ${evaluation.quality}`)
        .join(", ") || "none"}`,
      `same-column reception support: ${sameColumnSupport
        .map((evaluation) => `${evaluation.roleInitials}@${evaluation.zone} ${evaluation.followUpRole}`)
        .join(", ") || "none"}`,
      `support behind ball: ${formatPlayers(supportBehindBall)}`,
      `corridor occupation: ${snapshot.beforeMetadata.attackingStructuralLaws.attackCorridorTarget}/5 target`,
      `short-side coverage: ${snapshot.beforeMetadata.shortSideCoverage}`,
      `open-side coverage: ${snapshot.beforeMetadata.openSideCoverage}`,
      `pressure on ball carrier: ${beforeCarrier?.pressure ?? 0}/100`,
      `selected passing lane: ${lane === null ? "none" : `${lane.fromZone}->${lane.toZone} ${lane.laneState}`}`,
      `best overload: ${bestOverload === undefined ? "none" : `${bestOverload.zone} ${bestOverload.currentNumbers}`}`,
      `delayed/recovering defenders: ${formatPlayers(delayedDefenders)}`,
    ],
    rankedOptions: convertRankedOptions(snapshot),
    tacticalReading: [
      `main attacking plan: ${selectedOption?.actionType ?? selectedActionLabel(snapshot)} toward ${snapshot.afterTruthContract.selectedTargetZone ?? "reset"}`,
      `main defensive problem: ${delayedDefenders.length > 0 ? `${formatPlayers(delayedDefenders)} recovering late` : "shape holds for now"}`,
      `decisive timing question: ${input.facts.pressureSummary}`,
      `expected consequence: ${input.facts.tacticalCause}`,
      `intended receiver: ${formatPlayer(receiver ?? input.facts.receiver)}`,
    ],
  };
}
