import {
  emptyOfficialTimelineDiffPath,
  emptyOfficialTimelineDiffViewModel,
  type OfficialTimelineDiffViewModel,
} from "./officialTimelineDiffView";
import { coachFacingTimelineReviewFromDiff } from "./coachFacingTimelineReviewFromDiff";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function availableDiffFixture(): OfficialTimelineDiffViewModel {
  const baseline = {
    ...emptyOfficialTimelineDiffPath({ pathId: "baseline", status: "available" }),
    sandboxOnlyEventCount: 9,
  };
  const override = {
    ...emptyOfficialTimelineDiffPath({ pathId: "override", status: "available" }),
    sandboxOnlyEventCount: 9,
    finalSandboxOutcome: "secured_by_goalkeeper_team",
    finalSandboxTeamCandidate: "goalkeeper_team",
    finalSandboxActorCandidate: "blitz-goalkeeper-free-safety",
    finalSandboxZoneCandidate: "Z3-HSR",
  };

  return {
    ...emptyOfficialTimelineDiffViewModel({
      segmentLabel: "segment-1",
      chainId: "sequence-1-action-1",
      warnings: [],
    }),
    status: "available",
    scope: "official_timeline_diff_view",
    origin: "controlled_segment_sandbox_timeline",
    baseline,
    override,
    baselineSandboxOnlyEventCount: 9,
    overrideSandboxOnlyEventCount: 9,
    officialTimelineEventCountBefore: 42,
    officialTimelineEventCountAfter: 42,
    officialScoringEventCountBefore: 3,
    officialScoringEventCountAfter: 3,
    officialScoreBefore: 7,
    officialScoreAfter: 7,
    officialScoreDisplayBefore: "CONTROL 7 - 0 BLITZ",
    officialScoreDisplayAfter: "CONTROL 7 - 0 BLITZ",
    sandboxTimelineSeparateFromOfficialTimeline: true,
    sandboxOutcomeDivergenceObserved: true,
    sandboxFinalTeamDivergenceObserved: true,
    sandboxFinalZoneDivergenceObserved: true,
    modelAppliedOnlyInSandbox: true,
    diagnosticOnly: true,
    tags: ["official_timeline_diff_view"],
  };
}

export function validateCoachFacingTimelineReviewFromDiff(): readonly string[] {
  const missingReview = coachFacingTimelineReviewFromDiff({
    diffViewModel: emptyOfficialTimelineDiffViewModel({ warnings: [] }),
  });
  const review = coachFacingTimelineReviewFromDiff({
    diffViewModel: availableDiffFixture(),
  });
  const joined = review.blocks.map((block) => `${block.title} ${block.summary} ${block.bullets.join(" ")}`).join("\n");

  assertTest(missingReview.status === "not_available", "not_available diff must return not_available review.");
  assertTest(review.status === "available", "available diff must return available review.");
  assertTest(review.origin === "official_timeline_diff_view", "review origin must be official_timeline_diff_view.");
  assertTest(review.blocks.length === 4, "review must have exactly four blocks.");
  assertTest(review.blocks.some((block) => block.title === "Ce qui s'est passé officiellement"), "official timeline block title missing.");
  assertTest(review.blocks.some((block) => block.title === "Ce que le sandbox a rejoué"), "sandbox replay block title missing.");
  assertTest(review.blocks.some((block) => block.title === "Ce qui est différent"), "differences block title missing.");
  assertTest(review.blocks.some((block) => block.title === "Ce qui n'a pas été modifié"), "unchanged block title missing.");
  assertTest(joined.includes("source de vérité"), "official block must say the official timeline is source of truth.");
  assertTest(joined.includes("Override sandbox-only : 9"), "sandbox replay block must mention 9 override events.");
  assertTest(joined.includes("secured_by_goalkeeper_team"), "sandbox replay block must mention the final sandbox outcome.");
  assertTest(joined.includes("Score officiel") && joined.includes("Possession officielle") && joined.includes("Timeline officielle"), "unchanged block must mention score, possession, and timeline.");
  assertTest(!joined.includes("sandbox officiel"), "review must not call sandbox official.");
  assertTest(!joined.includes("sandbox a modifié le score"), "review must not say sandbox changed the score.");

  return [
    "not_available diff returns not_available review",
    "available diff returns available coach-facing review",
    "review has four coach-readable blocks",
    "official and sandbox wording stays separated",
  ];
}

if (require.main === module) {
  const checks = validateCoachFacingTimelineReviewFromDiff();

  console.log("coachFacingTimelineReviewFromDiff tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
