import { ThreatLevel, type SpatialIntentionContext } from "../../spatial/intention/types";

function getSupportScore(context: SpatialIntentionContext): number {
  const collective = context.team.collectiveProperties;
  const instructions = context.team.tacticalInstructions.offensive;

  return Math.round(
    instructions.collectiveness * 0.34 +
      collective.cohesion * 0.22 +
      collective.collectiveMobility * 0.2 +
      collective.collectiveReading * 0.14 +
      collective.offensiveTransition * 0.1,
  );
}

export function evaluateExplosiveProjection(context: SpatialIntentionContext): number {
  const supportScore = getSupportScore(context);
  const dangerBoost = context.tacticalDanger === ThreatLevel.High ? 14 : 0;
  const scoringBoost = context.scoringThreat === ThreatLevel.High ? 12 : 0;

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        context.team.tacticalInstructions.offensive.verticality * 0.28 +
          context.team.collectiveProperties.offensiveTransition * 0.24 +
          supportScore * 0.18 +
          context.weakSide.exposure * 0.12 +
          context.chaosLevel * 0.06 +
          dangerBoost +
          scoringBoost,
      ),
    ),
  );
}
