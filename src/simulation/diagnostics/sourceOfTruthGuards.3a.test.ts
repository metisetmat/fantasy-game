import { assertCanMakeGlobalScoringEconomyClaim } from "./sourceOfTruthGuards";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function mustRejectGlobalEconomy(scope: Parameters<typeof assertCanMakeGlobalScoringEconomyClaim>[0]): void {
  try {
    assertCanMakeGlobalScoringEconomyClaim(scope);
    throw new Error(`${scope} must not make a global economy claim.`);
  } catch (error) {
    assertTest(String(error).includes("50-match economy"), `${scope} rejection must mention 50-match economy.`);
  }
}

export function validateSourceOfTruthGuards3A(): readonly string[] {
  mustRejectGlobalEconomy("FULL_MATCH_HARNESS_SINGLE_RUN");
  mustRejectGlobalEconomy("WORKBENCH_CHAIN_SEGMENT_CONTEXT");
  mustRejectGlobalEconomy("BATCH_DIAGNOSTIC_PROJECTION");
  mustRejectGlobalEconomy("LIVE_SCORING_STREAM");
  assertCanMakeGlobalScoringEconomyClaim("FULL_MATCH_BATCH_ECONOMY");

  return [
    "FULL_MATCH_HARNESS_SINGLE_RUN cannot make global economy claims",
    "WORKBENCH_CHAIN_SEGMENT_CONTEXT cannot make global economy claims",
    "WORKBENCH_CHAIN_CONSUMPTION cannot make global economy claims",
    "FULL_MATCH_BATCH_ECONOMY remains the only global scoring economy proof",
  ];
}

if (require.main === module) {
  const checks = validateSourceOfTruthGuards3A();

  console.log("sourceOfTruthGuards.3a tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
