import type { Rating } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import type { PitchSide, SpatialLevel } from "../spatial";
import type { LocalAdvantageEvaluation } from "../spatial/localAdvantage";

export enum PrincipleQuality {
  Poor = "POOR",
  Medium = "MEDIUM",
  Good = "GOOD",
}

export enum BallSpeedState {
  FrontFoot = "FRONT_FOOT_BALL",
  Neutral = "NEUTRAL_BALL",
  BackFoot = "BACK_FOOT_BALL",
}

export interface AttackingPrinciples {
  readonly widthOccupation: Rating;
  readonly fiveCorridorStretch: PrincipleQuality;
  readonly supportBehindBall: number;
  readonly thirdManAvailability: PrincipleQuality;
  readonly staggeredSupport: PrincipleQuality;
  readonly overloadCreation: PrincipleQuality;
  readonly underloadThreat: PrincipleQuality;
  readonly shortSideThreat: PrincipleQuality;
  readonly openSideThreat: PrincipleQuality;
  readonly restAttackBalance: PrincipleQuality;
  readonly gainLineThreat: PrincipleQuality;
  readonly frontFootBall: BallSpeedState;
  readonly occupiedCorridors: number;
  readonly shortSide: PitchSide;
  readonly openSide: PitchSide;
}

export interface DefensivePrinciples {
  readonly threeCorridorCompactness: PrincipleQuality;
  readonly axisProtection: PrincipleQuality;
  readonly nearSideClosure: PrincipleQuality;
  readonly coverShadow: PrincipleQuality;
  readonly pressingTrapQuality: PrincipleQuality;
  readonly restDefenseIntegrity: PrincipleQuality;
  readonly depthProtection: PrincipleQuality;
  readonly counterpressReadiness: PrincipleQuality;
  readonly defensiveFoldSpeed: PrincipleQuality;
  readonly numericalContainment: PrincipleQuality;
  readonly compactnessCorridors: number;
}

export interface TransitionPrinciples {
  readonly counterpressWindow: PrincipleQuality;
  readonly defensiveRestDefense: PrincipleQuality;
  readonly attackingChaosAdvantage: PrincipleQuality;
  readonly recoveryRace: PrincipleQuality;
  readonly looseBallPressure: PrincipleQuality;
  readonly secondWaveSupport: PrincipleQuality;
  readonly recycleSpeed: PrincipleQuality;
  readonly contactDominanceEstimate: PrincipleQuality;
}

export interface PrincipleModifier {
  readonly label: string;
  readonly value: number;
}

export interface TacticalPrincipleEvaluation {
  readonly attacking: AttackingPrinciples;
  readonly defensive: DefensivePrinciples;
  readonly transition: TransitionPrinciples;
  readonly baseModifiers: readonly PrincipleModifier[];
}

export enum StructuralLawIntensity {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
}

export interface StructuralPrincipleLawProfile {
  readonly restDefenseSlots: number;
  readonly attackCorridorTarget: number;
  readonly defensiveCorridorTarget: number;
  readonly depthRunnerCount: number;
  readonly supportTriangle: StructuralLawIntensity;
  readonly podSupport: StructuralLawIntensity;
  readonly staggering: StructuralLawIntensity;
  readonly coverShadow: StructuralLawIntensity;
  readonly pressingTrap: StructuralLawIntensity;
  readonly counterpress: StructuralLawIntensity;
  readonly gainLineIntent: StructuralLawIntensity;
  readonly recycleSpeed: StructuralLawIntensity;
  readonly foldSpeed: StructuralLawIntensity;
  readonly collisionDominance: StructuralLawIntensity;
  readonly structuralRisk: StructuralLawIntensity;
  readonly labels: readonly string[];
}

export interface PrincipleModifierInput {
  readonly principles: TacticalPrincipleEvaluation;
  readonly targetZone: ZoneId;
  readonly localAdvantage: LocalAdvantageEvaluation;
}
