import { ScoringType } from "../../../models/scoring";
import { PlayerRole } from "../../../models/player";
import { getGoalFrameForDirection } from "../../../core/goalFrame";
import { getGroundingZoneForDirection } from "../../../core/scoringZones";
import { createBallContextLogs, type BallContext } from "../../spatial/intention";
import { createConversionQualityLogs } from "../../finishing/conversion";
import { createRecoverySaturationLogs } from "../../structure";
import { explainabilityLogs } from "../../explainability";
import { createLogLine } from "../shared/logging";
import type { TacticalLogLine } from "../shared";
import { getFinishingOutputReportLine, getFinishingResolutionType } from "./finishingOutputTaxonomy";
import { FinishingDecision, FinishingOutcome, type FinishingInteractionResult } from "./types";

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

function formatDecision(decision: FinishingDecision): string {
  switch (decision) {
    case FinishingDecision.DropAttempt:
      return "Drop";
    case FinishingDecision.GoalAttempt:
      return "Goal";
    case FinishingDecision.TryAttempt:
      return "Try";
  }
}

function formatScoreType(scoringType: ScoringType): string {
  switch (scoringType) {
    case ScoringType.Drop:
      return "Drop";
    case ScoringType.Penalty:
      return "Penalty";
    case ScoringType.Goal:
      return "Goal";
    case ScoringType.Try:
      return "Try";
    case ScoringType.Conversion:
      return "Conversion";
  }
}

function createFinishingOptionRankingLogs(input: FinishingLogInput): readonly TacticalLogLine[] {
  return [
    createLogLine("Finishing option ranking:"),
    createLogLine("| Option | Legal | Points | Score | Main factors |"),
    createLogLine("| --- | --- | --- | --- | --- |"),
    ...input.result.choice.options.map((option) =>
      createLogLine(
        `| ${option.label} | ${option.isLegal ? "YES" : "NO"} | ${option.points} | ${option.finalScore ?? "--"} | ${option.factors.slice(0, 3).join(" / ")} |`,
      ),
    ),
    createLogLine(`Selected finishing: ${input.result.choice.options.find((option) => option.decision === input.result.decision)?.label ?? formatDecision(input.result.decision)}.`),
    createLogLine("Rejected illegal finishing options:"),
    ...input.result.choice.options
      .filter((option) => !option.isLegal)
      .map((option) => createLogLine(`- ${option.label} rejected because ${option.legalReason}`)),
  ];
}

function createScoringTargetLogs(input: FinishingLogInput): readonly TacticalLogLine[] {
  const goalFrame = getGoalFrameForDirection(input.ballContext.attackingDirection);
  const groundingZone = getGroundingZoneForDirection({
    attackingDirection: input.ballContext.attackingDirection,
    sourceZone: input.result.event.activeZone,
  });

  if (input.result.decision === FinishingDecision.TryAttempt) {
    return [
      createLogLine(`Try attempt from ${input.result.event.activeZone} toward ${groundingZone}.`),
      createLogLine(`Grounding target: ${groundingZone}.`),
    ];
  }

  if (input.result.decision === FinishingDecision.DropAttempt) {
    return [
      createLogLine(`Kick target: above crossbar, centered on C lane.`),
      createLogLine(
        `Goal frame: ${goalFrame.widthMeters}m wide, crossbar ${goalFrame.crossbarHeightMeters}m, posts ${goalFrame.postHeightMeters}m on goal line ${goalFrame.lineDescription}.`,
      ),
    ];
  }

  return [
    createLogLine("Goal target: below crossbar inside 8m frame."),
    createLogLine(
      `Goal frame: ${goalFrame.widthMeters}m wide, crossbar ${goalFrame.crossbarHeightMeters}m, posts ${goalFrame.postHeightMeters}m on goal line ${goalFrame.lineDescription}.`,
    ),
  ];
}

function createFinishingEventChain(input: FinishingLogInput): readonly TacticalLogLine[] {
  const finisher = `${input.result.capability.actorInitials} (${formatRole(input.result.capability.actorRole)})`;
  const defender = `${input.result.goalkeeperResponse.responderInitials} (${formatRole(input.result.goalkeeperResponse.responderRole)})`;
  const groundingZone = getGroundingZoneForDirection({
    attackingDirection: input.ballContext.attackingDirection,
    sourceZone: input.result.event.activeZone,
  });

  if (input.result.decision === FinishingDecision.TryAttempt) {
    return [
      createLogLine("### Tactical Event Chain"),
      createLogLine(
        `${finisher} attacks the grounding lane from ${input.result.event.activeZone} toward ${groundingZone}.`,
      ),
      createLogLine(
        input.result.conversionQuality.composureScore >= 64
          ? `${input.offensiveTeamName} support arrives connected, allowing the carrier to stay balanced through contact.`
          : `${input.offensiveTeamName} support arrives late, forcing the carrier into a rushed grounding attempt.`,
      ),
      createLogLine(
        input.result.goalkeeperResponse.reactsLate
          ? `${defender} is late across the last line.`
          : `${defender} meets the carrier at the last line.`,
      ),
      createLogLine(
        input.result.scoreUpdate === null
          ? `The grounding contest stays alive instead of becoming clean points.`
          : `The ball is grounded in ${groundingZone}.`,
      ),
    ];
  }

  if (input.result.decision === FinishingDecision.DropAttempt) {
    return [
      createLogLine("### Tactical Event Chain"),
    createLogLine(`${finisher} sets for a drop attempt from ${input.result.event.activeZone}.`),
    createLogLine("The support screen holds the nearest pressure long enough for the kick release."),
    createLogLine(`${defender} tracks the flight toward the posts.`),
      createLogLine(
        input.result.scoreUpdate === null
          ? "The kick is contested before it can become clean points."
          : "The kick clears the crossbar between the posts.",
      ),
    ];
  }

  return [
    createLogLine("### Tactical Event Chain"),
    createLogLine(`${finisher} shapes a direct goal attempt from ${input.result.event.activeZone}.`),
    createLogLine("The attacking support line screens the recovery lane."),
    createLogLine(`${defender} reacts to protect the frame below the crossbar.`),
    createLogLine(
      input.result.scoreUpdate === null
        ? "The goal-frame attempt is denied before crossing cleanly."
        : "The ball crosses below the crossbar between the posts.",
    ),
  ];
}

function describeFinishingChoice(input: FinishingLogInput): readonly TacticalLogLine[] {
  if (input.result.decision === FinishingDecision.DropAttempt) {
    return [
      createLogLine("Drop selected:"),
      createLogLine("- quick points window available before the block fully resets"),
      createLogLine(
        input.result.conversionContext.contextQuality === "LAST_LINE_WINDOW"
          ? "- last defensive line is present, making deeper penetration less clean"
          : "- territorial pressure can be converted without forcing another pass",
      ),
      createLogLine(`- finishing quality ${input.result.conversionQuality.conversionQuality}`),
      ...explainabilityLogs([
        createLogLine("- point-value logic: Drop is worth 1 point and protects against a closed try lane"),
        createLogLine(`- direct grounding check: defensive score ${input.result.defensiveScore} / 100`),
      ]),
    ];
  }

  if (input.result.decision === FinishingDecision.TryAttempt) {
    return [
      createLogLine("Try selected:"),
      createLogLine("- weak-side or depth access is close enough to attack the line"),
      createLogLine(`- finishing context ${input.result.conversionContext.contextQuality}`),
      ...explainabilityLogs([
        createLogLine("- point-value logic: Try is worth 3 points, so it outranks Drop when the lane stays open"),
        createLogLine(`- finishing quality ${input.result.conversionQuality.conversionQuality} / 100`),
        createLogLine(`- defensive resistance ${input.result.defensiveScore} / 100`),
      ]),
    ];
  }

  return [
    createLogLine("Goal attempt selected:"),
    createLogLine("- central scoring lane is available before defensive recovery fully closes"),
    createLogLine(`- finishing context ${input.result.conversionContext.contextQuality}`),
    ...explainabilityLogs([
      createLogLine("- point-value logic: Goal is worth 3 points when central access is viable"),
      createLogLine(`- finishing capability ${input.result.capability.finishingCapability} / 100`),
    ]),
  ];
}

export interface FinishingLogInput {
  readonly result: Omit<FinishingInteractionResult, "logs">;
  readonly offensiveTeamName: string;
  readonly defensiveTeamName: string;
  readonly ballContext: BallContext;
  readonly defensiveRecoverySaturation: Parameters<typeof createRecoverySaturationLogs>[0]["saturation"];
}

export function createFinishingLogs(input: FinishingLogInput): readonly TacticalLogLine[] {
  const scoreUpdate = input.result.scoreUpdate;
  const createsSecondChance =
    input.result.outcome === FinishingOutcome.LiveRebound ||
    input.result.outcome === FinishingOutcome.SecondChance ||
    input.result.outcome === FinishingOutcome.ScrambleFinish;
  const responseRole = formatRole(input.result.goalkeeperResponse.responderRole);
  const responderLabel = `${input.result.goalkeeperResponse.responderInitials} (${responseRole})`;
  const finisherLabel = `${input.result.capability.actorInitials} (${formatRole(input.result.capability.actorRole)})`;
  const groundingZone = getGroundingZoneForDirection({
    attackingDirection: input.ballContext.attackingDirection,
    sourceZone: input.result.event.activeZone,
  });
  const outputResolution = getFinishingOutputReportLine({
    decision: input.result.decision,
    scoringType: input.result.scoringType,
    outcome: input.result.outcome,
    goalkeeperInvolved: input.result.goalkeeperResponse.responderIsGoalkeeper,
    groundingZone,
    defenderLabel: `${input.defensiveTeamName} ${responderLabel}`,
    finisherLabel,
  });
  const resolutionType = getFinishingResolutionType({
    decision: input.result.decision,
    scoringType: input.result.scoringType,
  });
  const lastLineResponseLine = input.result.goalkeeperResponse.reactsLate
    ? `${input.defensiveTeamName} ${responderLabel} reacts late.`
    : `${input.defensiveTeamName} ${responderLabel} sets early.`;
  const baseLogs = [
    createLogLine(`[Tick ${input.result.event.tick}]`),
    createLogLine(""),
    ...createBallContextLogs({
      teamName: input.offensiveTeamName,
      defendingTeamName: input.defensiveTeamName,
      ballContext: input.ballContext,
    }),
    createLogLine(`${input.offensiveTeamName} enters finishing phase.`),
    createLogLine(`Territorial pressure: ${input.result.territorialPressure} / 100.`),
    createLogLine(`Scoring danger: ${input.result.dangerLevel}.`),
    createLogLine(
      `${input.result.capability.actorInitials} (${formatRole(input.result.capability.actorRole)}) identifies space in ${input.result.event.activeZone}.`,
    ),
    createLogLine(
      `Utility AI finishing actor: ${input.result.capability.actorInitials} (${formatRole(input.result.capability.actorRole)}) selected from role, attributes, pressure, risk, team style, and scoring context.`,
    ),
    createLogLine(
      `GK eligible as finisher: ${
        input.result.capability.actorRole === PlayerRole.GoalkeeperFreeSafety ? "YES, selected actor is current contextual finisher" : "NO, specialist field finisher has higher contextual utility"
      }.`,
    ),
    createLogLine(`Finishing choice: ${formatDecision(input.result.decision)}.`),
    createLogLine(`Scoring resolution type: ${resolutionType}.`),
    ...createScoringTargetLogs(input),
    ...createFinishingOptionRankingLogs(input),
    ...explainabilityLogs([
      createLogLine("Finishing calculation:"),
      createLogLine(`- choice confidence ${input.result.choice.choiceConfidence} / 100`),
      createLogLine(`- finishing capability ${input.result.capability.finishingCapability} / 100`),
      createLogLine(`- finishing actor ${input.result.capability.actorInitials} (${formatRole(input.result.capability.actorRole)})`),
      ...input.result.capability.breakdown.slice(0, 4).map((entry) => createLogLine(`- ${entry.label} ${entry.value} / 100`)),
      createLogLine(`- finishing score ${input.result.finishingScore} / 100`),
      createLogLine(`- defensive protection ${input.result.defensiveProtection.protectionQuality} / 100`),
      createLogLine(`- ${responseRole} response ${input.result.goalkeeperResponse.responseQuality} / 100`),
      createLogLine(
        `- ${input.result.goalkeeperResponse.responderInitials} inputs: Hand Play ${input.result.goalkeeperResponse.visibleInputs.handPlay}, Vision ${input.result.goalkeeperResponse.visibleInputs.vision}, Composure ${input.result.goalkeeperResponse.visibleInputs.composure}, Speed ${input.result.goalkeeperResponse.visibleInputs.speed}`,
      ),
      createLogLine(`- derived goalkeeperResponse ${input.result.goalkeeperResponse.derivedGoalkeeperResponse} / 100`),
      createLogLine(`- rebound risk ${input.result.reboundRisk.reboundRisk} / 100`),
    ]),
    ...describeFinishingChoice(input),
    ...createFinishingEventChain(input),
    ...createConversionQualityLogs({
      teamName: input.offensiveTeamName,
      style: input.result.finishingStyle,
      context: input.result.conversionContext,
      quality: input.result.conversionQuality,
    }),
    ...createRecoverySaturationLogs({
      teamName: input.defensiveTeamName,
      saturation: input.defensiveRecoverySaturation,
    }),
  ];

  if (!input.result.legality.legal) {
    return [
      ...baseLogs,
      createLogLine("Finishing window denied by zone context."),
      createLogLine(`Reason: ${input.result.legality.reason}`),
      createLogLine("Sequence ends."),
    ];
  }

  return [
    ...baseLogs,
    createLogLine(lastLineResponseLine),
    createLogLine(`Finishing output: ${outputResolution.outputType}.`),
    createLogLine(outputResolution.reportLine),
    createLogLine(
      scoreUpdate === null
        ? "No score update."
        : `${input.offensiveTeamName} +${scoreUpdate.points} (${formatScoreType(scoreUpdate.scoringType)}).`,
    ),
    createLogLine(createsSecondChance ? "Second-chance phase follows." : "Sequence ends."),
  ];
}
