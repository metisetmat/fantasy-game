import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
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

export function validatePlayerMatchupViewCopy(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const visible = productMainVisibleHtml(renderCoachProductReport(buildCoachProductReportViewFromMatchReport(
    report,
    engineToCoachPublicContractFixtures.matchInputFixture.homeTeam.roster,
  ))).toLocaleLowerCase("fr-FR");
  const forbidden = [
    "best",
    "recommended",
    "recommandÃ©",
    "meilleur choix",
    "composition recommandÃ©e",
    "titulaire conseillÃ©",
    "remplacement conseillÃ©",
    "sÃ©lection automatique",
    "officially_confirmed",
    "trace_supported",
    "sandbox_only",
  ] as const;

  for (const term of forbidden) {
    assertTest(!visible.includes(term.toLocaleLowerCase("fr-FR")), `visible copy must not contain ${term}.`);
  }

  return [
    "main visible copy avoids player recommendation wording",
    "main visible copy avoids internal status leaks",
    "main visible copy keeps sandbox and trace terms out of the coach section",
  ];
}

if (require.main === module) {
  const checks = validatePlayerMatchupViewCopy();

  console.log("playerMatchupViewCopy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
