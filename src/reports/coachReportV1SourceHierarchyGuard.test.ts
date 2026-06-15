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

export function validateCoachReportV1SourceHierarchyGuard(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const html = renderHtmlCoachReport(report);
  const visible = visibleHtml(html);
  const officialIndex = html.indexOf("Ce que le match dit");
  const sandboxIndex = html.indexOf("Hypothèses expérimentales à tester");
  const hierarchyFact = report.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_COACH_REPORT_V1_INFORMATION_HIERARCHY"
  );

  assertTest(officialIndex !== -1 && sandboxIndex !== -1 && officialIndex < sandboxIndex, "official V1 cards must appear before sandbox content.");
  assertTest(visible.includes("Source : Officiel"), "official V1 cards must show official source.");
  assertTest(!visible.includes("Source : Sandbox</span> <h3>Ce que le match dit"), "sandbox content must not render as official reading.");
  assertTest(!visible.includes("Source : Diagnostic</span> <h3>Ce que le match dit"), "diagnostic content must not render as official reading.");
  assertTest(hierarchyFact?.internalTags.includes("coach_report_v1_selection_preview_confidence_not_upgraded") ?? false, "experimental content must not upgrade Selection Preview confidence.");
  assertTest(hierarchyFact?.internalTags.includes("coach_report_v1_information_hierarchy_global_economy_claim_forbidden") ?? false, "hierarchy must forbid global economy claims.");
  assertTest(!visible.includes("s'applique automatiquement"), "experimental content must not drive coach instruction.");
  assertTest(!visible.includes("sélection live est modifiée"), "experimental content must not drive live selection.");
  assertTest(!visible.includes("production route resolution"), "experimental content must not drive production route resolution.");

  return [
    "official V1 cards appear before sandbox content",
    "sandbox content cannot be rendered as official",
    "diagnostic content cannot be rendered as official",
    "experimental content does not upgrade Selection Preview confidence",
    "experimental content cannot drive coach instruction",
    "experimental content cannot drive live selection",
    "experimental content cannot drive production route resolution",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1SourceHierarchyGuard();

  console.log("coachReportV1SourceHierarchyGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
