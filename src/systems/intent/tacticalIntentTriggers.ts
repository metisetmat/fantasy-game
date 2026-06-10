import { PlayerRole, type PlayerState } from "../../models/player";
import { TacticalStyle } from "../../models/tactics";
import { IntentSource, IntentType, type PlayerIntent } from "./intentTypes";
import { createIntent } from "./playerIntent";

export function createPossessionGainIntents(input: {
  readonly players: readonly PlayerState[];
  readonly tacticalStyle: TacticalStyle;
  readonly tick: number;
}): readonly PlayerIntent[] {
  return input.players.flatMap((player) => {
    if (player.role === PlayerRole.TempoHalf) {
      return [
        createIntent({
          playerId: player.id,
          teamId: player.teamId,
          type: input.tacticalStyle === TacticalStyle.Blitz ? IntentType.AttackDepth : IntentType.OrganizeTempo,
          trigger: "possession_gained",
          priority: input.tacticalStyle === TacticalStyle.Blitz ? 76 : 84,
          confidence: 82,
          startedTick: input.tick,
          tacticalReason: input.tacticalStyle === TacticalStyle.Blitz ? "vertical trigger after gain" : "organize possession after gain",
          source: IntentSource.TacticalTrigger,
        }),
      ];
    }

    if (player.role === PlayerRole.SpaceHunter || player.role === PlayerRole.LeftPiston || player.role === PlayerRole.RightPiston) {
      return [
        createIntent({
          playerId: player.id,
          teamId: player.teamId,
          type: player.role === PlayerRole.SpaceHunter ? IntentType.AttackDepth : IntentType.OccupyWidth,
          trigger: "possession_gained",
          priority: 72,
          confidence: 76,
          startedTick: input.tick,
          tacticalReason: "off-ball occupation after possession gain",
          source: IntentSource.TacticalTrigger,
        }),
      ];
    }

    if (player.role === PlayerRole.Pivot) {
      return [
        createIntent({
          playerId: player.id,
          teamId: player.teamId,
          type: IntentType.ProtectRestDefense,
          trigger: "possession_gained",
          priority: 80,
          confidence: 82,
          startedTick: input.tick,
          tacticalReason: "central rest defense after possession gain",
          source: IntentSource.TacticalTrigger,
        }),
      ];
    }

    return [];
  });
}
