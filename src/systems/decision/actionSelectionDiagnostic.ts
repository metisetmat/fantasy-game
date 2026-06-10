import type { PlayerMatchState } from "../players";
import type { AttackingDirection } from "../spatial/intention";
import {
  ReceptionFollowUpRole,
  ReceptionQualityLevel,
  classifyBallRelation,
  type ReceptionQualityEvaluation,
} from "../spatial/receptionQuality";
import { laneStateForReception, type ReceptionChain } from "../tactics";
import { chainPath } from "../tactics/receptionChains";
import type { ActionSelectionScoringBreakdown, ScoreComponent } from "./actionSelectionScoringBreakdown";
import { sumScoreComponents } from "./actionSelectionScoringBreakdown";

export type ActionSelectionVerdict =
  | "CLEARLY_JUSTIFIED"
  | "REASONABLE_BUT_CONSERVATIVE"
  | "TOO_CONSERVATIVE"
  | "TOO_RISKY"
  | "INCOHERENT";

export type CandidateActionAvailability =
  | "AVAILABLE_NOW"
  | "LIMITED_WINDOW"
  | "FUTURE_WINDOW"
  | "NOT_AVAILABLE_NOW"
  | "HOLD_AVAILABLE";

export type CandidateActionType =
  | "SAFE_RECYCLE"
  | "CENTRAL_RECYCLE"
  | "WEAK_SIDE_SUPPORT"
  | "SHORT_INTERIOR_SUPPORT"
  | "CONTACT_PLATFORM_PASS"
  | "WEAK_SIDE_RUPTURE"
  | "SMALL_SIDE_RESET"
  | "CARRY_OR_HOLD";

export type EliteOverrideStatus =
  | "NOT_NEEDED"
  | "PLAYABLE_RISK"
  | "BLOCKED_BY_CLOSED_LANE"
  | "NOT_JUSTIFIED";

export type SelectionAdjustmentCode =
  | "CONTROL_PRESSURE_ESCAPE_PRIORITY"
  | "SAFEST_FIRST_PASS_OUTLET"
  | "REST_DEFENSE_PRESERVED"
  | "SUPPORT_CLUSTER_MATCH"
  | "POSSESSION_STABILIZATION_UNDER_HIGH_PRESSURE"
  | "PHASE_STATE_MATCH"
  | "DOES_NOT_ESCAPE_PRIMARY_PRESSURE"
  | "WEAK_SIDE_TOO_EARLY"
  | "SUPPORT_CLUSTER_MISMATCH"
  | "REQUIRES_SECOND_ACTION_BEFORE_VALUE"
  | "SELECTION_RISK_TOO_HIGH_FOR_CONTROL"
  | "NOT_IMMEDIATE_ENOUGH_UNDER_HIGH_PRESSURE"
  | "LANE_CLOSED"
  | "ACTION_NOT_AVAILABLE_NOW";

export interface SelectionAdjustment {
  readonly code: SelectionAdjustmentCode;
  readonly value: number;
  readonly reason: string;
}

export interface ActionSelectionCandidateDiagnostic {
  readonly action: string;
  readonly tacticalTargetZone: string;
  readonly selectedReceiver: string;
  readonly receiverResolvedZone: string;
  readonly actionType: CandidateActionType;
  readonly laneState: string;
  readonly actionAvailability: CandidateActionAvailability;
  readonly receptionQuality: ReceptionQualityLevel;
  readonly followUpRole: ReceptionFollowUpRole;
  readonly directValue: number;
  readonly chainValue: number;
  readonly bestChainPath: string;
  readonly chainAvailability: CandidateActionAvailability;
  readonly strictThirdManStatus: string;
  readonly risk: number;
  readonly styleFit: number;
  readonly pressureEscapeValue: number;
  readonly progressionValue: number;
  readonly retentionValue: number;
  readonly restDefenseImpact: number;
  readonly counterpressImpact: number;
  readonly weakSideImpact: number;
  readonly rawCandidateScore: number;
  readonly selectionAdjustments: readonly SelectionAdjustment[];
  readonly finalSelectionScore: number;
  readonly decisionScore: number;
  readonly selected: boolean;
  readonly eliteOverrideStatus: EliteOverrideStatus;
  readonly scoring: ActionSelectionScoringBreakdown;
  readonly selectionReason: string;
  readonly rejectionReason: string;
  readonly whySelectedOrRejected: string;
}

export interface ActionSelectionDiagnostic {
  readonly selectedAction: string;
  readonly verdict: ActionSelectionVerdict;
  readonly selectedFinalSelectionScore: number;
  readonly bestRejectedAlternative: string;
  readonly bestRejectedRawScore: number;
  readonly bestRejectedFinalScore: number;
  readonly higherRawScoreDemoted: boolean;
  readonly higherRawScoreDemotionReason: string;
  readonly overrideUsed: boolean;
  readonly decisionScore: number;
  readonly keyPositives: readonly string[];
  readonly keyNegatives: readonly string[];
  readonly mainRejectedAlternatives: readonly string[];
  readonly overConservatismPenalty: number;
  readonly overConservatismReason: string;
  readonly eliteOverrideCheck: string;
  readonly sacrifices: readonly string[];
  readonly expectedNextPhase: string;
  readonly candidates: readonly ActionSelectionCandidateDiagnostic[];
}

export interface ActionSelectionDiagnosticInput {
  readonly players: readonly PlayerMatchState[];
  readonly possessionTeamId: string;
  readonly ballCarrierId: string;
  readonly attackingDirection: AttackingDirection;
  readonly tacticalTargetZone: string;
  readonly selectedReceiverInitials: string;
  readonly receptionEvaluations: readonly ReceptionQualityEvaluation[];
  readonly receptionChains: readonly ReceptionChain[];
}

interface CandidateBlueprint {
  readonly receiverInitials: string;
  readonly actionType: CandidateActionType;
  readonly tacticalTargetZone: string | null;
  readonly selectedByDefault: boolean;
}

const CANDIDATE_BLUEPRINTS: readonly CandidateBlueprint[] = [
  { receiverInitials: "ML", actionType: "SAFE_RECYCLE", tacticalTargetZone: "Z3-C", selectedByDefault: true },
  { receiverInitials: "PV", actionType: "CENTRAL_RECYCLE", tacticalTargetZone: "Z3-C", selectedByDefault: false },
  { receiverInitials: "RP", actionType: "WEAK_SIDE_SUPPORT", tacticalTargetZone: null, selectedByDefault: false },
  { receiverInitials: "PM", actionType: "SHORT_INTERIOR_SUPPORT", tacticalTargetZone: null, selectedByDefault: false },
  { receiverInitials: "FL", actionType: "CONTACT_PLATFORM_PASS", tacticalTargetZone: null, selectedByDefault: false },
  { receiverInitials: "SH", actionType: "WEAK_SIDE_RUPTURE", tacticalTargetZone: null, selectedByDefault: false },
  { receiverInitials: "HL", actionType: "SMALL_SIDE_RESET", tacticalTargetZone: null, selectedByDefault: false },
  { receiverInitials: "TH", actionType: "CARRY_OR_HOLD", tacticalTargetZone: null, selectedByDefault: false },
];

function candidateAvailability(laneState: string, actionType: CandidateActionType): CandidateActionAvailability {
  if (actionType === "CARRY_OR_HOLD") {
    return "HOLD_AVAILABLE";
  }

  if (laneState === "OPEN") {
    return "AVAILABLE_NOW";
  }

  if (laneState === "CONTESTED") {
    return "LIMITED_WINDOW";
  }

  if (laneState === "TEMPORARY_WINDOW") {
    return "FUTURE_WINDOW";
  }

  return "NOT_AVAILABLE_NOW";
}

function strictStatusForChain(chain: ReceptionChain | undefined): string {
  if (chain === undefined) {
    return "NON_THIRD_MAN_CHAIN";
  }

  if (chain.strictThirdManValidation.status === "VALID") {
    return "VALID_THIRD_MAN_PROGRESSION";
  }

  if (chain.patternType === "SAFE_RECYCLE") {
    return "SAFE_RECYCLE";
  }

  return chain.strictThirdManValidation.status === "REJECTED" ? "REJECTED_THIRD_MAN" : "NON_THIRD_MAN_CHAIN";
}

function bestChainForReceiver(input: {
  readonly receiverInitials: string;
  readonly chains: readonly ReceptionChain[];
}): ReceptionChain | undefined {
  return input.chains
    .filter((chain) => chain.firstReceiverInitials === input.receiverInitials || chain.finalReceiverInitials === input.receiverInitials)
    .sort((left, right) => right.chainValue - left.chainValue)[0];
}

function relationBonus(input: {
  readonly receiver: PlayerMatchState;
  readonly carrier: PlayerMatchState;
  readonly attackingDirection: AttackingDirection;
}): number {
  const relation = classifyBallRelation({
    receiverZone: input.receiver.zone,
    ballZone: input.carrier.zone,
    attackingDirection: input.attackingDirection,
  });

  return relation === "BEHIND" ? 10 : relation === "SAME_LINE" ? 5 : 0;
}

function pressureEscapeForAction(actionType: CandidateActionType, availability: CandidateActionAvailability): number {
  if (actionType === "SAFE_RECYCLE") {
    return availability === "NOT_AVAILABLE_NOW" ? 20 : 28;
  }

  if (actionType === "CENTRAL_RECYCLE" || actionType === "SMALL_SIDE_RESET") {
    return 22;
  }

  if (actionType === "WEAK_SIDE_SUPPORT" || actionType === "SHORT_INTERIOR_SUPPORT") {
    return 16;
  }

  if (actionType === "CARRY_OR_HOLD") {
    return 8;
  }

  return 10;
}

function styleFitForAction(actionType: CandidateActionType, availability: CandidateActionAvailability): number {
  const base =
    actionType === "SAFE_RECYCLE"
      ? 88
      : actionType === "CENTRAL_RECYCLE"
        ? 82
        : actionType === "WEAK_SIDE_SUPPORT" || actionType === "SHORT_INTERIOR_SUPPORT"
          ? 74
          : actionType === "SMALL_SIDE_RESET"
            ? 78
            : actionType === "CONTACT_PLATFORM_PASS"
              ? 58
              : actionType === "WEAK_SIDE_RUPTURE"
                ? 42
                : 46;

  return availability === "NOT_AVAILABLE_NOW" ? Math.max(20, base - 20) : base;
}

function restDefenseImpact(actionType: CandidateActionType): number {
  if (actionType === "SAFE_RECYCLE" || actionType === "CENTRAL_RECYCLE") {
    return 18;
  }

  if (actionType === "WEAK_SIDE_SUPPORT" || actionType === "SMALL_SIDE_RESET") {
    return 12;
  }

  if (actionType === "CARRY_OR_HOLD") {
    return 4;
  }

  return 6;
}

function counterpressImpact(actionType: CandidateActionType): number {
  if (actionType === "SAFE_RECYCLE" || actionType === "SHORT_INTERIOR_SUPPORT") {
    return 10;
  }

  if (actionType === "CENTRAL_RECYCLE" || actionType === "SMALL_SIDE_RESET") {
    return 8;
  }

  if (actionType === "WEAK_SIDE_RUPTURE") {
    return 2;
  }

  return 6;
}

function weakSideImpact(actionType: CandidateActionType, receiverInitials: string, chain: ReceptionChain | undefined): number {
  if (receiverInitials === "RP" || receiverInitials === "SH") {
    return 18;
  }

  if (chain !== undefined && chainPath(chain).includes("SH")) {
    return 16;
  }

  if (receiverInitials === "FL") {
    return 10;
  }

  return 4;
}

function eliteOverrideStatus(input: {
  readonly laneState: string;
  readonly actionType: CandidateActionType;
  readonly reception: ReceptionQualityEvaluation;
}): EliteOverrideStatus {
  if (input.actionType === "SAFE_RECYCLE" || input.actionType === "CENTRAL_RECYCLE") {
    return "NOT_NEEDED";
  }

  if (input.laneState === "CLOSED") {
    return "BLOCKED_BY_CLOSED_LANE";
  }

  if (
    (input.laneState === "CONTESTED" || input.laneState === "TEMPORARY_WINDOW") &&
    input.reception.quality !== ReceptionQualityLevel.Negative &&
    input.reception.turnoverRisk <= 62
  ) {
    return "PLAYABLE_RISK";
  }

  return "NOT_JUSTIFIED";
}

function availabilityPenalty(availability: CandidateActionAvailability): ScoreComponent | null {
  if (availability === "NOT_AVAILABLE_NOW") {
    return { label: "lane/action unavailable", value: -30, reason: "current lane state does not support the pass now" };
  }

  if (availability === "LIMITED_WINDOW") {
    return { label: "limited window", value: -10, reason: "pass is playable only through a contested window" };
  }

  if (availability === "FUTURE_WINDOW") {
    return { label: "future window", value: -12, reason: "timing needs one more action before the option is clean" };
  }

  return null;
}

function selectionAdjustmentsForCandidate(input: {
  readonly actionType: CandidateActionType;
  readonly availability: CandidateActionAvailability;
  readonly laneState: string;
  readonly risk: number;
}): readonly SelectionAdjustment[] {
  if (input.actionType === "SAFE_RECYCLE") {
    return [
      {
        code: "CONTROL_PRESSURE_ESCAPE_PRIORITY",
        value: 6,
        reason: "CONTROL prioritizes the first pass that releases the ball-side press.",
      },
      {
        code: "SAFEST_FIRST_PASS_OUTLET",
        value: 4,
        reason: "ML is the nearest half-space recycle outlet for the first escape pass.",
      },
      {
        code: "SUPPORT_CLUSTER_MATCH",
        value: 4,
        reason: "the selected receiver belongs to the intended Z3-C support cluster.",
      },
      {
        code: "POSSESSION_STABILIZATION_UNDER_HIGH_PRESSURE",
        value: 3,
        reason: "the action stabilizes possession before CONTROL tries the weak side.",
      },
    ];
  }

  if (input.actionType === "CENTRAL_RECYCLE") {
    return [
      { code: "REST_DEFENSE_PRESERVED", value: 4, reason: "central recycle protects the counterpress base." },
      { code: "SUPPORT_CLUSTER_MATCH", value: 2, reason: "PV also belongs to the support cluster." },
    ];
  }

  if (input.actionType === "WEAK_SIDE_SUPPORT") {
    return [
      {
        code: "DOES_NOT_ESCAPE_PRIMARY_PRESSURE",
        value: -14,
        reason: "RP has high weak-side upside but is not the cleanest first escape from the ball-side press.",
      },
      {
        code: "SUPPORT_CLUSTER_MISMATCH",
        value: -6,
        reason: "the selected tactical target is the Z3-C recycle cluster, not the far half-space outlet.",
      },
      {
        code: "WEAK_SIDE_TOO_EARLY",
        value: -4,
        reason: "CONTROL wants to secure the first pass before opening the weak-side continuation.",
      },
    ];
  }

  if (input.actionType === "SHORT_INTERIOR_SUPPORT") {
    return [
      {
        code: "NOT_IMMEDIATE_ENOUGH_UNDER_HIGH_PRESSURE",
        value: -8,
        reason: "PM can connect play, but the first touch is less secure than the recycle outlet.",
      },
      {
        code: "REQUIRES_SECOND_ACTION_BEFORE_VALUE",
        value: -6,
        reason: "PM's best value comes from the next combination rather than the first pressure escape.",
      },
    ];
  }

  if (input.actionType === "CONTACT_PLATFORM_PASS") {
    return [
      {
        code: input.laneState === "CLOSED" ? "LANE_CLOSED" : "SELECTION_RISK_TOO_HIGH_FOR_CONTROL",
        value: input.laneState === "CLOSED" ? -12 : -8,
        reason: "FL is a useful platform concept, but the first pass is not clean enough for CONTROL now.",
      },
      {
        code: "REQUIRES_SECOND_ACTION_BEFORE_VALUE",
        value: -8,
        reason: "the main value appears after the layoff, not on the first action.",
      },
    ];
  }

  if (input.actionType === "WEAK_SIDE_RUPTURE") {
    return [
      {
        code: input.availability === "NOT_AVAILABLE_NOW" ? "ACTION_NOT_AVAILABLE_NOW" : "SELECTION_RISK_TOO_HIGH_FOR_CONTROL",
        value: input.availability === "NOT_AVAILABLE_NOW" ? -14 : -10,
        reason: "SH is a real threat, but the rupture lane is not a CONTROL first-pass selection here.",
      },
      {
        code: "WEAK_SIDE_TOO_EARLY",
        value: -8,
        reason: "CONTROL waits for the weak-side lane to become playable rather than forcing it.",
      },
    ];
  }

  if (input.actionType === "CARRY_OR_HOLD") {
    return [
      {
        code: "DOES_NOT_ESCAPE_PRIMARY_PRESSURE",
        value: -12,
        reason: "holding keeps TH inside the press rather than moving the pressure point.",
      },
      {
        code: "SELECTION_RISK_TOO_HIGH_FOR_CONTROL",
        value: -8,
        reason: "continued carry is too risky for CONTROL with a recycle outlet available.",
      },
    ];
  }

  return input.risk >= 65
    ? [{ code: "SELECTION_RISK_TOO_HIGH_FOR_CONTROL", value: -8, reason: "risk is too high for CONTROL's first pass." }]
    : [{ code: "PHASE_STATE_MATCH", value: 2, reason: "the action broadly fits the possession phase." }];
}

function adjustedSelectionScore(rawCandidateScore: number, adjustments: readonly SelectionAdjustment[]): number {
  const adjustmentTotal = adjustments.reduce((sum, adjustment) => sum + adjustment.value, 0);

  return Math.max(0, Math.min(100, Math.round(rawCandidateScore + adjustmentTotal)));
}

function buildCandidate(input: {
  readonly blueprint: CandidateBlueprint;
  readonly carrier: PlayerMatchState;
  readonly receiver: PlayerMatchState;
  readonly reception: ReceptionQualityEvaluation;
  readonly chain: ReceptionChain | undefined;
  readonly selected: boolean;
  readonly attackingDirection: AttackingDirection;
}): ActionSelectionCandidateDiagnostic {
  const laneState = input.blueprint.actionType === "CARRY_OR_HOLD" ? "HOLD" : laneStateForReception(input.reception);
  const actionAvailability = candidateAvailability(laneState, input.blueprint.actionType);
  const pressureEscapeValue = pressureEscapeForAction(input.blueprint.actionType, actionAvailability);
  const progressionValue = input.reception.progressionValue;
  const retentionValue = input.reception.retentionValue;
  const chainValue = input.chain?.chainValue ?? Math.round(input.reception.nextActionValue);
  const styleFit = styleFitForAction(input.blueprint.actionType, actionAvailability);
  const risk = Math.round(
    input.blueprint.actionType === "CARRY_OR_HOLD"
      ? 68
      : Math.min(95, input.reception.turnoverRisk + (actionAvailability === "NOT_AVAILABLE_NOW" ? 22 : 0)),
  );
  const restImpact = restDefenseImpact(input.blueprint.actionType);
  const counterpress = counterpressImpact(input.blueprint.actionType);
  const weakSide = weakSideImpact(input.blueprint.actionType, input.receiver.roleInitials, input.chain);
  const eliteOverride = eliteOverrideStatus({
    laneState,
    actionType: input.blueprint.actionType,
    reception: input.reception,
  });
  const targetZone = input.blueprint.tacticalTargetZone ?? input.receiver.zone;
  const relation = relationBonus({
    receiver: input.receiver,
    carrier: input.carrier,
    attackingDirection: input.attackingDirection,
  });
  const bonuses: ScoreComponent[] = [
    { label: "pressure escape", value: pressureEscapeValue, reason: "helps TH escape the BLITZ pressure pocket" },
    { label: "retention", value: Math.round(retentionValue * 0.28), reason: "protects CONTROL possession" },
    { label: "progression", value: Math.round(progressionValue * 0.18), reason: "creates forward or next-phase access" },
    { label: "chain value", value: Math.round(chainValue * 0.16), reason: "accounts for the next receiver after this action" },
    { label: "style fit", value: Math.round(styleFit * 0.14), reason: "matches CONTROL patience and structure" },
    { label: "rest defense", value: restImpact, reason: "keeps the counterattack base intact" },
    { label: "counterpress", value: counterpress, reason: "keeps nearby support if possession is lost" },
    { label: "weak-side impact", value: weakSide, reason: "keeps or opens the far-side continuation" },
    { label: "ball relation", value: relation, reason: "behind/same-line support is easier to secure under pressure" },
  ];
  const penalties: ScoreComponent[] = [
    ...(availabilityPenalty(actionAvailability) === null ? [] : [availabilityPenalty(actionAvailability) as ScoreComponent]),
    { label: "turnover risk", value: -Math.round(risk * 0.35), reason: "risk adjusted by lane state and receiver pressure" },
    ...(input.blueprint.actionType === "SAFE_RECYCLE"
      ? [{ label: "no immediate progression", value: -8, reason: "the recycle stabilizes rather than breaks BLITZ" }]
      : []),
    ...(input.chain?.strictThirdManValidation.status === "REJECTED"
      ? [{ label: "strict third-man rejected", value: -8, reason: "chain concept exists but is not a formal third-man progression now" }]
      : []),
    ...(input.blueprint.actionType === "CARRY_OR_HOLD"
      ? [{ label: "invites pressure", value: -22, reason: "holding keeps TH inside the pressure pocket" }]
      : []),
  ];
  const rawCandidateScore = sumScoreComponents({ bonuses, penalties });
  const selectionAdjustments = selectionAdjustmentsForCandidate({
    actionType: input.blueprint.actionType,
    availability: actionAvailability,
    laneState,
    risk,
  });
  const finalSelectionScore = adjustedSelectionScore(rawCandidateScore, selectionAdjustments);
  const selectionReason =
    "selected because its final selection score is boosted by CONTROL pressure-escape priority, support-cluster fit, and possession stabilization under high pressure";
  const rejectionReason =
    input.blueprint.actionType === "WEAK_SIDE_SUPPORT"
      ? "RP has the highest raw upside, but its value is mostly second-phase weak-side support rather than the cleanest first pressure-escape pass."
      : input.blueprint.actionType === "CONTACT_PLATFORM_PASS"
        ? "FL is a valuable contact-platform concept, but the first lane is not playable enough for CONTROL now."
        : input.blueprint.actionType === "WEAK_SIDE_RUPTURE"
          ? "SH is a future weak-side threat, but the current lane is not available now."
          : `${input.receiver.roleInitials} loses at final selection because the first-pass selection value is lower than ML's pressure escape.`;
  const whySelectedOrRejected = input.selected ? selectionReason : rejectionReason;

  return {
    action: `${input.carrier.roleInitials} -> ${input.receiver.roleInitials}`,
    tacticalTargetZone: targetZone,
    selectedReceiver: input.receiver.roleInitials,
    receiverResolvedZone: input.receiver.zone,
    actionType: input.blueprint.actionType,
    laneState,
    actionAvailability,
    receptionQuality: input.reception.quality,
    followUpRole: input.reception.followUpRole,
    directValue: Math.round(input.reception.nextActionValue),
    chainValue,
    bestChainPath: input.chain === undefined ? "none" : chainPath(input.chain),
    chainAvailability: input.chain?.actions[0]?.laneState === "CLOSED" ? "NOT_AVAILABLE_NOW" : actionAvailability,
    strictThirdManStatus: strictStatusForChain(input.chain),
    risk,
    styleFit,
    pressureEscapeValue,
    progressionValue,
    retentionValue,
    restDefenseImpact: restImpact,
    counterpressImpact: counterpress,
    weakSideImpact: weakSide,
    rawCandidateScore,
    selectionAdjustments,
    finalSelectionScore,
    decisionScore: finalSelectionScore,
    selected: input.selected,
    eliteOverrideStatus: eliteOverride,
    scoring: {
      bonuses,
      penalties,
      finalScore: rawCandidateScore,
    },
    selectionReason,
    rejectionReason,
    whySelectedOrRejected,
  };
}

function holdReception(carrier: PlayerMatchState): ReceptionQualityEvaluation {
  return {
    playerId: carrier.playerId,
    roleInitials: carrier.roleInitials,
    role: carrier.role,
    zone: carrier.zone,
    ballRelation: "SAME_LINE",
    orientation: "carrier holds under pressure",
    pressure: carrier.pressure,
    initialQuality: ReceptionQualityLevel.Neutral,
    quality: ReceptionQualityLevel.Neutral,
    followUpRole: ReceptionFollowUpRole.HoldAndWait,
    upgradedQuality: null,
    upgradeReason: null,
    nextActionValue: 34,
    retentionValue: 46,
    progressionValue: 24,
    thirdManValue: 10,
    turnoverRisk: 72,
    styleFit: 42,
    explanation: "holding remains possible but invites the press to reload",
    why: "holding remains possible but invites the press to reload",
  };
}

function selectedVerdict(input: {
  readonly selected: ActionSelectionCandidateDiagnostic;
  readonly alternatives: readonly ActionSelectionCandidateDiagnostic[];
}): ActionSelectionVerdict {
  const bestPlayableAlternative = input.alternatives
    .filter((candidate) => candidate.actionAvailability !== "NOT_AVAILABLE_NOW")
    .sort((left, right) => right.finalSelectionScore - left.finalSelectionScore)[0];

  if (input.selected.finalSelectionScore >= 78 && bestPlayableAlternative !== undefined && input.selected.finalSelectionScore >= bestPlayableAlternative.finalSelectionScore - 6) {
    return "CLEARLY_JUSTIFIED";
  }

  if (bestPlayableAlternative !== undefined && bestPlayableAlternative.finalSelectionScore > input.selected.finalSelectionScore + 10) {
    return "TOO_CONSERVATIVE";
  }

  if (input.selected.risk >= 75) {
    return "TOO_RISKY";
  }

  return "REASONABLE_BUT_CONSERVATIVE";
}

export function diagnoseActionSelection(input: ActionSelectionDiagnosticInput): ActionSelectionDiagnostic {
  const carrier = input.players.find((player) => player.playerId === input.ballCarrierId);
  if (carrier === undefined) {
    return {
      selectedAction: "none",
      verdict: "INCOHERENT",
      selectedFinalSelectionScore: 0,
      bestRejectedAlternative: "none",
      bestRejectedRawScore: 0,
      bestRejectedFinalScore: 0,
      higherRawScoreDemoted: false,
      higherRawScoreDemotionReason: "cannot evaluate without carrier",
      overrideUsed: false,
      decisionScore: 0,
      keyPositives: [],
      keyNegatives: ["ball carrier missing"],
      mainRejectedAlternatives: [],
      overConservatismPenalty: 0,
      overConservatismReason: "cannot evaluate without carrier",
      eliteOverrideCheck: "elite override unavailable because carrier is missing",
      sacrifices: [],
      expectedNextPhase: "unknown",
      candidates: [],
    };
  }

  const candidates = CANDIDATE_BLUEPRINTS.flatMap((blueprint) => {
    const receiver = blueprint.receiverInitials === carrier.roleInitials
      ? carrier
      : input.players.find((player) => player.teamId === input.possessionTeamId && player.roleInitials === blueprint.receiverInitials);
    if (receiver === undefined) {
      return [];
    }

    const reception =
      blueprint.receiverInitials === carrier.roleInitials
        ? holdReception(carrier)
        : input.receptionEvaluations.find((evaluation) => evaluation.playerId === receiver.playerId) ?? holdReception(receiver);
    const chain = bestChainForReceiver({
      receiverInitials: blueprint.receiverInitials,
      chains: input.receptionChains,
    });

    return [
      buildCandidate({
        blueprint,
        carrier,
        receiver,
        reception,
        chain,
        selected: blueprint.receiverInitials === input.selectedReceiverInitials,
        attackingDirection: input.attackingDirection,
      }),
    ];
  }).sort((left, right) => {
    if (left.selected !== right.selected) {
      return left.selected ? -1 : 1;
    }

    return right.decisionScore - left.decisionScore;
  });
  const selected = candidates.find((candidate) => candidate.selected) ?? candidates[0];

  if (selected === undefined) {
    return {
      selectedAction: "none",
      verdict: "INCOHERENT",
      selectedFinalSelectionScore: 0,
      bestRejectedAlternative: "none",
      bestRejectedRawScore: 0,
      bestRejectedFinalScore: 0,
      higherRawScoreDemoted: false,
      higherRawScoreDemotionReason: "no action candidates were available",
      overrideUsed: false,
      decisionScore: 0,
      keyPositives: [],
      keyNegatives: ["no candidates generated"],
      mainRejectedAlternatives: [],
      overConservatismPenalty: 0,
      overConservatismReason: "no action candidates were available",
      eliteOverrideCheck: "elite override not evaluated",
      sacrifices: [],
      expectedNextPhase: "unknown",
      candidates: [],
    };
  }

  const alternatives = candidates.filter((candidate) => !candidate.selected);
  const bestAlternative = alternatives.sort((left, right) => right.finalSelectionScore - left.finalSelectionScore)[0];
  const bestRawAlternative = alternatives.sort((left, right) => right.rawCandidateScore - left.rawCandidateScore)[0];
  const overConservatismPenalty =
    bestAlternative !== undefined &&
    bestAlternative.actionAvailability !== "NOT_AVAILABLE_NOW" &&
    bestAlternative.finalSelectionScore > selected.finalSelectionScore + 8
      ? Math.min(18, bestAlternative.finalSelectionScore - selected.finalSelectionScore)
      : 0;
  const verdict = selectedVerdict({ selected, alternatives });
  const higherRawScoreDemoted =
    bestRawAlternative !== undefined && bestRawAlternative.rawCandidateScore > selected.rawCandidateScore;

  return {
    selectedAction: selected.action,
    verdict,
    selectedFinalSelectionScore: selected.finalSelectionScore,
    bestRejectedAlternative: bestAlternative?.action ?? "none",
    bestRejectedRawScore: bestAlternative?.rawCandidateScore ?? 0,
    bestRejectedFinalScore: bestAlternative?.finalSelectionScore ?? 0,
    higherRawScoreDemoted,
    higherRawScoreDemotionReason: higherRawScoreDemoted
      ? `${bestRawAlternative?.action ?? "an alternative"} has the higher rawCandidateScore, but is demoted because its value is mostly second-phase and less immediate as a first pressure-escape pass.`
      : "no rejected alternative has a higher rawCandidateScore than the selected action.",
    overrideUsed: false,
    decisionScore: selected.finalSelectionScore,
    keyPositives: [
      "absorbs BLITZ pressure without forcing a closed forward lane",
      "preserves CONTROL rest defense and support triangle",
      "lets ML rebuild the next possession phase from the resolved half-space recycle lane",
    ],
    keyNegatives: [
      "low immediate progression",
      "may invite BLITZ to keep pressing if the next pass is slow",
      "delays the FL/SH platform-to-weak-side concept",
    ],
    mainRejectedAlternatives: alternatives
      .slice()
      .sort((left, right) => right.finalSelectionScore - left.finalSelectionScore)
      .slice(0, 5)
      .map((candidate) => `${candidate.action}: ${candidate.whySelectedOrRejected}`),
    overConservatismPenalty,
    overConservatismReason:
      overConservatismPenalty === 0
        ? "OverConservatismPenalty = 0 because no alternative beats the selected finalSelectionScore after selection adjustments; higher raw-upside options are closed, contested, second-phase, or require a risky elite override."
        : `OverConservatismPenalty = ${overConservatismPenalty} because ${bestAlternative?.action ?? "an alternative"} has a higher finalSelectionScore while playable.`,
    eliteOverrideCheck:
      "elite override can upgrade CONTESTED/TEMPORARY lanes to PLAYABLE_RISK, but does not upgrade a CLOSED lane for CONTROL in this phase.",
    sacrifices: [
      "immediate vertical progression",
      "early weak-side rupture access",
      "contact-platform test into FL",
    ],
    expectedNextPhase:
      "ML receives under control, draws the first press line deeper, and looks to rebuild toward RP/PM or the delayed FL/SH weak-side concept.",
    candidates: [selected, ...alternatives.sort((left, right) => right.finalSelectionScore - left.finalSelectionScore)],
  };
}
