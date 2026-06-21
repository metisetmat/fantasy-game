import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function mainVisibleHtml(html: string): string {
  return html
    .replace(/<details[\s\S]*?<\/details>/gu, "")
    .replace(/<script[\s\S]*?<\/script>/gu, "");
}

export function validateCoachReportControlledLocalReadOnlyDbModeCopy(): readonly string[] {
  const { exportHtml, controlledLocalReadOnlyDbMode: model } = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const visible = mainVisibleHtml(exportHtml).toLowerCase();

  assertTest(model.visibleRecommendationWordingCount === 0, "visible recommendation wording count must be 0.");
  assertTest(model.visibleSelectionWordingCount === 0, "visible selection wording count must be 0.");
  assertTest(visible.includes("mode contr&ocirc;l&eacute;"), "visible copy must say mode controle.");
  assertTest(visible.includes("lecture locale"), "visible copy must say lecture locale.");
  assertTest(visible.includes("non actif par d&eacute;faut"), "visible copy must say non actif par defaut.");
  assertTest(visible.includes("aucune &eacute;criture"), "visible copy must say no write.");
  assertTest(visible.includes("source produit active inchang"), "visible copy must say product source unchanged.");
  assertTest(!visible.includes("sqlite est source de v"), "visible copy must not claim SQLite is source of truth.");
  assertTest(!visible.includes("le produit utilise sqlite"), "visible copy must not claim product uses SQLite.");
  assertTest(!visible.includes("selection automatique"), "visible copy must not claim automatic selection.");
  assertTest(!visible.includes("preuve globale"), "visible copy must not claim global proof.");

  return [
    "visible copy states controlled local read-only mode",
    "visible copy states non-default and no-write boundary",
    "visible copy keeps product source unchanged",
    "visible copy avoids SQLite product-truth and automatic-selection claims",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportControlledLocalReadOnlyDbModeCopy();
  console.log("coachReportControlledLocalReadOnlyDbModeCopy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
