import { pointValueForConversionOutcome } from "../scoring/conversionRules";
import type { ConversionAttemptContext, ConversionAttemptResult, ConversionOutcome } from "./conversionAttemptTypes";

const CONVERSION_SUCCESS_THRESHOLD = 30;

function matchIdFromSource(sourceTryActionId: string): string {
  const index = sourceTryActionId.lastIndexOf("-try");
  return index > 0 ? sourceTryActionId.slice(0, index) : sourceTryActionId;
}

function outcomeForScore(input: {
  readonly finalDifficultyScore: number;
  readonly defenderChargePressure: number;
  readonly defendingTeamBehindGoalLine: boolean;
}): ConversionOutcome {
  if (!input.defendingTeamBehindGoalLine) {
    return "CONVERSION_INVALID";
  }

  if (input.defenderChargePressure >= 76 && input.finalDifficultyScore < CONVERSION_SUCCESS_THRESHOLD + 6) {
    return "CONVERSION_BLOCKED";
  }

  return input.finalDifficultyScore >= CONVERSION_SUCCESS_THRESHOLD ? "CONVERSION_GOAL" : "CONVERSION_MISSED";
}

function laneDifficulty(groundingLane: string): number {
  if (groundingLane === "C") {
    return 0;
  }

  if (groundingLane === "HSL" || groundingLane === "HSR") {
    return 4;
  }

  return 8;
}

function selectedPointQuality(input: ConversionAttemptContext): number {
  const base = input.groundingLane === "C" ? 84 : input.groundingLane === "HSL" || input.groundingLane === "HSR" ? 70 : 60;
  const distanceAdjustment = input.distanceFromGoalLine <= 15 ? 3 : input.distanceFromGoalLine <= 22 ? 0 : -5;

  return Math.max(45, Math.min(90, base + distanceAdjustment - Math.round(input.angleDifficulty / 14)));
}

function anglePenalty(input: ConversionAttemptContext): number {
  const multiplier = input.groundingLane === "C" ? 0.16 : input.groundingLane === "HSL" || input.groundingLane === "HSR" ? 0.22 : 0.18;

  return Math.round(input.angleDifficulty * multiplier);
}

function distancePenalty(distanceFromGoalLine: number): number {
  if (distanceFromGoalLine <= 15) {
    return 0;
  }

  if (distanceFromGoalLine <= 22) {
    return Math.round((distanceFromGoalLine - 15) * 0.45);
  }

  return Math.round(3 + (distanceFromGoalLine - 22) * 0.65);
}

function defenderChargePressureModifier(defenderChargePressure: number): number {
  return Math.round(defenderChargePressure * 0.08);
}

function kickRhythmModifier(sourceTryActionId: string): number {
  const match = /match-(\d+)/.exec(sourceTryActionId);
  const numericSeed = match?.[1] === undefined ? 0 : Number.parseInt(match[1], 10);
  const modifiers = [1, -4, 3, 5] as const;

  return modifiers[numericSeed % modifiers.length] ?? 0;
}

export function resolveConversionAttempt(context: ConversionAttemptContext): ConversionAttemptResult {
  const weatherPenalty = context.weatherPenalty ?? 0;
  const pointQuality = selectedPointQuality(context);
  const lanePenalty = laneDifficulty(context.groundingLane);
  const distance = distancePenalty(context.distanceFromGoalLine);
  const angle = anglePenalty(context);
  const defenderCharge = defenderChargePressureModifier(context.defenderChargePressure);
  const pressureDifficulty = context.pressurePenalty + defenderCharge + weatherPenalty;
  const rhythm = kickRhythmModifier(context.sourceTryActionId);
  const kickExecutionScore = Math.round(
      context.kickerAccuracy * 0.38 +
      context.kickerPower * 0.2 +
      context.kickerComposure * 0.28 +
      pointQuality * 0.12 +
      rhythm,
  );
  const geometryDifficultyScore = lanePenalty + distance + angle;
  const finalDifficultyScore = Math.round(
    kickExecutionScore -
      context.fatiguePenalty -
      pressureDifficulty -
      geometryDifficultyScore,
  );
  const cleanKickScore = finalDifficultyScore;
  const outcome = outcomeForScore({
    finalDifficultyScore,
    defenderChargePressure: context.defenderChargePressure,
    defendingTeamBehindGoalLine: context.defendingTeamBehindGoalLine,
  });
  const pointValue = pointValueForConversionOutcome(outcome);
  const scoringAction = outcome === "CONVERSION_GOAL" ? "CONVERSION_GOAL" : "NONE";
  const reason =
    outcome === "CONVERSION_GOAL"
      ? `${context.kickerRole} converts from ${context.selectedConversionPoint}; final kick score ${finalDifficultyScore} clears the ${CONVERSION_SUCCESS_THRESHOLD} conversion threshold.`
      : outcome === "CONVERSION_BLOCKED"
        ? `${context.kickerRole}'s conversion is blocked after defender charge pressure ${context.defenderChargePressure}/100 compresses the kick window.`
        : outcome === "CONVERSION_INVALID"
          ? "Conversion invalid because the defending team was not set behind the goal line or geometry was illegal."
          : `${context.kickerRole} misses from ${context.selectedConversionPoint}; angle, lane, distance, and pressure leave the final kick score at ${finalDifficultyScore}.`;

  return {
    resolved: true,
    sourceTryActionId: context.sourceTryActionId,
    matchId: matchIdFromSource(context.sourceTryActionId),
    scoringTeamId: context.scoringTeamId,
    scoringTeamName: context.scoringTeamName,
    defendingTeamId: context.defendingTeamId,
    kickerId: context.kickerId,
    kickerRole: context.kickerRole,
    groundingZone: context.groundingZone,
    groundingLane: context.groundingLane,
    groundingPoint: context.groundingPoint,
    conversionLine: context.conversionLine,
    selectedConversionPoint: context.selectedConversionPoint,
    distanceFromGoalLine: context.distanceFromGoalLine,
    angleDifficulty: context.angleDifficulty,
    kickerAccuracy: context.kickerAccuracy,
    kickerPower: context.kickerPower,
    kickerComposure: context.kickerComposure,
    fatiguePenalty: context.fatiguePenalty,
    pressurePenalty: context.pressurePenalty,
    defenderChargePressure: context.defenderChargePressure,
    defendingTeamBehindGoalLine: context.defendingTeamBehindGoalLine,
    selectedPointQuality: pointQuality,
    laneDifficulty: lanePenalty,
    distancePenalty: distance,
    anglePenalty: angle,
    defenderChargePressureModifier: defenderCharge,
    pressureDifficultyScore: pressureDifficulty,
    kickRhythmModifier: rhythm,
    kickExecutionScore,
    geometryDifficultyScore,
    finalDifficultyScore,
    cleanKickScore,
    outcome,
    scoringAction,
    pointValue,
    scoreBefore: context.scoreBefore,
    scoreAfter: pointValue > 0 ? context.scoreAfterIfGoal : context.scoreAfterIfNoScore,
    conversionActive: true,
    reason,
  };
}
