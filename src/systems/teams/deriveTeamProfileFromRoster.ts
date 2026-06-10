import type { CollectiveProperties, TacticalInstructions } from "../../models/tactics";
import type { DerivedPlayerAttributes, VisiblePlayerAttributes } from "../players";

export interface DerivedTeamProfileFromRoster {
  readonly collectiveness: number;
  readonly cohesion: number;
  readonly tacticalDiscipline: number;
  readonly supportQuality: number;
  readonly buildUpResistance: number;
  readonly defensiveCompactness: number;
  readonly recoveryStructure: number;
  readonly verticality: number;
  readonly riskProfile: number;
  readonly chaosTolerance: number;
  readonly finishingIdentity: "CONTROLLED_EXECUTION" | "CHAOTIC_AGGRESSION";
}

export interface TeamAggregateTraceEntry {
  readonly label: string;
  readonly value: number;
  readonly playerContributions: readonly string[];
  readonly formula: string;
}

export interface DerivedTeamProfileTrace {
  readonly profile: DerivedTeamProfileFromRoster;
  readonly traces: readonly TeamAggregateTraceEntry[];
}

export interface RosterPlayerForTeamProfile {
  readonly initials: string;
  readonly visibleAttributes: VisiblePlayerAttributes;
  readonly derivedAttributes: DerivedPlayerAttributes;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : values.reduce((total, value) => total + value, 0) / values.length;
}

function topContributions(
  roster: readonly RosterPlayerForTeamProfile[],
  selector: (player: RosterPlayerForTeamProfile) => number,
  count = 4,
): readonly string[] {
  return [...roster]
    .sort((left, right) => selector(right) - selector(left))
    .slice(0, count)
    .map((player) => `${player.initials} ${selector(player)}`);
}

export function deriveTeamProfileTraceFromRoster(input: {
  readonly roster: readonly RosterPlayerForTeamProfile[];
  readonly instructions: TacticalInstructions;
  readonly baseCollective: CollectiveProperties;
  readonly finishingIdentity: "CONTROLLED_EXECUTION" | "CHAOTIC_AGGRESSION";
}): DerivedTeamProfileTrace {
  const derived = input.roster.map((player) => player.derivedAttributes);
  const visible = input.roster.map((player) => player.visibleAttributes);

  const averageSupportTiming = average(derived.map((player) => player.supportTiming));
  const averageSpacingQuality = average(derived.map((player) => player.spacingQuality));
  const averageTacticalDiscipline = average(derived.map((player) => player.tacticalDiscipline));
  const averageBallSecurity = average(derived.map((player) => player.ballSecurity));
  const averageComposure = average(visible.map((player) => player.composure));
  const averageRestDefense = average(derived.map((player) => player.restDefenseReliability));
  const averageRecoveryRange = average(derived.map((player) => player.recoveryRange));
  const averageEndurance = average(visible.map((player) => player.endurance));
  const averageLongPlay = average(derived.map((player) => player.longPlayQuality));
  const averageCreativity = average(visible.map((player) => player.creativity));
  const averageChaosCreation = average(derived.map((player) => player.chaosCreation));
  const profile: DerivedTeamProfileFromRoster = {
    collectiveness: clamp(averageSupportTiming * 0.55 + input.instructions.offensive.collectiveness * 0.45 + 4),
    cohesion: clamp(averageSpacingQuality * 0.55 + input.baseCollective.cohesion * 0.45 + 5),
    tacticalDiscipline: clamp(averageTacticalDiscipline * 0.68 + input.baseCollective.tacticalDiscipline * 0.32 + 7),
    supportQuality: clamp(averageSupportTiming * 0.55 + averageBallSecurity * 0.25 + 20),
    buildUpResistance: clamp(averageBallSecurity * 0.42 + averageSupportTiming * 0.3 + averageComposure * 0.18 + 8),
    defensiveCompactness: clamp(averageRestDefense * 0.52 + averageTacticalDiscipline * 0.28 + 10),
    recoveryStructure: clamp(averageRecoveryRange * 0.42 + averageEndurance * 0.28 + input.baseCollective.defensiveTransition * 0.18 + 8),
    verticality: clamp(input.instructions.offensive.verticality * 0.72 + averageLongPlay * 0.18),
    riskProfile: clamp(input.instructions.offensive.riskLevel * 0.75 + averageCreativity * 0.16),
    chaosTolerance: clamp(averageChaosCreation * 0.5 + averageComposure * 0.2),
    finishingIdentity: input.finishingIdentity,
  };

  return {
    profile,
    traces: [
      {
        label: "support quality",
        value: profile.supportQuality,
        playerContributions: [
          ...topContributions(input.roster, (player) => player.derivedAttributes.supportTiming, 3).map(
            (entry) => `${entry} supportTiming`,
          ),
          ...topContributions(input.roster, (player) => player.derivedAttributes.ballSecurity, 2).map(
            (entry) => `${entry} ballSecurity`,
          ),
        ],
        formula: `avg supportTiming ${Math.round(averageSupportTiming)} * 0.55 + avg ballSecurity ${Math.round(averageBallSecurity)} * 0.25 + 20`,
      },
      {
        label: "build-up resistance",
        value: profile.buildUpResistance,
        playerContributions: [
          ...topContributions(input.roster, (player) => player.derivedAttributes.ballSecurity, 3).map(
            (entry) => `${entry} ballSecurity`,
          ),
          ...topContributions(input.roster, (player) => player.visibleAttributes.composure, 2).map(
            (entry) => `${entry} Composure`,
          ),
        ],
        formula: `avg ballSecurity ${Math.round(averageBallSecurity)} * 0.42 + avg supportTiming ${Math.round(averageSupportTiming)} * 0.30 + avg composure ${Math.round(averageComposure)} * 0.18 + 8`,
      },
      {
        label: "defensive compactness",
        value: profile.defensiveCompactness,
        playerContributions: [
          ...topContributions(input.roster, (player) => player.derivedAttributes.restDefenseReliability, 3).map(
            (entry) => `${entry} restDefenseReliability`,
          ),
          ...topContributions(input.roster, (player) => player.derivedAttributes.tacticalDiscipline, 2).map(
            (entry) => `${entry} tacticalDiscipline`,
          ),
        ],
        formula: `avg restDefenseReliability ${Math.round(averageRestDefense)} * 0.52 + avg tacticalDiscipline ${Math.round(averageTacticalDiscipline)} * 0.28 + 10`,
      },
      {
        label: "recovery structure",
        value: profile.recoveryStructure,
        playerContributions: [
          ...topContributions(input.roster, (player) => player.derivedAttributes.recoveryRange, 3).map(
            (entry) => `${entry} recoveryRange`,
          ),
          ...topContributions(input.roster, (player) => player.visibleAttributes.endurance, 2).map(
            (entry) => `${entry} Endurance`,
          ),
        ],
        formula: `avg recoveryRange ${Math.round(averageRecoveryRange)} * 0.42 + avg endurance ${Math.round(averageEndurance)} * 0.28 + defensive transition ${input.baseCollective.defensiveTransition} * 0.18 + 8`,
      },
    ],
  };
}

export function deriveTeamProfileFromRoster(input: {
  readonly roster: readonly RosterPlayerForTeamProfile[];
  readonly instructions: TacticalInstructions;
  readonly baseCollective: CollectiveProperties;
  readonly finishingIdentity: "CONTROLLED_EXECUTION" | "CHAOTIC_AGGRESSION";
}): DerivedTeamProfileFromRoster {
  return deriveTeamProfileTraceFromRoster(input).profile;
}
