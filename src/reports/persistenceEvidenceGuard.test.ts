import { persistenceEvidenceSnapshot } from "./persistenceEvidenceTestFixtures";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validatePersistenceEvidenceGuard(): readonly string[] {
  const snapshot = persistenceEvidenceSnapshot("inserted");

  assertTest(snapshot.lineupMutationCount === 0, "persistence evidence cannot change lineup.");
  assertTest(snapshot.startersMutationCount === 0, "persistence evidence cannot change starters.");
  assertTest(snapshot.benchMutationCount === 0, "persistence evidence cannot change bench.");
  assertTest(snapshot.noAutomaticSelection && snapshot.playerSelectedCount === 0, "persistence evidence cannot select a player.");
  assertTest(snapshot.automaticSelectionCount === 0, "persistence evidence cannot make automatic selection.");
  assertTest(snapshot.confidenceUpgradeCount === 0, "persistence evidence cannot upgrade confidence.");
  assertTest(snapshot.officiallyConfirmedCount === 0, "persistence evidence cannot mark officially confirmed.");
  assertTest(snapshot.scoreMutationCount === 0, "persistence evidence cannot mutate official score.");
  assertTest(snapshot.possessionMutationCount === 0, "persistence evidence cannot mutate official possession.");
  assertTest(snapshot.productionScoringEventCreationCount === 0, "persistence evidence cannot create production scoring events.");
  assertTest(snapshot.globalEconomyClaimCount === 0, "persistence evidence cannot claim global economy.");

  return [
    "persistence evidence cannot change lineup, starters, or bench",
    "persistence evidence cannot select players or upgrade confidence",
    "persistence evidence cannot mutate score, possession, scoring events, or global economy",
  ];
}

if (require.main === module) {
  const checks = validatePersistenceEvidenceGuard();
  console.log("persistenceEvidenceGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
