import type { PlayerId, TeamId } from "../core/ids";
import type { Rating } from "../core/ratings";
import type { ZoneId } from "../core/zones";

export enum PlayerRole {
  LeftAnchor = "left_anchor",
  RightAnchor = "right_anchor",
  HookLink = "hook_link",
  MobileLock = "mobile_lock",
  ForwardLeader = "forward_leader",
  TempoHalf = "tempo_half",
  Playmaker = "playmaker",
  PowerRunner = "power_runner",
  SpaceHunter = "space_hunter",
  FreeSafety = "free_safety",
  GoalkeeperFreeSafety = "goalkeeper_free_safety",
  Pivot = "pivot",
  LeftPiston = "left_piston",
  RightPiston = "right_piston",
}

export interface PlayerAttributes {
  readonly speed: Rating;
  readonly agility: Rating;
  readonly endurance: Rating;
  readonly power: Rating;
  readonly handPlay: Rating;
  readonly footPlayDribble: Rating;
  readonly footPlayPassingShooting: Rating;
  readonly intelligence: Rating;
  readonly mental: Rating;
}

export interface PlayerFatigueState {
  readonly accumulatedFatigue: Rating;
  readonly freshness: Rating;
}

export interface PlayerState {
  readonly id: PlayerId;
  readonly teamId: TeamId;
  readonly name: string;
  readonly role: PlayerRole;
  readonly attributes: PlayerAttributes;
  readonly visibleAttributes?: import("../systems/players/visibleAttributes").VisiblePlayerAttributes;
  readonly derivedAttributes?: import("../systems/players/derived").DerivedPlayerAttributes;
  readonly roleInitials?: string;
  readonly isGoalkeeper?: boolean;
  readonly fatigue: PlayerFatigueState;
  readonly currentZone: ZoneId;
  readonly momentum: Rating;
  readonly activeIntents?: readonly import("../systems/intent").PlayerIntent[];
  readonly primaryIntent?: import("../systems/intent").PlayerIntent | null;
  readonly previousIntent?: import("../systems/intent").PlayerIntent | null;
  readonly intentAgeTicks?: number;
  readonly intentConfidence?: Rating;
  readonly intentTargetZone?: ZoneId | null;
  readonly intentOriginReason?: string;
  readonly intentEvolutionStory?: string;
  readonly intentUrgency?: Rating;
  readonly intentEvolutionDirection?: "ESCALATING" | "DECAYING" | "STABLE";
}
