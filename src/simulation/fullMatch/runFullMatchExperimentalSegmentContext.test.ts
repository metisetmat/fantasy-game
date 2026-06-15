import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { fullMatchSegmentContextSignature } from "./fullMatchSegmentContextSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRunFullMatchExperimentalSegmentContext(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = fullMatchSegmentContextSignature(defaultReport);
  const experimentalSignature = fullMatchSegmentContextSignature(experimentalReport);
  const chainContextEvents = experimentalReport.timeline.filter((event) => event.tags.includes("workbench_chain_context"));
  const chainContextFact = experimentalReport.evidenceFacts.find((fact) => fact.category === "WORKBENCH_CHAIN_SEGMENT_CONTEXT");
  const diagnosis = experimentalReport.tacticalReport.diagnoses.find((candidate) =>
    candidate.summary.includes("contexte workbench") || candidate.summary.includes("chaine workbench"),
  );

  assertTest(defaultSignature.chainContextTagCount === 0, "default runFullMatch must not expose chain context tags.");
  assertTest(defaultSignature.chainContextFinalCarrier === undefined, "default signature must not expose chain final carrier.");
  assertTest(defaultSignature.chainContextFinalZone === undefined, "default signature must not expose chain final zone.");
  assertTest(experimentalSignature.chainContextTagCount > 0, "experimental timeline must expose chain context tags.");
  assertTest(experimentalSignature.chainContextFinalCarrier === "control-space-hunter", "experimental signature must expose final carrier.");
  assertTest(experimentalSignature.chainContextFinalZone === "Z4-HSR", "experimental signature must expose final zone.");
  assertTest(chainContextEvents.every((event) => event.eventId.includes("-segment-1-")), "chain context must be attached to segment-1 only.");
  assertTest(chainContextEvents.some((event) => (event.tacticalContext.reason ?? "").includes("control-space-hunter at Z4-HSR")), "segment-1 tactical context must mention final carrier and zone.");
  assertTest(chainContextFact !== undefined, "experimental report must include chain segment context evidence.");
  assertTest(chainContextFact?.summary.includes("sequence-1-multi-action-chain") ?? false, "chain context evidence must include chain id.");
  assertTest(chainContextFact?.internalTags.includes("chain_context_final_carrier_control-space-hunter") ?? false, "chain context evidence must include final carrier tag.");
  assertTest(chainContextFact?.internalTags.includes("chain_context_final_zone_Z4-HSR") ?? false, "chain context evidence must include final zone tag.");
  assertTest(diagnosis !== undefined, "experimental coach diagnosis must mention chain context.");
  assertTest(diagnosis?.summary.includes("control-space-hunter") ?? false, "experimental coach diagnosis must mention final carrier.");
  assertTest(diagnosis?.summary.includes("Z4-HSR") ?? false, "experimental coach diagnosis must mention final zone.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CHAIN_SEGMENT_CONTEXT_ATTACHED_TO_SEGMENT_1"), "experimental limitations must expose segment context attachment.");
  assertTest(experimentalReport.reportMeta.limitations.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT"), "experimental report must not claim production chain-driven full-match.");

  return [
    "default runFullMatch does not expose chain context tags",
    "experimental runFullMatch exposes chain context tags on segment-1 events",
    "experimental segment context includes chain id sequence-1-multi-action-chain",
    "experimental segment context includes final carrier control-space-hunter",
    "experimental segment context includes final zone Z4-HSR",
    "experimental report includes chain segment context evidence",
    "experimental coach diagnosis mentions experimental chain context",
    "normal full-match is not falsely claimed as production chain-driven",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchExperimentalSegmentContext();

  console.log("runFullMatchExperimentalSegmentContext tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
