import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import { renderCoachProductReport } from "./renderCoachProductReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function productMainVisibleHtml(html: string): string {
  const mainStart = html.indexOf("<main id=\"product-main\">");
  const mainEnd = html.indexOf("<section id=\"appendices\"");

  return html.slice(mainStart, mainEnd);
}

export function validatePlayerCandidateComparisonCopy(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const visible = productMainVisibleHtml(renderCoachProductReport(buildCoachProductReportViewFromMatchReport(
    report,
    rosterCoverageFixturePlayers,
  ))).toLocaleLowerCase("fr-FR");
  const forbidden = [
    "meilleur choix",
    "joueur recommandé",
    "joueur recommandÃ©",
    "recommandé",
    "recommandÃ©",
    "à sélectionner",
    "a selectionner",
    "titulaire conseillé",
    "titulaire conseillÃ©",
    "remplacement conseillé",
    "remplacement conseillÃ©",
    "composition recommandée",
    "composition recommandÃ©e",
    "sélection automatique",
    "selection automatique",
    "officially_confirmed",
    "trace_supported",
    "sandbox_only",
  ] as const;

  for (const term of forbidden) {
    assertTest(!visible.includes(term.toLocaleLowerCase("fr-FR")), `visible copy must not contain ${term}.`);
  }

  return [
    "visible copy avoids recommendation wording",
    "visible copy avoids selection wording",
    "visible copy avoids internal status leaks",
  ];
}

if (require.main === module) {
  const checks = validatePlayerCandidateComparisonCopy();

  console.log("playerCandidateComparisonCopy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
