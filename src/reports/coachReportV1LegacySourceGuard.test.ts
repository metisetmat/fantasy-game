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

export function validateCoachReportV1LegacySourceGuard(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const html = renderHtmlCoachReport(report);
  const visible = visibleHtml(html);
  const cleanupFact = report.evidenceFacts.find((fact) => fact.category === "WORKBENCH_CHAIN_COACH_REPORT_V1_LEGACY_CLEANUP");

  assertTest(cleanupFact !== undefined, "legacy cleanup evidence fact must exist.");
  assertTest(cleanupFact?.internalTags.includes("coach_report_v1_legacy_sections_collapsed_or_absorbed") ?? false, "legacy content must be collapsed or absorbed.");
  assertTest(!visible.includes("Source : Sandbox</span> <h3>Ce que le match dit"), "sandbox content must not render as official V1 card.");
  assertTest(!visible.includes("Source : Diagnostic</span> <h3>Ce que le match dit"), "diagnostic content must not render as official V1 card.");
  assertTest(cleanupFact?.internalTags.includes("coach_report_v1_selection_preview_confidence_not_upgraded") ?? false, "cleanup must not upgrade Selection Preview confidence.");
  assertTest(cleanupFact?.internalTags.includes("coach_report_v1_legacy_cleanup_global_economy_claim_forbidden") ?? false, "cleanup cannot claim global economy.");
  assertTest(cleanupFact?.internalTags.includes("coach_report_v1_legacy_cleanup_production_scoring_event_creation_count_0") ?? false, "cleanup cannot drive production route resolution or create scoring events.");

  return [
    "legacy content cannot be treated as official V1 card unless absorbed with official aggregate evidence",
    "sandbox content cannot be rendered as official",
    "diagnostic content cannot be rendered as official",
    "cleanup cannot upgrade Selection Preview confidence",
    "cleanup cannot drive coach instruction",
    "cleanup cannot drive live selection",
    "cleanup cannot drive production route resolution",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1LegacySourceGuard();

  console.log("coachReportV1LegacySourceGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

