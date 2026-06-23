import type { ZoneId } from "../../core/zones";
import type { OfficialRouteFamily, OfficialRouteFamilyCandidate } from "./fullMatchOfficialRouteFamilyMix";
import type { FullMatchTeamSegmentState } from "./fullMatchSegmentState";

export type EarnedDangerResetSourceType =
  | "POST_SCORE_RESET"
  | "GOALKEEPER_SECURE"
  | "DEFENSIVE_RECOVERY"
  | "TURNOVER"
  | "NEUTRAL_PHASE"
  | "OUT_OF_PLAY"
  | "SAFE_POSSESSION";

export type EarnedDangerClassification =
  | "EARNED"
  | "BORDERLINE"
  | "AUTOMATIC_SUSPECTED"
  | "BLOCKED_BY_GATE"
  | "DOWNGRADED_TO_NEUTRAL"
  | "DOWNGRADED_TO_SAFE_POSSESSION";

export type EarnedDangerGateDecision =
  | "ALLOW_DANGER"
  | "ALLOW_BORDERLINE_DANGER"
  | "DOWNGRADE_TO_NEUTRAL"
  | "DOWNGRADE_TO_SAFE_POSSESSION"
  | "FORCE_REBUILD_PHASE"
  | "KEEP_RESET";

export type EarnedDangerGateReasonCode =
  | "SUPPORT_EDGE"
  | "SPACING_EDGE"
  | "TACTICAL_EDGE"
  | "ATTRIBUTE_EDGE"
  | "FATIGUE_EDGE"
  | "PRESSURE_EDGE"
  | "MISTAKE_EDGE"
  | "GOALKEEPER_SECURE_CONTEXT"
  | "POST_SCORE_CONTEXT"
  | "DEFENSIVE_RECOVERY_CONTEXT"
  | "LOW_SUPPORT"
  | "LOW_SPACING"
  | "LOW_TACTICAL_EDGE"
  | "LOW_ATTRIBUTE_EDGE"
  | "LOW_FATIGUE_EDGE"
  | "IMMEDIATE_AFTER_RESET"
  | "LEADING_TEAM_REATTACK"
  | "SAFE_POSSESSION_REQUIRED"
  | "NEUTRAL_REBUILD_REQUIRED";

export type EarnedDangerGateWarningCode =
  | "RESET_TO_IMMEDIATE_DANGER"
  | "RESET_TO_DANGER_WITHOUT_SUPPORT"
  | "RESET_TO_DANGER_WITHOUT_SPACING"
  | "RESET_TO_DANGER_WITHOUT_TACTICAL_EDGE"
  | "RESET_TO_DANGER_WITHOUT_ATTRIBUTE_EDGE"
  | "RESET_TO_DANGER_WITHOUT_FATIGUE_EDGE"
  | "RESET_TO_DANGER_DESPITE_GOALKEEPER_SECURE"
  | "RESET_TO_DANGER_DESPITE_DEFENSIVE_RECOVERY"
  | "RESET_TO_DANGER_TOO_FAST_AFTER_SCORE"
  | "AUTOMATIC_RESET_TO_DANGER_SUSPECTED"
  | "EARNED_DANGER_CONFIRMED"
  | "BORDERLINE_DANGER_ALLOWED"
  | "DANGER_DOWNGRADED_BY_GATE"
  | "DANGER_BLOCKED_BY_GATE"
  | "RESET_REBUILD_REQUIRED";

export type EarnedDangerGateCalibrationVersion =
  | "EARNED_DANGER_GATE_6N"
  | "EARNED_DANGER_GATE_TUNING_6O";

export interface EarnedDangerGateResult {
  readonly connected: boolean;
  readonly resetSourceType: EarnedDangerResetSourceType;
  readonly dangerRouteFamily: OfficialRouteFamily;
  readonly dangerZone: ZoneId;
  readonly dangerGeneratedImmediately: boolean;
  readonly attackingSupportScore: number;
  readonly attackingSpacingScore: number;
  readonly attackingStructureScore: number;
  readonly attackingTransitionSpeedScore: number;
  readonly attackingTechnicalEdgeScore: number;
  readonly attackingPhysicalEdgeScore: number;
  readonly defendingRestDefenseScore: number;
  readonly defendingRecoveryScore: number;
  readonly defendingSpacingScore: number;
  readonly defendingPressureScore: number;
  readonly tacticalEdgeScore: number;
  readonly attributeEdgeScore: number;
  readonly fatigueEdgeScore: number;
  readonly pressureEdgeScore: number;
  readonly mistakeEdgeScore: number;
  readonly earnedDangerScore: number;
  readonly earnedDangerClassification: EarnedDangerClassification;
  readonly gateDecision: EarnedDangerGateDecision;
  readonly gateReasonCodes: readonly EarnedDangerGateReasonCode[];
  readonly warningCodes: readonly EarnedDangerGateWarningCode[];
  readonly recommendation: string;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function routeFamilyEdge(family: OfficialRouteFamily): number {
  if (family === "TRY_TOUCHDOWN") {
    return 8;
  }
  if (family === "DROP_GOAL") {
    return 5;
  }
  if (family === "SHOT_GOAL") {
    return 2;
  }
  return 0;
}

function spacingFromZone(zone: ZoneId): number {
  const value = String(zone);
  const wideBonus = value.includes("L") || value.includes("R") ? 16 : 0;
  const halfSpaceBonus = value.includes("HS") ? 10 : 0;
  const centralPenalty = value.includes("-C") ? 10 : 0;
  return clamp(48 + wideBonus + halfSpaceBonus - centralPenalty);
}

function sourcePressure(resetSourceType: EarnedDangerResetSourceType): number {
  if (resetSourceType === "GOALKEEPER_SECURE") {
    return 22;
  }
  if (resetSourceType === "POST_SCORE_RESET") {
    return 18;
  }
  if (resetSourceType === "DEFENSIVE_RECOVERY") {
    return 12;
  }
  return 0;
}

export function computeEarnedDangerGate(input: {
  readonly candidate: OfficialRouteFamilyCandidate;
  readonly teamState: FullMatchTeamSegmentState;
  readonly resetSourceType: EarnedDangerResetSourceType;
  readonly scoreDelta: number;
  readonly pressureFatigueLoad: number;
  readonly deterministicBreak: number;
  readonly recentResetToDangerWindow: boolean;
  readonly goalkeeperSecureContext: boolean;
  readonly postScoreContext: boolean;
  readonly calibrationVersion?: EarnedDangerGateCalibrationVersion;
}): EarnedDangerGateResult {
  const tuning6O = input.calibrationVersion === "EARNED_DANGER_GATE_TUNING_6O";
  const attackingSupportScore = clamp(38 + input.candidate.candidateScore * 0.32 + input.teamState.momentum * 0.22 + routeFamilyEdge(input.candidate.family));
  const attackingSpacingScore = clamp(spacingFromZone(input.candidate.targetZone) + input.candidate.candidateScore * 0.16);
  const attackingStructureScore = clamp(42 + input.candidate.candidateScore * 0.25 + input.teamState.condition * 0.16);
  const attackingTransitionSpeedScore = clamp(input.recentResetToDangerWindow ? 56 + input.deterministicBreak : 46 + input.deterministicBreak);
  const attackingTechnicalEdgeScore = clamp(30 + input.candidate.candidateScore * 0.58);
  const attackingPhysicalEdgeScore = clamp(28 + input.teamState.condition * 0.3 + input.teamState.momentum * 0.25);
  const defendingRestDefenseScore = clamp(62 + sourcePressure(input.resetSourceType) + Math.max(0, input.scoreDelta) * 0.9);
  const defendingRecoveryScore = clamp(55 + sourcePressure(input.resetSourceType) + Math.max(0, 70 - input.teamState.condition) * 0.35);
  const defendingSpacingScore = clamp(58 + sourcePressure(input.resetSourceType) * 0.7);
  const defendingPressureScore = clamp(54 + input.pressureFatigueLoad * 0.24);
  const tacticalEdgeScore = clamp((attackingSupportScore + attackingSpacingScore + attackingStructureScore + attackingTransitionSpeedScore) / 4);
  const attributeEdgeScore = clamp((attackingTechnicalEdgeScore + attackingPhysicalEdgeScore + input.candidate.candidateScore) / 3);
  const fatigueEdgeScore = clamp(input.pressureFatigueLoad - 22 + input.deterministicBreak * 1.7);
  const pressureEdgeScore = clamp(input.pressureFatigueLoad + input.deterministicBreak * 2 - sourcePressure(input.resetSourceType));
  const mistakeEdgeScore = clamp(input.deterministicBreak * 4 + (input.goalkeeperSecureContext ? 6 : 0) + (input.postScoreContext ? 4 : 0));
  const attackingEdge = tacticalEdgeScore * 0.3 +
    attributeEdgeScore * 0.28 +
    fatigueEdgeScore * 0.14 +
    pressureEdgeScore * 0.13 +
    mistakeEdgeScore * 0.08 +
    attackingTransitionSpeedScore * 0.07;
  const defensiveWeight = defendingRestDefenseScore * 0.22 +
    defendingRecoveryScore * 0.18 +
    defendingSpacingScore * 0.12;
  const contextPenalty = (input.recentResetToDangerWindow ? 8 : 0) +
    (input.goalkeeperSecureContext ? 8 : 0) +
    (input.postScoreContext ? 5 : 0) +
    (input.scoreDelta > 0 ? Math.min(8, input.scoreDelta * 0.35) : 0);
  const earnedDangerScore = round(Math.max(0, Math.min(100, attackingEdge - defensiveWeight * 0.42 - contextPenalty + 28)));
  const reasonCodes: EarnedDangerGateReasonCode[] = [];
  if (attackingSupportScore >= 65) reasonCodes.push("SUPPORT_EDGE"); else reasonCodes.push("LOW_SUPPORT");
  if (attackingSpacingScore >= 65) reasonCodes.push("SPACING_EDGE"); else reasonCodes.push("LOW_SPACING");
  if (tacticalEdgeScore >= 65) reasonCodes.push("TACTICAL_EDGE"); else reasonCodes.push("LOW_TACTICAL_EDGE");
  if (attributeEdgeScore >= 65) reasonCodes.push("ATTRIBUTE_EDGE"); else reasonCodes.push("LOW_ATTRIBUTE_EDGE");
  if (fatigueEdgeScore >= 55) reasonCodes.push("FATIGUE_EDGE"); else reasonCodes.push("LOW_FATIGUE_EDGE");
  if (pressureEdgeScore >= 60) reasonCodes.push("PRESSURE_EDGE");
  if (mistakeEdgeScore >= 45) reasonCodes.push("MISTAKE_EDGE");
  if (input.recentResetToDangerWindow) reasonCodes.push("IMMEDIATE_AFTER_RESET");
  if (input.goalkeeperSecureContext) reasonCodes.push("GOALKEEPER_SECURE_CONTEXT");
  if (input.postScoreContext) reasonCodes.push("POST_SCORE_CONTEXT");
  if (input.resetSourceType === "DEFENSIVE_RECOVERY") reasonCodes.push("DEFENSIVE_RECOVERY_CONTEXT");
  if (input.scoreDelta > 0) reasonCodes.push("LEADING_TEAM_REATTACK");

  const mediumSignalCount = [
    attackingSupportScore >= (tuning6O ? 58 : 62),
    attackingSpacingScore >= (tuning6O ? 56 : 60),
    tacticalEdgeScore >= (tuning6O ? 58 : 60),
    attributeEdgeScore >= (tuning6O ? 58 : 60),
    fatigueEdgeScore >= (tuning6O ? 50 : 55),
    pressureEdgeScore >= (tuning6O ? 54 : 60),
    mistakeEdgeScore >= (tuning6O ? 34 : 45),
  ].filter(Boolean).length;
  const strongSignalCount = [
    attackingSupportScore >= 68,
    attackingSpacingScore >= 68,
    tacticalEdgeScore >= 67,
    attributeEdgeScore >= 67,
    fatigueEdgeScore >= 62,
    pressureEdgeScore >= 66,
    mistakeEdgeScore >= 52,
  ].filter(Boolean).length;
  const goalkeeperErrorSignal = input.goalkeeperSecureContext &&
    (
      mistakeEdgeScore >= (tuning6O ? 34 : 45) ||
      pressureEdgeScore >= (tuning6O ? 58 : 65) ||
      (
        tuning6O &&
        attackingSupportScore >= 65 &&
        tacticalEdgeScore >= 65 &&
        attributeEdgeScore >= 65 &&
        attackingSpacingScore >= 50
      )
    );
  const postScoreTurnoverSignal = input.postScoreContext &&
    (
      pressureEdgeScore >= (tuning6O ? 58 : 65) ||
      mistakeEdgeScore >= (tuning6O ? 36 : 45) ||
      (
        tuning6O &&
        attackingSupportScore >= 65 &&
        tacticalEdgeScore >= 65 &&
        attributeEdgeScore >= 65
      )
    );
  const hardMissingEdges = tuning6O
    ? attackingSupportScore < 45 ||
      attackingSpacingScore < 42 ||
      tacticalEdgeScore < 50 ||
      attributeEdgeScore < 50 ||
      (input.goalkeeperSecureContext && !goalkeeperErrorSignal) ||
      (input.postScoreContext && !postScoreTurnoverSignal && input.scoreDelta > 4)
    : attackingSupportScore < 62 ||
      attackingSpacingScore < 45 ||
      tacticalEdgeScore < 62 ||
      attributeEdgeScore < 60;
  const allowEarned = tuning6O
    ? earnedDangerScore >= 50 &&
      !hardMissingEdges &&
      attackingSupportScore >= 60 &&
      tacticalEdgeScore >= 60 &&
      attributeEdgeScore >= 60 &&
      mediumSignalCount >= 3
    : earnedDangerScore >= 65 && !hardMissingEdges;
  const allowBorderline = tuning6O
    ? !allowEarned &&
      earnedDangerScore >= 43 &&
      !hardMissingEdges &&
      attackingSupportScore >= 55 &&
      tacticalEdgeScore >= 55 &&
      attributeEdgeScore >= 55 &&
      mediumSignalCount >= 3
    : !allowEarned &&
      earnedDangerScore >= 50 &&
      input.candidate.candidateScore >= 78 &&
      attackingSupportScore >= 62 &&
      attackingSpacingScore >= 45 &&
      tacticalEdgeScore >= 60 &&
      attributeEdgeScore >= 60 &&
      input.scoreDelta <= 4;
  const gateDecision: EarnedDangerGateDecision = allowEarned
    ? "ALLOW_DANGER"
    : allowBorderline
      ? "ALLOW_BORDERLINE_DANGER"
      : input.goalkeeperSecureContext || input.scoreDelta > 6
        ? "DOWNGRADE_TO_SAFE_POSSESSION"
        : input.postScoreContext
          ? "DOWNGRADE_TO_NEUTRAL"
          : "FORCE_REBUILD_PHASE";
  const classification: EarnedDangerClassification = allowEarned
    ? "EARNED"
    : allowBorderline
      ? "BORDERLINE"
      : gateDecision === "DOWNGRADE_TO_NEUTRAL"
        ? "DOWNGRADED_TO_NEUTRAL"
        : gateDecision === "DOWNGRADE_TO_SAFE_POSSESSION"
          ? "DOWNGRADED_TO_SAFE_POSSESSION"
          : "BLOCKED_BY_GATE";

  if (gateDecision === "DOWNGRADE_TO_SAFE_POSSESSION") {
    reasonCodes.push("SAFE_POSSESSION_REQUIRED");
  }
  if (gateDecision === "DOWNGRADE_TO_NEUTRAL" || gateDecision === "FORCE_REBUILD_PHASE") {
    reasonCodes.push("NEUTRAL_REBUILD_REQUIRED");
  }

  const warningCodes: EarnedDangerGateWarningCode[] = [];
  if (input.recentResetToDangerWindow) warningCodes.push("RESET_TO_IMMEDIATE_DANGER");
  if (attackingSupportScore < 65) warningCodes.push("RESET_TO_DANGER_WITHOUT_SUPPORT");
  if (attackingSpacingScore < 65) warningCodes.push("RESET_TO_DANGER_WITHOUT_SPACING");
  if (tacticalEdgeScore < 65) warningCodes.push("RESET_TO_DANGER_WITHOUT_TACTICAL_EDGE");
  if (attributeEdgeScore < 65) warningCodes.push("RESET_TO_DANGER_WITHOUT_ATTRIBUTE_EDGE");
  if (fatigueEdgeScore < 55) warningCodes.push("RESET_TO_DANGER_WITHOUT_FATIGUE_EDGE");
  if (input.goalkeeperSecureContext) warningCodes.push("RESET_TO_DANGER_DESPITE_GOALKEEPER_SECURE");
  if (input.resetSourceType === "DEFENSIVE_RECOVERY") warningCodes.push("RESET_TO_DANGER_DESPITE_DEFENSIVE_RECOVERY");
  if (input.postScoreContext && input.recentResetToDangerWindow) warningCodes.push("RESET_TO_DANGER_TOO_FAST_AFTER_SCORE");
  if (allowEarned) warningCodes.push("EARNED_DANGER_CONFIRMED");
  if (allowBorderline) warningCodes.push("BORDERLINE_DANGER_ALLOWED");
  if (!allowEarned && !allowBorderline) {
    warningCodes.push("AUTOMATIC_RESET_TO_DANGER_SUSPECTED", "DANGER_DOWNGRADED_BY_GATE");
  }
  if (gateDecision === "FORCE_REBUILD_PHASE") {
    warningCodes.push("RESET_REBUILD_REQUIRED", "DANGER_BLOCKED_BY_GATE");
  }

  return {
    connected: true,
    resetSourceType: input.resetSourceType,
    dangerRouteFamily: input.candidate.family,
    dangerZone: input.candidate.targetZone,
    dangerGeneratedImmediately: input.recentResetToDangerWindow,
    attackingSupportScore,
    attackingSpacingScore,
    attackingStructureScore,
    attackingTransitionSpeedScore,
    attackingTechnicalEdgeScore,
    attackingPhysicalEdgeScore,
    defendingRestDefenseScore,
    defendingRecoveryScore,
    defendingSpacingScore,
    defendingPressureScore,
    tacticalEdgeScore,
    attributeEdgeScore,
    fatigueEdgeScore,
    pressureEdgeScore,
    mistakeEdgeScore,
    earnedDangerScore,
    earnedDangerClassification: classification,
    gateDecision,
    gateReasonCodes: [...new Set(reasonCodes)],
    warningCodes: [...new Set(warningCodes)],
    recommendation: allowEarned || allowBorderline
      ? "KEEP_FAST_TRANSITION_WHEN_JUSTIFIED"
      : "DOWNGRADE_UNEARNED_RESET_DANGER",
  };
}
