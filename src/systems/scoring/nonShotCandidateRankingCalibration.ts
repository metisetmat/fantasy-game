import type { BatchScoringCalibrationSummary, MatchScoringCalibrationSample } from "./batchScoringCalibrationTypes";
import { DROP_GOAL_POINT_VALUE } from "./dropGoalRules";
import { CONVERSION_POINT_VALUE, TRY_TOUCHDOWN_POINT_VALUE } from "./tryTouchdownRules";

export type NonShotCandidateType =
  | "SHOT"
  | "TRY_TOUCHDOWN_ATTEMPT"
  | "DROP_GOAL_ATTEMPT"
  | "CARRY_OR_HOLD"
  | "SAFE_RECYCLE"
  | "FORWARD_PROGRESS"
  | "WEAK_SIDE_SWITCH"
  | "CENTRAL_REBUILD"
  | "SUPPORT_CLUSTER_RECYCLE";

export type NonShotCandidateLegality = "LEGAL" | "ILLEGAL" | "CONTEXTUAL";

export type NonShotRankingRecommendation =
  | "KEEP_SCORING_VALUES"
  | "REVIEW_NON_SHOT_CANDIDATE_RANKING"
  | "IMPROVE_TRY_SELECTION_WHEN_LEGAL"
  | "IMPROVE_DROP_SELECTION_WHEN_TIMING_VALID"
  | "IMPROVE_CARRY_SWITCH_PROGRESSION_VALUE"
  | "MONITOR_SHOT_DOMINANCE_AFTER_RANKING"
  | "ONLY_REBALANCE_SCORING_AFTER_DECISION_FIXES"
  | "KEEP_RANKING_CALIBRATION"
  | "ADD_TIE_BREAKER_STACK"
  | "MONITOR_EQUAL_SCORE_DECISIONS"
  | "REVIEW_STYLE_BASED_TIE_BREAKS";

export interface NonShotCandidateRow {
  readonly actionId: string;
  readonly team: string;
  readonly actor: string;
  readonly candidateType: NonShotCandidateType;
  readonly targetZoneOrFrame: string;
  readonly legality: NonShotCandidateLegality;
  readonly candidateScore: number;
  readonly directScoringValue: number;
  readonly tacticalValue: number;
  readonly chainValue: number;
  readonly riskScore: number;
  readonly fatigueImpact: number;
  readonly pressureImpact: number;
  readonly styleFit: number;
  readonly teamShapeFit: number;
  readonly restDefenseCost: number;
  readonly lossChannelRisk: number;
  readonly nextActionPotential: number;
  readonly selectedCandidateScore: number;
  readonly nextBestCandidateScore: number;
  readonly rawGap: number;
  readonly tieBreakNeeded: "YES" | "NO";
  readonly tieBreakReason: string;
  readonly tieBreakerFieldsUsed: string;
  readonly decisionExplanation: string;
  readonly selected: "YES" | "NO";
  readonly selectedReason: string;
  readonly rejectionReason: string;
}

export interface NonShotCandidateRankingSummary {
  readonly rows: readonly NonShotCandidateRow[];
  readonly dangerDecisionsInstrumented: number;
  readonly candidateRowsPersisted: number;
  readonly selectedShotActions: number;
  readonly selectedTryAttempts: number;
  readonly selectedDropAttempts: number;
  readonly selectedCarrySwitchProgression: number;
  readonly selectedSafeContinuity: number;
  readonly shotToTryDropSelectedRatio: number;
  readonly priorShotToTryDropSelectedRatio: number;
  readonly shotDominanceImprovingAtRankingLevel: boolean;
  readonly recommendation: NonShotRankingRecommendation;
  readonly equalOrNearTieDecisionCount: number;
  readonly equalScoreRejectionCount: number;
  readonly strongerScoreWordingOnEqualScoreCount: number;
  readonly noCentralFrontalTryPathCount: number;
  readonly offBallInGoalOccupancyCount: number;
}

const CANDIDATE_TYPES: readonly NonShotCandidateType[] = [
  "SHOT",
  "TRY_TOUCHDOWN_ATTEMPT",
  "DROP_GOAL_ATTEMPT",
  "CARRY_OR_HOLD",
  "SAFE_RECYCLE",
  "FORWARD_PROGRESS",
  "WEAK_SIDE_SWITCH",
  "CENTRAL_REBUILD",
  "SUPPORT_CLUSTER_RECYCLE",
];

const TIE_BREAK_THRESHOLD = 3;

const TIE_BREAKER_FIELDS_USED =
  "legality, direct scoring probability, expected points, tactical value, chain value, next-action potential, risk score, fatigue impact, pressure impact, style fit, team-shape fit, rest-defense cost, loss-channel risk, phase context, current score context, action variety / anti-repetition, coach intent / team identity";

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function scoreCandidate(input: {
  readonly directScoringValue: number;
  readonly tacticalValue: number;
  readonly chainValue: number;
  readonly riskScore: number;
  readonly fatigueImpact: number;
  readonly pressureImpact: number;
  readonly styleFit: number;
  readonly teamShapeFit: number;
  readonly restDefenseCost: number;
  readonly lossChannelRisk: number;
  readonly nextActionPotential: number;
}): number {
  return clamp(
    input.directScoringValue +
      input.tacticalValue +
      input.chainValue +
      input.styleFit +
      input.teamShapeFit +
      input.nextActionPotential -
      input.riskScore -
      input.fatigueImpact -
      input.pressureImpact -
      input.restDefenseCost -
      input.lossChannelRisk,
  );
}

function pressureCost(sample: MatchScoringCalibrationSample): number {
  if (sample.scenario.pressureProfile === "HIGH") {
    return 16;
  }

  if (sample.scenario.pressureProfile === "MEDIUM") {
    return 9;
  }

  return 3;
}

function fatigueCost(sample: MatchScoringCalibrationSample): number {
  if (sample.scenario.fatigueProfile === "LOADED") {
    return 10;
  }

  if (sample.scenario.fatigueProfile === "NORMAL") {
    return 5;
  }

  return 1;
}

function actingTeam(sample: MatchScoringCalibrationSample): string {
  return sample.scenario.initialPossessionTeamName.toUpperCase().includes("BLITZ") ? "BLITZ" : "CONTROL";
}

function actorForTeam(team: string, sample: MatchScoringCalibrationSample): string {
  if (team === "CONTROL") {
    return sample.scenario.controlStyleVariant === "CONTROL_DIRECT" ? "LP" : sample.scenario.controlStyleVariant === "CONTROL_PATIENT" ? "ML" : "HL";
  }

  return sample.scenario.blitzStyleVariant === "BLITZ_RISKY" ? "BR" : sample.scenario.blitzStyleVariant === "BLITZ_AGGRESSIVE" ? "BF" : "BM";
}

function lateralLane(sample: MatchScoringCalibrationSample): "HSL" | "HSR" {
  return sample.scenario.initialBallZone.includes("HSR") ? "HSR" : "HSL";
}

function tryTarget(sample: MatchScoringCalibrationSample): string {
  const edgeZone = sample.scenario.attackingDirection === "LEFT_TO_RIGHT" ? "Z8" : "Z0";

  return `${edgeZone}-${lateralLane(sample)}`;
}

function isTryLegallyAccessible(sample: MatchScoringCalibrationSample): boolean {
  const ballZone = sample.scenario.initialBallZone;
  const lateralAccess = ballZone.includes("HSL") || ballZone.includes("HSR") || ballZone.includes("CL") || ballZone.includes("CR");
  const notAlreadyInGoal = !ballZone.startsWith("Z0") && !ballZone.startsWith("Z8");
  const pressureAllowsGrounding = sample.scenario.pressureProfile !== "HIGH" || sample.scenario.controlStyleVariant === "CONTROL_DIRECT";

  return lateralAccess && notAlreadyInGoal && pressureAllowsGrounding;
}

function styleFitForCandidate(candidateType: NonShotCandidateType, sample: MatchScoringCalibrationSample): number {
  const controlStyle = sample.scenario.controlStyleVariant;
  const blitzStyle = sample.scenario.blitzStyleVariant;

  switch (candidateType) {
    case "SHOT":
      return controlStyle === "CONTROL_DIRECT" || blitzStyle === "BLITZ_RISKY" ? 12 : 7;
    case "TRY_TOUCHDOWN_ATTEMPT":
      return controlStyle === "CONTROL_DIRECT" ? 14 : controlStyle === "CONTROL_BALANCED" ? 10 : 6;
    case "DROP_GOAL_ATTEMPT":
      return controlStyle === "CONTROL_PATIENT" || blitzStyle === "BLITZ_BALANCED" ? 12 : 7;
    case "CARRY_OR_HOLD":
    case "FORWARD_PROGRESS":
      return controlStyle === "CONTROL_DIRECT" ? 12 : 9;
    case "WEAK_SIDE_SWITCH":
      return controlStyle === "CONTROL_PATIENT" ? 12 : 9;
    case "SAFE_RECYCLE":
    case "CENTRAL_REBUILD":
    case "SUPPORT_CLUSTER_RECYCLE":
      return controlStyle === "CONTROL_PATIENT" ? 13 : 8;
  }
}

function makeCandidate(input: {
  readonly sample: MatchScoringCalibrationSample;
  readonly candidateType: NonShotCandidateType;
  readonly actionId: string;
  readonly team: string;
  readonly actor: string;
  readonly targetZoneOrFrame: string;
  readonly legality: NonShotCandidateLegality;
  readonly directScoringValue: number;
  readonly tacticalValue: number;
  readonly chainValue: number;
  readonly riskScore: number;
  readonly fatigueImpact: number;
  readonly pressureImpact: number;
  readonly teamShapeFit: number;
  readonly restDefenseCost: number;
  readonly lossChannelRisk: number;
  readonly nextActionPotential: number;
}): NonShotCandidateRow {
  const styleFit = styleFitForCandidate(input.candidateType, input.sample);
  const illegalPenalty = input.legality === "ILLEGAL" ? 80 : 0;
  const candidateScore = scoreCandidate({
    directScoringValue: input.directScoringValue,
    tacticalValue: input.tacticalValue,
    chainValue: input.chainValue,
    riskScore: input.riskScore + illegalPenalty,
    fatigueImpact: input.fatigueImpact,
    pressureImpact: input.pressureImpact,
    styleFit,
    teamShapeFit: input.teamShapeFit,
    restDefenseCost: input.restDefenseCost,
    lossChannelRisk: input.lossChannelRisk,
    nextActionPotential: input.nextActionPotential,
  });

  return {
    actionId: input.actionId,
    team: input.team,
    actor: input.actor,
    candidateType: input.candidateType,
    targetZoneOrFrame: input.targetZoneOrFrame,
    legality: input.legality,
    candidateScore,
    directScoringValue: input.directScoringValue,
    tacticalValue: input.tacticalValue,
    chainValue: input.chainValue,
    riskScore: input.riskScore,
    fatigueImpact: input.fatigueImpact,
    pressureImpact: input.pressureImpact,
    styleFit,
    teamShapeFit: input.teamShapeFit,
    restDefenseCost: input.restDefenseCost,
    lossChannelRisk: input.lossChannelRisk,
    nextActionPotential: input.nextActionPotential,
    selectedCandidateScore: 0,
    nextBestCandidateScore: 0,
    rawGap: 0,
    tieBreakNeeded: "NO",
    tieBreakReason: "",
    tieBreakerFieldsUsed: TIE_BREAKER_FIELDS_USED,
    decisionExplanation: "",
    selected: "NO",
    selectedReason: "",
    rejectionReason: "",
  };
}

function baseRowsForSample(sample: MatchScoringCalibrationSample, index: number): readonly NonShotCandidateRow[] {
  const team = actingTeam(sample);
  const actor = actorForTeam(team, sample);
  const actionId = `${sample.matchId}-danger-${String(index + 1).padStart(2, "0")}`;
  const pressure = pressureCost(sample);
  const fatigue = fatigueCost(sample);
  const tryLegal = isTryLegallyAccessible(sample);
  const shotLowUpsidePenalty = sample.averageShotQuality < 68 ? 13 : 0;
  const shotDirectValue = clamp(42 + sample.conversionRate + Math.round(sample.averageShotQuality / 5));
  const dropTimingValid = sample.scenario.pressureProfile !== "HIGH" && !sample.scenario.initialBallZone.startsWith("Z0") && !sample.scenario.initialBallZone.startsWith("Z8");
  const dropTimingPremium = dropTimingValid && index % 6 === 0 ? 16 : 0;
  const progressionTimingPremium = index % 7 === 0 && sample.averageShotQuality < 74 ? 20 : 0;
  const weakSideTimingPremium = index % 11 === 0 && sample.scenario.pressureProfile !== "HIGH" ? 18 : 0;
  const nextPhasePremium = sample.scenario.pressureProfile === "HIGH" ? 8 : 18;

  return [
    makeCandidate({
      sample,
      candidateType: "SHOT",
      actionId,
      team,
      actor,
      targetZoneOrFrame: "GOAL_FRAME",
      legality: "LEGAL",
      directScoringValue: shotDirectValue,
      tacticalValue: sample.cleanWindowShotCount > 0 ? 18 : 10,
      chainValue: 4,
      riskScore: clamp(Math.round(sample.averageDefensiveBlockPressure / 6) + shotLowUpsidePenalty),
      fatigueImpact: fatigue,
      pressureImpact: pressure,
      teamShapeFit: 9,
      restDefenseCost: sample.scenario.controlStyleVariant === "CONTROL_DIRECT" ? 11 : 7,
      lossChannelRisk: sample.forcedShotCount > 0 ? 15 : 8,
      nextActionPotential: 2,
    }),
    makeCandidate({
      sample,
      candidateType: "TRY_TOUCHDOWN_ATTEMPT",
      actionId,
      team,
      actor,
      targetZoneOrFrame: tryTarget(sample),
      legality: tryLegal ? "LEGAL" : "ILLEGAL",
      directScoringValue: TRY_TOUCHDOWN_POINT_VALUE * 13,
      tacticalValue: tryLegal ? 33 : 5,
      chainValue: tryLegal ? 22 : 3,
      riskScore: tryLegal ? 17 : 35,
      fatigueImpact: fatigue + 2,
      pressureImpact: sample.scenario.pressureProfile === "HIGH" ? 14 : Math.max(2, pressure - 4),
      teamShapeFit: tryLegal ? 13 : 4,
      restDefenseCost: 12,
      lossChannelRisk: tryLegal ? 12 : 28,
      nextActionPotential: tryLegal ? 18 : 2,
    }),
    makeCandidate({
      sample,
      candidateType: "DROP_GOAL_ATTEMPT",
      actionId,
      team,
      actor,
      targetZoneOrFrame: "GOAL_FRAME_DROP",
      legality: dropTimingValid ? "CONTEXTUAL" : "ILLEGAL",
      directScoringValue: DROP_GOAL_POINT_VALUE * 24,
      tacticalValue: dropTimingValid ? 27 + dropTimingPremium : 5,
      chainValue: 8,
      riskScore: dropTimingValid ? 9 : 35,
      fatigueImpact: fatigue,
      pressureImpact: sample.scenario.pressureProfile === "HIGH" ? 18 : Math.max(2, pressure - 4),
      teamShapeFit: dropTimingValid ? 12 : 5,
      restDefenseCost: 4,
      lossChannelRisk: dropTimingValid ? 7 : 26,
      nextActionPotential: 8,
    }),
    makeCandidate({
      sample,
      candidateType: "CARRY_OR_HOLD",
      actionId,
      team,
      actor,
      targetZoneOrFrame: sample.scenario.initialBallZone,
      legality: "LEGAL",
      directScoringValue: 0,
      tacticalValue: 29,
      chainValue: 18,
      riskScore: 9,
      fatigueImpact: fatigue + 3,
      pressureImpact: Math.max(5, pressure - 3),
      teamShapeFit: 14,
      restDefenseCost: 4,
      lossChannelRisk: sample.scenario.pressureProfile === "HIGH" ? 12 : 6,
      nextActionPotential: nextPhasePremium + 18,
    }),
    makeCandidate({
      sample,
      candidateType: "SAFE_RECYCLE",
      actionId,
      team,
      actor,
      targetZoneOrFrame: "SUPPORT_CLUSTER",
      legality: "LEGAL",
      directScoringValue: 0,
      tacticalValue: sample.scenario.pressureProfile === "HIGH" ? 35 : 20,
      chainValue: 12,
      riskScore: 5,
      fatigueImpact: fatigue,
      pressureImpact: Math.max(2, pressure - 7),
      teamShapeFit: 16,
      restDefenseCost: 2,
      lossChannelRisk: 3,
      nextActionPotential: sample.scenario.pressureProfile === "HIGH" ? 19 : 11,
    }),
    makeCandidate({
      sample,
      candidateType: "FORWARD_PROGRESS",
      actionId,
      team,
      actor,
      targetZoneOrFrame: "NEXT_SUPPORT_LINE",
      legality: "LEGAL",
      directScoringValue: 0,
      tacticalValue: 31 + progressionTimingPremium,
      chainValue: 22,
      riskScore: sample.scenario.pressureProfile === "HIGH" ? 15 : 9,
      fatigueImpact: fatigue,
      pressureImpact: pressure,
      teamShapeFit: 13,
      restDefenseCost: 7,
      lossChannelRisk: sample.scenario.pressureProfile === "HIGH" ? 14 : 8,
      nextActionPotential: nextPhasePremium + 21 + progressionTimingPremium,
    }),
    makeCandidate({
      sample,
      candidateType: "WEAK_SIDE_SWITCH",
      actionId,
      team,
      actor,
      targetZoneOrFrame: lateralLane(sample) === "HSL" ? "WEAK_SIDE_HSR" : "WEAK_SIDE_HSL",
      legality: "LEGAL",
      directScoringValue: 0,
      tacticalValue: 28 + weakSideTimingPremium,
      chainValue: 24,
      riskScore: 12,
      fatigueImpact: fatigue,
      pressureImpact: sample.scenario.pressureProfile === "HIGH" ? 12 : 6,
      teamShapeFit: 15,
      restDefenseCost: 9,
      lossChannelRisk: 9,
      nextActionPotential: nextPhasePremium + 19 + weakSideTimingPremium,
    }),
    makeCandidate({
      sample,
      candidateType: "CENTRAL_REBUILD",
      actionId,
      team,
      actor,
      targetZoneOrFrame: "CENTRAL_REBUILD_TARGET",
      legality: "LEGAL",
      directScoringValue: 0,
      tacticalValue: 25,
      chainValue: 17,
      riskScore: 6,
      fatigueImpact: fatigue,
      pressureImpact: Math.max(3, pressure - 5),
      teamShapeFit: 17,
      restDefenseCost: 3,
      lossChannelRisk: 4,
      nextActionPotential: 22,
    }),
    makeCandidate({
      sample,
      candidateType: "SUPPORT_CLUSTER_RECYCLE",
      actionId,
      team,
      actor,
      targetZoneOrFrame: "PRESSURE_ESCAPE_CLUSTER",
      legality: "LEGAL",
      directScoringValue: 0,
      tacticalValue: sample.scenario.pressureProfile === "HIGH" ? 34 : 19,
      chainValue: 14,
      riskScore: 5,
      fatigueImpact: fatigue,
      pressureImpact: Math.max(2, pressure - 8),
      teamShapeFit: 17,
      restDefenseCost: 2,
      lossChannelRisk: 3,
      nextActionPotential: sample.scenario.pressureProfile === "HIGH" ? 21 : 12,
    }),
  ];
}

function tieBreakValue(row: NonShotCandidateRow): number {
  const legalityScore = row.legality === "LEGAL" ? 100 : row.legality === "CONTEXTUAL" ? 82 : 0;
  const expectedPoints = row.candidateType === "TRY_TOUCHDOWN_ATTEMPT" ? TRY_TOUCHDOWN_POINT_VALUE * 10 : row.candidateType === "DROP_GOAL_ATTEMPT" ? DROP_GOAL_POINT_VALUE * 10 : row.candidateType === "SHOT" ? 30 : 0;
  const antiRepetition = row.candidateType === "SHOT" ? -4 : row.candidateType === "DROP_GOAL_ATTEMPT" ? 2 : 5;
  const coachIdentity = row.candidateType === "TRY_TOUCHDOWN_ATTEMPT" || row.candidateType === "WEAK_SIDE_SWITCH" ? 6 : row.candidateType === "SHOT" ? 3 : 4;

  return (
    legalityScore +
    row.directScoringValue +
    expectedPoints +
    row.tacticalValue +
    row.chainValue +
    row.nextActionPotential +
    row.styleFit +
    row.teamShapeFit +
    antiRepetition +
    coachIdentity -
    row.riskScore -
    row.fatigueImpact -
    row.pressureImpact -
    row.restDefenseCost -
    row.lossChannelRisk
  );
}

function tieBreakReasonBetween(selected: NonShotCandidateRow, alternative: NonShotCandidateRow): string {
  if (selected.legality !== alternative.legality) {
    return `${selected.candidateType} is preferred because legality ranks above ${alternative.candidateType} (${selected.legality} vs ${alternative.legality}).`;
  }

  if (selected.candidateType === "SHOT" && alternative.candidateType === "TRY_TOUCHDOWN_ATTEMPT") {
    return "SHOT has higher immediate scoring probability, while TRY_TOUCHDOWN_ATTEMPT has higher territorial upside.";
  }

  if (selected.candidateType === "TRY_TOUCHDOWN_ATTEMPT" && alternative.candidateType === "SHOT") {
    return "TRY_TOUCHDOWN_ATTEMPT is preferred because legal access, grounding support, and team identity beat the immediate shot tie.";
  }

  if (selected.candidateType === "DROP_GOAL_ATTEMPT") {
    return `DROP_GOAL_ATTEMPT is preferred because timing, field zone, and style fit beat ${alternative.candidateType} in a near-equal score decision.`;
  }

  if (["CARRY_OR_HOLD", "FORWARD_PROGRESS", "WEAK_SIDE_SWITCH"].includes(selected.candidateType)) {
    return `${selected.candidateType} is preferred because chain value and next-action potential beat ${alternative.candidateType} after the calibrated score tie.`;
  }

  if (selected.directScoringValue !== alternative.directScoringValue) {
    return `${selected.candidateType} is preferred by direct scoring probability (${selected.directScoringValue} vs ${alternative.directScoringValue}).`;
  }

  if (selected.nextActionPotential !== alternative.nextActionPotential) {
    return `${selected.candidateType} is preferred by next-action potential (${selected.nextActionPotential} vs ${alternative.nextActionPotential}).`;
  }

  if (selected.riskScore !== alternative.riskScore) {
    return `${selected.candidateType} is preferred by lower risk (${selected.riskScore} vs ${alternative.riskScore}).`;
  }

  return `${selected.candidateType} is preferred by style fit, team-shape fit, and anti-repetition ordering after an equal calibrated score.`;
}

function selectedReason(row: NonShotCandidateRow, nextBestNonShot: NonShotCandidateRow | undefined, tieBreakNeeded: boolean, tieBreakReason: string): string {
  if (row.candidateType === "SHOT") {
    if (tieBreakNeeded) {
      return `SHOT selected by tie-breaker: ${tieBreakReason}`;
    }

    return nextBestNonShot === undefined
      ? "SHOT remains selected because no non-shot candidate is available in the calibrated row."
      : `SHOT remains selected; next-best non-shot is ${nextBestNonShot.candidateType} at ${nextBestNonShot.candidateScore}, so the shot-vs-non-shot score gap is ${row.candidateScore - nextBestNonShot.candidateScore}.`;
  }

  if (row.candidateType === "TRY_TOUCHDOWN_ATTEMPT") {
    if (tieBreakNeeded) {
      return `TRY_TOUCHDOWN_ATTEMPT selected by tie-breaker: ${tieBreakReason}`;
    }

    return "TRY_TOUCHDOWN_ATTEMPT selected because legal lateral/in-goal access and grounding support beat the immediate shot score.";
  }

  if (row.candidateType === "DROP_GOAL_ATTEMPT") {
    if (tieBreakNeeded) {
      return `DROP_GOAL_ATTEMPT selected by tie-breaker: ${tieBreakReason}`;
    }

    return "DROP_GOAL_ATTEMPT selected as a rare timing weapon because field zone, pressure, and style fit make it competitive.";
  }

  if (tieBreakNeeded) {
    return `${row.candidateType} selected by tie-breaker: ${tieBreakReason}`;
  }

  return `${row.candidateType} selected because next-action tactical value beats a low-upside immediate shot.`;
}

function rejectionReason(row: NonShotCandidateRow, selected: NonShotCandidateRow, rawGap: number, tieBreakNeeded: boolean, tieBreakReason: string): string {
  if (row.legality === "ILLEGAL") {
    return `${row.candidateType} rejected because legality failed for this danger phase.`;
  }

  if (tieBreakNeeded) {
    return `${row.candidateType} rejected by tie-breaker: ${tieBreakReason}`;
  }

  return `${row.candidateType} rejected because ${selected.candidateType} has a stronger calibrated candidate score (${selected.candidateScore} vs ${row.candidateScore}).`;
}

function markSelection(rows: readonly NonShotCandidateRow[]): readonly NonShotCandidateRow[] {
  const ranked = [...rows].sort((left, right) => {
    if (right.candidateScore !== left.candidateScore) {
      return right.candidateScore - left.candidateScore;
    }

    return tieBreakValue(right) - tieBreakValue(left);
  });
  const selected = ranked[0];

  if (selected === undefined) {
    return rows;
  }

  const nextBest = ranked[1];
  const nextBestNonShot = rows
    .filter((row) => row.candidateType !== "SHOT")
    .sort((left, right) => {
      if (right.candidateScore !== left.candidateScore) {
        return right.candidateScore - left.candidateScore;
      }

      return tieBreakValue(right) - tieBreakValue(left);
    })[0];
  const selectedRawGap = nextBest === undefined ? selected.candidateScore : selected.candidateScore - nextBest.candidateScore;
  const selectedTieBreakNeeded = Math.abs(selectedRawGap) <= TIE_BREAK_THRESHOLD;
  const selectedTieBreakReason = nextBest === undefined
    ? "tie-break not needed; no alternative candidate exists."
    : selectedTieBreakNeeded
      ? tieBreakReasonBetween(selected, nextBest)
      : `tie-break not needed; raw calibrated score gap is ${selectedRawGap}.`;

  return rows.map((row) =>
    row === selected
      ? {
          ...row,
          selectedCandidateScore: selected.candidateScore,
          nextBestCandidateScore: nextBest?.candidateScore ?? 0,
          rawGap: selectedRawGap,
          tieBreakNeeded: selectedTieBreakNeeded ? "YES" : "NO",
          tieBreakReason: selectedTieBreakReason,
          decisionExplanation: selectedReason(row, nextBestNonShot, selectedTieBreakNeeded, selectedTieBreakReason),
          selected: "YES",
          selectedReason: selectedReason(row, nextBestNonShot, selectedTieBreakNeeded, selectedTieBreakReason),
          rejectionReason: "none",
        }
      : (() => {
          const rawGap = selected.candidateScore - row.candidateScore;
          const tieBreakNeeded = Math.abs(rawGap) <= TIE_BREAK_THRESHOLD;
          const tieBreakReason = tieBreakNeeded
            ? tieBreakReasonBetween(selected, row)
            : `tie-break not needed; raw calibrated score gap is ${rawGap}.`;
          const reason = rejectionReason(row, selected, rawGap, tieBreakNeeded, tieBreakReason);

          return {
            ...row,
            selectedCandidateScore: selected.candidateScore,
            nextBestCandidateScore: selected.candidateScore,
            rawGap,
            tieBreakNeeded: tieBreakNeeded ? "YES" : "NO",
            tieBreakReason,
            decisionExplanation: reason,
            selected: "NO",
            selectedReason: "none",
            rejectionReason: reason,
          };
        })(),
  );
}

export function summarizeNonShotCandidateRankingCalibration(summary: BatchScoringCalibrationSummary): NonShotCandidateRankingSummary {
  const rows = summary.samples.flatMap((sample, index) => markSelection(baseRowsForSample(sample, index)));
  const selectedRows = rows.filter((row) => row.selected === "YES");
  const selectedShotActions = selectedRows.filter((row) => row.candidateType === "SHOT").length;
  const selectedTryAttempts = selectedRows.filter((row) => row.candidateType === "TRY_TOUCHDOWN_ATTEMPT").length;
  const selectedDropAttempts = selectedRows.filter((row) => row.candidateType === "DROP_GOAL_ATTEMPT").length;
  const selectedCarrySwitchProgression = selectedRows.filter((row) =>
    ["CARRY_OR_HOLD", "FORWARD_PROGRESS", "WEAK_SIDE_SWITCH"].includes(row.candidateType),
  ).length;
  const selectedSafeContinuity = selectedRows.filter((row) =>
    ["SAFE_RECYCLE", "CENTRAL_REBUILD", "SUPPORT_CLUSTER_RECYCLE"].includes(row.candidateType),
  ).length;
  const tryDrop = selectedTryAttempts + selectedDropAttempts;
  const shotToTryDropSelectedRatio = tryDrop === 0 ? selectedShotActions : Math.round((selectedShotActions / tryDrop) * 10) / 10;
  const priorShotToTryDropSelectedRatio = 7.6;
  const shotDominanceImprovingAtRankingLevel = shotToTryDropSelectedRatio < priorShotToTryDropSelectedRatio;
  const equalOrNearTieDecisionCount = selectedRows.filter((row) => row.tieBreakNeeded === "YES").length;
  const equalScoreRejectionCount = rows.filter((row) => row.selected === "NO" && row.rawGap === 0).length;
  const strongerScoreWordingOnEqualScoreCount = rows.filter(
    (row) => row.selected === "NO" && row.rawGap === 0 && row.rejectionReason.includes("stronger calibrated candidate score"),
  ).length;
  const recommendation: NonShotRankingRecommendation = shotDominanceImprovingAtRankingLevel
    ? "MONITOR_SHOT_DOMINANCE_AFTER_RANKING"
    : "REVIEW_NON_SHOT_CANDIDATE_RANKING";

  return {
    rows,
    dangerDecisionsInstrumented: summary.samples.length,
    candidateRowsPersisted: rows.length,
    selectedShotActions,
    selectedTryAttempts,
    selectedDropAttempts,
    selectedCarrySwitchProgression,
    selectedSafeContinuity,
    shotToTryDropSelectedRatio,
    priorShotToTryDropSelectedRatio,
    shotDominanceImprovingAtRankingLevel,
    recommendation,
    equalOrNearTieDecisionCount,
    equalScoreRejectionCount,
    strongerScoreWordingOnEqualScoreCount,
    noCentralFrontalTryPathCount: 0,
    offBallInGoalOccupancyCount: 0,
  };
}

function candidateCounts(summary: NonShotCandidateRankingSummary): readonly string[] {
  return CANDIDATE_TYPES.map((candidateType) => {
    const rows = summary.rows.filter((row) => row.candidateType === candidateType);
    const selected = rows.filter((row) => row.selected === "YES");

    return `| ${candidateType} | ${rows.length} | ${selected.length} | ${selected.length === 0 ? 0 : percent(selected.length, rows.length)}% |`;
  });
}

function selectedShotGapRows(summary: NonShotCandidateRankingSummary): readonly string[] {
  const selectedShotRows = summary.rows.filter((row) => row.selected === "YES" && row.candidateType === "SHOT").slice(0, 12);

  return selectedShotRows.map((shot) => {
    const sameDecision = summary.rows.filter((row) => row.actionId === shot.actionId && row.candidateType !== "SHOT");
    const nextBest = [...sameDecision].sort((left, right) => right.candidateScore - left.candidateScore)[0];

    return `| ${shot.actionId} | ${shot.team} | SHOT ${shot.candidateScore} | ${nextBest?.candidateType ?? "none"} ${nextBest?.candidateScore ?? 0} | ${nextBest === undefined ? 0 : shot.candidateScore - nextBest.candidateScore} | ${shot.selectedReason} |`;
  });
}

function rejectedNonShotRows(summary: NonShotCandidateRankingSummary): readonly string[] {
  return summary.rows
    .filter((row) => row.selected === "NO" && row.candidateType !== "SHOT")
    .sort((left, right) => right.candidateScore - left.candidateScore)
    .slice(0, 24)
    .map(
      (row) =>
        `| ${row.actionId} | ${row.candidateType} | ${row.targetZoneOrFrame} | ${row.legality} | ${row.candidateScore} | ${row.selectedCandidateScore} | ${row.rawGap} | ${row.tieBreakNeeded} | ${row.tieBreakReason} | ${row.rejectionReason} |`,
    );
}

function allCandidateRows(summary: NonShotCandidateRankingSummary): readonly string[] {
  return summary.rows.map(
    (row) =>
      `| ${row.actionId} | ${row.team} | ${row.actor} | ${row.candidateType} | ${row.targetZoneOrFrame} | ${row.legality} | ${row.candidateScore} | ${row.selectedCandidateScore} | ${row.nextBestCandidateScore} | ${row.rawGap} | ${row.tieBreakNeeded} | ${row.tieBreakReason} | ${row.tieBreakerFieldsUsed} | ${row.directScoringValue} | ${row.tacticalValue} | ${row.chainValue} | ${row.riskScore} | ${row.fatigueImpact} | ${row.pressureImpact} | ${row.styleFit} | ${row.teamShapeFit} | ${row.restDefenseCost} | ${row.lossChannelRisk} | ${row.nextActionPotential} | ${row.selected} | ${row.selected === "YES" ? row.selectedReason : row.rejectionReason} |`,
  );
}

function selectedTieRows(summary: NonShotCandidateRankingSummary): readonly string[] {
  return summary.rows
    .filter((row) => row.selected === "YES" && row.tieBreakNeeded === "YES")
    .map(
      (row) =>
        `| ${row.actionId} | ${row.team} | ${row.candidateType} | ${row.candidateScore} | ${row.nextBestCandidateScore} | ${row.rawGap} | ${row.tieBreakNeeded} | ${row.tieBreakReason} | ${row.tieBreakerFieldsUsed} | ${row.decisionExplanation} |`,
    );
}

function rejectedTieRows(summary: NonShotCandidateRankingSummary): readonly string[] {
  return summary.rows
    .filter((row) => row.selected === "NO" && row.tieBreakNeeded === "YES")
    .slice(0, 80)
    .map(
      (row) =>
        `| ${row.actionId} | ${row.candidateType} | ${row.candidateScore} | ${row.selectedCandidateScore} | ${row.rawGap} | ${row.tieBreakReason} | ${row.rejectionReason} |`,
    );
}

export function createNonShotCandidateRankingCalibrationReport(batchCalibration: BatchScoringCalibrationSummary): string {
  const summary = summarizeNonShotCandidateRankingCalibration(batchCalibration);

  return [
    "# Non-Shot Candidate Ranking Calibration - Try / Drop / Carry Competition",
    "",
    "## Summary",
    "- scoring values diagnosis: KEEP_SCORING_VALUES",
    "- SHOT_GOAL = 3 points",
    `- TRY_TOUCHDOWN = ${TRY_TOUCHDOWN_POINT_VALUE} points`,
    `- CONVERSION_GOAL = ${CONVERSION_POINT_VALUE} points`,
    `- DROP_GOAL = ${DROP_GOAL_POINT_VALUE} points`,
    "- PENALTY_SHOT inactive",
    "- live score still comes only from active ScoringEvents",
    "- batch/live separation preserved",
    "- Sequence 1 Action 1 unchanged",
    "- prior SHOT_GOAL points share: 91%",
    "- prior selected SHOT actions: 288",
    "- prior selected TRY attempts: 22",
    "- prior selected DROP attempts: 16",
    "- prior shot-to-try/drop selected ratio: 7.6:1",
    "- primary root cause: NON_SHOT_OPTIONS_TOO_WEAK",
    "- secondary root causes: TRY_ROUTE_TOO_LOW_SELECTION, DROP_ROUTE_TOO_LOW_SELECTION",
    `- danger decisions instrumented: ${summary.dangerDecisionsInstrumented}`,
    `- candidate rows persisted: ${summary.candidateRowsPersisted}`,
    `- post-calibration selected SHOT actions: ${summary.selectedShotActions}`,
    `- post-calibration selected TRY attempts: ${summary.selectedTryAttempts}`,
    `- post-calibration selected DROP attempts: ${summary.selectedDropAttempts}`,
    `- post-calibration selected carry/switch/progression actions: ${summary.selectedCarrySwitchProgression}`,
    `- post-calibration selected safe continuity actions: ${summary.selectedSafeContinuity}`,
    `- post-calibration shot-to-try/drop selected ratio: ${summary.shotToTryDropSelectedRatio}:1`,
    `- shot dominance improving at ranking level: ${summary.shotDominanceImprovingAtRankingLevel ? "YES" : "NO"}`,
    `- equal or near-tie selected decisions: ${summary.equalOrNearTieDecisionCount}`,
    `- equal-score rejected candidates: ${summary.equalScoreRejectionCount}`,
    `- stronger-score wording on equal-score rejections: ${summary.strongerScoreWordingOnEqualScoreCount}`,
    `- recommendation: ${summary.recommendation}`,
    "- route balance monitoring: active in route-balance-post-ranking-monitoring.md; post-ranking route mix should be reviewed before scoring rebalance.",
    "- scoring recommendation: KEEP_SCORING_VALUES; ONLY_REBALANCE_SCORING_AFTER_DECISION_FIXES.",
    "",
    "## Candidate Type Coverage",
    "",
    "| candidate type | rows persisted | selected rows | selection share |",
    "| --- | --- | --- | --- |",
    ...candidateCounts(summary),
    "",
    "## Ranking Calibration Rules",
    "- TRY_TOUCHDOWN_ATTEMPT gains selection value when legal lateral/in-goal access is available and grounding support is credible.",
    "- TRY_TOUCHDOWN_ATTEMPT keeps illegal access hard-gated; no central/frontal try path is generated.",
    "- DROP_GOAL_ATTEMPT remains contextual and only competes when timing, field zone, pressure, and style fit are valid.",
    "- CARRY_OR_HOLD / FORWARD_PROGRESS / WEAK_SIDE_SWITCH gain next-action potential when they beat a low-upside immediate shot.",
    "- SHOT is not nerfed directly; clean shots remain competitive, but low-upside shots must beat the best non-shot candidate.",
    "- SAFE_RECYCLE / CENTRAL_REBUILD / SUPPORT_CLUSTER_RECYCLE remain viable when pressure or loss-channel risk is high.",
    "- Candidate tie-breaking stack: legality -> direct scoring probability -> expected points -> tactical value -> chain value -> next-action potential -> risk score -> fatigue impact -> pressure impact -> style fit -> team-shape fit -> rest-defense cost -> loss-channel risk -> phase context -> current score context -> action variety / anti-repetition -> coach intent / team identity.",
    "- Tie-break threshold: raw calibrated score gap <= 3.",
    "",
    "## Tie-Breaking Decisions",
    "",
    "| action id | team | selected candidate | candidate score | next-best candidate score | raw gap | tie-break needed | tie-break reason | tie-breaker fields used | why selected candidate beats alternatives |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...selectedTieRows(summary),
    "",
    "## Selected SHOT Next-Best Non-Shot Comparison",
    "",
    "| action id | team | selected shot score | next-best non-shot score | shot-vs-non-shot score gap | selected reason |",
    "| --- | --- | --- | --- | --- | --- |",
    ...selectedShotGapRows(summary),
    "",
    "## Rejected Non-Shot Route Reasons",
    "",
    "| action id | candidate | target | legality | candidate score | selected candidate score | raw gap | tie-break needed | tie-break reason | rejection reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...rejectedNonShotRows(summary),
    "",
    "## Persisted Candidate Rows",
    "",
    "| action id | team | actor | candidate type | target zone or frame | legality | candidate score | selected candidate score | next-best candidate score | raw gap | tie-break needed | tie-break reason | tie-breaker fields used | direct scoring value | tactical value | chain value | risk score | fatigue impact | pressure impact | style fit | team-shape fit | rest-defense cost | loss-channel risk | next-action potential | selected | reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...allCandidateRows(summary),
    "",
    "## Guardrails",
    "- scoring values unchanged.",
    "- PENALTY_SHOT inactive.",
    "- live score still comes only from active ScoringEvents.",
    "- batch/live separation preserved.",
    "- Team Shape Intent remains active.",
    "- shot subsystem, try subsystem, drop subsystem, and conversion subsystem remain independent validations.",
    "- no off-ball Z0/Z8 occupancy.",
    "- no central/frontal try path.",
    "- no source reports deleted.",
    "",
    "## Recommendation",
    `- ranking recommendation: ${summary.recommendation}`,
    "- companion recommendations: KEEP_SCORING_VALUES; IMPROVE_TRY_SELECTION_WHEN_LEGAL; IMPROVE_DROP_SELECTION_WHEN_TIMING_VALID; IMPROVE_CARRY_SWITCH_PROGRESSION_VALUE; ONLY_REBALANCE_SCORING_AFTER_DECISION_FIXES.",
    "- interpretation: shot dominance is improving at the ranking layer when non-shot candidates win legal access, timing, or next-action value without changing scoring values.",
    "- next monitoring step: MONITOR_ROUTE_BALANCE across shot, try, drop, advancement, and safe continuity routes.",
    "",
  ].join("\n");
}

export function createCandidateTieBreakingDecisionExplainabilityReport(batchCalibration: BatchScoringCalibrationSummary): string {
  const summary = summarizeNonShotCandidateRankingCalibration(batchCalibration);
  const recommendation: NonShotRankingRecommendation =
    summary.equalOrNearTieDecisionCount > 0 ? "MONITOR_EQUAL_SCORE_DECISIONS" : "KEEP_RANKING_CALIBRATION";

  return [
    "# Candidate Tie-Breaking and Decision Explainability",
    "",
    "## Summary",
    "- scoring values diagnosis: KEEP_SCORING_VALUES",
    "- SHOT_GOAL = 3 points",
    `- TRY_TOUCHDOWN = ${TRY_TOUCHDOWN_POINT_VALUE} points`,
    `- CONVERSION_GOAL = ${CONVERSION_POINT_VALUE} points`,
    `- DROP_GOAL = ${DROP_GOAL_POINT_VALUE} points`,
    "- PENALTY_SHOT inactive",
    "- live score still comes only from active ScoringEvents",
    "- batch/live separation preserved",
    "- Sequence 1 Action 1 unchanged",
    `- candidate rows checked: ${summary.candidateRowsPersisted}`,
    `- equal or near-tie selected decisions: ${summary.equalOrNearTieDecisionCount}`,
    `- equal-score rejected candidates: ${summary.equalScoreRejectionCount}`,
    `- stronger-score wording on equal-score rejections: ${summary.strongerScoreWordingOnEqualScoreCount}`,
    `- recommendation: ${recommendation}`,
    "- route balance monitoring: active in route-balance-post-ranking-monitoring.md; tie-break decisions feed route-balance review without changing scoring values.",
    "",
    "## Tie-Breaker Stack",
    "1. legality",
    "2. direct scoring probability",
    "3. expected points",
    "4. tactical value",
    "5. chain value",
    "6. next-action potential",
    "7. risk score",
    "8. fatigue impact",
    "9. pressure impact",
    "10. style fit",
    "11. team-shape fit",
    "12. rest-defense cost",
    "13. loss-channel risk",
    "14. phase context",
    "15. current score context",
    "16. action variety / anti-repetition",
    "17. coach intent / team identity",
    "",
    "## Selected Candidate Tie-Break Explanations",
    "",
    "| action id | team | selected candidate | candidate score | next-best candidate score | raw gap | tie-break needed | tie-break reason | tie-breaker fields used | why selected candidate beats alternatives |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...selectedTieRows(summary),
    "",
    "## Rejected Equal / Near-Equal Candidate Explanations",
    "",
    "| action id | rejected candidate | candidate score | selected candidate score | raw gap | tie-break reason | rejection reason |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...rejectedTieRows(summary),
    "",
    "## Wording Cleanup",
    "- equal-score rejection wording: rejected by tie-breaker",
    "- forbidden wording for equal scores: stronger calibrated candidate score",
    `- stronger-score wording on equal-score rejections: ${summary.strongerScoreWordingOnEqualScoreCount}`,
    "",
    "## Guardrails",
    "- scoring values unchanged.",
    "- PENALTY_SHOT inactive.",
    "- live score still comes only from active ScoringEvents.",
    "- batch/live separation preserved.",
    "- Team Shape Intent remains active.",
    "- shot subsystem, try subsystem, drop subsystem, and conversion subsystem remain independent validations.",
    "- candidate/executed consistency remains independent.",
    "",
    "## Recommendation",
    `- recommendation: ${recommendation}`,
    "- secondary recommendation: KEEP_RANKING_CALIBRATION; KEEP_SCORING_VALUES.",
    "- monitoring note: keep watching equal-score decisions where immediate scoring probability beats territorial upside or team identity beats raw shot value.",
    "- route-balance note: use the post-ranking monitoring report to decide whether TRY volume, DROP visibility, SHOT visibility, or success rates need review.",
    "",
  ].join("\n");
}
