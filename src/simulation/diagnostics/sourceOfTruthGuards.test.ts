import { assertCanMakeGlobalScoringEconomyClaim } from "./sourceOfTruthGuards";
import type { MatchEvidenceScope } from "./sourceOfTruthRegistry";

function assertGuard(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const NON_GLOBAL_ECONOMY_SCOPES: readonly MatchEvidenceScope[] = [
  "MINI_MATCH_LOCAL",
  "FULL_MATCH_HARNESS_SINGLE_RUN",
  "BATCH_DIAGNOSTIC_PROJECTION",
  "LIVE_SCORING_STREAM",
  "REPORT_RENDERING_ONLY",
  "WORKBENCH_CHAIN_OFFICIAL_TIMELINE_DIFF_VIEW",
];

export function validateSourceOfTruthGuards(): readonly string[] {
  assertCanMakeGlobalScoringEconomyClaim("FULL_MATCH_BATCH_ECONOMY");

  for (const scope of NON_GLOBAL_ECONOMY_SCOPES) {
    try {
      assertCanMakeGlobalScoringEconomyClaim(scope);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      assertGuard(message.includes("50-match economy"), `${scope} error must mention the validated 50-match economy.`);
      assertGuard(message.includes("single runFullMatch harness output"), `${scope} error must mention single-run limitation.`);
      continue;
    }

    throw new Error(`${scope} must not be allowed to make global scoring economy claims.`);
  }

  return [
    "FULL_MATCH_BATCH_ECONOMY can make global scoring economy claims",
    "all non-batch scopes reject global scoring economy claims",
    "rejection message mentions 50-match economy and single-run limitation",
  ];
}

if (require.main === module) {
  const checks = validateSourceOfTruthGuards();

  console.log("source-of-truth guard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
