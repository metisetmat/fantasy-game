import type { PlayerId, TeamId } from "../../core/ids";
import type { Rating } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import type { PlayerRole } from "../../models/player";

export type SpatialPlayerContext = {
  readonly playerId: PlayerId;
  readonly teamId: TeamId;
  readonly role: PlayerRole | string;
  readonly displayRole: string;
  readonly zone: ZoneId;
  readonly projectedZone?: ZoneId;
  readonly isStarter: boolean;
  readonly isGoalkeeper: boolean;
  readonly isBallCarrier: boolean;
  readonly currentCondition: Rating;
  readonly mentalFreshness: Rating;
  readonly attributes: {
    readonly speed?: Rating;
    readonly power?: Rating;
    readonly endurance?: Rating;
    readonly handPlay?: Rating;
    readonly footPlayDribble?: Rating;
    readonly footPlayPassingShooting?: Rating;
    readonly intelligence?: Rating;
    readonly mental?: Rating;
  };
  readonly tacticalFunctions: readonly string[];
};

export type SpatialTeamContext = {
  readonly teamId: TeamId;
  readonly name: string;
  readonly players: readonly SpatialPlayerContext[];
  readonly goalkeeperId: PlayerId;
  readonly starters: readonly PlayerId[];
  readonly activePlayerIds: readonly PlayerId[];
  readonly shapeSource: "workbench_truth" | "team_snapshot_default" | "prototype_fallback";
  readonly tacticalPlanSummary: string;
  readonly knownLimitations: readonly string[];
};

export type SpatialMatchContext = {
  readonly matchId: string;
  readonly possessionTeamId: TeamId;
  readonly defendingTeamId: TeamId;
  readonly ballCarrierId: PlayerId;
  readonly ballZone: ZoneId;
  readonly attackingDirection: string;
  readonly home: SpatialTeamContext;
  readonly away: SpatialTeamContext;
  readonly sourceWorkbenchFrameId?: string;
};
