import type { SandboxDecisionEvidenceCalibrationModel } from "./sandboxDecisionEvidenceCalibration";
import type { SandboxDecisionBatchScenario } from "./sandboxDecisionBatchConfidenceCalibration";

const MIN_MODIFIER = -2;
const MAX_MODIFIER = 2;

function bounded(value: number): number {
  return Math.max(MIN_MODIFIER, Math.min(MAX_MODIFIER, value));
}

function scenario(input: SandboxDecisionBatchScenario): SandboxDecisionBatchScenario {
  return {
    ...input,
    attackingSupportModifier: bounded(input.attackingSupportModifier),
    secondBallOccupationModifier: bounded(input.secondBallOccupationModifier),
    goalkeeperStrengthModifier: bounded(input.goalkeeperStrengthModifier),
    attackerFatigueModifier: bounded(input.attackerFatigueModifier),
    goalkeeperFatigueModifier: bounded(input.goalkeeperFatigueModifier),
    defensiveRecoveryModifier: bounded(input.defensiveRecoveryModifier),
    pressureModifier: bounded(input.pressureModifier),
  };
}

export function createSandboxDecisionBatchScenarios(input: {
  readonly calibration: SandboxDecisionEvidenceCalibrationModel;
}): readonly SandboxDecisionBatchScenario[] {
  if (input.calibration.status === "not_available") {
    return [];
  }

  return [
    scenario({
      scenarioId: "batch-scenario-base",
      scenarioType: "base",
      label: "Base scenario",
      attackingSupportModifier: 0,
      secondBallOccupationModifier: 0,
      goalkeeperStrengthModifier: 0,
      attackerFatigueModifier: 0,
      goalkeeperFatigueModifier: 0,
      defensiveRecoveryModifier: 0,
      pressureModifier: 0,
    }),
    scenario({
      scenarioId: "batch-scenario-better-attacking-support",
      scenarioType: "better_attacking_support",
      label: "Better attacking support around Z4-HSR",
      attackingSupportModifier: 1,
      secondBallOccupationModifier: 1,
      goalkeeperStrengthModifier: 0,
      attackerFatigueModifier: 0,
      goalkeeperFatigueModifier: 0,
      defensiveRecoveryModifier: -1,
      pressureModifier: 0,
    }),
    scenario({
      scenarioId: "batch-scenario-weak-attacking-support",
      scenarioType: "weak_attacking_support",
      label: "Weak attacking support around Z4-HSR",
      attackingSupportModifier: -1,
      secondBallOccupationModifier: -1,
      goalkeeperStrengthModifier: 0,
      attackerFatigueModifier: 0,
      goalkeeperFatigueModifier: 0,
      defensiveRecoveryModifier: 1,
      pressureModifier: 0,
    }),
    scenario({
      scenarioId: "batch-scenario-stronger-goalkeeper",
      scenarioType: "stronger_goalkeeper",
      label: "Stronger goalkeeper response profile",
      attackingSupportModifier: 0,
      secondBallOccupationModifier: 0,
      goalkeeperStrengthModifier: 1,
      attackerFatigueModifier: 0,
      goalkeeperFatigueModifier: -1,
      defensiveRecoveryModifier: 1,
      pressureModifier: 0,
    }),
    scenario({
      scenarioId: "batch-scenario-weaker-goalkeeper",
      scenarioType: "weaker_goalkeeper",
      label: "Weaker goalkeeper response profile",
      attackingSupportModifier: 0,
      secondBallOccupationModifier: 0,
      goalkeeperStrengthModifier: -1,
      attackerFatigueModifier: 0,
      goalkeeperFatigueModifier: 1,
      defensiveRecoveryModifier: 0,
      pressureModifier: 0,
    }),
    scenario({
      scenarioId: "batch-scenario-fatigued-attacker",
      scenarioType: "fatigued_attacker",
      label: "Fatigued attacking receiver",
      attackingSupportModifier: 0,
      secondBallOccupationModifier: -1,
      goalkeeperStrengthModifier: 0,
      attackerFatigueModifier: 1,
      goalkeeperFatigueModifier: 0,
      defensiveRecoveryModifier: 0,
      pressureModifier: 1,
    }),
    scenario({
      scenarioId: "batch-scenario-fatigued-goalkeeper",
      scenarioType: "fatigued_goalkeeper",
      label: "Fatigued goalkeeper concentration",
      attackingSupportModifier: 0,
      secondBallOccupationModifier: 1,
      goalkeeperStrengthModifier: 0,
      attackerFatigueModifier: 0,
      goalkeeperFatigueModifier: 1,
      defensiveRecoveryModifier: 0,
      pressureModifier: 0,
    }),
    scenario({
      scenarioId: "batch-scenario-higher-defensive-recovery",
      scenarioType: "higher_defensive_recovery",
      label: "Higher defensive recovery after rebound",
      attackingSupportModifier: 0,
      secondBallOccupationModifier: -1,
      goalkeeperStrengthModifier: 0,
      attackerFatigueModifier: 0,
      goalkeeperFatigueModifier: 0,
      defensiveRecoveryModifier: 1,
      pressureModifier: 0,
    }),
    scenario({
      scenarioId: "batch-scenario-better-attacking-rebound-pressure",
      scenarioType: "better_attacking_rebound_pressure",
      label: "Better attacking rebound pressure",
      attackingSupportModifier: 1,
      secondBallOccupationModifier: 1,
      goalkeeperStrengthModifier: 0,
      attackerFatigueModifier: 0,
      goalkeeperFatigueModifier: 0,
      defensiveRecoveryModifier: 0,
      pressureModifier: -1,
    }),
  ];
}
