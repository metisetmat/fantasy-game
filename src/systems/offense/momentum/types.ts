import type { TeamId } from "../../../core/ids";

export enum OffensiveMomentumLevel {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
  Surging = "SURGING",
}

export interface OffensiveMomentumState {
  readonly teamId: TeamId;
  readonly score: number;
  readonly level: OffensiveMomentumLevel;
  readonly reasons: readonly string[];
}

export interface OffensiveMomentumBias {
  readonly progression: number;
  readonly finishing: number;
  readonly directAttack: number;
  readonly lateralCirculation: number;
  readonly recycle: number;
  readonly reasons: readonly string[];
}
