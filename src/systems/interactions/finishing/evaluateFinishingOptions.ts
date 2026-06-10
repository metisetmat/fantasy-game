import { LateralCorridor, type ZoneId } from "../../../core/zones";
import { SCORING_POINTS, ScoringType } from "../../../models/scoring";
import { BallUsageStyle, TacticalStyle } from "../../../models/tactics";
import type { SpatialTeamContext, WeakSideEvaluation } from "../../spatial";
import { LaneAvailability, getZoneParts } from "../../spatial";
import type { AttackingDirection } from "../../spatial/intention";
import { clampInteractionRating } from "../shared/ratings";
import { evaluateFinishingLegality, getRelativeFinishingDepth } from "./evaluateFinishingLegality";
import { evaluateScoringValue } from "./evaluateScoringValue";
import { FinishingDangerLevel, FinishingDecision, type FinishingOptionEvaluation } from "./types";

function isCentralSpace(zoneId: ZoneId): boolean {
  return getZoneParts(zoneId).lateralCorridor === LateralCorridor.CentralAxis;
}

function labelForDecision(decision: FinishingDecision): string {
  switch (decision) {
    case FinishingDecision.TryAttempt:
      return "TRY_ATTEMPT";
    case FinishingDecision.GoalAttempt:
      return "GOAL_ATTEMPT";
    case FinishingDecision.DropAttempt:
      return "DROP_ATTEMPT";
  }
}

function scoringTypeForDecision(decision: FinishingDecision): ScoringType {
  switch (decision) {
    case FinishingDecision.TryAttempt:
      return ScoringType.Try;
    case FinishingDecision.GoalAttempt:
      return ScoringType.Goal;
    case FinishingDecision.DropAttempt:
      return ScoringType.Drop;
  }
}

function baseScoreForDecision(input: {
  readonly decision: FinishingDecision;
  readonly offensiveTeam: SpatialTeamContext;
  readonly activeZone: ZoneId;
  readonly territorialPressure: number;
  readonly weakSide: WeakSideEvaluation;
  readonly attackingDirection: AttackingDirection;
}): number {
  const footLean =
    input.offensiveTeam.tacticalInstructions.offensive.ballUsage === BallUsageStyle.FootOriented ? 16 : 0;
  const handLean =
    input.offensiveTeam.tacticalInstructions.offensive.ballUsage === BallUsageStyle.HandOriented ? 16 : 0;
  const weakSideOpen = input.weakSide.switchPlayOpportunity === LaneAvailability.Open;
  const relativeDepth = getRelativeFinishingDepth(input.activeZone, input.attackingDirection);

  switch (input.decision) {
    case FinishingDecision.TryAttempt:
      return clampInteractionRating(
        handLean +
          (relativeDepth >= 7 ? 32 : 8) +
          (weakSideOpen ? 18 : 6) +
          input.weakSide.exposure * 0.18 +
          input.offensiveTeam.tacticalInstructions.offensive.collectiveness * 0.1,
      );
    case FinishingDecision.GoalAttempt:
      return clampInteractionRating(
        footLean +
          (isCentralSpace(input.activeZone) ? 16 : 4) +
          input.offensiveTeam.tacticalInstructions.offensive.verticality * 0.16 +
          input.territorialPressure * 0.14,
      );
    case FinishingDecision.DropAttempt:
      return clampInteractionRating(
        footLean +
          (isCentralSpace(input.activeZone) ? 20 : 7) +
          input.territorialPressure * 0.16 +
          input.offensiveTeam.tacticalInstructions.offensive.riskLevel * 0.08,
      );
  }
}

export function evaluateFinishingOptions(input: {
  readonly offensiveTeam: SpatialTeamContext;
  readonly activeZone: ZoneId;
  readonly dangerLevel: FinishingDangerLevel;
  readonly territorialPressure: number;
  readonly weakSide: WeakSideEvaluation;
  readonly attackingDirection: AttackingDirection;
  readonly allowedScoringTypes?: readonly ScoringType[];
}): readonly FinishingOptionEvaluation[] {
  const allowedScoringTypes = input.allowedScoringTypes ?? [ScoringType.Try, ScoringType.Goal, ScoringType.Drop];
  const relativeDepth = getRelativeFinishingDepth(input.activeZone, input.attackingDirection);
  const tryLaneOpen = relativeDepth >= 7 && input.weakSide.exposure >= 55;
  const decisions: readonly FinishingDecision[] = [
    FinishingDecision.TryAttempt,
    FinishingDecision.GoalAttempt,
    FinishingDecision.DropAttempt,
  ];

  return decisions
    .filter((decision) => allowedScoringTypes.includes(scoringTypeForDecision(decision)))
    .map((decision): FinishingOptionEvaluation => {
      const scoringType = scoringTypeForDecision(decision);
      const legality = evaluateFinishingLegality({
        decision,
        activeZone: input.activeZone,
        dangerLevel: input.dangerLevel,
        territorialPressure: input.territorialPressure,
        attackingDirection: input.attackingDirection,
      });
      const scoringValue = evaluateScoringValue(scoringType);
      const baseScore = baseScoreForDecision({ ...input, decision });
      const tacticalContextModifier =
        decision === FinishingDecision.TryAttempt && relativeDepth >= 7
          ? 20
          : decision === FinishingDecision.DropAttempt && tryLaneOpen
            ? -18
            : decision === FinishingDecision.GoalAttempt && relativeDepth >= 7
              ? -16
              : input.dangerLevel === FinishingDangerLevel.High
                ? 8
                : 0;
      const teamIdentityModifier =
        input.offensiveTeam.tacticalStyle === TacticalStyle.Blitz && decision === FinishingDecision.TryAttempt
          ? 12
          : input.offensiveTeam.tacticalStyle === TacticalStyle.Control && decision === FinishingDecision.TryAttempt
            ? 6
            : 0;
      const conversionQualityModifier =
        input.offensiveTeam.collectiveProperties.collectiveReading * 0.08 +
        input.offensiveTeam.collectiveProperties.cohesion * 0.06;
      const defensiveResponseModifier =
        decision === FinishingDecision.DropAttempt && tryLaneOpen ? -8 : input.weakSide.exposure >= 65 ? 8 : 0;
      const rawScore =
        baseScore +
        scoringValue.modifier +
        tacticalContextModifier +
        teamIdentityModifier +
        conversionQualityModifier +
        defensiveResponseModifier;
      const finalScore = legality.legal ? clampInteractionRating(rawScore) : null;

      return {
        decision,
        scoringType,
        label: labelForDecision(decision),
        points: SCORING_POINTS[scoringType],
        isLegal: legality.legal,
        legalReason: legality.reason,
        baseScore,
        scoringValueModifier: scoringValue.modifier,
        tacticalContextModifier,
        teamIdentityModifier,
        conversionQualityModifier: Math.round(conversionQualityModifier),
        defensiveResponseModifier,
        finalScore,
        factors: [
          legality.reason,
          `point value +${scoringValue.modifier}`,
          ...(tacticalContextModifier !== 0 ? [`tactical context ${tacticalContextModifier >= 0 ? "+" : ""}${tacticalContextModifier}`] : []),
          ...(teamIdentityModifier !== 0 ? [`team identity +${teamIdentityModifier}`] : []),
          ...(defensiveResponseModifier !== 0 ? [`defensive response ${defensiveResponseModifier >= 0 ? "+" : ""}${defensiveResponseModifier}`] : []),
        ],
      };
    })
    .sort((left, right) => (right.finalScore ?? -1) - (left.finalScore ?? -1));
}
