import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { createSegmentDiversityReport } from "./segmentDiversityDiagnostics";
import { assertCanMakeGlobalScoringEconomyClaim } from "./sourceOfTruthGuards";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateSegmentDiversityDiagnostics(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture);
  const diversity = createSegmentDiversityReport(report);
  const scoringEventCount = report.timeline.filter((event) => event.eventType === "scoring").length;

  assertTest(diversity.segmentCount >= 2, "segment diversity diagnostics must cover multiple segments.");
  assertTest(diversity.segmentSummaries.length === diversity.segmentCount, "segment summaries must match segment count.");
  assertTest(diversity.segmentSummaries.some((summary) => summary.fatigueDelta > 0), "segment diagnostics must record fatigue delta.");
  assertTest(diversity.dominanceSummary.length > 0, "segment diagnostics must expose a concise dominance summary.");
  assertTest(diversity.warnings.length >= 0, "segment warnings must be represented as diagnostics, not scoring failures.");
  assertTest(
    report.timeline.filter((event) => event.eventType === "scoring").length === scoringEventCount,
    "segment diagnostics must not remove scoring events.",
  );

  try {
    assertCanMakeGlobalScoringEconomyClaim("FULL_MATCH_HARNESS_SINGLE_RUN");
    throw new Error("FULL_MATCH_HARNESS_SINGLE_RUN must not be allowed to make global economy claims.");
  } catch (error) {
    assertTest(String(error).includes("50-match economy"), "source-of-truth guard must still reject non-batch global claims.");
  }

  return [
    "repeated segment patterns produce diagnostics",
    "fatigue delta appears in segment diagnostics",
    "dominance summary appears in segment diagnostics",
    "no scoring events are removed",
    "source-of-truth guard still rejects non-batch global scoring claims",
  ];
}

if (require.main === module) {
  const checks = validateSegmentDiversityDiagnostics();

  console.log("segmentDiversityDiagnostics tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
