import { PressureLevel } from "../../models/match";
import { RecoveryStatus, SupportStatus, type PlayerMatchState } from "../players";

export enum DuelOutcome {
  CarrierWins = "CARRIER_WINS",
  NeutralContact = "NEUTRAL_CONTACT",
  DefenderWins = "DEFENDER_WINS",
  BallLoose = "BALL_LOOSE",
  SupportSecures = "SUPPORT_SECURES",
}

export enum LooseBallOutcome {
  CleanReception = "CLEAN_RECEPTION",
  ContestedReception = "CONTESTED_RECEPTION",
  LooseBall = "LOOSE_BALL",
  Interception = "INTERCEPTION",
  Scramble = "SCRAMBLE",
}

export enum ControlOutcome {
  OrientedControl = "ORIENTED_CONTROL",
  LooseControl = "LOOSE_CONTROL",
  SlowedAction = "SLOWED_ACTION",
  TurnoverRisk = "TURNOVER_RISK",
}

export enum ContactDeflectionOutcome {
  BallRetained = "BALL_RETAINED",
  BallSlowed = "BALL_SLOWED",
  BallLoose = "BALL_LOOSE",
  Rebound = "REBOUND",
}

export enum OrientedReceptionOutcome {
  FaceForward = "FACE_FORWARD",
  SideOn = "SIDE_ON",
  UnderPressure = "UNDER_PRESSURE",
  ReceivesBackward = "RECEIVES_BACKWARD",
}

export enum BrokenTackleOutcome {
  TackleBroken = "TACKLE_BROKEN",
  Slowed = "SLOWED",
  Stopped = "STOPPED",
  BallExposed = "BALL_EXPOSED",
}

export function resolveDuel(input: {
  readonly carrier: PlayerMatchState;
  readonly defender: PlayerMatchState;
  readonly support: readonly PlayerMatchState[];
}): DuelOutcome {
  const supportBonus = input.support.filter((player) => player.supportStatus !== SupportStatus.Late).length * 8;
  const carrierScore = input.carrier.momentum + (100 - input.carrier.fatigue) * 0.25 + supportBonus;
  const defenderScore = input.defender.pressure + (input.defender.recoveryStatus === RecoveryStatus.LastLine ? 18 : 0);
  const margin = carrierScore - defenderScore;

  if (margin >= 22) {
    return DuelOutcome.CarrierWins;
  }

  if (margin >= 8) {
    return DuelOutcome.SupportSecures;
  }

  if (margin <= -18) {
    return DuelOutcome.DefenderWins;
  }

  if (margin <= -8) {
    return DuelOutcome.BallLoose;
  }

  return DuelOutcome.NeutralContact;
}

export function resolveFloatingBall(input: {
  readonly passQuality: number;
  readonly pressure: PressureLevel;
  readonly receptionSkill: number;
  readonly chaos: number;
  readonly nearbyPlayers: number;
}): LooseBallOutcome {
  const pressurePenalty = input.pressure === PressureLevel.High ? 22 : input.pressure === PressureLevel.Medium ? 10 : 3;
  const score = input.passQuality * 0.35 + input.receptionSkill * 0.35 + input.nearbyPlayers * 5 - pressurePenalty - input.chaos * 0.18;

  if (score >= 64) {
    return LooseBallOutcome.CleanReception;
  }

  if (score >= 48) {
    return LooseBallOutcome.ContestedReception;
  }

  if (score >= 34) {
    return LooseBallOutcome.LooseBall;
  }

  return input.nearbyPlayers >= 3 ? LooseBallOutcome.Scramble : LooseBallOutcome.Interception;
}

export function resolveImperfectControl(input: {
  readonly handling: number;
  readonly pressure: number;
  readonly fatigue: number;
  readonly receiverSupported: boolean;
}): ControlOutcome {
  const score = input.handling - input.pressure * 0.32 - input.fatigue * 0.2 + (input.receiverSupported ? 12 : -10);

  if (score >= 62) {
    return ControlOutcome.OrientedControl;
  }

  if (score >= 44) {
    return ControlOutcome.SlowedAction;
  }

  if (score >= 28) {
    return ControlOutcome.LooseControl;
  }

  return ControlOutcome.TurnoverRisk;
}

export function resolveDeflectedContact(input: {
  readonly defenderTiming: number;
  readonly contactDominance: number;
  readonly ballSecurity: number;
  readonly supportTiming: SupportStatus;
}): ContactDeflectionOutcome {
  const supportBonus = input.supportTiming === SupportStatus.Connected || input.supportTiming === SupportStatus.ThirdMan ? 12 : input.supportTiming === SupportStatus.Late ? -8 : -14;
  const score = input.ballSecurity + input.contactDominance * 0.3 + supportBonus - input.defenderTiming * 0.35;

  if (score >= 60) {
    return ContactDeflectionOutcome.BallRetained;
  }

  if (score >= 42) {
    return ContactDeflectionOutcome.BallSlowed;
  }

  if (score >= 26) {
    return ContactDeflectionOutcome.BallLoose;
  }

  return ContactDeflectionOutcome.Rebound;
}

export function resolveOrientedReception(input: {
  readonly technique: number;
  readonly vision: number;
  readonly pressure: PressureLevel;
  readonly forwardMove: boolean;
}): OrientedReceptionOutcome {
  const pressurePenalty = input.pressure === PressureLevel.High ? 24 : input.pressure === PressureLevel.Medium ? 11 : 3;
  const score = input.technique * 0.45 + input.vision * 0.35 - pressurePenalty + (input.forwardMove ? 6 : 0);

  if (score >= 64) {
    return OrientedReceptionOutcome.FaceForward;
  }

  if (score >= 48) {
    return OrientedReceptionOutcome.SideOn;
  }

  if (score >= 32) {
    return OrientedReceptionOutcome.UnderPressure;
  }

  return OrientedReceptionOutcome.ReceivesBackward;
}

export function resolveBrokenTackle(input: {
  readonly carrierPower: number;
  readonly carrierExplosiveness: number;
  readonly defenderTiming: number;
  readonly fatigue: number;
  readonly supportConnected: boolean;
}): BrokenTackleOutcome {
  const score = input.carrierPower * 0.32 + input.carrierExplosiveness * 0.34 - input.defenderTiming * 0.35 - input.fatigue * 0.18 + (input.supportConnected ? 10 : -8);

  if (score >= 58) {
    return BrokenTackleOutcome.TackleBroken;
  }

  if (score >= 42) {
    return BrokenTackleOutcome.Slowed;
  }

  if (score >= 26) {
    return BrokenTackleOutcome.Stopped;
  }

  return BrokenTackleOutcome.BallExposed;
}

export function resolveLateSupport(input: {
  readonly zoneDistance: number;
  readonly mobility: number;
  readonly fatigue: number;
  readonly tacticalVision: number;
  readonly chaos: number;
}): SupportStatus {
  const score = input.mobility * 0.34 + input.tacticalVision * 0.34 - input.zoneDistance * 12 - input.fatigue * 0.16 - input.chaos * 0.12;

  if (score >= 58) {
    return SupportStatus.Connected;
  }

  if (score >= 42) {
    return SupportStatus.ThirdMan;
  }

  if (score >= 24) {
    return SupportStatus.Late;
  }

  return SupportStatus.Isolated;
}
