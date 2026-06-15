import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { containsMojibake } from "./coachCopyQuality";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportV1Encoding(): readonly string[] {
  const html = renderHtmlCoachReport(runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));

  assertTest(html.includes("Rapport coach V1 — lecture visuelle des agrégats officiels"), "V1 title must render with clean accents and em dash.");
  assertTest(html.includes("Cette lecture visuelle s’appuie d’abord"), "V1 intro must render with clean apostrophe and accents.");
  assertTest(html.includes("Source : Officiel"), "V1 source badge must render with clean French copy.");
  assertTest(html.includes("Confiance :"), "V1 confidence badge must render with clean French copy.");
  assertTest(!containsMojibake(html), "experimental coach HTML must contain no mojibake after V1 rendering.");

  return [
    "V1 title renders with clean accents and em dash",
    "V1 intro renders with clean apostrophe and accents",
    "V1 source and confidence badges render cleanly",
    "experimental coach HTML remains free of mojibake",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1Encoding();

  console.log("coachReportV1Encoding tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
