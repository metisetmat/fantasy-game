import type { PlayerRole, PlayerState } from "../../../models/player";
import type { TacticalStyle } from "../../../models/tactics";
import { UtilityActionType } from "./actionTypes";
import { scorePlayerBrain, type PlayerUtilityCandidate } from "./playerBrain";

export interface UtilityActorSelectionInput {
  readonly players: readonly PlayerState[];
  readonly actions: readonly UtilityActionType[];
  readonly tacticalStyle: TacticalStyle;
  readonly spatialAffordance: number;
  readonly tacticalIntent: number;
  readonly pressure: number;
  readonly risk: number;
  readonly cohesion: number;
}

export interface UtilityActorSelection {
  readonly selected: PlayerUtilityCandidate;
  readonly candidates: readonly PlayerUtilityCandidate[];
}

function clampUtility(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function estimatePerceptionForUtility(input: {
  readonly player: PlayerState;
  readonly pressure: number;
  readonly risk: number;
}): {
  readonly perceptionConfidence: number;
  readonly scanFreshnessTicks: number;
  readonly awarenessPressureRecognition: number;
} {
  const visible = input.player.visibleAttributes;
  const vision = visible?.vision ?? input.player.attributes.intelligence;
  const composure = visible?.composure ?? input.player.attributes.mental;
  const fatigue = input.player.fatigue.accumulatedFatigue;
  const perceptionConfidence = clampUtility(vision * 0.42 + composure * 0.32 + 24 - fatigue * 0.16 - input.pressure * 0.08);
  const scanFreshnessTicks = Math.max(0, Math.min(5, Math.round(5 - vision / 28 + input.pressure / 38 + input.risk / 55)));
  const awarenessPressureRecognition = clampUtility(perceptionConfidence * 0.68 + composure * 0.18 + (100 - scanFreshnessTicks * 12) * 0.14);

  return {
    perceptionConfidence,
    scanFreshnessTicks,
    awarenessPressureRecognition,
  };
}

function sortCandidates(candidates: readonly PlayerUtilityCandidate[]): readonly PlayerUtilityCandidate[] {
  return [...candidates].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return left.player.id.localeCompare(right.player.id);
  });
}

export function selectUtilityActor(input: UtilityActorSelectionInput): UtilityActorSelection {
  const candidates = sortCandidates(
    input.players.flatMap((player) => {
      const perception = estimatePerceptionForUtility({
        player,
        pressure: input.pressure,
        risk: input.risk,
      });

      return scorePlayerBrain({
        player,
        actions: input.actions,
        tacticalStyle: input.tacticalStyle,
        spatialAffordance: input.spatialAffordance,
        tacticalIntent: input.tacticalIntent,
        pressure: input.pressure,
        perceptionConfidence: perception.perceptionConfidence,
        scanFreshnessTicks: perception.scanFreshnessTicks,
        awarenessPressureRecognition: perception.awarenessPressureRecognition,
        risk: input.risk,
        cohesion: input.cohesion,
      });
    }),
  );
  const selected = candidates[0];

  if (selected === undefined) {
    throw new Error("Utility actor selection requires at least one candidate.");
  }

  return {
    selected,
    candidates,
  };
}

export function selectUtilityRole(input: UtilityActorSelectionInput): PlayerRole {
  return selectUtilityActor(input).selected.player.role;
}
