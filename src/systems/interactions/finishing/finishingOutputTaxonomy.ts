import { ScoringType } from "../../../models/scoring";
import { FinishingDecision, FinishingOutcome } from "./types";

export enum FinishingResolutionType {
  GoalAttempt = "GOAL_ATTEMPT",
  TryAttempt = "TRY_ATTEMPT",
  DropAttempt = "DROP_ATTEMPT",
  PenaltyAttempt = "PENALTY_ATTEMPT",
  ConversionAttempt = "CONVERSION_ATTEMPT",
}

export enum FinishingOutputType {
  GoalScored = "GOAL_SCORED",
  SavedByGoalkeeper = "SAVED_BY_GOALKEEPER",
  MissedFrame = "MISSED_FRAME",
  ReboundLive = "REBOUND_LIVE",
  TryScored = "TRY_SCORED",
  HeldUpByGoalkeeper = "HELD_UP_BY_GOALKEEPER",
  StoppedShort = "STOPPED_SHORT",
  LooseBallScramble = "LOOSE_BALL_SCRAMBLE",
  DropScored = "DROP_SCORED",
  DropMissed = "DROP_MISSED",
  DropChargedDown = "DROP_CHARGED_DOWN",
  PenaltyScored = "PENALTY_SCORED",
  PenaltyMissed = "PENALTY_MISSED",
  PenaltyChargedDown = "PENALTY_CHARGED_DOWN",
  ConversionScored = "CONVERSION_SCORED",
  ConversionMissed = "CONVERSION_MISSED",
}

export interface FinishingOutputContext {
  readonly decision: FinishingDecision;
  readonly scoringType: ScoringType;
  readonly outcome: FinishingOutcome;
  readonly goalkeeperInvolved: boolean;
  readonly groundingZone: string;
  readonly defenderLabel: string;
  readonly finisherLabel: string;
}

export interface FinishingOutputResolution {
  readonly resolutionType: FinishingResolutionType;
  readonly outputType: FinishingOutputType;
  readonly reportLine: string;
}

export function getFinishingResolutionType(input: {
  readonly decision: FinishingDecision;
  readonly scoringType: ScoringType;
}): FinishingResolutionType {
  if (input.scoringType === ScoringType.Penalty) {
    return FinishingResolutionType.PenaltyAttempt;
  }

  if (input.scoringType === ScoringType.Conversion) {
    return FinishingResolutionType.ConversionAttempt;
  }

  switch (input.decision) {
    case FinishingDecision.GoalAttempt:
      return FinishingResolutionType.GoalAttempt;
    case FinishingDecision.TryAttempt:
      return FinishingResolutionType.TryAttempt;
    case FinishingDecision.DropAttempt:
      return FinishingResolutionType.DropAttempt;
  }
}

function isLiveOutcome(outcome: FinishingOutcome): boolean {
  return (
    outcome === FinishingOutcome.LiveRebound ||
    outcome === FinishingOutcome.SecondChance ||
    outcome === FinishingOutcome.ScrambleFinish
  );
}

function resolveGoalOutput(input: FinishingOutputContext): FinishingOutputType {
  if (input.outcome === FinishingOutcome.GoalScored) {
    return FinishingOutputType.GoalScored;
  }

  if (input.outcome === FinishingOutcome.SavedAttempt || input.outcome === FinishingOutcome.LastDefenderSave) {
    return FinishingOutputType.SavedByGoalkeeper;
  }

  if (isLiveOutcome(input.outcome)) {
    return FinishingOutputType.ReboundLive;
  }

  return FinishingOutputType.MissedFrame;
}

function resolveTryOutput(input: FinishingOutputContext): FinishingOutputType {
  if (input.outcome === FinishingOutcome.TryScored || input.outcome === FinishingOutcome.ScrambleFinish) {
    return FinishingOutputType.TryScored;
  }

  if (
    input.goalkeeperInvolved &&
    (input.outcome === FinishingOutcome.SavedAttempt || input.outcome === FinishingOutcome.LastDefenderSave)
  ) {
    return FinishingOutputType.HeldUpByGoalkeeper;
  }

  if (isLiveOutcome(input.outcome)) {
    return FinishingOutputType.LooseBallScramble;
  }

  return FinishingOutputType.StoppedShort;
}

function resolveDropOutput(input: FinishingOutputContext): FinishingOutputType {
  if (input.outcome === FinishingOutcome.DropScored) {
    return FinishingOutputType.DropScored;
  }

  if (input.outcome === FinishingOutcome.BlockedAttempt || input.outcome === FinishingOutcome.LastDefenderSave) {
    return FinishingOutputType.DropChargedDown;
  }

  if (isLiveOutcome(input.outcome)) {
    return FinishingOutputType.ReboundLive;
  }

  return FinishingOutputType.DropMissed;
}

function resolvePenaltyOutput(input: FinishingOutputContext): FinishingOutputType {
  if (input.outcome === FinishingOutcome.DropScored || input.outcome === FinishingOutcome.GoalScored) {
    return FinishingOutputType.PenaltyScored;
  }

  if (input.outcome === FinishingOutcome.BlockedAttempt || input.outcome === FinishingOutcome.LastDefenderSave) {
    return FinishingOutputType.PenaltyChargedDown;
  }

  return FinishingOutputType.PenaltyMissed;
}

function resolveConversionOutput(input: FinishingOutputContext): FinishingOutputType {
  return input.outcome === FinishingOutcome.GoalScored || input.outcome === FinishingOutcome.DropScored
    ? FinishingOutputType.ConversionScored
    : FinishingOutputType.ConversionMissed;
}

function resolveOutputType(
  resolutionType: FinishingResolutionType,
  input: FinishingOutputContext,
): FinishingOutputType {
  switch (resolutionType) {
    case FinishingResolutionType.GoalAttempt:
      return resolveGoalOutput(input);
    case FinishingResolutionType.TryAttempt:
      return resolveTryOutput(input);
    case FinishingResolutionType.DropAttempt:
      return resolveDropOutput(input);
    case FinishingResolutionType.PenaltyAttempt:
      return resolvePenaltyOutput(input);
    case FinishingResolutionType.ConversionAttempt:
      return resolveConversionOutput(input);
  }
}

export function getFinishingOutputReportLine(input: FinishingOutputContext): FinishingOutputResolution {
  const resolutionType = getFinishingResolutionType(input);
  const outputType = resolveOutputType(resolutionType, input);

  switch (outputType) {
    case FinishingOutputType.GoalScored:
      return { resolutionType, outputType, reportLine: `${input.finisherLabel} scores a goal below the crossbar inside the 8m frame.` };
    case FinishingOutputType.SavedByGoalkeeper:
      return { resolutionType, outputType, reportLine: `${input.defenderLabel} saves the goal attempt inside the frame.` };
    case FinishingOutputType.MissedFrame:
      return { resolutionType, outputType, reportLine: `${input.finisherLabel} misses the goal frame.` };
    case FinishingOutputType.ReboundLive:
      return { resolutionType, outputType, reportLine: "The attempt spills live for a rebound contest." };
    case FinishingOutputType.TryScored:
      return { resolutionType, outputType, reportLine: `${input.finisherLabel} scores a try in ${input.groundingZone}.` };
    case FinishingOutputType.HeldUpByGoalkeeper:
      return { resolutionType, outputType, reportLine: `${input.defenderLabel} holds up the try attempt before legal grounding.` };
    case FinishingOutputType.StoppedShort:
      return { resolutionType, outputType, reportLine: `${input.finisherLabel} is stopped short of the in-goal grounding zone.` };
    case FinishingOutputType.LooseBallScramble:
      return { resolutionType, outputType, reportLine: `The try attempt becomes a loose-ball scramble near ${input.groundingZone}.` };
    case FinishingOutputType.DropScored:
      return { resolutionType, outputType, reportLine: `${input.finisherLabel} scores the drop above the crossbar between the posts.` };
    case FinishingOutputType.DropMissed:
      return { resolutionType, outputType, reportLine: `${input.finisherLabel} misses the drop above the crossbar.` };
    case FinishingOutputType.DropChargedDown:
      return { resolutionType, outputType, reportLine: `${input.defenderLabel} charges down the drop attempt before it clears.` };
    case FinishingOutputType.PenaltyScored:
      return { resolutionType, outputType, reportLine: `${input.finisherLabel} scores the penalty above the crossbar between the posts.` };
    case FinishingOutputType.PenaltyMissed:
      return { resolutionType, outputType, reportLine: `${input.finisherLabel} misses the penalty above the crossbar.` };
    case FinishingOutputType.PenaltyChargedDown:
      return { resolutionType, outputType, reportLine: `${input.defenderLabel} charges down the penalty attempt.` };
    case FinishingOutputType.ConversionScored:
      return { resolutionType, outputType, reportLine: `${input.finisherLabel} scores the conversion above the crossbar between the posts.` };
    case FinishingOutputType.ConversionMissed:
      return { resolutionType, outputType, reportLine: `${input.finisherLabel} misses the conversion above the crossbar.` };
  }
}
