import type { PlayerMatchState } from "../../systems/players";
import type { SnapshotReference } from "../visualization";
import { FocusCategory } from "./focusCategories";
import { rankFocusCandidates } from "./focusPriority";
import type { TacticalFocus, TacticalFocusActor } from "./tacticalFocus";

function toFocusActor(player: PlayerMatchState, reason: string): TacticalFocusActor {
  return {
    playerId: player.playerId,
    teamId: player.teamId,
    initials: player.roleInitials,
    zone: player.zone,
    role: player.role,
    reason,
  };
}

function uniqueActors(actors: readonly TacticalFocusActor[]): readonly TacticalFocusActor[] {
  const seen = new Set<string>();

  return actors.filter((actor) => {
    if (seen.has(actor.playerId)) {
      return false;
    }

    seen.add(actor.playerId);
    return true;
  });
}

function findBallCarrier(players: readonly PlayerMatchState[]): PlayerMatchState | null {
  return players.find((player) => player.hasBall) ?? null;
}

function findReceiver(players: readonly PlayerMatchState[], playerId: string | null): PlayerMatchState | null {
  if (playerId === null || playerId === "") {
    return null;
  }

  return players.find((player) => player.playerId === playerId) ?? null;
}

function findRunner(players: readonly PlayerMatchState[], attackingTeamId: string): PlayerMatchState | null {
  return (
    players
      .filter(
        (player) =>
          player.teamId === attackingTeamId &&
          (player.primaryIntent?.type === "ATTACK_DEPTH" ||
            player.primaryIntent?.type === "ATTACK_WEAK_SIDE" ||
            player.primaryIntent?.type === "PREPARE_FINISH"),
      )
      .sort((left, right) => right.intentUrgency - left.intentUrgency)[0] ?? null
  );
}

function findKeyDefender(players: readonly PlayerMatchState[], defendingTeamId: string): PlayerMatchState | null {
  return (
    players
      .filter(
        (player) =>
          player.teamId === defendingTeamId &&
          (player.isRecovering ||
            player.isDelayed ||
            player.tacticalStatus === "PRESSING" ||
            player.blindSideExposure >= 75),
      )
      .sort((left, right) => right.blindSideExposure + right.pressure - (left.blindSideExposure + left.pressure))[0] ?? null
  );
}

function focusZoneForCategory(input: {
  readonly category: FocusCategory;
  readonly snapshot: SnapshotReference;
  readonly carrier: PlayerMatchState | null;
  readonly runner: PlayerMatchState | null;
}): string {
  const lane = input.snapshot.afterMetadata.passingLaneAnalysis;
  const overload = input.snapshot.afterMetadata.overloadWindows[0];
  const recovery = input.snapshot.afterMetadata.recoveryVectors[0];
  const danger = input.snapshot.afterMetadata.dangerMap
    .filter((zone) => zone.danger >= 55)
    .sort((left, right) => right.danger - left.danger)[0];

  if (input.category === FocusCategory.OverloadCreation && overload !== undefined) {
    return overload.zone;
  }

  if (input.category === FocusCategory.DelayedRecovery && recovery !== undefined) {
    return recovery.to;
  }

  if (input.category === FocusCategory.FinishingWindow && danger !== undefined) {
    return danger.zone;
  }

  if (input.category === FocusCategory.WeakSideAttack && input.runner !== null) {
    return input.runner.zone;
  }

  return lane?.toZone ?? input.snapshot.afterTruthContract.selectedTargetZone ?? input.carrier?.zone ?? input.snapshot.ballZone;
}

function categoryTension(category: FocusCategory): string {
  switch (category) {
    case FocusCategory.WeakSideAttack:
      return "Can the runner receive before the blind-side defender turns?";
    case FocusCategory.PressBreak:
      return "Can the carrier escape the pressure before the lane closes?";
    case FocusCategory.FinishingWindow:
      return "Can the attack turn pressure into a clean scoring window?";
    case FocusCategory.OverloadCreation:
      return "Can the extra attacker matter before recovery arrives?";
    case FocusCategory.DelayedRecovery:
      return "Can the defense fold back before the next action?";
    case FocusCategory.ReboundPhase:
      return "Who reaches the loose second ball first?";
    case FocusCategory.ChaosRecovery:
      return "Which team restores order first?";
    case FocusCategory.DepthAttack:
      return "Does the depth runner stretch the line in time?";
    case FocusCategory.SupportTriangle:
      return "Does the support triangle stabilize possession?";
    case FocusCategory.StructureReset:
      return "Can the attack reset without inviting pressure?";
    case FocusCategory.CounterpressCollapse:
    case FocusCategory.GoalkeeperSweep:
    case FocusCategory.LastLineBreak:
    case FocusCategory.CentralCombination:
    case FocusCategory.TransitionEscape:
    case FocusCategory.WidthIsolation:
      return "Can the main tactical window be exploited before it disappears?";
  }
}

function suppressionsForCategory(category: FocusCategory): readonly string[] {
  switch (category) {
    case FocusCategory.WeakSideAttack:
      return ["unrelated far-side trajectories", "secondary pressure cones", "non-critical support triangles"];
    case FocusCategory.FinishingWindow:
      return ["far-side width support", "non-frame recovery vectors", "secondary overload boxes"];
    case FocusCategory.PressBreak:
      return ["distant defenders", "unrelated danger cells", "secondary intent labels"];
    case FocusCategory.DelayedRecovery:
      return ["non-recovery trajectories", "background influence heat", "far-side support labels"];
    default:
      return ["background influence heat", "secondary trajectories", "debug metrics"];
  }
}

export function resolveTacticalFocus(snapshot: SnapshotReference): TacticalFocus {
  const candidates = rankFocusCandidates(snapshot);
  const topCandidate =
    candidates[0] ?? {
      category: FocusCategory.StructureReset,
      score: 10,
      reason: "the action is mainly about maintaining structure",
    };
  const players = snapshot.afterMetadata.playerStates;
  const carrier = findBallCarrier(players);
  const attackingTeamId = carrier?.teamId ?? snapshot.afterMetadata.sourcePossessionTeamId;
  const defendingTeamId = players.find((player) => player.teamId !== attackingTeamId)?.teamId ?? "";
  const receiver = findReceiver(players, snapshot.afterTruthContract.receiverId);
  const runner = findRunner(players, attackingTeamId);
  const defender = findKeyDefender(players, defendingTeamId);
  const primaryActors = uniqueActors([
    ...(carrier === null ? [] : [toFocusActor(carrier, "ball carrier")]),
    ...(topCandidate.category === FocusCategory.WeakSideAttack && runner !== null
      ? [toFocusActor(runner, "weak-side runner")]
      : []),
    ...(topCandidate.category === FocusCategory.FinishingWindow && receiver !== null
      ? [toFocusActor(receiver, "finishing reference")]
      : []),
    ...(topCandidate.category === FocusCategory.OverloadCreation && receiver !== null
      ? [toFocusActor(receiver, "overload receiver")]
      : []),
    ...(defender === null ? [] : [toFocusActor(defender, "defensive tension")]),
  ]).slice(0, 4);
  const support = players
    .filter((player) => player.teamId === attackingTeamId && player.supportStatus !== "ISOLATED" && !player.hasBall)
    .sort((left, right) => right.intentUrgency - left.intentUrgency)
    .slice(0, 2)
    .map((player) => toFocusActor(player, "direct support"));
  const lane = snapshot.afterMetadata.passingLaneAnalysis;
  const focusZone = focusZoneForCategory({
    category: topCandidate.category,
    snapshot,
    carrier,
    runner,
  });

  return {
    focusId: `focus-s${snapshot.sequenceNumber}-a${snapshot.actionNumber}`,
    category: topCandidate.category,
    attackingTeam: snapshot.attackingTeamName,
    defendingTeam: snapshot.defendingTeamName,
    primaryActors,
    secondaryActors: uniqueActors([...support]).slice(0, 4),
    focusZone,
    focusLane: lane === null ? null : `${lane.fromZone}->${lane.toZone}`,
    focusReason: topCandidate.reason,
    tacticalTension: categoryTension(topCandidate.category),
    supportingEvidence: [
      ...(lane === null ? [] : [`lane ${lane.fromZone} to ${lane.toZone} is ${lane.laneState}`]),
      ...(snapshot.afterMetadata.overloadWindows[0] === undefined
        ? []
        : [`overload cue at ${snapshot.afterMetadata.overloadWindows[0].zone}`]),
      ...(snapshot.afterMetadata.recoveryVectors[0] === undefined
        ? []
        : [`recovery vector ${snapshot.afterMetadata.recoveryVectors[0].from} to ${snapshot.afterMetadata.recoveryVectors[0].to}`]),
      ...snapshot.afterMetadata.blindSideClaims.slice(0, 1),
    ],
    suppressions: suppressionsForCategory(topCandidate.category),
    storyboardPriority: Math.round(topCandidate.score),
  };
}
