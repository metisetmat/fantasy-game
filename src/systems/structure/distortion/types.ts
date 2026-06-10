import type { Rating } from "../../../core/ratings";

export enum StructuralDistortionLevel {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
  Critical = "CRITICAL",
}

export interface StructuralDistortionProfile {
  readonly compactnessPenalty: number;
  readonly corridorStretch: number;
  readonly supportSpacingStretch: number;
  readonly defensiveLineDamage: number;
  readonly restDefenseDamage: number;
  readonly recoveryDelay: number;
  readonly foldSpeed: Rating;
  readonly transitionLag: number;
}

export interface StructuralDistortionEvaluation {
  readonly level: StructuralDistortionLevel;
  readonly score: Rating;
  readonly profile: StructuralDistortionProfile;
  readonly triggers: readonly string[];
  readonly recoveryReasons: readonly string[];
}
