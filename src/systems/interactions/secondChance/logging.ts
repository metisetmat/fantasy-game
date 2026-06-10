import { ScoringType } from "../../../models/scoring";
import { PlayerRole } from "../../../models/player";
import { createLogLine } from "../shared/logging";
import type { TacticalLogLine } from "../shared";
import { SecondChanceOutcome, type SecondChanceInteractionResult } from "./types";

function formatOutcome(outcome: SecondChanceOutcome): string {
  switch (outcome) {
    case SecondChanceOutcome.SecondChanceFinish:
      return "SECOND_CHANCE_FINISH";
    case SecondChanceOutcome.EmergencyClearance:
      return "EMERGENCY_CLEARANCE";
    case SecondChanceOutcome.AttackingRecovery:
      return "CONTROLLED_SECOND_WAVE";
    case SecondChanceOutcome.DefensiveRecovery:
      return "DEFENSIVE_RECOVERY";
    case SecondChanceOutcome.ScrambleTurnover:
      return "SCRAMBLE_TURNOVER";
    case SecondChanceOutcome.ChaoticTry:
      return "CHAOTIC_TRY";
    case SecondChanceOutcome.RushedSecondShot:
      return "RUSHED_SECOND_SHOT";
    case SecondChanceOutcome.SequenceDies:
      return "SEQUENCE_DIES";
  }
}

function formatScoring(scoringType: ScoringType): string {
  switch (scoringType) {
    case ScoringType.Goal:
      return "Goal";
    case ScoringType.Try:
      return "Try";
    case ScoringType.Drop:
      return "Drop";
    case ScoringType.Penalty:
      return "Penalty";
    case ScoringType.Conversion:
      return "Conversion";
  }
}

function formatRole(role: PlayerRole): string {
  switch (role) {
    case PlayerRole.LeftAnchor:
      return "Left Piston";
    case PlayerRole.RightAnchor:
      return "Right Piston";
    case PlayerRole.HookLink:
      return "Hook Link";
    case PlayerRole.MobileLock:
      return "Mobile Lock";
    case PlayerRole.ForwardLeader:
      return "Forward Leader";
    case PlayerRole.TempoHalf:
      return "Tempo Half";
    case PlayerRole.Playmaker:
      return "Playmaker";
    case PlayerRole.PowerRunner:
      return "Forward Leader";
    case PlayerRole.SpaceHunter:
      return "Space Hunter";
    case PlayerRole.FreeSafety:
      return "Free Safety";
    case PlayerRole.GoalkeeperFreeSafety:
      return "Goalkeeper / Free Safety";
    case PlayerRole.Pivot:
      return "Pivot";
    case PlayerRole.LeftPiston:
      return "Left Piston";
    case PlayerRole.RightPiston:
      return "Right Piston";
  }
}

function createSecondChanceEventChain(input: {
  readonly result: Omit<SecondChanceInteractionResult, "logs">;
  readonly offensiveTeamName: string;
  readonly reboundLocation: string;
}): readonly TacticalLogLine[] {
  const primaryChaser = input.result.event.involvedRoles[0] ?? PlayerRole.SpaceHunter;
  const support = input.result.event.involvedRoles[1] ?? PlayerRole.ForwardLeader;

  return [
    createLogLine("### Tactical Event Chain"),
    createLogLine(`The live ball spills into ${input.reboundLocation}.`),
    createLogLine(`${formatRole(primaryChaser)} attacks the loose-ball contest first.`),
    createLogLine(
      input.result.reboundControl.supportQuality >= 60
        ? `${formatRole(support)} arrives as second-wave support and helps secure the contest.`
        : `${formatRole(support)} arrives late, leaving the first contest unstable.`,
    ),
    createLogLine(
      input.result.outcome === SecondChanceOutcome.EmergencyClearance
        ? "The defending side hacks the loose ball clear before the attack can reload."
        : input.result.outcome === SecondChanceOutcome.ScrambleTurnover
          ? "The scramble flips possession after the carrier loses the second contact."
          : input.result.scoreUpdate === null
            ? `${input.offensiveTeamName} keeps the ball alive but cannot convert the second phase.`
            : `${input.offensiveTeamName} turns the loose-ball contest into points.`,
    ),
  ];
}

export function createSecondChanceLogs(input: {
  readonly result: Omit<SecondChanceInteractionResult, "logs">;
  readonly offensiveTeamName: string;
  readonly reboundLocation: string;
  readonly finishingStyle: string;
}): readonly TacticalLogLine[] {
  return [
    createLogLine("Second-chance phase triggered."),
    createLogLine(`Rebound location: ${input.reboundLocation}.`),
    createLogLine(`${input.offensiveTeamName} finishing style: ${input.finishingStyle}.`),
    createLogLine(`Scramble danger: ${input.result.scrambleDanger.label}.`),
    createLogLine(`Outcome: ${formatOutcome(input.result.outcome)}.`),
    ...createSecondChanceEventChain(input),
    createLogLine("Reason:"),
    ...input.result.scrambleDanger.reasons.map((reason) => createLogLine(`- ${reason}`)),
    ...input.result.reboundControl.reasons.map((reason) => createLogLine(`- ${reason}`)),
    ...input.result.emergencyClearance.reasons.map((reason) => createLogLine(`- ${reason}`)),
    createLogLine(
      input.result.scoreUpdate === null
        ? "No score update from the second chance."
        : `${input.offensiveTeamName} +${input.result.scoreUpdate.points} (${formatScoring(input.result.scoreUpdate.scoringType)}).`,
    ),
  ];
}
