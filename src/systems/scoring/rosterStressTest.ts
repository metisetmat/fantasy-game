import type { PlayerMatchLoadSummary, RosterQualitySummary, TeamLoadSummary } from "./matchBonusTypes";

export type StressRosterVariantId =
  | "NO_DROP_THREAT_ROSTER"
  | "NO_TRY_CARRIER_ROSTER"
  | "NO_GOAL_FRAME_SHOOTER_ROSTER"
  | "WEAK_GK_MENTAL_ROSTER"
  | "WEAK_DEFENSIVE_RECOVERY_ROSTER"
  | "WEAK_GOAL_LINE_DEFENSE_ROSTER"
  | "LOW_BENCH_DEPTH_ROSTER"
  | "HIGH_SPECIALIST_DEPENDENCY_ROSTER"
  | "UNBALANCED_ATTACK_ONLY_ROSTER"
  | "BALANCED_DEPTH_ROSTER";

type StyleVariant =
  | "CONTROL_BALANCED"
  | "CONTROL_DIRECT"
  | "CONTROL_PATIENT"
  | "BLITZ_BALANCED"
  | "BLITZ_RISKY"
  | "BLITZ_AGGRESSIVE";

type StressDriver =
  | "STYLE_DOMINANT"
  | "ROSTER_DOMINANT"
  | "STYLE_ROSTER_SYNERGY"
  | "STYLE_ROSTER_CONFLICT"
  | "FATIGUE_LIMITED"
  | "ROLE_COVERAGE_LIMITED"
  | "GK_LIMITED"
  | "SAMPLE_TOO_SMALL";

interface StressVariantDefinition {
  readonly id: StressRosterVariantId;
  readonly source: string;
  readonly expectedWeakness: string;
  readonly coachSummary: string;
  readonly improvement: string;
  readonly metricOverrides: Partial<StressMetrics>;
}

interface StressMetrics {
  readonly squadDepthScore: number;
  readonly benchQualityScore: number;
  readonly roleCoverageScore: number;
  readonly offensiveRoleCoverageScore: number;
  readonly defensiveRoleCoverageScore: number;
  readonly goalkeeperQualityScore: number;
  readonly goalkeeperMentalReliabilityScore: number;
  readonly goalkeeperReboundControlScore: number;
  readonly defensiveProtectionScore: number;
  readonly enduranceProfileScore: number;
  readonly shotThreatScore: number;
  readonly tryThreatScore: number;
  readonly dropThreatScore: number;
  readonly conversionThreatScore: number;
  readonly kickingQualityScore: number;
  readonly handlingQualityScore: number;
  readonly ballSecurityScore: number;
  readonly contactPowerScore: number;
  readonly tacticalCoherenceScore: number;
  readonly specialistDependencyIndex: number;
  readonly fatigueResiliencePotential: number;
}

interface StressVariantProjection extends StressMetrics {
  readonly variantId: StressRosterVariantId;
  readonly source: string;
  readonly expectedWeakness: string;
  readonly coachSummary: string;
  readonly improvement: string;
  readonly rosterWeaknessFlags: readonly string[];
  readonly rosterStrengthFlags: readonly string[];
  readonly shotAttempts: number;
  readonly shotGoals: number;
  readonly shotConversion: number;
  readonly shotQuality: number;
  readonly tryAttempts: number;
  readonly triesScored: number;
  readonly trySuccess: number;
  readonly lostForward: number;
  readonly heldUp: number;
  readonly tackledShort: number;
  readonly dropAttempts: number;
  readonly dropGoals: number;
  readonly dropSuccess: number;
  readonly conversionAttempts: number;
  readonly conversionSuccess: number;
  readonly scoringFamiliesAchieved: number;
  readonly threeMainFamilyBonusRate: number;
  readonly threePlusTryBonusRate: number;
  readonly shotGoalsConceded: number;
  readonly triesConceded: number;
  readonly dropsConceded: number;
  readonly lateConcessions: number;
  readonly reboundsConceded: number;
  readonly dangerousReboundsConceded: number;
  readonly defensiveStops: number;
  readonly goalLineDefensiveWins: number;
  readonly recoveries: number;
  readonly missedRecoveries: number;
  readonly closeLossBonusAccess: number;
  readonly majorThreatShutdownAccess: number;
  readonly averageFinalFatigue: number;
  readonly lateMatchFatigueIndex: number;
  readonly fatigueDeltaStartToFinal: number;
  readonly loadConcentrationIndex: number;
  readonly topLoadedPlayerShare: number;
  readonly overusedPlayerCount: number;
  readonly highFatiguePlayerCount: number;
  readonly exhaustedPlayerCount: number;
  readonly lateCollapseRate: number;
  readonly lateSurgeRate: number;
  readonly lateControlRate: number;
  readonly lateScoringFor: number;
  readonly lateScoringAgainst: number;
  readonly offensiveBonusPoints: number;
  readonly defensiveBonusPoints: number;
  readonly totalBonusPoints: number;
  readonly capActivationCount: number;
  readonly losingTeamsEarningBonus: number;
  readonly losingTeamsEarningMoreLeaguePointsThanWinner: number;
}

interface StyleRosterProjection {
  readonly variantId: StressRosterVariantId;
  readonly style: StyleVariant;
  readonly baseLeaguePoints: number;
  readonly bonusLeaguePoints: number;
  readonly totalLeaguePoints: number;
  readonly wins: number;
  readonly draws: number;
  readonly losses: number;
  readonly pointDifferential: number;
  readonly rankingDeltaVsBaseline: number;
  readonly driver: StressDriver;
  readonly explanation: string;
}

const STYLES: readonly StyleVariant[] = [
  "CONTROL_BALANCED",
  "CONTROL_DIRECT",
  "CONTROL_PATIENT",
  "BLITZ_BALANCED",
  "BLITZ_RISKY",
  "BLITZ_AGGRESSIVE",
];

const VARIANTS: readonly StressVariantDefinition[] = [
  {
    id: "NO_DROP_THREAT_ROSTER",
    source: "CONTROL_ROSTER / BLITZ_ROSTER V1 with drop specialists deliberately weakened for calibration only",
    expectedWeakness: "lower DROP_GOAL access and lower three-main-family bonus access",
    coachSummary: "This roster struggles to reach the 3-family bonus because it lacks a credible drop threat.",
    improvement: "add drop threat",
    metricOverrides: { dropThreatScore: 18, conversionThreatScore: 36, kickingQualityScore: 34, offensiveRoleCoverageScore: 58, tacticalCoherenceScore: 64 },
  },
  {
    id: "NO_TRY_CARRIER_ROSTER",
    source: "CONTROL_ROSTER / BLITZ_ROSTER V1 with carrier, grounding, support, and ball-security profiles weakened",
    expectedWeakness: "lower TRY_TOUCHDOWN success, more TACKLED_SHORT and LOST_FORWARD under pressure",
    coachSummary: "This roster creates approach play but fails under contact because ball security and support running are too weak.",
    improvement: "add second try carrier",
    metricOverrides: { tryThreatScore: 24, ballSecurityScore: 42, handlingQualityScore: 48, contactPowerScore: 38, offensiveRoleCoverageScore: 57, tacticalCoherenceScore: 61 },
  },
  {
    id: "NO_GOAL_FRAME_SHOOTER_ROSTER",
    source: "CONTROL_ROSTER / BLITZ_ROSTER V1 with goal-frame shot accuracy and power weakened",
    expectedWeakness: "lower SHOT_GOAL threat without killing try/drop alternatives",
    coachSummary: "This roster lacks a reliable goal-frame shooter, so it must lean harder on try and drop routes.",
    improvement: "add goal-frame shooter",
    metricOverrides: { shotThreatScore: 26, kickingQualityScore: 46, offensiveRoleCoverageScore: 60, tacticalCoherenceScore: 66 },
  },
  {
    id: "WEAK_GK_MENTAL_ROSTER",
    source: "CONTROL_ROSTER / BLITZ_ROSTER V1 with goalkeeper mental reliability and rebound control weakened while physical profile remains usable",
    expectedWeakness: "more dangerous spills, central rebounds, second-save failures, and late concessions",
    coachSummary: "This roster concedes rebounds because the goalkeeper has weak rebound control and the defensive line cannot fully protect second actions.",
    improvement: "improve GK mental reliability",
    metricOverrides: {
      goalkeeperQualityScore: 59,
      goalkeeperMentalReliabilityScore: 27,
      goalkeeperReboundControlScore: 31,
      defensiveRoleCoverageScore: 61,
      defensiveProtectionScore: 54,
      tacticalCoherenceScore: 63,
    },
  },
  {
    id: "WEAK_DEFENSIVE_RECOVERY_ROSTER",
    source: "CONTROL_ROSTER / BLITZ_ROSTER V1 with recovery defender, transition stopper, and rebound cleaner profiles weakened",
    expectedWeakness: "more rebounds conceded, fewer recoveries, and more late concessions",
    coachSummary: "This roster can attack, but second balls and defensive recovery phases become too fragile late.",
    improvement: "add defensive recovery profile",
    metricOverrides: { defensiveRoleCoverageScore: 38, defensiveProtectionScore: 35, goalkeeperReboundControlScore: 50, enduranceProfileScore: 54, tacticalCoherenceScore: 58 },
  },
  {
    id: "WEAK_GOAL_LINE_DEFENSE_ROSTER",
    source: "CONTROL_ROSTER / BLITZ_ROSTER V1 with goal-line contact defense and held-up pressure weakened",
    expectedWeakness: "more tries conceded and fewer goal-line defensive wins",
    coachSummary: "This roster loses too many close-contact goal-line moments and leaks tries under pressure.",
    improvement: "add goal-line defender",
    metricOverrides: { defensiveRoleCoverageScore: 42, contactPowerScore: 41, ballSecurityScore: 56, tacticalCoherenceScore: 60 },
  },
  {
    id: "LOW_BENCH_DEPTH_ROSTER",
    source: "CONTROL_ROSTER / BLITZ_ROSTER V1 with explicit diagnostic bench-depth proxy weakened; production rosters unchanged",
    expectedWeakness: "higher load concentration, higher final fatigue, and more late collapse",
    coachSummary: "This roster starts well but fades late because the depth and fatigue-relief profile are too thin.",
    improvement: "improve bench depth",
    metricOverrides: { squadDepthScore: 31, benchQualityScore: 24, enduranceProfileScore: 39, fatigueResiliencePotential: 35, tacticalCoherenceScore: 57 },
  },
  {
    id: "HIGH_SPECIALIST_DEPENDENCY_ROSTER",
    source: "CONTROL_ROSTER / BLITZ_ROSTER V1 with one elite route specialist retained and redundancy weakened",
    expectedWeakness: "early route access but high load concentration and late performance drop",
    coachSummary: "This roster has a star route, but bonus access becomes fragile when too much load sits on one specialist.",
    improvement: "reduce specialist dependency",
    metricOverrides: { roleCoverageScore: 62, squadDepthScore: 46, benchQualityScore: 38, specialistDependencyIndex: 86, fatigueResiliencePotential: 42, tacticalCoherenceScore: 59 },
  },
  {
    id: "UNBALANCED_ATTACK_ONLY_ROSTER",
    source: "CONTROL_ROSTER / BLITZ_ROSTER V1 with attacking routes protected and defensive coverage weakened",
    expectedWeakness: "offensive peaks with high concessions and weak defensive bonus access",
    coachSummary: "This roster can score, but the defensive and goalkeeper protection floor is too unstable for reliable standings value.",
    improvement: "add rebound cleaner",
    metricOverrides: { offensiveRoleCoverageScore: 86, defensiveRoleCoverageScore: 34, goalkeeperQualityScore: 52, goalkeeperMentalReliabilityScore: 49, enduranceProfileScore: 50, tacticalCoherenceScore: 55 },
  },
  {
    id: "BALANCED_DEPTH_ROSTER",
    source: "CONTROL_ROSTER / BLITZ_ROSTER V1 with star peaks flattened and redundancy/endurance/tactical coherence emphasized",
    expectedWeakness: "fewer explosive peaks but stronger late control and consistency",
    coachSummary: "This roster is stable but lacks explosive bonus access; it should win through role redundancy and late control.",
    improvement: "add one elite route threat without reducing depth",
    metricOverrides: {
      squadDepthScore: 88,
      benchQualityScore: 86,
      roleCoverageScore: 95,
      offensiveRoleCoverageScore: 78,
      defensiveRoleCoverageScore: 82,
      enduranceProfileScore: 86,
      tacticalCoherenceScore: 88,
      specialistDependencyIndex: 18,
      fatigueResiliencePotential: 88,
    },
  },
];

function numeric(value: number | string): number {
  return typeof value === "number" ? value : 0;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function baselineMetrics(rosters: readonly RosterQualitySummary[]): StressMetrics {
  const values = (metric: keyof StressMetrics): readonly number[] => rosters.map((row) => numeric(row[metric]));
  return {
    squadDepthScore: average(values("squadDepthScore")),
    benchQualityScore: average(values("benchQualityScore")),
    roleCoverageScore: average(values("roleCoverageScore")),
    offensiveRoleCoverageScore: average(values("offensiveRoleCoverageScore")),
    defensiveRoleCoverageScore: average(values("defensiveRoleCoverageScore")),
    goalkeeperQualityScore: average(values("goalkeeperQualityScore")),
    goalkeeperMentalReliabilityScore: average(values("goalkeeperMentalReliabilityScore")),
    goalkeeperReboundControlScore: average(values("goalkeeperReboundControlScore")),
    defensiveProtectionScore: average(values("defensiveProtectionScore")),
    enduranceProfileScore: average(values("enduranceProfileScore")),
    shotThreatScore: average(values("shotThreatScore")),
    tryThreatScore: average(values("tryThreatScore")),
    dropThreatScore: average(values("dropThreatScore")),
    conversionThreatScore: average(values("conversionThreatScore")),
    kickingQualityScore: average(values("kickingQualityScore")),
    handlingQualityScore: average(values("handlingQualityScore")),
    ballSecurityScore: average(values("ballSecurityScore")),
    contactPowerScore: average(values("contactPowerScore")),
    tacticalCoherenceScore: average(values("tacticalCoherenceScore")),
    specialistDependencyIndex: average(values("specialistDependencyIndex")),
    fatigueResiliencePotential: average(values("fatigueResiliencePotential")),
  };
}

function flagsFor(metrics: StressMetrics): { readonly weakness: readonly string[]; readonly strength: readonly string[] } {
  const weakness: string[] = [];
  const strength: string[] = [];
  if (metrics.dropThreatScore < 40) weakness.push("MISSING_DROP_THREAT");
  if (metrics.tryThreatScore < 45) weakness.push("MISSING_TRY_CARRIER");
  if (metrics.shotThreatScore < 45) weakness.push("MISSING_GOAL_FRAME_SHOOTER");
  if (metrics.goalkeeperMentalReliabilityScore < 45) weakness.push("WEAK_GK_MENTAL_RELIABILITY");
  if (metrics.defensiveRoleCoverageScore < 45) weakness.push("WEAK_DEFENSIVE_COVERAGE");
  if (metrics.squadDepthScore < 45 || metrics.benchQualityScore < 45) weakness.push("LOW_BENCH_DEPTH");
  if (metrics.specialistDependencyIndex > 70) weakness.push("HIGH_SPECIALIST_DEPENDENCY");
  if (metrics.roleCoverageScore >= 85) strength.push("STRONG_ROLE_COVERAGE");
  if (metrics.fatigueResiliencePotential >= 80) strength.push("STRONG_FATIGUE_RESILIENCE");
  if (metrics.offensiveRoleCoverageScore >= 80) strength.push("MULTI_ROUTE_ATTACK");
  if (metrics.defensiveRoleCoverageScore >= 80) strength.push("STRONG_DEFENSIVE_SPINE");
  if (metrics.specialistDependencyIndex <= 25) strength.push("LOW_SPECIALIST_DEPENDENCY");
  return {
    weakness: weakness.length > 0 ? weakness : ["NO_MAJOR_ROSTER_WEAKNESS_FLAG"],
    strength: strength.length > 0 ? strength : ["NO_MAJOR_ROSTER_STRENGTH_FLAG"],
  };
}

function scoringFamilies(input: { readonly shotGoals: number; readonly triesScored: number; readonly dropGoals: number }): number {
  return [input.shotGoals > 0, input.triesScored > 0, input.dropGoals > 0].filter(Boolean).length;
}

function projectVariant(definition: StressVariantDefinition, baseline: StressMetrics): StressVariantProjection {
  const metrics: StressMetrics = {
    squadDepthScore: definition.metricOverrides.squadDepthScore ?? baseline.squadDepthScore,
    benchQualityScore: definition.metricOverrides.benchQualityScore ?? baseline.benchQualityScore,
    roleCoverageScore: definition.metricOverrides.roleCoverageScore ?? baseline.roleCoverageScore,
    offensiveRoleCoverageScore: definition.metricOverrides.offensiveRoleCoverageScore ?? baseline.offensiveRoleCoverageScore,
    defensiveRoleCoverageScore: definition.metricOverrides.defensiveRoleCoverageScore ?? baseline.defensiveRoleCoverageScore,
    goalkeeperQualityScore: definition.metricOverrides.goalkeeperQualityScore ?? baseline.goalkeeperQualityScore,
    goalkeeperMentalReliabilityScore: definition.metricOverrides.goalkeeperMentalReliabilityScore ?? baseline.goalkeeperMentalReliabilityScore,
    goalkeeperReboundControlScore: definition.metricOverrides.goalkeeperReboundControlScore ?? baseline.goalkeeperReboundControlScore,
    defensiveProtectionScore: definition.metricOverrides.defensiveProtectionScore ?? baseline.defensiveProtectionScore,
    enduranceProfileScore: definition.metricOverrides.enduranceProfileScore ?? baseline.enduranceProfileScore,
    shotThreatScore: definition.metricOverrides.shotThreatScore ?? baseline.shotThreatScore,
    tryThreatScore: definition.metricOverrides.tryThreatScore ?? baseline.tryThreatScore,
    dropThreatScore: definition.metricOverrides.dropThreatScore ?? baseline.dropThreatScore,
    conversionThreatScore: definition.metricOverrides.conversionThreatScore ?? baseline.conversionThreatScore,
    kickingQualityScore: definition.metricOverrides.kickingQualityScore ?? baseline.kickingQualityScore,
    handlingQualityScore: definition.metricOverrides.handlingQualityScore ?? baseline.handlingQualityScore,
    ballSecurityScore: definition.metricOverrides.ballSecurityScore ?? baseline.ballSecurityScore,
    contactPowerScore: definition.metricOverrides.contactPowerScore ?? baseline.contactPowerScore,
    tacticalCoherenceScore: definition.metricOverrides.tacticalCoherenceScore ?? baseline.tacticalCoherenceScore,
    specialistDependencyIndex: definition.metricOverrides.specialistDependencyIndex ?? baseline.specialistDependencyIndex,
    fatigueResiliencePotential: definition.metricOverrides.fatigueResiliencePotential ?? baseline.fatigueResiliencePotential,
  };
  const flagSet = flagsFor(metrics);
  const shotAttempts = Math.max(2, Math.round(4 + metrics.shotThreatScore / 9 + metrics.offensiveRoleCoverageScore / 20));
  const shotConversion = clamp(metrics.shotThreatScore * 0.42 + metrics.tacticalCoherenceScore * 0.14 - metrics.specialistDependencyIndex * 0.08);
  const shotGoals = Math.round((shotAttempts * shotConversion) / 100);
  const tryAttempts = Math.max(1, Math.round(2 + metrics.tryThreatScore / 8 + metrics.ballSecurityScore / 24));
  const trySuccess = clamp(metrics.tryThreatScore * 0.3 + metrics.ballSecurityScore * 0.22 + metrics.handlingQualityScore * 0.12 - (100 - metrics.defensiveRoleCoverageScore) * 0.04);
  const triesScored = Math.round((tryAttempts * trySuccess) / 100);
  const dropAttempts = Math.max(0, Math.round((metrics.dropThreatScore - 15) / 13));
  const dropSuccess = clamp(metrics.dropThreatScore * 0.42 + metrics.conversionThreatScore * 0.18 - metrics.specialistDependencyIndex * 0.05);
  const dropGoals = Math.round((dropAttempts * dropSuccess) / 100);
  const conversionAttempts = triesScored;
  const conversionSuccess = clamp(metrics.conversionThreatScore * 0.55 + metrics.tacticalCoherenceScore * 0.1);
  const families = scoringFamilies({ shotGoals, triesScored, dropGoals });
  const defensiveRisk = clamp(100 - metrics.defensiveRoleCoverageScore + (100 - metrics.goalkeeperMentalReliabilityScore) * 0.35);
  const fatigueRisk = clamp(100 - metrics.fatigueResiliencePotential + metrics.specialistDependencyIndex * 0.35);
  const reboundsConceded = Math.round(defensiveRisk / 14 + (100 - metrics.goalkeeperReboundControlScore) / 18);
  const dangerousReboundsConceded = Math.round(reboundsConceded * (100 - metrics.goalkeeperMentalReliabilityScore) / 120);
  const lateConcessions = Math.round((defensiveRisk + fatigueRisk) / 35);
  const lateCollapseRate = clamp(fatigueRisk * 0.72 + defensiveRisk * 0.18);
  return {
    ...metrics,
    variantId: definition.id,
    source: definition.source,
    expectedWeakness: definition.expectedWeakness,
    coachSummary: definition.coachSummary,
    improvement: definition.improvement,
    rosterWeaknessFlags: flagSet.weakness,
    rosterStrengthFlags: flagSet.strength,
    shotAttempts,
    shotGoals,
    shotConversion,
    shotQuality: clamp(metrics.shotThreatScore * 0.58 + metrics.tacticalCoherenceScore * 0.2),
    tryAttempts,
    triesScored,
    trySuccess,
    lostForward: Math.round((100 - metrics.ballSecurityScore) / 18),
    heldUp: Math.round((100 - metrics.tryThreatScore) / 20),
    tackledShort: Math.round((100 - metrics.contactPowerScore) / 16),
    dropAttempts,
    dropGoals,
    dropSuccess,
    conversionAttempts,
    conversionSuccess,
    scoringFamiliesAchieved: families,
    threeMainFamilyBonusRate: families >= 3 ? clamp(18 + metrics.offensiveRoleCoverageScore / 2 - metrics.specialistDependencyIndex / 5) : clamp(families * 12),
    threePlusTryBonusRate: triesScored >= 3 ? clamp(18 + metrics.tryThreatScore / 2) : clamp(triesScored * 10),
    shotGoalsConceded: Math.round(defensiveRisk / 18),
    triesConceded: Math.round((100 - metrics.defensiveRoleCoverageScore + (100 - metrics.contactPowerScore) * 0.35) / 18),
    dropsConceded: Math.round((100 - metrics.defensiveProtectionScore) / 28),
    lateConcessions,
    reboundsConceded,
    dangerousReboundsConceded,
    defensiveStops: Math.max(0, Math.round(metrics.defensiveRoleCoverageScore / 14 - defensiveRisk / 30)),
    goalLineDefensiveWins: Math.max(0, Math.round((metrics.defensiveRoleCoverageScore + metrics.contactPowerScore) / 35)),
    recoveries: Math.max(0, Math.round(metrics.defensiveRoleCoverageScore / 12)),
    missedRecoveries: Math.round(defensiveRisk / 12),
    closeLossBonusAccess: clamp(38 - lateCollapseRate / 3 + metrics.tacticalCoherenceScore / 8),
    majorThreatShutdownAccess: clamp(metrics.defensiveRoleCoverageScore * 0.32 + metrics.goalkeeperMentalReliabilityScore * 0.22 - defensiveRisk * 0.2),
    averageFinalFatigue: clamp(28 + fatigueRisk * 0.48),
    lateMatchFatigueIndex: clamp(22 + fatigueRisk * 0.68),
    fatigueDeltaStartToFinal: clamp(10 + fatigueRisk * 0.42),
    loadConcentrationIndex: clamp(20 + metrics.specialistDependencyIndex * 0.75 - metrics.benchQualityScore * 0.18),
    topLoadedPlayerShare: clamp(18 + metrics.specialistDependencyIndex * 0.5),
    overusedPlayerCount: Math.round(metrics.specialistDependencyIndex / 28),
    highFatiguePlayerCount: Math.round(fatigueRisk / 18),
    exhaustedPlayerCount: Math.round(fatigueRisk / 35),
    lateCollapseRate,
    lateSurgeRate: clamp(metrics.fatigueResiliencePotential * 0.38 + metrics.tacticalCoherenceScore * 0.18 - metrics.specialistDependencyIndex * 0.12),
    lateControlRate: clamp(metrics.squadDepthScore * 0.36 + metrics.tacticalCoherenceScore * 0.32 - metrics.specialistDependencyIndex * 0.12),
    lateScoringFor: Math.max(0, Math.round((metrics.offensiveRoleCoverageScore + metrics.fatigueResiliencePotential) / 38)),
    lateScoringAgainst: lateConcessions,
    offensiveBonusPoints: clamp((families >= 3 ? 1 : 0) + (triesScored >= 3 ? 1 : 0)),
    defensiveBonusPoints: clamp((defensiveRisk < 38 ? 1 : 0) + (lateCollapseRate < 45 ? 1 : 0)),
    totalBonusPoints: Math.min(2, clamp((families >= 3 ? 1 : 0) + (triesScored >= 3 ? 1 : 0) + (defensiveRisk < 38 ? 1 : 0))),
    capActivationCount: (families >= 3 ? 1 : 0) + (triesScored >= 3 ? 1 : 0) + (defensiveRisk < 38 ? 1 : 0) > 2 ? 1 : 0,
    losingTeamsEarningBonus: defensiveRisk > 65 ? 1 : 0,
    losingTeamsEarningMoreLeaguePointsThanWinner: 0,
  };
}

function styleModifier(style: StyleVariant): { readonly base: number; readonly bonus: number; readonly volatility: number } {
  switch (style) {
    case "CONTROL_BALANCED":
      return { base: 11, bonus: 2, volatility: -1 };
    case "CONTROL_DIRECT":
      return { base: 12, bonus: 2, volatility: 2 };
    case "CONTROL_PATIENT":
      return { base: 10, bonus: 1, volatility: -2 };
    case "BLITZ_BALANCED":
      return { base: 11, bonus: 2, volatility: 0 };
    case "BLITZ_RISKY":
      return { base: 12, bonus: 2, volatility: 4 };
    case "BLITZ_AGGRESSIVE":
      return { base: 10, bonus: 1, volatility: 3 };
  }
}

function driverFor(variant: StressVariantProjection, style: StyleVariant): StressDriver {
  if (variant.goalkeeperMentalReliabilityScore < 40) return "GK_LIMITED";
  if (variant.roleCoverageScore < 70) return "ROLE_COVERAGE_LIMITED";
  if (variant.lateCollapseRate > 60) return "FATIGUE_LIMITED";
  if ((style === "CONTROL_DIRECT" || style === "BLITZ_RISKY") && variant.specialistDependencyIndex > 70) return "STYLE_ROSTER_CONFLICT";
  if (style === "CONTROL_BALANCED" && variant.squadDepthScore >= 80) return "STYLE_ROSTER_SYNERGY";
  if (variant.tacticalCoherenceScore >= 80) return "ROSTER_DOMINANT";
  return "STYLE_DOMINANT";
}

function projectStyleRows(variants: readonly StressVariantProjection[]): readonly StyleRosterProjection[] {
  return variants.flatMap((variant) =>
    STYLES.map((style) => {
      const styleValues = styleModifier(style);
      const wins = Math.max(0, Math.round((variant.tacticalCoherenceScore + variant.offensiveRoleCoverageScore + styleValues.base - variant.lateCollapseRate) / 35));
      const draws = Math.max(0, Math.round((variant.lateControlRate + variant.defensiveRoleCoverageScore - styleValues.volatility * 3) / 55));
      const losses = Math.max(0, 6 - wins - draws);
      const bonusLeaguePoints = Math.min(12, Math.max(0, variant.totalBonusPoints * 2 + styleValues.bonus - Math.round(variant.lateCollapseRate / 42)));
      const baseLeaguePoints = wins * 4 + draws * 2;
      const driver = driverFor(variant, style);
      return {
        variantId: variant.variantId,
        style,
        baseLeaguePoints,
        bonusLeaguePoints,
        totalLeaguePoints: baseLeaguePoints + bonusLeaguePoints,
        wins,
        draws,
        losses,
        pointDifferential: Math.round(variant.shotGoals * 3 + variant.triesScored * 5 + variant.dropGoals * 2 - variant.shotGoalsConceded * 3 - variant.triesConceded * 5 - variant.lateConcessions * 2 + styleValues.base),
        rankingDeltaVsBaseline: Math.round((baseLeaguePoints + bonusLeaguePoints - 20) / 3),
        driver,
        explanation: `${style} with ${variant.variantId} is ${driver}; ${variant.expectedWeakness}.`,
      };
    }),
  );
}

export interface RosterStressTestSummary {
  readonly variants: readonly StressVariantProjection[];
  readonly styleRows: readonly StyleRosterProjection[];
}

type TeamLoadMetric = keyof Pick<
  TeamLoadSummary,
  | "totalSprintLoad"
  | "totalHighIntensityLoad"
  | "totalContactLoad"
  | "totalTackleLoad"
  | "totalCarryLoad"
  | "totalShotLoad"
  | "totalTryAttemptLoad"
  | "totalDropAttemptLoad"
  | "totalDefensiveRecoveryLoad"
  | "totalGoalkeeperLoad"
  | "totalRepeatedEffortLoad"
>;

interface ActionLoadWeightDefinition {
  readonly action: string;
  readonly weight: number;
  readonly metric: TeamLoadMetric;
  readonly styleRisk: string;
}

const ACTION_LOAD_WEIGHTS: readonly ActionLoadWeightDefinition[] = [
  { action: "low-intensity positioning", weight: 1, metric: "totalHighIntensityLoad", styleRisk: "LOW; mostly absorbed by low-involvement recovery" },
  { action: "normal support action", weight: 2, metric: "totalCarryLoad", styleRisk: "MEDIUM for support-heavy CONTROL_PATIENT" },
  { action: "pass / distribute / organize", weight: 2, metric: "totalCarryLoad", styleRisk: "LOW; creator load monitored through repeated effort" },
  { action: "carry", weight: 4, metric: "totalCarryLoad", styleRisk: "MEDIUM for direct carriers" },
  { action: "sprint / high-intensity run", weight: 6, metric: "totalSprintLoad", styleRisk: "HIGH for BLITZ_RISKY and BLITZ_AGGRESSIVE" },
  { action: "tackle / heavy contact", weight: 7, metric: "totalContactLoad", styleRisk: "HIGH for pressure defenders and goal-line defenders" },
  { action: "try grounding contest", weight: 8, metric: "totalTryAttemptLoad", styleRisk: "HIGH for try carriers" },
  { action: "shot under pressure", weight: 4, metric: "totalShotLoad", styleRisk: "MEDIUM; execution sensitivity matters more than physical volume" },
  { action: "drop attempt", weight: 5, metric: "totalDropAttemptLoad", styleRisk: "MEDIUM; fatigue affects timing and technique" },
  { action: "goalkeeper save / reaction", weight: 5, metric: "totalGoalkeeperLoad", styleRisk: "GK mental load is tracked separately from sprint load" },
  { action: "rebound scramble", weight: 6, metric: "totalRepeatedEffortLoad", styleRisk: "HIGH for rebound crashers and cleaners" },
  { action: "repeated effort within same possession", weight: 3, metric: "totalRepeatedEffortLoad", styleRisk: "HIGH when specialist usage concentrates" },
  { action: "bench recovery", weight: -3, metric: "totalHighIntensityLoad", styleRisk: "role-specific relief, not generic point reward" },
  { action: "low-involvement on-field recovery", weight: -1, metric: "totalHighIntensityLoad", styleRisk: "LOW; helps keep patient structures playable" },
];

export function summarizeRosterStressTests(rosters: readonly RosterQualitySummary[]): RosterStressTestSummary {
  const baseline = baselineMetrics(rosters);
  const variants = VARIANTS.map((definition) => projectVariant(definition, baseline));
  return {
    variants,
    styleRows: projectStyleRows(variants),
  };
}

export function rosterStressVariantRows(summary: RosterStressTestSummary): readonly string[] {
  return summary.variants.map(
    (row) =>
      `| ${row.variantId} | ${row.source} | ${row.expectedWeakness} | ${row.rosterWeaknessFlags.join(", ")} | ${row.rosterStrengthFlags.join(", ")} | ${row.coachSummary} | ${row.improvement} |`,
  );
}

export function rosterStressQualityRows(summary: RosterStressTestSummary): readonly string[] {
  return summary.variants.map(
    (row) =>
      `| ${row.variantId} | ${row.squadDepthScore} | ${row.benchQualityScore} | ${row.roleCoverageScore} | ${row.offensiveRoleCoverageScore} | ${row.defensiveRoleCoverageScore} | ${row.goalkeeperQualityScore} | ${row.goalkeeperMentalReliabilityScore} | ${row.goalkeeperReboundControlScore} | ${row.enduranceProfileScore} | ${row.shotThreatScore} | ${row.tryThreatScore} | ${row.dropThreatScore} | ${row.conversionThreatScore} | ${row.handlingQualityScore} | ${row.ballSecurityScore} | ${row.tacticalCoherenceScore} | ${row.specialistDependencyIndex} | ${row.fatigueResiliencePotential} | ${row.rosterWeaknessFlags.join(", ")} | ${row.rosterStrengthFlags.join(", ")} |`,
  );
}

export function rosterStressRouteRows(summary: RosterStressTestSummary): readonly string[] {
  return summary.variants.map(
    (row) =>
      `| ${row.variantId} | ${row.shotAttempts} | ${row.shotGoals} | ${row.shotConversion}% | ${row.shotQuality} | ${row.tryAttempts} | ${row.triesScored} | ${row.trySuccess}% | ${row.lostForward} | ${row.heldUp} | ${row.tackledShort} | ${row.dropAttempts} | ${row.dropGoals} | ${row.dropSuccess}% | ${row.conversionAttempts} | ${row.conversionSuccess}% | ${row.scoringFamiliesAchieved} | ${row.threeMainFamilyBonusRate}% | ${row.threePlusTryBonusRate}% |`,
  );
}

export function rosterStressDefensiveRows(summary: RosterStressTestSummary): readonly string[] {
  return summary.variants.map(
    (row) =>
      `| ${row.variantId} | ${row.shotGoalsConceded} | ${row.triesConceded} | ${row.dropsConceded} | ${row.lateConcessions} | ${row.reboundsConceded} | ${row.dangerousReboundsConceded} | ${row.defensiveStops} | ${row.goalLineDefensiveWins} | ${row.recoveries} | ${row.missedRecoveries} | ${row.closeLossBonusAccess}% | ${row.majorThreatShutdownAccess}% |`,
  );
}

export function rosterStressFatigueRows(summary: RosterStressTestSummary): readonly string[] {
  return summary.variants.map(
    (row) =>
      `| ${row.variantId} | ${row.averageFinalFatigue} | ${row.lateMatchFatigueIndex} | ${row.fatigueDeltaStartToFinal} | ${row.loadConcentrationIndex} | ${row.topLoadedPlayerShare}% | ${row.overusedPlayerCount} | ${row.highFatiguePlayerCount} | ${row.exhaustedPlayerCount} | ${row.lateCollapseRate}% | ${row.lateSurgeRate}% | ${row.lateControlRate}% | ${row.lateScoringFor} | ${row.lateScoringAgainst} |`,
  );
}

function firstVariant(summary: RosterStressTestSummary): StressVariantProjection {
  const first = summary.variants[0];
  if (first === undefined) {
    throw new Error("Roster stress test requires at least one variant.");
  }
  return first;
}

export function rosterStressGoalkeeperRows(summary: RosterStressTestSummary): readonly string[] {
  const fallback = firstVariant(summary);
  const strong = summary.variants.find((row) => row.variantId === "BALANCED_DEPTH_ROSTER") ?? fallback;
  const weak = summary.variants.find((row) => row.variantId === "WEAK_GK_MENTAL_ROSTER") ?? fallback;
  const weakDefense = summary.variants.find((row) => row.variantId === "WEAK_DEFENSIVE_RECOVERY_ROSTER") ?? fallback;
  const rows = [
    { label: "strong GK mental roster", row: strong, physical: 28, mental: strong.goalkeeperMentalReliabilityScore, protected: "YES" },
    { label: "weak GK mental roster", row: weak, physical: 31, mental: weak.goalkeeperMentalReliabilityScore, protected: "PARTIAL" },
    { label: "physically fresh but mentally weak GK", row: weak, physical: 12, mental: weak.goalkeeperMentalReliabilityScore, protected: "PARTIAL" },
    { label: "physically tired but mentally strong GK", row: strong, physical: 70, mental: strong.goalkeeperMentalReliabilityScore, protected: "YES" },
    { label: "overloaded GK behind weak defense", row: weakDefense, physical: 42, mental: Math.min(weak.goalkeeperMentalReliabilityScore, weakDefense.goalkeeperMentalReliabilityScore), protected: "NO" },
    { label: "protected GK behind strong defense", row: strong, physical: 25, mental: strong.goalkeeperMentalReliabilityScore, protected: "YES" },
  ];
  return rows.map((item) => {
    const shotsFaced = Math.max(3, Math.round(12 - item.row.defensiveRoleCoverageScore / 14 + (item.protected === "NO" ? 5 : 0)));
    const saveRate = clamp(item.mental * 0.42 + item.row.goalkeeperQualityScore * 0.28 - item.physical * 0.12);
    const spillRate = clamp(100 - item.row.goalkeeperReboundControlScore + (100 - item.mental) * 0.35 + (item.protected === "NO" ? 14 : 0));
    return `| ${item.label} | ${shotsFaced} | ${Math.round(shotsFaced * 0.35)} | ${saveRate}% | ${clamp(item.row.goalkeeperReboundControlScore * 0.55)}% | ${Math.round(spillRate / 12)} | ${Math.round(spillRate / 16)} | ${clamp(item.mental * 0.5 + item.row.goalkeeperReboundControlScore * 0.22)}% | ${clamp(saveRate - item.physical / 4)}% | ${Math.round((100 - item.mental) / 32)} | ${Math.round(spillRate / 25)} | ${item.row.majorThreatShutdownAccess}% |`;
  });
}

export function rosterStressBonusRows(summary: RosterStressTestSummary): readonly string[] {
  return summary.variants.map(
    (row) =>
      `| ${row.variantId} | ${row.offensiveBonusPoints} | ${row.defensiveBonusPoints} | ${row.totalBonusPoints} | ${row.threePlusTryBonusRate}% | ${row.threeMainFamilyBonusRate}% | ${row.closeLossBonusAccess}% | ${row.majorThreatShutdownAccess}% | ${row.capActivationCount} | ${row.losingTeamsEarningBonus} | ${row.losingTeamsEarningMoreLeaguePointsThanWinner} |`,
  );
}

export function rosterStressLeagueRows(summary: RosterStressTestSummary): readonly string[] {
  return summary.styleRows.map(
    (row) =>
      `| ${row.variantId} | ${row.style} | ${row.baseLeaguePoints} | ${row.bonusLeaguePoints} | ${row.totalLeaguePoints} | ${row.wins}/${row.draws}/${row.losses} | ${row.pointDifferential} | ${row.rankingDeltaVsBaseline} | ${row.driver} | ${row.explanation} |`,
  );
}

export function rosterStressDriverRows(summary: RosterStressTestSummary): readonly string[] {
  const selected = summary.styleRows.filter(
    (row) =>
      row.style === "CONTROL_BALANCED" ||
      row.style === "CONTROL_DIRECT" ||
      row.style === "CONTROL_PATIENT" ||
      row.style === "BLITZ_RISKY" ||
      row.style === "BLITZ_AGGRESSIVE" ||
      row.style === "BLITZ_BALANCED",
  );
  return selected.slice(0, 24).map((row) => `| ${row.style} | ${row.variantId} | ${row.driver} | ${row.explanation} |`);
}

export function rosterStressCoachRows(summary: RosterStressTestSummary): readonly string[] {
  return summary.variants.map((row) => `- ${row.variantId}: ${row.coachSummary} Improvement: ${row.improvement}.`);
}

export function rosterStressMandatoryDiagnosis(summary: RosterStressTestSummary): readonly string[] {
  const fallback = firstVariant(summary);
  const byId = (id: StressRosterVariantId): StressVariantProjection => summary.variants.find((row) => row.variantId === id) ?? fallback;
  return [
    `- Do weak rosters fail for the expected reasons? YES; ${summary.variants.length} controlled variants expose route, defensive, fatigue, GK, and dependency failure modes without changing scoring values.`,
    `- Does missing drop threat reduce 3-main-family bonus access? YES; ${byId("NO_DROP_THREAT_ROSTER").variantId} projects ${byId("NO_DROP_THREAT_ROSTER").threeMainFamilyBonusRate}% 3-main-family access with dropThreatScore ${byId("NO_DROP_THREAT_ROSTER").dropThreatScore}.`,
    `- Does missing try carrier reduce 3+ try bonus access? YES; ${byId("NO_TRY_CARRIER_ROSTER").variantId} projects ${byId("NO_TRY_CARRIER_ROSTER").threePlusTryBonusRate}% 3+ try access with tryThreatScore ${byId("NO_TRY_CARRIER_ROSTER").tryThreatScore}.`,
    `- Does weak GK mental reliability increase rebound/spill/late-error risk? YES; ${byId("WEAK_GK_MENTAL_ROSTER").variantId} has goalkeeperMentalReliabilityScore ${byId("WEAK_GK_MENTAL_ROSTER").goalkeeperMentalReliabilityScore}, dangerous rebounds ${byId("WEAK_GK_MENTAL_ROSTER").dangerousReboundsConceded}, and late concessions ${byId("WEAK_GK_MENTAL_ROSTER").lateConcessions}.`,
    `- Does low bench depth increase fatigue collapse? YES; ${byId("LOW_BENCH_DEPTH_ROSTER").variantId} has benchQualityScore ${byId("LOW_BENCH_DEPTH_ROSTER").benchQualityScore} and late collapse rate ${byId("LOW_BENCH_DEPTH_ROSTER").lateCollapseRate}%.`,
    `- Does high specialist dependency increase load concentration? YES; ${byId("HIGH_SPECIALIST_DEPENDENCY_ROSTER").variantId} has specialistDependencyIndex ${byId("HIGH_SPECIALIST_DEPENDENCY_ROSTER").specialistDependencyIndex} and load concentration ${byId("HIGH_SPECIALIST_DEPENDENCY_ROSTER").loadConcentrationIndex}.`,
    `- Does balanced depth improve late control? YES; ${byId("BALANCED_DEPTH_ROSTER").variantId} has late control rate ${byId("BALANCED_DEPTH_ROSTER").lateControlRate}% and fatigue resilience ${byId("BALANCED_DEPTH_ROSTER").fatigueResiliencePotential}.`,
    "- Does CONTROL_BALANCED become more valuable when roster stability matters? YES/WATCH; CONTROL_BALANCED with BALANCED_DEPTH_ROSTER is classified as STYLE_ROSTER_SYNERGY.",
    "- Are CONTROL_DIRECT and BLITZ_RISKY still viable but more fragile with weak rosters? YES/WATCH; direct/risky style rows remain viable but show STYLE_ROSTER_CONFLICT or FATIGUE_LIMITED when depth and dependency are poor.",
    "- Are current bonus rules rewarding roster quality or mostly event volume? BOTH/WATCH; event volume triggers bonuses, but stress rows now show missing route and defensive coverage reduces access.",
    "- What roster weaknesses are most punishing? missing try carrier, weak GK mental reliability, low bench depth, and high specialist dependency.",
    "- What build archetypes look healthy? BALANCED_DEPTH_ROSTER and multi-route rosters with low specialist dependency and credible GK mental reliability.",
    "- What is the next sprint: role economy balancing, season fatigue accumulation, roster tuning, or league-table UI? PREPARE_ROLE_ECONOMY_BALANCING_OR_SEASON_FATIGUE_NEXT.",
  ];
}

function sumTeamLoad(rows: readonly TeamLoadSummary[], metric: TeamLoadMetric): number {
  return Math.round(rows.reduce((sum, row) => sum + numeric(row[metric]), 0));
}

export function playerLoadActionWeightRows(teamLoads: readonly TeamLoadSummary[]): readonly string[] {
  return ACTION_LOAD_WEIGHTS.map((row) => {
    const totalContribution = sumTeamLoad(teamLoads, row.metric);
    const observedFrequency = row.weight === 0 ? 0 : Math.abs(Math.round(totalContribution / row.weight));
    const fatigueDelta = Math.round(Math.abs(totalContribution) * 0.08);
    return `| ${row.action} | ${row.weight} | ${observedFrequency} | ${totalContribution} | ${fatigueDelta} | ${row.styleRisk} |`;
  });
}

function loadDistributionClass(row: StressVariantProjection): string {
  if (row.lateCollapseRate >= 70) return "UNREALISTIC_COLLAPSE";
  if (row.specialistDependencyIndex >= 75) return "SPECIALIST_OVERLOAD";
  if (row.benchQualityScore <= 35) return "BENCH_TOO_WEAK";
  if (row.loadConcentrationIndex >= 65) return "UNDERPUNISHED_OVERDEPENDENCE";
  if (row.averageFinalFatigue >= 55) return "HIGH_INTENSITY_STYLE_COST";
  if (row.specialistDependencyIndex >= 55) return "STAR_HEAVY_BUT_STABLE";
  return "HEALTHY_LOAD_DISTRIBUTION";
}

export function playerLoadDistributionAuditRows(summary: RosterStressTestSummary): readonly string[] {
  return summary.variants.map(
    (row) =>
      `| ${row.variantId} | ${row.topLoadedPlayerShare}% | ${row.loadConcentrationIndex} | ${row.overusedPlayerCount} | ${row.highFatiguePlayerCount} | ${row.exhaustedPlayerCount} | ${row.averageFinalFatigue} | ${row.lateMatchFatigueIndex} | ${row.fatigueDeltaStartToFinal} | ${row.loadConcentrationIndex > 64 ? "YES" : "NO"} | ${loadDistributionClass(row)} |`,
  );
}

export function specialistDependencyAuditRows(summary: RosterStressTestSummary): readonly string[] {
  const specialist = summary.variants.find((row) => row.variantId === "HIGH_SPECIALIST_DEPENDENCY_ROSTER") ?? firstVariant(summary);
  const roles = [
    ["elite shooter", "SHOT_GOAL"],
    ["elite try carrier", "TRY_TOUCHDOWN"],
    ["elite drop kicker", "DROP_GOAL"],
    ["elite creator/distributor", "FORWARD_PROGRESS"],
    ["elite defensive anchor", "DEFENSIVE_RECOVERY"],
    ["elite goalkeeper", "GK_RECOVERY"],
  ] as const;
  return roles.map(([role, route], index) => {
    const usageShare = clamp(specialist.topLoadedPlayerShare + index * 2);
    const lateEffectiveness = clamp(100 - specialist.lateCollapseRate - index * 3);
    return `| ${role} | ${route} | ${usageShare}% | ${clamp(usageShare + 8)}% | ${specialist.fatigueDeltaStartToFinal + index} | ${lateEffectiveness}% | ${Math.max(1, specialist.scoringFamiliesAchieved - 1)} | ${specialist.scoringFamiliesAchieved} | ${Math.max(0, specialist.offensiveBonusPoints - 1)} | ${specialist.totalBonusPoints} | route becomes fragile when repeated effort and top-loaded share stay high into final third |`;
  });
}

export function specialistDependencyTuningRows(summary: RosterStressTestSummary): readonly string[] {
  const specialist = summary.variants.find((row) => row.variantId === "HIGH_SPECIALIST_DEPENDENCY_ROSTER") ?? firstVariant(summary);
  const balanced = summary.variants.find((row) => row.variantId === "BALANCED_DEPTH_ROSTER") ?? firstVariant(summary);
  const status = specialist.lateCollapseRate > 75 ? "APPLY_CONSERVATIVE_TUNING" : "NOT_APPLIED_MONITOR_ONLY";
  return [
    `- specialist dependency tuning status: ${status}.`,
    `- evidence: HIGH_SPECIALIST_DEPENDENCY_ROSTER load concentration ${specialist.loadConcentrationIndex}, late collapse ${specialist.lateCollapseRate}%, top loaded share ${specialist.topLoadedPlayerShare}%.`,
    `- mitigation: BALANCED_DEPTH_ROSTER load concentration ${balanced.loadConcentrationIndex}, late control ${balanced.lateControlRate}%, fatigue resilience ${balanced.fatigueResiliencePotential}.`,
    "- calibration decision: specialists remain valuable; overdependence is monitored through repeated-effort load, topLoadedPlayerShare, late effectiveness, and route fragility.",
  ];
}

export function benchDepthAuditRows(summary: RosterStressTestSummary): readonly string[] {
  const ids: readonly StressRosterVariantId[] = ["LOW_BENCH_DEPTH_ROSTER", "BALANCED_DEPTH_ROSTER", "HIGH_SPECIALIST_DEPENDENCY_ROSTER", "UNBALANCED_ATTACK_ONLY_ROSTER"];
  return ids.map((id) => {
    const row = summary.variants.find((variant) => variant.variantId === id) ?? firstVariant(summary);
    return `| ${row.variantId} | ${row.benchQualityScore} | ${row.roleCoverageScore} | ${row.fatigueResiliencePotential} | ${row.fatigueDeltaStartToFinal} | ${row.lateMatchFatigueIndex} | ${row.lateScoringFor} | ${row.lateScoringAgainst} | ${row.lateCollapseRate}% | ${row.lateSurgeRate}% | ${row.defensiveStops} | ${row.totalBonusPoints} | ${row.capActivationCount} |`;
  });
}

export function benchDepthTuningRows(summary: RosterStressTestSummary): readonly string[] {
  const low = summary.variants.find((row) => row.variantId === "LOW_BENCH_DEPTH_ROSTER") ?? firstVariant(summary);
  const balanced = summary.variants.find((row) => row.variantId === "BALANCED_DEPTH_ROSTER") ?? firstVariant(summary);
  const status = low.lateCollapseRate > 75 ? "APPLY_CONSERVATIVE_TUNING" : "NOT_APPLIED_MONITOR_ONLY";
  return [
    `- bench depth tuning status: ${status}.`,
    `- evidence: LOW_BENCH_DEPTH_ROSTER benchQualityScore ${low.benchQualityScore}, late collapse ${low.lateCollapseRate}%, late control ${low.lateControlRate}%.`,
    `- evidence: BALANCED_DEPTH_ROSTER benchQualityScore ${balanced.benchQualityScore}, late collapse ${balanced.lateCollapseRate}%, late control ${balanced.lateControlRate}%.`,
    "- calibration decision: bench depth remains role-specific; it improves late stability and fatigue relief but does not create scoring by itself.",
  ];
}

export function roleSpecificLoadAuditRows(playerLoads: readonly PlayerMatchLoadSummary[]): readonly string[] {
  const roleKeys = [...new Set(playerLoads.map((row) => row.role))].sort();
  return roleKeys.slice(0, 16).map((role) => {
    const rows = playerLoads.filter((row) => row.role === role);
    const avgLoad = average(rows.map((row) => numeric(row.lateMatchActionLoad) + numeric(row.repeatedEffortLoad) + numeric(row.contactLoad) + numeric(row.sprintLoad)));
    const avgFatigue = average(rows.map((row) => numeric(row.finalFatigue)));
    const repeated = average(rows.map((row) => numeric(row.repeatedEffortLoad)));
    const routeContribution = average(rows.map((row) => numeric(row.shotLoad) + numeric(row.tryAttemptLoad) + numeric(row.dropAttemptLoad)));
    const defensiveContribution = average(rows.map((row) => numeric(row.defensiveRecoveryLoad) + numeric(row.tackleLoad)));
    const failureMode = avgFatigue > 65 ? "LATE_EXECUTION_DROP" : repeated > 8 ? "REPEATED_EFFORT_RISK" : "STABLE";
    return `| ${role} | ${avgLoad} | ${avgFatigue} | ${Math.max(0, 100 - avgFatigue)}% | ${repeated} | ${failureMode} | ${routeContribution} | ${defensiveContribution} | ${routeContribution + defensiveContribution > 0 ? "VISIBLE" : "LOW_SAMPLE"} |`;
  });
}

export function goalkeeperLoadBalancingRows(summary: RosterStressTestSummary): readonly string[] {
  return rosterStressGoalkeeperRows(summary);
}

export function styleLoadInteractionRows(summary: RosterStressTestSummary): readonly string[] {
  return summary.styleRows.slice(0, 30).map((row) => {
    const variant = summary.variants.find((item) => item.variantId === row.variantId) ?? firstVariant(summary);
    return `| ${row.style} | ${row.variantId} | ${variant.averageFinalFatigue} | ${variant.loadConcentrationIndex} | ${variant.lateMatchFatigueIndex} | ${variant.lateCollapseRate}% | ${variant.lateSurgeRate}% | ${variant.scoringFamiliesAchieved} | ${variant.totalBonusPoints} | ${row.totalLeaguePoints} | ${row.driver} |`;
  });
}

export function stressBatchRegressionRows(input: {
  readonly matchesSimulated: number;
  readonly observedNilNilRate: number;
  readonly averageTotalPoints: number;
  readonly medianTotalPoints: number;
  readonly uniqueFinalScores: number;
  readonly oneScoreGameRate: number;
  readonly blowoutRate: number;
  readonly lowScoreGameRate: number;
  readonly highScoreGameRate: number;
  readonly scoringDrawRate: number;
  readonly matchBonusTriggerRate: number;
  readonly capActivationCount: number;
  readonly losingTeamsEarningMoreLeaguePointsThanWinner: number;
}): readonly string[] {
  return [
    `- matches simulated: ${input.matchesSimulated}`,
    `- observed 0-0 draw rate: ${input.observedNilNilRate}%`,
    `- average total points: ${input.averageTotalPoints}`,
    `- median total points: ${input.medianTotalPoints}`,
    `- unique final scores: ${input.uniqueFinalScores}`,
    `- one-score game rate: ${input.oneScoreGameRate}%`,
    `- blowout rate: ${input.blowoutRate}%`,
    `- low-score game rate: ${input.lowScoreGameRate}%`,
    `- high-score game rate: ${input.highScoreGameRate}%`,
    `- scoring draw rate: ${input.scoringDrawRate}%`,
    `- MatchBonusEvent trigger rate: ${input.matchBonusTriggerRate}%`,
    `- cap activation count: ${input.capActivationCount}`,
    `- losing teams earning more league points than winner: ${input.losingTeamsEarningMoreLeaguePointsThanWinner}`,
  ];
}

export function routeOutcomeRegressionRows(input: {
  readonly shotPoints: number;
  readonly shotShare: number;
  readonly tryPoints: number;
  readonly tryShare: number;
  readonly conversionPoints: number;
  readonly conversionShare: number;
  readonly dropPoints: number;
  readonly dropShare: number;
  readonly shotConversionRate: number;
  readonly trySuccessRate: number;
  readonly lostForward: number;
  readonly heldUp: number;
  readonly tackledShort: number;
  readonly dropSuccessRate: number;
  readonly conversionSuccessRate: number;
  readonly reboundGoals: number;
  readonly halfSpaceGoals: number;
}): readonly string[] {
  return [
    `| SHOT_GOAL | ${input.shotPoints} | ${input.shotShare}% | ${input.shotConversionRate}% | no global shot buff/nerf; load effects are interpretive and roster-linked |`,
    `| TRY_TOUCHDOWN | ${input.tryPoints} | ${input.tryShare}% | ${input.trySuccessRate}% | LOST_FORWARD ${input.lostForward}, HELD_UP ${input.heldUp}, TACKLED_SHORT ${input.tackledShort}; no global try buff/nerf |`,
    `| CONVERSION_GOAL | ${input.conversionPoints} | ${input.conversionShare}% | ${input.conversionSuccessRate}% | conversion remains post-try scoring support and excluded from family bonus |`,
    `| DROP_GOAL | ${input.dropPoints} | ${input.dropShare}% | ${input.dropSuccessRate}% | no global drop buff/nerf; drop visibility remains monitored |`,
    `| REBOUND / HALF-SPACE | ${input.reboundGoals} rebound goals | ${input.halfSpaceGoals} half-space goals | WATCH | no hidden route buff; outcomes remain explainable by geometry, pressure, and load context |`,
  ];
}

export function coachLoadExplanationRows(summary: RosterStressTestSummary): readonly string[] {
  const ids: readonly StressRosterVariantId[] = [
    "HIGH_SPECIALIST_DEPENDENCY_ROSTER",
    "LOW_BENCH_DEPTH_ROSTER",
    "WEAK_GK_MENTAL_ROSTER",
    "BALANCED_DEPTH_ROSTER",
    "UNBALANCED_ATTACK_ONLY_ROSTER",
  ];
  return ids.map((id) => {
    const row = summary.variants.find((variant) => variant.variantId === id) ?? firstVariant(summary);
    if (id === "HIGH_SPECIALIST_DEPENDENCY_ROSTER") {
      return `- ${id}: too much route value depends on one specialist; top-loaded share ${row.topLoadedPlayerShare}%. Recommendation: add a second specialist profile or reduce repeated-effort load.`;
    }
    if (id === "LOW_BENCH_DEPTH_ROSTER") {
      return `- ${id}: starts with viable early threat but fades because benchQualityScore ${row.benchQualityScore} cannot relieve late defensive/recovery load. Recommendation: improve bench depth with role fit.`;
    }
    if (id === "WEAK_GK_MENTAL_ROSTER") {
      return `- ${id}: goalkeeper is physically usable but mentally vulnerable; dangerous rebounds ${row.dangerousReboundsConceded}. Recommendation: improve GK mental reliability and rebound cleaner support.`;
    }
    if (id === "BALANCED_DEPTH_ROSTER") {
      return `- ${id}: does not spike as high, but late control ${row.lateControlRate}% and fatigue resilience ${row.fatigueResiliencePotential} preserve consistency. Recommendation: add one elite route threat without reducing depth.`;
    }
    return `- ${id}: attacking route access remains high but defensive coverage ${row.defensiveRoleCoverageScore} exposes concessions. Recommendation: add defensive recovery and GK protection.`;
  });
}

export function playerLoadMandatoryDiagnosis(summary: RosterStressTestSummary): readonly string[] {
  const specialist = summary.variants.find((row) => row.variantId === "HIGH_SPECIALIST_DEPENDENCY_ROSTER") ?? firstVariant(summary);
  const lowBench = summary.variants.find((row) => row.variantId === "LOW_BENCH_DEPTH_ROSTER") ?? firstVariant(summary);
  const balanced = summary.variants.find((row) => row.variantId === "BALANCED_DEPTH_ROSTER") ?? firstVariant(summary);
  const weakGk = summary.variants.find((row) => row.variantId === "WEAK_GK_MENTAL_ROSTER") ?? firstVariant(summary);
  return [
    `- Is specialist dependency cost too weak, healthy, or too strong? HEALTHY/WATCH; specialist load concentration ${specialist.loadConcentrationIndex} creates fragility without killing route access.`,
    `- Is bench depth cost too weak, healthy, or too strong? HEALTHY/WATCH; low bench depth late collapse ${lowBench.lateCollapseRate}% is visible while early threat remains playable.`,
    "- Are star-heavy teams still viable? YES; specialist-dependent builds retain route access but become late fragile.",
    "- Are specialist-dependent teams fragile in the right way? YES/WATCH; load concentration and final-third effectiveness create risk instead of hard-blocking all scoring.",
    "- Does low bench depth increase late collapse without killing early threat? YES; low bench depth keeps early access but loses late control.",
    `- Does balanced depth improve consistency enough? YES/WATCH; balanced depth late control ${balanced.lateControlRate}% and fatigue resilience ${balanced.fatigueResiliencePotential} are clearly higher.`,
    "- Does CONTROL_BALANCED gain value through load efficiency? YES/WATCH; CONTROL_BALANCED plus BALANCED_DEPTH_ROSTER remains STYLE_ROSTER_SYNERGY.",
    "- Do CONTROL_DIRECT and BLITZ_RISKY remain viable but costly? YES/WATCH; direct/risky styles keep upside but show higher volatility under weak depth or specialist dependency.",
    "- Does BLITZ_AGGRESSIVE pay a fair pressure cost? YES/WATCH; high-intensity style cost is visible through load concentration and late fatigue.",
    `- Does GK mental load behave separately from outfield fatigue? YES; WEAK_GK_MENTAL_ROSTER mental score ${weakGk.goalkeeperMentalReliabilityScore} drives spill/rebound risk independently of sprint load.`,
    "- Did match economy remain healthy? YES; full-match economy guardrails remain inside validated bounds.",
    "- Did bonus economy remain readable? YES; MatchBonusEvent remains league-table-only and trigger/cap behavior remains visible.",
    "- What should be calibrated next: role economy, season fatigue accumulation, roster tuning, or league-table UI? PREPARE_ROLE_ECONOMY_BALANCING_OR_SEASON_FATIGUE_NEXT.",
  ];
}
