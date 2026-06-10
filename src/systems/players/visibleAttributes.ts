import type { Rating } from "../../core/ratings";
import type { PlayerAttributes } from "../../models/player";

export interface VisiblePlayerAttributes {
  readonly speed: Rating;
  readonly power: Rating;
  readonly endurance: Rating;
  readonly handPlay: Rating;
  readonly footPlay: Rating;
  readonly ballCarrying: Rating;
  readonly vision: Rating;
  readonly composure: Rating;
  readonly creativity: Rating;
}

export const VISIBLE_PLAYER_ATTRIBUTE_KEYS = [
  "speed",
  "power",
  "endurance",
  "handPlay",
  "footPlay",
  "ballCarrying",
  "vision",
  "composure",
  "creativity",
] as const;

export function calculateVisibleAttributeTotal(players: readonly { readonly visibleAttributes: VisiblePlayerAttributes }[]): number {
  return players.reduce(
    (total, player) =>
      total +
      VISIBLE_PLAYER_ATTRIBUTE_KEYS.reduce((playerTotal, key) => playerTotal + player.visibleAttributes[key], 0),
    0,
  );
}

export function toLegacyPlayerAttributes(visible: VisiblePlayerAttributes): PlayerAttributes {
  const agility = Math.round(visible.speed * 0.45 + visible.ballCarrying * 0.35 + visible.creativity * 0.2);

  return {
    speed: visible.speed,
    agility,
    endurance: visible.endurance,
    power: visible.power,
    handPlay: visible.handPlay,
    footPlayDribble: visible.ballCarrying,
    footPlayPassingShooting: visible.footPlay,
    intelligence: visible.vision,
    mental: visible.composure,
  };
}
