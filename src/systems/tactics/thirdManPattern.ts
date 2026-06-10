import type { PlayerMatchState } from "../players";
import {
  ReceptionFollowUpRole,
  ReceptionQualityLevel,
  type ReceptionQualityEvaluation,
} from "../spatial/receptionQuality";

export interface ThirdManPattern {
  readonly firstPasserId: string;
  readonly wallReceiverId: string;
  readonly thirdManId: string | null;
  readonly returnLane: string;
  readonly timingWindowTicks: number;
  readonly pressureOnWallReceiver: number;
  readonly thirdManReceptionQuality: ReceptionQualityLevel | null;
  readonly patternScore: number;
  readonly explanation: string;
}

function isLateralOrBehind(wall: ReceptionQualityEvaluation, candidate: ReceptionQualityEvaluation): boolean {
  return candidate.ballRelation === "BEHIND" || candidate.ballRelation === "SAME_LINE" || wall.ballRelation === "AHEAD";
}

export function detectThirdManPattern(input: {
  readonly passer: PlayerMatchState;
  readonly wallReceiver: ReceptionQualityEvaluation;
  readonly receptionOptions: readonly ReceptionQualityEvaluation[];
}): ThirdManPattern {
  const viableThirdMen = input.receptionOptions
    .filter((candidate) => candidate.playerId !== input.passer.playerId && candidate.playerId !== input.wallReceiver.playerId)
    .filter((candidate) => isLateralOrBehind(input.wallReceiver, candidate))
    .filter((candidate) => candidate.quality !== ReceptionQualityLevel.Negative)
    .sort((left, right) => right.nextActionValue - left.nextActionValue);
  const thirdMan = viableThirdMen[0] ?? null;
  const wallRole =
    input.wallReceiver.followUpRole === ReceptionFollowUpRole.ContactPlatform ||
    input.wallReceiver.followUpRole === ReceptionFollowUpRole.WallPass ||
    input.wallReceiver.followUpRole === ReceptionFollowUpRole.ThirdManSet;
  const pressurePenalty = Math.round(input.wallReceiver.pressure * 0.28);
  const patternScore =
    thirdMan === null
      ? Math.max(0, 38 - pressurePenalty)
      : Math.max(
          0,
          Math.min(
            100,
            Math.round(
              input.wallReceiver.thirdManValue * 0.44 +
                thirdMan.nextActionValue * 0.34 +
                (wallRole ? 18 : 0) -
                pressurePenalty,
            ),
          ),
        );

  return {
    firstPasserId: input.passer.playerId,
    wallReceiverId: input.wallReceiver.playerId,
    thirdManId: thirdMan?.playerId ?? null,
    returnLane: thirdMan === null ? "none" : `${input.wallReceiver.zone}->${thirdMan.zone}`,
    timingWindowTicks: thirdMan === null ? 0 : input.wallReceiver.pressure <= 58 ? 2 : 1,
    pressureOnWallReceiver: input.wallReceiver.pressure,
    thirdManReceptionQuality: thirdMan?.quality ?? null,
    patternScore,
    explanation:
      thirdMan === null
        ? "no clean third-man receiver is available after the wall touch"
        : `${input.wallReceiver.roleInitials} can act as point d'appui for ${thirdMan.roleInitials} through ${input.wallReceiver.zone}->${thirdMan.zone}`,
  };
}
