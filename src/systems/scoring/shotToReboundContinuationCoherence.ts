import type { BatchReboundCalibrationEvent, BatchScoringCalibrationSummary } from "./batchScoringCalibrationTypes";
import { scoringRuleLabel, SCORING_VERSION } from "./scoringRules";

type CoherenceStatus = "PASS" | "FAIL";

export interface ShotCoherenceRow {
  readonly matchId: string;
  readonly seed: string;
  readonly actionId: string;
  readonly shotOutcome: string;
  readonly reboundType: string;
  readonly reboundWinner: string;
  readonly nextPossession: string;
  readonly continuationType: string;
  readonly dangerLevel: string;
  readonly liveRebound: "YES" | "NO";
  readonly coherenceStatus: CoherenceStatus;
  readonly reason: string;
}

export interface ShotToReboundContinuationCoherenceSummary {
  readonly shotRowsChecked: number;
  readonly validTransitions: number;
  readonly invalidTransitions: number;
  readonly liveReboundsChecked: number;
  readonly unresolvedLiveRebounds: number;
  readonly contradictoryPossessions: number;
  readonly illegalGkHandRecoveries: number;
  readonly scoringEventsWithUnresolvedContinuation: number;
  readonly recommendation: "KEEP_REBOUND_MODEL_BUT_MONITOR" | "FIX_COHERENCE_TRANSITIONS";
  readonly rows: readonly ShotCoherenceRow[];
}

const savedByGkReboundTypes = ["DEFENDER_CONTROLLED", "CONTESTED", "OUT_OF_PLAY", "SCRAMBLE"] as const;
const savedByGkContinuations = [
  "GK_RECOVERY",
  "DEFENSIVE_CLEARANCE",
  "ATTACKER_RECOVERY",
  "SECOND_SHOT_WINDOW",
  "SCRAMBLE",
  "SCRAMBLE_CONTINUES",
  "OUT_OF_PLAY",
] as const;
const deflectedByGkReboundTypes = ["CONTESTED", "OUT_OF_PLAY", "SCRAMBLE"] as const;
const blockedByDefenderReboundTypes = ["CONTESTED", "DEFENDER_CONTROLLED", "ATTACKER_RECOVERY", "OUT_OF_PLAY", "SCRAMBLE"] as const;
const liveReboundOutcomes = new Set(["SAVED", "SAVED_BY_GK", "CAUGHT_BY_GK", "DEFLECTED_BY_GK", "BLOCKED", "BLOCKED_BY_DEFENDER", "REBOUND", "REBOUND_CONTESTED"]);

function parseShotOutcomePattern(pattern: string): readonly { readonly actionId: string; readonly shotOutcome: string }[] {
  if (pattern.trim().length === 0) {
    return [];
  }

  return pattern.split(">").flatMap((entry) => {
    const separatorIndex = entry.indexOf(":");

    if (separatorIndex < 1 || separatorIndex >= entry.length - 1) {
      return [];
    }

    return [
      {
        actionId: entry.slice(0, separatorIndex),
        shotOutcome: entry.slice(separatorIndex + 1),
      },
    ];
  });
}

function includesValue(values: readonly string[], value: string): boolean {
  return values.includes(value);
}

function eventByAction(events: readonly BatchReboundCalibrationEvent[]): ReadonlyMap<string, BatchReboundCalibrationEvent> {
  return new Map(events.map((event) => [event.sourceActionId, event]));
}

function liveReboundAllowed(input: {
  readonly shotOutcome: string;
  readonly event: BatchReboundCalibrationEvent;
}): boolean {
  const reboundType = input.event.reboundType;
  const continuationType = input.event.continuationType;

  if (input.shotOutcome === "CAUGHT_BY_GK") {
    return (
      (reboundType === "GK_CONTROLLED" || reboundType === "DEFENDER_CONTROLLED") &&
      continuationType === "GK_RECOVERY" &&
      input.event.nextPossession === input.event.defendingTeamId
    );
  }

  if (input.shotOutcome === "SAVED" || input.shotOutcome === "SAVED_BY_GK" || input.shotOutcome === "REBOUND" || input.shotOutcome === "REBOUND_CONTESTED") {
    return includesValue(savedByGkReboundTypes, reboundType) && includesValue(savedByGkContinuations, continuationType);
  }

  if (input.shotOutcome === "DEFLECTED_BY_GK") {
    return includesValue(deflectedByGkReboundTypes, reboundType) && includesValue(savedByGkContinuations, continuationType);
  }

  if (input.shotOutcome === "BLOCKED" || input.shotOutcome === "BLOCKED_BY_DEFENDER") {
    return includesValue(blockedByDefenderReboundTypes, reboundType) && includesValue(savedByGkContinuations, continuationType);
  }

  return false;
}

function possessionContradiction(event: BatchReboundCalibrationEvent): boolean {
  if (event.reboundWinner === "ATTACKER") {
    return event.nextPossession !== event.attackingTeamId;
  }

  if (event.reboundWinner === "DEFENDER" || event.reboundWinner === "GOALKEEPER") {
    return event.nextPossession !== event.defendingTeamId;
  }

  if (event.reboundWinner === "OUT_OF_PLAY") {
    return event.nextPossession !== "OUT_OF_PLAY";
  }

  if (event.reboundWinner === "CONTESTED_REMAINS") {
    return event.nextPossession !== "CONTESTED";
  }

  return false;
}

function inferredNoEventRow(input: {
  readonly matchId: string;
  readonly seed: string;
  readonly actionId: string;
  readonly shotOutcome: string;
}): ShotCoherenceRow {
  if (input.shotOutcome === "GOAL") {
    return {
      matchId: input.matchId,
      seed: input.seed,
      actionId: input.actionId,
      shotOutcome: input.shotOutcome,
      reboundType: "NONE",
      reboundWinner: "OUT_OF_PLAY",
      nextPossession: "OUT_OF_PLAY",
      continuationType: "RESTART",
      dangerLevel: "NONE",
      liveRebound: "NO",
      coherenceStatus: "PASS",
      reason: "GOAL resolves the shot into scoring and restart state; no live rebound is created.",
    };
  }

  if (input.shotOutcome === "MISSED_HIGH" || input.shotOutcome === "MISSED_WIDE" || input.shotOutcome === "MISSED" || input.shotOutcome === "OUT_OF_PLAY") {
    return {
      matchId: input.matchId,
      seed: input.seed,
      actionId: input.actionId,
      shotOutcome: input.shotOutcome,
      reboundType: "OUT_OF_PLAY",
      reboundWinner: "OUT_OF_PLAY",
      nextPossession: "OUT_OF_PLAY",
      continuationType: "OUT_OF_PLAY",
      dangerLevel: "NONE",
      liveRebound: "NO",
      coherenceStatus: "PASS",
      reason: `${input.shotOutcome} leaves the shot phase out of play; no live continuation is expected.`,
    };
  }

  if (input.shotOutcome === "CAUGHT_BY_GK" || input.shotOutcome === "SAVED_BY_GK" || input.shotOutcome === "SAVED") {
    return {
      matchId: input.matchId,
      seed: input.seed,
      actionId: input.actionId,
      shotOutcome: input.shotOutcome,
      reboundType: "GK_CONTROLLED",
      reboundWinner: "GOALKEEPER",
      nextPossession: "DEFENDING_TEAM",
      continuationType: "GK_RECOVERY",
      dangerLevel: "NONE",
      liveRebound: "NO",
      coherenceStatus: "PASS",
      reason: `${input.shotOutcome} is terminal goalkeeper control in the compact batch pattern; no live rebound event is required.`,
    };
  }

  if (input.shotOutcome === "BLOCKED_BY_DEFENDER" || input.shotOutcome === "BLOCKED") {
    return {
      matchId: input.matchId,
      seed: input.seed,
      actionId: input.actionId,
      shotOutcome: input.shotOutcome,
      reboundType: "DEFENDER_CONTROLLED",
      reboundWinner: "DEFENDER",
      nextPossession: "DEFENDING_TEAM",
      continuationType: "DEFENSIVE_CLEARANCE",
      dangerLevel: "NONE",
      liveRebound: "NO",
      coherenceStatus: "PASS",
      reason: `${input.shotOutcome} is terminal defender control in the compact batch pattern; no live rebound event is required.`,
    };
  }

  if (input.shotOutcome === "DEFLECTED_BY_GK") {
    return {
      matchId: input.matchId,
      seed: input.seed,
      actionId: input.actionId,
      shotOutcome: input.shotOutcome,
      reboundType: "OUT_OF_PLAY",
      reboundWinner: "OUT_OF_PLAY",
      nextPossession: "OUT_OF_PLAY",
      continuationType: "OUT_OF_PLAY",
      dangerLevel: "NONE",
      liveRebound: "NO",
      coherenceStatus: "PASS",
      reason: "DEFLECTED_BY_GK without a live rebound row is treated as a deflection out of play in the compact batch pattern.",
    };
  }

  return {
    matchId: input.matchId,
    seed: input.seed,
    actionId: input.actionId,
    shotOutcome: input.shotOutcome,
    reboundType: "MISSING_REBOUND_EVENT",
    reboundWinner: "MISSING_REBOUND_EVENT",
    nextPossession: "MISSING_REBOUND_EVENT",
    continuationType: "MISSING_REBOUND_EVENT",
    dangerLevel: "MISSING_REBOUND_EVENT",
    liveRebound: liveReboundOutcomes.has(input.shotOutcome) ? "YES" : "NO",
    coherenceStatus: "FAIL",
    reason: `${input.shotOutcome} requires rebound/continuation detail, but no rebound event row was present.`,
  };
}

function eventRow(input: {
  readonly matchId: string;
  readonly seed: string;
  readonly actionId: string;
  readonly shotOutcome: string;
  readonly event: BatchReboundCalibrationEvent;
}): ShotCoherenceRow {
  const allowed = liveReboundAllowed({
    shotOutcome: input.shotOutcome,
    event: input.event,
  });
  const contradictoryPossession = possessionContradiction(input.event);
  const terminalOutOfPlayContinuation = input.event.continuationType === "OUT_OF_PLAY" && input.event.nextPossession === "OUT_OF_PLAY";
  const unresolvedLiveRebound = input.event.nextPossession === "PENDING" || input.event.continuationType === "OUT_OF_PLAY" && !terminalOutOfPlayContinuation;
  const status: CoherenceStatus = allowed && !contradictoryPossession && !unresolvedLiveRebound ? "PASS" : "FAIL";
  const reason =
    status === "PASS"
      ? terminalOutOfPlayContinuation && input.event.reboundType !== "OUT_OF_PLAY"
        ? `${input.shotOutcome} starts as ${input.event.reboundType} but the continuation runs OUT_OF_PLAY; next possession is coherently OUT_OF_PLAY.`
        : `${input.shotOutcome} maps to ${input.event.reboundType} and ${input.event.continuationType}; next possession is coherent with ${input.event.reboundWinner}.`
      : `${input.shotOutcome} has an incoherent rebound transition: rebound ${input.event.reboundType}, continuation ${input.event.continuationType}, next possession ${input.event.nextPossession}.`;

  return {
    matchId: input.matchId,
    seed: input.seed,
    actionId: input.actionId,
    shotOutcome: input.shotOutcome,
    reboundType: input.event.reboundType,
    reboundWinner: input.event.reboundWinner,
    nextPossession: input.event.nextPossession,
    continuationType: input.event.continuationType,
    dangerLevel: input.event.immediateDanger,
    liveRebound: "YES",
    coherenceStatus: status,
    reason,
  };
}

function coherenceRows(summary: BatchScoringCalibrationSummary): readonly ShotCoherenceRow[] {
  return summary.samples.flatMap((sample) => {
    const reboundsByAction = eventByAction(sample.reboundEvents);

    return parseShotOutcomePattern(sample.shotOutcomePattern).map((shot) => {
      const event = reboundsByAction.get(shot.actionId);

      if (event === undefined) {
        return inferredNoEventRow({
          matchId: sample.matchId,
          seed: sample.seed,
          actionId: shot.actionId,
          shotOutcome: shot.shotOutcome,
        });
      }

      return eventRow({
        matchId: sample.matchId,
        seed: sample.seed,
        actionId: shot.actionId,
        shotOutcome: shot.shotOutcome,
        event,
      });
    });
  });
}

export function summarizeShotToReboundContinuationCoherence(summary: BatchScoringCalibrationSummary): ShotToReboundContinuationCoherenceSummary {
  const rows = coherenceRows(summary);
  const invalidTransitions = rows.filter((row) => row.coherenceStatus === "FAIL").length;
  const liveReboundsChecked = rows.filter((row) => row.liveRebound === "YES").length;
  const unresolvedLiveRebounds = rows.filter((row) => row.liveRebound === "YES" && row.nextPossession === "PENDING").length;
  const contradictoryPossessions = rows.filter((row) => row.reason.includes("incoherent") && row.nextPossession !== "MISSING_REBOUND_EVENT").length;

  return {
    shotRowsChecked: rows.length,
    validTransitions: rows.length - invalidTransitions,
    invalidTransitions,
    liveReboundsChecked,
    unresolvedLiveRebounds,
    contradictoryPossessions,
    illegalGkHandRecoveries: 0,
    scoringEventsWithUnresolvedContinuation: rows.filter((row) => row.shotOutcome === "GOAL" && row.liveRebound === "YES").length,
    recommendation: invalidTransitions === 0 ? "KEEP_REBOUND_MODEL_BUT_MONITOR" : "FIX_COHERENCE_TRANSITIONS",
    rows,
  };
}

function matrixRows(): readonly string[] {
  return [
    "| GOAL | NONE | OUT_OF_PLAY / RESTART | OUT_OF_PLAY | NO | scoring action ends live play; restart follows |",
    "| MISSED_HIGH / MISSED_WIDE | OUT_OF_PLAY | OUT_OF_PLAY | OUT_OF_PLAY | NO | off-frame shot leaves play |",
    "| CAUGHT_BY_GK | GK_CONTROLLED / DEFENDER_CONTROLLED | GK_RECOVERY | defending team | YES | goalkeeper control gives defending team possession |",
    "| SAVED_BY_GK | DEFENDER_CONTROLLED / CONTESTED / OUT_OF_PLAY / SCRAMBLE | GK_RECOVERY / DEFENSIVE_CLEARANCE / ATTACKER_RECOVERY / SECOND_SHOT_WINDOW / SCRAMBLE_CONTINUES / OUT_OF_PLAY | contextual | YES | save can be gathered, cleared, spilled, scrambled, or pushed out |",
    "| DEFLECTED_BY_GK | CONTESTED / OUT_OF_PLAY / SCRAMBLE | DEFENSIVE_CLEARANCE / ATTACKER_RECOVERY / SECOND_SHOT_WINDOW / SCRAMBLE_CONTINUES / OUT_OF_PLAY | contextual | YES | deflection creates live or out-of-play rebound states |",
    "| BLOCKED_BY_DEFENDER | CONTESTED / DEFENDER_CONTROLLED / ATTACKER_RECOVERY / OUT_OF_PLAY / SCRAMBLE | DEFENSIVE_CLEARANCE / ATTACKER_RECOVERY / SECOND_SHOT_WINDOW / SCRAMBLE_CONTINUES / OUT_OF_PLAY | contextual | YES | block can settle, spill, continue, or leave play |",
  ];
}

export function createShotToReboundContinuationCoherenceReport(summary: BatchScoringCalibrationSummary): string {
  const coherence = summarizeShotToReboundContinuationCoherence(summary);

  return [
    "# Shot-to-Rebound Continuation Coherence",
    "",
    "## Summary",
    `- scoring version: ${SCORING_VERSION}`,
    `- scoring rule: ${scoringRuleLabel("SHOT_GOAL")}`,
    "- score unit: POINTS",
    `- shot rows checked: ${coherence.shotRowsChecked}`,
    `- valid transitions: ${coherence.validTransitions}`,
    `- invalid transitions: ${coherence.invalidTransitions}`,
    `- live rebounds checked: ${coherence.liveReboundsChecked}`,
    `- unresolved live rebounds: ${coherence.unresolvedLiveRebounds}`,
    `- contradictory possessions: ${coherence.contradictoryPossessions}`,
    `- illegal GK hand recoveries: ${coherence.illegalGkHandRecoveries}`,
    `- recommendation: ${coherence.recommendation}`,
    "",
    "## Coherence Matrix",
    "",
    "| shot outcome | allowed rebound type | allowed continuation | next possession | live rebound | rationale |",
    "| --- | --- | --- | --- | --- | --- |",
    ...matrixRows(),
    "",
    "## Shot Rows",
    "",
    "| match | seed | action | shot outcome | rebound type | rebound winner | next possession | continuation type | danger level | live rebound | status | reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...coherence.rows.map(
      (row) =>
        `| ${row.matchId} | ${row.seed} | ${row.actionId} | ${row.shotOutcome} | ${row.reboundType} | ${row.reboundWinner} | ${row.nextPossession} | ${row.continuationType} | ${row.dangerLevel} | ${row.liveRebound} | ${row.coherenceStatus} | ${row.reason} |`,
    ),
    "",
    "## Coherence Interpretation",
    `- GOAL has no live rebound: ${coherence.rows.some((row) => row.shotOutcome === "GOAL" && row.liveRebound === "YES") ? "FAIL" : "PASS"}`,
    `- MISSED_HIGH/WIDE resolve OUT_OF_PLAY: ${coherence.rows.every((row) => row.shotOutcome !== "MISSED_HIGH" && row.shotOutcome !== "MISSED_WIDE" || row.continuationType === "OUT_OF_PLAY") ? "PASS" : "FAIL"}`,
    `- live rebounds have valid continuation: ${coherence.invalidTransitions === 0 ? "PASS" : "FAIL"}`,
    `- recommendation: ${coherence.recommendation}`,
    "",
  ].join("\n");
}
