import { createMockDatabaseCoachMatchHistoryAdapter } from "./history/mockDatabaseCoachMatchHistoryAdapter";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateDatabaseCoachMatchHistoryAdapterSpi(): readonly string[] {
  const adapter = createMockDatabaseCoachMatchHistoryAdapter();
  const description = adapter.describe();

  assertTest(adapter.adapterKind === "mock_database", "SPI exposes adapter kind.");
  assertTest(description.supportsInserted, "SPI supports inserted.");
  assertTest(description.supportsReplaced, "SPI supports replaced.");
  assertTest(description.supportsIgnoredDuplicate, "SPI supports ignored_duplicate.");
  assertTest(description.readOnlyForReports, "readOnlyForReports is true.");
  assertTest(!description.implemented, "implemented can remain false.");
  assertTest(!description.productionReady, "productionReady can remain false.");
  assertTest(!description.canDriveCoachInstruction, "cannot drive coach instruction.");
  assertTest(!description.canDriveLiveSelection, "cannot drive live selection.");
  assertTest(!description.canMutateScore, "cannot mutate score.");
  assertTest(!description.canCreateScoringEvent, "cannot create scoring events.");
  assertTest(!description.canClaimGlobalEconomy, "cannot claim global economy.");

  return [
    "SPI exists",
    "description exposes adapter kind",
    "supports inserted, replaced, and ignored_duplicate",
    "readOnlyForReports is true",
    "implemented and productionReady can remain false",
    "cannot drive coach instruction, live selection, score, scoring events, or global economy",
  ];
}

if (require.main === module) {
  const checks = validateDatabaseCoachMatchHistoryAdapterSpi();
  console.log("databaseCoachMatchHistoryAdapterSpi tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
