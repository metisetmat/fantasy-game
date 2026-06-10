import type { SpatialTeamContext } from "../../spatial";
import { clampInteractionRating } from "../../interactions/shared/ratings";
import type { FinishingCapabilityEvaluation, FinishingChoiceEvaluation } from "../../interactions/finishing";
import { evaluateComposure } from "./evaluateComposure";
import { evaluateConversionContext } from "./evaluateConversionContext";
import { evaluateFinishingExecution } from "./evaluateFinishingExecution";
import { evaluateFinishingStyle } from "./evaluateFinishingStyle";
import { ConversionIdentity, type ConversionContextEvaluation, type ConversionQualityEvaluation } from "./types";
import type { FinishingDangerLevel } from "./types";
import type { WeakSideEvaluation } from "../../spatial";

export interface ConversionQualityInput {
  readonly offensiveTeam: SpatialTeamContext;
  readonly defensiveTeam: SpatialTeamContext;
  readonly choice: FinishingChoiceEvaluation;
  readonly capability: FinishingCapabilityEvaluation;
  readonly dangerLevel: FinishingDangerLevel;
  readonly territorialPressure: number;
  readonly chaosLevel: number;
  readonly weakSide: WeakSideEvaluation;
  readonly defensiveScore: number;
  readonly goalkeeperResponse: number;
}

function estimateSupportQuality(team: SpatialTeamContext, choice: FinishingChoiceEvaluation): number {
  return clampInteractionRating(
    team.collectiveProperties.cohesion * 0.28 +
      team.collectiveProperties.collectiveReading * 0.22 +
      team.collectiveProperties.collectiveMobility * 0.18 +
      team.tacticalInstructions.offensive.collectiveness * 0.2 +
      choice.choiceConfidence * 0.12,
  );
}

function evaluateMessyDanger(input: {
  readonly styleIdentity: ConversionIdentity;
  readonly chaosLevel: number;
  readonly weakSideExposure: number;
  readonly defensiveSaturationScore: number;
  readonly context: ConversionContextEvaluation;
}): number {
  const styleBonus =
    input.styleIdentity === ConversionIdentity.ChaoticAggression
      ? 16
      : input.styleIdentity === ConversionIdentity.UnstableGenius
        ? 20
        : 0;

  return clampInteractionRating(
    input.chaosLevel * 0.24 +
      input.weakSideExposure * 0.18 +
      input.defensiveSaturationScore * 0.18 +
      input.context.qualityScore * 0.2 +
      styleBonus,
  );
}

export function evaluateConversionQuality(input: ConversionQualityInput): {
  readonly style: ReturnType<typeof evaluateFinishingStyle>;
  readonly context: ConversionContextEvaluation;
  readonly quality: ConversionQualityEvaluation;
} {
  const style = evaluateFinishingStyle(input.offensiveTeam);
  const context = evaluateConversionContext({
    dangerLevel: input.dangerLevel,
    chaosLevel: input.chaosLevel,
    territorialPressure: input.territorialPressure,
    weakSide: input.weakSide,
    defensiveRecoverySaturation: input.defensiveTeam.recoverySaturation.level,
    defensiveScore: input.defensiveScore,
    goalkeeperResponse: input.goalkeeperResponse,
  });
  const supportQuality = estimateSupportQuality(input.offensiveTeam, input.choice);
  const composureScore = evaluateComposure({
    baseComposure: input.capability.composure,
    tacticalDiscipline: input.offensiveTeam.collectiveProperties.tacticalDiscipline,
    cohesion: input.offensiveTeam.collectiveProperties.cohesion,
    chaosLevel: input.chaosLevel,
    style,
    context,
  });
  const executionScore = evaluateFinishingExecution({
    baseExecution: input.capability.technicalExecution,
    supportQuality,
    offensiveTransition: input.offensiveTeam.collectiveProperties.offensiveTransition,
    scoringType: input.choice.scoringType,
    style,
    context,
  });
  const messyDanger = evaluateMessyDanger({
    styleIdentity: style.identity,
    chaosLevel: input.chaosLevel,
    weakSideExposure: input.weakSide.exposure,
    defensiveSaturationScore: input.defensiveTeam.recoverySaturation.score,
    context,
  });
  const conversionQuality = clampInteractionRating(
    executionScore * 0.36 +
      composureScore * 0.28 +
      context.qualityScore * 0.2 +
      supportQuality * 0.1 +
      messyDanger * 0.06,
  );

  return {
    style,
    context,
    quality: {
      conversionQuality,
      composureScore,
      executionScore,
      messyDanger,
      breakdown: [
        { label: "finishing execution", value: executionScore },
        { label: "finishing composure", value: composureScore },
        { label: "context quality", value: context.qualityScore },
        { label: "support quality", value: supportQuality },
        { label: "messy danger", value: messyDanger },
      ],
    },
  };
}
