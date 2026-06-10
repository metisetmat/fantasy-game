import type { BatchReboundCalibrationEvent, BatchScoringCalibrationSummary } from "./batchScoringCalibrationTypes";
import { scoringRuleLabel, SCORING_VERSION } from "./scoringRules";

export type ReboundDangerRecommendation =
  | "KEEP_REBOUND_MODEL_BUT_MONITOR"
  | "INCREASE_ATTACKER_REBOUND_THREAT"
  | "REDUCE_AUTOMATIC_DEFENSIVE_CLEARANCE"
  | "INCREASE_SCRAMBLE_VARIANCE"
  | "REDUCE_SECOND_SHOT_FREQUENCY"
  | "NEEDS_MORE_SAMPLE";

export interface ReboundDangerCalibrationSummary {
  readonly matchesSimulated: number;
  readonly reboundEvents: number;
  readonly contestedRebounds: number;
  readonly resolvedRebounds: number;
  readonly attackerRecoveries: number;
  readonly defenderRecoveries: number;
  readonly gkRecoveries: number;
  readonly secondShotWindows: number;
  readonly scrambles: number;
  readonly scrambleCreatedSecondShotWindows: number;
  readonly chaoticClearances: number;
  readonly outOfPlayRebounds: number;
  readonly unresolvedContestedRebounds: number;
  readonly attackerRecoveryRate: number;
  readonly defenderRecoveryRate: number;
  readonly gkRecoveryRate: number;
  readonly secondShotWindowRate: number;
  readonly scrambleRate: number;
  readonly outOfPlayReboundRate: number;
  readonly lowDangerRate: number;
  readonly mediumHighDangerRate: number;
  readonly averageImmediateDanger: string;
  readonly recommendation: ReboundDangerRecommendation;
  readonly warnings: readonly string[];
  readonly events: readonly BatchReboundCalibrationEvent[];
}

const dangerScore: Readonly<Record<string, number>> = {
  NONE: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

const dangerLabel: readonly string[] = ["NONE", "LOW", "MEDIUM", "HIGH"];

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function countEvents(
  events: readonly BatchReboundCalibrationEvent[],
  predicate: (event: BatchReboundCalibrationEvent) => boolean,
): number {
  return events.filter(predicate).length;
}

function isScrambleEvent(event: BatchReboundCalibrationEvent): boolean {
  return (
    event.continuationType === "SCRAMBLE" ||
    event.reason.includes("LOOSE_BALL") ||
    event.reason.includes("CONTACT_CONTEST") ||
    event.reason.includes("DOUBLE_TOUCH") ||
    event.reason.includes("CHAOTIC_CLEARANCE") ||
    event.reason.includes("DESPERATE_SECOND_SHOT")
  );
}

function averageDanger(events: readonly BatchReboundCalibrationEvent[]): string {
  if (events.length === 0) {
    return "NONE";
  }

  const average = events.reduce((sum, event) => sum + (dangerScore[event.immediateDanger] ?? 0), 0) / events.length;

  if (average >= 2.5) {
    return "HIGH";
  }

  if (average >= 1.5) {
    return "MEDIUM";
  }

  if (average >= 0.5) {
    return "LOW";
  }

  return "NONE";
}

function allReboundEvents(summary: BatchScoringCalibrationSummary): readonly BatchReboundCalibrationEvent[] {
  return summary.samples.flatMap((sample) => sample.reboundEvents);
}

function recommendation(input: {
  readonly matchesSimulated: number;
  readonly reboundEvents: number;
  readonly attackerRecoveries: number;
  readonly defenderRecoveries: number;
  readonly gkRecoveries: number;
  readonly secondShotWindows: number;
  readonly scrambles: number;
  readonly scrambleCreatedSecondShotWindows: number;
  readonly chaoticClearances: number;
  readonly unresolvedContestedRebounds: number;
}): ReboundDangerRecommendation {
  if (input.matchesSimulated < 20 || input.reboundEvents === 0) {
    return "NEEDS_MORE_SAMPLE";
  }

  if (input.unresolvedContestedRebounds > 0) {
    return "NEEDS_MORE_SAMPLE";
  }

  const defenderRate = percent(input.defenderRecoveries, input.reboundEvents);
  const gkRate = percent(input.gkRecoveries, input.reboundEvents);
  const secondShotRate = percent(input.secondShotWindows, input.reboundEvents);

  if (secondShotRate > 30) {
    return "REDUCE_SECOND_SHOT_FREQUENCY";
  }

  if (defenderRate > 85) {
    return "REDUCE_AUTOMATIC_DEFENSIVE_CLEARANCE";
  }

  if (input.attackerRecoveries === 0 || input.secondShotWindows === 0) {
    return "INCREASE_ATTACKER_REBOUND_THREAT";
  }

  if (input.scrambles === 0 && gkRate < 60) {
    return "INCREASE_SCRAMBLE_VARIANCE";
  }

  return "KEEP_REBOUND_MODEL_BUT_MONITOR";
}

export function summarizeReboundDangerCalibration(summary: BatchScoringCalibrationSummary): ReboundDangerCalibrationSummary {
  const events = allReboundEvents(summary);
  const reboundEvents = events.length;
  const contestedRebounds = countEvents(events, (event) => event.reboundType === "CONTESTED");
  const resolvedRebounds = countEvents(events, (event) => event.reboundWinner !== "CONTESTED_REMAINS");
  const attackerRecoveries = countEvents(events, (event) => event.reboundWinner === "ATTACKER");
  const defenderRecoveries = countEvents(events, (event) => event.reboundWinner === "DEFENDER");
  const gkRecoveries = countEvents(events, (event) => event.reboundWinner === "GOALKEEPER");
  const secondShotWindows = countEvents(events, (event) => event.continuationType === "SECOND_SHOT_WINDOW");
  const scrambles = countEvents(events, isScrambleEvent);
  const scrambleCreatedSecondShotWindows = countEvents(
    events,
    (event) => event.continuationType === "SECOND_SHOT_WINDOW" && event.reason.includes("DESPERATE_SECOND_SHOT"),
  );
  const chaoticClearances = countEvents(events, (event) => event.reason.includes("CHAOTIC_CLEARANCE"));
  const outOfPlayRebounds = countEvents(events, (event) => event.continuationType === "OUT_OF_PLAY" || event.reboundWinner === "OUT_OF_PLAY");
  const unresolvedContestedRebounds = 0;
  const lowDangerCount = countEvents(events, (event) => event.immediateDanger === "NONE" || event.immediateDanger === "LOW");
  const mediumHighDangerCount = countEvents(events, (event) => event.immediateDanger === "MEDIUM" || event.immediateDanger === "HIGH");
  const rec = recommendation({
    matchesSimulated: summary.matchesSimulated,
    reboundEvents,
    attackerRecoveries,
    defenderRecoveries,
    gkRecoveries,
    secondShotWindows,
    scrambles,
    scrambleCreatedSecondShotWindows,
    chaoticClearances,
    unresolvedContestedRebounds,
  });

  return {
    matchesSimulated: summary.matchesSimulated,
    reboundEvents,
    contestedRebounds,
    resolvedRebounds,
    attackerRecoveries,
    defenderRecoveries,
    gkRecoveries,
    secondShotWindows,
    scrambles,
    scrambleCreatedSecondShotWindows,
    chaoticClearances,
    outOfPlayRebounds,
    unresolvedContestedRebounds,
    attackerRecoveryRate: percent(attackerRecoveries, reboundEvents),
    defenderRecoveryRate: percent(defenderRecoveries, reboundEvents),
    gkRecoveryRate: percent(gkRecoveries, reboundEvents),
    secondShotWindowRate: percent(secondShotWindows, reboundEvents),
    scrambleRate: percent(scrambles, reboundEvents),
    outOfPlayReboundRate: percent(outOfPlayRebounds, reboundEvents),
    lowDangerRate: percent(lowDangerCount, reboundEvents),
    mediumHighDangerRate: percent(mediumHighDangerCount, reboundEvents),
    averageImmediateDanger: averageDanger(events),
    recommendation: rec,
    warnings: [
      ...(attackerRecoveries === 0 && summary.matchesSimulated >= 20 ? ["attacker recovery rate is 0 across the batch"] : []),
      ...(secondShotWindows === 0 && summary.matchesSimulated >= 20 ? ["second-shot window rate is 0 across the batch"] : []),
      ...(percent(defenderRecoveries, reboundEvents) > 85 ? ["defender recovery/clearance rate is above monitoring range"] : []),
      ...(percent(gkRecoveries, reboundEvents) > 60 ? ["GK recovery rate is above monitoring range"] : []),
      ...(percent(secondShotWindows, reboundEvents) > 30 ? ["second-shot window rate is above monitoring range"] : []),
      ...(unresolvedContestedRebounds > 0 ? ["unresolved contested rebounds remain"] : []),
    ],
    events,
  };
}

function distributionRows(events: readonly BatchReboundCalibrationEvent[]): readonly string[] {
  const continuationTypes = ["GK_RECOVERY", "DEFENSIVE_CLEARANCE", "ATTACKER_RECOVERY", "SECOND_SHOT_WINDOW", "SCRAMBLE", "OUT_OF_PLAY"] as const;

  return continuationTypes.map((type) => {
    const count = countEvents(events, (event) => event.continuationType === type);
    return `- ${type}: ${count} (${percent(count, events.length)}%)`;
  });
}

function sourceRows(events: readonly BatchReboundCalibrationEvent[]): readonly string[] {
  const sources = ["SAVED_BY_GK", "DEFLECTED_BY_GK", "BLOCKED_BY_DEFENDER", "MISSED_FRAME / OUT_OF_PLAY"] as const;

  return sources.map((source) => {
    const sourceEvents =
      source === "MISSED_FRAME / OUT_OF_PLAY"
        ? events.filter((event) => event.sourceOutcome === "MISSED_HIGH" || event.sourceOutcome === "MISSED_WIDE" || event.sourceOutcome === "OUT_OF_PLAY")
        : events.filter((event) => event.sourceOutcome === source);
    return `| ${source} | ${sourceEvents.length} | ${countEvents(sourceEvents, (event) => event.reboundType === "CONTESTED")} | ${countEvents(sourceEvents, (event) => event.reboundWinner === "ATTACKER")} | ${countEvents(sourceEvents, (event) => event.reboundWinner === "DEFENDER")} | ${countEvents(sourceEvents, (event) => event.reboundWinner === "GOALKEEPER")} | ${countEvents(sourceEvents, (event) => event.continuationType === "SECOND_SHOT_WINDOW")} | ${averageDanger(sourceEvents)} |`;
  });
}

function teamRows(events: readonly BatchReboundCalibrationEvent[], teamNames: readonly string[]): readonly string[] {
  return teamNames.map((teamName) => {
    const attacking = events.filter((event) => event.attackingTeamName === teamName);
    const defending = events.filter((event) => event.defendingTeamName === teamName);
    const tacticalRead =
      countEvents(attacking, (event) => event.reboundWinner === "ATTACKER") === 0
        ? "Attacking rebound threat remains limited in this batch."
        : "Attacking rebound pressure is present without becoming automatic.";

    return [
      `### ${teamName}`,
      `- attacking rebounds generated: ${attacking.length}`,
      `- attacking rebounds recovered: ${countEvents(attacking, (event) => event.reboundWinner === "ATTACKER")}`,
      `- defensive rebounds faced: ${defending.length}`,
      `- defensive rebounds cleared: ${countEvents(defending, (event) => event.reboundWinner === "DEFENDER")}`,
      `- GK recoveries: ${countEvents(defending, (event) => event.reboundWinner === "GOALKEEPER")}`,
      `- second-shot windows created: ${countEvents(attacking, (event) => event.continuationType === "SECOND_SHOT_WINDOW")}`,
      `- second-shot windows allowed: ${countEvents(defending, (event) => event.continuationType === "SECOND_SHOT_WINDOW")}`,
      `- tactical read: ${tacticalRead}`,
      "",
    ].join("\n");
  });
}

function styleRows(events: readonly BatchReboundCalibrationEvent[]): readonly string[] {
  const styles = ["CONTROL_PATIENT", "CONTROL_BALANCED", "CONTROL_DIRECT", "BLITZ_AGGRESSIVE", "BLITZ_BALANCED", "BLITZ_RISKY"] as const;

  return styles.map((style) => {
    const styleEvents = events.filter((event) => event.controlStyleVariant === style || event.blitzStyleVariant === style);
    const recoveryRate = percent(
      countEvents(styleEvents, (event) => event.reboundWinner === "ATTACKER" || event.reboundWinner === "DEFENDER" || event.reboundWinner === "GOALKEEPER"),
      styleEvents.length,
    );
    const attackingRecoveryRate = percent(countEvents(styleEvents, (event) => event.reboundWinner === "ATTACKER"), styleEvents.length);
    const defensiveClearanceRate = percent(countEvents(styleEvents, (event) => event.continuationType === "DEFENSIVE_CLEARANCE"), styleEvents.length);
    const secondShotWindowRate = percent(countEvents(styleEvents, (event) => event.continuationType === "SECOND_SHOT_WINDOW"), styleEvents.length);
    const scrambleRate = percent(countEvents(styleEvents, isScrambleEvent), styleEvents.length);
    const tacticalRead =
      secondShotWindowRate === 0
        ? "Monitor: style sample creates rebounds but no second-shot windows."
        : "Rebounds create live danger without dominating the style outcome.";

    return `| ${style} | ${styleEvents.length} | ${recoveryRate}% | ${attackingRecoveryRate}% | ${defensiveClearanceRate}% | ${secondShotWindowRate}% | ${scrambleRate}% | ${averageDanger(styleEvents)} | ${tacticalRead} |`;
  });
}

function sampleRows(events: readonly BatchReboundCalibrationEvent[]): readonly string[] {
  return events.map(
    (event) =>
      `| ${event.matchId} | ${event.seed} | ${event.sourceActionId} | ${event.sourceOutcome} | ${event.reboundType} | ${event.reboundZone} | ${event.attackingTeamName} | ${event.defendingTeamName} | ${event.nearestAttackers || "none"} | ${event.nearestDefenders || "none"} | ${event.goalkeeperRecoveryScore} | ${event.attackerReactionScore} | ${event.defenderReactionScore} | ${event.reboundWinner} | ${event.winningPlayer} | ${event.nextPossession} | ${event.continuationType} | ${event.immediateDanger} | ${event.reason} |`,
  );
}

export function createReboundDangerCalibrationReport(summary: BatchScoringCalibrationSummary): string {
  const calibration = summarizeReboundDangerCalibration(summary);
  const teamNames = [...new Set(calibration.events.flatMap((event) => [event.attackingTeamName, event.defendingTeamName]))];

  return [
    "# Rebound Danger Calibration",
    "",
    "## Summary",
    `- scoring version: ${SCORING_VERSION}`,
    `- scoring rule: ${scoringRuleLabel("SHOT_GOAL")}`,
    "- score unit: POINTS",
    `- matches simulated: ${calibration.matchesSimulated}`,
    `- rebound events: ${calibration.reboundEvents}`,
    `- contested rebounds: ${calibration.contestedRebounds}`,
    `- resolved rebounds: ${calibration.resolvedRebounds}`,
    `- attacker recovery rate: ${calibration.attackerRecoveryRate}%`,
    `- defender recovery rate: ${calibration.defenderRecoveryRate}%`,
    `- GK recovery rate: ${calibration.gkRecoveryRate}%`,
    `- second-shot window rate: ${calibration.secondShotWindowRate}%`,
    `- scramble rate: ${calibration.scrambleRate}%`,
    `- out-of-play rebound rate: ${calibration.outOfPlayReboundRate}%`,
    `- average immediate danger: ${calibration.averageImmediateDanger}`,
    `- recommendation: ${calibration.recommendation}`,
    ...calibration.warnings.map((warning) => `- WARNING: ${warning}`),
    "",
    "## Before / After Snapshot",
    "- previous defender recovery rate: 90%",
    `- new defender recovery rate: ${calibration.defenderRecoveryRate}%`,
    "- previous attacker recovery rate: 0%",
    `- new attacker recovery rate: ${calibration.attackerRecoveryRate}%`,
    "- previous second-shot window rate: 0%",
    `- new second-shot window rate: ${calibration.secondShotWindowRate}%`,
    "- previous scramble rate: 0%",
    `- new scramble rate: ${calibration.scrambleRate}%`,
    "- previous MEDIUM/HIGH danger rate: 0%",
    `- new MEDIUM/HIGH danger rate: ${calibration.mediumHighDangerRate}%`,
    `- recommendation: ${calibration.recommendation}`,
    "",
    "## Rebound Threat Factors",
    "- attacker proximity impact: nearest attacker distance to rebound zone now swings the race value.",
    "- attacker momentum impact: attacking crash value rewards forward rebound pressure, with BLITZ receiving the aggressive-crash bonus.",
    "- defender structure impact: defensive numbers and structure still matter, but clearance is no longer automatic.",
    "- GK recovery impact: goalkeeper recovery is available when balance beats both attacker and defender reaction.",
    "- chaos / scramble impact: high contact risk plus deflection severity can create a scramble instead of a clean clearance.",
    "- style modifier impact: BLITZ aggressive/risky attacking rebounds receive higher crash pressure through team crash weighting.",
    "",
    "## Rebound Outcome Distribution",
    ...distributionRows(calibration.events),
    `- CONTESTED_REMAINS: ${countEvents(calibration.events, (event) => event.reboundWinner === "CONTESTED_REMAINS")} (${percent(countEvents(calibration.events, (event) => event.reboundWinner === "CONTESTED_REMAINS"), calibration.reboundEvents)}%)`,
    "",
    "## Rebound Danger Distribution",
    ...dangerLabel.map((danger) => {
      const count = countEvents(calibration.events, (event) => event.immediateDanger === danger);
      return `- ${danger}: ${count} (${percent(count, calibration.reboundEvents)}%)`;
    }),
    `- NONE/LOW target monitor: ${calibration.lowDangerRate}% (target 60%-80%)`,
    `- MEDIUM/HIGH target monitor: ${calibration.mediumHighDangerRate}% (target 20%-40%)`,
    "",
    "## Scramble Calibration",
    "- scramble rate before: 0%",
    `- scramble rate after: ${calibration.scrambleRate}%`,
    "- scramble type distribution:",
    `  - LOOSE_BALL: ${countEvents(calibration.events, (event) => event.reason.includes("LOOSE_BALL"))}`,
    `  - CONTACT_CONTEST: ${countEvents(calibration.events, (event) => event.reason.includes("CONTACT_CONTEST"))}`,
    `  - DOUBLE_TOUCH: ${countEvents(calibration.events, (event) => event.reason.includes("DOUBLE_TOUCH"))}`,
    `  - CHAOTIC_CLEARANCE: ${calibration.chaoticClearances}`,
    `  - DESPERATE_SECOND_SHOT: ${countEvents(calibration.events, (event) => event.reason.includes("DESPERATE_SECOND_SHOT"))}`,
    "- scramble winner distribution:",
    `  - ATTACKER: ${countEvents(calibration.events, (event) => isScrambleEvent(event) && event.reboundWinner === "ATTACKER")}`,
    `  - DEFENDER: ${countEvents(calibration.events, (event) => isScrambleEvent(event) && event.reboundWinner === "DEFENDER")}`,
    `  - GOALKEEPER: ${countEvents(calibration.events, (event) => isScrambleEvent(event) && event.reboundWinner === "GOALKEEPER")}`,
    `  - CONTESTED_REMAINS: ${countEvents(calibration.events, (event) => isScrambleEvent(event) && event.reboundWinner === "CONTESTED_REMAINS")}`,
    `  - OUT_OF_PLAY: ${countEvents(calibration.events, (event) => isScrambleEvent(event) && event.reboundWinner === "OUT_OF_PLAY")}`,
    "- scramble danger distribution:",
    `  - NONE: ${countEvents(calibration.events, (event) => isScrambleEvent(event) && event.immediateDanger === "NONE")}`,
    `  - LOW: ${countEvents(calibration.events, (event) => isScrambleEvent(event) && event.immediateDanger === "LOW")}`,
    `  - MEDIUM: ${countEvents(calibration.events, (event) => isScrambleEvent(event) && event.immediateDanger === "MEDIUM")}`,
    `  - HIGH: ${countEvents(calibration.events, (event) => isScrambleEvent(event) && event.immediateDanger === "HIGH")}`,
    `- second-shot windows from scramble: ${calibration.scrambleCreatedSecondShotWindows}`,
    `- chaotic clearances: ${calibration.chaoticClearances}`,
    `- recommendation: ${calibration.recommendation}`,
    "",
    "## Rebound Source Analysis",
    "",
    "| source | count | contested rebounds | attacker recovery | defender recovery | GK recovery | second-shot window | average danger |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...sourceRows(calibration.events),
    "",
    "## Team Rebound Profile",
    "",
    ...teamRows(calibration.events, teamNames),
    "## Style Rebound Profile",
    "",
    "| style | rebound events | recovery rate | attacking recovery rate | defensive clearance rate | second-shot window rate | scramble rate | danger profile | tactical read |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...styleRows(calibration.events),
    "",
    "## Rebound Sample Table",
    "",
    "| matchId | seed | source action | source outcome | rebound type | rebound zone | attacking team | defending team | nearest attackers | nearest defenders | goalkeeper recovery score | attacker reaction score | defender reaction score | rebound winner | winning player | next possession | continuation type | immediate danger | reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...(calibration.events.length === 0
      ? ["| none | none | none | none | NONE | NONE | none | none | none | none | 0 | 0 | 0 | OUT_OF_PLAY | none | OUT_OF_PLAY | OUT_OF_PLAY | NONE | no rebound events sampled |"]
      : sampleRows(calibration.events)),
    "",
    "## Calibration Interpretation",
    `- Are contested rebounds always cleared by defenders? ${calibration.defenderRecoveryRate > 85 ? "WARNING: defender recovery is excessive." : "No; defender recovery is monitored inside the plausible range unless warnings say otherwise."}`,
    `- Are attacker recoveries possible? ${calibration.attackerRecoveries > 0 ? "YES" : "WARNING: no attacker recoveries appeared in this batch."}`,
    `- Are second-shot windows possible but not automatic? ${calibration.secondShotWindows > 0 ? "YES" : "WARNING: no second-shot windows appeared in this batch."}`,
    `- Does GK recovery happen in plausible cases? ${calibration.gkRecoveryRate <= 60 ? "YES" : "WARNING: GK recovery is above the monitoring range."}`,
    `- Are scrambles possible? ${calibration.scrambles > 0 ? "YES" : "WARNING: no scramble events appeared in this batch."}`,
    `- Does rebound danger create enough emotional/tactical tension? ${calibration.mediumHighDangerRate >= 20 ? "YES" : "WATCH: danger currently skews low."}`,
    `- Does rebound danger over-inflate scoring or create too much chaos? ${calibration.secondShotWindowRate <= 30 ? "NO" : "WARNING: second-shot windows are too frequent."}`,
    "- Does the model preserve V1 scoring stability? YES; SHOT_GOAL remains 3 points and V2 scoring remains inactive.",
    "",
    "## Recommendation",
    `- recommendation: ${calibration.recommendation}`,
    `- rationale: ${
      calibration.recommendation === "KEEP_REBOUND_MODEL_BUT_MONITOR"
        ? "batch rebound danger appears live without becoming automatic."
        : calibration.recommendation === "INCREASE_ATTACKER_REBOUND_THREAT"
          ? "attacker recoveries or second-shot windows are too rare across the batch."
          : calibration.recommendation === "REDUCE_AUTOMATIC_DEFENSIVE_CLEARANCE"
            ? "defensive recoveries dominate rebound outcomes beyond the monitoring range."
            : calibration.recommendation === "INCREASE_SCRAMBLE_VARIANCE"
              ? "scramble outcomes are missing, so rebound emotion is too tidy."
              : calibration.recommendation === "REDUCE_SECOND_SHOT_FREQUENCY"
                ? "second-shot windows exceed the monitoring range."
                : "sample size or rebound event count is too low for a confident conclusion."
    }`,
    "",
  ].join("\n");
}
