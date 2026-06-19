import { describeFutureDatabaseCoachMatchHistoryAdapter } from "./history/databaseCoachMatchHistoryAdapterContract";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateDatabaseCoachMatchHistoryAdapterContract(): readonly string[] {
  const contract = describeFutureDatabaseCoachMatchHistoryAdapter();

  assertTest(contract.implemented === false, "database adapter is not implemented yet.");
  assertTest(contract.migrationRequired, "database migration is required.");
  assertTest(contract.mustPreserveSaveResultSemantics, "database adapter must preserve save-result semantics.");
  assertTest(contract.mustSupportIdempotentSave, "database adapter must support idempotent saves.");
  assertTest(!contract.canMutateScore && !contract.canCreateScoringEvent, "database adapter cannot mutate score or create scoring events.");

  return [
    "database adapter is not implemented yet",
    "database migration is required",
    "database adapter must preserve save-result semantics",
    "database adapter must support idempotent saves",
    "database adapter cannot mutate score or create scoring events",
  ];
}

if (require.main === module) {
  const checks = validateDatabaseCoachMatchHistoryAdapterContract();
  console.log("databaseCoachMatchHistoryAdapterContract tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
