import { resolveDatabaseHistoryAdapterFeatureFlag } from "./history/databaseHistoryAdapterFeatureFlag";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateDatabaseHistoryAdapterFeatureFlag(): readonly string[] {
  const defaultFlag = resolveDatabaseHistoryAdapterFeatureFlag();
  const enabledFlag = resolveDatabaseHistoryAdapterFeatureFlag({ enabled: true });

  assertTest(!defaultFlag.enabled, "database adapter feature flag is disabled by default.");
  assertTest(!defaultFlag.productActivationAllowed, "default flag does not allow product activation.");
  assertTest(!defaultFlag.reportCanUseAsSourceOfTruth, "default flag does not allow report source-of-truth usage.");
  assertTest(!defaultFlag.canDriveCoachInstruction, "default flag cannot drive coach instruction.");
  assertTest(!defaultFlag.canDriveLiveSelection, "default flag cannot drive live selection.");
  assertTest(!defaultFlag.canDriveProductionRouteResolution, "default flag cannot drive production route resolution.");
  assertTest(!defaultFlag.canMutateScore, "default flag cannot mutate score.");
  assertTest(!defaultFlag.canCreateScoringEvent, "default flag cannot create scoring events.");
  assertTest(!defaultFlag.canClaimGlobalEconomy, "default flag cannot claim global economy.");
  assertTest(enabledFlag.enabled, "test override can expose enabled flag state.");
  assertTest(!enabledFlag.productActivationAllowed, "enabled spike flag still does not allow product activation.");

  return [
    "feature flag disabled by default",
    "product activation remains false",
    "report source-of-truth usage remains false",
    "selection, route, score, scoring-event, and economy drivers remain false",
  ];
}

if (require.main === module) {
  const checks = validateDatabaseHistoryAdapterFeatureFlag();
  console.log("databaseHistoryAdapterFeatureFlag tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
