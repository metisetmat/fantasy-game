import { SCORING_POINTS, ScoringType } from "../../../models/scoring";
import { PlayerRole } from "../../../models/player";
import { TacticalStyle } from "../../../models/tactics";
import type { TacticalTick } from "../../../core/ratings";
import type { ZoneId } from "../../../core/zones";
import type { SpatialTeamContext, WeakSideEvaluation } from "../../spatial";
import type { FinishingInteractionResult } from "../finishing";
import { ConversionIdentity } from "../finishing";
import { evaluateEmergencyClearance } from "./evaluateEmergencyClearance";
import { evaluateReboundControl } from "./evaluateReboundControl";
import { evaluateScrambleDanger } from "./evaluateScrambleDanger";
import { createSecondChanceLogs } from "./logging";
import {
  SecondChanceOutcome,
  type SecondChanceInteractionEvent,
  type SecondChanceInteractionResult,
  type SecondChanceScoreUpdate,
} from "./types";

export interface ResolveSecondChanceInput {
  readonly tick: TacticalTick;
  readonly offensiveTeam: SpatialTeamContext;
  readonly defensiveTeam: SpatialTeamContext;
  readonly activeZone: ZoneId;
  readonly chaosLevel: number;
  readonly weakSide: WeakSideEvaluation;
  readonly finishingResult: FinishingInteractionResult;
}

function chooseOutcome(input: {
  readonly offensiveTeam: SpatialTeamContext;
  readonly controlScore: number;
  readonly scrambleDanger: number;
  readonly clearanceScore: number;
  readonly conversionIdentity: ConversionIdentity;
}): SecondChanceOutcome {
  const dangerEdge = input.scrambleDanger - input.clearanceScore;
  const controlEdge = input.controlScore - input.clearanceScore;

  if (input.conversionIdentity === ConversionIdentity.ChaoticAggression) {
    if (dangerEdge >= 18) {
      return SecondChanceOutcome.ChaoticTry;
    }

    if (dangerEdge >= 4) {
      return SecondChanceOutcome.RushedSecondShot;
    }

    if (input.scrambleDanger >= 62 && input.controlScore < 58) {
      return SecondChanceOutcome.ScrambleTurnover;
    }
  }

  if (input.offensiveTeam.tacticalStyle === TacticalStyle.Control && controlEdge >= 8) {
    return SecondChanceOutcome.AttackingRecovery;
  }

  if (dangerEdge >= 12) {
    return SecondChanceOutcome.SecondChanceFinish;
  }

  if (input.clearanceScore >= input.scrambleDanger + 8) {
    return SecondChanceOutcome.EmergencyClearance;
  }

  if (input.controlScore >= 62) {
    return SecondChanceOutcome.AttackingRecovery;
  }

  if (input.clearanceScore >= 56) {
    return SecondChanceOutcome.DefensiveRecovery;
  }

  return SecondChanceOutcome.SequenceDies;
}

function createScoreUpdate(
  offensiveTeam: SpatialTeamContext,
  outcome: SecondChanceOutcome,
): SecondChanceScoreUpdate | null {
  if (outcome !== SecondChanceOutcome.ChaoticTry && outcome !== SecondChanceOutcome.SecondChanceFinish) {
    return null;
  }

  const scoringType = outcome === SecondChanceOutcome.ChaoticTry ? ScoringType.Try : ScoringType.Goal;

  return {
    scoringTeamId: offensiveTeam.teamId,
    scoringType,
    points: SCORING_POINTS[scoringType],
  };
}

function describeSummary(outcome: SecondChanceOutcome): string {
  switch (outcome) {
    case SecondChanceOutcome.SecondChanceFinish:
      return "Second-chance finish converts the rebound.";
    case SecondChanceOutcome.EmergencyClearance:
      return "Emergency clearance kills the second chance.";
    case SecondChanceOutcome.AttackingRecovery:
      return "Controlled second wave keeps attacking pressure alive.";
    case SecondChanceOutcome.DefensiveRecovery:
      return "Defensive recovery gathers the loose ball.";
    case SecondChanceOutcome.ScrambleTurnover:
      return "Scramble turnover flips the loose-ball phase.";
    case SecondChanceOutcome.ChaoticTry:
      return "Chaotic try scored from the loose rebound.";
    case SecondChanceOutcome.RushedSecondShot:
      return "Rushed second shot keeps the sequence dangerous but wasteful.";
    case SecondChanceOutcome.SequenceDies:
      return "Second-chance chaos dies before structure reforms.";
  }
}

export function resolveSecondChance(input: ResolveSecondChanceInput): SecondChanceInteractionResult {
  const reboundControl = evaluateReboundControl({
    offensiveTeam: input.offensiveTeam,
    conversionIdentity: input.finishingResult.finishingStyle.identity,
    chaosLevel: input.chaosLevel,
  });
  const scrambleDanger = evaluateScrambleDanger({
    offensiveTeam: input.offensiveTeam,
    defensiveTeam: input.defensiveTeam,
    weakSide: input.weakSide,
    conversionIdentity: input.finishingResult.finishingStyle.identity,
    chaosLevel: input.chaosLevel,
  });
  const emergencyClearance = evaluateEmergencyClearance({
    defensiveTeam: input.defensiveTeam,
    chaosLevel: input.chaosLevel,
  });
  const outcome = chooseOutcome({
    offensiveTeam: input.offensiveTeam,
    controlScore: reboundControl.controlScore,
    scrambleDanger: scrambleDanger.dangerScore,
    clearanceScore: emergencyClearance.clearanceScore,
    conversionIdentity: input.finishingResult.finishingStyle.identity,
  });
  const scoreUpdate = createScoreUpdate(input.offensiveTeam, outcome);
  const event: SecondChanceInteractionEvent = {
    tick: input.tick,
    offensiveTeamId: input.offensiveTeam.teamId,
    defensiveTeamId: input.defensiveTeam.teamId,
    activeZone: input.activeZone,
    involvedRoles: [PlayerRole.SpaceHunter, PlayerRole.FreeSafety],
    outcome,
    scoreUpdate,
    summary: describeSummary(outcome),
  };
  const resultWithoutLogs = {
    outcome,
    terminal: true as const,
    reboundControl,
    scrambleDanger,
    emergencyClearance,
    scoreUpdate,
    event,
  };

  return {
    ...resultWithoutLogs,
    logs: createSecondChanceLogs({
      result: resultWithoutLogs,
      offensiveTeamName: input.offensiveTeam.teamName,
      reboundLocation: input.activeZone,
      finishingStyle: input.finishingResult.finishingStyle.identity,
    }),
  };
}
