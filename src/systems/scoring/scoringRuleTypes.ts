import type { ScoreUnit } from "./scoreUnitTypes";

export type ScoringVersion = "V1" | "V2_CONVERSION_ACTIVE" | "V2_DROP_FOUNDATION";
export type ScoringFoundationVersion = "V2_FOUNDATION" | "V2_CONVERSION_ACTIVE" | "V2_DROP_FOUNDATION";
export type ScoringActionType =
  | "SHOT_GOAL"
  | "SHOT_MISSED"
  | "SHOT_SAVED"
  | "SHOT_BLOCKED"
  | "SHOT_OUT_OF_PLAY"
  | "TRY_TOUCHDOWN"
  | "CONVERSION_GOAL"
  | "CONVERSION_MISSED"
  | "CONVERSION_BLOCKED"
  | "CONVERSION_INVALID"
  | "DROP_GOAL"
  | "DROP_MISSED"
  | "DROP_BLOCKED"
  | "DROP_INVALID";

export interface ScoringRule {
  readonly actionType: ScoringActionType;
  readonly pointValue: number;
  readonly activeInVersion: ScoringVersion;
}

export interface ScoringRuleSet {
  readonly version: ScoringVersion;
  readonly scoreUnit: ScoreUnit;
  readonly rules: readonly ScoringRule[];
}
