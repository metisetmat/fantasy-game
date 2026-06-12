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

export function validateCoachReportSandboxDecisionBatchConfidence(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visibleExperimental = visibleHtml(experimentalHtml);

  assertTest(!defaultHtml.includes("Confiance multi-scÃ©narios"), "default report must not show batch confidence calibration.");
  assertTest(experimentalHtml.includes("Confiance multi-scÃ©narios"), "experimental report must show batch confidence calibration.");
  assertTest(experimentalHtml.includes("scÃ©narios"), "experimental report must show scenario count wording.");
  assertTest(experimentalHtml.includes("Confiance faible") || experimentalHtml.includes("Confiance faible Ã  moyenne"), "experimental report must show batch confidence.");
  assertTest(experimentalHtml.includes("piste") || experimentalHtml.includes("test"), "coach copy must say this remains a test or suggestion.");
  assertTest(experimentalHtml.includes("consigne officielle"), "coach copy must avoid official-instruction overclaim.");
  assertTest(!visibleExperimental.includes("doit appliquer"), "visible copy must not say coach must apply the suggestion.");
  assertTest(!visibleExperimental.includes("est une vÃ©ritÃ© officielle"), "visible batch copy must not claim official truth.");
  assertTest(!visibleExperimental.includes("est une preuve d'Ã©conomie globale"), "visible batch copy must not claim global economy proof.");

  return [
    "experimental coach report contains multi-scenario confidence block",
    "experimental coach report contains scenario count and batch confidence",
    "default coach report hides batch confidence calibration",
    "visible coach copy remains test/suggestion wording",
    "visible coach copy avoids mandatory, official-truth, and global-economy overclaims",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportSandboxDecisionBatchConfidence();

  console.log("coachReportSandboxDecisionBatchConfidence tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
