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

export function validateMatchTraceAggregatorReport(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visible = visibleHtml(experimentalHtml);

  assertTest(experimentalHtml.includes("Agrégats de traces de match"), "experimental report must contain aggregate diagnostics.");
  assertTest(experimentalHtml.includes("Match trace aggregator available"), "experimental report must contain aggregate status.");
  assertTest(experimentalHtml.includes("officialTraceCount=") || experimentalHtml.includes("official_trace_count"), "experimental report must contain official count.");
  assertTest(experimentalHtml.includes("diagnosticTraceCount=") || experimentalHtml.includes("diagnostic_trace_count"), "experimental report must contain diagnostic count.");
  assertTest(experimentalHtml.includes("sandboxTraceCount=") || experimentalHtml.includes("sandbox_trace_count"), "experimental report must contain sandbox count.");
  assertTest(!defaultHtml.includes("AgrÃ©gats de traces de match"), "default report must not show aggregate diagnostics.");
  assertTest(experimentalHtml.includes("<summary>Détails techniques des agrégats</summary>"), "technical details must be collapsed.");
  assertTest(visible.includes("officiels, diagnostics et sandbox restent séparés"), "visible copy must explain scope separation.");
  assertTest(!containsMojibake(experimentalHtml), "visible coach copy must contain no mojibake.");
  assertTest(!visible.includes("workbench_chain_match_trace_aggregator"), "developer tags must stay inside technical details.");

  return [
    "experimental report contains Agrégats de traces de match",
    "experimental report contains aggregate status and official/diagnostic/sandbox counts",
    "default report hides experimental aggregate diagnostics",
    "technical details are collapsed",
    "visible copy explains scope separation and avoids developer jargon",
  ];
}

if (require.main === module) {
  const checks = validateMatchTraceAggregatorReport();

  console.log("matchTraceAggregatorReport tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
