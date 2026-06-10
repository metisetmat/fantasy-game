import { PlayerRole } from "../../../models/player";
import type { PlayerMatchState } from "../../players";
import { AttackingDirection } from "../../spatial/intention";
import { ReceptionFollowUpRole, type ReceptionQualityEvaluation } from "../../spatial/receptionQuality";
import type { ReceptionChainAction } from "../receptionChains/receptionChainTypes";

export enum PatternType {
  ThirdManProgression = "THIRD_MAN_PROGRESSION",
  SafeRecycle = "SAFE_RECYCLE",
  WallPassReset = "WALL_PASS_RESET",
  PressureEscape = "PRESSURE_ESCAPE",
  DirectForwardPass = "DIRECT_FORWARD_PASS",
  RupturePass = "RUPTURE_PASS",
}

export interface StrictThirdManValidation {
  readonly patternPath: string;
  readonly patternType: PatternType;
  readonly status: "VALID" | "REJECTED" | "NOT_THIRD_MAN";
  readonly firstManId: string;
  readonly secondManId: string | null;
  readonly thirdManId: string | null;
  readonly reasons: readonly string[];
  readonly penalties: readonly string[];
  readonly progressionScore: number;
  readonly recycleScore: number;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function zoneColumn(zone: string): number {
  const match = /^Z([0-8])-/.exec(zone);

  return match?.[1] === undefined ? 4 : Number.parseInt(match[1], 10);
}

function isAhead(input: {
  readonly candidateZone: string;
  readonly referenceZone: string;
  readonly attackingDirection: AttackingDirection;
}): boolean {
  const candidate = zoneColumn(input.candidateZone);
  const reference = zoneColumn(input.referenceZone);

  return input.attackingDirection === AttackingDirection.Z1ToZ7 ? candidate > reference : candidate < reference;
}

function isBehind(input: {
  readonly candidateZone: string;
  readonly referenceZone: string;
  readonly attackingDirection: AttackingDirection;
}): boolean {
  const candidate = zoneColumn(input.candidateZone);
  const reference = zoneColumn(input.referenceZone);

  return input.attackingDirection === AttackingDirection.Z1ToZ7 ? candidate < reference : candidate > reference;
}

function lanePlayable(laneState: ReceptionChainAction["laneState"]): boolean {
  return laneState === "OPEN" || laneState === "TEMPORARY_WINDOW" || laneState === "CONTESTED";
}

function supportsQuickRelease(role: ReceptionFollowUpRole): boolean {
  return [
    ReceptionFollowUpRole.WallPass,
    ReceptionFollowUpRole.ContactPlatform,
    ReceptionFollowUpRole.ThirdManSet,
    ReceptionFollowUpRole.FastRelease,
  ].includes(role);
}

function playerFor(players: readonly PlayerMatchState[], playerId: string): PlayerMatchState | undefined {
  return players.find((player) => player.playerId === playerId);
}

function pathFromActions(actions: readonly ReceptionChainAction[]): string {
  const first = actions[0];

  if (first === undefined) {
    return "none";
  }

  return [first.fromInitials, ...actions.map((action) => action.toInitials)].join(" -> ");
}

function classifyFallback(input: {
  readonly firstAction: ReceptionChainAction;
  readonly secondAction: ReceptionChainAction | undefined;
  readonly thirdMan: PlayerMatchState | undefined;
  readonly attackingDirection: AttackingDirection;
}): PatternType {
  if (input.secondAction === undefined) {
    return isAhead({
      candidateZone: input.firstAction.toZone,
      referenceZone: input.firstAction.fromZone,
      attackingDirection: input.attackingDirection,
    })
      ? PatternType.DirectForwardPass
      : PatternType.SafeRecycle;
  }

  if (input.thirdMan?.role === PlayerRole.GoalkeeperFreeSafety) {
    return PatternType.SafeRecycle;
  }

  if (isBehind({
    candidateZone: input.secondAction.toZone,
    referenceZone: input.firstAction.fromZone,
    attackingDirection: input.attackingDirection,
  })) {
    return PatternType.SafeRecycle;
  }

  return PatternType.WallPassReset;
}

export function validateStrictThirdManPattern(input: {
  readonly actions: readonly ReceptionChainAction[];
  readonly players: readonly PlayerMatchState[];
  readonly firstManId: string;
  readonly attackingDirection: AttackingDirection;
}): StrictThirdManValidation {
  const firstAction = input.actions[0];
  const secondAction = input.actions[1];

  if (firstAction === undefined) {
    return {
      patternPath: "none",
      patternType: PatternType.SafeRecycle,
      status: "REJECTED",
      firstManId: input.firstManId,
      secondManId: null,
      thirdManId: null,
      reasons: ["no first action exists"],
      penalties: [],
      progressionScore: 0,
      recycleScore: 0,
    };
  }

  const firstMan = playerFor(input.players, input.firstManId);
  const secondMan = playerFor(input.players, firstAction.toPlayerId);
  const thirdMan = secondAction === undefined ? undefined : playerFor(input.players, secondAction.toPlayerId);
  const reasons: string[] = [];
  const penalties: string[] = [];

  if (firstAction.fromPlayerId !== input.firstManId) {
    penalties.push("FIRST_MAN_NOT_CURRENT_CARRIER");
    reasons.push("first man does not match current carrier");
  }

  if (!isAhead({
    candidateZone: firstAction.toZone,
    referenceZone: firstAction.fromZone,
    attackingDirection: input.attackingDirection,
  })) {
    penalties.push("SECOND_MAN_NOT_AHEAD");
    reasons.push("second man is not ahead of the first man");
  }

  if (!lanePlayable(firstAction.laneState)) {
    penalties.push("FIRST_LANE_NOT_PLAYABLE");
    reasons.push(`first-to-second lane is ${firstAction.laneState}`);
  }

  if (!supportsQuickRelease(firstAction.followUpRole)) {
    penalties.push("SECOND_MAN_CANNOT_RELEASE_QUICKLY");
    reasons.push(`${firstAction.toInitials} follow-up role ${firstAction.followUpRole} does not support quick third-man release`);
  }

  if (secondAction === undefined) {
    return {
      patternPath: pathFromActions(input.actions),
      patternType: classifyFallback({ firstAction, secondAction, thirdMan, attackingDirection: input.attackingDirection }),
      status: "NOT_THIRD_MAN",
      firstManId: input.firstManId,
      secondManId: firstAction.toPlayerId,
      thirdManId: null,
      reasons: [...reasons, "single-receiver chain is not a third-man progression"],
      penalties,
      progressionScore: firstAction.progressionGain,
      recycleScore: firstAction.retentionGain,
    };
  }

  if (thirdMan?.role === PlayerRole.GoalkeeperFreeSafety) {
    penalties.push("GOALKEEPER_THIRD_MAN_INVALID_FOR_PROGRESSION");
    reasons.push("GK receives as a safety valve, not as a forward-facing attacking third man");
  }

  if (isBehind({
    candidateZone: secondAction.toZone,
    referenceZone: firstAction.fromZone,
    attackingDirection: input.attackingDirection,
  })) {
    penalties.push("THIRD_MAN_BEHIND_FIRST_MAN");
    reasons.push("third man is behind the first man, so this is a recycle/reset");
  }

  const bodyOpen =
    secondAction.bodyShape.bodyOpenToGoal ||
    secondAction.bodyShape.halfTurned ||
    secondAction.bodyShape.insideShoulderOpen;
  if (!bodyOpen) {
    penalties.push("THIRD_MAN_NOT_FACING_PLAY");
    reasons.push("third man is not facing play or half-turned");
  }

  if (secondAction.nextActionWindow.viability < 42) {
    penalties.push("THIRD_MAN_TIMING_WINDOW_CLOSED");
    reasons.push("quick layoff timing window is too weak");
  }

  const progressionScore = clamp(
    secondAction.progressionGain * 0.34 +
      secondAction.nextActionWindow.viability * 0.24 +
      secondAction.retentionGain * 0.18 +
      (100 - secondAction.pressure) * 0.14 +
      (bodyOpen ? 10 : 0),
  );
  const recycleScore = clamp(
    secondAction.retentionGain * 0.5 +
      (100 - secondAction.risk) * 0.32 +
      (isBehind({
        candidateZone: secondAction.toZone,
        referenceZone: firstAction.fromZone,
        attackingDirection: input.attackingDirection,
      })
        ? 12
        : 0),
  );
  const continuationValueOk = progressionScore > recycleScore + 6;
  if (!continuationValueOk) {
    penalties.push("THIRD_MAN_CONTINUATION_BELOW_RECYCLE_THRESHOLD");
    reasons.push("third-man continuation value does not beat recycle value");
  }

  if (penalties.length > 0) {
    return {
      patternPath: pathFromActions(input.actions),
      patternType: classifyFallback({ firstAction, secondAction, thirdMan, attackingDirection: input.attackingDirection }),
      status: penalties.includes("GOALKEEPER_THIRD_MAN_INVALID_FOR_PROGRESSION") ? "NOT_THIRD_MAN" : "REJECTED",
      firstManId: input.firstManId,
      secondManId: firstAction.toPlayerId,
      thirdManId: secondAction.toPlayerId,
      reasons,
      penalties,
      progressionScore,
      recycleScore,
    };
  }

  return {
    patternPath: pathFromActions(input.actions),
    patternType: PatternType.ThirdManProgression,
    status: "VALID",
    firstManId: input.firstManId,
    secondManId: firstAction.toPlayerId,
    thirdManId: secondAction.toPlayerId,
    reasons: ["third man receives a quick layoff facing play with progression value above recycle"],
    penalties: [],
    progressionScore,
    recycleScore,
  };
}
