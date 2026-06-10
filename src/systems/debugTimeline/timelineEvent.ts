import type { TeamId } from "../../core/ids";
import type { TacticalTick } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import type { BallContext } from "../spatial/intention";
import type { SequenceInteractionKind, SequenceTacticalContext } from "../sequences";
import type { CanonicalEventActorModel } from "../events";
import type { IntentChange } from "../intent";
import type { BallZoneContract } from "../ball";
import type { ActionSemanticContract } from "../actions";

export type DebugTimelineEventId = string;

export interface DebugWorldStateSummary {
  readonly tick: TacticalTick;
  readonly phaseState: string;
  readonly possessionTeamId: TeamId;
  readonly ballZone: ZoneId;
  readonly chaosLevel: number;
  readonly territorialPressure: number;
  readonly currentDanger: string;
  readonly possessionStability: string;
}

export interface DebugTimelineActor {
  readonly teamId: TeamId;
  readonly role: string;
  readonly ballZone: ZoneId;
}

export interface DebugTimelineUtilityScore {
  readonly label: string;
  readonly value: number;
  readonly max: number;
}

export interface DebugTimelineSpatialFacts {
  readonly fromZone: ZoneId;
  readonly toZone: ZoneId;
  readonly attackingDirection: string;
  readonly weakSideExposure: string;
  readonly pressureLevel: string;
}

export interface DebugTimelineSelectedAction {
  readonly interaction: SequenceInteractionKind;
  readonly targetZone: ZoneId;
  readonly tacticalTargetCluster?: ZoneId | undefined;
  readonly actualBallZoneAfter?: ZoneId | undefined;
  readonly ballZoneAfterSemantics?: string | undefined;
  readonly possessionTeamIdAfter: TeamId;
}

export interface DebugTimelineResolverOutcome {
  readonly outcome: string;
  readonly summary: string;
}

export interface DebugTimelineStateChange {
  readonly field: string;
  readonly before: string | number;
  readonly after: string | number;
}

export interface DebugTimelineSeedInfo {
  readonly initialSeed: number;
  readonly eventSeed: number;
  readonly deterministicRoll: number;
}

export interface DebugTimelineEvent {
  readonly id: DebugTimelineEventId;
  readonly eventId: DebugTimelineEventId;
  readonly sequenceNumber: number;
  readonly actionNumber: number;
  readonly tick: TacticalTick;
  readonly timestampMs: number;
  readonly eventType: string;
  readonly possessionTeamId: TeamId;
  readonly ballZone: ZoneId;
  readonly ballCarrierId: string | null;
  readonly actorModel: CanonicalEventActorModel | null;
  readonly worldStateBeforeHash: string;
  readonly worldStateAfterHash: string;
  readonly playerStateChanges: readonly string[];
  readonly ballCarrierBeforeId: string | null;
  readonly ballCarrierAfterId: string | null;
  readonly receiverId: string | null;
  readonly goalkeeperId: string | null;
  readonly snapshotBeforePath: string | null;
  readonly snapshotAfterPath: string | null;
  readonly playerIntentSummaryBefore: readonly string[];
  readonly playerIntentSummaryAfter: readonly string[];
  readonly actorPrimaryIntent: string | null;
  readonly receiverPrimaryIntent: string | null;
  readonly decisionActorIntent: string | null;
  readonly selectedReceiverIntent: string | null;
  readonly postActionCarrierIntent: string | null;
  readonly defenderIntentSummary: readonly string[];
  readonly intentChanges: readonly IntentChange[];
  readonly intentDebugLabel: string;
  readonly trajectorySummary: readonly string[];
  readonly arrivalTiming: readonly string[];
  readonly movementFacts: readonly string[];
  readonly worldStateSummary: DebugWorldStateSummary;
  readonly stateBeforeSummary: DebugWorldStateSummary;
  readonly stateAfterSummary: DebugWorldStateSummary;
  readonly actor: DebugTimelineActor;
  readonly actorId: string | null;
  readonly actorRole: string | null;
  readonly actorIntent: string | null;
  readonly intent: string;
  readonly utilityScores: readonly DebugTimelineUtilityScore[];
  readonly spatialFacts: DebugTimelineSpatialFacts;
  readonly selectedAction: DebugTimelineSelectedAction | null;
  readonly ballZoneContract?: BallZoneContract | undefined;
  readonly actionSemanticContract?: ActionSemanticContract | undefined;
  readonly resolverInputs: Record<string, string | number | boolean | null>;
  readonly resolverOutcome: DebugTimelineResolverOutcome;
  readonly stateChanges: readonly DebugTimelineStateChange[];
  readonly seedInfo: DebugTimelineSeedInfo;
  readonly reportAnchors: readonly string[];
  readonly reportClaimRefs: readonly string[];
}

export interface DebugTimelineReplay {
  readonly version: 1;
  readonly seed: number;
  readonly generatedFrom: "mini_match";
  readonly events: readonly DebugTimelineEvent[];
}

export interface DebugTimelineStepInput {
  readonly sequenceNumber: number;
  readonly actionNumber: number;
  readonly tick: TacticalTick;
  readonly interaction: SequenceInteractionKind;
  readonly contextBefore: SequenceTacticalContext;
  readonly contextAfter: SequenceTacticalContext;
  readonly ballContextBefore: BallContext;
  readonly ballContextAfter: BallContext;
  readonly ballZoneContract?: BallZoneContract | undefined;
  readonly resolverOutcome: DebugTimelineResolverOutcome;
}
