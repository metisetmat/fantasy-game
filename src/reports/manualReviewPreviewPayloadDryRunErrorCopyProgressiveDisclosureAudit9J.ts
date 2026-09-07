import type {
  ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JGroupView,
  ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JLevel,
  ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureAudit9J,
} from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureTypes9J";
import { uniqueWarningCodes9J } from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWarnings9J";

function hasEnabledInput(html: string): boolean {
  return /<(input|select|textarea)\b(?![^>]*(?:disabled|readonly))[^>]*>/iu.test(html);
}

function hasSubmitButton(html: string): boolean {
  return /<button\b(?![^>]*disabled)[^>]*>|type=["']submit["']/iu.test(html);
}

export function auditManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9J(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
  readonly levels: readonly ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JLevel[];
  readonly groupViews: readonly ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JGroupView[];
}): ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureAudit9J {
  const productSectionHtml =
    input.productHtml.match(/id="manual-review-preview-payload-dry-run-error-copy-progressive-disclosure-9j"[\s\S]*?<\/section>/u)?.[0] ??
    "";
  const exportSectionHtml =
    input.exportHtml.match(/id="manual-review-preview-payload-dry-run-error-copy-progressive-disclosure-export-9j"[\s\S]*?<\/section>/u)?.[0] ??
    "";
  const combinedHtml = `${productSectionHtml}\n${exportSectionHtml}`;
  const summaryLevelVisible = input.levels.some((level) => level.contentScope === "summary" && level.defaultState === "visible");
  const coachDetailLevelVisible = input.levels.some((level) => level.contentScope === "coach_details" && level.visibleInProduct);
  const technicalReferenceLevelVisible = input.levels.some((level) => level.contentScope === "technical_references" && level.visibleInProduct);
  const technicalReferenceLevelCollapsed = input.groupViews.every((groupView) => groupView.technicalReferencesCollapsed);
  const productProgressiveDisclosureVisible = input.productHtml.includes(
    'id="manual-review-preview-payload-dry-run-error-copy-progressive-disclosure-9j"',
  );
  const exportProgressiveDisclosureVisible = input.exportHtml.includes(
    'id="manual-review-preview-payload-dry-run-error-copy-progressive-disclosure-export-9j"',
  );
  const disclosureLevelCount = input.levels.length;
  const disclosureGroupCount = input.groupViews.length;
  const disclosureUsesNoJavaScript = !/<script\b|javascript:/iu.test(combinedHtml);
  const disclosureHasNoEnabledInputs = !hasEnabledInput(combinedHtml);
  const disclosureHasNoSubmitButton = !hasSubmitButton(combinedHtml);
  const disclosureReadOnlyNoticeVisible = /read-only/i.test(combinedHtml);
  const disclosureNoRuntimeNoticeVisible = /runtime inactive/i.test(combinedHtml);
  const disclosureNoPayloadAcceptedNoticeVisible = /payload accepte 0/i.test(combinedHtml);
  const disclosureNoPreviewNoticeVisible = /preview reelle false/i.test(combinedHtml);
  const disclosureNoPersistenceNoticeVisible = /aucune persistence/i.test(combinedHtml);
  const disclosureNoOfficialTruthNoticeVisible = /non official truth/i.test(combinedHtml);
  const disclosureNoSelectionTacticNoticeVisible = /aucune selection.*tactique/i.test(combinedHtml);
  const disclosureNoScoreTimelineMutationNoticeVisible = /aucune mutation score.*timeline/i.test(combinedHtml);
  const progressiveDisclosureReady =
    productProgressiveDisclosureVisible &&
    exportProgressiveDisclosureVisible &&
    disclosureLevelCount === 3 &&
    disclosureGroupCount === 5 &&
    summaryLevelVisible &&
    coachDetailLevelVisible &&
    technicalReferenceLevelVisible &&
    technicalReferenceLevelCollapsed &&
    disclosureUsesNoJavaScript &&
    disclosureHasNoEnabledInputs &&
    disclosureHasNoSubmitButton;
  const progressiveDisclosureStatus = progressiveDisclosureReady ? "disclosed_without_preview_activation" : "partial";
  const auditWarningCodes = uniqueWarningCodes9J([
    progressiveDisclosureReady ? "ERROR_COPY_PROGRESSIVE_DISCLOSURE_READY" : "ERROR_COPY_PROGRESSIVE_DISCLOSURE_MISSING",
    productProgressiveDisclosureVisible ? "PRODUCT_PROGRESSIVE_DISCLOSURE_VISIBLE" : "PRODUCT_PROGRESSIVE_DISCLOSURE_MISSING",
    exportProgressiveDisclosureVisible ? "EXPORT_PROGRESSIVE_DISCLOSURE_VISIBLE" : "EXPORT_PROGRESSIVE_DISCLOSURE_MISSING",
    disclosureLevelCount === 3 ? "DISCLOSURE_LEVELS_READY" : "DISCLOSURE_LEVEL_COUNT_INVALID",
    disclosureGroupCount === 5 ? "DISCLOSURE_GROUPS_READY" : "DISCLOSURE_GROUP_COUNT_INVALID",
    summaryLevelVisible ? "SUMMARY_LEVEL_VISIBLE" : "SUMMARY_LEVEL_MISSING",
    coachDetailLevelVisible ? "COACH_DETAIL_LEVEL_VISIBLE" : "COACH_DETAIL_LEVEL_MISSING",
    technicalReferenceLevelCollapsed ? "TECHNICAL_REFERENCES_COLLAPSED" : "TECHNICAL_REFERENCES_NOT_COLLAPSED",
    disclosureUsesNoJavaScript ? "DISCLOSURE_NO_JAVASCRIPT_REQUIRED" : "DISCLOSURE_JAVASCRIPT_REQUIRED",
    disclosureHasNoEnabledInputs ? "DISCLOSURE_NO_ENABLED_INPUTS" : "ENABLED_INPUTS_DETECTED",
    disclosureHasNoSubmitButton ? "DISCLOSURE_NO_SUBMIT_BUTTON" : "SUBMIT_BUTTON_DETECTED",
    disclosureHasNoEnabledInputs && disclosureHasNoSubmitButton ? "DISCLOSURE_NO_ACTIVE_CONTROLS" : "ACTIVE_CONTROLS_DETECTED",
  ]);

  return {
    progressiveDisclosureReady,
    productProgressiveDisclosureVisible,
    exportProgressiveDisclosureVisible,
    progressiveDisclosureMode: "read_only_disclosure_only",
    progressiveDisclosureStatus,
    expectedProgressiveDisclosureStatus: "disclosed_without_preview_activation",
    progressiveDisclosureStatusCorrect: progressiveDisclosureStatus === "disclosed_without_preview_activation",
    disclosureLevelCount,
    disclosureLevelCountExpected: 3,
    disclosureGroupCount,
    disclosureGroupCountExpected: 5,
    summaryLevelVisible,
    coachDetailLevelVisible,
    technicalReferenceLevelVisible,
    technicalReferenceLevelCollapsed,
    defaultExpandedProductGroupCount: input.groupViews.filter((groupView) => groupView.defaultExpandedInProduct).length,
    defaultCollapsedTechnicalReferenceCount: input.groupViews.filter((groupView) => groupView.technicalReferencesCollapsed).length,
    disclosureUsesDetailsSummaryOnly: /<details\b/i.test(input.productHtml) && /<summary\b/i.test(input.productHtml),
    disclosureUsesNoJavaScript,
    disclosureCreatesNoActiveControls: disclosureHasNoEnabledInputs && disclosureHasNoSubmitButton,
    disclosureHasNoSubmitButton,
    disclosureHasNoEnabledInputs,
    disclosureReadOnlyNoticeVisible,
    disclosureNoRuntimeNoticeVisible,
    disclosureNoPayloadAcceptedNoticeVisible,
    disclosureNoPreviewNoticeVisible,
    disclosureNoPersistenceNoticeVisible,
    disclosureNoOfficialTruthNoticeVisible,
    disclosureNoSelectionTacticNoticeVisible,
    disclosureNoScoreTimelineMutationNoticeVisible,
    auditWarningCodes,
    recommendation: progressiveDisclosureReady ? "KEEP_ERROR_COPY_PROGRESSIVE_DISCLOSURE" : "REVIEW_ERROR_COPY_PROGRESSIVE_DISCLOSURE",
  };
}
