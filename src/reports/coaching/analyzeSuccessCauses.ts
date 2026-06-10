import { OffensiveProgressionPhilosophy, TacticalStyle } from "../../models/tactics";
import { SpatialMoveType } from "../../systems/spatial/intention/types";
import type { CoachingCause, TeamPatternAnalysis } from "./types";

function getMostUsedMove(analysis: TeamPatternAnalysis): string | null {
  const sorted = [...analysis.movePatterns].sort((left, right) => right.count - left.count);

  return sorted[0] === undefined ? null : sorted[0].moveType;
}

export function analyzeSuccessCauses(analysis: TeamPatternAnalysis): readonly CoachingCause[] {
  const causes: CoachingCause[] = [];
  const mostUsedMove = getMostUsedMove(analysis);
  const strongestMemory = [...analysis.memoryPatterns].sort(
    (left, right) => right.successes - left.successes,
  )[0];

  if (analysis.buildUpSuccesses > 0 && analysis.averageBuildUpResistance !== null) {
    causes.push({
      text: `${analysis.teamName} resisted or escaped pressure ${analysis.buildUpSuccesses} time${analysis.buildUpSuccesses === 1 ? "" : "s"} with build-up resistance around ${analysis.averageBuildUpResistance}.`,
    });
  }

  if (analysis.pressingSequences > 0 && analysis.averagePressingCapability !== null) {
    causes.push({
      text: `${analysis.teamName} applied pressure ${analysis.pressingSequences} time${analysis.pressingSequences === 1 ? "" : "s"} with pressing capability around ${analysis.averagePressingCapability}.`,
    });
  }

  if (analysis.transitionSuccesses > 0) {
    causes.push({
      text: `${analysis.teamName} converted unstable moments into ${analysis.transitionSuccesses} useful transition${analysis.transitionSuccesses === 1 ? "" : "s"}.`,
    });
  }

  if (analysis.averageConversionQuality !== null && analysis.scoringEvents > 0) {
    causes.push({
      text: `${analysis.teamName} converted danger with average finishing quality around ${analysis.averageConversionQuality}.`,
    });
  }

  if (analysis.reboundOrScrambleOutcomes > 0) {
    causes.push({
      text: `${analysis.teamName} created ${analysis.reboundOrScrambleOutcomes} rebound or scramble finishing outcome${analysis.reboundOrScrambleOutcomes === 1 ? "" : "s"}.`,
    });
  }

  if (analysis.secondChancePhases > 0) {
    causes.push({
      text: `${analysis.teamName} generated ${analysis.secondChancePhases} second-chance attacking phase${analysis.secondChancePhases === 1 ? "" : "s"}.`,
    });
  }

  if (strongestMemory !== undefined && strongestMemory.successes > 0) {
    causes.push({
      text: `${analysis.teamName} repeatedly found ${strongestMemory.moveType} on ${strongestMemory.sideType}.`,
    });
  } else if (mostUsedMove !== null) {
    causes.push({
      text: `${analysis.teamName} most often selected ${mostUsedMove}, matching its observed tactical rhythm.`,
    });
  }

  if (
    analysis.tacticalStyle === TacticalStyle.Control &&
    analysis.movePatterns.some((pattern) => pattern.moveType === SpatialMoveType.LateralCirculation)
  ) {
    causes.push({
      text: `${analysis.teamName} used circulation to stretch the defensive block and keep possessions readable.`,
    });
  }

  if (
    analysis.offensiveProgressionPhilosophy === OffensiveProgressionPhilosophy.CollectiveStructuredProgression &&
    analysis.movePatterns.some((pattern) => pattern.moveType === SpatialMoveType.Progression)
  ) {
    causes.push({
      text: `${analysis.teamName} used structured progression to gain territory without abandoning support.`,
    });
  }

  if (
    analysis.offensiveProgressionPhilosophy === OffensiveProgressionPhilosophy.LongPlayLineBreaking &&
    (analysis.movePatterns.some((pattern) => pattern.moveType === SpatialMoveType.DirectVerticalAttack) ||
      analysis.movePatterns.some((pattern) => pattern.moveType === SpatialMoveType.Progression))
  ) {
    causes.push({
      text: `${analysis.teamName} used line-breaking progression to create faster territorial jumps.`,
    });
  }

  return causes.slice(0, 5);
}
