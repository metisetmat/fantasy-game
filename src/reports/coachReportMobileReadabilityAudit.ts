import { extractSection, readTimeSecondsFromHtml } from "./coachReportHtmlAuditUtils";
import type { CoachReportPremiumLayoutVisualHierarchyWarningCode } from "./coachReportPremiumLayoutVisualHierarchyWarnings";

export interface CoachReportMobileReadabilityAudit {
  readonly mobileBreakpointPresent: boolean;
  readonly mobileScoreReadable: boolean;
  readonly mobileActionCardsReadable: boolean;
  readonly mobileCardsStackCorrectly: boolean;
  readonly mobileNoHorizontalOverflow: boolean;
  readonly mobileTapTargetsReasonable: boolean;
  readonly mobileDetailsUsable: boolean;
  readonly mobileReadTimeEstimate: number;
  readonly mobileReadabilityWarningCodes: readonly CoachReportPremiumLayoutVisualHierarchyWarningCode[];
  readonly recommendation: "KEEP_MOBILE_LAYOUT" | "IMPROVE_MOBILE_STACKING" | "IMPROVE_MOBILE_DETAILS";
}

function firstArticle(html: string): string {
  const start = html.indexOf("<article");
  if (start < 0) return html;
  const end = html.indexOf("</article>", start);
  return end < 0 ? html.slice(start) : html.slice(start, end + "</article>".length);
}

export function auditCoachReportMobileReadability(productHtml: string): CoachReportMobileReadabilityAudit {
  const mobileBreakpointPresent = productHtml.includes("@media (max-width: 720px)");
  const mobileScoreReadable = productHtml.includes(".score-box { text-align: left; }");
  const mobileActionCardsReadable = extractSection(productHtml, "coach-action-plan").includes("action-plan-card--primary");
  const mobileCardsStackCorrectly = productHtml.includes("grid-template-columns: 1fr");
  const mobileNoHorizontalOverflow = productHtml.includes("overflow-x: hidden") &&
    productHtml.includes("overflow-wrap: anywhere");
  const mobileTapTargetsReasonable = productHtml.includes("summary { cursor: pointer") || productHtml.includes(".appendix summary");
  const mobileDetailsUsable = productHtml.includes("<details") && productHtml.includes("summary");
  const firstActionCard = firstArticle(extractSection(productHtml, "coach-action-plan"));
  const mobileReadTimeEstimate = readTimeSecondsFromHtml([
    extractSection(productHtml, "express-read"),
    firstActionCard,
  ].join("\n"));
  const ready = mobileBreakpointPresent &&
    mobileScoreReadable &&
    mobileActionCardsReadable &&
    mobileCardsStackCorrectly &&
    mobileNoHorizontalOverflow &&
    mobileTapTargetsReasonable &&
    mobileDetailsUsable &&
    mobileReadTimeEstimate <= 150;
  const mobileReadabilityWarningCodes: CoachReportPremiumLayoutVisualHierarchyWarningCode[] = [
    ready ? "MOBILE_READABILITY_READY" : "MOBILE_READABILITY_PARTIAL",
  ];

  return {
    mobileBreakpointPresent,
    mobileScoreReadable,
    mobileActionCardsReadable,
    mobileCardsStackCorrectly,
    mobileNoHorizontalOverflow,
    mobileTapTargetsReasonable,
    mobileDetailsUsable,
    mobileReadTimeEstimate,
    mobileReadabilityWarningCodes,
    recommendation: ready
      ? "KEEP_MOBILE_LAYOUT"
      : !mobileCardsStackCorrectly || !mobileNoHorizontalOverflow
        ? "IMPROVE_MOBILE_STACKING"
        : "IMPROVE_MOBILE_DETAILS",
  };
}
