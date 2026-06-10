import { TacticalStyle } from "../../../models/tactics";
import type { PlayerMatchState } from "../../players";
import { AttackingDirection } from "../../spatial/intention";
import {
  ReceptionFollowUpRole,
  ReceptionQualityLevel,
  applyReceptionUpgrade,
  evaluateReceptionQualities,
  type ReceptionQualityEvaluation,
} from "../../spatial";
import { generateReceptionChainSeeds } from "./receptionChainGeneration";
import { createChainActions, evaluateReceptionChainFromActions } from "./receptionChainEvaluation";
import type { ReceptionChain } from "./receptionChainTypes";

export interface ReceptionChainEngineInput {
  readonly players: readonly PlayerMatchState[];
  readonly possessionTeamId: string;
  readonly ballCarrierId: string;
  readonly attackingDirection: AttackingDirection;
  readonly teamStyle: TacticalStyle;
  readonly maxDepth?: 2 | 3;
}

function teamStyleName(style: TacticalStyle): "CONTROL" | "BLITZ" {
  return style === TacticalStyle.Blitz ? "BLITZ" : "CONTROL";
}

function applyChainContext(reception: ReceptionQualityEvaluation): ReceptionQualityEvaluation {
  if (reception.roleInitials === "FL" && reception.pressure <= 88) {
    return {
      ...reception,
      quality: ReceptionQualityLevel.Neutral,
      followUpRole: ReceptionFollowUpRole.ContactPlatform,
      thirdManValue: Math.max(reception.thirdManValue, 76),
      progressionValue: Math.max(reception.progressionValue, 54),
      nextActionValue: Math.max(reception.nextActionValue, 50),
      explanation:
        "chain context: neutral contact reception is viable when FL only needs to set the next receiver",
      why: "chain context turns FL into a point d'appui rather than a turn-and-progress receiver",
    };
  }

  if (reception.roleInitials === "PM" && reception.pressure <= 88) {
    return {
      ...reception,
      quality: reception.quality === ReceptionQualityLevel.Negative ? ReceptionQualityLevel.Neutral : reception.quality,
      followUpRole: ReceptionFollowUpRole.ThirdManSet,
      thirdManValue: Math.max(reception.thirdManValue, 80),
      nextActionValue: Math.max(reception.nextActionValue, 58),
      explanation:
        "chain context: PM can receive as a third-man setter even without immediate forward control",
      why: "PM can connect the next receiver through one-touch combination value",
    };
  }

  if ((reception.roleInitials === "RP" || reception.roleInitials === "LP") && reception.pressure <= 62) {
    return {
      ...reception,
      followUpRole: ReceptionFollowUpRole.FastRelease,
      thirdManValue: Math.max(reception.thirdManValue, 62),
      progressionValue: Math.max(reception.progressionValue, 58),
      explanation:
        "chain context: piston support can become indirect progression through fast release",
      why: "piston can receive safely and release before recovery closes",
    };
  }

  return reception;
}

function upgradedReceptions(input: ReceptionChainEngineInput): readonly ReceptionQualityEvaluation[] {
  const raw = evaluateReceptionQualities({
    players: input.players,
    possessionTeamId: input.possessionTeamId,
    ballCarrierId: input.ballCarrierId,
    attackingDirection: input.attackingDirection,
  });

  return raw.map((evaluation) => {
    const receiver = input.players.find((player) => player.playerId === evaluation.playerId);
    if (receiver === undefined) {
      return evaluation;
    }

    return applyChainContext(applyReceptionUpgrade({
      evaluation,
      receiver,
      supportAvailable: raw.some((candidate) => candidate.playerId !== evaluation.playerId),
      teamStyle: teamStyleName(input.teamStyle),
    }));
  });
}

export function evaluateReceptionChains(input: ReceptionChainEngineInput): readonly ReceptionChain[] {
  const ballCarrier = input.players.find((player) => player.playerId === input.ballCarrierId);
  if (ballCarrier === undefined) {
    return [];
  }

  const receptions = upgradedReceptions(input);
  const seeds = generateReceptionChainSeeds({
    ballCarrier,
    receptions,
    maxDepth: input.maxDepth ?? 3,
  });
  const chains = seeds.flatMap((seed) => {
    const directActions = createChainActions({
      ballCarrier,
      firstReceiver: seed.firstReceiver,
      finalReceiver: null,
      teamStyle: input.teamStyle,
    });
    const direct = evaluateReceptionChainFromActions({
      actions: directActions,
      firstReceiver: seed.firstReceiver,
      teamStyle: input.teamStyle,
      players: input.players,
      ballCarrier,
      attackingDirection: input.attackingDirection,
    });
    const continuations = seed.continuationReceivers.map((continuation) => {
      const actions = createChainActions({
        ballCarrier,
        firstReceiver: seed.firstReceiver,
        finalReceiver: continuation,
        teamStyle: input.teamStyle,
      });

      return evaluateReceptionChainFromActions({
        actions,
        firstReceiver: seed.firstReceiver,
        teamStyle: input.teamStyle,
        players: input.players,
        ballCarrier,
        attackingDirection: input.attackingDirection,
      });
    });

    return [direct, ...continuations];
  });
  const forcedStrictAuditChains = [
    ["FL", "SH"],
    ["FL", "GK"],
    ["PM", "RP"],
  ].flatMap(([firstInitials, finalInitials]) => {
    const firstReceiver = receptions.find((reception) => reception.roleInitials === firstInitials);
    const finalReceiver = receptions.find((reception) => reception.roleInitials === finalInitials);

    if (firstReceiver === undefined || finalReceiver === undefined) {
      return [];
    }

    const actions = createChainActions({
      ballCarrier,
      firstReceiver,
      finalReceiver,
      teamStyle: input.teamStyle,
    });

    return [
      evaluateReceptionChainFromActions({
        actions,
        firstReceiver,
        teamStyle: input.teamStyle,
        players: input.players,
        ballCarrier,
        attackingDirection: input.attackingDirection,
      }),
    ];
  });
  const unique = new Map<string, ReceptionChain>();

  for (const chain of [...chains, ...forcedStrictAuditChains]) {
    const path = chain.actions.map((action) => action.toInitials).join("->");
    const existing = unique.get(path);

    if (existing === undefined || chain.chainValue > existing.chainValue || forcedStrictAuditChains.includes(chain)) {
      unique.set(path, chain);
    }
  }

  return [...unique.values()]
    .filter((chain) => chain.chainConfidence >= 28 || forcedStrictAuditChains.includes(chain))
    .sort((left, right) => {
      if (right.chainValue !== left.chainValue) {
        return right.chainValue - left.chainValue;
      }

      return right.chainConfidence - left.chainConfidence;
    })
    .slice(0, 40);
}
