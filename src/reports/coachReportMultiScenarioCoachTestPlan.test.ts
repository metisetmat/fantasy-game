import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { containsMojibake } from "./coachCopyQuality";
import { renderHtmlCoachReport } from "./htmlCoachReport";
import { runFullMatch } from "../simulation/runFullMatch";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  let output = "";
  let cursor = 0;

  while (cursor < html.length) {
    const open = html.indexOf("<details", cursor);

    if (open === -1) {
      output += html.slice(cursor);
      break;
    }

    output += html.slice(cursor, open);
    let depth = 1;
    let scan = html.indexOf(">", open);

    if (scan === -1) {
      break;
    }

    scan += 1;
    while (scan < html.length && depth > 0) {
      const nextOpen = html.indexOf("<details", scan);
      const nextClose = html.indexOf("</details>", scan);

      if (nextClose === -1) {
        scan = html.length;
        break;
      }

      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth += 1;
        scan = html.indexOf(">", nextOpen);
        scan = scan === -1 ? html.length : scan + 1;
        continue;
      }

      depth -= 1;
      scan = nextClose + "</details>".length;
    }

    cursor = scan;
  }

  return output;
}

export function validateCoachReportMultiScenarioCoachTestPlan(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const experimentalVisibleHtml = visibleHtml(experimentalHtml);
  const forbiddenVisibleTerms = [
    "SegmentRouteInput",
    "selection shadow",
    "canDrive",
    "production route resolution",
    "scoreMutationCount",
    "workbench_chain_",
  ];

  assertTest(!defaultHtml.includes("Plan de test coach"), "default report must not show coach test plan.");
  assertTest(experimentalHtml.includes("Plan de test coach"), "experimental report must show coach test plan.");
  assertTest(experimentalHtml.includes("Renforcer le soutien autour de Z4-HSR"), "support test must be visible.");
  assertTest(experimentalHtml.includes("Mieux occuper le second ballon"), "second-ball test must be visible.");
  assertTest(experimentalHtml.includes("Prévoir la réaction au gardien fort"), "strong-goalkeeper fallback test must be visible.");
  assertTest(experimentalHtml.includes("Ces tests sont des hypothèses issues du sandbox"), "tests must be framed as hypotheses.");
  assertTest(experimentalHtml.includes("pas des consignes officielles"), "tests must not be official instructions.");
  assertTest(experimentalHtml.includes("Ils ne modifient ni la timeline officielle, ni le score, ni la possession, ni les événements de score"), "official state must remain unchanged.");
  assertTest(experimentalHtml.includes("Ils ne constituent pas une preuve d’économie globale"), "global economy overclaim must be avoided.");
  assertTest(!containsMojibake(experimentalHtml), "visible generated coach report must contain no mojibake.");
  for (const term of forbiddenVisibleTerms) {
    assertTest(!experimentalVisibleHtml.includes(term), `visible coach copy must not expose developer jargon: ${term}.`);
  }
  assertTest(experimentalHtml.includes("Détails techniques du plan de test"), "technical plan data must remain behind details.");
  assertTest(experimentalHtml.includes("multi_scenario_coach_test_plan"), "technical tags must remain available inside details.");

  return [
    "experimental report contains Plan de test coach",
    "experimental report contains three practical coach tests",
    "experimental report frames tests as hypotheses, not official instructions",
    "default report hides the experimental coach test plan",
    "visible coach copy contains no mojibake",
    "visible coach copy avoids developer jargon outside details",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportMultiScenarioCoachTestPlan();

  console.log("coachReportMultiScenarioCoachTestPlan tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
