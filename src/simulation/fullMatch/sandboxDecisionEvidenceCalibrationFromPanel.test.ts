import {
  emptyOfficialTimelineDiffPath,
  emptyOfficialTimelineDiffViewModel,
  type OfficialTimelineDiffViewModel,
} from "./officialTimelineDiffView";
import { coachFacingTimelineReviewFromDiff } from "./coachFacingTimelineReviewFromDiff";
import { sandboxDecisionPanelFromTimelineReview } from "./sandboxDecisionPanelFromTimelineReview";
import { sandboxDecisionEvidenceCalibrationFromPanel } from "./sandboxDecisionEvidenceCalibrationFromPanel";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function diffFixture(): OfficialTimelineDiffViewModel {
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

export function validateSandboxDecisionEvidenceCalibrationFromPanel(): readonly string[] {
  const missingReview = coachFacingTimelineReviewFromDiff({
    diffViewModel: emptyOfficialTimelineDiffViewModel({ warnings: [] }),
  });
  const missingPanel = sandboxDecisionPanelFromTimelineReview({ timelineReview: missingReview });
  const missingCalibration = sandboxDecisionEvidenceCalibrationFromPanel({ decisionPanel: missingPanel });
  const review = coachFacingTimelineReviewFromDiff({ diffViewModel: diffFixture() });
  const panel = sandboxDecisionPanelFromTimelineReview({ timelineReview: review });
  const calibration = sandboxDecisionEvidenceCalibrationFromPanel({ decisionPanel: panel });

  assertTest(missingCalibration.status === "not_available", "not_available panel must return not_available calibration.");
  assertTest(calibration.status === "available", "available panel must return available calibration.");
  assertTest(calibration.origin === "sandbox_decision_panel", "calibration origin must be sandbox_decision_panel.");
  assertTest(calibration.evidenceScore >= 35 && calibration.evidenceScore <= 50, "current fixture evidence score must be between 35 and 50.");
  assertTest(calibration.confidence === "low", "current fixture confidence must be low.");
  assertTest(calibration.supportingSignals.length >= 4, "supporting signals count must be at least 4.");
  assertTest(calibration.limitingSignals.length >= 5, "limiting signals count must be at least 5.");
  assertTest(calibration.recommendationType === "test_support_around_forward_progress", "recommendation type must be preserved.");
  assertTest(calibration.calibratedSuggestionOnly, "calibration must remain suggestion-only.");
  assertTest(!calibration.officialTruth, "calibration must not be official truth.");
  assertTest(!calibration.canDriveLiveSelection, "calibration cannot drive live selection.");
  assertTest(!calibration.canDriveProductionRouteResolution, "calibration cannot drive production route resolution.");
  assertTest(!calibration.canCreateProductionScoringEvents, "calibration cannot create production scoring events.");
  assertTest(!calibration.canClaimGlobalEconomy, "calibration cannot claim global economy.");

  return [
    "not_available decision panel returns not_available calibration",
    "available decision panel returns available calibration",
    "current fixture evidence score is bounded and low confidence",
    "supporting and limiting signals are populated",
    "calibration preserves all sandbox-only guardrails",
  ];
}

if (require.main === module) {
  const checks = validateSandboxDecisionEvidenceCalibrationFromPanel();

  console.log("sandboxDecisionEvidenceCalibrationFromPanel tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
