import { assertNoMojibake } from "./coachCopyQuality";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { productMainVisibleHtml } from "./coachProductReportRenderer.test";
import { renderCoachProductReport } from "./renderCoachProductReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachProductReportPolishCopy(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const visible = productMainVisibleHtml(renderCoachProductReport(buildCoachProductReportViewFromMatchReport(report)));
  const lower = visible.toLocaleLowerCase("fr-FR");

  assertNoMojibake(visible, "coach product polish visible copy");
  assertTest(visible.includes("Rapport coach — lecture produit"), "visible copy must contain polished French title.");
  assertTest(visible.includes("Résumé coach"), "visible copy must be French.");
  assertTest(visible.includes("Ces profils ne sont pas des choix imposés"), "visible copy must include interpretation guard.");
  assertTest(!lower.includes("composition recommandée"), "visible copy must not say composition recommandée.");
  assertTest(!lower.includes("meilleure sélection"), "visible copy must not say meilleure sélection.");
  assertTest(!lower.includes("le coach doit sélectionner"), "visible copy must not mandate selection.");

  return [
    "visible copy is French",
    "visible copy has no mojibake",
    "visible copy avoids official selection wording",
    "visible copy includes non-prescriptive interpretation guard",
  ];
}

if (require.main === module) {
  const checks = validateCoachProductReportPolishCopy();

  console.log("coachProductReportPolishCopy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
