import type { MatchInput, TacticalPlan } from "../../contracts/engineToCoach";
import type { ZoneId } from "../../core/zones";

export interface TacticalPlanInfluence {
  readonly sequenceCountModifier: number;
  readonly pressureBias: number;
  readonly riskBias: number;
  readonly targetZoneBias: readonly ZoneId[];
  readonly tags: readonly string[];
  readonly explanation: string;
  readonly homeSummary: string;
  readonly awaySummary: string;
  readonly matchEffectSummary: string;
}

export interface TacticalPlanInfluenceSummary {
  readonly homeSummary: string;
  readonly awaySummary: string;
  readonly matchEffectSummary: string;
}

function influenceForPlan(input: {
  readonly side: "home" | "away";
  readonly plan: TacticalPlan;
}): TacticalPlanInfluence {
  const tags: string[] = [`plan_${input.side}`];
  let sequenceCountModifier = 0;
  let pressureBias = 0;
  let riskBias = 0;

  if (input.plan.tempo === "fast") {
    sequenceCountModifier += 1;
    tags.push(`plan_${input.side}_tempo_fast`);
  } else if (input.plan.tempo === "slow") {
    sequenceCountModifier -= 1;
    tags.push(`plan_${input.side}_tempo_slow`);
  } else {
    tags.push(`plan_${input.side}_tempo_balanced`);
  }

  if (input.plan.riskLevel === "high") {
    sequenceCountModifier += 1;
    riskBias += 2;
    tags.push(`plan_${input.side}_risk_high`);
  } else if (input.plan.riskLevel === "low") {
    riskBias -= 1;
    tags.push(`plan_${input.side}_risk_low`);
  } else {
    tags.push(`plan_${input.side}_risk_medium`);
  }

  if (input.plan.pressingIntensity >= 75) {
    pressureBias += 2;
    tags.push(`plan_${input.side}_pressing_high`);
  } else if (input.plan.pressingIntensity <= 35) {
    pressureBias -= 1;
    tags.push(`plan_${input.side}_pressing_low`);
  } else {
    tags.push(`plan_${input.side}_pressing_balanced`);
  }

  tags.push(`plan_${input.side}_scoring_${input.plan.scoringBias}`);
  tags.push(`plan_${input.side}_attacking_${input.plan.attackingIntent}`);
  tags.push(`plan_${input.side}_defensive_${input.plan.defensiveIntent}`);
  tags.push(`plan_${input.side}_transition_${input.plan.transitionIntent}`);
  tags.push(`plan_${input.side}_line_${input.plan.defensiveLineHeight >= 70 ? "high" : input.plan.defensiveLineHeight <= 35 ? "low" : "balanced"}`);
  tags.push(`plan_${input.side}_rest_defense_${input.plan.restDefensePriority >= 75 ? "high" : input.plan.restDefensePriority <= 45 ? "low" : "balanced"}`);

  return {
    sequenceCountModifier,
    pressureBias,
    riskBias,
    targetZoneBias: input.plan.targetZones,
    tags,
    explanation: `${input.side} plan influence: tempo ${input.plan.tempo}, risk ${input.plan.riskLevel}, pressing ${input.plan.pressingIntensity}, scoring bias ${input.plan.scoringBias}.`,
    homeSummary: "",
    awaySummary: "",
    matchEffectSummary: "",
  };
}

function clampSequenceCount(value: number): number {
  return Math.max(5, Math.min(8, value));
}

function tempoLabel(value: TacticalPlan["tempo"]): string {
  switch (value) {
    case "slow":
      return "tempo lent";
    case "balanced":
      return "tempo équilibré";
    case "fast":
      return "tempo rapide";
  }
}

function riskLabel(value: TacticalPlan["riskLevel"]): string {
  switch (value) {
    case "low":
      return "risque bas";
    case "medium":
      return "risque moyen";
    case "high":
      return "risque élevé";
  }
}

function pressingLabel(value: TacticalPlan["pressingIntensity"]): string {
  if (value >= 75) {
    return "pressing haut";
  }

  if (value <= 35) {
    return "pressing bas";
  }

  return "pressing équilibré";
}

function teamPlanSummary(input: {
  readonly teamName: string;
  readonly plan: TacticalPlan;
}): string {
  return `${input.teamName} : ${tempoLabel(input.plan.tempo)}, ${riskLabel(input.plan.riskLevel)}, ${pressingLabel(input.plan.pressingIntensity)}.`;
}

export function createTacticalPlanInfluenceSummary(input: {
  readonly matchInput: MatchInput;
  readonly influence: TacticalPlanInfluence;
}): TacticalPlanInfluenceSummary {
  const changedSequenceCount = input.influence.sequenceCountModifier === 0
    ? "ne modifient pas le volume de séquences simulées"
    : input.influence.sequenceCountModifier > 0
      ? "augmentent le volume de séquences simulées"
      : "réduisent légèrement le volume de séquences simulées";

  return {
    homeSummary: teamPlanSummary({
      teamName: input.matchInput.homeTeam.name,
      plan: input.matchInput.homePlan,
    }),
    awaySummary: teamPlanSummary({
      teamName: input.matchInput.awayTeam.name,
      plan: input.matchInput.awayPlan,
    }),
    matchEffectSummary: `À ce stade, ces choix ${changedSequenceCount} et influencent surtout les zones de lecture du rapport, les repères tactiques et la façon dont les séquences sous pression sont exposées.`,
  };
}

export function createTacticalPlanInfluence(input: MatchInput): TacticalPlanInfluence {
  const homeInfluence = influenceForPlan({ side: "home", plan: input.homePlan });
  const awayInfluence = influenceForPlan({ side: "away", plan: input.awayPlan });
  const combinedSequenceModifier = homeInfluence.sequenceCountModifier + awayInfluence.sequenceCountModifier;
  const tags = [...homeInfluence.tags, ...awayInfluence.tags];
  const sequenceCountModifier = clampSequenceCount(6 + combinedSequenceModifier) - 6;
  const summary = createTacticalPlanInfluenceSummary({
    matchInput: input,
    influence: {
      sequenceCountModifier,
      pressureBias: homeInfluence.pressureBias + awayInfluence.pressureBias,
      riskBias: homeInfluence.riskBias + awayInfluence.riskBias,
      targetZoneBias: [...input.homePlan.targetZones, ...input.awayPlan.targetZones],
      tags,
      explanation: "",
      homeSummary: "",
      awaySummary: "",
      matchEffectSummary: "",
    },
  });

  return {
    sequenceCountModifier,
    pressureBias: homeInfluence.pressureBias + awayInfluence.pressureBias,
    riskBias: homeInfluence.riskBias + awayInfluence.riskBias,
    targetZoneBias: [...input.homePlan.targetZones, ...input.awayPlan.targetZones],
    tags,
    explanation: `${homeInfluence.explanation} ${awayInfluence.explanation} Adapter influence is intentionally limited to sequence count, report zones, event tags, and readable context.`,
    homeSummary: summary.homeSummary,
    awaySummary: summary.awaySummary,
    matchEffectSummary: summary.matchEffectSummary,
  };
}

export function sequenceCountFromPlanInfluence(input: {
  readonly baseSequenceCount: number;
  readonly influence: TacticalPlanInfluence;
}): number {
  return clampSequenceCount(input.baseSequenceCount + input.influence.sequenceCountModifier);
}

export function primaryZoneFromPlanInfluence(input: {
  readonly influence: TacticalPlanInfluence;
  readonly fallbackZone: ZoneId;
}): ZoneId {
  return input.influence.targetZoneBias[0] ?? input.fallbackZone;
}
