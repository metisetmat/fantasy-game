import { renderHtmlCoachReport } from "./htmlCoachReport";
import { runFullMatch } from "../simulation/runFullMatch";
import { FULL_MATCH_TRACE_VALIDATION_PROFILES } from "../simulation/validation/fullMatchTraceValidationProfiles";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function v1SignalSignature(html: string): string {
  const start = html.indexOf("Rapport coach V1 — lecture visuelle des agrégats officiels");
  const end = html.indexOf("Rapport coach depuis", start);

  return start === -1 ? "" : html.slice(start, end === -1 ? undefined : end);
}

export function validateCoachReportV1ProfileVariation(): readonly string[] {
  const baseline = FULL_MATCH_TRACE_VALIDATION_PROFILES[0];
  const comparison = FULL_MATCH_TRACE_VALIDATION_PROFILES[1];

  assertTest(baseline !== undefined && comparison !== undefined, "at least two validation profiles must exist.");
  if (baseline === undefined || comparison === undefined) {
    return [];
  }

  const baselineHtml = renderHtmlCoachReport(runFullMatch(baseline.createInput(), {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const comparisonHtml = renderHtmlCoachReport(runFullMatch(comparison.createInput(), {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const baselineSignature = v1SignalSignature(baselineHtml);
  const comparisonSignature = v1SignalSignature(comparisonHtml);

  assertTest(baselineSignature.includes("Rapport coach V1 — lecture visuelle des agrégats officiels"), "baseline profile must render V1.");
  assertTest(comparisonSignature.includes("Rapport coach V1 — lecture visuelle des agrégats officiels"), "comparison profile must render V1.");
  assertTest(baselineSignature !== comparisonSignature, "V1 visualization should vary when official trace aggregate profile changes.");

  return [
    "baseline profile renders Coach Report V1",
    "comparison profile renders Coach Report V1",
    "V1 signal signature varies across profiles",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1ProfileVariation();

  console.log("coachReportV1ProfileVariation tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
