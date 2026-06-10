import type { TacticalLogLine } from "../../interactions/shared";
import { createLogLine } from "../../interactions/shared";
import {
  compareNumericalPressureTruth,
  createTruthWarningLogs,
  explainabilityLogs,
  getTacticalReportMode,
  TacticalReportMode,
  type NumericalTruthComparison,
} from "../../explainability";
import type { PlayerDerivedNumericalPressure } from "../../players";
import type { NumericalPressureEvaluation } from "./types";

function createPlayerAuthoritativeNumericalLogs(input: {
  readonly teamName: string;
  readonly comparison: NumericalTruthComparison;
  readonly estimated: NumericalPressureEvaluation;
}): readonly TacticalLogLine[] {
  const mode = getTacticalReportMode();

  if (mode === TacticalReportMode.DeepDebug) {
    return [
      createLogLine(`- [ESTIMATED] attackers near ball: ${input.estimated.attackersNearBall}`),
      createLogLine(`- [ESTIMATED] defenders goal-side: ${input.estimated.defendersGoalSide}`),
      createLogLine(`- [ESTIMATED] support arrivals: +${input.estimated.supportArrivals}`),
      createLogLine(`- [ESTIMATED] delayed/eliminated defenders: ${input.estimated.delayedDefenders}`),
      createLogLine(`- [ESTIMATED] result: ${input.teamName} ${input.estimated.description}`),
      createLogLine(`- [CALCULATED FROM PLAYERS] result: ${input.comparison.authoritativeDescription}`),
      createLogLine("- truth priority: CALCULATED_FROM_PLAYERS overrides ESTIMATED for report interpretation"),
      ...createTruthWarningLogs([input.comparison.warning]),
    ];
  }

  return [
    createLogLine("Player-derived numerical pressure:"),
    createLogLine(`- final result: ${input.comparison.authoritativeDescription}.`),
    ...createTruthWarningLogs([input.comparison.warning]),
  ];
}

export function createNumericalPressureLogs(input: {
  readonly teamName: string;
  readonly defendingTeamName: string;
  readonly evaluation: NumericalPressureEvaluation;
  readonly playerDerivedNumericalPressure?: PlayerDerivedNumericalPressure;
}): readonly TacticalLogLine[] {
  if (input.playerDerivedNumericalPressure !== undefined) {
    const comparison = compareNumericalPressureTruth({
      attackingTeamName: input.teamName,
      estimated: input.evaluation,
      playerDerived: input.playerDerivedNumericalPressure,
    });

    return explainabilityLogs([
      createLogLine("### Shared Tactical Context"),
      createLogLine("Numerical pressure:"),
      ...createPlayerAuthoritativeNumericalLogs({
        teamName: input.teamName,
        comparison,
        estimated: input.evaluation,
      }),
    ]);
  }

  return explainabilityLogs([
    createLogLine("### Shared Tactical Context"),
    createLogLine("Numerical pressure:"),
    createLogLine(`- [ESTIMATED] ${input.teamName} attackers near ball: ${input.evaluation.attackersNearBall}`),
    createLogLine(`- [ESTIMATED] ${input.defendingTeamName} defenders goal-side: ${input.evaluation.defendersGoalSide}`),
    createLogLine(`- [ESTIMATED] support arrivals: ${input.teamName} +${input.evaluation.supportArrivals}`),
    createLogLine(`- [ESTIMATED] ${input.defendingTeamName} delayed/eliminated defenders: ${input.evaluation.delayedDefenders}`),
    createLogLine(`Result: ${input.teamName} ${input.evaluation.description}.`),
  ]);
}
