import {
  buildCoachReportV1LegacyCleanup,
  type CoachReportV1LegacyCleanupModel,
} from "./buildCoachReportV1LegacyCleanup";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportV1LegacyCleanup(): readonly string[] {
  const cleanup: CoachReportV1LegacyCleanupModel = buildCoachReportV1LegacyCleanup({
    hierarchyStatus: "available",
    hasLegacyMoments: true,
    hasLegacyCoachAnalysis: true,
    fullMatchScoreVisible: true,
    scoringEventsSampleVisible: true,
    batchDiagnosticsVisible: true,
  });

  assertTest(cleanup.status === "available", "available hierarchy must return available cleanup model.");
  assertTest(cleanup.legacyMomentsDisposition !== "left_visible", "legacy moments must be hidden, collapsed, or absorbed.");
  assertTest(cleanup.legacyCoachAnalysisDisposition !== "left_visible", "legacy coach analysis must be hidden, collapsed, or absorbed.");
  assertTest(!cleanup.legacySectionsCompeteWithV1, "legacy sections must not compete with V1.");
  assertTest(cleanup.legacySectionsCollapsedOrAbsorbed, "legacy sections must be collapsed or absorbed.");
  assertTest(cleanup.scoreSourceLabelAvailable, "score source label must be available.");
  assertTest(!cleanup.scoreSourcesConfused, "score sources must not be confused.");
  assertTest(cleanup.selectionPreviewStillSandboxOnly, "Selection Preview must remain sandbox_only.");
  assertTest(!cleanup.selectionPreviewConfidenceUpgraded, "Selection Preview confidence must not be upgraded.");
  assertTest(!cleanup.canMutateTimeline && !cleanup.canMutateScore && !cleanup.canCreateScoringEvent, "guardrails must remain false.");

  return [
    "cleanup model exists",
    "available hierarchy returns available cleanup model",
    "legacy moments are hidden, collapsed, or absorbed",
    "legacy coach analysis is hidden, collapsed, or absorbed",
    "legacy sections do not compete with V1",
    "score source label is available",
    "score sources are not confused",
    "Selection Preview remains sandbox_only",
    "Selection Preview confidence is not upgraded",
    "guardrails remain false",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1LegacyCleanup();

  console.log("coachReportV1LegacyCleanup tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

