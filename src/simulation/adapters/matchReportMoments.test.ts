import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateMatchReportMomentDiversity(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture);
  const scoringEventIds = new Set(report.timeline.filter((event) => event.eventType === "scoring").map((event) => event.eventId));
  const scoringMoments = report.keyMoments.filter((moment) => scoringEventIds.has(moment.eventId)).length;
  const hasNonScoringCandidates = report.timeline.some((event) => event.eventType !== "kickoff" && event.eventType !== "scoring" && event.narrativeWeight >= 60);
  const uniqueTitles = new Set(report.keyMoments.map((moment) => moment.title));

  assertTest(report.keyMoments.length <= 5, "key moments must remain capped at 5.");

  if (hasNonScoringCandidates) {
    assertTest(scoringMoments <= 2, "key moments include non-scoring moments when available.");
  }

  if (report.keyMoments.length > 1) {
    assertTest(uniqueTitles.size >= 2, "key moments include at least two different titles when possible.");
  }

  return [
    "key moments include non-scoring moments when available",
    "max 2 scoring moments when alternatives exist",
    "key moments include diverse titles",
  ];
}

if (require.main === module) {
  const checks = validateMatchReportMomentDiversity();

  console.log("matchReportMoments tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
