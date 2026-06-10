import type { PlayerMatchState } from "../../players";
import { ReceptionFollowUpRole, ReceptionQualityLevel, type ReceptionQualityEvaluation } from "../../spatial";

function preferredThirdMen(firstReceiver: ReceptionQualityEvaluation): readonly string[] {
  switch (firstReceiver.roleInitials) {
    case "FL":
      return ["SH", "PM", "RP"];
    case "PM":
      return ["RP", "SH", "FL"];
    case "HL":
      return ["PM", "RP", "FL"];
    case "RP":
    case "LP":
      return ["SH", "PM", "FL"];
    case "ML":
    case "PV":
      return ["HL", "PM", "RP"];
    default:
      return ["PM", "SH", "RP", "FL"];
  }
}

function canContinueFrom(receiver: ReceptionQualityEvaluation): boolean {
  return (
    receiver.followUpRole === ReceptionFollowUpRole.WallPass ||
    receiver.followUpRole === ReceptionFollowUpRole.ThirdManSet ||
    receiver.followUpRole === ReceptionFollowUpRole.ContactPlatform ||
    receiver.followUpRole === ReceptionFollowUpRole.FastRelease ||
    receiver.followUpRole === ReceptionFollowUpRole.SecureRecycle
  );
}

function zoneColumn(zone: string): number {
  const match = /^Z([0-8])-/.exec(zone);
  return match?.[1] === undefined ? 4 : Number.parseInt(match[1], 10);
}

function plausibleContinuation(first: ReceptionQualityEvaluation, next: ReceptionQualityEvaluation): boolean {
  if (first.playerId === next.playerId || next.quality === ReceptionQualityLevel.Negative) {
    return false;
  }

  const columnDistance = Math.abs(zoneColumn(first.zone) - zoneColumn(next.zone));
  const firstCanPlayUnderContact =
    first.followUpRole === ReceptionFollowUpRole.ContactPlatform ||
    first.followUpRole === ReceptionFollowUpRole.WallPass ||
    first.followUpRole === ReceptionFollowUpRole.ThirdManSet;
  const pressureOk = (first.pressure <= 76 || (firstCanPlayUnderContact && first.pressure <= 88)) && next.pressure <= 88;

  return columnDistance <= 3 && pressureOk;
}

export interface GeneratedReceptionChainSeed {
  readonly firstReceiver: ReceptionQualityEvaluation;
  readonly continuationReceivers: readonly ReceptionQualityEvaluation[];
}

export function generateReceptionChainSeeds(input: {
  readonly ballCarrier: PlayerMatchState;
  readonly receptions: readonly ReceptionQualityEvaluation[];
  readonly maxDepth: 2 | 3;
}): readonly GeneratedReceptionChainSeed[] {
  return input.receptions
    .filter((reception) => reception.playerId !== input.ballCarrier.playerId)
    .filter((reception) => reception.quality !== ReceptionQualityLevel.Negative || reception.nextActionValue >= 42)
    .map((firstReceiver) => {
      if (!canContinueFrom(firstReceiver) || input.maxDepth < 2) {
        return {
          firstReceiver,
          continuationReceivers: [],
        };
      }

      const preferred = preferredThirdMen(firstReceiver);
      const continuations = input.receptions
        .filter((candidate) => candidate.playerId !== input.ballCarrier.playerId)
        .filter((candidate) => plausibleContinuation(firstReceiver, candidate))
        .filter((candidate) => candidate.playerId !== firstReceiver.playerId)
        .sort((left, right) => {
          const leftPreference = preferred.indexOf(left.roleInitials);
          const rightPreference = preferred.indexOf(right.roleInitials);
          const normalizedLeftPreference = leftPreference < 0 ? 99 : leftPreference;
          const normalizedRightPreference = rightPreference < 0 ? 99 : rightPreference;

          if (normalizedLeftPreference !== normalizedRightPreference) {
            return normalizedLeftPreference - normalizedRightPreference;
          }

          return right.nextActionValue + right.thirdManValue - (left.nextActionValue + left.thirdManValue);
        })
        .slice(0, 3);

      return {
        firstReceiver,
        continuationReceivers: continuations,
      };
    });
}
