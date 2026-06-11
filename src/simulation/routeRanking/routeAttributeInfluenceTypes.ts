import type { PlayerId, TeamId } from "../../core/ids";
import type { Rating } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";

export type RouteAttributeInfluenceCategory =
  | "PASS_SECURITY"
  | "RECEPTION_QUALITY"
  | "PRESSURE_ESCAPE"
  | "SUPPORT_TIMING"
  | "CONTACT_PLATFORM"
  | "RUPTURE_THREAT"
  | "THIRD_MAN_LINK"
  | "BALL_CARRY"
  | "FINAL_ACTION_COMPOSURE"
  | "TURNOVER_RISK"
  | "FATIGUE_DRAG";

export type RouteAttributeInfluence = {
  readonly playerId: PlayerId;
  readonly teamId: TeamId;
  readonly category: RouteAttributeInfluenceCategory;
  readonly modifier: number;
  readonly confidence: "low" | "medium" | "high";
  readonly reason: string;
  readonly sourceAttributes: readonly string[];
};

export type RouteCandidateAttributeContext = {
  readonly candidateId: string;
  readonly actorId: PlayerId;
  readonly receiverId?: PlayerId;
  readonly teamId: TeamId;
  readonly fromZone: ZoneId;
  readonly targetZone: ZoneId;
  readonly actionType: string;
  readonly laneState?: string;
  readonly baseScore: number;
  readonly attributeInfluences: readonly RouteAttributeInfluence[];
  readonly attributeAdjustedScore: number;
};

export type RouteAttributeInfluenceMode = "metadata_only" | "candidate_modifier" | "selection_driving";

export type RouteRankingAttributeUsage = "YES" | "PARTIAL" | "NO";
