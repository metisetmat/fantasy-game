import type { BatchScoringCalibrationSummary, MatchScoringCalibrationSample } from "./batchScoringCalibrationTypes";

export type DrawTypeClassification =
  | "NO_CHANCE_DRAW"
  | "DEFENSIVE_STALEMATE"
  | "MIRRORED_SCORING_DRAW"
  | "SHORT_MATCH_DRAW"
  | "STYLE_CANCEL_OUT";

export type DrawRateRecommendation =
  | "KEEP_RULE_BUT_MONITOR"
  | "INCREASE_ACTION_VOLUME"
  | "REDUCE_0_0_DRAWS"
  | "ADJUST_STYLE_MATCHUPS"
  | "LOWER_SHOT_DIFFICULTY_SLIGHTLY"
  | "NEEDS_MORE_SAMPLE";

interface DrawPressureBreakdown {
  readonly pressureProfile: "LOW" | "MEDIUM" | "HIGH";
  readonly matches: number;
  readonly drawRate: number;
  readonly averageShots: number;
  readonly averageConversionRate: number;
  readonly averageCleanWindowConversionRate: number;
  readonly averageScore: string;
}

interface DrawStyleMatchupBreakdown {
  readonly matchup: string;
  readonly matches: number;
  readonly controlWins: number;
  readonly blitzWins: number;
  readonly draws: number;
  readonly averageScore: string;
  readonly conversionRate: number;
  readonly notes: string;
}

interface DrawTypeSummary {
  readonly type: DrawTypeClassification;
  readonly count: number;
  readonly rate: number;
  readonly interpretation: string;
}

export interface DrawRateStyleOutcomeMonitoringSummary {
  readonly matchesSimulated: number;
  readonly drawRate: number;
  readonly controlWinRate: number;
  readonly blitzWinRate: number;
  readonly nilNilDrawRate: number;
  readonly scoringDrawRate: number;
  readonly averageShotsInDraws: number;
  readonly averageShotGoalsInDraws: number;
  readonly averageCleanWindowsInDraws: number;
  readonly averageForcedShotsInDraws: number;
  readonly recommendation: DrawRateRecommendation;
  readonly pressureBreakdowns: readonly DrawPressureBreakdown[];
  readonly styleMatchupBreakdowns: readonly DrawStyleMatchupBreakdown[];
  readonly drawTypeSummaries: readonly DrawTypeSummary[];
  readonly interpretation: readonly string[];
}

const DRAW_TYPES: readonly DrawTypeClassification[] = [
  "NO_CHANCE_DRAW",
  "DEFENSIVE_STALEMATE",
  "MIRRORED_SCORING_DRAW",
  "SHORT_MATCH_DRAW",
  "STYLE_CANCEL_OUT",
];

const PRESSURE_PROFILES: readonly DrawPressureBreakdown["pressureProfile"][] = ["LOW", "MEDIUM", "HIGH"];

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function averageScore(samples: readonly MatchScoringCalibrationSample[]): string {
  return `CONTROL ${average(samples.map((sample) => sample.controlPoints))} - ${average(samples.map((sample) => sample.blitzPoints))} BLITZ`;
}

function aggregatedConversion(samples: readonly MatchScoringCalibrationSample[]): number {
  const goals = samples.reduce((sum, sample) => sum + sample.shotGoals, 0);
  const shots = samples.reduce((sum, sample) => sum + sample.totalShots, 0);

  return percent(goals, shots);
}

function aggregatedCleanWindowConversion(samples: readonly MatchScoringCalibrationSample[]): number {
  const goals = samples.reduce((sum, sample) => sum + sample.cleanWindowGoalCount, 0);
  const shots = samples.reduce((sum, sample) => sum + sample.cleanWindowShotCount, 0);

  return percent(goals, shots);
}

function classifyDraw(sample: MatchScoringCalibrationSample): DrawTypeClassification {
  if (sample.totalShots <= 4) {
    return "SHORT_MATCH_DRAW";
  }

  if (sample.controlPoints === 0 && sample.blitzPoints === 0 && sample.cleanWindowShotCount <= 1) {
    return "NO_CHANCE_DRAW";
  }

  if (sample.controlPoints === 0 && sample.blitzPoints === 0) {
    return "DEFENSIVE_STALEMATE";
  }

  if (sample.controlPoints === sample.blitzPoints && sample.controlPoints > 0) {
    return "MIRRORED_SCORING_DRAW";
  }

  return "STYLE_CANCEL_OUT";
}

function typeInterpretation(type: DrawTypeClassification): string {
  switch (type) {
    case "NO_CHANCE_DRAW":
      return "Low shot and clean-window volume suggests action volume or chance creation may be too low.";
    case "DEFENSIVE_STALEMATE":
      return "Shots occur, but pressure, keeper challenge, or block pressure suppresses scoring.";
    case "MIRRORED_SCORING_DRAW":
      return "Both teams score at similar rates; these draws can be tactically acceptable.";
    case "SHORT_MATCH_DRAW":
      return "The calibration slice may be too short to separate teams.";
    case "STYLE_CANCEL_OUT":
      return "Style matchup effects appear to neutralize outcome separation.";
  }
}

function recommendation(input: {
  readonly summary: BatchScoringCalibrationSummary;
  readonly nilNilDrawRate: number;
  readonly scoringDrawRate: number;
  readonly averageShotsInDraws: number;
  readonly averageDrawConversion: number;
  readonly drawTypes: readonly DrawTypeSummary[];
}): DrawRateRecommendation {
  if (input.summary.matchesSimulated < 20 || input.summary.variationStatus !== "VARIED") {
    return "NEEDS_MORE_SAMPLE";
  }

  if (input.nilNilDrawRate >= 20) {
    return "REDUCE_0_0_DRAWS";
  }

  if (input.averageShotsInDraws > 0 && input.averageShotsInDraws < 5) {
    return "INCREASE_ACTION_VOLUME";
  }

  const defensiveStalemate = input.drawTypes.find((item) => item.type === "DEFENSIVE_STALEMATE")?.rate ?? 0;
  const styleCancelOut = input.drawTypes.find((item) => item.type === "STYLE_CANCEL_OUT")?.rate ?? 0;

  if (input.summary.drawRate >= 45 && styleCancelOut >= 35) {
    return "ADJUST_STYLE_MATCHUPS";
  }

  if (input.summary.drawRate >= 45 && defensiveStalemate >= 35 && input.averageDrawConversion < 25) {
    return "LOWER_SHOT_DIFFICULTY_SLIGHTLY";
  }

  if (input.summary.drawRate >= 45 && input.scoringDrawRate >= input.nilNilDrawRate) {
    return "KEEP_RULE_BUT_MONITOR";
  }

  return "KEEP_RULE_BUT_MONITOR";
}

export function summarizeDrawRateStyleOutcomeMonitoring(summary: BatchScoringCalibrationSummary): DrawRateStyleOutcomeMonitoringSummary {
  const drawSamples = summary.samples.filter((sample) => sample.winner === "DRAW");
  const nilNilDraws = drawSamples.filter((sample) => sample.controlPoints === 0 && sample.blitzPoints === 0);
  const scoringDraws = drawSamples.filter((sample) => sample.controlPoints > 0 || sample.blitzPoints > 0);
  const drawTypeSummaries = DRAW_TYPES.map((type): DrawTypeSummary => {
    const count = drawSamples.filter((sample) => classifyDraw(sample) === type).length;

    return {
      type,
      count,
      rate: percent(count, Math.max(1, drawSamples.length)),
      interpretation: typeInterpretation(type),
    };
  });
  const pressureBreakdowns = PRESSURE_PROFILES.map((pressureProfile): DrawPressureBreakdown => {
    const pressureSamples = summary.samples.filter((sample) => sample.scenario.pressureProfile === pressureProfile);

    return {
      pressureProfile,
      matches: pressureSamples.length,
      drawRate: percent(pressureSamples.filter((sample) => sample.winner === "DRAW").length, pressureSamples.length),
      averageShots: average(pressureSamples.map((sample) => sample.totalShots)),
      averageConversionRate: aggregatedConversion(pressureSamples),
      averageCleanWindowConversionRate: aggregatedCleanWindowConversion(pressureSamples),
      averageScore: averageScore(pressureSamples),
    };
  });
  const matchupKeys = [...new Set(summary.samples.map((sample) => `${sample.scenario.controlStyleVariant} vs ${sample.scenario.blitzStyleVariant}`))].sort();
  const styleMatchupBreakdowns = matchupKeys.map((matchup): DrawStyleMatchupBreakdown => {
    const samples = summary.samples.filter(
      (sample) => `${sample.scenario.controlStyleVariant} vs ${sample.scenario.blitzStyleVariant}` === matchup,
    );
    const draws = samples.filter((sample) => sample.winner === "DRAW").length;
    const conversionRate = aggregatedConversion(samples);

    return {
      matchup,
      matches: samples.length,
      controlWins: samples.filter((sample) => sample.winner === "CONTROL").length,
      blitzWins: samples.filter((sample) => sample.winner === "BLITZ").length,
      draws,
      averageScore: averageScore(samples),
      conversionRate,
      notes:
        draws > samples.length / 2
          ? "High draw share; monitor whether this matchup cancels too cleanly."
          : conversionRate < 25
            ? "Low conversion; check whether pressure suppresses too many chances."
            : "Outcome mix is usable for V1 monitoring.",
    };
  });
  const nilNilDrawRate = percent(nilNilDraws.length, summary.matchesSimulated);
  const scoringDrawRate = percent(scoringDraws.length, summary.matchesSimulated);
  const averageDrawConversion = aggregatedConversion(drawSamples);
  const rec = recommendation({
    summary,
    nilNilDrawRate,
    scoringDrawRate,
    averageShotsInDraws: average(drawSamples.map((sample) => sample.totalShots)),
    averageDrawConversion,
    drawTypes: drawTypeSummaries,
  });

  return {
    matchesSimulated: summary.matchesSimulated,
    drawRate: summary.drawRate,
    controlWinRate: summary.controlWinRate,
    blitzWinRate: summary.blitzWinRate,
    nilNilDrawRate,
    scoringDrawRate,
    averageShotsInDraws: average(drawSamples.map((sample) => sample.totalShots)),
    averageShotGoalsInDraws: average(drawSamples.map((sample) => sample.shotGoals)),
    averageCleanWindowsInDraws: average(drawSamples.map((sample) => sample.cleanWindowShotCount)),
    averageForcedShotsInDraws: average(drawSamples.map((sample) => sample.forcedShotCount)),
    recommendation: rec,
    pressureBreakdowns,
    styleMatchupBreakdowns,
    drawTypeSummaries,
    interpretation: [
      `Are draws caused by too few actions? ${average(drawSamples.map((sample) => sample.totalShots)) < 5 ? "YES" : "NO"}.`,
      `Are draws caused by shot difficulty being too high? ${averageDrawConversion < 25 && summary.drawRate >= 45 ? "POSSIBLY" : "NO"}.`,
      `Are draws caused by style matchups cancelling each other? ${rec === "ADJUST_STYLE_MATCHUPS" ? "YES" : "WATCH"}.`,
      `Are 0-0s too frequent? ${nilNilDrawRate >= 20 ? "YES" : "NO"}.`,
      `Are scoring draws acceptable? ${scoringDrawRate >= nilNilDrawRate ? "YES, monitor style cancellation rather than lowering difficulty." : "WATCH"}.`,
    ],
  };
}

export function createDrawRateStyleOutcomeMonitoringReport(summary: BatchScoringCalibrationSummary): string {
  const drawSummary = summarizeDrawRateStyleOutcomeMonitoring(summary);

  return [
    "# Draw Rate & Style Outcome Monitoring",
    "",
    "## Summary",
    `- matches simulated: ${drawSummary.matchesSimulated}`,
    `- draw rate: ${drawSummary.drawRate}%`,
    `- CONTROL win rate: ${drawSummary.controlWinRate}%`,
    `- BLITZ win rate: ${drawSummary.blitzWinRate}%`,
    `- 0-0 draw rate: ${drawSummary.nilNilDrawRate}%`,
    `- scoring draw rate: ${drawSummary.scoringDrawRate}%`,
    `- average shots in draws: ${drawSummary.averageShotsInDraws}`,
    `- average SHOT_GOAL in draws: ${drawSummary.averageShotGoalsInDraws}`,
    `- average clean windows in draws: ${drawSummary.averageCleanWindowsInDraws}`,
    `- average forced shots in draws: ${drawSummary.averageForcedShotsInDraws}`,
    `- recommendation: ${drawSummary.recommendation}`,
    "",
    "## Draw Breakdown By Pressure",
    "",
    "| pressure | matches | draw rate | average shots | average conversion | average clean-window conversion | average score |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...drawSummary.pressureBreakdowns.map(
      (item) =>
        `| ${item.pressureProfile} | ${item.matches} | ${item.drawRate}% | ${item.averageShots} | ${item.averageConversionRate}% | ${item.averageCleanWindowConversionRate}% | ${item.averageScore} |`,
    ),
    "",
    "## Goalkeeper Diagnostics",
    "- goalkeeper model active: YES",
    `- on-target shots checked: ${summary.onTargetShotCount}`,
    `- goalkeeper evaluated count: ${summary.goalkeeperEvaluatedCount}`,
    `- goalkeeper save/catch/deflect count: ${summary.goalkeeperSaveCatchDeflectCount}`,
    `- goals with GK evaluated: ${summary.goalsWithGoalkeeperEvaluated}`,
    `- goals without GK evaluated: ${summary.goalsWithoutGoalkeeperEvaluated}`,
    `- non-goal shot outcome distribution: caught ${summary.caughtByGoalkeeperCount}, saved ${summary.savedByGoalkeeperCount}, deflected ${summary.deflectedByGoalkeeperCount}, blocked ${summary.blockedByDefenderCount}, missed wide/high ${summary.missedWideHighCount}`,
    "",
    "## Draw Breakdown By Style Matchup",
    "",
    "| matchup | matches | CONTROL wins | BLITZ wins | draws | average score | conversion rate | notes |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...drawSummary.styleMatchupBreakdowns.map(
      (item) =>
        `| ${item.matchup} | ${item.matches} | ${item.controlWins} | ${item.blitzWins} | ${item.draws} | ${item.averageScore} | ${item.conversionRate}% | ${item.notes} |`,
    ),
    "",
    "## Draw Type Classification",
    "",
    "| type | count | draw share | interpretation |",
    "| --- | --- | --- | --- |",
    ...drawSummary.drawTypeSummaries.map((item) => `| ${item.type} | ${item.count} | ${item.rate}% | ${item.interpretation} |`),
    "",
    "## Interpretation",
    ...drawSummary.interpretation.map((item) => `- ${item}`),
    "",
    "## Recommendation",
    `- recommendation: ${drawSummary.recommendation}`,
    `- rationale: ${
      drawSummary.recommendation === "KEEP_RULE_BUT_MONITOR"
        ? "Draws are mostly scoring or style-cancellation outcomes, so do not lower shot difficulty while conversion remains in target."
        : drawSummary.recommendation === "ADJUST_STYLE_MATCHUPS"
          ? "Draws appear tied to style matchup cancellation more than raw shot difficulty."
          : drawSummary.recommendation === "INCREASE_ACTION_VOLUME"
            ? "Draws show too few actions to separate teams."
            : drawSummary.recommendation === "REDUCE_0_0_DRAWS"
              ? "0-0 draws are too frequent and should be reduced before adjusting point value."
              : drawSummary.recommendation === "LOWER_SHOT_DIFFICULTY_SLIGHTLY"
                ? "Enough chances exist, but conversion in draws is too low."
                : "More varied samples are needed before tuning."
    }`,
    "",
  ].join("\n");
}
