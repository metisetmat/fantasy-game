import {
  emptyOfficialTimelineDiffPath,
  emptyOfficialTimelineDiffViewModel,
  type OfficialTimelineDiffViewModel,
} from "./officialTimelineDiffView";
import { coachFacingTimelineReviewFromDiff } from "./coachFacingTimelineReviewFromDiff";
import { sandboxDecisionPanelFromTimelineReview } from "./sandboxDecisionPanelFromTimelineReview";

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
    modelAppliedOnlyInSandbox: true,
    tags: ["official_timeline_diff_view"],
  };
}

export function validateSandboxDecisionPanelFromTimelineReview(): readonly string[] {
  const missingReview = coachFacingTimelineReviewFromDiff({
    diffViewModel: emptyOfficialTimelineDiffViewModel({ warnings: [] }),
  });
  const missingPanel = sandboxDecisionPanelFromTimelineReview({ timelineReview: missingReview });
  const review = coachFacingTimelineReviewFromDiff({ diffViewModel: diffFixture() });
  const panel = sandboxDecisionPanelFromTimelineReview({ timelineReview: review });
  const joined = panel.blocks.map((block) => `${block.title} ${block.summary} ${block.bullets.join(" ")}`).join("\n");

  assertTest(missingPanel.status === "not_available", "not_available review must return not_available panel.");
  assertTest(panel.status === "available", "available review must return available sandbox decision panel.");
  assertTest(panel.origin === "coach_facing_timeline_review", "panel origin must be coach_facing_timeline_review.");
  assertTest(panel.blocks.length === 4, "panel must have exactly four blocks.");
  assertTest(panel.blocks.some((block) => block.title === "Enseignement coach"), "coach teaching block missing.");
  assertTest(panel.blocks.some((block) => block.blockId === "option_to_test"), "option to test block missing.");
  assertTest(panel.blocks.some((block) => block.blockId === "associated_risk"), "associated risk block missing.");
  assertTest(panel.blocks.some((block) => block.blockId === "still_to_prove"), "still to prove block missing.");
  assertTest(joined.includes("FORWARD_PROGRESS"), "panel must mention FORWARD_PROGRESS.");
  assertTest(panel.tags.includes("sandbox_decision_suggestion_only_true"), "panel must frame the option as a working hypothesis.");
  assertTest(!joined.includes("officiellement meilleure"), "panel must not overclaim official route quality.");
  assertTest(!joined.includes("doit appliquer"), "panel must not instruct production application.");
  assertTest(panel.tags.includes("sandbox_decision_suggestion_only_true"), "suggestion-only tag missing.");
  assertTest(panel.tags.includes("sandbox_decision_can_drive_live_selection_false"), "live selection guard tag missing.");

  return [
    "not_available review returns not_available decision panel",
    "available review returns four coach-readable decision blocks",
    "panel frames sandbox output as suggestion-only",
    "panel does not overclaim official truth or production readiness",
  ];
}

if (require.main === module) {
  const checks = validateSandboxDecisionPanelFromTimelineReview();

  console.log("sandboxDecisionPanelFromTimelineReview tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
