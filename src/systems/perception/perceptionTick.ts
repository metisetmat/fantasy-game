import type { Rating, TacticalTick } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import type { PlayerMatchState } from "../players";
import { resolvePlayerPerception } from "./orientationResolver";

export function tickPlayerPerceptions(input: {
  readonly players: readonly PlayerMatchState[];
  readonly ballZone: ZoneId;
  readonly tick: TacticalTick;
  readonly chaos: Rating;
}): readonly PlayerMatchState[] {
  return input.players.map((player) => {
    const perception = resolvePlayerPerception({
      player,
      allPlayers: input.players,
      ballZone: input.ballZone,
      tick: input.tick,
      chaos: input.chaos,
      previous: player.perception,
    });

    return {
      ...player,
      perception,
      playerOrientation: perception.orientation,
      perceptionConfidence: perception.perceptionConfidence,
      awarenessRadius: perception.orientation.awarenessRadius,
      blindSideZones: perception.orientation.blindSideZones,
      scanFreshnessTicks: perception.scanFreshnessTicks,
      pressureRecognition: perception.pressureRecognition,
      weakSideAwareness: perception.weakSideAwareness,
      blindSideExposure: perception.blindSideExposure,
      reactionDelayTicks: perception.reactionDelayTicks,
      facingDirection: perception.orientation.facingDirection,
    };
  });
}
