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

export function validateSourceOfTruthGuards3O(): readonly string[] {
  mustRejectGlobalEconomy("WORKBENCH_CHAIN_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_SANDBOX");
  mustRejectGlobalEconomy("WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_RESOLUTION");
  mustRejectGlobalEconomy("WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_CANDIDATE");
  mustRejectGlobalEconomy("WORKBENCH_CHAIN_SANDBOX_SCORING_OPPORTUNITY_MODEL");
  mustRejectGlobalEconomy("WORKBENCH_CHAIN_CONTROLLED_ROUTE_RESOLUTION_SANDBOX");
  mustRejectGlobalEconomy("WORKBENCH_CHAIN_REAL_ISOLATED_SEGMENT_REPLAY");
  mustRejectGlobalEconomy("WORKBENCH_CHAIN_CONTROLLED_SEGMENT_REPLAY_COMPARISON");
  mustRejectGlobalEconomy("WORKBENCH_CHAIN_ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT");
  mustRejectGlobalEconomy("WORKBENCH_CHAIN_LIVE_SELECTION_OVERRIDE_GUARD");
  mustRejectGlobalEconomy("WORKBENCH_CHAIN_CONTROLLED_MINIMATCH_ROUTE_SOURCE");
  mustRejectGlobalEconomy("WORKBENCH_CHAIN_SEGMENT_ROUTE_INPUT");
  mustRejectGlobalEconomy("WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SELECTION");
  mustRejectGlobalEconomy("WORKBENCH_CHAIN_SHADOW_ROUTE_SELECTION");
  mustRejectGlobalEconomy("WORKBENCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE");
  mustRejectGlobalEconomy("WORKBENCH_CHAIN_SEGMENT_CONTEXT");
  mustRejectGlobalEconomy("WORKBENCH_CHAIN_CONSUMPTION");
  mustRejectGlobalEconomy("FULL_MATCH_HARNESS_SINGLE_RUN");
  assertCanMakeGlobalScoringEconomyClaim("FULL_MATCH_BATCH_ECONOMY");

  return [
    "WORKBENCH_CHAIN_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_SANDBOX cannot make global economy claims",
    "WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_RESOLUTION cannot make global economy claims",
    "WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_CANDIDATE cannot make global economy claims",
    "WORKBENCH_CHAIN_SANDBOX_SCORING_OPPORTUNITY_MODEL cannot make global economy claims",
    "WORKBENCH_CHAIN_CONTROLLED_ROUTE_RESOLUTION_SANDBOX cannot make global economy claims",
    "WORKBENCH_CHAIN_REAL_ISOLATED_SEGMENT_REPLAY cannot make global economy claims",
    "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_REPLAY_COMPARISON cannot make global economy claims",
    "WORKBENCH_CHAIN_ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT cannot make global economy claims",
    "WORKBENCH_CHAIN_LIVE_SELECTION_OVERRIDE_GUARD cannot make global economy claims",
    "WORKBENCH_CHAIN_CONTROLLED_MINIMATCH_ROUTE_SOURCE cannot make global economy claims",
    "WORKBENCH_CHAIN_SEGMENT_ROUTE_INPUT cannot make global economy claims",
    "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SELECTION cannot make global economy claims",
    "WORKBENCH_CHAIN_SHADOW_ROUTE_SELECTION cannot make global economy claims",
    "WORKBENCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE cannot make global economy claims",
    "WORKBENCH_CHAIN_SEGMENT_CONTEXT cannot make global economy claims",
    "WORKBENCH_CHAIN_CONSUMPTION cannot make global economy claims",
    "FULL_MATCH_HARNESS_SINGLE_RUN cannot make global economy claims",
    "FULL_MATCH_BATCH_ECONOMY remains the only global scoring economy proof",
  ];
}

if (require.main === module) {
  const checks = validateSourceOfTruthGuards3O();

  console.log("sourceOfTruthGuards.3o tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
