import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { StoryFirstExportContentAudit8I } from "./storyFirstExportBudgetValidationThresholdFixTypes8I";
import type { StoryFirstExportBudgetValidationThresholdFixWarningCode } from "./storyFirstExportBudgetValidationThresholdFixWarnings";
import { countMatches } from "./storyFirstAuditUtils8H";

function mainText(html: string): string {
  return html.replace(/<section id="compact-appendix"[\s\S]*?<\/section>/giu, " ");
}

function sectionHtml(html: string, sectionId: string): string {
  const marker = `id="${sectionId}"`;
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) return "";
  const sectionStart = html.lastIndexOf("<section", markerIndex);
  if (sectionStart < 0) return "";
  const sectionPattern = /<\/?section\b[^>]*>/giu;
  sectionPattern.lastIndex = sectionStart;
  let depth = 0;
  let match: RegExpExecArray | null;
  while ((match = sectionPattern.exec(html)) !== null) {
    depth += match[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return html.slice(sectionStart, sectionPattern.lastIndex);
  }
  return "";
}

export function auditStoryFirstExportContent8I(exportHtml: string): StoryFirstExportContentAudit8I {
  const core = mainText(exportHtml);
  const replaySection = sectionHtml(exportHtml, "coach-replay-8e");
  const actionPlanSection = sectionHtml(exportHtml, "coach-action-plan");
  const exportStoryFirstSectionVisible = exportHtml.includes('data-story-first-export-version="8I"');
  const coverVisible = exportHtml.includes('id="premium-cover"') && exportHtml.includes("Score officiel");
  const expressReadVisible = exportHtml.includes('id="express-read"');
  const matchIn2MinutesVisible = exportHtml.includes("Le match en 2 minutes");
  const replay60SecondsVisible = exportHtml.includes("Replay coach en 60 secondes") && exportHtml.includes('data-replay-ux-version="8G"');
  const actionPlanVisible = exportHtml.includes('id="coach-action-plan"') && exportHtml.includes("Plan d'action coach");
  const exportActionPlanCardCount = countMatches(actionPlanSection, /class="[^"]*\baction-plan-export-card\b[^"]*"/giu);
  const actionPlanNonEmpty = exportActionPlanCardCount >= 2 && !/<div class="grid">\s*<\/div>/iu.test(actionPlanSection);
  const ellipsisTruncationCount = countMatches(replaySection, /\.{3}|…/gu);
  const truncatedSentenceCount = ellipsisTruncationCount + countMatches(replaySection, /\b(?:le|la|de|du|des|avec|dans|et|vers|devient)\s*(?:<\/li>|<\/p>)/giu);
  const tacticalMapEssentialsVisible = exportHtml.includes('id="tactical-map-cards"') && exportHtml.includes("Cartes tactiques essentielles");
  const sourceOfTruthNoteVisible = exportHtml.includes('id="source-of-truth-note"') && /score_change|timeline officielle/iu.test(exportHtml);
  const fullTimelineIncludedInExport = /78\s+evenements|timeline complete|full timeline/iu.test(core);
  const technicalTraceabilityIncludedInExport = /technical traceability|traceability group|Evenements officiels:\s*[a-z0-9_-]+,\s*[a-z0-9_-]+/iu.test(core);
  const sandboxPanelIncludedInExport = /sandbox decision panel|sandbox panel|selection preview sandbox/iu.test(core);
  const longBatchDiagnosticsIncludedInExport = /batch diagnostics|50-match|50 matchs|full-match economy table/iu.test(core);
  const rawEventIdInMainTextCount = countMatches(core, /\b(?:event-|contract-fixture-|full-match-|rc-)[a-z0-9_-]+\b/giu);
  const repeatedSourceOfTruthSentenceCount = countMatches(exportHtml, /score(?:,| et| officiel)[^.<]{0,120}(?:score_change|timeline officielle)/giu);
  const warnings: StoryFirstExportBudgetValidationThresholdFixWarningCode[] = [];
  if (!exportStoryFirstSectionVisible) warnings.push("STORY_FIRST_EXPORT_MISSING");
  if (!matchIn2MinutesVisible) warnings.push("MATCH_IN_2_MINUTES_MISSING");
  if (!replay60SecondsVisible) warnings.push("REPLAY_60_SECONDS_MISSING");
  if (!actionPlanVisible) warnings.push("ACTION_PLAN_EXPORT_MISSING");
  if (!actionPlanNonEmpty) warnings.push("ACTION_PLAN_EXPORT_MISSING");
  if (truncatedSentenceCount > 0 || ellipsisTruncationCount > 0) warnings.push("REPLAY_60_SECONDS_MISSING");
  if (fullTimelineIncludedInExport) warnings.push("FULL_TIMELINE_INCLUDED_IN_EXPORT");
  if (technicalTraceabilityIncludedInExport) warnings.push("TECHNICAL_TRACEABILITY_INCLUDED_IN_EXPORT");
  if (sandboxPanelIncludedInExport) warnings.push("SANDBOX_PANEL_INCLUDED_IN_EXPORT");
  if (longBatchDiagnosticsIncludedInExport) warnings.push("LONG_BATCH_DIAGNOSTICS_INCLUDED_IN_EXPORT");
  if (rawEventIdInMainTextCount > 0) warnings.push("RAW_EVENT_ID_IN_MAIN_TEXT");
  if (warnings.length === 0) warnings.push("STORY_FIRST_EXPORT_PRESERVED", "REPLAY_EXPORT_PRESERVED", "ACTION_PLAN_EXPORT_PRESERVED", "TACTICAL_MAP_EXPORT_PRESERVED", "TECHNICAL_EXPORT_COMPRESSION_READY");
  const pass = exportStoryFirstSectionVisible &&
    coverVisible &&
    expressReadVisible &&
    matchIn2MinutesVisible &&
    replay60SecondsVisible &&
    actionPlanVisible &&
    actionPlanNonEmpty &&
    truncatedSentenceCount === 0 &&
    ellipsisTruncationCount === 0 &&
    sourceOfTruthNoteVisible &&
    !fullTimelineIncludedInExport &&
    !technicalTraceabilityIncludedInExport &&
    !sandboxPanelIncludedInExport &&
    !longBatchDiagnosticsIncludedInExport &&
    rawEventIdInMainTextCount === 0 &&
    repeatedSourceOfTruthSentenceCount <= 2;

  return {
    status: pass ? "PASS" : "FAIL",
    exportStoryFirstSectionVisible,
    coverVisible,
    expressReadVisible,
    matchIn2MinutesVisible,
    replay60SecondsVisible,
    actionPlanVisible,
    actionPlanNonEmpty,
    exportActionPlanCardCount,
    truncatedSentenceCount,
    ellipsisTruncationCount,
    tacticalMapEssentialsVisible,
    sourceOfTruthNoteVisible,
    fullTimelineIncludedInExport,
    technicalTraceabilityIncludedInExport,
    sandboxPanelIncludedInExport,
    longBatchDiagnosticsIncludedInExport,
    rawEventIdInMainTextCount,
    repeatedSourceOfTruthSentenceCount,
    exportContentWarningCodes: warnings,
    recommendation: pass ? "KEEP_STORY_FIRST_COMPACT_EXPORT_CONTENT" : "REPAIR_STORY_FIRST_COMPACT_EXPORT_CONTENT",
  };
}
