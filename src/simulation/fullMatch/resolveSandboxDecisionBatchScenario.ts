import type { SandboxDecisionEvidenceCalibrationModel } from "./sandboxDecisionEvidenceCalibration";
import type {
  SandboxDecisionBatchScenario,
  SandboxDecisionBatchScenarioResult,
} from "./sandboxDecisionBatchConfidenceCalibration";

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function confidenceFromScore(score: number): SandboxDecisionBatchScenarioResult["confidence"] {
  if (score <= 34) {
    return "very_low";
  }

  if (score <= 54) {
    return "low";
  }

  if (score <= 69) {
    return "medium";
  }

  if (score <= 84) {
    return "strong";
  }

  return "very_strong";
}

function interpretation(input: {
  readonly scenario: SandboxDecisionBatchScenario;
  readonly evidenceScore: number;
  readonly baseScore: number;
}): string {
  const direction = input.evidenceScore > input.baseScore
    ? "renforce"
    : input.evidenceScore < input.baseScore
      ? "affaiblit"
      : "confirme prudemment";

  switch (input.scenario.scenarioType) {
    case "base":
      return "La base reproduit le signal 3X : progression dangereuse, tir sauve, puis recuperation par l'equipe du gardien.";
    case "better_attacking_support":
      return `Le meilleur soutien offensif ${direction} la piste en ameliorant l'occupation du second ballon autour de Z4-HSR.`;
    case "weak_attacking_support":
      return `Le soutien faible ${direction} la piste car le tir reste plus isole apres la progression.`;
    case "stronger_goalkeeper":
      return `Le gardien plus fort ${direction} la piste en augmentant la probabilite de controle defensif.`;
    case "weaker_goalkeeper":
      return `Le gardien plus fragile ${direction} la piste, mais ce contexte reste trop local pour devenir une consigne officielle.`;
    case "fatigued_attacker":
      return `L'attaquant fatigue ${direction} la piste par baisse de qualite de tir et de continuation.`;
    case "fatigued_goalkeeper":
      return `Le gardien fatigue ${direction} la piste par baisse de concentration et de controle de rebond.`;
    case "higher_defensive_recovery":
      return `La recuperation defensive plus forte ${direction} la piste en securisant mieux le second ballon.`;
    case "better_attacking_rebound_pressure":
      return `La meilleure pression offensive sur rebond ${direction} la piste en augmentant la seconde chance.`;
  }
}

export function resolveSandboxDecisionBatchScenario(input: {
  readonly calibration: SandboxDecisionEvidenceCalibrationModel;
  readonly scenario: SandboxDecisionBatchScenario;
}): SandboxDecisionBatchScenarioResult {
  const baseScore = input.calibration.evidenceScore;
  const scoreDelta =
    input.scenario.attackingSupportModifier * 6 +
    input.scenario.secondBallOccupationModifier * 4 -
    input.scenario.goalkeeperStrengthModifier * 7 -
    input.scenario.attackerFatigueModifier * 5 +
    input.scenario.goalkeeperFatigueModifier * 5 -
    input.scenario.defensiveRecoveryModifier * 6 -
    input.scenario.pressureModifier * 3;
  const evidenceScore = clampScore(baseScore + scoreDelta);
  const dangerScore = clampScore(64 + input.scenario.attackingSupportModifier * 5 - input.scenario.pressureModifier * 4);
  const shotQuality = clampScore(53 - input.scenario.attackerFatigueModifier * 6 + input.scenario.goalkeeperFatigueModifier * 2);
  const goalkeeperResponseScore = clampScore(
    65 + input.scenario.goalkeeperStrengthModifier * 8 - input.scenario.goalkeeperFatigueModifier * 7,
  );
  const secondChanceProbability = clampScore(
    4 +
    input.scenario.secondBallOccupationModifier * 8 +
    input.scenario.attackingSupportModifier * 4 -
    input.scenario.defensiveRecoveryModifier * 5,
  );
  const continuationConfidence = clampScore(
    77 +
    input.scenario.defensiveRecoveryModifier * 7 -
    input.scenario.secondBallOccupationModifier * 5 -
    input.scenario.goalkeeperFatigueModifier * 4,
  );
  const attackingSecondBall = secondChanceProbability >= 16;
  const keeperControls = goalkeeperResponseScore >= shotQuality + 8 && !attackingSecondBall;

  return {
    scenarioId: input.scenario.scenarioId,
    scenarioType: input.scenario.scenarioType,
    label: input.scenario.label,
    evidenceScore,
    confidence: confidenceFromScore(evidenceScore),
    supportingSignalCount: input.calibration.supportingSignals.length + (scoreDelta > 0 ? 1 : 0),
    limitingSignalCount: input.calibration.limitingSignals.length + (scoreDelta < 0 ? 1 : 0),
    routeOutcome: "dangerous_progression",
    opportunityType: evidenceScore >= 45 ? "improved_half_chance" : "half_chance",
    shotResult: keeperControls ? "SAVED_BY_GK" : "SHOT_PRESSURES_GK",
    goalkeeperResponse: keeperControls ? "PARRIED_SAVE" : "UNSTABLE_SAVE_WINDOW",
    reboundState: attackingSecondBall ? "CONTESTED_SECOND_BALL" : "SAFE_DEFLECTION_RECOVERABLE_BY_DEFENSE",
    continuationAction: attackingSecondBall ? "ATTACKING_REBOUND_PRESSURE" : "GOALKEEPER_TEAM_SECURE_RECOVERY",
    finalOutcome: attackingSecondBall ? "contested_rebound_window" : "secured_by_goalkeeper_team",
    dangerScore,
    shotQuality,
    goalkeeperResponseScore,
    secondChanceProbability,
    continuationConfidence,
    scenarioInterpretation: interpretation({
      scenario: input.scenario,
      evidenceScore,
      baseScore,
    }),
    suggestionOnly: true,
    officialTruth: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canCreateProductionScoringEvents: false,
    canClaimGlobalEconomy: false,
  };
}
