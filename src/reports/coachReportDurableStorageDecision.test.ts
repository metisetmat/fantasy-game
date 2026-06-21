import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportDurableStorageDecision(): readonly string[] {
  const { durableStorageDecision } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(durableStorageDecision.status === "available", "durable storage decision is available.");
  assertTest(durableStorageDecision.selectedStorageTarget === "sqlite_local", "storage target is sqlite_local.");
  assertTest(durableStorageDecision.schemaVersion === "coach_match_history_v1", "schema version is coach_match_history_v1.");
  assertTest(durableStorageDecision.realAdapterWiringPrepared, "real adapter wiring prepared.");
  assertTest(durableStorageDecision.adapterKind === "sqlite_local_disabled", "adapter kind is sqlite_local_disabled.");
  assertTest(durableStorageDecision.adapterImplemented, "adapter implemented true.");
  assertTest(!durableStorageDecision.adapterProductionReady, "adapter production ready false.");
  assertTest(!durableStorageDecision.productActivationAllowed, "product activation allowed false.");
  assertTest(durableStorageDecision.activeProductHistorySource === "file_backed", "active source remains file_backed.");
  assertTest(!durableStorageDecision.databaseUsedAsProductTruth, "database used as product truth false.");
  assertTest(durableStorageDecision.realDatabaseReadCount === 0 && durableStorageDecision.realDatabaseWriteCount === 0, "real database IO 0.");
  assertTest(durableStorageDecision.insertedScenarioPass && durableStorageDecision.replacedScenarioPass && durableStorageDecision.ignoredDuplicateScenarioPass, "save scenarios pass.");
  assertTest(durableStorageDecision.queryByTeamPass && durableStorageDecision.queryByPhasePass && durableStorageDecision.deterministicOrderingPass, "query/order scenarios pass.");

  return [
    "durable storage decision available",
    "sqlite_local and coach_match_history_v1 selected",
    "sqlite_local_disabled adapter prepared",
    "product activation false and file_backed remains active",
    "save/query/order scenarios pass",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportDurableStorageDecision();
  console.log("coachReportDurableStorageDecision tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
