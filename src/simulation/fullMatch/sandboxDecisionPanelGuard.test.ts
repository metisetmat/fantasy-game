import {
  emptyOfficialTimelineDiffPath,
  emptyOfficialTimelineDiffViewModel,
  type OfficialTimelineDiffViewModel,
} from "./officialTimelineDiffView";
import { coachFacingTimelineReviewFromDiff } from "./coachFacingTimelineReviewFromDiff";
import {
  sandboxDecisionPanelCannotClaimGlobalEconomy,
  sandboxDecisionPanelCannotDriveLiveSelection,
  sandboxDecisionPanelCannotMutateOfficialFullMatch,
  sandboxDecisionPanelFromTimelineReview,
} from "./sandboxDecisionPanelFromTimelineReview";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function diffFixture(): OfficialTimelineDiffViewModel {
  return {
    ...emptyOfficialTimelineDiffViewModel({ warnings: [] }),
    status: "available",
    scope: "official_timeline_diff_view",
    origin: "controlled_segment_sandbox_timeline",
    baseline: {
      ...emptyOfficialTimelineDiffPath({ pathId: "baseline", status: "available" }),
      sandboxOnlyEventCount: 9,
    },
    override: {
      ...emptyOfficialTimelineDiffPath({ pathId: "override", status: "available" }),
      sandboxOnlyEventCount: 9,
      finalSandboxOutcome: "secured_by_goalkeeper_team",
      finalSandboxActorCandidate: "blitz-goalkeeper-free-safety",
      finalSandboxZoneCandidate: "Z3-HSR",
    },
    baselineSandboxOnlyEventCount: 9,
    overrideSandboxOnlyEventCount: 9,
    modelAppliedOnlyInSandbox: true,
    tags: ["official_timeline_diff_view"],
  };
}

export function validateSandboxDecisionPanelGuard(): readonly string[] {
  const review = coachFacingTimelineReviewFromDiff({ diffViewModel: diffFixture() });
  const panel = sandboxDecisionPanelFromTimelineReview({ timelineReview: review });

  assertTest(panel.status === "available", "sandbox decision panel must be available.");
  assertTest(sandboxDecisionPanelCannotMutateOfficialFullMatch(panel), "panel must not mutate official full-match state.");
  assertTest(sandboxDecisionPanelCannotDriveLiveSelection(panel), "panel must not drive live selection or production route resolution.");
  assertTest(sandboxDecisionPanelCannotClaimGlobalEconomy(panel), "panel must not claim global economy.");
  assertTest(!panel.canCreateProductionScoringEvents, "panel cannot create production scoring events.");
  assertTest(!panel.canDriveLiveSelection, "panel cannot drive live selection.");
  assertTest(!panel.canDriveProductionRouteResolution, "panel cannot drive production route resolution.");
  assertTest(!panel.canClaimGlobalEconomy, "panel cannot claim global economy.");

  return [
    "sandbox decision panel cannot mutate official timeline, possession, score, or scoring events",
    "sandbox decision panel cannot drive live selection",
    "sandbox decision panel cannot drive production route resolution",
    "sandbox decision panel cannot claim global economy",
  ];
}

if (require.main === module) {
  const checks = validateSandboxDecisionPanelGuard();

  console.log("sandboxDecisionPanelGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
