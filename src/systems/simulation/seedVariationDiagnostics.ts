import type { TeamId } from "../../core/ids";
import { createZoneId, LateralCorridor, LongitudinalZone, type ZoneId } from "../../core/zones";
import type {
  BlitzStyleVariant,
  CalibrationFatigueProfile,
  CalibrationPressureProfile,
  CalibrationScenario,
  ControlStyleVariant,
  ScenarioDiversityStatus,
  ScenarioVariationSummary,
  SeedImpactStatus,
  SeedVariationInputImpact,
} from "./seedVariationTypes";

export interface SeedVariationSample {
  readonly scenario: CalibrationScenario;
  readonly finalScore: string;
  readonly winner: string;
  readonly totalShots: number;
  readonly shotOutcomePattern: string;
  readonly actionOrderSignature: string;
}

const INITIAL_BALL_ZONES: readonly ZoneId[] = [
  createZoneId(LongitudinalZone.BuildOut, LateralCorridor.CentralAxis),
  createZoneId(LongitudinalZone.BuildOut, LateralCorridor.LeftHalfSpace),
  createZoneId(LongitudinalZone.Midfield, LateralCorridor.CentralAxis),
  createZoneId(LongitudinalZone.Midfield, LateralCorridor.RightHalfSpace),
  createZoneId(LongitudinalZone.OffensivePressure, LateralCorridor.CentralAxis),
  createZoneId(LongitudinalZone.OffensivePressure, LateralCorridor.LeftCorridor),
];

const PRESSURE_PROFILES: readonly CalibrationPressureProfile[] = ["LOW", "MEDIUM", "HIGH"];
const CONTROL_STYLE_VARIANTS: readonly ControlStyleVariant[] = ["CONTROL_PATIENT", "CONTROL_BALANCED", "CONTROL_DIRECT"];
const BLITZ_STYLE_VARIANTS: readonly BlitzStyleVariant[] = ["BLITZ_AGGRESSIVE", "BLITZ_BALANCED", "BLITZ_RISKY"];
const FATIGUE_PROFILES: readonly CalibrationFatigueProfile[] = ["FRESH", "NORMAL", "LOADED"];

function pickCycled<T>(values: readonly T[], index: number): T {
  const value = values[index % values.length];
  if (value === undefined) {
    throw new Error("Calibration variation options cannot be empty.");
  }

  return value;
}

function rollInt(seed: number, salt: number, min: number, max: number): number {
  const mixed = Math.imul(seed ^ Math.imul(salt + 0x9e3779b9, 0x85ebca6b), 0xc2b2ae35) >>> 0;
  const remixed = Math.imul(mixed ^ (mixed >>> 16), 0x27d4eb2d) >>> 0;
  const roll = remixed / 0x1_0000_0000;
  const span = max - min + 1;

  return min + Math.floor(roll * span);
}

function seedNumber(seedLabel: string, index: number): number {
  return seedLabel
    .split("")
    .reduce((sum, char, charIndex) => sum + char.charCodeAt(0) * (charIndex + 11), 10_000 + index * 977);
}

export function createCalibrationScenario(input: {
  readonly index: number;
  readonly seedLabel: string;
  readonly controlTeamId: TeamId;
  readonly controlTeamName: string;
  readonly blitzTeamId: TeamId;
  readonly blitzTeamName: string;
}): CalibrationScenario {
  const numericSeed = seedNumber(input.seedLabel, input.index);
  const possessionTeamIsControl = rollInt(numericSeed, 19, 0, 99) >= 35;
  const controlForm = rollInt(numericSeed, 31, -5, 5);
  const blitzForm = rollInt(numericSeed, 43, -5, 5);

  return {
    seed: numericSeed,
    seedLabel: input.seedLabel,
    scenarioId: `scenario-${String(input.index).padStart(3, "0")}`,
    initialPossessionTeam: possessionTeamIsControl ? input.controlTeamId : input.blitzTeamId,
    initialPossessionTeamName: possessionTeamIsControl ? input.controlTeamName : input.blitzTeamName,
    initialBallZone: pickCycled(INITIAL_BALL_ZONES, input.index + rollInt(numericSeed, 53, 0, 5)),
    attackingDirection: rollInt(numericSeed, 61, 0, 1) === 0 ? "LEFT_TO_RIGHT" : "RIGHT_TO_LEFT",
    controlStyleVariant: pickCycled(CONTROL_STYLE_VARIANTS, rollInt(numericSeed, 71, 0, 2)),
    blitzStyleVariant: pickCycled(BLITZ_STYLE_VARIANTS, rollInt(numericSeed, 79, 0, 2)),
    pressureProfile: pickCycled(PRESSURE_PROFILES, rollInt(numericSeed, 83, 0, 2)),
    playerFormProfile: {
      controlModifier: controlForm,
      blitzModifier: blitzForm,
      goalkeeperModifier: rollInt(numericSeed, 89, -6, 6),
      blockModifier: rollInt(numericSeed, 97, -6, 6),
    },
    fatigueProfile: pickCycled(FATIGUE_PROFILES, rollInt(numericSeed, 101, 0, 2)),
    weatherOrSurfaceProfile: pickCycled(["FAST_SURFACE", "NORMAL_SURFACE", "HEAVY_SURFACE"] as const, rollInt(numericSeed, 109, 0, 2)),
  };
}

function uniqueCount(values: readonly string[]): number {
  return new Set(values).size;
}

function statusFromDiversity(uniqueSignatures: number, sampleCount: number, connectedInputs: number): ScenarioDiversityStatus {
  if (connectedInputs === 0) {
    return "SEED_NOT_CONNECTED_TO_SIMULATION";
  }

  if (uniqueSignatures <= 1) {
    return "IDENTICAL_OUTPUT_WARNING";
  }

  return uniqueSignatures < Math.max(2, Math.floor(sampleCount / 3)) ? "PARTIALLY_VARIED" : "VARIED";
}

function seedImpactStatus(connectedInputs: number): SeedImpactStatus {
  if (connectedInputs === 0) {
    return "SEED_NOT_CONNECTED_TO_SIMULATION";
  }

  return connectedInputs >= 3 ? "CONNECTED" : "PARTIALLY_CONNECTED";
}

export function diagnoseSeedVariation(samples: readonly SeedVariationSample[]): ScenarioVariationSummary {
  const uniqueInitialBallZones = uniqueCount(samples.map((sample) => sample.scenario.initialBallZone));
  const uniquePossessionTeams = uniqueCount(samples.map((sample) => sample.scenario.initialPossessionTeamName));
  const uniquePressureProfiles = uniqueCount(samples.map((sample) => sample.scenario.pressureProfile));
  const uniqueStyleProfiles = uniqueCount(samples.map((sample) => `${sample.scenario.controlStyleVariant}|${sample.scenario.blitzStyleVariant}`));
  const uniquePlayerFormProfiles = uniqueCount(
    samples.map(
      (sample) =>
        `${sample.scenario.playerFormProfile.controlModifier}|${sample.scenario.playerFormProfile.blitzModifier}|${sample.scenario.playerFormProfile.goalkeeperModifier}|${sample.scenario.playerFormProfile.blockModifier}`,
    ),
  );
  const uniqueFinalScores = uniqueCount(samples.map((sample) => sample.finalScore));
  const uniqueWinners = uniqueCount(samples.map((sample) => sample.winner));
  const uniqueShotCounts = uniqueCount(samples.map((sample) => String(sample.totalShots)));
  const uniqueShotOutcomePatterns = uniqueCount(samples.map((sample) => sample.shotOutcomePattern));
  const uniqueActionOrdering = uniqueCount(samples.map((sample) => sample.actionOrderSignature));
  const seedImpact: SeedVariationInputImpact = {
    initialBallZoneChanged: uniqueInitialBallZones > 1,
    possessionTeamChanged: uniquePossessionTeams > 1,
    pressureProfileChanged: uniquePressureProfiles > 1,
    teamStyleIntensityChanged: uniqueStyleProfiles > 1,
    playerFormChanged: uniquePlayerFormProfiles > 1,
    shotQualityNoiseChanged: uniqueShotOutcomePatterns > 1,
    goalkeeperChallengeChanged: uniqueShotOutcomePatterns > 1,
    defensiveBlockPressureChanged: uniqueShotOutcomePatterns > 1,
    actionOrderingChanged: uniqueActionOrdering > 1,
    finalScoreChanged: uniqueFinalScores > 1,
    shotOutcomesChanged: uniqueShotOutcomePatterns > 1,
  };
  const connectedSimulationInputCount = Object.values(seedImpact).filter(Boolean).length;
  const uniqueInitialScenarios = uniqueCount(
    samples.map(
      (sample) =>
        `${sample.scenario.initialPossessionTeamName}|${sample.scenario.initialBallZone}|${sample.scenario.pressureProfile}|${sample.scenario.controlStyleVariant}|${sample.scenario.blitzStyleVariant}|${sample.scenario.fatigueProfile}`,
    ),
  );
  const deterministicInputsStillFixed = [
    ...(seedImpact.actionOrderingChanged ? [] : ["action ordering"]),
    ...(seedImpact.finalScoreChanged ? [] : ["final score"]),
    ...(seedImpact.shotOutcomesChanged ? [] : ["shot outcomes"]),
  ];
  const scenarioDiversityStatus = statusFromDiversity(
    uniqueCount(samples.map((sample) => `${sample.finalScore}|${sample.totalShots}|${sample.shotOutcomePattern}`)),
    samples.length,
    connectedSimulationInputCount,
  );

  return {
    seedImpactStatus: seedImpactStatus(connectedSimulationInputCount),
    scenarioDiversityStatus,
    connectedSimulationInputCount,
    generatedScenarioCount: samples.length,
    uniqueInitialScenarios,
    uniqueInitialBallZones,
    uniquePossessionTeams,
    uniquePressureProfiles,
    uniqueStyleProfiles,
    uniquePlayerFormProfiles,
    uniqueFinalScores,
    uniqueWinners,
    uniqueShotCounts,
    uniqueShotOutcomePatterns,
    seedImpact,
    deterministicInputsStillFixed,
    explanation:
      scenarioDiversityStatus === "IDENTICAL_OUTPUT_WARNING"
        ? "Seeds still do not produce useful batch diversity."
        : "Seeds now drive controlled calibration scenarios and scenario-adjusted shot context, so batch scoring evidence is more meaningful.",
  };
}

export function createScenarioSeedVariationReport(summary: ScenarioVariationSummary): string {
  return [
    "# Scenario / Seed Variation",
    "",
    "## Summary",
    `- scenarios generated: ${summary.generatedScenarioCount}`,
    `- seed impact status: ${summary.seedImpactStatus}`,
    `- scenario diversity status: ${summary.scenarioDiversityStatus}`,
    `- connected simulation inputs: ${summary.connectedSimulationInputCount}`,
    `- explanation: ${summary.explanation}`,
    "",
    "## Seed Impact Matrix",
    `- initial ball zone changed: ${summary.seedImpact.initialBallZoneChanged ? "YES" : "NO"}`,
    `- possession team changed: ${summary.seedImpact.possessionTeamChanged ? "YES" : "NO"}`,
    `- pressure profile changed: ${summary.seedImpact.pressureProfileChanged ? "YES" : "NO"}`,
    `- team style intensity changed: ${summary.seedImpact.teamStyleIntensityChanged ? "YES" : "NO"}`,
    `- player form changed: ${summary.seedImpact.playerFormChanged ? "YES" : "NO"}`,
    `- shot quality noise changed: ${summary.seedImpact.shotQualityNoiseChanged ? "YES" : "NO"}`,
    `- goalkeeper challenge changed: ${summary.seedImpact.goalkeeperChallengeChanged ? "YES" : "NO"}`,
    `- defensive block pressure changed: ${summary.seedImpact.defensiveBlockPressureChanged ? "YES" : "NO"}`,
    `- action ordering changed: ${summary.seedImpact.actionOrderingChanged ? "YES" : "NO"}`,
    `- final score changed: ${summary.seedImpact.finalScoreChanged ? "YES" : "NO"}`,
    `- shot outcomes changed: ${summary.seedImpact.shotOutcomesChanged ? "YES" : "NO"}`,
    "",
    "## Scenario Variation Summary",
    `- unique final scores: ${summary.uniqueFinalScores}`,
    `- unique winners: ${summary.uniqueWinners}`,
    `- unique shot counts: ${summary.uniqueShotCounts}`,
    `- unique shot outcomes patterns: ${summary.uniqueShotOutcomePatterns}`,
    `- unique initial scenarios: ${summary.uniqueInitialScenarios}`,
    `- unique initial ball zones: ${summary.uniqueInitialBallZones}`,
    `- unique possession teams: ${summary.uniquePossessionTeams}`,
    `- unique pressure profiles: ${summary.uniquePressureProfiles}`,
    `- unique style profiles: ${summary.uniqueStyleProfiles}`,
    `- unique player form profiles: ${summary.uniquePlayerFormProfiles}`,
    `- deterministic inputs still fixed: ${summary.deterministicInputsStillFixed.length === 0 ? "none" : summary.deterministicInputsStillFixed.join(", ")}`,
    "",
  ].join("\n");
}
