import {
  BallUsageStyle,
  MarkingStyle,
  OffensiveProgressionPhilosophy,
  TacticalStyle,
  type CollectiveProperties,
  type TacticalInstructions,
} from "../models/tactics";

export enum PrototypeTeamId {
  Control = "control",
  Blitz = "blitz",
  Fortress = "fortress",
  ChaosHunters = "chaos_hunters",
}

export interface PrototypeTeamDefinition {
  readonly id: PrototypeTeamId;
  readonly displayName: string;
  readonly tacticalStyle: TacticalStyle;
  readonly offensiveProgressionPhilosophy: OffensiveProgressionPhilosophy;
  readonly identity: string;
  readonly tacticalInstructions: TacticalInstructions;
  readonly collectiveProperties: CollectiveProperties;
  readonly strengths: readonly string[];
  readonly weaknesses: readonly string[];
}

export const PROTOTYPE_TEAMS: readonly PrototypeTeamDefinition[] = [
  {
    id: PrototypeTeamId.Control,
    displayName: "CONTROL",
    tacticalStyle: TacticalStyle.Control,
    offensiveProgressionPhilosophy: OffensiveProgressionPhilosophy.CollectiveStructuredProgression,
    identity: "possession and structure",
    tacticalInstructions: {
      defensive: {
        blockHeight: 50,
        pressingIntensity: 50,
        aggressiveness: 25,
        markingStyle: MarkingStyle.Zonal,
      },
      offensive: {
        ballUsage: BallUsageStyle.Balanced,
        riskLevel: 30,
        verticality: 36,
        collectiveness: 84,
      },
    },
    collectiveProperties: {
      cohesion: 90,
      offensiveTransition: 54,
      defensiveTransition: 75,
      collectiveMobility: 75,
      tacticalDiscipline: 90,
      collectiveReading: 80,
      resilience: 56,
      collectivePower: 44,
    },
    strengths: ["pressure resistance", "territorial control", "fatigue management"],
    weaknesses: ["limited explosiveness", "vulnerable to intense chaos"],
  },
  {
    id: PrototypeTeamId.Blitz,
    displayName: "BLITZ",
    tacticalStyle: TacticalStyle.Blitz,
    offensiveProgressionPhilosophy: OffensiveProgressionPhilosophy.LongPlayLineBreaking,
    identity: "transitions and pressing",
    tacticalInstructions: {
      defensive: {
        blockHeight: 75,
        pressingIntensity: 88,
        aggressiveness: 75,
        markingStyle: MarkingStyle.Hybrid,
      },
      offensive: {
        ballUsage: BallUsageStyle.FootOriented,
        riskLevel: 75,
        verticality: 88,
        collectiveness: 62,
      },
    },
    collectiveProperties: {
      cohesion: 58,
      offensiveTransition: 92,
      defensiveTransition: 54,
      collectiveMobility: 78,
      tacticalDiscipline: 50,
      collectiveReading: 62,
      resilience: 75,
      collectivePower: 50,
    },
    strengths: ["dangerous transitions", "high recoveries", "pressure generation"],
    weaknesses: ["fatigue accumulation", "structural instability"],
  },
  {
    id: PrototypeTeamId.Fortress,
    displayName: "FORTRESS",
    tacticalStyle: TacticalStyle.Fortress,
    offensiveProgressionPhilosophy: OffensiveProgressionPhilosophy.TerritorialSurvival,
    identity: "compact defense and resilience",
    tacticalInstructions: {
      defensive: {
        blockHeight: 25,
        pressingIntensity: 25,
        aggressiveness: 50,
        markingStyle: MarkingStyle.Zonal,
      },
      offensive: {
        ballUsage: BallUsageStyle.Balanced,
        riskLevel: 25,
        verticality: 40,
        collectiveness: 75,
      },
    },
    collectiveProperties: {
      cohesion: 75,
      offensiveTransition: 25,
      defensiveTransition: 75,
      collectiveMobility: 50,
      tacticalDiscipline: 90,
      collectiveReading: 50,
      resilience: 90,
      collectivePower: 75,
    },
    strengths: ["compact block", "defensive resistance", "axis protection"],
    weaknesses: ["low creativity", "weak transitions"],
  },
  {
    id: PrototypeTeamId.ChaosHunters,
    displayName: "CHAOS HUNTERS",
    tacticalStyle: TacticalStyle.ChaosHunters,
    offensiveProgressionPhilosophy: OffensiveProgressionPhilosophy.IndividualRupture,
    identity: "aggression and disruption",
    tacticalInstructions: {
      defensive: {
        blockHeight: 65,
        pressingIntensity: 75,
        aggressiveness: 90,
        markingStyle: MarkingStyle.ManOriented,
      },
      offensive: {
        ballUsage: BallUsageStyle.Unbalanced,
        riskLevel: 90,
        verticality: 75,
        collectiveness: 40,
      },
    },
    collectiveProperties: {
      cohesion: 25,
      offensiveTransition: 75,
      defensiveTransition: 40,
      collectiveMobility: 50,
      tacticalDiscipline: 25,
      collectiveReading: 40,
      resilience: 75,
      collectivePower: 75,
    },
    strengths: ["unpredictability", "chaos creation", "physical disruption"],
    weaknesses: ["structural instability", "tactical inconsistency"],
  },
];
