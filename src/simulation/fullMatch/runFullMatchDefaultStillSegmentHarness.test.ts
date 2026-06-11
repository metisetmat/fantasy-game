import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { fullMatchSegmentContextSignature } from "./fullMatchSegmentContextSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function signature(report: ReturnType<typeof runFullMatch>): string {
  const segmentSignature = fullMatchSegmentContextSignature(report);

  return `${segmentSignature.score.home}-${segmentSignature.score.away}:${segmentSignature.scoringEventCount}:${segmentSignature.scoreChangeTotal}`;
}

export function validateRunFullMatchDefaultStillSegmentHarness(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const implicitDefault = runFullMatch(input);
  const explicitDefault = runFullMatch(input, { routeSelectionMode: "segment_harness" });
  const implicitSignature = fullMatchSegmentContextSignature(implicitDefault);

  assertTest(signature(implicitDefault) === signature(explicitDefault), "implicit default and explicit segment_harness must match.");
  assertTest(implicitDefault.reportMeta.limitations.includes("Full-match route selection mode: segment_harness."), "default must remain segment_harness.");
  assertTest(implicitDefault.reportMeta.limitations.includes("FULLMATCH_CHAIN_CONSUMPTION_DISABLED_BY_DEFAULT"), "default must disable chain consumption.");
  assertTest(implicitDefault.reportMeta.limitations.includes("FULLMATCH_CHAIN_SEGMENT_CONTEXT_DISABLED_BY_DEFAULT"), "default must disable chain segment context.");
  assertTest(!implicitDefault.reportMeta.limitations.includes("FULLMATCH_CHAIN_SEGMENT_CONTEXT_ATTACHED_TO_SEGMENT_1"), "default must not attach chain segment context.");
  assertTest(implicitSignature.chainContextTagCount === 0, "default timeline must not include experimental chain context tags.");
  assertTest(!implicitDefault.evidenceFacts.some((fact) => fact.category === "WORKBENCH_CHAIN_SEGMENT_CONTEXT"), "default report must not include chain segment context evidence.");

  return [
    "runFullMatch(input) remains segment_harness",
    "runFullMatch(input, segment_harness) remains identical in score signature",
    "default report limitations include disabled chain context",
    "default report does not include experimental chain segment context",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchDefaultStillSegmentHarness();

  console.log("runFullMatchDefaultStillSegmentHarness tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
