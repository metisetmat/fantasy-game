import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { controlledSegmentSandboxTimelineSignature } from "./controlledSegmentSandboxTimelineSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateControlledSegmentSandboxTimeline(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const signature = controlledSegmentSandboxTimelineSignature(report);

  assertTest(signature.status === "available", "controlled segment sandbox timeline should be available behind the experimental flag.");
  assertTest(signature.origin === "sandbox_sequence_replay", "controlled segment sandbox timeline should originate from sandbox sequence replay.");
  assertTest(signature.baselineEventCount === "9", "baseline timeline event count should be 9.");
  assertTest(signature.overrideEventCount === "9", "override timeline event count should be 9.");
  assertTest(signature.officialSandboxTimelineEventCount === 0, "controlled segment sandbox events must not be official timeline events.");
  assertTest(signature.officialTimelineEventCreatedCount === 0, "controlled segment sandbox timeline must not create official timeline events.");
  assertTest(signature.productionScoringEventCreationCount === 0, "controlled segment sandbox timeline must not create production scoring events.");
  assertTest(signature.globalEconomyClaimCount === 0, "controlled segment sandbox timeline must not claim global economy.");

  return [
    "controlled segment sandbox timeline is available behind the experimental flag",
    "controlled segment sandbox timeline consumes sandbox sequence replay output",
    "baseline and override timeline paths each contain 9 events",
    "sandbox timeline events remain separate from official MatchReport events",
  ];
}

if (require.main === module) {
  const checks = validateControlledSegmentSandboxTimeline();

  console.log("controlledSegmentSandboxTimeline tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
