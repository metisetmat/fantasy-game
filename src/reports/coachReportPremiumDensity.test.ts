import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportPremiumDensity(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const exportHtml = renderCoachReportExportHtml({
    productReportHtml: renderCoachProductReport(buildCoachProductReportViewFromMatchReport(report)),
  });
  const executiveSection = exportHtml.match(/<section id="executive-summary"[\s\S]*?<\/section>/u)?.[0] ?? "";
  const executiveBulletCount = [...executiveSection.matchAll(/<li>/gu)].length;
  const appendicesIndex = exportHtml.indexOf("<section id=\"appendices\"");
  const playersIndex = exportHtml.indexOf("<section id=\"profiles-and-players\"");

  assertTest(executiveBulletCount <= 5, "top summary must have at most 5 bullets.");
  assertTest(exportHtml.includes("report-appendix-stack"), "appendices must be visually secondary.");
  assertTest(appendicesIndex > playersIndex, "technical details must appear after coach-facing reading.");
  assertTest(exportHtml.includes("<section id=\"appendices\""), "phase and technical details may be moved into appendices for density.");
  assertTest(!exportHtml.includes("xG") && !exportHtml.includes("heatmap certifiee"), "no fake phase statistics may be invented.");

  return [
    "top summary has at most 5 bullets",
    "appendices are visually secondary",
    "technical details are not displayed before coach-facing reading",
    "phase and technical details may be moved into appendices for density",
    "no fake phase statistics are invented",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportPremiumDensity();

  console.log("coachReportPremiumDensity tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
