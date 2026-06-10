import type { PrototypeTeamDefinition } from "../../data/prototypeTeams";
import { OffensiveProgressionPhilosophy, TacticalStyle } from "../../models/tactics";
import { SpatialMoveType } from "../../systems/spatial/intention/types";
import type { MiniMatchState } from "../../simulation/miniMatch";
import { analyzeFailureCauses } from "./analyzeFailureCauses";
import { analyzeSuccessCauses } from "./analyzeSuccessCauses";
import { analyzeTeamPatterns } from "./analyzeTeamPatterns";
import { suggestTacticalAdjustments } from "./suggestTacticalAdjustments";
import type { CoachingFeedbackReport, CoachingTeamFeedback, TeamPatternAnalysis } from "./types";

function describeIdentity(analysis: TeamPatternAnalysis): readonly string[] {
  const base =
    analysis.tacticalStyle === TacticalStyle.Control
      ? "Patient possession team."
      : analysis.tacticalStyle === TacticalStyle.Blitz
        ? "High-risk vertical pressing team."
        : analysis.tacticalStyle === TacticalStyle.Fortress
          ? "Compact defensive survival team."
          : analysis.tacticalStyle === TacticalStyle.ChaosHunters
            ? "Volatile disruption team."
            : "Custom tactical identity.";
  const moveLine =
    analysis.movePatterns.length === 0
      ? "No dominant possession move was observed."
      : `Frequently selected ${analysis.movePatterns
          .slice(0, 2)
          .map((pattern) => pattern.moveType)
          .join(" / ")}.`;

  const philosophyLine = `Progression philosophy observed: ${analysis.offensiveProgressionPhilosophy}.`;

  return [base, philosophyLine, moveLine];
}

function describePhilosophyEffectiveness(analysis: TeamPatternAnalysis): string {
  switch (analysis.offensiveProgressionPhilosophy) {
    case OffensiveProgressionPhilosophy.CollectiveStructuredProgression:
      return analysis.movePatterns.some((pattern) => pattern.moveType === SpatialMoveType.Progression)
        ? "Structured progression appeared through controlled forward steps after support was established."
        : "Structured progression was underused; possession leaned toward circulation without enough zone gain.";
    case OffensiveProgressionPhilosophy.LongPlayLineBreaking:
      return analysis.movePatterns.some((pattern) => pattern.moveType === SpatialMoveType.DirectVerticalAttack)
        ? "Line-breaking long play created fast territorial jumps, with support quality deciding whether the attack stayed alive."
        : "Line-breaking intent appeared mostly as progression rather than full long-play rupture.";
    case OffensiveProgressionPhilosophy.IndividualRupture:
      return "Individual rupture should create volatile gains and turnovers; use a larger sample to judge stability.";
    case OffensiveProgressionPhilosophy.TerritorialSurvival:
      return "Territorial survival should lower event volume and protect field position.";
  }
}

function fallbackWorked(team: PrototypeTeamDefinition): string {
  return `${team.displayName} showed its ${team.identity} identity without one decisive repeated success.`;
}

function fallbackFailed(team: PrototypeTeamDefinition): string {
  return `${team.displayName} did not expose a major failure pattern in this short mini-match sample.`;
}

function createTeamFeedback(state: MiniMatchState, team: PrototypeTeamDefinition): CoachingTeamFeedback {
  const analysis = analyzeTeamPatterns(state, team);
  const worked = analyzeSuccessCauses(analysis).map((cause) => cause.text);
  const failed = analyzeFailureCauses(analysis).map((cause) => cause.text);
  const levers = suggestTacticalAdjustments(analysis);
  const why = [
    `Tactical settings observed: risk ${team.tacticalInstructions.offensive.riskLevel}, verticality ${team.tacticalInstructions.offensive.verticality}, collectiveness ${team.tacticalInstructions.offensive.collectiveness}.`,
    describePhilosophyEffectiveness(analysis),
    `Collective base observed: cohesion ${team.collectiveProperties.cohesion}, tactical discipline ${team.collectiveProperties.tacticalDiscipline}.`,
    analysis.averageSupportQuality === null
      ? null
      : `Average support quality observed: ${analysis.averageSupportQuality}.`,
    analysis.averagePressingCapability === null
      ? null
      : `Average pressing capability observed: ${analysis.averagePressingCapability}.`,
    analysis.averageBuildUpResistance === null
      ? null
      : `Average build-up resistance observed: ${analysis.averageBuildUpResistance}.`,
    analysis.averageTerritorialPressure === null
      ? null
      : `Mini-match territorial pressure context averaged ${analysis.averageTerritorialPressure}.`,
    analysis.averageConversionQuality === null
      ? null
      : `Average finishing quality observed: ${analysis.averageConversionQuality}.`,
    analysis.finishingStyles.length === 0
      ? null
      : `Finishing identity observed: ${[...new Set(analysis.finishingStyles)].join(" / ")}.`,
    analysis.finishingContexts.length === 0
      ? null
      : `Finishing contexts observed: ${[...new Set(analysis.finishingContexts)].join(" / ")}.`,
    `Offensive momentum ended ${analysis.finalOffensiveMomentumLevel} (${analysis.finalOffensiveMomentumScore}).`,
    `Recovery saturation ended ${analysis.finalRecoverySaturationLevel} (${analysis.finalRecoverySaturationScore}).`,
    analysis.chaoticAdvantagesCreated > 0
      ? `Chaotic attacking advantage created ${analysis.chaoticAdvantagesCreated} time(s); check whether the team converted the retained advantage.`
      : null,
    analysis.dangerPhasesResolved > 0
      ? `Danger phase reached ${analysis.dangerPhasesResolved} time(s), forcing visible finishing or defensive resolution.`
      : null,
    analysis.finishingOpportunities > 0 && analysis.scoringEvents === 0
      ? "The team created finishing states but did not convert; tactical choice and technical execution should be reviewed separately."
      : null,
  ].filter((line) => line !== null);

  return {
    teamId: team.id,
    teamName: team.displayName,
    observedIdentity: describeIdentity(analysis),
    worked: worked.length === 0 ? [fallbackWorked(team)] : worked,
    failed: failed.length === 0 ? [fallbackFailed(team)] : failed,
    why,
    levers: levers.length === 0 ? ["Keep the current tactical settings and gather a larger sample."] : levers,
  };
}

export function generateCoachingFeedback(state: MiniMatchState): CoachingFeedbackReport {
  return {
    teams: [
      createTeamFeedback(state, state.context.teamA),
      createTeamFeedback(state, state.context.teamB),
    ],
  };
}
