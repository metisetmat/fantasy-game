import { TacticalStyle } from "../../models/tactics";
import { FinishingOutcome } from "../../systems/interactions/finishing";
import { SpatialMoveType } from "../../systems/spatial/intention/types";
import type { CoachingCause, TeamPatternAnalysis } from "./types";

function hasMove(analysis: TeamPatternAnalysis, moveType: SpatialMoveType): boolean {
  return analysis.movePatterns.some((pattern) => pattern.moveType === moveType);
}

export function analyzeFailureCauses(analysis: TeamPatternAnalysis): readonly CoachingCause[] {
  const causes: CoachingCause[] = [];
  const failedFinishes = analysis.finishingOutcomes.filter(
    (outcome) =>
      outcome === FinishingOutcome.SavedAttempt ||
      outcome === FinishingOutcome.BlockedAttempt ||
      outcome === FinishingOutcome.MissedAttempt ||
      outcome === FinishingOutcome.LiveRebound ||
      outcome === FinishingOutcome.SecondChance ||
      outcome === FinishingOutcome.EmergencyClearance ||
      outcome === FinishingOutcome.LastDefenderSave ||
      outcome === FinishingOutcome.DefensiveRecovery,
  ).length;

  if (analysis.finishingOpportunities > 0 && analysis.scoringEvents === 0) {
    causes.push({
      text: `${analysis.teamName} reached ${analysis.finishingOpportunities} finishing window${analysis.finishingOpportunities === 1 ? "" : "s"} but converted none.`,
    });
  }

  if (
    analysis.tacticalStyle === TacticalStyle.Blitz &&
    analysis.finishingOpportunities === 0 &&
    (hasMove(analysis, SpatialMoveType.Progression) || hasMove(analysis, SpatialMoveType.DirectVerticalAttack))
  ) {
    causes.push({
      text: `${analysis.teamName} created vertical chaos but did not convert it into a finishing window.`,
    });
  }

  if (analysis.pressingSequences > 0 && analysis.turnoversWon === 0) {
    causes.push({
      text: `${analysis.teamName} pressed ${analysis.pressingSequences} time${analysis.pressingSequences === 1 ? "" : "s"} but did not record an actual pressure turnover.`,
    });
  }

  if (failedFinishes > 0) {
    causes.push({
      text: `Finishing was stopped ${failedFinishes} time${failedFinishes === 1 ? "" : "s"} by execution quality or defensive response.`,
    });
  }

  if (analysis.finishingOpportunities > 0 && analysis.averageConversionQuality !== null && analysis.averageConversionQuality < 62) {
    causes.push({
      text: `${analysis.teamName} created finishing windows but finishing quality averaged only ${analysis.averageConversionQuality}.`,
    });
  }

  if (analysis.highDangerLowScoringThreat > 0) {
    causes.push({
      text: `${analysis.teamName} created tactical danger without entering a realistic scoring lane ${analysis.highDangerLowScoringThreat} time${analysis.highDangerLowScoringThreat === 1 ? "" : "s"}.`,
    });
  }

  if (analysis.redZoneLateralDelays > 0) {
    causes.push({
      text: `${analysis.teamName} delayed conversion with lateral circulation in ${analysis.redZoneLateralDelays} high-scoring-danger context${analysis.redZoneLateralDelays === 1 ? "" : "s"}.`,
    });
  }

  if (analysis.legalFinishingOptionsIgnored > 0) {
    causes.push({
      text: `${analysis.teamName} ignored ${analysis.legalFinishingOptionsIgnored} legal finishing option${analysis.legalFinishingOptionsIgnored === 1 ? "" : "s"} during target selection.`,
    });
  }

  if (analysis.highTransitionDangerStabilized > 0) {
    causes.push({
      text: `${analysis.teamName} stabilized ${analysis.highTransitionDangerStabilized} high-danger transition${analysis.highTransitionDangerStabilized === 1 ? "" : "s"} instead of attacking the scoring window.`,
    });
  }

  if (analysis.poorDecisions > 0 || analysis.rushedClearances > 0) {
    causes.push({
      text: `Chaos produced ${analysis.poorDecisions} poor decision${analysis.poorDecisions === 1 ? "" : "s"} and ${analysis.rushedClearances} rushed clearance${analysis.rushedClearances === 1 ? "" : "s"}.`,
    });
  }

  if (analysis.buildUpFailures > 0) {
    causes.push({
      text: `${analysis.teamName} lost build-up control ${analysis.buildUpFailures} time${analysis.buildUpFailures === 1 ? "" : "s"} under pressure.`,
    });
  }

  if (analysis.finalRecoverySaturationScore >= 30) {
    causes.push({
      text: `${analysis.teamName} finished with ${analysis.finalRecoverySaturationLevel} recovery saturation after repeated emergency defensive load.`,
    });
  }

  if (
    analysis.tacticalStyle === TacticalStyle.Blitz &&
    (hasMove(analysis, SpatialMoveType.Progression) || hasMove(analysis, SpatialMoveType.DirectVerticalAttack)) &&
    analysis.averageSupportQuality !== null &&
    analysis.averageSupportQuality < 72
  ) {
    causes.push({
      text: `Vertical choices were made with support quality around ${analysis.averageSupportQuality}, which left attacks exposed to collapse.`,
    });
  }

  return causes.slice(0, 4);
}
