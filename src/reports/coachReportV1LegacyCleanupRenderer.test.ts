import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  let visible = "";
  let cursor = 0;

  while (cursor < html.length) {
    const start = html.indexOf("<details", cursor);
    if (start === -1) {
      visible += html.slice(cursor);
      break;
    }

    visible += html.slice(cursor, start);
    const close = html.indexOf("</details>", start);
    cursor = close === -1 ? html.length : close + "</details>".length;
  }

  return visible;
}

export function validateCoachReportV1LegacyCleanupRenderer(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visible = visibleHtml(experimentalHtml);
  const v1Index = experimentalHtml.indexOf("Ce que le match dit");
  const legacyIndex = experimentalHtml.indexOf("Ancienne lecture du rapport");

  assertTest(experimentalHtml.includes("Ce que le match dit"), "experimental report must contain official V1 reading.");
  assertTest(experimentalHtml.includes("Signaux officiels détaillés"), "experimental report must contain detailed official signals.");
  assertTest(experimentalHtml.includes("Hypothèses expérimentales à tester"), "experimental report must contain experimental hypotheses.");
  assertTest(experimentalHtml.includes("Détails techniques et traçabilité"), "experimental report must contain technical traceability.");
  assertTest(!visible.includes("<h2>Moments clés</h2>"), "top-level Moments clés must not appear after V1.");
  assertTest(!visible.includes("<h2>Analyse du coach</h2>"), "top-level Analyse du coach must not appear after V1.");
  assertTest(legacyIndex !== -1 && v1Index !== -1 && v1Index < legacyIndex, "legacy content must be under later collapsed traceability.");
  assertTest(experimentalHtml.includes("Ancienne lecture du rapport"), "legacy content must appear under collapsed legacy report reading if preserved.");
  assertTest(experimentalHtml.includes("Score du rapport full-match"), "score source label must be visible.");
  assertTest(experimentalHtml.includes("Les diagnostics batch et les échantillons de scoring-events restent séparés"), "score separation copy must be visible.");
  assertTest(!defaultHtml.includes("Ce que le match dit"), "default report must hide experimental cleanup hierarchy.");

  return [
    "experimental report contains Ce que le match dit",
    "experimental report contains Signaux officiels détaillés",
    "experimental report contains Hypothèses expérimentales à tester",
    "experimental report contains Détails techniques et traçabilité",
    "top-level Moments clés does not appear after V1",
    "top-level Analyse du coach does not appear after V1",
    "legacy content appears under collapsed Ancienne lecture du rapport",
    "score label Score du rapport full-match is visible",
    "score separation copy is visible",
    "default report hides experimental cleanup hierarchy",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1LegacyCleanupRenderer();

  console.log("coachReportV1LegacyCleanupRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

