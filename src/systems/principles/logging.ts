import { createLogLine, type TacticalLogLine } from "../interactions/shared";
import type { LocalAdvantageEvaluation } from "../spatial/localAdvantage";
import type { TacticalPrincipleEvaluation } from "./types";

export function createPrincipleEvaluationLogs(input: {
  readonly principles: TacticalPrincipleEvaluation;
  readonly localAdvantage?: LocalAdvantageEvaluation | undefined;
  readonly attackingTeamName?: string;
  readonly defendingTeamName?: string;
}): readonly TacticalLogLine[] {
  const attacking = input.principles.attacking;
  const defensive = input.principles.defensive;
  const transition = input.principles.transition;
  const local = input.localAdvantage;
  const attackingTeamName = input.attackingTeamName ?? "Attacking team";
  const defendingTeamName = input.defendingTeamName ?? "Defending team";
  const plural = (count: number, singular: string, pluralText: string): string =>
    `${count} ${count === 1 ? singular : pluralText}`;

  return [
    createLogLine(`### ${attackingTeamName} Attacking Principles`),
    createLogLine(`- ${attackingTeamName} rest defense: ${attacking.restAttackBalance}`),
    createLogLine(`- ${attackingTeamName} corridor occupation: ${attacking.occupiedCorridors}/5`),
    createLogLine(`- ${attackingTeamName} support behind ball: ${attacking.supportBehindBall} players`),
    createLogLine(`- ${attackingTeamName} third-man support: ${attacking.thirdManAvailability}`),
    createLogLine(`- ${attackingTeamName} staggered support: ${attacking.staggeredSupport}`),
    createLogLine(`- ${attackingTeamName} gain line/front-foot ball: ${attacking.gainLineThreat} (${attacking.frontFootBall})`),
    createLogLine(`- shared short side: ${attacking.shortSide.toUpperCase()}`),
    createLogLine(`- shared open side: ${attacking.openSide.toUpperCase()}`),
    createLogLine(`### ${defendingTeamName} Defensive Principles`),
    createLogLine(`- ${defendingTeamName} compactness corridors: ${defensive.compactnessCorridors}, ${defensive.threeCorridorCompactness}`),
    createLogLine(`- ${defendingTeamName} axis protection: ${defensive.axisProtection}`),
    createLogLine(`- ${defendingTeamName} pressing trap: ${defensive.pressingTrapQuality}`),
    createLogLine(`- ${defendingTeamName} cover shadow: ${defensive.coverShadow}`),
    createLogLine(`- ${defendingTeamName} depth protection: ${defensive.depthProtection}`),
    createLogLine("### Shared Tactical Context"),
    createLogLine(`- ${defendingTeamName} counterpress window: ${transition.counterpressWindow}`),
    createLogLine(`- ${attackingTeamName} recycle speed: ${transition.recycleSpeed}`),
    createLogLine(`- ${attackingTeamName} second-wave support: ${transition.secondWaveSupport}`),
    createLogLine(`- shared contact dominance estimate: ${transition.contactDominanceEstimate}`),
    ...(local === undefined
      ? []
      : [
          createLogLine(`${attackingTeamName} local target principles:`),
          createLogLine(
            `- ${attackingTeamName} local numbers in ${local.numerical.targetZone}: ${plural(
              local.numerical.attackersInTarget,
              "attacker",
              "attackers",
            )} vs ${plural(
              local.numerical.defendersInTarget,
              `${defendingTeamName} defender`,
              `${defendingTeamName} defenders`,
            )}`,
          ),
          createLogLine(`- ${attackingTeamName} nearby support: ${local.numerical.nearbySupport} players`),
          createLogLine(`- ${defendingTeamName} goal-side defenders: ${local.numerical.goalSideDefenders}`),
          createLogLine(`- ${attackingTeamName} pass lane: ${local.passingLane.difficulty} (${local.passingLane.reason})`),
        ]),
  ];
}
