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

export function validateCoachReportV1Renderer(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(
    runFullMatch(input, {
      routeSelectionMode: "workbench_chain_replay_experimental",
    }),
  );
  const visible = visibleHtml(experimentalHtml);

  assertTest(experimentalHtml.includes("Rapport coach V1 — lecture visuelle des agrégats officiels"), "experimental report must contain V1 title.");
  assertTest(!defaultHtml.includes("Rapport coach V1 — lecture visuelle des agrégats officiels"), "default report must hide V1 title.");
  assertTest(experimentalHtml.includes("Cette lecture visuelle s'appuie d'abord sur les agrégats officiels du match."), "V1 intro must be visible.");
  assertTest(experimentalHtml.includes("Source : Officiel"), "V1 visible cards must include source badges.");
  assertTest(experimentalHtml.includes("Confiance :"), "V1 visible cards must include confidence badges.");
  assertTest(experimentalHtml.includes("Détails techniques du rapport V1"), "V1 technical details must be collapsed.");
  assertTest(!visible.includes("coach_report_v1_visualization"), "V1 internal tags must not be visible outside technical details.");

  return [
    "experimental report contains V1 visualization",
    "default report hides V1 visualization",
    "intro, source badges, and confidence badges are visible",
    "technical details are collapsed",
    "internal V1 tags stay out of visible copy",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1Renderer();

  console.log("coachReportV1Renderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
