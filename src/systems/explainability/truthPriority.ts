import type { TacticalLogLine } from "../interactions/shared";
import { createLogLine } from "../interactions/shared";
import type { PlayerDerivedNumericalPressure } from "../players";
import { ChaosAdvantage } from "../chaos";
import type { ChaosAdvantageEvaluation } from "../chaos";
import { NumericalPressureAdvantage, type NumericalPressureEvaluation } from "../structure/numericalPressure";
import { TACTICAL_REPORT_MODE, TacticalReportMode } from "../../config/debug";

export enum TacticalTruthSource {
  Narrative = "NARRATIVE",
  Estimated = "ESTIMATED",
  Calculated = "CALCULATED",
  CalculatedFromPlayers = "CALCULATED_FROM_PLAYERS",
}

export const TACTICAL_TRUTH_PRIORITY: Record<TacticalTruthSource, number> = {
  [TacticalTruthSource.Narrative]: 1,
  [TacticalTruthSource.Estimated]: 2,
  [TacticalTruthSource.Calculated]: 3,
  [TacticalTruthSource.CalculatedFromPlayers]: 4,
};

export enum NumericalTruthAdvantage {
  Attack = "ATTACK",
  Defense = "DEFENSE",
  Balanced = "BALANCED",
}

export interface NumericalTruthComparison {
  readonly playerAdvantage: NumericalTruthAdvantage;
  readonly estimatedAdvantage: NumericalTruthAdvantage;
  readonly contradiction: boolean;
  readonly authoritativeDescription: string;
  readonly warning: string | null;
}

function playerNumericalAdvantage(numerical: PlayerDerivedNumericalPressure): NumericalTruthAdvantage {
  const margin = numerical.attackersNearBall.length - numerical.defendersGoalSide.length;

  if (margin > 0) {
    return NumericalTruthAdvantage.Attack;
  }

  if (margin < 0) {
    return NumericalTruthAdvantage.Defense;
  }

  return NumericalTruthAdvantage.Balanced;
}

function estimatedNumericalAdvantage(evaluation: NumericalPressureEvaluation): NumericalTruthAdvantage {
  switch (evaluation.advantage) {
    case NumericalPressureAdvantage.Attack:
      return NumericalTruthAdvantage.Attack;
    case NumericalPressureAdvantage.Defense:
      return NumericalTruthAdvantage.Defense;
    case NumericalPressureAdvantage.Balanced:
      return NumericalTruthAdvantage.Balanced;
  }
}

export function compareNumericalPressureTruth(input: {
  readonly attackingTeamName: string;
  readonly estimated: NumericalPressureEvaluation;
  readonly playerDerived: PlayerDerivedNumericalPressure;
}): NumericalTruthComparison {
  const playerAdvantage = playerNumericalAdvantage(input.playerDerived);
  const estimatedAdvantage = estimatedNumericalAdvantage(input.estimated);
  const contradiction =
    (playerAdvantage === NumericalTruthAdvantage.Attack && estimatedAdvantage === NumericalTruthAdvantage.Defense) ||
    (playerAdvantage === NumericalTruthAdvantage.Defense && estimatedAdvantage === NumericalTruthAdvantage.Attack);
  const authoritativeDescription = `${input.attackingTeamName} ${input.playerDerived.description}`;

  return {
    playerAdvantage,
    estimatedAdvantage,
    contradiction,
    authoritativeDescription,
    warning: contradiction
      ? `estimated numerical pressure contradicted player-derived pressure (${input.playerDerived.description}); player-derived value used`
      : null,
  };
}

export function hasPlayerDerivedLineBypass(numerical: PlayerDerivedNumericalPressure): boolean {
  return numerical.bypassedDefenders.length > 0;
}

export function getPlayerDerivedDelayedDefenderCount(numerical: PlayerDerivedNumericalPressure): number {
  return numerical.delayedDefenders.length;
}

export function createTruthWarningLogs(warnings: readonly (string | null)[]): readonly TacticalLogLine[] {
  if (TACTICAL_REPORT_MODE === TacticalReportMode.CoachReadable) {
    return [];
  }

  return warnings.flatMap((warning) =>
    warning === null ? [] : [createLogLine(`Report truth warning: ${warning}.`)],
  );
}

export function getChaosNumericalInterpretation(input: {
  readonly attackingTeamName: string;
  readonly chaos: ChaosAdvantageEvaluation;
  readonly playerDerived: PlayerDerivedNumericalPressure;
}): {
  readonly playerAdvantage: NumericalTruthAdvantage;
  readonly contradiction: boolean;
  readonly interpretation: string;
  readonly warning: string | null;
} {
  const playerAdvantage = playerNumericalAdvantage(input.playerDerived);
  const supportsAttack =
    input.chaos.advantage === ChaosAdvantage.AttackingAdvantage &&
    playerAdvantage === NumericalTruthAdvantage.Attack;
  const contradictsAttack =
    input.chaos.advantage === ChaosAdvantage.AttackingAdvantage &&
    playerAdvantage === NumericalTruthAdvantage.Defense;
  const interpretation =
    supportsAttack
      ? "chaos and player-derived numbers both support a clean attacking advantage"
      : contradictsAttack
        ? "chaos creates danger but not a clean numerical advantage"
        : input.chaos.advantage === ChaosAdvantage.DefensiveAdvantage &&
            playerAdvantage === NumericalTruthAdvantage.Attack
          ? "chaos favors the defense despite player-derived attacking numbers"
          : "chaos context and player-derived numbers are not directly contradictory";

  return {
    playerAdvantage,
    contradiction: contradictsAttack,
    interpretation,
    warning: contradictsAttack
      ? `chaos favors attack while player-derived numerical pressure says ${input.playerDerived.description}`
      : null,
  };
}

export function describeChaosNumericalSupport(input: {
  readonly attackingTeamName: string;
  readonly chaos: ChaosAdvantageEvaluation;
  readonly playerDerived: PlayerDerivedNumericalPressure;
}): readonly TacticalLogLine[] {
  const interpretation = getChaosNumericalInterpretation(input);

  return [
    ...(TACTICAL_REPORT_MODE === TacticalReportMode.CoachReadable
      ? []
      : [createLogLine(`- player-derived numerical pressure: ${input.attackingTeamName} ${input.playerDerived.description}`)]),
    createLogLine(`- final interpretation: ${interpretation.interpretation}.`),
    ...createTruthWarningLogs([interpretation.warning]),
  ];
}

export function getTacticalReportMode(): TacticalReportMode {
  return TACTICAL_REPORT_MODE;
}

export { TacticalReportMode };
