import { TacticalStyle } from "../../../models/tactics";
import type { SpatialTeamContext } from "../../spatial";
import { ConversionIdentity, type FinishingStyleEvaluation } from "./types";

export function evaluateFinishingStyle(team: SpatialTeamContext): FinishingStyleEvaluation {
  switch (team.tacticalStyle) {
    case TacticalStyle.Control:
      return {
        identity: ConversionIdentity.ControlledExecution,
        executionModifier: 6,
        composureModifier: 10,
        reboundModifier: -4,
        varianceModifier: -8,
        description: "cleaner finishing, lower variance, prefers high-quality windows",
      };
    case TacticalStyle.Blitz:
      return {
        identity: ConversionIdentity.ChaoticAggression,
        executionModifier: 2,
        composureModifier: -6,
        reboundModifier: 12,
        varianceModifier: 14,
        description: "explosive finishing, higher rebound danger, imperfect execution",
      };
    case TacticalStyle.ChaosHunters:
      return {
        identity: ConversionIdentity.UnstableGenius,
        executionModifier: 4,
        composureModifier: -12,
        reboundModifier: 16,
        varianceModifier: 20,
        description: "volatile finishing with brilliant and wasteful extremes",
      };
    case TacticalStyle.Fortress:
    case TacticalStyle.Custom:
      return {
        identity: ConversionIdentity.TerritorialSafety,
        executionModifier: -2,
        composureModifier: 4,
        reboundModifier: -6,
        varianceModifier: -10,
        description: "safer finishing choices, lower event volume",
      };
  }
}
