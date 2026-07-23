import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { CoachReportStoryFirstRecompositionWarningCode } from "./coachReportStoryFirstRecompositionWarnings";
import { countMatches, sectionPosition, stripTags } from "./storyFirstAuditUtils8H";

export interface CoachReadFlowAudit8H {
  readonly status: OfficialCausalityStatus;
  readonly coachCanUnderstandMatchUnder2Minutes: boolean;
  readonly firstThreeSectionsCoachReadable: boolean;
  readonly scoreVisibleBeforeReplay: boolean;
  readonly storyVisibleBeforeEvidence: boolean;
  readonly replayVisibleBeforeDetails: boolean;
  readonly actionPlanVisibleBeforeTechnicalAppendix: boolean;
  readonly firstTechnicalSectionPosition: number;
  readonly readFlowFrictionCount: number;
  readonly repeatedGuardrailInMainFlowCount: number;
  readonly coachReadabilityScore: number;
  readonly readFlowWarningCodes: readonly CoachReportStoryFirstRecompositionWarningCode[];
  readonly recommendation: string;
}

export function auditCoachReadFlow8H(productReportHtml: string): CoachReadFlowAudit8H {
  const expressPosition = sectionPosition(productReportHtml, "express-read");
  const storyPosition = sectionPosition(productReportHtml, "official-match-story-spine");
  const replayPosition = sectionPosition(productReportHtml, "coach-replay-8e");
  const keySignalsPosition = sectionPosition(productReportHtml, "key-coach-signals");
  const appendixPosition = sectionPosition(productReportHtml, "appendices");
  const actionPlanPosition = sectionPosition(productReportHtml, "coach-action-plan");
  const firstTechnicalSectionPosition = Math.min(sectionPosition(productReportHtml, "guardrail-summary"), appendixPosition);
  const firstThreeHtml = productReportHtml.slice(0, replayPosition === Number.MAX_SAFE_INTEGER ? keySignalsPosition : replayPosition);
  const firstThreeSectionsCoachReadable = stripTags(firstThreeHtml).length > 220 &&
    productReportHtml.includes("Lecture express") &&
    productReportHtml.includes("Le match en 2 minutes");
  const coachCanUnderstandMatchUnder2Minutes = firstThreeSectionsCoachReadable && storyPosition < replayPosition;
  const scoreVisibleBeforeReplay = productReportHtml.slice(0, replayPosition).includes("Score officiel");
  const storyVisibleBeforeEvidence = storyPosition < keySignalsPosition;
  const replayVisibleBeforeDetails = replayPosition < firstTechnicalSectionPosition;
  const actionPlanVisibleBeforeTechnicalAppendix = actionPlanPosition < appendixPosition;
  const repeatedGuardrailInMainFlowCount = Math.max(0, countMatches(productReportHtml.slice(0, actionPlanPosition), /source de verite|source-of-truth|score_change official|score_change officiel/giu) - 2);
  const readFlowFrictionCount = [
    !coachCanUnderstandMatchUnder2Minutes,
    !firstThreeSectionsCoachReadable,
    !scoreVisibleBeforeReplay,
    !storyVisibleBeforeEvidence,
    !replayVisibleBeforeDetails,
    !actionPlanVisibleBeforeTechnicalAppendix,
    repeatedGuardrailInMainFlowCount > 1,
  ].filter(Boolean).length;
  const coachReadabilityScore = Math.max(0, 100 - readFlowFrictionCount * 10 - repeatedGuardrailInMainFlowCount * 2);
  const warningCodes: CoachReportStoryFirstRecompositionWarningCode[] = [];
  if (!coachCanUnderstandMatchUnder2Minutes || !firstThreeSectionsCoachReadable) warningCodes.push("STORY_FIRST_LAYOUT_MISSING");
  if (!replayVisibleBeforeDetails) warningCodes.push("REPLAY_ENTRY_POINT_MISSING");
  if (!actionPlanVisibleBeforeTechnicalAppendix) warningCodes.push("ACTION_PLAN_TOO_LOW");
  if (warningCodes.length === 0) warningCodes.push("COACH_READ_FLOW_READY", "REPLAY_ENTRY_POINT_READY");
  const pass = coachCanUnderstandMatchUnder2Minutes &&
    firstThreeSectionsCoachReadable &&
    scoreVisibleBeforeReplay &&
    storyVisibleBeforeEvidence &&
    replayVisibleBeforeDetails &&
    actionPlanVisibleBeforeTechnicalAppendix &&
    repeatedGuardrailInMainFlowCount <= 1 &&
    coachReadabilityScore >= 92;

  return {
    status: pass ? "PASS" : "FAIL",
    coachCanUnderstandMatchUnder2Minutes,
    firstThreeSectionsCoachReadable,
    scoreVisibleBeforeReplay,
    storyVisibleBeforeEvidence,
    replayVisibleBeforeDetails,
    actionPlanVisibleBeforeTechnicalAppendix,
    firstTechnicalSectionPosition,
    readFlowFrictionCount,
    repeatedGuardrailInMainFlowCount,
    coachReadabilityScore,
    readFlowWarningCodes: warningCodes,
    recommendation: pass ? "KEEP_COACH_READ_FLOW" : "REPAIR_COACH_READ_FLOW",
  };
}
