import {
  emptyOfficialTimelineDiffPath,
  emptyOfficialTimelineDiffViewModel,
  type OfficialTimelineDiffViewModel,
} from "./officialTimelineDiffView";
import {
  coachFacingTimelineReviewCannotClaimGlobalEconomy,
  coachFacingTimelineReviewCannotMutateOfficialFullMatch,
  coachFacingTimelineReviewFromDiff,
} from "./coachFacingTimelineReviewFromDiff";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function diffFixture(): OfficialTimelineDiffViewModel {
  const baseline = {
    ...emptyOfficialTimelineDiffPath({ pathId: "baseline", status: "available" }),
    sandboxOnlyEventCount: 9,
  };
  const override = {
    ...emptyOfficialTimelineDiffPath({ pathId: "override", status: "available" }),
    sandboxOnlyEventCount: 9,
    finalSandboxOutcome: "secured_by_goalkeeper_team",
    finalSandboxActorCandidate: "blitz-goalkeeper-free-safety",
    finalSandboxZoneCandidate: "Z3-HSR",
  };

  return {
    ...emptyOfficialTimelineDiffViewModel({ warnings: [] }),
    status: "available",
    scope: "official_timeline_diff_view",
    origin: "controlled_segment_sandbox_timeline",
    baseline,
    override,
    baselineSandboxOnlyEventCount: 9,
    overrideSandboxOnlyEventCount: 9,
    modelAppliedOnlyInSandbox: true,
    tags: ["official_timeline_diff_view"],
  };
}

export function validateOfficialTimelineReviewGuard(): readonly string[] {
  const review = coachFacingTimelineReviewFromDiff({ diffViewModel: diffFixture() });

  assertTest(review.status === "available", "coach-facing timeline review must be available.");
  assertTest(coachFacingTimelineReviewCannotMutateOfficialFullMatch(review), "review must not mutate official full-match state.");
  assertTest(coachFacingTimelineReviewCannotClaimGlobalEconomy(review), "review must not claim global economy.");
  assertTest(!review.canInjectEventsIntoOfficialTimeline, "review cannot inject events into official timeline.");
  assertTest(!review.canMutateOfficialScore, "review cannot mutate official score.");
  assertTest(!review.canMutateOfficialPossession, "review cannot mutate official possession.");
  assertTest(!review.canMutateOfficialScoringEvents, "review cannot mutate official scoring events.");
  assertTest(!review.canCreateProductionScoringEvents, "review cannot create production scoring events.");
  assertTest(!review.canClaimGlobalEconomy, "review cannot claim global economy.");

  return [
    "review cannot inject events into official timeline",
    "review cannot mutate official score, possession, or scoring events",
    "review cannot create production scoring events",
    "review cannot claim global economy",
  ];
}

if (require.main === module) {
  const checks = validateOfficialTimelineReviewGuard();

  console.log("officialTimelineReviewGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
