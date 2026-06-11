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

export function validateSourceOfTruthGuards3D(): readonly string[] {
  mustRejectGlobalEconomy("WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SELECTION");
  mustRejectGlobalEconomy("WORKBENCH_CHAIN_SHADOW_ROUTE_SELECTION");
  mustRejectGlobalEconomy("WORKBENCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE");
  mustRejectGlobalEconomy("FULL_MATCH_HARNESS_SINGLE_RUN");
  assertCanMakeGlobalScoringEconomyClaim("FULL_MATCH_BATCH_ECONOMY");

  return [
    "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SELECTION cannot make global economy claims",
    "WORKBENCH_CHAIN_SHADOW_ROUTE_SELECTION cannot make global economy claims",
    "WORKBENCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE cannot make global economy claims",
    "FULL_MATCH_HARNESS_SINGLE_RUN cannot make global economy claims",
    "FULL_MATCH_BATCH_ECONOMY remains the only global scoring economy proof",
  ];
}

if (require.main === module) {
  const checks = validateSourceOfTruthGuards3D();

  console.log("sourceOfTruthGuards.3d tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
