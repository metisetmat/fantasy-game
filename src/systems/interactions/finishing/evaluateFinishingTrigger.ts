import { LongitudinalZone, type ZoneId } from "../../../core/zones";
import { ScoringType } from "../../../models/scoring";
import { BallUsageStyle, type OffensiveInstructions } from "../../../models/tactics";
import { AttackingDirection } from "../../spatial/intention";
import { getZoneParts } from "../../spatial/utils";
import { FinishingDangerLevel, type FinishingTriggerEvaluation } from "./types";

function getRelativeDepth(zone: LongitudinalZone, attackingDirection: AttackingDirection): number {
  const numericZone = Number(zone.slice(1));

  return attackingDirection === AttackingDirection.Z1ToZ7 ? numericZone : 8 - numericZone;
}

function levelFromScore(score: number): FinishingDangerLevel {
  if (score >= 70) {
    return FinishingDangerLevel.High;
  }

  if (score >= 42) {
    return FinishingDangerLevel.Medium;
  }

  return FinishingDangerLevel.Low;
}

function formatDirectionContext(input: {
  readonly teamName: string;
  readonly activeZone: ZoneId;
  readonly attackingDirection: AttackingDirection;
}): string {
  const directionText =
    input.attackingDirection === AttackingDirection.Z1ToZ7 ? "Z1 to Z7" : "Z7 to Z1";

  return `${input.teamName} attacks from ${directionText}; ${input.activeZone} is outside its scoring zones.`;
}

export function evaluateFinishingTrigger(input: {
  readonly teamName: string;
  readonly activeZone: ZoneId;
  readonly attackingDirection: AttackingDirection;
  readonly territorialPressure: number;
  readonly tacticalDanger: FinishingDangerLevel;
  readonly offensiveInstructions: OffensiveInstructions;
  readonly weakSideExposure: number;
}): FinishingTriggerEvaluation {
  const zone = getZoneParts(input.activeZone).longitudinalZone;
  const relativeDepth = getRelativeDepth(zone, input.attackingDirection);
  const dangerBonus = input.tacticalDanger === FinishingDangerLevel.High ? 20 : input.tacticalDanger === FinishingDangerLevel.Medium ? 8 : 0;
  const scoringDangerScore =
    relativeDepth * 12 +
    input.territorialPressure * 0.18 +
    input.weakSideExposure * 0.12 +
    dangerBonus;
  const scoringDanger = levelFromScore(scoringDangerScore);
  const footContext = input.offensiveInstructions.ballUsage === BallUsageStyle.FootOriented;

  if (relativeDepth <= 3) {
    return {
      triggered: false,
      scoringDanger: FinishingDangerLevel.Low,
      reason: `Finishing not triggered: ${formatDirectionContext(input)}`,
      possibleScoringTypes: [],
    };
  }

  if (relativeDepth === 4) {
    const dropOnly =
      input.territorialPressure >= 75 &&
      input.tacticalDanger === FinishingDangerLevel.High &&
      footContext;

    return {
      triggered: dropOnly,
      scoringDanger: dropOnly ? FinishingDangerLevel.Medium : FinishingDangerLevel.Low,
      reason: dropOnly
        ? "Finishing opportunity triggered: long drop window from midfield pressure."
        : "Finishing not triggered: midfield pressure lacks a legal drop window.",
      possibleScoringTypes: dropOnly ? [ScoringType.Drop] : [],
    };
  }

  if (relativeDepth === 5) {
    return {
      triggered: scoringDanger !== FinishingDangerLevel.Low,
      scoringDanger,
      reason:
        scoringDanger === FinishingDangerLevel.Low
          ? "Finishing not triggered: red-zone entry lacks scoring danger."
          : "Finishing opportunity triggered: attacking red-zone entry.",
      possibleScoringTypes: [ScoringType.Drop, ScoringType.Goal],
    };
  }

  if (relativeDepth === 6) {
    return {
      triggered: true,
      scoringDanger,
      reason: "Finishing opportunity triggered: deep scoring zone reached.",
      possibleScoringTypes: [ScoringType.Drop, ScoringType.Goal],
    };
  }

  return {
    triggered: true,
    scoringDanger: FinishingDangerLevel.High,
    reason: "Finishing opportunity triggered: try zone reached.",
    possibleScoringTypes: [ScoringType.Try, ScoringType.Drop, ScoringType.Goal],
  };
}
