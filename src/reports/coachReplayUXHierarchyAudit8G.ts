import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { CoachReplayUXIterationView8G } from "./coachReplayUXIterationTypes8G";
import type { CoachReplayUXIterationWarningCode } from "./coachReplayUXIterationWarnings";

export interface CoachReplayUXHierarchyAudit8G {
  readonly status: OfficialCausalityStatus;
  readonly replayUXSectionExists: boolean;
  readonly priorityBlockExists: boolean;
  readonly priorityMomentCount: number;
  readonly allReplayMomentCount: number;
  readonly timelineRailExists: boolean;
  readonly timelineRailMomentCount: number;
  readonly productReplayMomentCardCount: number;
  readonly exportReplayMomentCardCount: number;
  readonly priorityMomentsBeforeSecondaryMoments: boolean;
  readonly sourceOfTruthNoteVisible: boolean;
  readonly proofDetailsCollapsedByDefault: boolean;
  readonly coachReplayUXWarningCodes: readonly CoachReplayUXIterationWarningCode[];
  readonly recommendation: string;
}

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

export function auditCoachReplayUXHierarchy8G(input: {
  readonly view: CoachReplayUXIterationView8G;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReplayUXHierarchyAudit8G {
  const replayUXSectionExists = input.productReportHtml.includes('data-replay-ux-version="8G"') &&
    input.productReportHtml.includes("Revivez le match");
  const priorityBlockExists = input.productReportHtml.includes("2 minutes pour comprendre");
  const priorityMomentCount = input.view.priorityMoments.length;
  const allReplayMomentCount = input.view.momentCards.length;
  const timelineRailExists = input.productReportHtml.includes("replay-timeline-rail");
  const timelineRailMomentCount = input.view.timelineRail.moments.length;
  const productReplayMomentCardCount = input.view.momentCards.filter((card) => card.isVisibleInProduct).length;
  const exportReplayMomentCardCount = countMatches(input.exportReportHtml, /<li><strong>[\s\S]*?<\/li>/giu);
  const priorityIndex = input.productReportHtml.indexOf("replay-priority-block");
  const allIndex = input.productReportHtml.indexOf("replay-all-moments");
  const priorityMomentsBeforeSecondaryMoments = priorityIndex >= 0 && allIndex > priorityIndex;
  const sourceOfTruthNoteVisible = input.productReportHtml.includes(input.view.globalSourceOfTruthNote) &&
    input.exportReportHtml.includes("Lecture issue des");
  const proofDetailsCollapsedByDefault = input.view.momentCards.every((card) => card.isCollapsedByDefault) &&
    input.productReportHtml.includes("<details");
  const warningCodes: CoachReplayUXIterationWarningCode[] = [];
  if (!replayUXSectionExists) warningCodes.push("REPLAY_UX_MISSING");
  if (!priorityBlockExists) warningCodes.push("PRIORITY_BLOCK_MISSING");
  if (priorityMomentCount !== 3) warningCodes.push("PRIORITY_MOMENT_COUNT_INVALID");
  if (!timelineRailExists) warningCodes.push("TIMELINE_RAIL_MISSING");
  if (timelineRailMomentCount !== 6) warningCodes.push("TIMELINE_RAIL_COUNT_INVALID");
  if (allReplayMomentCount !== 6) warningCodes.push("ALL_REPLAY_MOMENTS_NOT_AVAILABLE");
  if (!proofDetailsCollapsedByDefault) warningCodes.push("PROOF_DETAILS_NOT_COLLAPSED");
  if (!sourceOfTruthNoteVisible) warningCodes.push("SOURCE_OF_TRUTH_NOTE_MISSING");
  if (warningCodes.length === 0) {
    warningCodes.push("REPLAY_UX_READY", "REPLAY_PRIORITY_READY", "REPLAY_TIMELINE_READY", "REPLAY_MOMENT_CARDS_READY");
  }
  const status: OfficialCausalityStatus = warningCodes.some((warning) => warning.endsWith("_MISSING") || warning.endsWith("_INVALID") || warning === "ALL_REPLAY_MOMENTS_NOT_AVAILABLE")
    ? "FAIL"
    : "PASS";

  return {
    status,
    replayUXSectionExists,
    priorityBlockExists,
    priorityMomentCount,
    allReplayMomentCount,
    timelineRailExists,
    timelineRailMomentCount,
    productReplayMomentCardCount,
    exportReplayMomentCardCount,
    priorityMomentsBeforeSecondaryMoments,
    sourceOfTruthNoteVisible,
    proofDetailsCollapsedByDefault,
    coachReplayUXWarningCodes: warningCodes,
    recommendation: status === "PASS" ? "KEEP_REPLAY_UX_HIERARCHY_8G" : "REVIEW_REPLAY_UX_HIERARCHY_8G",
  };
}
