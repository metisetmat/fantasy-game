import type {
  BonusFlag,
  LeaguePointsSummary,
  LeagueTableIntegrationSummary,
  LeagueTableRow,
  LeagueTableRowType,
  LeagueResult,
  MatchBonusBatchSummary,
  MatchBonusCategory,
  MatchBonusEvent,
  MatchBonusInputTeamRow,
  MatchBonusSourceScoringAction,
  MatchBonusType,
  PlayerFatigueTimelineRow,
  TeamFatigueTimelineRow,
} from "./matchBonusTypes";
import { CONTROL_ROSTER } from "../../data/teams/controlRoster";
import { BLITZ_ROSTER } from "../../data/teams/blitzRoster";
import { PlayerRole } from "../../models/player";
import type { TeamId } from "../../core/ids";
import type { VisiblePlayerAttributes } from "../players/visibleAttributes";
import type { DerivedPlayerAttributes } from "../players/derived";

const MATCH_BONUS_RULE_VERSION = "MATCH_BONUS_V1" as const;
const MATCH_BONUS_CAP = 2;

function yesNo(value: boolean): BonusFlag {
  return value ? "YES" : "NO";
}

function activeActions(actions: readonly MatchBonusSourceScoringAction[]): readonly MatchBonusSourceScoringAction[] {
  return actions.filter((action) => action.active);
}

function resultFor(input: MatchBonusInputTeamRow): LeagueResult {
  if (input.forfeitApplied === true || input.noTeamSet === true) {
    return "FORFEIT";
  }

  if (input.matchScoreFor > input.matchScoreAgainst) {
    return "WIN";
  }

  if (input.matchScoreFor < input.matchScoreAgainst) {
    return "LOSS";
  }

  return "DRAW";
}

function baseLeaguePoints(result: LeagueResult): number {
  switch (result) {
    case "WIN":
      return 4;
    case "DRAW":
      return 2;
    case "LOSS":
      return 0;
    case "FORFEIT":
      return -1;
  }
}

function sourceIds(actions: readonly MatchBonusSourceScoringAction[], scoringAction: MatchBonusSourceScoringAction["scoringAction"]): readonly string[] {
  return activeActions(actions)
    .filter((action) => action.scoringAction === scoringAction)
    .map((action) => action.id);
}

function scoringFamilies(actions: readonly MatchBonusSourceScoringAction[]): readonly string[] {
  const familySet = new Set<string>();

  activeActions(actions).forEach((action) => {
    if (action.scoringAction === "SHOT_GOAL" || action.scoringAction === "TRY_TOUCHDOWN" || action.scoringAction === "DROP_GOAL") {
      familySet.add(action.scoringAction);
    }
  });

  return [...familySet].sort();
}

function buildRawEvent(input: {
  readonly row: MatchBonusInputTeamRow;
  readonly bonusType: MatchBonusType;
  readonly bonusCategory: MatchBonusCategory;
  readonly triggerReason: string;
  readonly sourceScoringEvents: readonly string[];
}): MatchBonusEvent {
  return {
    matchId: input.row.matchId,
    teamId: input.row.teamId,
    bonusType: input.bonusType,
    bonusCategory: input.bonusCategory,
    leaguePoints: 1,
    ruleVersion: MATCH_BONUS_RULE_VERSION,
    triggerReason: input.triggerReason,
    sourceScoringEvents: input.sourceScoringEvents,
    computedAfterFinalWhistle: "YES",
    cappedByBonusLimit: "NO",
    active: "YES",
  };
}

function capEvents(events: readonly MatchBonusEvent[]): readonly MatchBonusEvent[] {
  return events.map((event, index) =>
    index < MATCH_BONUS_CAP
      ? event
      : {
          ...event,
          leaguePoints: 0,
          cappedByBonusLimit: "YES",
          active: "NO",
          triggerReason: `${event.triggerReason} Triggered but not awarded because the V1 team-match bonus cap is +${MATCH_BONUS_CAP}.`,
        },
  );
}

export function resolveLeaguePointsSummary(row: MatchBonusInputTeamRow): LeaguePointsSummary {
  const result = resultFor(row);
  const base = baseLeaguePoints(result);
  const forfeited = result === "FORFEIT";
  const activeFor = activeActions(row.sourceScoringActionsFor);
  const activeAgainst = activeActions(row.sourceScoringActionsAgainst);
  const tryIds = sourceIds(row.sourceScoringActionsFor, "TRY_TOUCHDOWN");
  const shotIds = sourceIds(row.sourceScoringActionsFor, "SHOT_GOAL");
  const dropIds = sourceIds(row.sourceScoringActionsFor, "DROP_GOAL");
  const concededShotIds = sourceIds(row.sourceScoringActionsAgainst, "SHOT_GOAL");
  const concededTryIds = sourceIds(row.sourceScoringActionsAgainst, "TRY_TOUCHDOWN");
  const families = scoringFamilies(row.sourceScoringActionsFor);
  const closeLossMargin = result === "LOSS" ? row.matchScoreAgainst - row.matchScoreFor : 0;
  const rawEvents: MatchBonusEvent[] = [];

  if (!forfeited && tryIds.length >= 3) {
    rawEvents.push(
      buildRawEvent({
        row,
        bonusType: "OFFENSIVE_3_PLUS_TRIES",
        bonusCategory: "OFFENSIVE",
        sourceScoringEvents: tryIds,
        triggerReason: `${row.teamId} scored ${tryIds.length} TRY_TOUCHDOWN events after final scoring was settled.`,
      }),
    );
  }

  if (!forfeited && shotIds.length > 0 && tryIds.length > 0 && dropIds.length > 0) {
    rawEvents.push(
      buildRawEvent({
        row,
        bonusType: "OFFENSIVE_3_MAIN_SCORING_FAMILIES",
        bonusCategory: "OFFENSIVE",
        sourceScoringEvents: [...shotIds, ...tryIds, ...dropIds],
        triggerReason:
          `${row.teamId} scored through all three main scoring families: SHOT_GOAL, TRY_TOUCHDOWN, and DROP_GOAL. CONVERSION_GOAL is excluded from this family bonus.`,
      }),
    );
  }

  if (!forfeited && closeLossMargin > 0 && closeLossMargin <= 7) {
    rawEvents.push(
      buildRawEvent({
        row,
        bonusType: "DEFENSIVE_CLOSE_LOSS_WITHIN_7",
        bonusCategory: "DEFENSIVE",
        sourceScoringEvents: activeFor.map((action) => action.id),
        triggerReason: `${row.teamId} lost by ${closeLossMargin} match points, inside the V1 close-loss threshold of 7.`,
      }),
    );
  }

  if (!forfeited && concededShotIds.length === 0 && concededTryIds.length === 0) {
    rawEvents.push(
      buildRawEvent({
        row,
        bonusType: "DEFENSIVE_MAJOR_THREAT_SHUTDOWN",
        bonusCategory: "DEFENSIVE",
        sourceScoringEvents: activeAgainst.map((action) => action.id),
        triggerReason: `${row.teamId} conceded zero SHOT_GOAL and zero TRY_TOUCHDOWN events; DROP_GOAL concession remains allowed.`,
      }),
    );
  }

  const bonusEvents = forfeited ? [] : capEvents(rawEvents);
  const rawBonusPoints = rawEvents.length;
  const cappedBonusPoints = bonusEvents.reduce((sum, event) => sum + event.leaguePoints, 0);

  return {
    matchId: row.matchId,
    teamId: row.teamId,
    opponentTeamId: row.opponentTeamId,
    style: row.style,
    opponentStyle: row.opponentStyle,
    result,
    matchScoreFor: row.matchScoreFor,
    matchScoreAgainst: row.matchScoreAgainst,
    baseLeaguePoints: base,
    rawBonusPoints: forfeited ? 0 : rawBonusPoints,
    cappedBonusPoints,
    totalLeaguePoints: base + cappedBonusPoints,
    bonusEvents,
    forfeitApplied: yesNo(row.forfeitApplied === true || forfeited),
    noTeamSet: yesNo(row.noTeamSet === true),
    computedFromFinalScore: "YES",
    scoringFamiliesAchieved: families,
    triesScored: tryIds.length,
    concededShotGoals: concededShotIds.length,
    concededTryTouchdowns: concededTryIds.length,
    closeLossMargin,
    capApplied: yesNo(bonusEvents.some((event) => event.cappedByBonusLimit === "YES")),
  };
}

export function summarizeMatchBonusBatch(rows: readonly MatchBonusInputTeamRow[]): MatchBonusBatchSummary {
  const summaries = rows.map((row) => resolveLeaguePointsSummary(row));
  const events = summaries.flatMap((summary) => summary.bonusEvents);
  const activeEvents = events.filter((event) => event.active === "YES");
  const pairRows = summaries.filter((summary) => summary.result === "LOSS");
  const losingTeamEarnsMoreLeaguePointsThanWinnerCount = pairRows.filter((summary) => {
    const opponent = summaries.find((candidate) => candidate.matchId === summary.matchId && candidate.teamId === summary.opponentTeamId);
    return opponent !== undefined && summary.totalLeaguePoints > opponent.totalLeaguePoints;
  }).length;

  return {
    ruleVersion: MATCH_BONUS_RULE_VERSION,
    bonusCap: MATCH_BONUS_CAP,
    teamRowsChecked: summaries.length,
    totalMatchBonusEvents: events.length,
    activeMatchBonusEvents: activeEvents.length,
    offensiveEventCount: events.filter((event) => event.bonusCategory === "OFFENSIVE").length,
    defensiveEventCount: events.filter((event) => event.bonusCategory === "DEFENSIVE").length,
    averageBonusPoints: Math.round((summaries.reduce((sum, row) => sum + row.cappedBonusPoints, 0) / Math.max(1, summaries.length)) * 100) / 100,
    averageLeaguePoints: Math.round((summaries.reduce((sum, row) => sum + row.totalLeaguePoints, 0) / Math.max(1, summaries.length)) * 100) / 100,
    maxRawBonusPoints: Math.max(0, ...summaries.map((summary) => summary.rawBonusPoints)),
    maxCappedBonusPoints: Math.max(0, ...summaries.map((summary) => summary.cappedBonusPoints)),
    capActivationCount: summaries.filter((summary) => summary.capApplied === "YES").length,
    offensiveAndDefensiveSameMatchCount: summaries.filter(
      (summary) =>
        summary.bonusEvents.some((event) => event.bonusCategory === "OFFENSIVE") &&
        summary.bonusEvents.some((event) => event.bonusCategory === "DEFENSIVE"),
    ).length,
    losingTeamsEarningBonusCount: summaries.filter((summary) => summary.result === "LOSS" && summary.cappedBonusPoints > 0).length,
    losingTeamEarnsMoreLeaguePointsThanWinnerCount,
    forfeitRowsTested: summaries.filter((summary) => summary.forfeitApplied === "YES").length,
    noTeamSetRowsTested: summaries.filter((summary) => summary.noTeamSet === "YES").length,
    scorelineMismatchCount: 0,
    staleMetricDetectionCount: 0,
    conversionExcludedFromFamilyBonus: "YES",
    summaries,
    events,
  };
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100) / 100;
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function clampFatigue(value: number): number {
  return Math.max(0, Math.min(100, round1(value)));
}

function median(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const midpoint = Math.floor(sorted.length / 2);
  const left = sorted[midpoint - 1] ?? 0;
  const right = sorted[midpoint] ?? 0;
  return sorted.length % 2 === 0 ? round1((left + right) / 2) : right;
}

function matchThird(possessionIndex: number, totalPossessions: number): "FINAL_THIRD" | "FIRST_THIRD" | "SECOND_THIRD" {
  const firstCut = Math.ceil(totalPossessions / 3);
  const secondCut = Math.ceil((totalPossessions * 2) / 3);

  if (possessionIndex <= firstCut) {
    return "FIRST_THIRD";
  }

  if (possessionIndex <= secondCut) {
    return "SECOND_THIRD";
  }

  return "FINAL_THIRD";
}

function styleLoadModifier(style: string): number {
  if (style.includes("RISKY")) {
    return 1.22;
  }

  if (style.includes("DIRECT") || style.includes("AGGRESSIVE")) {
    return 1.14;
  }

  if (style.includes("PATIENT")) {
    return 0.92;
  }

  return 1;
}

function styleStartFatigue(style: string): number {
  if (style.includes("RISKY")) {
    return 13;
  }

  if (style.includes("DIRECT") || style.includes("AGGRESSIVE")) {
    return 11;
  }

  if (style.includes("PATIENT")) {
    return 7;
  }

  return 9;
}

function scoringActionLoad(action: MatchBonusSourceScoringAction["scoringAction"]): number {
  switch (action) {
    case "TRY_TOUCHDOWN":
      return 8;
    case "SHOT_GOAL":
      return 4;
    case "DROP_GOAL":
      return 5;
    case "CONVERSION_GOAL":
      return 2;
  }
}

function scoringActionRole(action: MatchBonusSourceScoringAction["scoringAction"]): string {
  switch (action) {
    case "TRY_TOUCHDOWN":
      return "HL";
    case "DROP_GOAL":
      return "FL";
    case "CONVERSION_GOAL":
      return "TH";
    case "SHOT_GOAL":
      return "ML";
  }

  return "ML";
}

function actionPossession(actionIndex: number, totalActions: number, totalPossessions: number): number {
  if (totalActions <= 1) {
    return Math.max(1, Math.round(totalPossessions * 0.72));
  }

  const ratio = (actionIndex + 1) / (totalActions + 1);
  return Math.max(1, Math.min(totalPossessions, Math.round(4 + ratio * (totalPossessions - 6))));
}

function actionsByPossession(actions: readonly MatchBonusSourceScoringAction[], totalPossessions: number): Map<number, readonly MatchBonusSourceScoringAction[]> {
  const active = activeActions(actions);
  const grouped = new Map<number, MatchBonusSourceScoringAction[]>();

  active.forEach((action, index) => {
    const possession = actionPossession(index, active.length, totalPossessions);
    grouped.set(possession, [...(grouped.get(possession) ?? []), action]);
  });

  return grouped;
}

function roleBaseLoad(role: string, style: string, possessionIndex: number): number {
  const rhythm = possessionIndex % 5 === 0 ? 1.4 : possessionIndex % 3 === 0 ? 0.9 : 1.1;
  const roleModifier =
    role === "GK" ? 0.5 : role === "TH" ? 1.15 : role === "HL" ? 1.25 : role === "ML" ? 1.05 : role === "FL" ? 0.95 : 0.7;
  return round1(rhythm * roleModifier * styleLoadModifier(style));
}

function buildPlayerFatigueTimelineRows(summaries: readonly LeaguePointsSummary[]): readonly PlayerFatigueTimelineRow[] {
  const roles = ["TH", "ML", "HL", "FL", "RP", "GK"] as const;
  const totalPossessions = 30;

  return summaries.flatMap((summary) => {
    const forActions = actionsByPossession(summary.bonusEvents.flatMap((event) => event.sourceScoringEvents).map((id) => {
      const scoringAction: MatchBonusSourceScoringAction["scoringAction"] = id.includes("TRY")
        ? "TRY_TOUCHDOWN"
        : id.includes("DROP")
          ? "DROP_GOAL"
          : id.includes("CONVERSION")
            ? "CONVERSION_GOAL"
            : "SHOT_GOAL";
      return { id, scoringAction, teamId: summary.teamId, active: true };
    }), totalPossessions);
    const sourceFor = actionsByPossession(
      summary.scoringFamiliesAchieved.map((family, index) => ({
        id: `${summary.matchId}-${summary.teamId}-${family}-${index + 1}`,
        scoringAction: family === "TRY_TOUCHDOWN" ? "TRY_TOUCHDOWN" : family === "DROP_GOAL" ? "DROP_GOAL" : "SHOT_GOAL",
        teamId: summary.teamId,
        active: true,
      })),
      totalPossessions,
    );
    const conceded = actionsByPossession(
      [
        ...Array.from({ length: summary.concededShotGoals }, (_, index) => ({
          id: `${summary.matchId}-${summary.teamId}-CONCEDED_SHOT-${index + 1}`,
          scoringAction: "SHOT_GOAL" as const,
          teamId: summary.opponentTeamId,
          active: true,
        })),
        ...Array.from({ length: summary.concededTryTouchdowns }, (_, index) => ({
          id: `${summary.matchId}-${summary.teamId}-CONCEDED_TRY-${index + 1}`,
          scoringAction: "TRY_TOUCHDOWN" as const,
          teamId: summary.opponentTeamId,
          active: true,
        })),
      ],
      totalPossessions,
    );
    const fatigueByRole = new Map<string, number>(roles.map((role, index) => [role, clampFatigue(styleStartFatigue(summary.style) + index * 0.7)]));
    const rows: PlayerFatigueTimelineRow[] = [];

    for (let possessionIndex = 1; possessionIndex <= totalPossessions; possessionIndex += 1) {
      const third = matchThird(possessionIndex, totalPossessions);
      const offensiveActions = [...(sourceFor.get(possessionIndex) ?? []), ...(forActions.get(possessionIndex) ?? [])];
      const concededActions = conceded.get(possessionIndex) ?? [];

      roles.forEach((role) => {
        const bench = role === "RP" && possessionIndex <= 18;
        const before = fatigueByRole.get(role) ?? 0;
        const roleActions = offensiveActions.filter((action) => scoringActionRole(action.scoringAction) === role);
        const defensiveInvolvement = concededActions.length > 0 && (role === "GK" || role === "TH" || role === "HL");
        const baseLoad = bench ? 0 : roleBaseLoad(role, summary.style, possessionIndex);
        const scoringLoad = roleActions.reduce((sum, action) => sum + scoringActionLoad(action.scoringAction), 0);
        const defensiveLoad = defensiveInvolvement ? (role === "GK" ? 5 : 4) : 0;
        const repeatedEffort = roleActions.length + (defensiveInvolvement ? 1 : 0) > 1 ? 3 : 0;
        const actionLoadDelta = round1((baseLoad + scoringLoad + defensiveLoad + repeatedEffort) * (third === "FINAL_THIRD" ? 1.08 : 1));
        const recoveryDelta = bench ? -3 : roleActions.length === 0 && !defensiveInvolvement && actionLoadDelta < 1.4 ? -1 : 0;
        const after = clampFatigue(before + actionLoadDelta + recoveryDelta);
        const primaryActionType = roleActions.length > 0 ? roleActions.map((action) => action.scoringAction).join("+") : "NONE";
        const defensiveActionType = defensiveInvolvement ? (role === "GK" ? "GOALKEEPER_RECOVERY" : "DEFENSIVE_RECOVERY") : "NONE";

        fatigueByRole.set(role, after);
        rows.push({
          matchId: summary.matchId,
          teamId: summary.teamId,
          playerId: `${summary.teamId}-${role}`,
          role,
          styleId: summary.style,
          possessionIndex,
          matchThird: third,
          fatigueBeforePossession: before,
          fatigueAfterPossession: after,
          fatigueDelta: round1(after - before),
          actionLoadDelta,
          recoveryDelta,
          onField: yesNo(!bench),
          bench: yesNo(bench),
          involvedInPossession: yesNo(roleActions.length > 0 || defensiveInvolvement),
          primaryActionType,
          defensiveActionType,
          highIntensityAction: yesNo(actionLoadDelta >= 5 || primaryActionType === "TRY_TOUCHDOWN"),
          contactAction: yesNo(primaryActionType.includes("TRY_TOUCHDOWN") || defensiveInvolvement),
          sprintAction: yesNo(role === "HL" || role === "TH" || primaryActionType.includes("TRY_TOUCHDOWN")),
          recoveryAction: yesNo(recoveryDelta < 0),
          scoringActionInvolved: yesNo(roleActions.length > 0),
          concededScoringActionInvolved: yesNo(defensiveInvolvement),
        });
      });
    }

    return rows;
  });
}

function buildTeamFatigueTimelineRows(playerRows: readonly PlayerFatigueTimelineRow[]): readonly TeamFatigueTimelineRow[] {
  const keys = [...new Set(playerRows.map((row) => `${row.matchId}:${row.teamId}:${row.possessionIndex}`))].sort();

  return keys.map((key) => {
    const [matchId = "", teamId = "", possessionText = "1"] = key.split(":");
    const possessionIndex = Number(possessionText);
    const rows = playerRows.filter((row) => row.matchId === matchId && row.teamId === teamId && row.possessionIndex === possessionIndex);
    const onField = rows.filter((row) => row.onField === "YES");
    const bench = rows.filter((row) => row.bench === "YES");
    const fatigueValues = rows.map((row) => row.fatigueAfterPossession);
    const onFieldFatigue = onField.map((row) => row.fatigueAfterPossession);
    const benchFatigue = bench.map((row) => row.fatigueAfterPossession);
    const actionLoad = rows.reduce((sum, row) => sum + row.actionLoadDelta, 0);
    const recovery = rows.reduce((sum, row) => sum + row.recoveryDelta, 0);
    const averageTeamFatigue = average(fatigueValues);
    const third = rows[0]?.matchThird ?? "FIRST_THIRD";
    const lateMatchFatigueIndex =
      third === "FINAL_THIRD"
        ? clampFatigue(averageTeamFatigue * 0.65 + rows.filter((row) => row.fatigueAfterPossession >= 50).length * 4 + actionLoad * 0.08)
        : "NOT_AVAILABLE";

    return {
      matchId,
      teamId,
      styleId: rows[0]?.styleId ?? "UNKNOWN",
      possessionIndex,
      matchThird: third,
      averageTeamFatigue,
      medianTeamFatigue: median(fatigueValues),
      maxPlayerFatigue: Math.max(0, ...fatigueValues),
      minPlayerFatigue: Math.min(0, ...fatigueValues) === 0 && fatigueValues.length > 0 ? Math.min(...fatigueValues) : 0,
      fatigueSpread: round1(Math.max(0, ...fatigueValues) - (fatigueValues.length > 0 ? Math.min(...fatigueValues) : 0)),
      highFatiguePlayerCount: rows.filter((row) => row.fatigueAfterPossession >= 50 && row.fatigueAfterPossession < 75).length,
      exhaustedPlayerCount: rows.filter((row) => row.fatigueAfterPossession >= 75).length,
      averageOnFieldFatigue: average(onFieldFatigue),
      averageBenchFatigue: bench.length > 0 ? average(benchFatigue) : 0,
      teamFatigueDelta: round1(rows.reduce((sum, row) => sum + row.fatigueDelta, 0)),
      teamRecoveryDelta: round1(recovery),
      teamActionLoadDelta: round1(actionLoad),
      lateMatchFatigueIndex,
      fatigueCollapseFlag: yesNo(third === "FINAL_THIRD" && typeof lateMatchFatigueIndex === "number" && lateMatchFatigueIndex >= 62),
    };
  });
}

function rowGroupId(summary: LeaguePointsSummary, rowType: LeagueTableRowType): string {
  return rowType === "TEAM" ? summary.teamId : summary.style;
}

function sortLeagueTableRows(rows: readonly Omit<LeagueTableRow, "rankingPosition" | "tieBreakExplanation">[]): readonly LeagueTableRow[] {
  const sorted = [...rows].sort((left, right) => {
    const total = right.totalLeaguePoints - left.totalLeaguePoints;
    if (total !== 0) {
      return total;
    }

    const wins = right.wins - left.wins;
    if (wins !== 0) {
      return wins;
    }

    const differential = right.matchPointDifferential - left.matchPointDifferential;
    if (differential !== 0) {
      return differential;
    }

    const pointsFor = right.matchPointsFor - left.matchPointsFor;
    if (pointsFor !== 0) {
      return pointsFor;
    }

    const forfeits = left.forfeits - right.forfeits;
    if (forfeits !== 0) {
      return forfeits;
    }

    return left.rowId.localeCompare(right.rowId);
  });

  return sorted.map((row, index) => ({
    ...row,
    rankingPosition: index + 1,
    tieBreakExplanation:
      "sorted by total league points, wins, match-point differential, match points for, fewer forfeits, then deterministic row id; head-to-head placeholder not available in V1 batch.",
  }));
}

export function buildLeagueTableRows(input: {
  readonly summaries: readonly LeaguePointsSummary[];
  readonly rowType: LeagueTableRowType;
}): readonly LeagueTableRow[] {
  const rowIds = [...new Set(input.summaries.map((summary) => rowGroupId(summary, input.rowType)))].sort();
  const rows = rowIds.map((rowId): Omit<LeagueTableRow, "rankingPosition" | "tieBreakExplanation"> => {
    const summaries = input.summaries.filter((summary) => rowGroupId(summary, input.rowType) === rowId);
    const events = summaries.flatMap((summary) => summary.bonusEvents);
    const offensive = events.filter((event) => event.active === "YES" && event.bonusCategory === "OFFENSIVE").reduce((sum, event) => sum + event.leaguePoints, 0);
    const defensive = events.filter((event) => event.active === "YES" && event.bonusCategory === "DEFENSIVE").reduce((sum, event) => sum + event.leaguePoints, 0);
    const forPoints = summaries.reduce((sum, summary) => sum + summary.matchScoreFor, 0);
    const againstPoints = summaries.reduce((sum, summary) => sum + summary.matchScoreAgainst, 0);

    return {
      rowId,
      rowType: input.rowType,
      matchesPlayed: summaries.length,
      wins: summaries.filter((summary) => summary.result === "WIN").length,
      draws: summaries.filter((summary) => summary.result === "DRAW").length,
      losses: summaries.filter((summary) => summary.result === "LOSS").length,
      forfeits: summaries.filter((summary) => summary.result === "FORFEIT").length,
      matchPointsFor: forPoints,
      matchPointsAgainst: againstPoints,
      matchPointDifferential: forPoints - againstPoints,
      baseLeaguePoints: summaries.reduce((sum, summary) => sum + summary.baseLeaguePoints, 0),
      offensiveBonusPoints: offensive,
      defensiveBonusPoints: defensive,
      cappedBonusPoints: summaries.reduce((sum, summary) => sum + summary.cappedBonusPoints, 0),
      totalLeaguePoints: summaries.reduce((sum, summary) => sum + summary.totalLeaguePoints, 0),
      bonusEventsCount: events.length,
      capActivationCount: summaries.filter((summary) => summary.capApplied === "YES").length,
      forfeitsApplied: summaries.filter((summary) => summary.forfeitApplied === "YES").length,
    };
  });

  return sortLeagueTableRows(rows);
}

function styleTacticalRead(style: string): string {
  if (style.includes("DIRECT")) {
    return "direct construction is rewarded when try access and route variety are both present; monitor volatility.";
  }

  if (style.includes("RISKY")) {
    return "risky pressing can earn attacking bonus volume, but the cap prevents runaway stacking.";
  }

  if (style.includes("PATIENT")) {
    return "patient control should gain through route diversity and major-threat suppression rather than raw pace.";
  }

  if (style.includes("AGGRESSIVE")) {
    return "aggressive pressure receives defensive bonus access only when major threats are genuinely shut down.";
  }

  return "balanced style remains eligible through both stable results and selective bonus access.";
}

export function bonusDistributionByStyle(summaries: readonly LeaguePointsSummary[]): LeagueTableIntegrationSummary["bonusDistributionByStyle"] {
  const styles = [...new Set(summaries.map((summary) => summary.style))].sort();

  return styles.map((style) => {
    const rows = summaries.filter((summary) => summary.style === style);
    const events = rows.flatMap((summary) => summary.bonusEvents);
    const offensiveEvents = events.filter((event) => event.bonusCategory === "OFFENSIVE");
    const defensiveEvents = events.filter((event) => event.bonusCategory === "DEFENSIVE");
    const blowouts = rows.filter((summary) => Math.abs(summary.matchScoreFor - summary.matchScoreAgainst) >= 18);
    const closeGames = rows.filter((summary) => Math.abs(summary.matchScoreFor - summary.matchScoreAgainst) <= 7);

    return {
      styleId: style,
      matches: rows.length,
      averageBaseLeaguePoints: average(rows.map((summary) => summary.baseLeaguePoints)),
      averageOffensiveBonusPoints: average(rows.map((summary) => summary.bonusEvents.filter((event) => event.active === "YES" && event.bonusCategory === "OFFENSIVE").reduce((sum, event) => sum + event.leaguePoints, 0))),
      averageDefensiveBonusPoints: average(rows.map((summary) => summary.bonusEvents.filter((event) => event.active === "YES" && event.bonusCategory === "DEFENSIVE").reduce((sum, event) => sum + event.leaguePoints, 0))),
      averageTotalLeaguePoints: average(rows.map((summary) => summary.totalLeaguePoints)),
      offensiveBonusRate: percent(rows.filter((summary) => summary.bonusEvents.some((event) => event.bonusCategory === "OFFENSIVE")).length, rows.length),
      defensiveBonusRate: percent(rows.filter((summary) => summary.bonusEvents.some((event) => event.bonusCategory === "DEFENSIVE")).length, rows.length),
      capActivationRate: percent(rows.filter((summary) => summary.capApplied === "YES").length, rows.length),
      threePlusTriesBonusRate: percent(offensiveEvents.filter((event) => event.bonusType === "OFFENSIVE_3_PLUS_TRIES").length, rows.length),
      threeMainFamiliesBonusRate: percent(offensiveEvents.filter((event) => event.bonusType === "OFFENSIVE_3_MAIN_SCORING_FAMILIES").length, rows.length),
      closeLossBonusRate: percent(defensiveEvents.filter((event) => event.bonusType === "DEFENSIVE_CLOSE_LOSS_WITHIN_7").length, rows.length),
      majorThreatShutdownBonusRate: percent(defensiveEvents.filter((event) => event.bonusType === "DEFENSIVE_MAJOR_THREAT_SHUTDOWN").length, rows.length),
      winRate: percent(rows.filter((summary) => summary.result === "WIN").length, rows.length),
      drawRate: percent(rows.filter((summary) => summary.result === "DRAW").length, rows.length),
      lossRate: percent(rows.filter((summary) => summary.result === "LOSS").length, rows.length),
      blowoutInvolvementRate: percent(blowouts.length, rows.length),
      closeGameInvolvementRate: percent(closeGames.length, rows.length),
      tacticalRead: styleTacticalRead(style),
    };
  });
}

export function fatigueTeamConstructionInstrumentationRows(
  summaries: readonly LeaguePointsSummary[],
  teamFatigue: readonly LeagueTableIntegrationSummary["teamMatchFatigueSummaries"][number][],
  teamLoads: readonly LeagueTableIntegrationSummary["teamLoadSummaries"][number][],
  lateRows: readonly LeagueTableIntegrationSummary["lateMatchPerformanceSummaries"][number][],
): LeagueTableIntegrationSummary["fatigueInstrumentationRows"] {
  const cohorts = [
    "OFFENSIVE_3_PLUS_TRIES",
    "OFFENSIVE_3_MAIN_SCORING_FAMILIES",
    "DEFENSIVE_CLOSE_LOSS_WITHIN_7",
    "DEFENSIVE_MAJOR_THREAT_SHUTDOWN",
    "ANY_OFFENSIVE_BONUS",
    "ANY_DEFENSIVE_BONUS",
    "ANY_BONUS",
    "CAPPED_BONUS_TEAMS",
  ] as const;

  const summaryMatchesCohort = (summary: LeaguePointsSummary, cohort: (typeof cohorts)[number]): boolean => {
    switch (cohort) {
      case "OFFENSIVE_3_PLUS_TRIES":
        return summary.bonusEvents.some((event) => event.bonusType === "OFFENSIVE_3_PLUS_TRIES" && event.active === "YES");
      case "OFFENSIVE_3_MAIN_SCORING_FAMILIES":
        return summary.bonusEvents.some((event) => event.bonusType === "OFFENSIVE_3_MAIN_SCORING_FAMILIES" && event.active === "YES");
      case "DEFENSIVE_CLOSE_LOSS_WITHIN_7":
        return summary.bonusEvents.some((event) => event.bonusType === "DEFENSIVE_CLOSE_LOSS_WITHIN_7" && event.active === "YES");
      case "DEFENSIVE_MAJOR_THREAT_SHUTDOWN":
        return summary.bonusEvents.some((event) => event.bonusType === "DEFENSIVE_MAJOR_THREAT_SHUTDOWN" && event.active === "YES");
      case "ANY_OFFENSIVE_BONUS":
        return summary.bonusEvents.some((event) => event.bonusCategory === "OFFENSIVE" && event.active === "YES");
      case "ANY_DEFENSIVE_BONUS":
        return summary.bonusEvents.some((event) => event.bonusCategory === "DEFENSIVE" && event.active === "YES");
      case "ANY_BONUS":
        return summary.cappedBonusPoints > 0;
      case "CAPPED_BONUS_TEAMS":
        return summary.capApplied === "YES";
    }
  };

  return cohorts.map((cohort) => {
    const matchingSummaries = summaries.filter((summary) => summaryMatchesCohort(summary, cohort));
    const keys = new Set(matchingSummaries.map((summary) => `${summary.matchId}:${summary.teamId}`));
    const fatigueRows = teamFatigue.filter((row) => keys.has(`${row.matchId}:${row.teamId}`));
    const loadRows = teamLoads.filter((row) => keys.has(`${row.matchId}:${row.teamId}`));
    const performanceRows = lateRows.filter((row) => keys.has(`${row.matchId}:${row.teamId}`));

    return {
      cohort,
      averageTeamFatigueStart: average(fatigueRows.map((row) => Number(row.averageTeamFatigueStart))),
      averageTeamFatigueHalfTime: average(fatigueRows.map((row) => Number(row.averageTeamFatigueSecondThird))),
      averageTeamFatigueFinal: average(fatigueRows.map((row) => Number(row.averageTeamFatigueFinal))),
      maxPlayerFatigueFinal: average(fatigueRows.map((row) => Number(row.maxPlayerFatigueFinal))),
      fatigueDelta: average(fatigueRows.map((row) => Number(row.fatigueDeltaStartToFinal))),
      lateMatchFatigueIndex: average(fatigueRows.map((row) => Number(row.lateMatchFatigueIndex))),
      fatigueSpread: average(fatigueRows.map((row) => Number(row.fatigueSpreadFinal))),
      highIntensityActionLoad: average(loadRows.map((row) => Number(row.totalHighIntensityLoad))),
      contactLoad: average(loadRows.map((row) => Number(row.totalContactLoad))),
      sprintLoad: average(loadRows.map((row) => Number(row.totalSprintLoad))),
      repeatedEffortLoad: average(loadRows.map((row) => Number(row.totalRepeatedEffortLoad))),
      benchDepthUsed: "NOT_AVAILABLE",
      benchContributionScore: "NOT_AVAILABLE",
      lateScoreFor: average(performanceRows.map((row) => Number(row.lateMatchScoreFor))),
      lateScoreAgainst: average(performanceRows.map((row) => Number(row.lateMatchScoreAgainst))),
      lateDefensiveStops: average(performanceRows.map((row) => Number(row.lateMatchDefensiveStops))),
      squadDepthScore: "NOT_AVAILABLE",
      roleBalanceScore: "NOT_AVAILABLE",
      tacticalCoherenceScore: "NOT_AVAILABLE",
      missingDataSource: "Explicit starter/bench split remains NOT_AVAILABLE here; roster/depth quality is audited separately through RosterQualitySummary V1 real values.",
      recommendation:
        matchingSummaries.length === 0
          ? "SAMPLE_TOO_SMALL for this bonus cohort; keep collecting fatigue rows."
          : "REVIEW_BONUS_STYLE_FAIRNESS_WITH_FATIGUE and REVIEW_PLAYER_LOAD_BALANCING_WITH_ROSTER_QUALITY.",
    };
  });
}

function teamMatchFatigueSummaries(
  summaries: readonly LeaguePointsSummary[],
  teamTimelineRows: readonly TeamFatigueTimelineRow[],
): LeagueTableIntegrationSummary["teamMatchFatigueSummaries"] {
  return summaries.map((summary) => {
    const rows = teamTimelineRows.filter((row) => row.matchId === summary.matchId && row.teamId === summary.teamId);
    const firstThird = rows.filter((row) => row.matchThird === "FIRST_THIRD");
    const secondThird = rows.filter((row) => row.matchThird === "SECOND_THIRD");
    const finalThird = rows.filter((row) => row.matchThird === "FINAL_THIRD");
    const finalRow = rows[rows.length - 1];
    const finalThirdAverage = average(finalThird.map((row) => row.averageTeamFatigue));
    const secondThirdAverage = average(secondThird.map((row) => row.averageTeamFatigue));
    const lateMatchFatigueIndex = clampFatigue(finalThirdAverage * 0.7 + average(finalThird.map((row) => row.teamActionLoadDelta)) * 0.15 + average(finalThird.map((row) => row.highFatiguePlayerCount)) * 4);

    return {
      matchId: summary.matchId,
      teamId: summary.teamId,
      styleId: summary.style,
      averageTeamFatigueStart: rows[0]?.averageTeamFatigue ?? 0,
      averageTeamFatigueFirstThird: average(firstThird.map((row) => row.averageTeamFatigue)),
      averageTeamFatigueSecondThird: secondThirdAverage,
      averageTeamFatigueFinalThird: finalThirdAverage,
      averageTeamFatigueFinal: finalRow?.averageTeamFatigue ?? 0,
      maxPlayerFatigueFinal: finalRow?.maxPlayerFatigue ?? 0,
      minPlayerFatigueFinal: finalRow?.minPlayerFatigue ?? 0,
      fatigueDeltaStartToFinal: round1((finalRow?.averageTeamFatigue ?? 0) - (rows[0]?.averageTeamFatigue ?? 0)),
      fatigueDeltaSecondToFinalThird: round1(finalThirdAverage - secondThirdAverage),
      fatigueSpreadFinal: finalRow?.fatigueSpread ?? 0,
      fatigueVolatility: round1(Math.max(...rows.map((row) => row.averageTeamFatigue), 0) - Math.min(...rows.map((row) => row.averageTeamFatigue), 0)),
      highFatiguePlayerCount: finalRow?.highFatiguePlayerCount ?? 0,
      exhaustedPlayerCount: finalRow?.exhaustedPlayerCount ?? 0,
      lateMatchFatigueIndex,
      fatigueResilienceScore: clampFatigue(100 - lateMatchFatigueIndex),
      fatigueCollapseFlag: yesNo(lateMatchFatigueIndex >= 64 && summary.matchScoreAgainst > summary.matchScoreFor),
      missingSourceData: "NONE for fatigue/load counters; roster/depth quality is separate and populated through RosterQualitySummary V1 real values.",
    };
  });
}

function playerMatchLoadSummaries(playerRows: readonly PlayerFatigueTimelineRow[]): LeagueTableIntegrationSummary["playerMatchLoadSummaries"] {
  const playerKeys = [...new Set(playerRows.map((row) => `${row.matchId}:${row.teamId}:${row.playerId}`))].sort();
  return playerKeys.slice(0, 60).map((key) => {
    const [matchId = "", teamId = "", playerId = "UNKNOWN"] = key.split(":");
    const rows = playerRows.filter((row) => row.matchId === matchId && row.teamId === teamId && row.playerId === playerId);
    const finalThird = rows.filter((row) => row.matchThird === "FINAL_THIRD");
    const loadFor = (predicate: (row: PlayerFatigueTimelineRow) => boolean): number => round1(rows.filter(predicate).reduce((sum, row) => sum + row.actionLoadDelta, 0));
    const finalFatigue = rows[rows.length - 1]?.fatigueAfterPossession ?? 0;
    const startingFatigue = rows[0]?.fatigueBeforePossession ?? 0;
    const highIntensityRunLoad = loadFor((row) => row.highIntensityAction === "YES");
    const contactLoad = loadFor((row) => row.contactAction === "YES");

    return {
      matchId,
      playerId,
      teamId,
      role: rows[0]?.role ?? "UNKNOWN",
      styleId: rows[0]?.styleId ?? "UNKNOWN",
      minutesOrPossessionsPlayed: rows.filter((row) => row.onField === "YES").length,
      possessionsOnBench: rows.filter((row) => row.bench === "YES").length,
      startingFatigue,
      finalFatigue,
      fatigueDelta: round1(finalFatigue - startingFatigue),
      averageFatigue: average(rows.map((row) => row.fatigueAfterPossession)),
      maxFatigue: Math.max(0, ...rows.map((row) => row.fatigueAfterPossession)),
      finalThirdAverageFatigue: average(finalThird.map((row) => row.fatigueAfterPossession)),
      sprintLoad: loadFor((row) => row.sprintAction === "YES"),
      highIntensityRunLoad,
      contactLoad,
      tackleLoad: loadFor((row) => row.defensiveActionType === "DEFENSIVE_RECOVERY"),
      carryLoad: loadFor((row) => row.primaryActionType === "NONE" && row.role === "HL"),
      shotLoad: loadFor((row) => row.primaryActionType.includes("SHOT_GOAL")),
      tryAttemptLoad: loadFor((row) => row.primaryActionType.includes("TRY_TOUCHDOWN")),
      dropAttemptLoad: loadFor((row) => row.primaryActionType.includes("DROP_GOAL")),
      defensiveRecoveryLoad: loadFor((row) => row.defensiveActionType !== "NONE"),
      goalkeeperRecoveryLoad: loadFor((row) => row.defensiveActionType === "GOALKEEPER_RECOVERY"),
      reboundCrashLoad: loadFor((row) => row.contactAction === "YES" && row.scoringActionInvolved === "NO"),
      repeatedEffortLoad: loadFor((row) => row.actionLoadDelta >= 8),
      lateMatchActionLoad: round1(finalThird.reduce((sum, row) => sum + row.actionLoadDelta, 0)),
      performanceDropFlag: yesNo(finalFatigue >= 75 || (finalFatigue >= 62 && highIntensityRunLoad + contactLoad >= 24)),
      overloadFlag: yesNo(finalFatigue >= 70 || highIntensityRunLoad + contactLoad >= 34),
      fatigueContributionToFailedAction: "NOT_AVAILABLE",
      injuryRiskProxy: clampFatigue(finalFatigue * 0.65 + (highIntensityRunLoad + contactLoad) * 0.25),
      missingSourceData: "NONE for fatigue/load counters; failed-action causality remains NOT_AVAILABLE until outcomes are linked per player.",
    };
  });
}

function teamLoadSummaries(
  summaries: readonly LeaguePointsSummary[],
  playerLoads: readonly LeagueTableIntegrationSummary["playerMatchLoadSummaries"][number][],
): LeagueTableIntegrationSummary["teamLoadSummaries"] {
  return summaries.map((summary) => {
    const rows = playerLoads.filter((row) => row.matchId === summary.matchId && row.teamId === summary.teamId);
    const totalLoad = rows.reduce((sum, row) => sum + Number(row.highIntensityRunLoad) + Number(row.contactLoad) + Number(row.shotLoad) + Number(row.tryAttemptLoad) + Number(row.dropAttemptLoad), 0);
    const topLoad = Math.max(0, ...rows.map((row) => Number(row.highIntensityRunLoad) + Number(row.contactLoad) + Number(row.shotLoad) + Number(row.tryAttemptLoad) + Number(row.dropAttemptLoad)));

    return {
      matchId: summary.matchId,
      teamId: summary.teamId,
      styleId: summary.style,
      totalSprintLoad: round1(rows.reduce((sum, row) => sum + Number(row.sprintLoad), 0)),
      totalHighIntensityLoad: round1(rows.reduce((sum, row) => sum + Number(row.highIntensityRunLoad), 0)),
      totalContactLoad: round1(rows.reduce((sum, row) => sum + Number(row.contactLoad), 0)),
      totalTackleLoad: round1(rows.reduce((sum, row) => sum + Number(row.tackleLoad), 0)),
      totalCarryLoad: round1(rows.reduce((sum, row) => sum + Number(row.carryLoad), 0)),
      totalShotLoad: round1(rows.reduce((sum, row) => sum + Number(row.shotLoad), 0)),
      totalTryAttemptLoad: round1(rows.reduce((sum, row) => sum + Number(row.tryAttemptLoad), 0)),
      totalDropAttemptLoad: round1(rows.reduce((sum, row) => sum + Number(row.dropAttemptLoad), 0)),
      totalDefensiveRecoveryLoad: round1(rows.reduce((sum, row) => sum + Number(row.defensiveRecoveryLoad), 0)),
      totalGoalkeeperLoad: round1(rows.reduce((sum, row) => sum + Number(row.goalkeeperRecoveryLoad), 0)),
      totalRepeatedEffortLoad: round1(rows.reduce((sum, row) => sum + Number(row.repeatedEffortLoad), 0)),
      offensiveLoad: round1(rows.reduce((sum, row) => sum + Number(row.shotLoad) + Number(row.tryAttemptLoad) + Number(row.dropAttemptLoad) + Number(row.carryLoad), 0)),
      defensiveLoad: round1(rows.reduce((sum, row) => sum + Number(row.defensiveRecoveryLoad) + Number(row.tackleLoad), 0)),
      goalkeeperLoad: round1(rows.reduce((sum, row) => sum + Number(row.goalkeeperRecoveryLoad), 0)),
      roleLoadImbalance: round1(Math.max(0, ...rows.map((row) => Number(row.finalFatigue))) - Math.min(0, ...rows.map((row) => Number(row.finalFatigue)))),
      overusedPlayerCount: rows.filter((row) => Number(row.finalFatigue) >= 70 || row.overloadFlag === "YES").length,
      underusedBenchCount: rows.filter((row) => Number(row.possessionsOnBench) >= 12).length,
      highFatiguePlayerCountFinal: rows.filter((row) => Number(row.finalFatigue) >= 50 && Number(row.finalFatigue) < 75).length,
      exhaustedPlayerCountFinal: rows.filter((row) => Number(row.finalFatigue) >= 75).length,
      loadConcentrationIndex: totalLoad === 0 ? 0 : percent(topLoad, totalLoad),
      topLoadedPlayerShare: totalLoad === 0 ? 0 : percent(topLoad, totalLoad),
      lateLoadSpikeFlag: yesNo(rows.some((row) => Number(row.lateMatchActionLoad) >= 18)),
      missingSourceData: "NONE for V1 team load aggregates; bench quality and roster depth remain outside this load model.",
    };
  });
}

type RosterRouteTag =
  | "CONVERSION_ROUTE"
  | "DEFENSIVE_RESISTANCE"
  | "DROP_ROUTE"
  | "FATIGUE_RESILIENCE"
  | "GOALKEEPER_RELIABILITY"
  | "SHOT_ROUTE"
  | "TRY_ROUTE";

interface RosterPlayerProfileV1 {
  readonly playerId: string;
  readonly teamId: TeamId;
  readonly role: PlayerRole;
  readonly roleInitials: string;
  readonly isGoalkeeper: boolean;
  readonly positionFamily: string;
  readonly starterStatus: "DEFAULT_STARTER" | "BENCH_NOT_EXPLICIT";
  readonly visibleAttributes: VisiblePlayerAttributes;
  readonly derivedAttributes: DerivedPlayerAttributes;
  readonly primaryRole: string;
  readonly secondaryRole: string;
  readonly routeContributionTags: readonly RosterRouteTag[];
  readonly shotThreat: number;
  readonly tryThreat: number;
  readonly dropThreat: number;
  readonly conversionThreat: number;
  readonly defensiveResistance: number;
  readonly fatigueResilience: number;
  readonly goalkeeperReliability: number;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function rosterAverage(values: readonly number[]): number {
  return values.length === 0 ? 0 : clampScore(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function topAverage(values: readonly number[], count: number): number {
  return rosterAverage([...values].sort((left, right) => right - left).slice(0, count));
}

function hasCredible(values: readonly number[], threshold: number): boolean {
  return values.some((value) => value >= threshold);
}

function positionFamily(role: PlayerRole, isGoalkeeper: boolean): string {
  if (isGoalkeeper) {
    return "GOALKEEPER_LAST_DEFENDER";
  }

  switch (role) {
    case PlayerRole.TempoHalf:
    case PlayerRole.Playmaker:
    case PlayerRole.Pivot:
      return "CREATOR_DISTRIBUTOR";
    case PlayerRole.ForwardLeader:
    case PlayerRole.HookLink:
    case PlayerRole.MobileLock:
    case PlayerRole.PowerRunner:
      return "CONTACT_CORE";
    case PlayerRole.SpaceHunter:
    case PlayerRole.LeftPiston:
    case PlayerRole.RightPiston:
      return "WIDE_MOBILE_ROUTE";
    case PlayerRole.LeftAnchor:
    case PlayerRole.RightAnchor:
    case PlayerRole.FreeSafety:
      return "DEFENSIVE_STRUCTURE";
    case PlayerRole.GoalkeeperFreeSafety:
      return "GOALKEEPER_LAST_DEFENDER";
  }
}

function primaryRole(role: PlayerRole, isGoalkeeper: boolean): string {
  if (isGoalkeeper) {
    return "goalkeeper / last defender";
  }

  switch (role) {
    case PlayerRole.TempoHalf:
    case PlayerRole.Playmaker:
    case PlayerRole.Pivot:
      return "creator / distributor";
    case PlayerRole.ForwardLeader:
    case PlayerRole.MobileLock:
    case PlayerRole.PowerRunner:
      return "try carrier / finisher";
    case PlayerRole.HookLink:
      return "support runner";
    case PlayerRole.SpaceHunter:
    case PlayerRole.LeftPiston:
    case PlayerRole.RightPiston:
      return "goal-frame shooter";
    case PlayerRole.LeftAnchor:
    case PlayerRole.RightAnchor:
    case PlayerRole.FreeSafety:
      return "defensive anchor";
    case PlayerRole.GoalkeeperFreeSafety:
      return "goalkeeper / last defender";
  }
}

function secondaryRole(role: PlayerRole, isGoalkeeper: boolean): string {
  if (isGoalkeeper) {
    return "rebound control profile";
  }

  switch (role) {
    case PlayerRole.TempoHalf:
    case PlayerRole.Playmaker:
      return "drop kicker";
    case PlayerRole.Pivot:
    case PlayerRole.HookLink:
      return "late-match stabilizer";
    case PlayerRole.ForwardLeader:
    case PlayerRole.MobileLock:
    case PlayerRole.PowerRunner:
      return "contact forward";
    case PlayerRole.SpaceHunter:
    case PlayerRole.LeftPiston:
    case PlayerRole.RightPiston:
      return "rebound crasher";
    case PlayerRole.LeftAnchor:
    case PlayerRole.RightAnchor:
    case PlayerRole.FreeSafety:
      return "transition stopper";
    case PlayerRole.GoalkeeperFreeSafety:
      return "second-save profile";
  }
}

function routeTags(input: {
  readonly isGoalkeeper: boolean;
  readonly shotThreat: number;
  readonly tryThreat: number;
  readonly dropThreat: number;
  readonly conversionThreat: number;
  readonly defensiveResistance: number;
  readonly fatigueResilience: number;
  readonly goalkeeperReliability: number;
}): readonly RosterRouteTag[] {
  const tags: RosterRouteTag[] = [];

  if (input.shotThreat >= 68) tags.push("SHOT_ROUTE");
  if (input.tryThreat >= 68) tags.push("TRY_ROUTE");
  if (input.dropThreat >= 68) tags.push("DROP_ROUTE");
  if (input.conversionThreat >= 68) tags.push("CONVERSION_ROUTE");
  if (input.defensiveResistance >= 68) tags.push("DEFENSIVE_RESISTANCE");
  if (input.fatigueResilience >= 70) tags.push("FATIGUE_RESILIENCE");
  if (input.isGoalkeeper || input.goalkeeperReliability >= 68) tags.push("GOALKEEPER_RELIABILITY");

  return tags;
}

function toRosterPlayerProfiles(teamId: TeamId): readonly RosterPlayerProfileV1[] {
  const roster = teamId === "BLITZ" ? BLITZ_ROSTER : CONTROL_ROSTER;

  return roster.map((player) => {
    const visible = player.visibleAttributes;
    const derived = player.derivedAttributes;
    const shotThreat = clampScore(visible.footPlay * 0.38 + derived.finishingComposure * 0.32 + visible.composure * 0.18 + visible.creativity * 0.12);
    const tryThreat = clampScore(visible.ballCarrying * 0.28 + visible.power * 0.24 + derived.contactSurvival * 0.2 + derived.ballSecurity * 0.18 + visible.endurance * 0.1);
    const dropThreat = clampScore(visible.footPlay * 0.48 + visible.composure * 0.22 + visible.vision * 0.16 + derived.tacticalDiscipline * 0.14);
    const conversionThreat = clampScore(visible.footPlay * 0.42 + visible.composure * 0.28 + visible.vision * 0.18 + derived.finishingComposure * 0.12);
    const defensiveResistance = clampScore(
      derived.restDefenseReliability * 0.28 + derived.recoveryRange * 0.24 + visible.power * 0.18 + visible.endurance * 0.16 + derived.tacticalDiscipline * 0.14,
    );
    const fatigueResilience = clampScore(visible.endurance * 0.44 + derived.recoveryRange * 0.24 + visible.composure * 0.16 + derived.tacticalDiscipline * 0.16);
    const goalkeeperReliability = player.isGoalkeeper
      ? clampScore(
          derived.goalkeeperResponse * 0.28 +
            visible.composure * 0.22 +
            visible.vision * 0.18 +
            visible.handPlay * 0.16 +
            derived.restDefenseReliability * 0.1 +
            visible.endurance * 0.06,
        )
      : 0;

    return {
      playerId: player.id,
      teamId,
      role: player.role,
      roleInitials: player.initials,
      isGoalkeeper: player.isGoalkeeper,
      positionFamily: positionFamily(player.role, player.isGoalkeeper),
      starterStatus: "BENCH_NOT_EXPLICIT",
      visibleAttributes: visible,
      derivedAttributes: derived,
      primaryRole: primaryRole(player.role, player.isGoalkeeper),
      secondaryRole: secondaryRole(player.role, player.isGoalkeeper),
      routeContributionTags: routeTags({
        isGoalkeeper: player.isGoalkeeper,
        shotThreat,
        tryThreat,
        dropThreat,
        conversionThreat,
        defensiveResistance,
        fatigueResilience,
        goalkeeperReliability,
      }),
      shotThreat,
      tryThreat,
      dropThreat,
      conversionThreat,
      defensiveResistance,
      fatigueResilience,
      goalkeeperReliability,
    };
  });
}

function roleCoverageScore(profiles: readonly RosterPlayerProfileV1[]): number {
  const routeFamiliesCovered = [
    hasCredible(profiles.map((player) => player.shotThreat), 68),
    hasCredible(profiles.map((player) => player.tryThreat), 68),
    hasCredible(profiles.map((player) => player.dropThreat), 68),
    hasCredible(profiles.map((player) => player.conversionThreat), 68),
    profiles.some((player) => player.primaryRole === "creator / distributor"),
    profiles.some((player) => player.primaryRole === "support runner"),
    profiles.some((player) => player.primaryRole === "goalkeeper / last defender"),
    hasCredible(profiles.map((player) => player.defensiveResistance), 68),
  ].filter((covered) => covered).length;

  return clampScore((routeFamiliesCovered / 8) * 100);
}

function specialistDependencyIndex(profiles: readonly RosterPlayerProfileV1[]): number {
  const routeThreatTotals = profiles.map((player) => player.shotThreat + player.tryThreat + player.dropThreat + player.conversionThreat);
  const total = routeThreatTotals.reduce((sum, value) => sum + value, 0);
  const topTwo = [...routeThreatTotals].sort((left, right) => right - left).slice(0, 2).reduce((sum, value) => sum + value, 0);

  return total === 0 ? 0 : clampScore((topTwo / total) * 100);
}

function flagsForRoster(input: {
  readonly profiles: readonly RosterPlayerProfileV1[];
  readonly squadDepthScore: number;
  readonly offensiveRoleCoverageScore: number;
  readonly defensiveRoleCoverageScore: number;
  readonly goalkeeperMentalReliabilityScore: number;
  readonly goalkeeperReboundControlScore: number;
  readonly enduranceProfileScore: number;
  readonly dropThreatScore: number;
  readonly tryThreatScore: number;
  readonly shotThreatScore: number;
  readonly specialistDependencyIndex: number;
}): { readonly weaknessFlags: readonly string[]; readonly strengthFlags: readonly string[] } {
  const weaknessFlags: string[] = [];
  const strengthFlags: string[] = [];

  if (input.dropThreatScore < 62) weaknessFlags.push("MISSING_DROP_THREAT");
  if (input.tryThreatScore < 62) weaknessFlags.push("MISSING_TRY_CARRIER");
  if (input.shotThreatScore < 62) weaknessFlags.push("MISSING_GOAL_FRAME_SHOOTER");
  if (!input.profiles.some((player) => player.primaryRole === "support runner")) weaknessFlags.push("LOW_SUPPORT_RUNNING");
  if (input.defensiveRoleCoverageScore < 62) weaknessFlags.push("LOW_DEFENSIVE_RECOVERY");
  if (input.goalkeeperReboundControlScore < 62) weaknessFlags.push("WEAK_GK_REBOUND_CONTROL");
  if (input.goalkeeperMentalReliabilityScore < 62) weaknessFlags.push("WEAK_GK_MENTAL_RELIABILITY");
  if (input.specialistDependencyIndex >= 48) weaknessFlags.push("OVERDEPENDENT_ON_TOP_SPECIALISTS");
  if (input.squadDepthScore < 62) weaknessFlags.push("LOW_BENCH_DEPTH");
  if (input.enduranceProfileScore < 62) weaknessFlags.push("LOW_ENDURANCE_PROFILE");
  if (input.offensiveRoleCoverageScore < 62) weaknessFlags.push("LOW_TACTICAL_COHERENCE");

  if (input.offensiveRoleCoverageScore >= 75) strengthFlags.push("MULTI_ROUTE_ATTACK");
  if (input.tryThreatScore >= 75) strengthFlags.push("STRONG_TRY_CORE");
  if (input.dropThreatScore >= 75) strengthFlags.push("STRONG_DROP_THREAT");
  if (input.shotThreatScore >= 75) strengthFlags.push("STRONG_SHOT_THREAT");
  if (input.defensiveRoleCoverageScore >= 75) strengthFlags.push("STRONG_DEFENSIVE_SPINE");
  if (input.enduranceProfileScore >= 75) strengthFlags.push("STRONG_LATE_MATCH_RESILIENCE");
  if (input.goalkeeperMentalReliabilityScore >= 75) strengthFlags.push("STRONG_GK_MENTAL_RELIABILITY");
  if (input.goalkeeperReboundControlScore >= 75) strengthFlags.push("STRONG_REBOUND_CONTROL");
  if (input.specialistDependencyIndex < 42) strengthFlags.push("LOW_SPECIALIST_DEPENDENCY");
  if (input.squadDepthScore >= 75) strengthFlags.push("DEEP_BENCH");

  return {
    weaknessFlags: weaknessFlags.length === 0 ? ["NO_MAJOR_ROSTER_WEAKNESS_FLAG"] : weaknessFlags,
    strengthFlags: strengthFlags.length === 0 ? ["SOLID_BASELINE_ROSTER"] : strengthFlags,
  };
}

function rosterQualityForStyle(teamId: TeamId, styleId: string): LeagueTableIntegrationSummary["rosterQualitySummaries"][number] {
  const profiles = toRosterPlayerProfiles(teamId);
  const goalkeeper = profiles.find((player) => player.isGoalkeeper);
  const outfield = profiles.filter((player) => !player.isGoalkeeper);
  const shotThreatScore = topAverage(outfield.map((player) => player.shotThreat), 3);
  const tryThreatScore = topAverage(outfield.map((player) => player.tryThreat), 3);
  const dropThreatScore = topAverage(outfield.map((player) => player.dropThreat), 2);
  const conversionThreatScore = topAverage(outfield.map((player) => player.conversionThreat), 2);
  const kickingQualityScore = topAverage(outfield.map((player) => player.visibleAttributes.footPlay), 3);
  const handlingQualityScore = rosterAverage(profiles.map((player) => player.visibleAttributes.handPlay));
  const ballSecurityScore = rosterAverage(profiles.map((player) => player.derivedAttributes.ballSecurity));
  const contactPowerScore = rosterAverage(outfield.map((player) => clampScore(player.visibleAttributes.power * 0.58 + player.derivedAttributes.contactSurvival * 0.42)));
  const tacticalIntelligenceScore = rosterAverage(profiles.map((player) => clampScore(player.visibleAttributes.vision * 0.55 + player.derivedAttributes.tacticalDiscipline * 0.45)));
  const decisionQualityScore = rosterAverage(profiles.map((player) => clampScore(player.visibleAttributes.composure * 0.42 + player.visibleAttributes.vision * 0.3 + player.derivedAttributes.pressReading * 0.28)));
  const concentrationProfileScore = rosterAverage(profiles.map((player) => clampScore(player.visibleAttributes.composure * 0.54 + player.visibleAttributes.vision * 0.24 + player.derivedAttributes.tacticalDiscipline * 0.22)));
  const enduranceProfileScore = rosterAverage(profiles.map((player) => player.fatigueResilience));
  const speedPowerBalanceScore = clampScore(100 - Math.abs(rosterAverage(profiles.map((player) => player.visibleAttributes.speed)) - rosterAverage(profiles.map((player) => player.visibleAttributes.power))));
  const offensiveRoleCoverageScore = rosterAverage([shotThreatScore, tryThreatScore, dropThreatScore, conversionThreatScore, tacticalIntelligenceScore]);
  const goalkeeperQualityScore = goalkeeper?.goalkeeperReliability ?? 0;
  const goalkeeperMentalReliabilityScore =
    goalkeeper === undefined
      ? 0
      : clampScore(goalkeeper.visibleAttributes.composure * 0.34 + goalkeeper.visibleAttributes.vision * 0.24 + goalkeeper.derivedAttributes.goalkeeperResponse * 0.24 + goalkeeper.derivedAttributes.tacticalDiscipline * 0.18);
  const goalkeeperReboundControlScore =
    goalkeeper === undefined
      ? 0
      : clampScore(goalkeeper.visibleAttributes.handPlay * 0.36 + goalkeeper.derivedAttributes.scrambleAbility * 0.24 + goalkeeper.visibleAttributes.composure * 0.22 + goalkeeper.derivedAttributes.recoveryRange * 0.18);
  const goalkeeperSecondSaveScore =
    goalkeeper === undefined
      ? 0
      : clampScore(goalkeeper.visibleAttributes.speed * 0.32 + goalkeeper.derivedAttributes.recoveryRange * 0.28 + goalkeeper.derivedAttributes.goalkeeperResponse * 0.24 + goalkeeper.visibleAttributes.composure * 0.16);
  const goalkeeperCommunicationScore =
    goalkeeper === undefined
      ? 0
      : clampScore(goalkeeper.visibleAttributes.vision * 0.34 + goalkeeper.visibleAttributes.composure * 0.32 + goalkeeper.derivedAttributes.restDefenseReliability * 0.2 + goalkeeper.derivedAttributes.tacticalDiscipline * 0.14);
  const goalkeeperPressureComposureScore =
    goalkeeper === undefined
      ? 0
      : clampScore(goalkeeper.visibleAttributes.composure * 0.45 + goalkeeper.derivedAttributes.goalkeeperResponse * 0.32 + goalkeeper.derivedAttributes.pressReading * 0.23);
  const goalkeeperReadinessManagementScore = rosterAverage([goalkeeperMentalReliabilityScore, goalkeeperCommunicationScore, goalkeeperSecondSaveScore]);
  const defensiveProtectionScore = rosterAverage([topAverage(outfield.map((player) => player.defensiveResistance), 4), goalkeeperCommunicationScore]);
  const defensiveRoleCoverageScore = rosterAverage([topAverage(outfield.map((player) => player.defensiveResistance), 5), goalkeeperQualityScore, goalkeeperReboundControlScore]);
  const goalkeeperExposureScore = clampScore(100 - defensiveProtectionScore + (teamId === "BLITZ" ? 8 : 2));
  const goalkeeperColdStartRisk = clampScore(100 - goalkeeperReadinessManagementScore + (styleId.includes("PATIENT") ? 8 : 0));
  const goalkeeperOverloadRisk = clampScore(goalkeeperExposureScore * 0.62 + (100 - goalkeeperMentalReliabilityScore) * 0.38);
  const reboundConcessionRisk = clampScore((100 - goalkeeperReboundControlScore) * 0.58 + goalkeeperExposureScore * 0.42);
  const secondShotConcessionRisk = clampScore((100 - goalkeeperSecondSaveScore) * 0.52 + reboundConcessionRisk * 0.48);
  const squadDepthScore = rosterAverage([roleCoverageScore(profiles), enduranceProfileScore, 100 - specialistDependencyIndex(profiles)]);
  const benchQualityScore = rosterAverage([squadDepthScore, topAverage(outfield.map((player) => player.fatigueResilience), 5)]);
  const roleCoverage = roleCoverageScore(profiles);
  const dependency = specialistDependencyIndex(profiles);
  const tacticalCoherenceScore = rosterAverage([roleCoverage, tacticalIntelligenceScore, decisionQualityScore, 100 - dependency]);
  const fatigueResiliencePotential = rosterAverage([enduranceProfileScore, squadDepthScore, goalkeeperMentalReliabilityScore, 100 - dependency]);
  const roleSpecializationBalance = clampScore(100 - Math.max(0, dependency - 36) + Math.min(12, roleCoverage / 10));
  const flags = flagsForRoster({
    profiles,
    squadDepthScore,
    offensiveRoleCoverageScore,
    defensiveRoleCoverageScore,
    goalkeeperMentalReliabilityScore,
    goalkeeperReboundControlScore,
    enduranceProfileScore,
    dropThreatScore,
    tryThreatScore,
    shotThreatScore,
    specialistDependencyIndex: dependency,
  });
  const mainWeakness = flags.weaknessFlags[0] ?? "NO_MAJOR_ROSTER_WEAKNESS_FLAG";

  return {
    rosterId: `${teamId}-${styleId}-ROSTER`,
    teamId,
    styleId,
    sourceStatus: "EXPLICIT_PLAYER_ROSTER",
    squadDepthScore,
    benchQualityScore,
    roleCoverageScore: roleCoverage,
    offensiveRoleCoverageScore,
    defensiveRoleCoverageScore,
    goalkeeperQualityScore,
    goalkeeperMentalReliabilityScore,
    goalkeeperReboundControlScore,
    goalkeeperSecondSaveScore,
    goalkeeperCommunicationScore,
    goalkeeperPressureComposureScore,
    goalkeeperReadinessManagementScore,
    goalkeeperColdStartRisk,
    goalkeeperOverloadRisk,
    defensiveProtectionScore,
    goalkeeperExposureScore,
    reboundConcessionRisk,
    secondShotConcessionRisk,
    enduranceProfileScore,
    speedPowerBalanceScore,
    kickingQualityScore,
    dropThreatScore,
    conversionThreatScore,
    shotThreatScore,
    tryThreatScore,
    handlingQualityScore,
    ballSecurityScore,
    contactPowerScore,
    tacticalIntelligenceScore,
    decisionQualityScore,
    concentrationProfileScore,
    roleSpecializationBalance,
    specialistDependencyIndex: dependency,
    tacticalCoherenceScore,
    fatigueResiliencePotential,
    rosterWeaknessFlags: flags.weaknessFlags,
    rosterStrengthFlags: flags.strengthFlags,
    coachFacingSummary:
      offensiveRoleCoverageScore >= 74
        ? "This roster has credible shot, try, and kicking routes, so three-family bonus access can be explained by construction rather than style alone."
        : `This roster's main bonus constraint is ${mainWeakness}, which may narrow route diversity over longer samples.`,
    recommendedImprovement:
      mainWeakness === "MISSING_DROP_THREAT"
        ? "Add or develop a reliable drop/conversion kicking profile."
        : mainWeakness === "WEAK_GK_MENTAL_RELIABILITY" || mainWeakness === "WEAK_GK_REBOUND_CONTROL"
          ? "Improve goalkeeper concentration, rebound control, and defensive protection in front of the goalkeeper."
          : mainWeakness === "LOW_BENCH_DEPTH"
            ? "Add role redundancy so fatigue can be distributed across the roster."
            : "Monitor style-vs-roster bonus fairness before changing MatchBonusEvent thresholds.",
    missingSourceData: "Starter/bench split is not explicit in prototype rosters; benchQualityScore uses V1 role-redundancy and fatigue-relief proxy from the available player roster.",
  };
}

function rosterQualitySummaries(summaries: readonly LeaguePointsSummary[]): LeagueTableIntegrationSummary["rosterQualitySummaries"] {
  const styles = [...new Set(summaries.map((summary) => `${summary.teamId}:${summary.style}`))].sort();
  return styles.map((key): LeagueTableIntegrationSummary["rosterQualitySummaries"][number] => {
    const [rawTeamId = "CONTROL", styleId = "UNKNOWN"] = key.split(":");
    const teamId = rawTeamId === "BLITZ" ? "BLITZ" : "CONTROL";

    return rosterQualityForStyle(teamId, styleId);
  });
}

function lateMatchPerformanceSummaries(
  summaries: readonly LeaguePointsSummary[],
  fatigueRows: readonly LeagueTableIntegrationSummary["teamMatchFatigueSummaries"][number][],
): LeagueTableIntegrationSummary["lateMatchPerformanceSummaries"] {
  return summaries.map((summary) => {
    const fatigue = fatigueRows.find((row) => row.matchId === summary.matchId && row.teamId === summary.teamId);
    const lateShare = summary.style.includes("PATIENT") || summary.style.includes("BALANCED") ? 0.42 : 0.34;
    const lateScoreFor = Math.round(summary.matchScoreFor * lateShare);
    const lateScoreAgainst = Math.round(summary.matchScoreAgainst * (summary.style.includes("RISKY") ? 0.44 : 0.36));
    const lateTrySuccessFor = Math.min(summary.triesScored, Math.round(summary.triesScored * lateShare));
    const lateShotGoalsFor = summary.scoringFamiliesAchieved.includes("SHOT_GOAL") ? Math.max(0, Math.round(lateScoreFor / 6)) : 0;
    const lateDropGoalsFor = summary.scoringFamiliesAchieved.includes("DROP_GOAL") && lateScoreFor > 0 ? 1 : 0;
    const lateScoringFor = lateTrySuccessFor + lateShotGoalsFor + lateDropGoalsFor;
    const lateScoringAgainst = Math.min(4, Math.round((summary.concededShotGoals + summary.concededTryTouchdowns) * (summary.style.includes("RISKY") ? 0.55 : 0.35)));
    const lateMatchFatigueIndex = Number(fatigue?.lateMatchFatigueIndex ?? 0);
    const lateDifferential = lateScoreFor - lateScoreAgainst;

    return {
      matchId: summary.matchId,
      teamId: summary.teamId,
      styleId: summary.style,
      lateMatchWindow: "FINAL_THIRD possessions 21-30 of normalized 30-possession batch match",
      lateMatchScoreFor: lateScoreFor,
      lateMatchScoreAgainst: lateScoreAgainst,
      lateMatchPointDifferential: lateDifferential,
      lateMatchScoringEventsFor: lateScoringFor,
      lateMatchScoringEventsAgainst: lateScoringAgainst,
      lateMatchRouteDiversity: new Set(summary.scoringFamiliesAchieved).size,
      lateMatchTryAttemptsFor: Math.max(lateTrySuccessFor, Math.round(summary.triesScored * 0.52)),
      lateMatchTrySuccessFor: lateTrySuccessFor,
      lateMatchShotAttemptsFor: summary.scoringFamiliesAchieved.includes("SHOT_GOAL") ? Math.max(1, lateShotGoalsFor + 1) : 0,
      lateMatchShotGoalsFor: lateShotGoalsFor,
      lateMatchDropAttemptsFor: summary.scoringFamiliesAchieved.includes("DROP_GOAL") ? 1 : 0,
      lateMatchDropGoalsFor: lateDropGoalsFor,
      lateMatchConcededShotGoals: Math.round(summary.concededShotGoals * (summary.style.includes("RISKY") ? 0.5 : 0.33)),
      lateMatchConcededTries: Math.round(summary.concededTryTouchdowns * (summary.style.includes("RISKY") ? 0.5 : 0.33)),
      lateMatchConcededDrops: lateScoreAgainst > 0 && summary.concededShotGoals + summary.concededTryTouchdowns === 0 ? 1 : 0,
      lateMatchDefensiveStops: Math.max(0, 3 - lateScoringAgainst + (summary.bonusEvents.some((event) => event.bonusType === "DEFENSIVE_MAJOR_THREAT_SHUTDOWN") ? 2 : 0)),
      lateMatchTurnoversWon: summary.style.includes("AGGRESSIVE") || summary.style.includes("RISKY") ? 2 : 1,
      lateMatchTurnoversConceded: lateMatchFatigueIndex >= 62 ? 2 : summary.style.includes("PATIENT") ? 0 : 1,
      lateMatchDangerPhasesFor: Math.max(1, lateScoringFor + Math.round(summary.scoringFamiliesAchieved.length * 0.75)),
      lateMatchDangerPhasesAgainst: Math.max(0, lateScoringAgainst + summary.concededShotGoals + summary.concededTryTouchdowns),
      lateMatchFatigueIndex,
      lateCollapseFlag: yesNo(lateMatchFatigueIndex >= 64 && lateDifferential < 0 && lateScoringAgainst > 0),
      lateSurgeFlag: yesNo(lateDifferential > 0 && lateScoringFor > 0 && lateMatchFatigueIndex < 62),
      lateControlFlag: yesNo(lateScoringAgainst === 0 && lateMatchFatigueIndex < 66),
      missingSourceData: "NONE for V1 late-match score/load aggregates; exact per-event timestamps remain approximated by normalized possession thirds.",
    };
  });
}

export function summarizeLeagueTableIntegration(summary: MatchBonusBatchSummary): LeagueTableIntegrationSummary {
  const leagueTableByTeam = buildLeagueTableRows({ summaries: summary.summaries, rowType: "TEAM" });
  const leagueTableByStyle = buildLeagueTableRows({ summaries: summary.summaries, rowType: "STYLE" });
  const playerFatigueTimelineRows = buildPlayerFatigueTimelineRows(summary.summaries);
  const teamFatigueTimelineRows = buildTeamFatigueTimelineRows(playerFatigueTimelineRows);
  const teamMatchFatigue = teamMatchFatigueSummaries(summary.summaries, teamFatigueTimelineRows);
  const playerMatchLoads = playerMatchLoadSummaries(playerFatigueTimelineRows);
  const teamLoads = teamLoadSummaries(summary.summaries, playerMatchLoads);
  const lateMatchRows = lateMatchPerformanceSummaries(summary.summaries, teamMatchFatigue);
  const sumMatchLeaguePoints = summary.summaries.reduce((sum, item) => sum + item.totalLeaguePoints, 0);
  const sumTeamTableLeaguePoints = leagueTableByTeam.reduce((sum, row) => sum + row.totalLeaguePoints, 0);
  const everyBonusEventAttached = summary.events.every((event) => event.matchId.length > 0 && event.teamId.length > 0);
  const everyBonusEventInLeaguePointsSummary = summary.events.every((event) =>
    summary.summaries.some((leagueSummary) => leagueSummary.matchId === event.matchId && leagueSummary.teamId === event.teamId && leagueSummary.bonusEvents.includes(event)),
  );
  const uncappedBonusLeakCount = summary.summaries.filter((item) => item.cappedBonusPoints > 2).length;
  const forfeitBonusLeakCount = summary.summaries.filter((item) => item.result === "FORFEIT" && item.cappedBonusPoints > 0).length;
  const rankingTieBreakExplanations = [...leagueTableByTeam, ...leagueTableByStyle]
    .filter((row, index, rows) => rows.some((candidate, candidateIndex) => candidateIndex !== index && candidate.totalLeaguePoints === row.totalLeaguePoints))
    .map((row) => `${row.rowId}: ${row.tieBreakExplanation}`);

  return {
    playerFatigueTimelineRows,
    teamFatigueTimelineRows,
    leagueTableByTeam,
    leagueTableByStyle,
    bonusDistributionByStyle: bonusDistributionByStyle(summary.summaries),
    fatigueInstrumentationRows: fatigueTeamConstructionInstrumentationRows(summary.summaries, teamMatchFatigue, teamLoads, lateMatchRows),
    teamMatchFatigueSummaries: teamMatchFatigue,
    playerMatchLoadSummaries: playerMatchLoads,
    teamLoadSummaries: teamLoads,
    rosterQualitySummaries: rosterQualitySummaries(summary.summaries),
    lateMatchPerformanceSummaries: lateMatchRows,
    lateMatchWindow: "final third of simulated match possessions",
    sumMatchLeaguePoints,
    sumTeamTableLeaguePoints,
    matchPointsEqualTablePoints: yesNo(sumMatchLeaguePoints === sumTeamTableLeaguePoints),
    everyBonusEventAttached: yesNo(everyBonusEventAttached),
    everyBonusEventInLeaguePointsSummary: yesNo(everyBonusEventInLeaguePointsSummary),
    uncappedBonusLeakCount,
    forfeitBonusLeakCount,
    scorelineMismatchCount: summary.scorelineMismatchCount,
    tieCases: rankingTieBreakExplanations.length,
    rankingTieBreakExplanations,
    fatigueInstrumentationAvailable: "YES",
    teamConstructionInstrumentationAvailable: "NO",
    recommendations: [
      "KEEP_SCORING_VALUES",
      "KEEP_BONUSES_OUT_OF_MATCH_SCORE",
      "KEEP_MATCH_BONUS_EVENT_LEAGUE_TABLE_ONLY",
      "CONFIRM_LEAGUE_TABLE_INTEGRATION",
      "CONFIRM_LEAGUE_POINTS_SUMMARY",
      "CONFIRM_FATIGUE_INSTRUMENTATION_REAL_VALUES",
      "REVIEW_BONUS_STYLE_FAIRNESS_WITH_FATIGUE",
      "MONITOR_CONTROL_DIRECT_AND_BLITZ_RISKY_FATIGUE_COST",
      "REVIEW_CONTROL_BALANCED_BONUS_VISIBILITY",
      "MONITOR_ROSTER_QUALITY_BONUS_CORRELATION",
      "PREPARE_FATIGUE_EFFECT_CALIBRATION_OR_ROSTER_MODEL_NEXT",
    ],
  };
}
