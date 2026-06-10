import { TacticalStyle } from "../../../models/tactics";
import { SequenceInteractionKind, SequenceLevel, type SequenceTacticalContext } from "../../sequences";
import { getDistortionProfile } from "./distortionProfiles";
import { StructuralDistortionLevel, type StructuralDistortionEvaluation } from "./types";

function clampRating(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function levelFromScore(score: number): StructuralDistortionLevel {
  if (score >= 82) {
    return StructuralDistortionLevel.Critical;
  }

  if (score >= 64) {
    return StructuralDistortionLevel.High;
  }

  if (score >= 38) {
    return StructuralDistortionLevel.Medium;
  }

  return StructuralDistortionLevel.Low;
}

function dangerScore(level: SequenceLevel): number {
  switch (level) {
    case SequenceLevel.High:
      return 24;
    case SequenceLevel.Medium:
      return 10;
    case SequenceLevel.Low:
      return 0;
  }
}

function stabilityRelief(level: SequenceLevel): number {
  switch (level) {
    case SequenceLevel.High:
      return 18;
    case SequenceLevel.Medium:
      return 8;
    case SequenceLevel.Low:
      return 0;
  }
}

export function evaluateStructuralDistortion(input: {
  readonly tacticalStyle: TacticalStyle;
  readonly isPossessionTeam: boolean;
  readonly interaction: SequenceInteractionKind;
  readonly context: SequenceTacticalContext;
  readonly after: boolean;
  readonly defensiveTransition: number;
  readonly tacticalDiscipline: number;
  readonly momentum: number;
}): StructuralDistortionEvaluation {
  const transitionStress =
    input.interaction === SequenceInteractionKind.OffensiveTransition ? 24 : 0;
  const finishingStress = input.interaction === SequenceInteractionKind.Finishing ? 16 : 0;
  const constructionRelief =
    input.interaction === SequenceInteractionKind.OffensiveConstruction ? 8 : 0;
  const styleStress =
    input.tacticalStyle === TacticalStyle.Blitz ? 12 : input.tacticalStyle === TacticalStyle.Control ? -8 : 4;
  const possessionMomentum = input.isPossessionTeam ? Math.max(0, input.momentum - 50) * 0.25 : 0;
  const defensiveRecovery =
    input.isPossessionTeam ? 0 : (input.defensiveTransition + input.tacticalDiscipline) * 0.16;
  const inertia = input.after ? 10 : 4;
  const rawScore =
    input.context.chaosLevel * 0.44 +
    dangerScore(input.context.currentDanger) +
    dangerScore(input.context.weakSideExposure) +
    transitionStress +
    finishingStress +
    styleStress +
    possessionMomentum +
    inertia -
    stabilityRelief(input.context.possessionStability) -
    defensiveRecovery -
    constructionRelief;
  const score = clampRating(Math.round(rawScore));
  const level = levelFromScore(score);
  const triggers = [
    ...(transitionStress > 0 ? ["transition window stretches structure"] : []),
    ...(finishingStress > 0 ? ["finishing phase pulls last line apart"] : []),
    ...(input.context.chaosLevel >= 65 ? ["high chaos prevents instant reformation"] : []),
    ...(input.context.weakSideExposure === SequenceLevel.High ? ["weak side exposure creates corridor holes"] : []),
    ...(input.tacticalStyle === TacticalStyle.Blitz ? ["BLITZ accepts aggressive structural distortion"] : []),
  ];
  const recoveryReasons = [
    `defensive transition ${input.defensiveTransition} / 100`,
    `tactical discipline ${input.tacticalDiscipline} / 100`,
    input.after ? "after-action inertia keeps players lagging" : "pre-action state carries residual lag",
  ];

  return {
    level,
    score,
    profile: getDistortionProfile(level),
    triggers: triggers.length === 0 ? ["stable tactical context keeps distortion small"] : triggers,
    recoveryReasons,
  };
}
