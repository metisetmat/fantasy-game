import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { containsMojibake } from "./coachCopyQuality";
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

export function validateCoachReportTraceAggregateRenderer(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visible = visibleHtml(experimentalHtml);

  assertTest(experimentalHtml.includes("Rapport coach depuis les agrégats officiels"), "experimental report must contain trace aggregate coach report.");
  assertTest(experimentalHtml.includes("Zones de danger"), "danger zones card must be present.");
  assertTest(experimentalHtml.includes("Pertes sous pression"), "pressure losses card must be present.");
  assertTest(experimentalHtml.includes("Récupérations utiles"), "recoveries card must be present.");
  assertTest(experimentalHtml.includes("Joueurs impliqués"), "player involvement card must be present.");
  assertTest(experimentalHtml.includes("Causes récurrentes"), "recurring causes card must be present.");
  assertTest(experimentalHtml.includes("Point de vigilance coach"), "coach watchpoint card must be present.");
  assertTest(!defaultHtml.includes("Rapport coach depuis les agrégats officiels"), "default report must hide trace aggregate coach report.");
  assertTest(visible.includes("Les diagnostics et le sandbox restent séparés"), "visible copy must say diagnostics and sandbox are separated.");
  assertTest(!containsMojibake(experimentalHtml), "visible copy must contain no mojibake.");
  assertTest(!visible.includes("workbench_chain_"), "visible copy must avoid developer tags.");
  assertTest(!visible.includes("le coach doit"), "visible copy must avoid mandatory wording.");
  assertTest(!visible.includes("il faut impérativement"), "visible copy must avoid imperative wording.");
  assertTest(!visible.includes("le moteur prouve"), "visible copy must avoid proof overclaim.");

  return [
    "experimental report contains trace aggregate coach report and six cards",
    "default report hides the section",
    "visible copy says diagnostics and sandbox are separated",
    "visible copy contains no mojibake and avoids developer jargon",
    "visible copy avoids mandatory wording",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportTraceAggregateRenderer();

  console.log("coachReportTraceAggregateRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

