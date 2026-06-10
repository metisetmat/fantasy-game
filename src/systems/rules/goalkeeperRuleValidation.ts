import type { TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import { canPlayerUseHandsInGoalArea, getDefendingGoalkeeper, rulePlayerId, type GoalkeeperRulePlayer } from "./goalkeeperRules";

export interface GoalkeeperRuleValidationResult {
  readonly valid: boolean;
  readonly illegalHandUseCount: number;
  readonly checks: readonly string[];
}

export function validateGoalkeeperHandRules(input: {
  readonly teamId: TeamId;
  readonly goalAreaZone: ZoneId;
  readonly players: readonly GoalkeeperRulePlayer[];
}): GoalkeeperRuleValidationResult {
  const goalkeeper = getDefendingGoalkeeper(input.teamId, input.players);
  const ownPlayers = input.players.filter((player) => player.teamId === input.teamId);
  const outfieldIllegalCount = ownPlayers.filter(
    (player) => rulePlayerId(player) !== (goalkeeper === null ? null : rulePlayerId(goalkeeper)) && canPlayerUseHandsInGoalArea(player, input.goalAreaZone, input.teamId),
  ).length;
  const goalkeeperCanUseHands =
    goalkeeper !== null && canPlayerUseHandsInGoalArea(goalkeeper, input.goalAreaZone, input.teamId);

  return {
    valid: goalkeeperCanUseHands && outfieldIllegalCount === 0,
    illegalHandUseCount: outfieldIllegalCount,
    checks: [
      goalkeeperCanUseHands ? "PASS: goalkeeper can use hands in own goal area" : "FAIL: goalkeeper hand privilege missing",
      outfieldIllegalCount === 0
        ? "PASS: outfield players cannot catch/handle in goal area"
        : "FAIL: outfield hand privilege leaked into goal area",
    ],
  };
}
