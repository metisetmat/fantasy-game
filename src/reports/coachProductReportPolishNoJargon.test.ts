import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { productMainVisibleHtml } from "./coachProductReportRenderer.test";
import { renderCoachProductReport } from "./renderCoachProductReport";

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

export function validateCoachProductReportPolishNoJargon(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const visible = productMainVisibleHtml(renderCoachProductReport(buildCoachProductReportViewFromMatchReport(report)));

  for (const term of forbiddenMainTerms) {
    assertTest(!visible.includes(term), `main product report must not contain ${term}.`);
  }

  return [
    "main visible product report contains no sandbox_only",
    "main visible product report contains no trace_supported or officially_confirmed",
    "main visible product report contains no workbench, production route, or mutation jargon",
    "technical terms remain appendix-only when present",
  ];
}

if (require.main === module) {
  const checks = validateCoachProductReportPolishNoJargon();

  console.log("coachProductReportPolishNoJargon tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
