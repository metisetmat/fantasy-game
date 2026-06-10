import type { ReboundDangerLevel } from "./reboundContinuationTypes";
import type { ScrambleContext, ScrambleResult, ScrambleType } from "./scrambleResolutionTypes";

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function sourceIndex(actionId: string): number {
  const match = /a(\d+)$/.exec(actionId);
  return match === null ? 0 : Number.parseInt(match[1] ?? "0", 10);
}

function sourceSequence(actionId: string): number {
  const match = /s(\d+)-a/.exec(actionId);
  return match === null ? 0 : Number.parseInt(match[1] ?? "0", 10);
}

function dangerFromScramble(input: { readonly type: ScrambleType; readonly base: ReboundDangerLevel }): ReboundDangerLevel {
  if (input.type === "DESPERATE_SECOND_SHOT") {
    return "HIGH";
  }

  if (input.type === "LOOSE_BALL" || input.type === "CONTACT_CONTEST") {
    return input.base === "HIGH" ? "HIGH" : "MEDIUM";
  }

  if (input.type === "CHAOTIC_CLEARANCE" || input.type === "DOUBLE_TOUCH") {
    return input.base === "HIGH" ? "MEDIUM" : "LOW";
  }

  return input.base;
}

function scrambleType(context: ScrambleContext): ScrambleType {
  if (context.ballSpeed >= 84 || context.deflectionSeverity >= 86) {
    return "CHAOTIC_CLEARANCE";
  }

  if (context.collisionRisk >= 76 || context.contactDensity >= 74) {
    return "CONTACT_CONTEST";
  }

  if (context.looseBallDuration >= 64) {
    return "LOOSE_BALL";
  }

  return "NONE";
}

export function resolveScramble(context: ScrambleContext): ScrambleResult {
  if (context.reboundZone === "OUT_OF_PLAY" || context.reboundZone === "NONE") {
    return {
      scrambleTriggered: false,
      scrambleType: "NONE",
      scrambleWinner: "OUT_OF_PLAY",
      nextPossession: "OUT_OF_PLAY",
      continuationType: "OUT_OF_PLAY",
      immediateDanger: "NONE",
      reason: "No scramble is available when the rebound has already left play.",
    };
  }

  const type = scrambleType(context);
  const attackerScore = clamp(context.attackerMomentumScore + context.looseBallDuration * 0.22 + context.contactDensity * 0.1);
  const defenderScore = clamp(context.defenderMomentumScore + context.contactDensity * 0.18 - context.looseBallDuration * 0.08);
  const gkScore = clamp(context.goalkeeperRecoveryScore - context.deflectionSeverity * 0.18 - context.ballSpeed * 0.08);
  const closeRace = Math.abs(attackerScore - defenderScore) <= 10;
  const variant = (sourceSequence(context.sourceActionId) * 5 + sourceIndex(context.sourceActionId) * 4) % 10;
  const shouldTrigger =
    type !== "NONE" &&
    gkScore < Math.max(attackerScore, defenderScore) + 12 &&
    (variant === 1 || variant === 4 || variant === 8) &&
    (closeRace || context.contactDensity >= 74 || context.looseBallDuration >= 64 || variant === 4);

  if (!shouldTrigger) {
    return {
      scrambleTriggered: false,
      scrambleType: "NONE",
      scrambleWinner: "CONTESTED_REMAINS",
      nextPossession: "CONTESTED",
      continuationType: "SCRAMBLE_CONTINUES",
      immediateDanger: context.immediateDangerBase,
      reason: "Race margins are not close enough for a contact scramble.",
    };
  }

  const bestAttacker = context.nearestAttackers[0];
  const bestDefender = context.nearestDefenders[0];

  if (gkScore >= attackerScore + 8 && gkScore >= defenderScore + 6) {
    return {
      scrambleTriggered: true,
      scrambleType: type,
      scrambleWinner: "GOALKEEPER",
      winningPlayerId: context.goalkeeperId,
      winningPlayerInitials: "GK",
      nextPossession: context.defendingTeamId,
      continuationType: "GK_RECOVERY",
      immediateDanger: "NONE",
      reason: "Goalkeeper dives onto the loose ball after the contact contest stalls both outfield players.",
    };
  }

  if (variant === 1 && bestAttacker !== undefined && context.immediateDangerBase === "HIGH") {
    return {
      scrambleTriggered: true,
      scrambleType: "DESPERATE_SECOND_SHOT",
      scrambleWinner: "ATTACKER",
      winningPlayerId: bestAttacker.playerId,
      winningPlayerInitials: bestAttacker.roleInitials,
      nextPossession: context.attackingTeamId,
      continuationType: "SECOND_SHOT_WINDOW",
      immediateDanger: "HIGH",
      reason: `${bestAttacker.roleInitials} pokes the loose ball out of the contact contest into a desperate second-shot window.`,
    };
  }

  if (attackerScore >= defenderScore + 8 && bestAttacker !== undefined) {
    return {
      scrambleTriggered: true,
      scrambleType: type,
      scrambleWinner: "ATTACKER",
      winningPlayerId: bestAttacker.playerId,
      winningPlayerInitials: bestAttacker.roleInitials,
      nextPossession: context.attackingTeamId,
      continuationType: "ATTACKER_RECOVERY",
      immediateDanger: dangerFromScramble({ type: "LOOSE_BALL", base: context.immediateDangerBase }),
      reason: `${bestAttacker.roleInitials} wins the loose-ball contact and keeps the rebound alive under pressure.`,
    };
  }

  if (variant === 8 || context.foulRisk >= 72) {
    return {
      scrambleTriggered: true,
      scrambleType: "CHAOTIC_CLEARANCE",
      scrambleWinner: "CONTESTED_REMAINS",
      nextPossession: "CONTESTED",
      continuationType: "SCRAMBLE_CONTINUES",
      immediateDanger: dangerFromScramble({ type: "CHAOTIC_CLEARANCE", base: context.immediateDangerBase }),
      reason: "The first clearance miscues under contact, so the ball remains loose instead of resolving cleanly.",
    };
  }

  if (bestDefender !== undefined) {
    return {
      scrambleTriggered: true,
      scrambleType: type,
      scrambleWinner: "DEFENDER",
      winningPlayerId: bestDefender.playerId,
      winningPlayerInitials: bestDefender.roleInitials,
      nextPossession: context.defendingTeamId,
      continuationType: "DEFENSIVE_CLEARANCE",
      immediateDanger: dangerFromScramble({ type, base: context.immediateDangerBase }),
      reason: `${bestDefender.roleInitials} wins the collision and turns the scramble into a clearance.`,
    };
  }

  return {
    scrambleTriggered: true,
    scrambleType: type,
    scrambleWinner: "OUT_OF_PLAY",
    nextPossession: "OUT_OF_PLAY",
    continuationType: "OUT_OF_PLAY",
    immediateDanger: "NONE",
    reason: "The loose ball ricochets out after neither side controls the contact contest.",
  };
}
