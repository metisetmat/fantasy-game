import type { MatchInput } from "../../contracts/engineToCoach";
import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import type { TacticalWorkbenchFrame } from "../grounding/tacticalWorkbenchTypes";
import { buildSpatialContextForMatchTeam } from "./teamSnapshotToSpatialContext";
import type { SpatialMatchContext } from "./spatialTeamContextTypes";

export function workbenchToSpatialMatchContext(input: {
  readonly matchInput: MatchInput;
  readonly workbench: TacticalWorkbenchFrame;
  readonly frame: "before" | "after";
}): SpatialMatchContext {
  const after = input.frame === "after" ? input.workbench.afterState : undefined;

  return {
    matchId: input.matchInput.matchId,
    possessionTeamId: input.workbench.possessionTeamId as TeamId,
    defendingTeamId: input.workbench.defendingTeamId as TeamId,
    ballCarrierId: (after?.newCarrierId ?? input.workbench.ballCarrierId) as PlayerId,
    ballZone: (after?.ballZone ?? input.workbench.ballZone) as ZoneId,
    attackingDirection: input.workbench.attackingDirection,
    home: buildSpatialContextForMatchTeam({
      matchInput: input.matchInput,
      team: "home",
      workbench: input.workbench,
      frame: input.frame,
    }),
    away: buildSpatialContextForMatchTeam({
      matchInput: input.matchInput,
      team: "away",
      workbench: input.workbench,
      frame: input.frame,
    }),
    sourceWorkbenchFrameId: input.workbench.frameId,
  };
}
