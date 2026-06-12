import {
  emptyOfficialTimelineDiffPath,
  emptyOfficialTimelineDiffViewModel,
  type OfficialTimelineDiffViewModel,
} from "./officialTimelineDiffView";
import { coachFacingTimelineReviewFromDiff } from "./coachFacingTimelineReviewFromDiff";
import { sandboxDecisionPanelFromTimelineReview } from "./sandboxDecisionPanelFromTimelineReview";
import {
  sandboxDecisionEvidenceCalibrationCannotClaimGlobalEconomy,
  sandboxDecisionEvidenceCalibrationCannotDriveProduction,
  sandboxDecisionEvidenceCalibrationCannotMutateOfficialFullMatch,
  sandboxDecisionEvidenceCalibrationFromPanel,
} from "./sandboxDecisionEvidenceCalibrationFromPanel";

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

export function validateSandboxDecisionEvidenceCalibrationGuard(): readonly string[] {
  const panel = sandboxDecisionPanelFromTimelineReview({
    timelineReview: coachFacingTimelineReviewFromDiff({ diffViewModel: diffFixture() }),
  });
  const calibration = sandboxDecisionEvidenceCalibrationFromPanel({ decisionPanel: panel });

  assertTest(calibration.status === "available", "calibration must be available.");
  assertTest(calibration.confidence === "low", "single-chain calibration must stay low confidence.");
  assertTest(sandboxDecisionEvidenceCalibrationCannotMutateOfficialFullMatch(calibration), "calibration must not mutate official full-match state.");
  assertTest(sandboxDecisionEvidenceCalibrationCannotDriveProduction(calibration), "calibration must not drive coach instruction, live selection, or production route resolution.");
  assertTest(sandboxDecisionEvidenceCalibrationCannotClaimGlobalEconomy(calibration), "calibration must not claim global economy.");
  assertTest(!calibration.canCreateProductionScoringEvents, "calibration cannot create production scoring events.");
  assertTest(!calibration.canDriveLiveSelection, "calibration cannot drive live selection.");
  assertTest(!calibration.canDriveProductionRouteResolution, "calibration cannot drive production route resolution.");
  assertTest(!calibration.canDriveCoachInstruction, "calibration cannot become a mandatory coach instruction.");

  return [
    "calibration cannot inject events into official timeline",
    "calibration cannot mutate official score, possession, or scoring events",
    "calibration cannot create production scoring events",
    "calibration cannot claim global economy",
    "calibration cannot drive live selection or production route resolution",
    "single-chain evidence cannot become high confidence",
  ];
}

if (require.main === module) {
  const checks = validateSandboxDecisionEvidenceCalibrationGuard();

  console.log("sandboxDecisionEvidenceCalibrationGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
