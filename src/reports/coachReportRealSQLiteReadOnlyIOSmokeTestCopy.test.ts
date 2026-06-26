import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim()
    .toLowerCase();
}

export function validateCoachReportRealSQLiteReadOnlyIOSmokeTestCopy(): readonly string[] {
  const context = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const model = context.realSQLiteReadOnlyIOSmokeTest;
  const visible = stripHtml(context.exportHtml);

  assertTest(model.modeName === "real_sqlite_readonly_io_smoke_test", "evidence must name the smoke test.");
  assertTest(model.nonProdFixtureOnly && model.explicitControlledModeOnly, "evidence must say controlled smoke test.");
  assertTest(model.readOnlyMode, "evidence must say read-only.");
  assertTest(!model.defaultFeatureFlagEnabled && !model.productActivationAllowed, "evidence must say non-default.");
  assertTest(!model.databaseUsedAsProductTruth, "evidence must say not product truth.");
  assertTest(model.activeProductHistorySource === "file_backed", "evidence must say product source unchanged.");
  assertTest(model.realDatabaseWriteCount === 0, "evidence must say no writes.");
  assertTest(!model.canMutateTimeline && !model.canMutateScore && !model.canMutatePossession, "evidence must say no official match mutation.");
  assertTest(!visible.includes("sqlite est source de v"), "visible copy must not claim SQLite is source of truth.");
  assertTest(!visible.includes("le produit utilise sqlite"), "visible copy must not claim product uses SQLite.");
  assertTest(!visible.includes("tendance prouv"), "visible copy must not claim proved trend.");
  assertTest(!visible.includes("preuve globale"), "visible copy must not claim global proof.");
  assertTest(!visible.includes("recommandation automatique"), "visible copy must not include automatic recommendation wording.");
  assertTest(!visible.includes("s&eacute;lection automatique"), "visible copy must not include automatic selection wording.");

  return [
    "visible copy states controlled read-only non-prod smoke test",
    "visible copy states non-default, no-write, and no official mutation boundary",
    "visible copy avoids SQLite product-truth and automatic-selection claims",
  ];
}

const checks = validateCoachReportRealSQLiteReadOnlyIOSmokeTestCopy();

console.log("coachReportRealSQLiteReadOnlyIOSmokeTestCopy tests passed.");
for (const check of checks) {
  console.log(`- ${check}`);
}
