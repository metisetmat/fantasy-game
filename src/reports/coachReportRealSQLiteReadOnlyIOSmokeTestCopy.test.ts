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
  const visible = stripHtml(buildCoachReportMultiMatchPhaseComparisonTestContext().exportHtml);

  assertTest(visible.includes("smoke test sqlite read-only"), "visible copy must name the smoke test.");
  assertTest(visible.includes("smoke test contr&ocirc;l&eacute;"), "visible copy must say controlled smoke test.");
  assertTest(visible.includes("read-only"), "visible copy must say read-only.");
  assertTest(visible.includes("non actif par d&eacute;faut"), "visible copy must say non-default.");
  assertTest(visible.includes("non utilis&eacute; comme v&eacute;rit&eacute; produit"), "visible copy must say not product truth.");
  assertTest(visible.includes("source produit active reste inchang"), "visible copy must say product source unchanged.");
  assertTest(visible.includes("aucune &eacute;criture"), "visible copy must say no writes.");
  assertTest(visible.includes("aucune mutation du match officiel"), "visible copy must say no official match mutation.");
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
