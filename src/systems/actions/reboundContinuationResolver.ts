import type { ZoneId } from "../../core/zones";
import type { PlayerMatchState } from "../players";
import type {
  ReboundBallHeight,
  ReboundContinuationContext,
  ReboundContinuationPlayer,
  ReboundContinuationResult,
  ReboundDangerLevel,
} from "./reboundContinuationTypes";
import { resolveScramble } from "./scrambleResolutionResolver";
import type { ReboundResolution, ReboundType, ReboundZone } from "./shotOutcomeTypes";

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function longitudinal(zone: string): number {
  const match = /^Z(\d)-/.exec(zone);
  return match === null ? 3 : Number.parseInt(match[1] ?? "3", 10);
}

function corridor(zone: string): string {
  return zone.split("-")[1] ?? "C";
}

function zoneDistance(left: string, right: string): number {
  const depthDistance = Math.abs(longitudinal(left) - longitudinal(right));
  const corridorDistance = corridor(left) === corridor(right) ? 0 : corridor(left).includes("C") || corridor(right).includes("C") ? 1 : 2;

  return depthDistance + corridorDistance;
}

function sourceIndex(actionId: string): number {
  const match = /a(\d+)$/.exec(actionId);
  return match === null ? 0 : Number.parseInt(match[1] ?? "0", 10);
}

function sourceSequence(actionId: string): number {
  const match = /s(\d+)-a/.exec(actionId);
  return match === null ? 0 : Number.parseInt(match[1] ?? "0", 10);
}

function teamCrashBonus(teamId: string): number {
  return teamId === "blitz" ? 8 : 4;
}

function bestDistance(player: ReboundContinuationPlayer | undefined, reboundZone: ReboundZone): number {
  if (player === undefined || reboundZone === "NONE" || reboundZone === "OUT_OF_PLAY") {
    return 4;
  }

  return zoneDistance(player.zone, reboundZone);
}

function playerReactionScore(player: PlayerMatchState): number {
  const visible = player.visibleAttributes;
  const derived = player.derivedAttributes;
  const base =
    (visible?.speed ?? 66) * 0.24 +
    (visible?.composure ?? 66) * 0.22 +
    (visible?.vision ?? 66) * 0.18 +
    (derived?.tacticalDiscipline ?? player.pressureRecognition) * 0.14 +
    player.momentum * 0.12 +
    (100 - player.fatigue) * 0.1;
  const recoveryPenalty = player.isDelayed ? 8 : player.isRecovering ? 4 : 0;

  return clamp(base - recoveryPenalty);
}

function toContinuationPlayer(player: PlayerMatchState): ReboundContinuationPlayer {
  return {
    playerId: player.playerId,
    roleInitials: player.roleInitials,
    teamId: player.teamId,
    zone: player.zone,
    reactionScore: playerReactionScore(player),
  };
}

function nearestPlayers(input: {
  readonly players: readonly PlayerMatchState[];
  readonly teamId: string;
  readonly reboundZone: ZoneId;
  readonly limit: number;
  readonly excludedPlayerId?: string;
}): readonly ReboundContinuationPlayer[] {
  return input.players
    .filter((player) => player.teamId === input.teamId && player.playerId !== input.excludedPlayerId)
    .sort((left, right) => {
      const leftDistance = zoneDistance(left.zone, input.reboundZone);
      const rightDistance = zoneDistance(right.zone, input.reboundZone);

      return leftDistance === rightDistance ? playerReactionScore(right) - playerReactionScore(left) : leftDistance - rightDistance;
    })
    .slice(0, input.limit)
    .map(toContinuationPlayer);
}

function averageReaction(players: readonly ReboundContinuationPlayer[]): number {
  return players.length === 0 ? 50 : clamp(players.reduce((sum, player) => sum + player.reactionScore, 0) / players.length);
}

function dangerFromZone(input: { readonly reboundZone: ZoneId; readonly attackingTeamId: string }): ReboundDangerLevel {
  const depth = longitudinal(input.reboundZone);
  const dangerDepth = input.attackingTeamId === "control" ? depth : 8 - depth;

  if (dangerDepth >= 6) {
    return "HIGH";
  }

  if (dangerDepth >= 5) {
    return "MEDIUM";
  }

  if (dangerDepth >= 4) {
    return "LOW";
  }

  return "NONE";
}

function ballHeightForRebound(input: { readonly reboundType: ReboundType; readonly spinOrDeflectionSeverity: number }): ReboundBallHeight {
  if (input.reboundType === "OUT_OF_PLAY" || input.spinOrDeflectionSeverity >= 78) {
    return "HIGH";
  }

  if (input.spinOrDeflectionSeverity >= 48) {
    return "MID";
  }

  return "LOW";
}

export function createReboundContinuationContext(input: {
  readonly reboundSourceActionId: string;
  readonly reboundResolution: ReboundResolution;
  readonly attackingTeamId: string;
  readonly defendingTeamId: string;
  readonly goalkeeperId: string;
  readonly goalkeeperRecoveryScore: number;
  readonly ballSpeed: number;
  readonly spinOrDeflectionSeverity: number;
  readonly contactRisk: number;
  readonly players: readonly PlayerMatchState[];
}): ReboundContinuationContext {
  const fallbackZone = input.players.find((player) => player.playerId === input.goalkeeperId)?.zone ?? "Z4-C";
  const reboundZone = input.reboundResolution.reboundZone === "NONE" || input.reboundResolution.reboundZone === "OUT_OF_PLAY"
    ? fallbackZone
    : input.reboundResolution.reboundZone;
  const nearestAttackers = nearestPlayers({
    players: input.players,
    teamId: input.attackingTeamId,
    reboundZone,
    limit: 3,
  });
  const nearestDefenders = nearestPlayers({
    players: input.players,
    teamId: input.defendingTeamId,
    reboundZone,
    limit: 3,
    excludedPlayerId: input.goalkeeperId,
  });
  const defenderReactionScore = averageReaction(nearestDefenders);
  const attackerReactionScore = averageReaction(nearestAttackers);

  return {
    reboundSourceActionId: input.reboundSourceActionId,
    reboundType: input.reboundResolution.reboundType,
    reboundZone: input.reboundResolution.reboundZone,
    ballHeight: ballHeightForRebound({
      reboundType: input.reboundResolution.reboundType,
      spinOrDeflectionSeverity: input.spinOrDeflectionSeverity,
    }),
    ballSpeed: clamp(input.ballSpeed),
    spinOrDeflectionSeverity: clamp(input.spinOrDeflectionSeverity),
    attackingTeamId: input.attackingTeamId,
    defendingTeamId: input.defendingTeamId,
    goalkeeperId: input.goalkeeperId,
    nearestAttackers,
    nearestDefenders,
    goalkeeperRecoveryScore: clamp(input.goalkeeperRecoveryScore),
    defenderReactionScore,
    attackerReactionScore,
    contactRisk: clamp(input.contactRisk),
    goalDangerLevel: dangerFromZone({ reboundZone, attackingTeamId: input.attackingTeamId }),
  };
}

export function resolveReboundContinuation(context: ReboundContinuationContext): ReboundContinuationResult {
  if (context.reboundType === "NONE") {
    return {
      resolved: true,
      reboundWinner: "OUT_OF_PLAY",
      nextPossession: "OUT_OF_PLAY",
      continuationType: "OUT_OF_PLAY",
      continuationZone: context.reboundZone,
      immediateDanger: "NONE",
      reason: "No live rebound exists after the shot phase.",
    };
  }

  if (context.reboundType === "OUT_OF_PLAY") {
    return {
      resolved: true,
      reboundWinner: "OUT_OF_PLAY",
      nextPossession: "OUT_OF_PLAY",
      continuationType: "OUT_OF_PLAY",
      continuationZone: context.reboundZone,
      immediateDanger: "NONE",
      reason: "Rebound leaves play before either team can continue the action.",
    };
  }

  if (context.reboundType === "GK_CONTROLLED") {
    return {
      resolved: true,
      reboundWinner: "GOALKEEPER",
      winningPlayerId: context.goalkeeperId,
      winningPlayerInitials: "GK",
      nextPossession: context.defendingTeamId,
      continuationType: "GK_RECOVERY",
      continuationZone: context.reboundZone,
      immediateDanger: "NONE",
      reason: "Goalkeeper controls the rebound and ends the second-action threat.",
    };
  }

  const bestAttacker = context.nearestAttackers[0];
  const bestDefender = context.nearestDefenders[0];
  const attackerDistance = bestDistance(bestAttacker, context.reboundZone);
  const defenderDistance = bestDistance(bestDefender, context.reboundZone);
  const proximitySwing = (defenderDistance - attackerDistance) * 8;
  const attackerMomentumImpact = teamCrashBonus(context.attackingTeamId) + Math.max(0, 12 - attackerDistance * 4);
  const attackerChaosImpact = context.spinOrDeflectionSeverity * 0.08 + context.contactRisk * 0.08;
  const defenderStructureImpact = context.nearestDefenders.length * 2.5 + Math.max(0, 8 - defenderDistance * 3);
  const defenderReactionDelay = context.reboundType === "CONTESTED" ? context.spinOrDeflectionSeverity * 0.1 + context.contactRisk * 0.08 : 0;
  const gkRecoveryImpact = context.goalkeeperRecoveryScore * 0.08;
  const gkBalancePenalty = context.spinOrDeflectionSeverity * 0.08 + context.ballSpeed * 0.05;
  const attackerEdge =
    context.attackerReactionScore +
    context.nearestAttackers.length * 1.5 +
    proximitySwing * 0.42 +
    attackerMomentumImpact * 0.58 +
    attackerChaosImpact * 0.62;
  const defenderEdge =
    context.defenderReactionScore +
    defenderStructureImpact +
    gkRecoveryImpact -
    defenderReactionDelay * 0.5;
  const gkEdge =
    context.goalkeeperRecoveryScore +
    (context.ballHeight === "LOW" ? 6 : 0) -
    gkBalancePenalty;
  const chaosScore =
    context.contactRisk * 0.45 +
    context.spinOrDeflectionSeverity * 0.32 +
    (Math.abs(attackerEdge - defenderEdge) <= 6 ? 12 : 0);
  const actionIndex = sourceIndex(context.reboundSourceActionId);
  const sequenceIndex = sourceSequence(context.reboundSourceActionId);
  const sourceVariant = (sequenceIndex * 7 + actionIndex * 3) % 10;
  const scramble = resolveScramble({
    sourceActionId: context.reboundSourceActionId,
    reboundZone: context.reboundZone,
    ballHeight: context.ballHeight,
    ballSpeed: context.ballSpeed,
    deflectionSeverity: context.spinOrDeflectionSeverity,
    contactDensity: clamp(context.contactRisk + context.nearestAttackers.length * 4 + context.nearestDefenders.length * 3),
    nearestAttackers: context.nearestAttackers,
    nearestDefenders: context.nearestDefenders,
    attackerMomentumScore: clamp(attackerEdge),
    defenderMomentumScore: clamp(defenderEdge),
    goalkeeperRecoveryScore: context.goalkeeperRecoveryScore,
    looseBallDuration: clamp(context.spinOrDeflectionSeverity * 0.42 + context.ballSpeed * 0.22 + context.contactRisk * 0.2),
    collisionRisk: clamp(context.contactRisk + (Math.abs(attackerEdge - defenderEdge) <= 8 ? 12 : 0)),
    foulRisk: clamp(context.contactRisk * 0.72 + context.spinOrDeflectionSeverity * 0.12),
    attackingTeamId: context.attackingTeamId,
    defendingTeamId: context.defendingTeamId,
    goalkeeperId: context.goalkeeperId,
    immediateDangerBase: context.goalDangerLevel,
  });

  if (context.reboundType === "DEFENDER_CONTROLLED" && context.contactRisk < 62 && defenderEdge >= attackerEdge + 12 && bestDefender !== undefined) {
    return {
      resolved: true,
      reboundWinner: "DEFENDER",
      winningPlayerId: bestDefender.playerId,
      winningPlayerInitials: bestDefender.roleInitials,
      nextPossession: context.defendingTeamId,
      continuationType: "DEFENSIVE_CLEARANCE",
      continuationZone: context.reboundZone,
      immediateDanger: "NONE",
      reason: `${bestDefender.roleInitials} has clean defensive structure and clears the rebound before pressure arrives.`,
    };
  }

  if (context.reboundType === "CONTESTED" && sourceVariant === 3) {
    return {
      resolved: true,
      reboundWinner: "GOALKEEPER",
      winningPlayerId: context.goalkeeperId,
      winningPlayerInitials: "GK",
      nextPossession: context.defendingTeamId,
      continuationType: "GK_RECOVERY",
      continuationZone: context.reboundZone,
      immediateDanger: "NONE",
      reason: "Goalkeeper stays close enough to the spill to gather the rebound before the crash arrives.",
    };
  }

  if (scramble.scrambleTriggered) {
    return {
      resolved: true,
      reboundWinner: scramble.scrambleWinner,
      ...(scramble.winningPlayerId === undefined ? {} : { winningPlayerId: scramble.winningPlayerId }),
      ...(scramble.winningPlayerInitials === undefined ? {} : { winningPlayerInitials: scramble.winningPlayerInitials }),
      nextPossession: scramble.nextPossession,
      continuationType:
        scramble.continuationType === "SCRAMBLE_CONTINUES"
          ? "SCRAMBLE"
          : scramble.continuationType,
      continuationZone: context.reboundZone,
      immediateDanger: scramble.immediateDanger,
      reason: `${scramble.scrambleType}: ${scramble.reason}`,
    };
  }

  if (context.reboundType === "CONTESTED" && sourceVariant === 4 && bestAttacker !== undefined && context.goalDangerLevel !== "NONE") {
    return {
      resolved: true,
      reboundWinner: "ATTACKER",
      winningPlayerId: bestAttacker.playerId,
      winningPlayerInitials: bestAttacker.roleInitials,
      nextPossession: context.attackingTeamId,
      continuationType: "ATTACKER_RECOVERY",
      continuationZone: context.reboundZone,
      immediateDanger: context.goalDangerLevel === "HIGH" ? "MEDIUM" : context.goalDangerLevel,
      reason: `${bestAttacker.roleInitials} times the rebound crash and recovers the loose ball before the clearance can settle.`,
    };
  }

  if (context.reboundType === "CONTESTED" && sourceVariant === 7 && bestAttacker !== undefined && context.goalDangerLevel === "HIGH") {
    return {
      resolved: true,
      reboundWinner: "ATTACKER",
      winningPlayerId: bestAttacker.playerId,
      winningPlayerInitials: bestAttacker.roleInitials,
      nextPossession: context.attackingTeamId,
      continuationType: "SECOND_SHOT_WINDOW",
      continuationZone: context.reboundZone,
      immediateDanger: "HIGH",
      reason: `${bestAttacker.roleInitials} reaches the central spill first and opens a second-shot window.`,
    };
  }

  if ((sourceVariant === 3 || sourceVariant === 4) && gkEdge >= attackerEdge - 18 && gkEdge >= defenderEdge - 22) {
    return {
      resolved: true,
      reboundWinner: "GOALKEEPER",
      winningPlayerId: context.goalkeeperId,
      winningPlayerInitials: "GK",
      nextPossession: context.defendingTeamId,
      continuationType: "GK_RECOVERY",
      continuationZone: context.reboundZone,
      immediateDanger: "NONE",
      reason: "Goalkeeper remains balanced enough after the save/deflection to gather before a second shot forms.",
    };
  }

  if (
    attackerEdge >= defenderEdge + 10 &&
    bestAttacker !== undefined &&
    context.goalDangerLevel !== "NONE" &&
    (sourceVariant === 0 || sourceVariant === 7)
  ) {
    return {
      resolved: true,
      reboundWinner: "ATTACKER",
      winningPlayerId: bestAttacker.playerId,
      winningPlayerInitials: bestAttacker.roleInitials,
      nextPossession: context.attackingTeamId,
      continuationType:
        context.goalDangerLevel === "HIGH" && sourceVariant === 7
          ? "SECOND_SHOT_WINDOW"
          : "ATTACKER_RECOVERY",
      continuationZone: context.reboundZone,
      immediateDanger: context.goalDangerLevel === "HIGH" ? "HIGH" : "MEDIUM",
      reason: `${bestAttacker.roleInitials} crashes from close range with enough momentum to beat the first clearance action.`,
    };
  }

  if (defenderEdge >= attackerEdge - 6 && bestDefender !== undefined) {
    return {
      resolved: true,
      reboundWinner: "DEFENDER",
      winningPlayerId: bestDefender.playerId,
      winningPlayerInitials: bestDefender.roleInitials,
      nextPossession: context.defendingTeamId,
      continuationType: "DEFENSIVE_CLEARANCE",
      continuationZone: context.reboundZone,
      immediateDanger: context.goalDangerLevel === "HIGH" ? "LOW" : "NONE",
      reason: `${bestDefender.roleInitials} reacts first, but the clearance is earned through structure rather than automatic defender dominance.`,
    };
  }

  if (attackerEdge >= defenderEdge + 8 && bestAttacker !== undefined && context.goalDangerLevel !== "NONE") {
    return {
      resolved: true,
      reboundWinner: "ATTACKER",
      winningPlayerId: bestAttacker.playerId,
      winningPlayerInitials: bestAttacker.roleInitials,
      nextPossession: context.attackingTeamId,
      continuationType: context.goalDangerLevel === "HIGH" && sourceVariant === 7 ? "SECOND_SHOT_WINDOW" : "ATTACKER_RECOVERY",
      continuationZone: context.reboundZone,
      immediateDanger: context.goalDangerLevel === "HIGH" ? "MEDIUM" : context.goalDangerLevel,
      reason: `${bestAttacker.roleInitials} arrives with enough proximity to keep the rebound alive for attacking continuation.`,
    };
  }

  if (context.ballSpeed >= 82 || context.spinOrDeflectionSeverity >= 84) {
    return {
      resolved: true,
      reboundWinner: "OUT_OF_PLAY",
      nextPossession: "OUT_OF_PLAY",
      continuationType: "OUT_OF_PLAY",
      continuationZone: "OUT_OF_PLAY",
      immediateDanger: "NONE",
      reason: "The deflection carries too much speed/severity and runs out before the rebound can be contested.",
    };
  }

  return {
    resolved: context.contactRisk < 78,
    reboundWinner: "CONTESTED_REMAINS",
    nextPossession: "CONTESTED",
    continuationType: "SCRAMBLE",
    continuationZone: context.reboundZone,
    immediateDanger: context.goalDangerLevel === "HIGH" ? "HIGH" : "MEDIUM",
    reason:
      context.contactRisk >= 78
        ? "High contact risk prevents clean control; the rebound remains explicitly contested."
        : "Neither side wins the first reaction cleanly, so the rebound continuation becomes a short scramble.",
  };
}
