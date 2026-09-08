import type { ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingNoRuntimeAudit9K } from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyTypes9K";
import { uniqueWarningCodes9K } from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyWarnings9K";

function hasEnabledInput(html: string): boolean {
  return /<(input|select|textarea)\b(?![^>]*(?:disabled|readonly))[^>]*>/iu.test(html);
}

function hasSubmitButton(html: string): boolean {
  return /<button\b(?![^>]*disabled)[^>]*>|type=["']submit["']/iu.test(html);
}

function sectionById(html: string, id: string): string {
  const idIndex = html.indexOf(`id="${id}"`);
  if (idIndex < 0) return "";
  const openStart = html.lastIndexOf("<section", idIndex);
  if (openStart < 0) return "";
  const tagPattern = /<\/?section\b[^>]*>/giu;
  tagPattern.lastIndex = openStart;
  let depth = 0;
  for (let match = tagPattern.exec(html); match !== null; match = tagPattern.exec(html)) {
    const tag = match[0] ?? "";
    depth += tag.startsWith("</") ? -1 : 1;
    if (depth === 0) return html.slice(openStart, match.index + tag.length);
  }
  return html.slice(openStart);
}

export function auditManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingNoRuntime9K(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingNoRuntimeAudit9K {
  const combinedHtml = [
    sectionById(input.productHtml, "manual-review-preview-payload-dry-run-progressive-disclosure-reporting-consistency-repair-9k"),
    sectionById(input.exportHtml, "manual-review-preview-payload-dry-run-progressive-disclosure-reporting-consistency-repair-export-9k"),
  ].join("\n");
  const disclosureUsesNoJavaScript = !/<script\b|javascript:/iu.test(combinedHtml);
  const disclosureHasNoEnabledInputs = !hasEnabledInput(combinedHtml);
  const disclosureHasNoSubmitButton = !hasSubmitButton(combinedHtml);
  return {
    disclosureUsesNoJavaScript,
    disclosureCreatesNoActiveControls: disclosureHasNoEnabledInputs && disclosureHasNoSubmitButton,
    disclosureHasNoSubmitButton,
    disclosureHasNoEnabledInputs,
    validationRuntimeActive: false,
    realPayloadReadCount: 0,
    payloadCreated: false,
    dryRunAcceptedPayloadCount: 0,
    realPreviewGenerated: false,
    previewActivationCount: 0,
    submitCreated: false,
    apiCreated: false,
    backendCreated: false,
    storageCreated: false,
    memoryCreated: false,
    officialTruthPromoted: false,
    automaticDecisionCreated: false,
    selectionDriven: false,
    tacticalInstructionDriven: false,
    scoreMutationCount: 0,
    timelineMutationCount: 0,
    scoreChangeCreationCount: 0,
    eventMutationCount: 0,
    noRuntimeWarningCodes: uniqueWarningCodes9K([
      disclosureUsesNoJavaScript ? "NO_RUNTIME_ACTIVATION" : "PROGRESSIVE_DISCLOSURE_REPORTING_FAIL",
      disclosureHasNoEnabledInputs && disclosureHasNoSubmitButton
        ? "NO_DECISION_SELECTION_TACTIC_MUTATION"
        : "PROGRESSIVE_DISCLOSURE_REPORTING_FAIL",
      "NO_PAYLOAD_ACCEPTED",
      "NO_PREVIEW_GENERATED",
      "NO_PERSISTENCE",
      "NO_OFFICIAL_TRUTH_PROMOTION",
      "NO_SCORE_OR_TIMELINE_MUTATION",
    ]),
  };
}
