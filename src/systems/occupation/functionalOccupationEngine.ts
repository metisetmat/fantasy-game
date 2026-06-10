import type { TeamId } from "../../core/ids";
import type { PlayerMatchState } from "../players";
import { type FunctionalOccupationContext } from "./occupationContext";
import { getOccupationFunctionProfile } from "./occupationWeights";
import { resolvePlayerFunctionalOccupation } from "./occupationResolver";
import {
  OccupationFunction,
  type FunctionalOccupationEvaluation,
  type FunctionalOccupationValidation,
  type PlayerFunctionalOccupation,
  type TeamFunctionalOccupation,
} from "./occupationTypes";

function teamPlayers(players: readonly PlayerMatchState[], teamId: TeamId): readonly PlayerMatchState[] {
  return players.filter((player) => player.teamId === teamId);
}

function playerOccupation(input: {
  readonly player: PlayerMatchState;
  readonly context: FunctionalOccupationContext;
}): PlayerFunctionalOccupation {
  const style = input.context.teamStyles[input.player.teamId] ?? "CONTROL";
  const profile = getOccupationFunctionProfile(input.player.role, style);
  const resolved = resolvePlayerFunctionalOccupation(input);
  const primary = resolved.scores[0]?.function ?? OccupationFunction.DirectSupport;
  const secondary =
    resolved.scores.find((score) => score.function !== primary)?.function ?? OccupationFunction.SupportBehindBall;

  return {
    playerId: input.player.playerId,
    teamId: input.player.teamId,
    roleInitials: input.player.roleInitials,
    zone: input.player.zone,
    primaryFunction: primary,
    secondaryFunction: secondary,
    functionScores: resolved.scores,
    structureFreedomBalance: resolved.balance,
    occupationInterpretation: resolved.interpretation,
    preferredFunctions: profile.preferred,
    secondaryFunctions: profile.secondary,
    forbiddenFunctions: profile.forbidden,
  };
}

function validateTeamOccupation(input: {
  readonly teamId: TeamId;
  readonly style: "CONTROL" | "BLITZ";
  readonly occupations: readonly PlayerFunctionalOccupation[];
  readonly context: FunctionalOccupationContext;
}): FunctionalOccupationValidation {
  const sameFunctionZoneWarnings = input.occupations.filter((occupation) => {
    const duplicates = input.occupations.filter(
      (candidate) => candidate.zone === occupation.zone && candidate.primaryFunction === occupation.primaryFunction,
    );

    return duplicates.length >= 3;
  });
  const ballCarrier = input.occupations.find((occupation) => occupation.playerId === input.context.ballCarrierId);
  const carrierColumn = ballCarrier?.zone.match(/^Z([0-8])-/)?.[1];
  const nearbySupport = carrierColumn === undefined
    ? []
    : input.occupations.filter((occupation) => {
        const column = occupation.zone.match(/^Z([0-8])-/)?.[1];
        if (column === undefined || occupation.playerId === ballCarrier?.playerId) {
          return false;
        }

        return Math.abs(Number.parseInt(column, 10) - Number.parseInt(carrierColumn, 10)) <= 1 &&
          [
            OccupationFunction.DirectSupport,
            OccupationFunction.SafeRecycle,
            OccupationFunction.HalfSpaceRecycle,
            OccupationFunction.ThirdManConnector,
          ].includes(occupation.primaryFunction);
      });
  const mobileLock = input.occupations.find((occupation) => occupation.roleInitials === "ML");
  const pivot = input.occupations.find((occupation) => occupation.roleInitials === "PV");
  const playmaker = input.occupations.find((occupation) => occupation.roleInitials === "PM");
  const forwardLeader = input.occupations.find((occupation) => occupation.roleInitials === "FL");
  const rightPiston = input.occupations.find((occupation) => occupation.roleInitials === "RP");
  const blitzPressureFunctions = input.occupations.filter((occupation) =>
    [occupation.primaryFunction, occupation.secondaryFunction].some((functionType) =>
      [OccupationFunction.PressingTrap, OccupationFunction.PressTrigger, OccupationFunction.CoverShadowBlocker].includes(functionType),
    ),
  );
  const blitzBalanceFunctions = input.occupations.filter((occupation) =>
    [occupation.primaryFunction, occupation.secondaryFunction].some((functionType) =>
      [OccupationFunction.CounterpressBalancer, OccupationFunction.RestDefenseAnchor, OccupationFunction.TransitionHunter].includes(functionType),
    ),
  );
  const checks = [
    {
      label: "players no longer stack functionally",
      status: sameFunctionZoneWarnings.length === 0 ? "PASS" : "FAIL",
      detail:
        sameFunctionZoneWarnings.length === 0
          ? "no same-zone triple stack shares the same primary function"
          : sameFunctionZoneWarnings.map((occupation) => `${occupation.roleInitials}@${occupation.zone}:${occupation.primaryFunction}`).join(", "),
    },
    {
      label: "TH not isolated",
      status: input.teamId === input.context.possessionTeamId && ballCarrier?.roleInitials === "TH" && nearbySupport.length === 0 ? "FAIL" : "PASS",
      detail: nearbySupport.length === 0 ? "carrier support is not required for this team/frame" : `nearby support: ${nearbySupport.map((occupation) => occupation.roleInitials).join(", ")}`,
    },
    {
      label: "PM supports TH",
      status:
        input.style !== "CONTROL" ||
        playmaker === undefined ||
        [OccupationFunction.DirectSupport, OccupationFunction.ThirdManConnector, OccupationFunction.TempoController].includes(playmaker.primaryFunction)
          ? "PASS"
          : "FAIL",
      detail: playmaker === undefined ? "PM missing" : `PM primary ${playmaker.primaryFunction}`,
    },
    {
      label: "FL width-fixes or acts as contact platform",
      status:
        forwardLeader === undefined ||
        [OccupationFunction.WidthFixer, OccupationFunction.ContactPlatform, OccupationFunction.ScreenSupport].includes(forwardLeader.primaryFunction) ||
        forwardLeader.secondaryFunction === OccupationFunction.WidthFixer
          ? "PASS"
          : "FAIL",
      detail: forwardLeader === undefined ? "FL missing" : `FL ${forwardLeader.primaryFunction}/${forwardLeader.secondaryFunction}`,
    },
    {
      label: "ML/PV differentiated",
      status: mobileLock !== undefined && pivot !== undefined && mobileLock.primaryFunction !== pivot.primaryFunction ? "PASS" : "FAIL",
      detail:
        mobileLock === undefined || pivot === undefined
          ? "ML or PV missing"
          : `ML ${mobileLock.primaryFunction}; PV ${pivot.primaryFunction}`,
    },
    {
      label: "RP behavior varies by creativity/discipline",
      status:
        rightPiston === undefined ||
        (rightPiston.primaryFunction !== rightPiston.secondaryFunction &&
          ["STRICT_STRUCTURE", "DISCIPLINED_INTERPRETER", "BALANCED_INTERPRETER", "CREATIVE_INTERPRETER", "FREE_ROAMER"].includes(rightPiston.structureFreedomBalance.category))
          ? "PASS"
          : "FAIL",
      detail:
        rightPiston === undefined
          ? "RP missing"
          : `RP ${rightPiston.primaryFunction}/${rightPiston.secondaryFunction}; category ${rightPiston.structureFreedomBalance.category}`,
    },
    {
      label: "BLITZ compresses without suicidal overcommit",
      status:
        input.style !== "BLITZ" ||
        (blitzPressureFunctions.length >= 2 && blitzBalanceFunctions.length >= 2)
          ? "PASS"
          : "FAIL",
      detail:
        input.style !== "BLITZ"
          ? "not BLITZ"
          : `pressure ${blitzPressureFunctions.length}; balance ${blitzBalanceFunctions.length}`,
    },
  ] as const;

  return {
    status: checks.some((check) => check.status === "FAIL") ? "FAIL" : "PASS",
    checks,
  };
}

function evaluateTeam(input: {
  readonly teamId: TeamId;
  readonly style: "CONTROL" | "BLITZ";
  readonly context: FunctionalOccupationContext;
}): TeamFunctionalOccupation {
  const occupations = teamPlayers(input.context.players, input.teamId).map((player) =>
    playerOccupation({
      player,
      context: input.context,
    }),
  );

  return {
    teamId: input.teamId,
    style: input.style,
    players: occupations,
    validation: validateTeamOccupation({
      teamId: input.teamId,
      style: input.style,
      occupations,
      context: input.context,
    }),
  };
}

export function evaluateFunctionalOccupation(context: FunctionalOccupationContext): FunctionalOccupationEvaluation {
  const teamIds = [...new Set(context.players.map((player) => player.teamId))];

  return {
    teams: teamIds.map((teamId) =>
      evaluateTeam({
        teamId,
        style: context.teamStyles[teamId] ?? "CONTROL",
        context,
      }),
    ),
  };
}
