import {
  containsForbiddenCoachWording,
  countClass,
  countOccurrences,
  extractSection,
  sectionIndex,
} from "./coachReportHtmlAuditUtils";
import type { CoachReportPremiumLayoutVisualHierarchyWarningCode } from "./coachReportPremiumLayoutVisualHierarchyWarnings";

export interface CoachReportPremiumLayoutAudit {
  readonly premiumCoverReady: boolean;
  readonly scoreCardReady: boolean;
  readonly executiveSummaryReady: boolean;
  readonly actionPlanCardLayoutReady: boolean;
  readonly nextMatchPlanLayoutReady: boolean;
  readonly signalCardLayoutReady: boolean;
  readonly profileCardLayoutReady: boolean;
  readonly appendixLayoutReady: boolean;
  readonly spacingConsistency: boolean;
  readonly badgeConsistency: boolean;
  readonly confidenceBadgeConsistency: boolean;
  readonly sourceBadgeConsistency: boolean;
  readonly sectionOrderingConsistency: boolean;
  readonly repeatedSectionCount: number;
  readonly duplicateContentCount: number;
  readonly layoutNoiseScore: number;
  readonly visualDensityScore: number;
  readonly premiumLayoutWarningCodes: readonly CoachReportPremiumLayoutVisualHierarchyWarningCode[];
  readonly recommendation: "KEEP_PREMIUM_LAYOUT" | "REDUCE_LAYOUT_DENSITY" | "RESTORE_SECTION_ORDERING" | "FIX_DUPLICATED_SECTIONS";
}

export function auditCoachReportPremiumLayout(productHtml: string): CoachReportPremiumLayoutAudit {
  const actionPlan = extractSection(productHtml, "coach-action-plan");
  const premiumCoverReady = sectionIndex(productHtml, "premium-cover") >= 0;
  const scoreCardReady = extractSection(productHtml, "express-read").includes("Score officiel") &&
    productHtml.includes("score-box");
  const executiveSummaryReady = sectionIndex(productHtml, "executive-summary") >= 0;
  const actionPlanCardLayoutReady = countClass(actionPlan, "action-plan-card") >= 3 &&
    actionPlan.includes("action-plan-card--primary");
  const nextMatchPlanLayoutReady = sectionIndex(productHtml, "next-match-plan") >= 0;
  const signalCardLayoutReady = countClass(extractSection(productHtml, "key-coach-signals"), "signal-card") >= 3;
  const profileCardLayoutReady = sectionIndex(productHtml, "profiles-to-observe") >= 0;
  const appendixLayoutReady = extractSection(productHtml, "appendices").includes("<details");
  const spacingConsistency = productHtml.includes(".product-section") && productHtml.includes("gap: 14px");
  const badgeConsistency = countClass(productHtml, "badge") >= 8;
  const confidenceBadgeConsistency = productHtml.includes("Confiance");
  const sourceBadgeConsistency = productHtml.includes("Source :") || productHtml.includes("Source officielle");
  const sectionOrderingConsistency = sectionIndex(productHtml, "express-read") < sectionIndex(productHtml, "coach-action-plan") &&
    sectionIndex(productHtml, "coach-action-plan") < sectionIndex(productHtml, "appendices");
  const repeatedSectionCount = [
    "express-read",
    "coach-action-plan",
    "training-focus-package",
    "next-match-plan",
    "appendices",
  ].reduce((sum, sectionId) => sum + Math.max(0, countOccurrences(productHtml, `id="${sectionId}"`) - 1), 0);
  const duplicateContentCount = Math.max(0, countOccurrences(productHtml, "Les rapprochements profil-joueur ne sont pas des choix de composition") - 1);
  const layoutNoiseScore = repeatedSectionCount + duplicateContentCount + (containsForbiddenCoachWording(productHtml) ? 3 : 0);
  const visualDensityScore = Math.min(100, countClass(productHtml, "product-card") * 3 + countClass(productHtml, "report-table-card") * 2);
  const premiumLayoutReady = premiumCoverReady &&
    scoreCardReady &&
    executiveSummaryReady &&
    actionPlanCardLayoutReady &&
    nextMatchPlanLayoutReady &&
    signalCardLayoutReady &&
    profileCardLayoutReady &&
    appendixLayoutReady &&
    spacingConsistency &&
    badgeConsistency &&
    confidenceBadgeConsistency &&
    sourceBadgeConsistency &&
    sectionOrderingConsistency &&
    repeatedSectionCount === 0 &&
    layoutNoiseScore === 0;
  const premiumLayoutWarningCodes: CoachReportPremiumLayoutVisualHierarchyWarningCode[] = [
    ...(premiumLayoutReady ? ["PREMIUM_LAYOUT_READY" as const] : ["COACH_REPORT_PREMIUM_LAYOUT_PARTIAL" as const]),
    ...(actionPlanCardLayoutReady ? ["ACTION_PLAN_PROMINENT" as const, "PRIMARY_ACTION_CARD_PROMINENT" as const] : ["ACTION_PLAN_NOT_PROMINENT" as const]),
    ...(repeatedSectionCount === 0 ? [] : ["DUPLICATED_SECTIONS_DETECTED" as const]),
    ...(containsForbiddenCoachWording(productHtml) ? ["FORBIDDEN_WORDING_DETECTED" as const] : []),
  ];

  return {
    premiumCoverReady,
    scoreCardReady,
    executiveSummaryReady,
    actionPlanCardLayoutReady,
    nextMatchPlanLayoutReady,
    signalCardLayoutReady,
    profileCardLayoutReady,
    appendixLayoutReady,
    spacingConsistency,
    badgeConsistency,
    confidenceBadgeConsistency,
    sourceBadgeConsistency,
    sectionOrderingConsistency,
    repeatedSectionCount,
    duplicateContentCount,
    layoutNoiseScore,
    visualDensityScore,
    premiumLayoutWarningCodes,
    recommendation: premiumLayoutReady
      ? "KEEP_PREMIUM_LAYOUT"
      : repeatedSectionCount > 0
        ? "FIX_DUPLICATED_SECTIONS"
        : !sectionOrderingConsistency
          ? "RESTORE_SECTION_ORDERING"
          : "REDUCE_LAYOUT_DENSITY",
  };
}
