import type { TacticalLogLine } from "../interactions/shared";
import { createLogLine } from "../interactions/shared";
import {
  describeChaosNumericalSupport,
  explainabilityLogs,
  getChaosNumericalInterpretation,
  getTacticalReportMode,
  TacticalReportMode,
} from "../explainability";
import type { PlayerDerivedNumericalPressure } from "../players";
import { ChaosAdvantage } from "./types";
import type { ChaosAdvantageEvaluation } from "./types";

export function createChaosAdvantageLogs(
  evaluation: ChaosAdvantageEvaluation,
  playerContext?: {
    readonly attackingTeamName: string;
    readonly playerDerivedNumericalPressure: PlayerDerivedNumericalPressure;
  },
): readonly TacticalLogLine[] {
  const mode = getTacticalReportMode();

  if (playerContext !== undefined && mode !== TacticalReportMode.DeepDebug) {
    const interpretation = getChaosNumericalInterpretation({
      attackingTeamName: playerContext.attackingTeamName,
      chaos: evaluation,
      playerDerived: playerContext.playerDerivedNumericalPressure,
    });

    return explainabilityLogs([
      createLogLine("Chaos context:"),
      createLogLine(`- final interpretation: ${interpretation.interpretation}.`),
      ...(mode === TacticalReportMode.Debug && interpretation.warning !== null
        ? [createLogLine(`Report truth warning: ${interpretation.warning}.`)]
        : []),
      createLogLine(`Chaos advantage: ${evaluation.advantage}.`),
    ]);
  }

  return [
    ...explainabilityLogs([
      createLogLine("Chaos context:"),
      createLogLine(`- chaos advantage score: ${evaluation.score} / 100`),
      createLogLine(`- attacking chaos advantage: ${evaluation.score} / 100`),
      createLogLine(`- defensive chaos control: ${100 - evaluation.score} / 100`),
      ...evaluation.reasons.map((reason) => createLogLine(`- ${reason}`)),
      createLogLine(
        evaluation.advantage === ChaosAdvantage.AttackingAdvantage
          ? "[ESTIMATED] Result: chaos favors the attack."
          : evaluation.advantage === ChaosAdvantage.DefensiveAdvantage
            ? "[ESTIMATED] Result: chaos favors the defense."
            : "[ESTIMATED] Result: chaos remains neutral.",
      ),
      ...(playerContext === undefined
        ? []
        : describeChaosNumericalSupport({
            attackingTeamName: playerContext.attackingTeamName,
            chaos: evaluation,
            playerDerived: playerContext.playerDerivedNumericalPressure,
          })),
    ]),
    createLogLine(`Chaos advantage: ${evaluation.advantage}.`),
  ];
}
