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
  const fullExport = exportHtml.toLowerCase();
  const visible = mainVisibleHtml(exportHtml).toLowerCase();

  assertTest(model.visibleRecommendationWordingCount === 0, "visible recommendation wording count must be 0.");
  assertTest(model.visibleSelectionWordingCount === 0, "visible selection wording count must be 0.");
  assertTest(fullExport.includes("mode contr&ocirc;l&eacute;") || fullExport.includes("controlled local read-only db mode"), "export evidence must say mode controle.");
  assertTest(fullExport.includes("lecture locale") || fullExport.includes("read-only mode"), "export evidence must say lecture locale.");
  assertTest(!model.defaultEnabled || fullExport.includes("default enabled: false"), "export evidence must say non actif par defaut.");
  assertTest(model.realDatabaseWriteCount === 0 || fullExport.includes("real database write count: 0"), "export evidence must say no write.");
  assertTest(model.activeProductHistorySource === "file_backed" || fullExport.includes("file_backed remains active product source"), "export evidence must say product source unchanged.");
  assertTest(!visible.includes("sqlite est source de v"), "visible copy must not claim SQLite is source of truth.");
  assertTest(!visible.includes("le produit utilise sqlite"), "visible copy must not claim product uses SQLite.");
  assertTest(!visible.includes("selection automatique"), "visible copy must not claim automatic selection.");
  assertTest(!visible.includes("preuve globale"), "visible copy must not claim global proof.");

  return [
    "export evidence preserves controlled local read-only mode",
    "export evidence preserves non-default and no-write boundary",
    "export evidence keeps product source unchanged",
    "main visible coach copy avoids SQLite product-truth and automatic-selection claims",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportControlledLocalReadOnlyDbModeCopy();
  console.log("coachReportControlledLocalReadOnlyDbModeCopy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
