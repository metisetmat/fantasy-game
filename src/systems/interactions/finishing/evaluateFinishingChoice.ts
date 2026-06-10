import type { ZoneId } from "../../../core/zones";
import { ScoringType } from "../../../models/scoring";
import { PlayerRole } from "../../../models/player";
import type { SpatialTeamContext, WeakSideEvaluation } from "../../spatial";
import { AttackingDirection } from "../../spatial/intention";
import { UtilityActionType, selectUtilityRole } from "../../ai/utility";
import { evaluateFinishingOptions } from "./evaluateFinishingOptions";
import { FinishingDecision, type FinishingChoiceEvaluation, type FinishingDangerLevel } from "./types";

function selectFinisherRole(team: SpatialTeamContext, decision: FinishingDecision): PlayerRole {
  const eligiblePlayers = team.players.filter((player) => player.role !== PlayerRole.GoalkeeperFreeSafety);
  const actions =
    decision === FinishingDecision.DropAttempt
      ? [UtilityActionType.DropAttempt, UtilityActionType.Kick]
      : decision === FinishingDecision.GoalAttempt
        ? [UtilityActionType.GoalAttempt, UtilityActionType.Kick]
        : [UtilityActionType.AttackSpace, UtilityActionType.Carry, UtilityActionType.ContestLooseBall];

  return selectUtilityRole({
    players: eligiblePlayers.length > 0 ? eligiblePlayers : team.players,
    actions,
    tacticalStyle: team.tacticalStyle,
    spatialAffordance: team.offensiveMomentum.score,
    tacticalIntent: decision === FinishingDecision.TryAttempt ? team.tacticalInstructions.offensive.verticality : 72,
    pressure: 62,
    risk: team.tacticalInstructions.offensive.riskLevel,
    cohesion: team.collectiveProperties.cohesion,
  });
}

export interface FinishingChoiceInput {
  readonly offensiveTeam: SpatialTeamContext;
  readonly activeZone: ZoneId;
  readonly dangerLevel: FinishingDangerLevel;
  readonly territorialPressure: number;
  readonly weakSide: WeakSideEvaluation;
  readonly attackingDirection: AttackingDirection;
  readonly allowedScoringTypes?: readonly ScoringType[];
}

export function evaluateFinishingChoice(input: FinishingChoiceInput): FinishingChoiceEvaluation {
  const options = evaluateFinishingOptions(input);
  const selected = options.find((option) => option.isLegal && option.finalScore !== null);
  const decision = selected?.decision ?? FinishingDecision.DropAttempt;
  const scoringType = selected?.scoringType ?? ScoringType.Drop;

  return {
    decision,
    scoringType,
    choiceConfidence: selected?.finalScore ?? 0,
    primaryFinisherRole: selectFinisherRole(input.offensiveTeam, decision),
    breakdown: options.map((option) => ({
      label: option.label,
      value: option.finalScore ?? 0,
    })),
    options,
  };
}
