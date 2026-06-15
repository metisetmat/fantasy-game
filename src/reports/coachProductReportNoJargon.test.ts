import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { productMainVisibleHtml } from "./coachProductReportRenderer.test";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const forbiddenMainTerms = [
  "sandbox_only",
  "trace_supported",
  "officially_confirmed",
  "workbench",
  "production route",
  "canDriveLiveSelection",
  "global economy claim",
  "score mutation",
  "possession mutation",
  "internalTags",
] as const;

export function validateCoachProductReportNoJargon(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const visible = productMainVisibleHtml(renderCoachProductReport(buildCoachProductReportViewFromMatchReport(report)));

  for (const term of forbiddenMainTerms) {
    assertTest(!visible.includes(term), `main product report must not contain ${term}.`);
  }

  return [
    "main visible product report contains no internal status names",
    "main visible product report contains no workbench or production route jargon",
    "main visible product report contains no mutation jargon",
  ];
}

if (require.main === module) {
  const checks = validateCoachProductReportNoJargon();

  console.log("coachProductReportNoJargon tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
