import type { TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";

export type CalibrationPressureProfile = "LOW" | "MEDIUM" | "HIGH";
export type ControlStyleVariant = "CONTROL_PATIENT" | "CONTROL_BALANCED" | "CONTROL_DIRECT";
export type BlitzStyleVariant = "BLITZ_AGGRESSIVE" | "BLITZ_BALANCED" | "BLITZ_RISKY";
export type CalibrationFatigueProfile = "FRESH" | "NORMAL" | "LOADED";
export type SeedImpactStatus = "CONNECTED" | "PARTIALLY_CONNECTED" | "SEED_NOT_CONNECTED_TO_SIMULATION";
export type ScenarioDiversityStatus = "VARIED" | "PARTIALLY_VARIED" | "IDENTICAL_OUTPUT_WARNING" | "SEED_NOT_CONNECTED_TO_SIMULATION";

export interface PlayerFormProfile {
  readonly controlModifier: number;
  readonly blitzModifier: number;
  readonly goalkeeperModifier: number;
  readonly blockModifier: number;
}

export interface CalibrationScenario {
  readonly seed: number;
  readonly seedLabel: string;
  readonly scenarioId: string;
  readonly initialPossessionTeam: TeamId;
  readonly initialPossessionTeamName: string;
  readonly initialBallZone: ZoneId;
  readonly attackingDirection: "LEFT_TO_RIGHT" | "RIGHT_TO_LEFT";
  readonly controlStyleVariant: ControlStyleVariant;
  readonly blitzStyleVariant: BlitzStyleVariant;
  readonly pressureProfile: CalibrationPressureProfile;
  readonly playerFormProfile: PlayerFormProfile;
  readonly fatigueProfile: CalibrationFatigueProfile;
  readonly weatherOrSurfaceProfile?: "FAST_SURFACE" | "NORMAL_SURFACE" | "HEAVY_SURFACE";
}

export interface SeedVariationInputImpact {
  readonly initialBallZoneChanged: boolean;
  readonly possessionTeamChanged: boolean;
  readonly pressureProfileChanged: boolean;
  readonly teamStyleIntensityChanged: boolean;
  readonly playerFormChanged: boolean;
  readonly shotQualityNoiseChanged: boolean;
  readonly goalkeeperChallengeChanged: boolean;
  readonly defensiveBlockPressureChanged: boolean;
  readonly actionOrderingChanged: boolean;
  readonly finalScoreChanged: boolean;
  readonly shotOutcomesChanged: boolean;
}

export interface ScenarioVariationSummary {
  readonly seedImpactStatus: SeedImpactStatus;
  readonly scenarioDiversityStatus: ScenarioDiversityStatus;
  readonly connectedSimulationInputCount: number;
  readonly generatedScenarioCount: number;
  readonly uniqueInitialScenarios: number;
  readonly uniqueInitialBallZones: number;
  readonly uniquePossessionTeams: number;
  readonly uniquePressureProfiles: number;
  readonly uniqueStyleProfiles: number;
  readonly uniquePlayerFormProfiles: number;
  readonly uniqueFinalScores: number;
  readonly uniqueWinners: number;
  readonly uniqueShotCounts: number;
  readonly uniqueShotOutcomePatterns: number;
  readonly seedImpact: SeedVariationInputImpact;
  readonly deterministicInputsStillFixed: readonly string[];
  readonly explanation: string;
}
