import type { GKShotStoppingContext, GKShotStoppingResult } from "./gkShotStoppingTypes";

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function resolveGKShotStopping(context: GKShotStoppingContext): GKShotStoppingResult {
  const fatigue = context.goalkeeperFatigueProfile;
  const readinessSuffix = ` ${fatigue.reason} Mental load adjusts concentration, handling choice, spill risk, and second-save recovery.`;

  if (!context.shotOnTarget) {
    return {
      goalkeeperEvaluated: true,
      goalkeeperInvolved: false,
      goalkeeperAction: context.shotPlacement >= 62 ? "TRACKED_MISS" : "SET_AND_COVER",
      saveProbabilityScore: 0,
      catchProbabilityScore: 0,
      deflectionProbabilityScore: 0,
      gkOutcomeReason:
        context.shotPlacement >= 62
          ? `Goalkeeper tracks the near-frame miss without needing a save action.${readinessSuffix}`
          : `Goalkeeper sets and covers, but the shot misses the target frame before a save action is required.${readinessSuffix}`,
    };
  }

  const adjustedSetPosition = clamp(context.goalkeeperSetPositionScore + fatigue.positioningModifier + fatigue.communicationModifier * 0.2);
  const adjustedReaction = clamp(context.goalkeeperReactionScore + fatigue.reactionReliabilityModifier);
  const adjustedReach = clamp(context.goalkeeperReachScore - fatigue.goalkeeperPhysicalFatigue * 0.04);
  const adjustedHandling = clamp(context.goalkeeperHandlingScore + fatigue.catchSecurityModifier);
  const adjustedFootSave = clamp(context.goalkeeperFootSaveScore + fatigue.reactionReliabilityModifier * 0.35);
  const handUseModifier = context.goalkeeperLegalHandUseAvailable ? 8 + fatigue.legalHandUseTimingModifier * 0.25 : -14;
  const cleanWindowPenalty =
    context.cleanWindowType === "ELITE" ? 12 : context.cleanWindowType === "CLEAN" ? 8 : context.cleanWindowType === "PARTIAL" ? 4 : 0;
  const shotDifficulty = Math.round(context.shotQuality * 0.42 + context.shotPower * 0.22 + context.shotPlacement * 0.24 + context.shotAngleDifficulty * 0.12);
  const saveProbabilityScore = clamp(
    Math.round(
      adjustedSetPosition * 0.22 +
        adjustedReaction * 0.26 +
        adjustedReach * 0.24 +
        adjustedFootSave * 0.08 +
        handUseModifier -
        cleanWindowPenalty -
        fatigue.spillRiskModifier * 0.12 -
        shotDifficulty * 0.24,
    ),
  );
  const catchProbabilityScore = clamp(
    Math.round(
      adjustedHandling * 0.42 +
        adjustedSetPosition * 0.18 +
        adjustedReaction * 0.16 +
        handUseModifier -
        context.shotPower * 0.34 -
        context.shotPlacement * 0.12 -
        fatigue.spillRiskModifier * 0.16,
    ),
  );
  const deflectionProbabilityScore = clamp(
    Math.round(
      adjustedReaction * 0.28 +
        adjustedReach * 0.32 +
        adjustedSetPosition * 0.12 +
        fatigue.parryControlModifier * 0.18 -
        context.shotPlacement * 0.18 -
        cleanWindowPenalty * 0.5,
    ),
  );

  const catchThreshold = 48 + Math.round(fatigue.spillRiskModifier * 0.08);

  if (catchProbabilityScore >= catchThreshold && context.goalkeeperLegalHandUseAvailable && context.shotPower <= 70) {
    return {
      goalkeeperEvaluated: true,
      goalkeeperInvolved: true,
      goalkeeperAction: "CATCH",
      saveProbabilityScore,
      catchProbabilityScore,
      deflectionProbabilityScore,
      gkOutcomeReason: `Goalkeeper is inside the goal area with legal hand use and enough handling security to catch the shot.${readinessSuffix}`,
    };
  }

  if (saveProbabilityScore >= 38) {
    return {
      goalkeeperEvaluated: true,
      goalkeeperInvolved: true,
      goalkeeperAction: context.goalkeeperLegalHandUseAvailable
        ? "HAND_SAVE"
        : context.goalkeeperInsideGoalArea
          ? "FOOT_SAVE"
          : "OUT_OF_AREA_BODY_BLOCK",
      saveProbabilityScore,
      catchProbabilityScore,
      deflectionProbabilityScore,
      gkOutcomeReason: context.goalkeeperLegalHandUseAvailable
        ? `Goalkeeper is set and reaches the on-target shot with legal hand use.${readinessSuffix}`
        : context.goalkeeperInsideGoalArea
          ? `Goalkeeper cannot use hands in this context and intervenes with a foot/body save.${readinessSuffix}`
          : `Goalkeeper is outside the goal-area hand-use context and blocks with body mechanics.${readinessSuffix}`,
    };
  }

  if (deflectionProbabilityScore >= 28) {
    return {
      goalkeeperEvaluated: true,
      goalkeeperInvolved: true,
      goalkeeperAction: "DEFLECTION",
      saveProbabilityScore,
      catchProbabilityScore,
      deflectionProbabilityScore,
      gkOutcomeReason: `Goalkeeper cannot secure the shot but gets enough reaction/reach to deflect it into a contested rebound.${readinessSuffix}`,
    };
  }

  return {
    goalkeeperEvaluated: true,
    goalkeeperInvolved: true,
    goalkeeperAction: "FAILED_SAVE",
    saveProbabilityScore,
    catchProbabilityScore,
    deflectionProbabilityScore,
    gkOutcomeReason: `Goalkeeper is evaluated but the shot quality, placement, or clean-window advantage beats the available save range.${readinessSuffix}`,
  };
}
