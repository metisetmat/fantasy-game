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
    let depth = 0;
    let scan = start;

    while (scan < html.length) {
      const nextOpen = html.indexOf("<details", scan);
      const nextClose = html.indexOf("</details>", scan);

      if (nextClose === -1) {
        cursor = html.length;
        break;
      }

      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth += 1;
        scan = nextOpen + "<details".length;
        continue;
      }

      depth -= 1;
      scan = nextClose + "</details>".length;
      if (depth === 0) {
        cursor = scan;
        break;
      }
    }
  }

  return visible;
}

export function validateHtmlCoachReportTechnicalDetailsGuard(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visible = visibleHtml(experimentalHtml);

  assertTest(!visible.includes("Ancrage workbench maintenant partiel"), "technical grounding title must not appear as a main visible card.");
  assertTest(!visible.includes("selection shadow"), "technical grounding details must not leak selection-shadow wording into visible copy.");
  assertTest(!visible.includes("SegmentRouteInput"), "technical grounding details must not leak SegmentRouteInput into visible copy.");
  assertTest(visible.includes("Le moteur utilise encore un harnais expérimental"), "visible grounding summary must remain short and coach-readable.");
  assertTest(experimentalHtml.includes("Détails techniques développeur"), "technical grounding details must be collapsed behind developer details.");
  assertTest(experimentalHtml.includes("Ancrage workbench maintenant partiel"), "technical grounding source title must remain available internally.");
  assertTest(experimentalHtml.includes("selection shadow") || experimentalHtml.includes("SegmentRouteInput"), "technical grounding internals must remain available.");

  return [
    "technical grounding full content is not displayed as a main visible card",
    "technical grounding jargon is hidden from visible coach copy",
    "visible grounding summary is short and coach-readable",
    "technical grounding details are collapsed behind developer details",
    "technical grounding internals remain available",
  ];
}

if (require.main === module) {
  const checks = validateHtmlCoachReportTechnicalDetailsGuard();

  console.log("htmlCoachReportTechnicalDetailsGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
