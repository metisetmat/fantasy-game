import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { StoryFirstProductPreservationAudit8I } from "./storyFirstExportBudgetValidationThresholdFixTypes8I";
import type { StoryFirstExportBudgetValidationThresholdFixWarningCode } from "./storyFirstExportBudgetValidationThresholdFixWarnings";
import { countMatches, sectionPosition } from "./storyFirstAuditUtils8H";

function mainText(html: string): string {
  return html
    .replace(/<details[\s\S]*?<\/details>/giu, " ")
    .replace(/<[^>]*>/gu, " ");
}

export function auditStoryFirstProductPreservation8I(productHtml: string): StoryFirstProductPreservationAudit8I {
  const productStoryFirstSectionVisible = productHtml.includes('data-story-first-version="8H"') &&
    productHtml.includes("Le match en 2 minutes");
  const productReplaySectionVisible = productHtml.includes('data-replay-ux-version="8G"');
  const productActionPlanVisible = productHtml.includes('id="coach-action-plan"');
  const productTechnicalDetailsStillAvailable = productHtml.includes('id="official-causality-8c"') &&
    productHtml.includes('id="sequence-causality-8d"') &&
    productHtml.includes("sequence-proof-details");
  const productSandboxDetailsStillSeparated = productHtml.includes("Sandbox non applique") ||
    productHtml.includes("sandbox") ||
    productHtml.includes("PrÃ©visualisation non appliquÃ©e");
  const productTimelineStillAvailableIfPreviouslyPresent = productHtml.includes("replay-timeline-rail");
  const productRawIdMainTextCount = countMatches(mainText(productHtml), /\b(?:event-|contract-fixture-|full-match-|rc-)[a-z0-9_-]+\b/giu);
  const productStoryFirstOrderPreserved = sectionPosition(productHtml, "official-match-story-spine") <
    sectionPosition(productHtml, "coach-replay-8e") &&
    sectionPosition(productHtml, "coach-replay-8e") <
    sectionPosition(productHtml, "coach-action-plan") &&
    sectionPosition(productHtml, "coach-action-plan") <
    sectionPosition(productHtml, "official-causality-8c");
  const warnings: StoryFirstExportBudgetValidationThresholdFixWarningCode[] = [];
  if (!productStoryFirstSectionVisible || !productStoryFirstOrderPreserved) warnings.push("PRODUCT_STORY_FIRST_REGRESSED");
  if (!productReplaySectionVisible) warnings.push("REPLAY_8G_REGRESSED");
  if (warnings.length === 0) warnings.push("PRODUCT_STORY_FIRST_PRESERVED");
  const pass = productStoryFirstSectionVisible &&
    productReplaySectionVisible &&
    productActionPlanVisible &&
    productTechnicalDetailsStillAvailable &&
    productSandboxDetailsStillSeparated &&
    productTimelineStillAvailableIfPreviouslyPresent &&
    productStoryFirstOrderPreserved;

  return {
    status: pass ? "PASS" : "FAIL",
    productStoryFirstSectionVisible,
    productReplaySectionVisible,
    productActionPlanVisible,
    productTechnicalDetailsStillAvailable,
    productSandboxDetailsStillSeparated,
    productTimelineStillAvailableIfPreviouslyPresent,
    productRawIdMainTextCount,
    productStoryFirstOrderPreserved,
    productPreservationWarningCodes: warnings,
    recommendation: pass ? "KEEP_PRODUCT_STORY_FIRST_8H" : "REPAIR_PRODUCT_STORY_FIRST_8H",
  };
}
