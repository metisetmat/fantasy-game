import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { renderCoachProductReport } from "./renderCoachProductReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function productMainVisibleHtml(html: string): string {
  const appendicesStart = html.search(/<section\s+id="appendices"[^>]*>/u);

  return appendicesStart === -1 ? html : html.slice(0, appendicesStart);
}

export function validateCoachProductReportRenderer(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const html = renderCoachProductReport(buildCoachProductReportViewFromMatchReport(report));

  assertTest(html.includes("Rapport coach"), "coach-report.product.html content must be generated.");
  assertTest(html.includes("Résumé coach"), "product report must contain Résumé coach.");
  assertTest(html.includes("Ce que le match dit"), "product report must contain Ce que le match dit.");
  assertTest(html.includes("3 signaux clés"), "product report must contain 3 signaux clés.");
  assertTest(html.includes("Profils à observer"), "product report must contain Profils à observer.");
  assertTest(html.includes("À vérifier au prochain match"), "product report must contain next-match section.");
  assertTest(html.includes("Annexes"), "product report must contain Annexes.");
  assertTest(html.includes("Score du rapport full-match"), "score source label must be visible.");
  assertTest(html.includes("Profil à observer"), "profile cards must be visible.");
  assertTest(html.includes("Prévisualisation non appliquée"), "compact non-applied guard must be visible.");
  assertTest(html.includes("<details class=\"appendix\">"), "appendices must be rendered as collapsed details.");

  return [
    "coach-report.product.html content is generated",
    "required 7 product sections are visible",
    "score source label is visible",
    "profile cards and compact guard are visible",
    "appendices are collapsed by default",
  ];
}

if (require.main === module) {
  const checks = validateCoachProductReportRenderer();

  console.log("coachProductReportRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
