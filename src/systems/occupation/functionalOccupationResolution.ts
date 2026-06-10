import { LateralCorridor, type ZoneId } from "../../core/zones";
import type { PlayerMatchState } from "../players";
import { getZoneParts } from "../spatial/utils";
import { candidateZonesForFunction } from "./functionSpatialRules";
import { evaluateFunctionalOccupation } from "./functionalOccupationEngine";
import { zoneColumn, type FunctionalOccupationContext } from "./occupationContext";
import { resolveMicroPosition } from "./microPositionResolver";
import { scoreOccupationTarget } from "./occupationTargetScoring";
import {
  OccupationFunction,
  type FunctionalOccupationEvaluation,
  type OccupationSpatialTarget,
  type PlayerFunctionalOccupation,
} from "./occupationTypes";

export interface FunctionalOccupationResolution {
  readonly evaluation: FunctionalOccupationEvaluation;
  readonly targets: readonly OccupationSpatialTarget[];
  readonly resolvedPlayers: readonly PlayerMatchState[];
  readonly warnings: readonly string[];
}

function laneFromZone(zone: ZoneId): LateralCorridor {
  return getZoneParts(zone).lateralCorridor;
}

function abstractPoint(zone: ZoneId): { readonly x: number; readonly y: number } {
  const parts = getZoneParts(zone);
  const column = Number.parseInt(parts.longitudinalZone.slice(1), 10);
  const laneIndex = [LateralCorridor.LeftCorridor, LateralCorridor.LeftHalfSpace, LateralCorridor.CentralAxis, LateralCorridor.RightHalfSpace, LateralCorridor.RightCorridor].indexOf(parts.lateralCorridor);

  return {
    x: Math.max(0, Math.min(1, (column - 1) / 6)),
    y: Math.max(0, Math.min(1, laneIndex / 4)),
  };
}

function preferredRoleTarget(input: {
  readonly occupation: PlayerFunctionalOccupation;
  readonly context: FunctionalOccupationContext;
}): ZoneId | null {
  if (input.context.possessionTeamId === "control") {
    if (input.occupation.teamId === "control") {
      switch (input.occupation.roleInitials) {
        case "TH":
          return input.context.ballZone;
        case "PM":
          return "Z4-C";
        case "FL":
          return "Z5-HSL";
        case "ML":
          return "Z3-HSL";
        case "PV":
          return "Z3-C";
        case "HL":
          return "Z4-CL";
        case "SH":
          return "Z5-HSR";
        case "RP":
          return input.occupation.structureFreedomBalance.category === "CREATIVE_INTERPRETER" ? "Z4-C" : "Z3-HSR";
        case "LP":
          return "Z3-CL";
        case "GK":
          return "Z2-C";
      }
    }

    if (input.occupation.teamId === "blitz") {
      switch (input.occupation.roleInitials) {
        case "ML":
          return "Z4-HSL";
        case "PV":
          return "Z4-HSL";
        case "LP":
          return "Z5-HSL";
        case "TH":
          return "Z5-HSL";
        case "PM":
          return "Z5-C";
        case "RP":
          return "Z5-HSR";
        case "GK":
          return "Z6-C";
        case "SH":
          return "Z5-C";
        case "FL":
          return "Z4-C";
        case "HL":
          return "Z4-CL";
      }
    }
  }

  return null;
}

function chooseTarget(input: {
  readonly occupation: PlayerFunctionalOccupation;
  readonly context: FunctionalOccupationContext;
  readonly occupiedTargets: ReadonlyMap<ZoneId, number>;
}): OccupationSpatialTarget {
  const preferred = preferredRoleTarget(input);
  const candidates = [
    ...(preferred === null ? [] : [preferred]),
    ...candidateZonesForFunction(input),
  ].filter((zone, index, all): zone is ZoneId => all.indexOf(zone) === index);
  const preferredBonus = 80;
  const scored = candidates
    .map((candidate) => {
      const conflictCount = input.occupiedTargets.get(candidate) ?? 0;
      const score = scoreOccupationTarget({
        occupation: input.occupation,
        zone: candidate,
        context: input.context,
        conflictCount,
      });

      return {
        zone: candidate,
        ...score,
        targetScore: candidate === preferred ? Math.min(100, score.targetScore + preferredBonus) : score.targetScore,
      };
    })
    .sort((left, right) => {
      if (left.zone === preferred && right.zone !== preferred) {
        return -1;
      }

      if (right.zone === preferred && left.zone !== preferred) {
        return 1;
      }

      return right.targetScore - left.targetScore || left.zone.localeCompare(right.zone);
    });
  const selected = scored[0] ?? {
    zone: input.occupation.zone,
    targetScore: 50,
    styleFit: 50,
    structureCost: 0,
    riskCost: 0,
    teammateConflictCost: 0,
    functionZoneMismatch: false,
  };
  const conflictResolved =
    input.occupiedTargets.get(selected.zone) === undefined
      ? null
      : `${input.occupation.roleInitials} accepted ${selected.zone} with micro-position differentiation`;

  return {
    playerId: input.occupation.playerId,
    roleInitials: input.occupation.roleInitials,
    primaryFunction: input.occupation.primaryFunction,
    secondaryFunction: input.occupation.secondaryFunction,
    candidateZones: candidates,
    selectedZone: selected.zone,
    selectedCorridor: laneFromZone(selected.zone),
    microPosition: resolveMicroPosition(input.occupation.primaryFunction),
    targetScore: selected.targetScore,
    styleFit: selected.styleFit,
    structureCost: selected.structureCost,
    riskCost: selected.riskCost,
    teammateConflictCost: selected.teammateConflictCost,
    explanation: `${input.occupation.primaryFunction} resolves to ${selected.zone} because ${input.occupation.occupationInterpretation}`,
    conflictResolved,
    functionZoneMismatch: selected.functionZoneMismatch,
  };
}

function updatePlayerZone(player: PlayerMatchState, target: OccupationSpatialTarget): PlayerMatchState {
  const point = abstractPoint(target.selectedZone);
  const targetPosition = {
    x: point.x,
    y: point.y,
    zone: target.selectedZone,
  };

  return {
    ...player,
    zone: target.selectedZone,
    lane: laneFromZone(target.selectedZone),
    abstractX: point.x,
    abstractY: point.y,
    currentPosition: targetPosition,
    targetPosition,
    movementVector: player.zone === target.selectedZone ? player.movementVector : { dx: point.x - player.abstractX, dy: point.y - player.abstractY },
    activeTrajectory:
      player.activeTrajectory === null
        ? null
        : {
            ...player.activeTrajectory,
            targetZone: target.selectedZone,
            targetPosition,
          },
  };
}

export function resolveFunctionalOccupationSpatialTargets(context: FunctionalOccupationContext): FunctionalOccupationResolution {
  const evaluation = evaluateFunctionalOccupation(context);
  const occupiedTargets = new Map<ZoneId, number>();
  const targets: OccupationSpatialTarget[] = [];

  for (const occupation of evaluation.teams.flatMap((team) => team.players)) {
    const target = chooseTarget({
      occupation,
      context,
      occupiedTargets,
    });
    occupiedTargets.set(target.selectedZone, (occupiedTargets.get(target.selectedZone) ?? 0) + 1);
    targets.push(target);
  }

  const resolvedPlayers = context.players.map((player) => {
    const target = targets.find((candidate) => candidate.playerId === player.playerId);

    if (target === undefined) {
      return player;
    }

    return updatePlayerZone(player, target);
  });
  const controlNonGkCentral = targets.filter((target) => {
    const player = context.players.find((candidate) => candidate.playerId === target.playerId);

    return player?.teamId === "control" && target.roleInitials !== "GK" && target.selectedCorridor === "C";
  });
  const blitzPressure = targets.filter((target) => {
    const player = context.players.find((candidate) => candidate.playerId === target.playerId);

    return player?.teamId === "blitz" &&
      [OccupationFunction.PressingTrap, OccupationFunction.PressTrigger, OccupationFunction.CoverShadowBlocker].includes(target.primaryFunction);
  });
  const blitzWeakSideRisk =
    blitzPressure.length >= 4
      ? ["BLITZ weak-side exposure rises because pressure functions overcompress around the ball-side lane"]
      : [];
  const warnings = [
    ...targets.filter((target) => target.functionZoneMismatch).map((target) => `function-zone mismatch: ${target.roleInitials} ${target.primaryFunction} -> ${target.selectedZone}`),
    ...(controlNonGkCentral.length > 3
      ? [`function-zone mismatch: CONTROL has ${controlNonGkCentral.length} non-GK players concentrated in C corridor`]
      : []),
    ...blitzWeakSideRisk,
  ];

  return {
    evaluation,
    targets,
    resolvedPlayers,
    warnings,
  };
}
