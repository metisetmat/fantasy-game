import { assertNoMojibake } from "./coachCopyQuality";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { productMainVisibleHtml } from "./coachProductReportRenderer.test";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachProductReportCopy(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const visible = productMainVisibleHtml(renderCoachProductReport(buildCoachProductReportViewFromMatchReport(report)));
  const lower = visible.toLocaleLowerCase("fr-FR");

  assertNoMojibake(visible, "coach product visible copy");
  assertTest(visible.includes("Résumé coach"), "visible copy must be French.");
  assertTest(visible.includes("Famille de rôle"), "visible copy must use localized role label.");
  assertTest(visible.includes("Attributs utiles"), "visible copy must use localized attribute label.");
  assertTest(visible.includes("soutien mobile"), "visible copy must use localized role names.");
  assertTest(visible.includes("prise de décision"), "visible copy must use localized attribute names.");
  assertTest(!lower.includes("composition recommandée"), "visible copy must not say composition recommandée.");
  assertTest(!lower.includes("meilleure sélection"), "visible copy must not say meilleure sélection.");
  assertTest(!lower.includes("le coach doit sélectionner"), "visible copy must not mandate selection.");

  return [
    "visible copy is French",
    "visible copy has no mojibake",
    "localized role and attribute labels are visible",
    "official selection wording is absent",
  ];
}

if (require.main === module) {
  const checks = validateCoachProductReportCopy();

  console.log("coachProductReportCopy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
