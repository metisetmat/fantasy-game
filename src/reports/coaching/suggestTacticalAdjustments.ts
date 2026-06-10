import { OffensiveProgressionPhilosophy, TacticalStyle } from "../../models/tactics";
import { SpatialMoveType } from "../../systems/spatial/intention/types";
import type { TeamPatternAnalysis } from "./types";

function hasMove(analysis: TeamPatternAnalysis, moveType: SpatialMoveType): boolean {
  return analysis.movePatterns.some((pattern) => pattern.moveType === moveType);
}

export function suggestTacticalAdjustments(analysis: TeamPatternAnalysis): readonly string[] {
  const suggestions: string[] = [];

  if (analysis.tacticalStyle === TacticalStyle.Blitz) {
    if (analysis.poorDecisions > 0 || analysis.rushedClearances > 0) {
      suggestions.push("Test slightly lower risk under HIGH pressure.");
    }

    if (analysis.averageSupportQuality !== null && analysis.averageSupportQuality < 72) {
      suggestions.push("Increase collectiveness or add an intermediate support outlet before direct attacks.");
    }

    if (analysis.highDangerLowScoringThreat > 0) {
      suggestions.push("Keep the vertical identity, but aim the first forward action closer to scoring lanes.");
    }

    if (analysis.finishingOpportunities > 0 && analysis.scoringEvents === 0) {
      suggestions.push("Keep chaotic aggression, but improve Space Hunter composure for the final action.");
    }

    if (
      analysis.offensiveProgressionPhilosophy === OffensiveProgressionPhilosophy.LongPlayLineBreaking &&
      hasMove(analysis, SpatialMoveType.Progression) &&
      !hasMove(analysis, SpatialMoveType.DirectVerticalAttack)
    ) {
      suggestions.push("Test one more supported line-breaking action when the first progression opens depth.");
    }
  }

  if (analysis.tacticalStyle === TacticalStyle.Control) {
    if (analysis.finishingOpportunities > 0 && analysis.scoringEvents === 0) {
      suggestions.push("Improve Playmaker or Space Hunter finishing execution.");
    }

    if (analysis.averageConversionQuality !== null && analysis.averageConversionQuality >= 70 && analysis.scoringEvents === 0) {
      suggestions.push("Keep creating clean windows; review defensive recovery load before changing the attacking plan.");
    }

    if (hasMove(analysis, SpatialMoveType.LateralCirculation) && analysis.highDangerLowScoringThreat > 0) {
      suggestions.push("Test a small verticality increase once the block is stretched.");
    }

    if (analysis.redZoneLateralDelays > 0 || analysis.legalFinishingOptionsIgnored > 0) {
      suggestions.push("Trigger drops earlier when scoring danger is HIGH.");
    }

    if (analysis.averageSupportQuality !== null && analysis.averageSupportQuality >= 80) {
      suggestions.push("Keep the support structure, but trigger finishing earlier when scoring danger is HIGH.");
    }
  }

  if (analysis.tacticalStyle === TacticalStyle.Fortress) {
    suggestions.push("Test a slightly higher block height only when possession is stable.");
  }

  if (analysis.tacticalStyle === TacticalStyle.ChaosHunters) {
    suggestions.push("Test lower risk after turnovers to reduce self-inflicted chaos.");
  }

  if (analysis.buildUpFailures > 0 && analysis.averageBuildUpResistance !== null) {
    suggestions.push("Improve Tempo Half or Hook Link intelligence for pressure resistance.");
  }

  if (analysis.transitionFailures > analysis.transitionSuccesses && analysis.transitionFailures > 0) {
    suggestions.push("Improve Space Hunter support timing before committing to depth.");
  }

  if (analysis.highTransitionDangerStabilized > 0) {
    suggestions.push("Ask transition carriers to attack forward unless Mobile Lock or Free Safety coverage is clearly present.");
  }

  if (analysis.finalRecoverySaturationScore >= 56) {
    suggestions.push("Lower repeated emergency defending load by reducing press exposure or protecting depth earlier.");
  }

  return [...new Set(suggestions)].slice(0, 5);
}
