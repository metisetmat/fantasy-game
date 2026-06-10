import { SupportStatus, type PlayerMatchState } from "../players";
import { AttackingDirection } from "./intention";

export enum ReceptionQualityLevel {
  Excellent = "EXCELLENT",
  Positive = "POSITIVE",
  Neutral = "NEUTRAL",
  Negative = "NEGATIVE",
}

export enum ReceptionFollowUpRole {
  TurnAndProgress = "TURN_AND_PROGRESS",
  WallPass = "WALL_PASS",
  ThirdManSet = "THIRD_MAN_SET",
  SecureRecycle = "SECURE_RECYCLE",
  ContactPlatform = "CONTACT_PLATFORM",
  FastRelease = "FAST_RELEASE",
  HoldAndWait = "HOLD_AND_WAIT",
  Trapped = "TRAPPED",
  LikelyLoss = "LIKELY_LOSS",
}

export type BallRelation = "AHEAD" | "BEHIND" | "SAME_LINE";

export interface ReceptionQualityEvaluation {
  readonly playerId: string;
  readonly roleInitials: string;
  readonly role: string;
  readonly zone: string;
  readonly ballRelation: BallRelation;
  readonly orientation: string;
  readonly pressure: number;
  readonly initialQuality: ReceptionQualityLevel;
  readonly quality: ReceptionQualityLevel;
  readonly followUpRole: ReceptionFollowUpRole;
  readonly upgradedQuality: ReceptionQualityLevel | null;
  readonly upgradeReason: string | null;
  readonly nextActionValue: number;
  readonly retentionValue: number;
  readonly progressionValue: number;
  readonly thirdManValue: number;
  readonly turnoverRisk: number;
  readonly styleFit: number;
  readonly explanation: string;
  readonly why: string;
}

export interface ReceptionQualityInput {
  readonly receiver: PlayerMatchState;
  readonly ballCarrier: PlayerMatchState;
  readonly attackingDirection: AttackingDirection;
  readonly defendingPlayers: readonly PlayerMatchState[];
}

function zoneColumnIndex(zone: string): number {
  const match = /^Z([0-8])-/.exec(zone);
  return match?.[1] === undefined ? 4 : Number.parseInt(match[1], 10);
}

function laneName(zone: string): string {
  return zone.split("-")[1] ?? "C";
}

function laneDistance(leftZone: string, rightZone: string): number {
  const lanes = ["CL", "HSL", "C", "HSR", "CR"] as const;
  const left = lanes.indexOf(laneName(leftZone) as (typeof lanes)[number]);
  const right = lanes.indexOf(laneName(rightZone) as (typeof lanes)[number]);

  return Math.abs(Math.max(0, left) - Math.max(0, right));
}

function columnDistance(leftZone: string, rightZone: string): number {
  return Math.abs(zoneColumnIndex(leftZone) - zoneColumnIndex(rightZone));
}

export function classifyBallRelation(input: {
  readonly receiverZone: string;
  readonly ballZone: string;
  readonly attackingDirection: AttackingDirection;
}): BallRelation {
  const receiverColumn = zoneColumnIndex(input.receiverZone);
  const ballColumn = zoneColumnIndex(input.ballZone);

  if (receiverColumn === ballColumn) {
    return "SAME_LINE";
  }

  if (input.attackingDirection === AttackingDirection.Z1ToZ7) {
    return receiverColumn > ballColumn ? "AHEAD" : "BEHIND";
  }

  return receiverColumn < ballColumn ? "AHEAD" : "BEHIND";
}

function nearestDefenderPressure(input: {
  readonly receiver: PlayerMatchState;
  readonly defendingPlayers: readonly PlayerMatchState[];
}): number {
  const nearest = input.defendingPlayers.reduce<number>((best, defender) => {
    const distance = columnDistance(input.receiver.zone, defender.zone) + laneDistance(input.receiver.zone, defender.zone);
    return Math.min(best, distance);
  }, 99);
  const proximityPressure = nearest <= 0 ? 84 : nearest === 1 ? 62 : nearest === 2 ? 38 : 18;

  return Math.max(input.receiver.pressure, proximityPressure);
}

function inferOrientation(input: {
  readonly receiver: PlayerMatchState;
  readonly ballCarrier: PlayerMatchState;
  readonly relation: BallRelation;
  readonly pressure: number;
}): string {
  if (input.pressure >= 70) {
    return "closed body under pressure";
  }

  if (input.relation === "BEHIND") {
    return "front-foot recycle angle";
  }

  if (input.relation === "AHEAD" && laneDistance(input.receiver.zone, input.ballCarrier.zone) >= 2) {
    return "side-on forward angle";
  }

  if (input.relation === "AHEAD") {
    return "receives with pressure in front";
  }

  return "same-line support angle";
}

function inferFollowUpRole(input: {
  readonly receiver: PlayerMatchState;
  readonly relation: BallRelation;
  readonly pressure: number;
  readonly quality: ReceptionQualityLevel;
}): ReceptionFollowUpRole {
  if (input.quality === ReceptionQualityLevel.Negative && input.pressure >= 68) {
    return ReceptionFollowUpRole.Trapped;
  }

  if (input.quality === ReceptionQualityLevel.Negative) {
    return ReceptionFollowUpRole.LikelyLoss;
  }

  if (input.relation === "BEHIND") {
    return ReceptionFollowUpRole.SecureRecycle;
  }

  if (input.receiver.roleInitials === "FL") {
    return ReceptionFollowUpRole.ContactPlatform;
  }

  if (input.receiver.roleInitials === "PM" || input.receiver.roleInitials === "HL") {
    return input.pressure <= 58 ? ReceptionFollowUpRole.WallPass : ReceptionFollowUpRole.HoldAndWait;
  }

  if (input.receiver.roleInitials === "RP" || input.receiver.roleInitials === "LP") {
    return ReceptionFollowUpRole.FastRelease;
  }

  if (input.receiver.roleInitials === "SH" && input.relation === "AHEAD") {
    return ReceptionFollowUpRole.ThirdManSet;
  }

  return input.quality === ReceptionQualityLevel.Excellent
    ? ReceptionFollowUpRole.TurnAndProgress
    : ReceptionFollowUpRole.HoldAndWait;
}

function preservesAdvancedSupportReception(input: {
  readonly receiver: PlayerMatchState;
  readonly relation: BallRelation;
  readonly pressure: number;
}): boolean {
  if (input.relation !== "AHEAD" || input.pressure >= 90) {
    return false;
  }

  return input.receiver.roleInitials === "FL" || input.receiver.roleInitials === "SH";
}

function followUpValues(input: {
  readonly followUpRole: ReceptionFollowUpRole;
  readonly relation: BallRelation;
  readonly pressure: number;
  readonly quality: ReceptionQualityLevel;
}): {
  readonly nextActionValue: number;
  readonly retentionValue: number;
  readonly progressionValue: number;
  readonly thirdManValue: number;
  readonly turnoverRisk: number;
  readonly styleFit: number;
} {
  const baseRetention =
    input.quality === ReceptionQualityLevel.Excellent
      ? 92
      : input.quality === ReceptionQualityLevel.Positive
        ? 82
        : input.quality === ReceptionQualityLevel.Neutral
          ? 66
          : 36;
  const roleProgression =
    input.followUpRole === ReceptionFollowUpRole.TurnAndProgress
      ? 82
      : input.followUpRole === ReceptionFollowUpRole.ThirdManSet || input.followUpRole === ReceptionFollowUpRole.FastRelease
        ? 70
        : input.followUpRole === ReceptionFollowUpRole.WallPass || input.followUpRole === ReceptionFollowUpRole.ContactPlatform
          ? 58
          : input.followUpRole === ReceptionFollowUpRole.SecureRecycle
            ? 42
            : 22;
  const thirdMan =
    input.followUpRole === ReceptionFollowUpRole.ThirdManSet
      ? 82
      : input.followUpRole === ReceptionFollowUpRole.WallPass || input.followUpRole === ReceptionFollowUpRole.ContactPlatform
        ? 68
        : input.followUpRole === ReceptionFollowUpRole.FastRelease
          ? 56
          : 30;
  const risk = Math.max(
    8,
    Math.min(
      92,
      input.pressure * 0.62 +
        (input.quality === ReceptionQualityLevel.Negative ? 22 : input.quality === ReceptionQualityLevel.Neutral ? 8 : -8),
    ),
  );

  return {
    nextActionValue: Math.round((baseRetention * 0.34 + roleProgression * 0.34 + thirdMan * 0.2 + (100 - risk) * 0.12) * 10) / 10,
    retentionValue: Math.round(baseRetention),
    progressionValue: Math.round(roleProgression),
    thirdManValue: Math.round(thirdMan),
    turnoverRisk: Math.round(risk),
    styleFit: input.followUpRole === ReceptionFollowUpRole.SecureRecycle ? 88 : input.relation === "AHEAD" ? 62 : 74,
  };
}

export function evaluateReceptionQuality(input: ReceptionQualityInput): ReceptionQualityEvaluation {
  const relation = classifyBallRelation({
    receiverZone: input.receiver.zone,
    ballZone: input.ballCarrier.zone,
    attackingDirection: input.attackingDirection,
  });
  const pressure = nearestDefenderPressure({
    receiver: input.receiver,
    defendingPlayers: input.defendingPlayers,
  });
  const attributes = input.receiver.visibleAttributes;
  const controlScore =
    attributes === undefined
      ? 55
      : Math.round(
          attributes.handPlay * 0.22 +
            attributes.ballCarrying * 0.24 +
            attributes.composure * 0.24 +
            attributes.vision * 0.2 +
            attributes.speed * 0.1,
        );
  const supportPenalty =
    input.receiver.supportStatus === SupportStatus.Isolated ? 12 : input.receiver.supportStatus === SupportStatus.Late ? 6 : 0;
  const orientation = inferOrientation({
    receiver: input.receiver,
    ballCarrier: input.ballCarrier,
    relation,
    pressure,
  });
  const qualityScore =
    controlScore +
    (relation === "BEHIND" ? 14 : relation === "SAME_LINE" ? 0 : -5) -
    Math.round(pressure * 0.32) -
    supportPenalty;

  const rawQuality =
    qualityScore >= 78 && pressure < 36
      ? ReceptionQualityLevel.Excellent
      : qualityScore >= 58 && pressure < 56
        ? ReceptionQualityLevel.Positive
        : qualityScore >= 38
          ? ReceptionQualityLevel.Neutral
          : ReceptionQualityLevel.Negative;
  const quality =
    rawQuality === ReceptionQualityLevel.Negative &&
    preservesAdvancedSupportReception({
      receiver: input.receiver,
      relation,
      pressure,
    })
      ? ReceptionQualityLevel.Neutral
      : rawQuality;

  const why =
    quality === ReceptionQualityLevel.Excellent
      ? "can receive cleanly and continue forward immediately"
      : quality === ReceptionQualityLevel.Positive
        ? "can secure the ball and keep the next action alive"
        : quality === ReceptionQualityLevel.Neutral
          ? rawQuality === ReceptionQualityLevel.Negative
            ? "lane pressure makes the current pass difficult, but the receiver can still protect, lay off, or act as future support"
            : "can retain possession but is unlikely to progress immediately"
        : "is likely to be trapped or lose control under first pressure";
  const followUpRole = inferFollowUpRole({
    receiver: input.receiver,
    relation,
    pressure,
    quality,
  });
  const values = followUpValues({
    followUpRole,
    relation,
    pressure,
    quality,
  });

  return {
    playerId: input.receiver.playerId,
    roleInitials: input.receiver.roleInitials,
    role: input.receiver.role,
    zone: input.receiver.zone,
    ballRelation: relation,
    orientation,
    pressure,
    initialQuality: quality,
    quality,
    followUpRole,
    upgradedQuality: null,
    upgradeReason: null,
    nextActionValue: values.nextActionValue,
    retentionValue: values.retentionValue,
    progressionValue: values.progressionValue,
    thirdManValue: values.thirdManValue,
    turnoverRisk: values.turnoverRisk,
    styleFit: values.styleFit,
    explanation: `${why}; likely follow-up ${followUpRole}`,
    why,
  };
}

export function evaluateReceptionQualities(input: {
  readonly players: readonly PlayerMatchState[];
  readonly possessionTeamId: string;
  readonly ballCarrierId: string;
  readonly attackingDirection: AttackingDirection;
}): readonly ReceptionQualityEvaluation[] {
  const ballCarrier = input.players.find((player) => player.playerId === input.ballCarrierId);
  if (ballCarrier === undefined) {
    return [];
  }

  const teammates = input.players.filter((player) => player.teamId === input.possessionTeamId && player.playerId !== ballCarrier.playerId);
  const defenders = input.players.filter((player) => player.teamId !== input.possessionTeamId);

  return teammates.map((receiver) =>
    evaluateReceptionQuality({
      receiver,
      ballCarrier,
      attackingDirection: input.attackingDirection,
      defendingPlayers: defenders,
    }),
  );
}
