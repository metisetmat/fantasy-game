import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { renderCoachProductReport } from "./renderCoachProductReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachProductReportPolishRenderer(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const html = renderCoachProductReport(buildCoachProductReportViewFromMatchReport(report));

  assertTest(html.includes("Rapport coach — lecture produit"), "product report must contain polished title.");
  assertTest(html.includes("Résumé coach"), "product report must contain Résumé coach.");
  assertTest(html.includes("Ce que le match dit"), "product report must contain Ce que le match dit.");
  assertTest(html.includes("3 signaux clés"), "product report must contain 3 signaux clés.");
  assertTest(html.includes("Profils à observer"), "product report must contain Profils à observer.");
  assertTest(html.includes("À vérifier au prochain match"), "product report must contain next-match section.");
  assertTest(html.includes("À ne pas sur-interpréter"), "product report must contain interpretation guard.");
  assertTest(html.includes("Annexes"), "product report must contain Annexes.");
  assertTest(html.includes("Les diagnostics batch et les échantillons live restent séparés de ce score."), "compact score source note must be visible.");
  assertTest(html.includes("Prévisualisation non appliquée — non confirmée comme recommandation officielle."), "compact profile guard must be visible.");
  assertTest(html.includes("<details class=\"appendix\">"), "appendices must be collapsed by default.");
  assertTest(html.includes("@media print"), "print CSS must exist.");
  assertTest(html.includes("break-inside: avoid"), "print CSS must avoid broken cards/details.");

  return [
    "review-ready product title is visible",
    "required product sections are visible",
    "compact score source and profile guard are visible",
    "appendices are collapsed by default",
    "print CSS exists",
  ];
}

if (require.main === module) {
  const checks = validateCoachProductReportPolishRenderer();

  console.log("coachProductReportPolishRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
