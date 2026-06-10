import type { MatchEvidenceScope } from "./sourceOfTruthRegistry";

export function assertCanMakeGlobalScoringEconomyClaim(scope: MatchEvidenceScope): void {
  if (scope === "FULL_MATCH_BATCH_ECONOMY") {
    return;
  }

  throw new Error(
    "Global scoring economy claims require FULL_MATCH_BATCH_ECONOMY evidence. A single runFullMatch harness output can raise harness/report warnings but cannot invalidate the validated 50-match economy.",
  );
}
