import { PressureLevel } from "../../../models/match";
import { TacticalStyle } from "../../../models/tactics";
import { LaneAvailability } from "../types";
import { OffensiveUrgencyLevel, ThreatLevel, type OffensiveUrgencyEvaluation, type SpatialIntentionContext } from "./types";

function levelFromScore(score: number): OffensiveUrgencyLevel {
  if (score >= 82) {
    return OffensiveUrgencyLevel.Critical;
  }

  if (score >= 64) {
    return OffensiveUrgencyLevel.High;
  }

  if (score >= 42) {
    return OffensiveUrgencyLevel.Medium;
  }

  return OffensiveUrgencyLevel.Low;
}

function threatScore(level: ThreatLevel | undefined): number {
  switch (level) {
    case ThreatLevel.High:
      return 24;
    case ThreatLevel.Medium:
      return 12;
    case ThreatLevel.Low:
    case undefined:
      return 0;
  }
}

export function evaluateOffensiveUrgency(context: SpatialIntentionContext): OffensiveUrgencyEvaluation {
  const legalFinishing = context.finishingOptionLabel !== undefined && context.scoringThreat !== ThreatLevel.Low;
  const weakSideOpen =
    context.weakSide.exposure >= 68 || context.weakSide.switchPlayOpportunity === LaneAvailability.Open;
  const blockStretched = context.defensiveCompactness.overallCompactness <= 58;
  const teamInstructions = context.team.tacticalInstructions.offensive;
  const identityNudge =
    context.team.tacticalStyle === TacticalStyle.Blitz || context.team.tacticalStyle === TacticalStyle.ChaosHunters
      ? 8
      : context.team.tacticalStyle === TacticalStyle.Control
        ? -4
        : -8;
  const pressureNudge = context.currentPressure === PressureLevel.High ? 4 : 0;
  const score = Math.round(
    12 +
      threatScore(context.scoringThreat) +
      threatScore(context.tacticalDanger) +
      context.territorialPressure * 0.18 +
      context.weakSide.exposure * 0.14 +
      teamInstructions.riskLevel * 0.08 +
      teamInstructions.verticality * 0.1 -
      teamInstructions.collectiveness * 0.04 +
      (legalFinishing ? 14 : 0) +
      (weakSideOpen ? 8 : 0) +
      (blockStretched ? 8 : 0) +
      identityNudge +
      pressureNudge,
  );
  const level = levelFromScore(score);
  const reasons = [
    ...(context.scoringThreat === ThreatLevel.High ? ["scoring danger HIGH"] : []),
    ...(context.tacticalDanger === ThreatLevel.High ? ["tactical danger HIGH"] : []),
    ...(context.territorialPressure >= 75 ? ["territorial pressure HIGH"] : []),
    ...(weakSideOpen ? ["weak side exposure HIGH"] : []),
    ...(blockStretched ? ["defensive block stretched"] : []),
    ...(legalFinishing ? [`legal ${context.finishingOptionLabel?.toLowerCase()} available`] : []),
  ];

  return {
    score: Math.max(0, Math.min(100, score)),
    level,
    reasons: reasons.length === 0 ? ["no immediate conversion pressure"] : reasons,
  };
}
