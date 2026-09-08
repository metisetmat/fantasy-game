import type {
  ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyWordingStatus9K,
  ManualReviewPreviewPayloadDryRunProgressiveDisclosureWordingPublicationAudit9K,
} from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyTypes9K";
import { uniqueWarningCodes9K } from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyWarnings9K";

function statusForScore(score: number): ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyWordingStatus9K {
  if (score >= 95) return "pass_strong";
  if (score >= 90) return "pass";
  if (score >= 75) return "partial";
  return "fail";
}

export function auditManualReviewPreviewPayloadDryRunProgressiveDisclosureWordingPublication9K(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
  readonly wordingReadabilityScore: number;
}): ManualReviewPreviewPayloadDryRunProgressiveDisclosureWordingPublicationAudit9K {
  const wordingThresholdStatus = statusForScore(input.wordingReadabilityScore);
  const scoreToken = `wordingReadabilityScore ${input.wordingReadabilityScore}`;
  const wordingPublishedInProduct =
    input.productHtml.includes("wordingReadabilityScore") &&
    input.productHtml.includes(String(input.wordingReadabilityScore)) &&
    input.productHtml.includes("seuil PASS 90") &&
    input.productHtml.includes("seuil PASS fort 95");
  const wordingPublishedInExport =
    input.exportHtml.includes(scoreToken) && input.exportHtml.includes("seuils 90/95 publies");
  const wordingReadabilityScorePublished = wordingPublishedInProduct && wordingPublishedInExport;

  return {
    wordingReadabilityScorePublished,
    wordingReadabilityScore: input.wordingReadabilityScore,
    wordingPassThreshold: 90,
    wordingPassStrongThreshold: 95,
    wordingThresholdStatus,
    wordingThresholdStatusCorrect: wordingThresholdStatus === statusForScore(input.wordingReadabilityScore),
    wordingPublishedInProduct,
    wordingPublishedInExport,
    wordingWarningCodes: uniqueWarningCodes9K([
      wordingReadabilityScorePublished ? "WORDING_READABILITY_SCORE_PUBLISHED" : "WORDING_READABILITY_SCORE_MISSING",
      wordingThresholdStatus === "pass_strong" ? "WORDING_READABILITY_PASS_STRONG" : "PROGRESSIVE_DISCLOSURE_REPORTING_PARTIAL",
    ]),
  };
}
