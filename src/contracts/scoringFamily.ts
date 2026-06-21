export type OfficialScoringFamily =
  | "SHOT_GOAL"
  | "TRY_TOUCHDOWN"
  | "CONVERSION_GOAL"
  | "DROP_GOAL"
  | "PENALTY_SHOT"
  | "UNKNOWN";

export type ScoringAttributionConfidence = "high" | "medium" | "low";

export type ScoringFamilyAttributionWarningCode =
  | "UNKNOWN_SCORING_FAMILY"
  | "MISSING_SCORING_ACTION"
  | "MISSING_SCORE_CHANGE_POINT_VALUE"
  | "FAMILY_POINT_VALUE_MISMATCH"
  | "INACTIVE_PENALTY_SHOT_USED"
  | "AMBIGUOUS_SCORING_FAMILY"
  | "LOW_CONFIDENCE_SCORING_ATTRIBUTION"
  | "SCORING_EVENT_WITHOUT_OFFICIAL_CONSEQUENCE"
  | "SCORE_CHANGE_WITHOUT_SCORING_FAMILY";

export interface ScoringFamilyAttribution {
  readonly family: OfficialScoringFamily;
  readonly scoringAction: OfficialScoringFamily;
  readonly confidence: ScoringAttributionConfidence;
  readonly attributionReason: string;
  readonly sourceFieldsUsed: readonly string[];
  readonly missingFields: readonly string[];
  readonly warningCodes: readonly ScoringFamilyAttributionWarningCode[];
  readonly pointValue?: number;
  readonly unknownReason?: string;
}
