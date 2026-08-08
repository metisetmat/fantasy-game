import type {
  ManualReviewExportMetadataBadgeCleanup9DModel,
  ManualReviewExportMetadataFalsePositiveGuard9D,
} from "./manualReviewExportMetadataBadgeCleanupTypes9D";
import type { ManualReviewExportMetadataBadgeCleanupWarningCode9D } from "./manualReviewExportMetadataBadgeCleanupWarnings9D";

export function evaluateManualReviewExportMetadataFalsePositiveGuard9D(
  model: Pick<
    ManualReviewExportMetadataBadgeCleanup9DModel,
    | "coverBadgeAudit"
    | "metadataAudit"
    | "exportReadTimeSecondsAfter9D"
    | "exportUnder900Seconds"
    | "exportUnder800Seconds"
    | "validationRuntimeActive"
    | "payloadCreated"
    | "realPreviewGenerated"
    | "storageCreated"
    | "officialTruthPromoted"
    | "selectionDriven"
    | "tacticalInstructionDriven"
    | "scoreMutationCount"
    | "timelineMutationCount"
    | "scoreChangeCreationCount"
    | "eventMutationCount"
  >,
): ManualReviewExportMetadataFalsePositiveGuard9D {
  const requiredWarnings: ManualReviewExportMetadataBadgeCleanupWarningCode9D[] = [];
  const contradictions: string[] = [];
  const coverBadgeValidatedFromCoverOnly =
    model.coverBadgeAudit.coverBadgeSource === "header_badge_row" ||
    model.coverBadgeAudit.coverBadgeSource === "report_scoreboard_badge";
  const staleCoverBadgeDetected =
    model.coverBadgeAudit.exportCoverBadgeText !== "Export compact 9D" ||
    model.metadataAudit.exportCoverBadgeStillMentions9B ||
    model.metadataAudit.exportCoverBadgeStillMentions9C ||
    model.metadataAudit.exportCoverBadgeStillMentions9A ||
    model.metadataAudit.exportCoverBadgeStillMentions8Z;
  if (model.coverBadgeAudit.exportCoverBadgeCorrect && !coverBadgeValidatedFromCoverOnly) {
    contradictions.push("cover badge was marked correct without a header/cover source");
    requiredWarnings.push("METADATA_FALSE_POSITIVE_DETECTED");
  }
  if (model.coverBadgeAudit.bodyMentionFallbackUsedForCoverBadge) {
    contradictions.push("cover badge metric used a forbidden body mention fallback");
    requiredWarnings.push("BODY_FALLBACK_USED_FOR_COVER_BADGE");
  }
  if (staleCoverBadgeDetected) requiredWarnings.push("EXPORT_COVER_BADGE_STALE");
  if (model.exportReadTimeSecondsAfter9D > 900 || model.exportUnder900Seconds !== (model.exportReadTimeSecondsAfter9D <= 900)) {
    requiredWarnings.push("EXPORT_OVER_900");
  }
  if (model.exportUnder800Seconds !== (model.exportReadTimeSecondsAfter9D <= 800)) {
    contradictions.push("exportUnder800Seconds disagrees with numeric read time");
  }
  if (model.validationRuntimeActive) requiredWarnings.push("VALIDATION_RUNTIME_ACTIVE_DETECTED");
  if (model.payloadCreated) requiredWarnings.push("PAYLOAD_CREATION_DETECTED");
  if (model.realPreviewGenerated) requiredWarnings.push("PREVIEW_GENERATION_DETECTED");
  if (model.storageCreated) requiredWarnings.push("PERSISTENCE_DETECTED");
  if (model.officialTruthPromoted) requiredWarnings.push("OFFICIAL_TRUTH_PROMOTION_DETECTED");
  if (model.selectionDriven || model.tacticalInstructionDriven) requiredWarnings.push("SELECTION_OR_TACTIC_DETECTED");
  if (
    model.scoreMutationCount > 0 ||
    model.timelineMutationCount > 0 ||
    model.scoreChangeCreationCount > 0 ||
    model.eventMutationCount > 0
  ) {
    requiredWarnings.push("SCORE_OR_TIMELINE_MUTATION_DETECTED");
  }

  const uniqueRequiredWarnings = [...new Set(requiredWarnings)];
  const falsePositiveGuardPassed =
    coverBadgeValidatedFromCoverOnly &&
    !model.coverBadgeAudit.bodyMentionFallbackUsedForCoverBadge &&
    !staleCoverBadgeDetected &&
    model.exportReadTimeSecondsAfter9D <= 900 &&
    model.exportUnder900Seconds === (model.exportReadTimeSecondsAfter9D <= 900) &&
    model.exportUnder800Seconds === (model.exportReadTimeSecondsAfter9D <= 800) &&
    uniqueRequiredWarnings.length === 0;

  return {
    falsePositiveGuardPassed,
    coverBadgeValidatedFromCoverOnly,
    bodyMentionFallbackForbidden: !model.coverBadgeAudit.bodyMentionFallbackUsedForCoverBadge,
    staleCoverBadgeDetected,
    requiredWarnings: uniqueRequiredWarnings,
    contradictions,
    statusRecommendation: falsePositiveGuardPassed ? "PASS" : uniqueRequiredWarnings.includes("EXPORT_OVER_900") ? "FAIL" : "PARTIAL",
  };
}

