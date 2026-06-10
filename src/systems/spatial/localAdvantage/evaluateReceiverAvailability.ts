import type { ZoneId } from "../../../core/zones";
import type { SpatialTeamContext } from "../types";
import { getLateralIndex, getZoneParts, clampRating } from "../utils";
import type { ReceiverAvailabilityEvaluation } from "./types";
import { ReceiverAvailabilityLevel } from "./types";

function distanceToZone(playerZone: ZoneId, targetZone: ZoneId): number {
  const playerParts = getZoneParts(playerZone);
  const targetParts = getZoneParts(targetZone);
  const longitudinalDistance = Math.abs(
    Number(playerParts.longitudinalZone.slice(1)) - Number(targetParts.longitudinalZone.slice(1)),
  );
  const lateralDistance = Math.abs(
    getLateralIndex(playerParts.lateralCorridor) - getLateralIndex(targetParts.lateralCorridor),
  );

  return longitudinalDistance + lateralDistance;
}

export function evaluateReceiverAvailability(input: {
  readonly team: SpatialTeamContext;
  readonly targetZone: ZoneId;
  readonly defendersInTarget: number;
}): ReceiverAvailabilityEvaluation {
  const sortedReceivers = [...input.team.players].sort(
    (left, right) => distanceToZone(left.currentZone, input.targetZone) - distanceToZone(right.currentZone, input.targetZone),
  );
  const receiver = sortedReceivers[0];
  const receiverDistance = receiver === undefined ? 99 : distanceToZone(receiver.currentZone, input.targetZone);
  const baseScore = receiver === undefined ? 0 : 84 - receiverDistance * 15 - input.defendersInTarget * 14;
  const score = clampRating(baseScore);
  const level =
    receiver === undefined
      ? ReceiverAvailabilityLevel.Unavailable
      : receiverDistance === 0 && input.defendersInTarget === 0
        ? ReceiverAvailabilityLevel.Free
        : receiverDistance <= 1 && input.defendersInTarget <= 1
          ? ReceiverAvailabilityLevel.Supported
          : receiverDistance <= 2
            ? ReceiverAvailabilityLevel.Isolated
            : ReceiverAvailabilityLevel.Unavailable;

  return {
    targetZone: input.targetZone,
    level,
    receiverId: receiver?.id ?? null,
    receiverRole: receiver?.role ?? null,
    receiverInitials: receiver?.roleInitials ?? null,
    receiverZone: receiver?.currentZone ?? null,
    score,
    reason:
      receiver === undefined
        ? "no receiver available"
        : `${receiver.role} is ${receiverDistance === 0 ? "in" : "near"} ${input.targetZone}`,
  };
}
