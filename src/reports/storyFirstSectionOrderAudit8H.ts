import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { CoachReportStoryFirstRecompositionWarningCode } from "./coachReportStoryFirstRecompositionWarnings";
import { orderedSectionIds, sectionPosition } from "./storyFirstAuditUtils8H";

export interface StoryFirstSectionOrderAudit8H {
  readonly status: OfficialCausalityStatus;
  readonly storyFirstLayoutExists: boolean;
  readonly coverBeforeStory: boolean;
  readonly expressReadBeforeStory: boolean;
  readonly storyBeforeDetailedSignals: boolean;
  readonly replayBeforeTechnicalSections: boolean;
  readonly actionPlanAfterStoryBeforeAppendix: boolean;
  readonly sandboxAfterCoreCoachSections: boolean;
  readonly technicalAppendixAfterCoachSections: boolean;
  readonly technicalBeforeStoryCount: number;
  readonly technicalBeforeActionPlanCount: number;
  readonly storySectionPosition: number;
  readonly replaySectionPosition: number;
  readonly actionPlanPosition: number;
  readonly sandboxSectionPosition: number;
  readonly storyFirstScore: number;
  readonly sectionOrderWarningCodes: readonly CoachReportStoryFirstRecompositionWarningCode[];
  readonly recommendation: string;
  readonly orderedSections: readonly string[];
}

function countTechnicalBefore(productReportHtml: string, boundary: number): number {
  const technicalIds = ["appendices", "guardrail-summary", "interpretation-guard"];
  return technicalIds.filter((id) => {
    const position = sectionPosition(productReportHtml, id);
    return position < boundary;
  }).length;
}

export function auditStoryFirstSectionOrder8H(productReportHtml: string): StoryFirstSectionOrderAudit8H {
  const orderedSections = orderedSectionIds(productReportHtml);
  const storySectionPosition = sectionPosition(productReportHtml, "official-match-story-spine");
  const replaySectionPosition = sectionPosition(productReportHtml, "coach-replay-8e");
  const actionPlanPosition = sectionPosition(productReportHtml, "coach-action-plan");
  const appendixPosition = sectionPosition(productReportHtml, "appendices");
  const keySignalsPosition = sectionPosition(productReportHtml, "key-coach-signals");
  const causalityPosition = sectionPosition(productReportHtml, "official-causality-8c");
  const sequencePosition = sectionPosition(productReportHtml, "sequence-causality-8d");
  const expressPosition = sectionPosition(productReportHtml, "express-read");
  const sandboxSectionPosition = sectionPosition(productReportHtml, "profiles-to-observe");
  const storyFirstLayoutExists = productReportHtml.includes('data-story-first-version="8H"') &&
    productReportHtml.includes("Le match en 2 minutes");
  const coverBeforeStory = storySectionPosition > 0;
  const expressReadBeforeStory = expressPosition < storySectionPosition;
  const storyBeforeDetailedSignals = storySectionPosition < keySignalsPosition;
  const replayBeforeTechnicalSections = replaySectionPosition < appendixPosition &&
    replaySectionPosition < causalityPosition &&
    replaySectionPosition < sequencePosition;
  const actionPlanAfterStoryBeforeAppendix = actionPlanPosition > storySectionPosition &&
    actionPlanPosition > replaySectionPosition &&
    actionPlanPosition < appendixPosition;
  const sandboxAfterCoreCoachSections = sandboxSectionPosition > actionPlanPosition;
  const technicalAppendixAfterCoachSections = appendixPosition > actionPlanPosition;
  const technicalBeforeStoryCount = countTechnicalBefore(productReportHtml, storySectionPosition);
  const technicalBeforeActionPlanCount = countTechnicalBefore(productReportHtml, actionPlanPosition);
  const storyFirstScore = Math.max(0, 100 -
    (storyFirstLayoutExists ? 0 : 30) -
    (storyBeforeDetailedSignals ? 0 : 20) -
    (replayBeforeTechnicalSections ? 0 : 20) -
    (actionPlanAfterStoryBeforeAppendix ? 0 : 10) -
    technicalBeforeStoryCount * 15 -
    Math.max(0, technicalBeforeActionPlanCount - 1) * 8
  );
  const warningCodes: CoachReportStoryFirstRecompositionWarningCode[] = [];
  if (!storyFirstLayoutExists) warningCodes.push("STORY_FIRST_LAYOUT_MISSING");
  if (!storyBeforeDetailedSignals) warningCodes.push("STORY_AFTER_DETAILED_SIGNALS");
  if (!replayBeforeTechnicalSections) warningCodes.push("TECHNICAL_SECTION_BEFORE_STORY");
  if (!actionPlanAfterStoryBeforeAppendix) warningCodes.push("ACTION_PLAN_TOO_LOW");
  if (!sandboxAfterCoreCoachSections) warningCodes.push("SANDBOX_TOO_HIGH_IN_REPORT");
  if (warningCodes.length === 0) {
    warningCodes.push("STORY_FIRST_LAYOUT_READY", "REPORT_SECTION_ORDER_READY", "ACTION_PLAN_STILL_PROMINENT", "TECHNICAL_SECTIONS_DEMOTED");
  }
  const pass = storyFirstLayoutExists &&
    storyBeforeDetailedSignals &&
    replayBeforeTechnicalSections &&
    actionPlanAfterStoryBeforeAppendix &&
    sandboxAfterCoreCoachSections &&
    technicalBeforeStoryCount === 0 &&
    technicalBeforeActionPlanCount <= 1 &&
    storyFirstScore >= 90;

  return {
    status: pass ? "PASS" : "FAIL",
    storyFirstLayoutExists,
    coverBeforeStory,
    expressReadBeforeStory,
    storyBeforeDetailedSignals,
    replayBeforeTechnicalSections,
    actionPlanAfterStoryBeforeAppendix,
    sandboxAfterCoreCoachSections,
    technicalAppendixAfterCoachSections,
    technicalBeforeStoryCount,
    technicalBeforeActionPlanCount,
    storySectionPosition,
    replaySectionPosition,
    actionPlanPosition,
    sandboxSectionPosition,
    storyFirstScore,
    sectionOrderWarningCodes: warningCodes,
    recommendation: pass ? "KEEP_STORY_FIRST_SECTION_ORDER" : "REPAIR_STORY_FIRST_SECTION_ORDER",
    orderedSections,
  };
}
