import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { CoachReplayUXIteration8GModel } from "./coachReplayUXIterationTypes8G";
import type { CoachReportStoryFirstRecompositionWarningCode } from "./coachReportStoryFirstRecompositionWarnings";
import { countMatches } from "./storyFirstAuditUtils8H";

export interface StoryFirstReplayPreservationAudit8H {
  readonly status: OfficialCausalityStatus;
  readonly replayUX8GPreserved: boolean;
  readonly priorityMomentCount: number;
  readonly allReplayMomentCount: number;
  readonly timelineRailMomentCount: number;
  readonly actorMapping8FPreserved: boolean;
  readonly roleDiversityPreserved: boolean;
  readonly suspiciousGoalkeeperFallbackCount: number;
  readonly naturalReplayContentPreserved: boolean;
  readonly proofDetailsCollapsedByDefault: boolean;
  readonly replayRawIdLeakCount: number;
  readonly replayScoreChangeCoverage: string;
  readonly replayPreservationWarningCodes: readonly CoachReportStoryFirstRecompositionWarningCode[];
  readonly recommendation: string;
}

export function auditStoryFirstReplayPreservation8H(input: {
  readonly baseline8G: CoachReplayUXIteration8GModel;
  readonly productReportHtml: string;
}): StoryFirstReplayPreservationAudit8H {
  const priorityMomentCount = input.baseline8G.priorityAudit.priorityMomentCount;
  const allReplayMomentCount = input.baseline8G.hierarchyAudit.allReplayMomentCount;
  const timelineRailMomentCount = input.baseline8G.hierarchyAudit.timelineRailMomentCount;
  const actorMapping8FPreserved = input.baseline8G.actorMappingPreserved;
  const roleDiversityPreserved = input.baseline8G.baseline8F.actorMappingAudit.roleDiversityRestored;
  const suspiciousGoalkeeperFallbackCount = input.baseline8G.baseline8F.actorMappingAudit.suspiciousGoalkeeperFallbackAfterCount;
  const naturalReplayContentPreserved = input.baseline8G.integrationBudgetAudit.naturalReplayContentPreserved &&
    input.baseline8G.wordingUXAudit.naturalReplayTextPreserved;
  const proofDetailsCollapsedByDefault = input.baseline8G.evidenceDisclosureAudit.proofDetailsCollapsedCount ===
    input.baseline8G.evidenceDisclosureAudit.replayProofNoteCount;
  const replayAnchor = input.productReportHtml.indexOf('id="coach-replay-8e"');
  const replaySectionStart = replayAnchor < 0 ? -1 : input.productReportHtml.lastIndexOf("<section", replayAnchor);
  const replaySectionEnd = replayAnchor < 0 ? -1 : input.productReportHtml.indexOf("</section>", replayAnchor);
  const replaySection = replaySectionStart < 0 || replaySectionEnd < 0
    ? ""
    : input.productReportHtml.slice(replaySectionStart, replaySectionEnd + "</section>".length);
  const replayRawIdLeakCount = countMatches(replaySection.replace(/<details[\s\S]*?<\/details>/giu, " "), /\b(?:event-|contract-fixture-|full-match-)[a-z0-9_-]+\b/giu);
  const replayScoreChangeCoverage = `${input.baseline8G.sourceOfTruthRegressionAudit.scoreChangeEventsCoveredByReplayCount}/${input.baseline8G.sourceOfTruthRegressionAudit.scoreChangeEventCount}`;
  const replayUX8GPreserved = input.baseline8G.replayUXReady &&
    input.productReportHtml.includes('data-replay-ux-version="8G"') &&
    input.productReportHtml.includes("2 minutes pour comprendre") &&
    input.productReportHtml.includes("replay-timeline-rail");
  const warningCodes: CoachReportStoryFirstRecompositionWarningCode[] = [];
  if (!replayUX8GPreserved) warningCodes.push("REPLAY_ENTRY_POINT_MISSING");
  if (!proofDetailsCollapsedByDefault) warningCodes.push("PROOF_DETAILS_NOT_COLLAPSED");
  if (!actorMapping8FPreserved) warningCodes.push("ACTOR_MAPPING_REGRESSED");
  if (!roleDiversityPreserved) warningCodes.push("ROLE_DIVERSITY_REGRESSED");
  if (suspiciousGoalkeeperFallbackCount > 0) warningCodes.push("SUSPICIOUS_GOALKEEPER_FALLBACK_REGRESSED");
  if (replayRawIdLeakCount > 0) warningCodes.push("RAW_EVENT_ID_IN_MAIN_TEXT");
  if (warningCodes.length === 0) {
    warningCodes.push("REPLAY_ENTRY_POINT_READY", "NATURAL_REPLAY_CONTENT_PRESERVED", "ACTOR_MAPPING_PRESERVED");
  }
  const pass = replayUX8GPreserved &&
    priorityMomentCount === 3 &&
    allReplayMomentCount === 6 &&
    timelineRailMomentCount === 6 &&
    actorMapping8FPreserved &&
    roleDiversityPreserved &&
    suspiciousGoalkeeperFallbackCount === 0 &&
    naturalReplayContentPreserved &&
    proofDetailsCollapsedByDefault &&
    replayRawIdLeakCount === 0 &&
    replayScoreChangeCoverage === "6/6";

  return {
    status: pass ? "PASS" : "FAIL",
    replayUX8GPreserved,
    priorityMomentCount,
    allReplayMomentCount,
    timelineRailMomentCount,
    actorMapping8FPreserved,
    roleDiversityPreserved,
    suspiciousGoalkeeperFallbackCount,
    naturalReplayContentPreserved,
    proofDetailsCollapsedByDefault,
    replayRawIdLeakCount,
    replayScoreChangeCoverage,
    replayPreservationWarningCodes: warningCodes,
    recommendation: pass ? "KEEP_REPLAY_PRESERVATION_8H" : "REPAIR_REPLAY_PRESERVATION_8H",
  };
}
