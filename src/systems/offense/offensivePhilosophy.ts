import { OffensiveProgressionPhilosophy, TacticalStyle } from "../../models/tactics";

export function getOffensiveProgressionPhilosophy(
  tacticalStyle: TacticalStyle,
): OffensiveProgressionPhilosophy {
  switch (tacticalStyle) {
    case TacticalStyle.Control:
      return OffensiveProgressionPhilosophy.CollectiveStructuredProgression;
    case TacticalStyle.Blitz:
      return OffensiveProgressionPhilosophy.LongPlayLineBreaking;
    case TacticalStyle.ChaosHunters:
      return OffensiveProgressionPhilosophy.IndividualRupture;
    case TacticalStyle.Fortress:
      return OffensiveProgressionPhilosophy.TerritorialSurvival;
    case TacticalStyle.Custom:
      return OffensiveProgressionPhilosophy.CollectiveStructuredProgression;
  }
}
