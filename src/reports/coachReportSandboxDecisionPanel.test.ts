import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  return html.replace(/<details[\s\S]*?<\/details>/g, "");
}

export function validateCoachReportSandboxDecisionPanel(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const experimentalVisibleHtml = visibleHtml(experimentalHtml);

  assertTest(!defaultHtml.includes("Panneau de d") || !defaultHtml.includes("cision sandbox"), "default report must not show sandbox decision panel.");
  assertTest(experimentalHtml.includes("Panneau de d") && experimentalHtml.includes("cision sandbox"), "experimental report must show sandbox decision panel.");
  assertTest(experimentalHtml.includes("Enseignement coach"), "coach teaching block missing.");
  assertTest(experimentalHtml.includes("Option") && experimentalHtml.includes("tester"), "option to test block missing.");
  assertTest(experimentalHtml.includes("Risque associ"), "associated risk block missing.");
  assertTest(experimentalHtml.includes("Ce qui reste") && experimentalHtml.includes("prouver"), "still to prove block missing.");
  assertTest(experimentalHtml.includes("ne pilote pas la") && experimentalHtml.includes("live"), "panel must say it does not drive live selection.");
  assertTest(experimentalHtml.includes("panneau sandbox"), "technical panel details must be behind details.");
  assertTest(!experimentalVisibleHtml.includes("canDriveProductionRouteResolution"), "technical panel tags must not dominate visible coach text.");
  assertTest(!experimentalVisibleHtml.includes("officiellement meilleure"), "visible panel must not overclaim official quality.");

  return [
    "default report hides sandbox decision panel",
    "experimental report shows four sandbox decision blocks",
    "experimental report keeps technical panel tags behind details",
    "visible sandbox decision wording remains suggestion-only",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportSandboxDecisionPanel();

  console.log("coachReportSandboxDecisionPanel tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
