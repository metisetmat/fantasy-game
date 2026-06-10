export type TryReportScope =
  | "CURRENT_MINI_MATCH"
  | "LIVE_EVENT_STREAM"
  | "BATCH_DIAGNOSTICS"
  | "FOUNDATION_STATUS"
  | "CONVERSION_GEOMETRY"
  | "CONVERSION_SCORING";

export interface TryTerminologyScopeContract {
  readonly scope: TryReportScope;
  readonly labels: readonly string[];
}

export interface TryTerminologyContract {
  readonly scopes: readonly TryTerminologyScopeContract[];
  readonly forbiddenPhrases: readonly string[];
  readonly requiredPhrases: readonly string[];
}
