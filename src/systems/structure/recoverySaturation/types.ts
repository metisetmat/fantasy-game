import type { TeamId } from "../../../core/ids";

export enum RecoverySaturationLevel {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
  Critical = "CRITICAL",
}

export interface RecoverySaturationState {
  readonly teamId: TeamId;
  readonly score: number;
  readonly level: RecoverySaturationLevel;
  readonly reasons: readonly string[];
}

export interface RecoverySaturationImpact {
  readonly recoveryQualityPenalty: number;
  readonly compactnessPenalty: number;
  readonly freeSafetyPenalty: number;
  readonly lastLineSavePenalty: number;
  readonly pressingPenalty: number;
  readonly reasons: readonly string[];
}
