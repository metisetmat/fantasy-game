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

export function validateCoachReportSandboxDecisionEvidenceCalibration(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultHtml = renderHtmlCoachReport(runFullMatch(input));
  const experimentalHtml = renderHtmlCoachReport(runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  }));
  const visibleExperimental = visibleHtml(experimentalHtml);

  assertTest(!defaultHtml.includes("Niveau de confiance de la suggestion"), "default report must not show evidence calibration.");
  assertTest(experimentalHtml.includes("Niveau de confiance de la suggestion"), "experimental report must show evidence calibration.");
  assertTest(experimentalHtml.includes("Confiance faible"), "experimental report must show low-confidence wording.");
  assertTest(/Confiance faible[^<]*[0-9]+\/100/.test(experimentalHtml), "experimental report must show evidence score.");
  assertTest(experimentalHtml.includes("Ce qui soutient la suggestion"), "supporting signals heading missing.");
  assertTest(experimentalHtml.includes("Ce qui limite la suggestion"), "limiting signals heading missing.");
  assertTest(experimentalHtml.includes("piste à tester"), "coach copy must say the suggestion is a test path.");
  assertTest(experimentalHtml.includes("pas une vérité officielle"), "coach copy must say it is not official truth.");
  assertTest(experimentalHtml.includes("preuve d'économie globale"), "coach copy must mention no global economy proof.");
  assertTest(!visibleExperimental.includes("sandbox est officiel"), "visible copy must not say sandbox is official.");
  assertTest(!visibleExperimental.includes("doit appliquer"), "visible copy must not say coach must apply suggestion.");
  assertTest(!visibleExperimental.includes("officiellement meilleure"), "visible copy must not overclaim route quality.");

  return [
    "experimental coach report contains evidence confidence block",
    "experimental coach report contains low-confidence wording and evidence score",
    "supporting and limiting signals are visible",
    "default coach report hides experimental evidence calibration",
    "visible coach copy avoids official-truth and mandatory wording",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportSandboxDecisionEvidenceCalibration();

  console.log("coachReportSandboxDecisionEvidenceCalibration tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
