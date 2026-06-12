import {
  emptyOfficialTimelineDiffPath,
  emptyOfficialTimelineDiffViewModel,
  type OfficialTimelineDiffViewModel,
} from "./officialTimelineDiffView";
import { coachFacingTimelineReviewFromDiff } from "./coachFacingTimelineReviewFromDiff";
import { sandboxDecisionPanelFromTimelineReview } from "./sandboxDecisionPanelFromTimelineReview";
import { sandboxDecisionEvidenceCalibrationFromPanel } from "./sandboxDecisionEvidenceCalibrationFromPanel";
import type { SandboxDecisionEvidenceCalibrationModel } from "./sandboxDecisionEvidenceCalibration";

export function sandboxDecisionBatchDiffFixture(): OfficialTimelineDiffViewModel {
  return {
    ...emptyOfficialTimelineDiffViewModel({
      segmentLabel: "segment-1",
      chainId: "sequence-1-action-1",
      warnings: [],
    }),
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

export function sandboxDecisionEvidenceCalibrationFixture(): SandboxDecisionEvidenceCalibrationModel {
  const review = coachFacingTimelineReviewFromDiff({
    diffViewModel: sandboxDecisionBatchDiffFixture(),
  });
  const panel = sandboxDecisionPanelFromTimelineReview({ timelineReview: review });

  return sandboxDecisionEvidenceCalibrationFromPanel({ decisionPanel: panel });
}
