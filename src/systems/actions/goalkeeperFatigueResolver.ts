import type {
  GoalkeeperFatigueContext,
  GoalkeeperFatigueProfile,
  GoalkeeperPressureContext,
  GoalkeeperReadinessState,
} from "./goalkeeperFatigueTypes";

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function pressureContext(context: GoalkeeperFatigueContext): GoalkeeperPressureContext {
  if (context.cleanWindowType === "PARTIAL" && context.defensiveBlockPressure >= 62) {
    return "SCRAMBLE";
  }

  if (context.sequenceNumber >= 5 && context.finishingPressure >= 72) {
    return "LATE_CLOSE_SCORE";
  }

  if (context.defensiveBlockPressure >= 70 || context.finishingPressure >= 78) {
    return "HIGH";
  }

  if (context.defensiveBlockPressure >= 50 || context.finishingPressure >= 62) {
    return "MEDIUM";
  }

  return "LOW";
}

function shotsFacedRecently(context: GoalkeeperFatigueContext): number {
  const activityPulse = context.shotOnTarget ? 1 : 0;
  const sequencePressure = context.sequenceNumber >= 4 ? 1 : 0;

  return Math.max(1, Math.min(5, 1 + (context.shotIndex % 4) + activityPulse + sequencePressure));
}

function timeSinceLastAction(context: GoalkeeperFatigueContext, recentShots: number): number {
  if (context.shotIndex === 0) {
    return 18;
  }

  return Math.max(1, 13 - recentShots * 2 - (context.shotOnTarget ? 2 : 0) + (context.actionNumber % 3));
}

function readinessState(input: {
  readonly mentalFatigue: number;
  readonly concentrationLoad: number;
  readonly recentShots: number;
  readonly inactivity: number;
  readonly context: GoalkeeperPressureContext;
}): GoalkeeperReadinessState {
  if (input.mentalFatigue >= 78 || input.concentrationLoad >= 86) {
    return "OVERLOADED";
  }

  if (input.context === "HIGH" || input.context === "SCRAMBLE" || input.context === "LATE_CLOSE_SCORE") {
    return "UNDER_PRESSURE";
  }

  if (input.inactivity >= 12 && input.recentShots <= 2) {
    return "COLD";
  }

  if (input.recentShots >= 3) {
    return "ALERT";
  }

  return "SET";
}

function stateModifier(state: GoalkeeperReadinessState): {
  readonly concentration: number;
  readonly positioning: number;
  readonly reaction: number;
  readonly decision: number;
  readonly handTiming: number;
  readonly catchSecurity: number;
  readonly parryControl: number;
  readonly reboundDirection: number;
  readonly spillRisk: number;
  readonly communication: number;
} {
  switch (state) {
    case "ALERT":
      return {
        concentration: 4,
        positioning: 2,
        reaction: 4,
        decision: 2,
        handTiming: 2,
        catchSecurity: 1,
        parryControl: 2,
        reboundDirection: 1,
        spillRisk: -3,
        communication: 3,
      };
    case "COLD":
      return {
        concentration: -10,
        positioning: -5,
        reaction: -8,
        decision: -6,
        handTiming: -4,
        catchSecurity: -4,
        parryControl: -2,
        reboundDirection: -4,
        spillRisk: 7,
        communication: -3,
      };
    case "UNDER_PRESSURE":
      return {
        concentration: -4,
        positioning: -2,
        reaction: -3,
        decision: -5,
        handTiming: -3,
        catchSecurity: -6,
        parryControl: -4,
        reboundDirection: -5,
        spillRisk: 8,
        communication: -4,
      };
    case "OVERLOADED":
      return {
        concentration: -13,
        positioning: -9,
        reaction: -10,
        decision: -11,
        handTiming: -8,
        catchSecurity: -12,
        parryControl: -9,
        reboundDirection: -11,
        spillRisk: 16,
        communication: -9,
      };
    case "SET":
      return {
        concentration: 1,
        positioning: 1,
        reaction: 1,
        decision: 1,
        handTiming: 1,
        catchSecurity: 0,
        parryControl: 1,
        reboundDirection: 0,
        spillRisk: 0,
        communication: 1,
      };
  }
}

export function resolveGoalkeeperFatigueProfile(context: GoalkeeperFatigueContext): GoalkeeperFatigueProfile {
  const pressure = pressureContext(context);
  const recentShots = shotsFacedRecently(context);
  const inactivity = timeSinceLastAction(context, recentShots);
  const defensiveOrganizationInFront = clamp(
    100 - context.defensiveBlockPressure * 0.58 + (context.goalkeeperInsideGoalArea ? 6 : -7) + context.composure * 0.08,
  );
  const previousErrorFlag = context.previousErrorFlag ?? "NONE";
  const errorLoad = previousErrorFlag === "NONE" ? 0 : previousErrorFlag === "RECENT_FAILED_SAVE" ? 14 : 10;
  const inactivityLoad = inactivity >= 12 ? 16 : inactivity >= 8 ? 8 : 0;
  const closeOrLateLoad = pressure === "LATE_CLOSE_SCORE" ? 12 : 0;
  const scrambleLoad = pressure === "SCRAMBLE" ? 10 : 0;
  const concentrationLoad = clamp(
    recentShots * 7 +
      inactivityLoad +
      context.finishingPressure * 0.28 +
      context.defensiveBlockPressure * 0.16 +
      closeOrLateLoad +
      scrambleLoad +
      errorLoad -
      context.composure * 0.11 -
      context.vision * 0.08,
  );
  const goalkeeperPhysicalFatigue = clamp(context.baseAccumulatedFatigue * 0.42 + context.shotIndex * 2.2 + context.finishingPressure * 0.04);
  const goalkeeperMentalFatigue = clamp(concentrationLoad + recentShots * 4 + errorLoad * 0.5 - context.composure * 0.12 - context.vision * 0.08);
  const state = readinessState({
    mentalFatigue: goalkeeperMentalFatigue,
    concentrationLoad,
    recentShots,
    inactivity,
    context: pressure,
  });
  const modifier = stateModifier(state);
  const attributeMitigation = Math.round((context.composure + context.vision + context.handling) / 30);
  const fatiguePenalty = Math.round(goalkeeperMentalFatigue * 0.08 + goalkeeperPhysicalFatigue * 0.05);
  const reboundControlScore = clamp(
    context.handling * 0.48 +
      context.composure * 0.22 +
      defensiveOrganizationInFront * 0.14 +
      modifier.parryControl +
      modifier.reboundDirection -
      goalkeeperMentalFatigue * 0.24 -
      goalkeeperPhysicalFatigue * 0.12,
  );
  const secondSaveRecoveryScore = clamp(
    context.speed * 0.36 +
      context.composure * 0.2 +
      context.handling * 0.12 +
      defensiveOrganizationInFront * 0.1 +
      modifier.reaction +
      attributeMitigation -
      goalkeeperPhysicalFatigue * 0.32 -
      goalkeeperMentalFatigue * 0.2 -
      recentShots * 1.5,
  );

  return {
    goalkeeperPhysicalFatigue,
    goalkeeperMentalFatigue,
    goalkeeperReadinessState: state,
    concentrationLoad,
    shotsFacedRecently: recentShots,
    timeSinceLastAction: inactivity,
    pressureContext: pressure,
    defensiveOrganizationInFront,
    previousErrorFlag,
    reboundControlScore,
    secondSaveRecoveryScore,
    concentrationModifier: modifier.concentration + attributeMitigation - fatiguePenalty,
    positioningModifier: modifier.positioning + Math.round(defensiveOrganizationInFront * 0.04) - fatiguePenalty,
    reactionReliabilityModifier: modifier.reaction + attributeMitigation - fatiguePenalty,
    decisionQualityModifier: modifier.decision + attributeMitigation - Math.round(goalkeeperMentalFatigue * 0.11),
    legalHandUseTimingModifier: modifier.handTiming + attributeMitigation - Math.round(concentrationLoad * 0.08),
    catchSecurityModifier: modifier.catchSecurity + attributeMitigation - Math.round(goalkeeperMentalFatigue * 0.1),
    parryControlModifier: modifier.parryControl + attributeMitigation - Math.round(goalkeeperMentalFatigue * 0.09),
    reboundDirectionModifier: modifier.reboundDirection - Math.round(goalkeeperMentalFatigue * 0.08),
    spillRiskModifier: clamp(modifier.spillRisk + goalkeeperMentalFatigue * 0.2 + goalkeeperPhysicalFatigue * 0.08 - attributeMitigation),
    communicationModifier: modifier.communication + Math.round(defensiveOrganizationInFront * 0.03) - Math.round(goalkeeperMentalFatigue * 0.08),
    reason: `${state} readiness from ${pressure} pressure context: physical fatigue ${goalkeeperPhysicalFatigue}/100, mental fatigue ${goalkeeperMentalFatigue}/100, concentration load ${concentrationLoad}/100.`,
  };
}
