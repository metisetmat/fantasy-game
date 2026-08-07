import type { ManualReviewExportCoverBadgeAudit9D } from "./manualReviewExportMetadataBadgeCleanupTypes9D";
import type { ManualReviewExportMetadataBadgeCleanupWarningCode9D } from "./manualReviewExportMetadataBadgeCleanupWarnings9D";

const EXPECTED_BADGE = "Export compact 9D";
const STALE_BADGES = ["Export compact 9C", "Export compact 9B", "Export compact 9A", "Export compact 8Z"] as const;

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/gu, " ").replace(/\s+/gu, " ").trim();
}

function extractHeader(html: string): string {
  return html.match(/<header\b[\s\S]*?<\/header>/u)?.[0] ?? "";
}

function extractBadgeFromHeaderBadgeRow(headerHtml: string): string | undefined {
  const badges = [...headerHtml.matchAll(/<[^>]*class="[^"]*\bbadge\b[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/gu)]
    .map((match) => stripTags(match[1] ?? ""))
    .filter((text) => text.length > 0);
  return badges.find((text) => text.startsWith("Export compact"));
}

function extractBadgeFromSelector(html: string, selectorId: string): string | undefined {
  const section = html.match(new RegExp(`<[^>]*id="${selectorId}"[^>]*>[\\s\\S]*?<\\/[^>]+>`, "u"))?.[0] ?? "";
  const badge = section.match(/<[^>]*class="[^"]*\bbadge\b[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/u)?.[1];
  return badge === undefined ? undefined : stripTags(badge);
}

export function auditManualReviewExportCoverBadge9D(exportHtml: string): ManualReviewExportCoverBadgeAudit9D {
  const headerHtml = extractHeader(exportHtml);
  const headerBadge = extractBadgeFromHeaderBadgeRow(headerHtml);
  const premiumCoverBadge = headerBadge ?? extractBadgeFromSelector(exportHtml, "premium-cover");
  const reportCoverBadge = premiumCoverBadge ?? extractBadgeFromSelector(exportHtml, "report-cover");
  const exportCoverBadgeText = reportCoverBadge ?? "";
  const exportCoverBadgeFound = exportCoverBadgeText.length > 0;
  const coverBadgeSource = headerBadge !== undefined
    ? "header_badge_row"
    : premiumCoverBadge !== undefined
      ? "report_scoreboard_badge"
      : reportCoverBadge !== undefined
        ? "report_scoreboard_badge"
        : "unknown";
  const coverBadgeSelectorUsed = headerBadge !== undefined
    ? "header .badge-row .badge"
    : premiumCoverBadge !== undefined
      ? "#premium-cover .badge"
      : reportCoverBadge !== undefined
        ? ".report-cover .badge"
        : "none";
  const staleValues = STALE_BADGES.filter((badge) => exportCoverBadgeText.includes(badge));
  const warningCodes: ManualReviewExportMetadataBadgeCleanupWarningCode9D[] = [];
  if (!exportCoverBadgeFound || exportCoverBadgeText !== EXPECTED_BADGE) warningCodes.push("EXPORT_COVER_BADGE_STALE");
  if (exportCoverBadgeText.includes("Export compact 9C")) warningCodes.push("EXPORT_COVER_BADGE_STILL_9C");
  if (exportCoverBadgeText.includes("Export compact 9B")) warningCodes.push("EXPORT_COVER_BADGE_STILL_9B");
  if (exportCoverBadgeText.includes("Export compact 9A")) warningCodes.push("EXPORT_COVER_BADGE_STILL_9A");
  if (staleValues.length === 0 && exportCoverBadgeText === EXPECTED_BADGE) {
    warningCodes.push("EXPORT_COVER_BADGE_9D_READY", "EXPORT_COVER_BADGE_AUDIT_STRICT_READY", "NO_BODY_FALLBACK_FOR_COVER_BADGE");
  }

  return {
    exportCoverBadgeFound,
    exportCoverBadgeText,
    exportCoverBadgeExpectedText: EXPECTED_BADGE,
    exportCoverBadgeMentions9D: exportCoverBadgeText === EXPECTED_BADGE,
    exportCoverBadgeCorrect: exportCoverBadgeText === EXPECTED_BADGE && coverBadgeSource !== "unknown",
    exportCoverBadgeMentions9C: exportCoverBadgeText.includes("Export compact 9C"),
    exportCoverBadgeMentions9B: exportCoverBadgeText.includes("Export compact 9B"),
    exportCoverBadgeMentions9A: exportCoverBadgeText.includes("Export compact 9A"),
    exportCoverBadgeMentions8Z: exportCoverBadgeText.includes("Export compact 8Z"),
    exportCoverBadgeStaleVersionCount: staleValues.length,
    exportCoverBadgeStaleVersionValues: staleValues,
    coverBadgeSelectorUsed,
    coverBadgeSource,
    bodyMentionFallbackUsedForCoverBadge: false,
    coverBadgeWarningCodes: warningCodes,
    recommendation: exportCoverBadgeText === EXPECTED_BADGE && coverBadgeSource !== "unknown"
      ? "KEEP_EXPORT_METADATA_BADGE_CLEANUP"
      : "REVIEW_EXPORT_METADATA_BADGE_AUDIT",
  };
}
