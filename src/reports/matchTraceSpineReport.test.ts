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

export function validateMatchTraceSpineReport(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(
    runFullMatch(input, {
      routeSelectionMode: "workbench_chain_replay_experimental",
    }),
  );
  const visible = visibleHtml(experimentalHtml);

  assertTest(!defaultHtml.includes("Colonne de traces de match"), "default report must not show experimental trace spine details.");
  assertTest(experimentalHtml.includes("Colonne de traces de match"), "experimental report must contain trace spine diagnostic.");
  assertTest(experimentalHtml.includes("Match event trace spine available"), "experimental report must contain trace spine status.");
  assertTest(experimentalHtml.includes("officialTraceCount="), "experimental report must contain official trace count.");
  assertTest(experimentalHtml.includes("miniMatchTraceCount="), "experimental report must contain mini-match trace count.");
  assertTest(experimentalHtml.includes("sandboxTraceCount="), "experimental report must contain sandbox trace count.");
  assertTest(!containsMojibake(experimentalHtml), "visible coach copy must contain no mojibake.");
  assertTest(experimentalHtml.includes("Le moteur commence à produire des traces structurées"), "trace copy must remain coach-readable in the technical block.");
  assertTest(!visible.includes("Le moteur commence à produire des traces structurées"), "trace spine copy must be collapsed under technical details.");
  assertTest(!visible.includes("officialTraceCount="), "trace counts must stay inside technical details.");
  assertTest(!visible.includes("workbench_chain_match_event_trace_spine"), "developer tags must stay inside technical details.");

  return [
    "experimental report contains Colonne de traces de match",
    "experimental report contains trace spine status and trace counts in details",
    "default report hides experimental trace spine details",
    "trace spine details are collapsed by the V1 information hierarchy",
    "visible copy has no mojibake and avoids developer jargon",
  ];
}

if (require.main === module) {
  const checks = validateMatchTraceSpineReport();

  console.log("matchTraceSpineReport tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
