import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";

const FORBIDDEN_VISIBLE_JARGON: readonly string[] = [
  "SegmentRouteInput",
  "selection shadow",
  "read-only",
  "canDrive",
  "production route resolution",
  "scoreMutationCount",
  "workbench_chain_",
];

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

function visibleJargonIn(html: string): readonly string[] {
  const visible = visibleHtml(html);
  return FORBIDDEN_VISIBLE_JARGON.filter((term) => visible.includes(term));
}

export function validateHtmlCoachReportCoachCopyGuard(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visibleJargon = visibleJargonIn(experimentalHtml);

  assertTest(visibleJargon.length === 0, `visible coach copy contains developer jargon: ${visibleJargon.join(", ")}`);
  assertTest(experimentalHtml.includes("Détails techniques"), "technical diagnostics must remain available behind details.");
  assertTest(experimentalHtml.includes("workbench_chain_"), "internal diagnostic tags must remain available inside details.");
  assertTest(experimentalHtml.includes("Cette piste reste une suggestion sandbox, pas une consigne officielle."), "visible copy must include suggestion-only wording.");
  assertTest(experimentalHtml.includes("Elle ne modifie ni la timeline officielle, ni le score, ni la possession, ni les événements de score."), "visible copy must include official-state guardrail wording.");
  assertTest(experimentalHtml.includes("Elle ne constitue pas une preuve d’économie globale."), "visible copy must include global-economy guardrail wording.");

  return [
    "visible coach copy avoids developer jargon",
    "technical diagnostics remain available behind details",
    "internal diagnostic tags remain preserved",
    "visible copy states sandbox suggestion-only guardrail",
    "visible copy states official state is unchanged",
    "visible copy states no global economy proof",
  ];
}

if (require.main === module) {
  const checks = validateHtmlCoachReportCoachCopyGuard();

  console.log("htmlCoachReportCoachCopyGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
