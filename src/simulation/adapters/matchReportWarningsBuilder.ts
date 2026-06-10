import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../../contracts/matchReportEvidence";
import type { MatchReportWarning, MatchReportWarningType } from "../../contracts/matchReportWarnings";
import {
  coachFacingHarnessWarningSummary,
} from "../../reports/coachFacingCopy";
import { coachFacingWarningSummaryByType } from "../../reports/coachFacingSummary";
import type {
  FullMatchHarnessSanityReport,
  FullMatchHarnessSanityWarning,
} from "../diagnostics/fullMatchHarnessSanity";

function warningTypeForHarnessWarning(warning: FullMatchHarnessSanityWarning): MatchReportWarningType {
  switch (warning) {
    case "SINGLE_RUN_NOT_GLOBAL_ECONOMY":
      return "FULL_MATCH_HARNESS_SINGLE_RUN";
    case "INFLATED_SINGLE_RUN_SCORE":
      return "INFLATED_SINGLE_RUN_SCORE";
    case "ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN":
      return "ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN";
    case "ZERO_SCORING_EVENTS_FOR_ONE_TEAM":
      return "ZERO_SCORING_EVENTS_FOR_ONE_TEAM";
    case "POSSIBLE_SEGMENT_PATTERN_REPETITION":
    case "MISSING_SEGMENT_STATE_PROPAGATION":
    case "MISSING_MOMENTUM_VARIATION":
    case "SCORING_EVENTS_CLUSTERED_IN_SAME_SEGMENT_PATTERN":
      return "REPEATED_SEGMENT_PATTERN";
    case "REPETITIVE_KEY_MOMENTS":
    case "SCORING_EVENTS_CLUSTERED_IN_SAME_ZONE":
    case "SCORING_EVENTS_CLUSTERED_IN_SAME_EVENT_FAMILY":
      return "LOW_EVENT_FAMILY_DIVERSITY";
    case "FLAT_FATIGUE_SIGNAL":
    case "MISSING_FATIGUE_PROPAGATION":
      return "FATIGUE_SIGNAL_FLAT";
    case "HIGH_SCORING_EVENT_COUNT_SINGLE_TEAM":
      return "ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN";
    case "DOMINATED_TEAM_HAS_DANGER_WITHOUT_SCORE":
    case "DOMINATED_TEAM_HAS_PRESSURE_WITHOUT_CONVERSION":
      return "ZERO_SCORING_EVENTS_FOR_ONE_TEAM";
    case "DOMINATED_TEAM_HIGH_LOAD_NO_PAYOFF":
      return "HIGH_LOAD_WITH_NO_PAYOFF";
  }
}

function severityForWarning(type: MatchReportWarningType): MatchReportWarning["severity"] {
  switch (type) {
    case "FULL_MATCH_HARNESS_SINGLE_RUN":
      return "info";
    case "INFLATED_SINGLE_RUN_SCORE":
    case "ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN":
    case "ZERO_SCORING_EVENTS_FOR_ONE_TEAM":
      return "medium";
    case "REPEATED_SEGMENT_PATTERN":
    case "LOW_EVENT_FAMILY_DIVERSITY":
    case "FATIGUE_SIGNAL_FLAT":
    case "HIGH_LOAD_WITH_NO_PAYOFF":
    case "REPORT_COPY_LIMITATION":
    case "ADAPTER_LIMITATION":
      return "low";
  }
}

function titleForWarning(type: MatchReportWarningType): string {
  switch (type) {
    case "FULL_MATCH_HARNESS_SINGLE_RUN":
      return "Avertissement de harnais full-match";
    case "INFLATED_SINGLE_RUN_SCORE":
      return "Score local élevé dans le harnais";
    case "ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN":
      return "Domination scoring single-run à surveiller";
    case "ZERO_SCORING_EVENTS_FOR_ONE_TEAM":
      return "Équipe sans conversion dans ce run";
    case "REPEATED_SEGMENT_PATTERN":
      return "Répétition de segments à surveiller";
    case "LOW_EVENT_FAMILY_DIVERSITY":
      return "Diversité d'événements limitée";
    case "FATIGUE_SIGNAL_FLAT":
      return "Signal de fatigue trop plat";
    case "HIGH_LOAD_WITH_NO_PAYOFF":
      return "Charge élevée sans conversion";
    case "REPORT_COPY_LIMITATION":
      return "Limite de copie du rapport";
    case "ADAPTER_LIMITATION":
      return "Limite de l'adaptateur";
  }
}

function evidenceEventIds(report: MatchReport, sanity: FullMatchHarnessSanityReport): readonly string[] {
  const dominanceIds = sanity.scoringDominance.dominatedTeamEvidenceEventIds;

  if (dominanceIds.length > 0) {
    return dominanceIds;
  }

  const event = report.timeline.find((candidate) => candidate.eventType !== "kickoff") ?? report.timeline[0];

  return event === undefined ? [] : [event.eventId];
}

function affectedZones(events: readonly MatchEvent[]): readonly string[] {
  return [...new Set(events.map((event) => event.zone))].slice(0, 4);
}

export function buildHarnessWarningEvidenceFacts(input: {
  readonly report: MatchReport;
  readonly sanity: FullMatchHarnessSanityReport;
}): readonly MatchReportEvidenceFact[] {
  if (input.sanity.warnings.length <= 1) {
    return [];
  }

  const eventIds = evidenceEventIds(input.report, input.sanity);
  const events = input.report.timeline.filter((event) => eventIds.includes(event.eventId));
  const teamId = input.report.teamStats[0]?.teamId;
  const opponentTeamId = input.report.teamStats[1]?.teamId;

  return [
    {
      factId: `${input.report.matchId}-harness-plausibility-warning`,
      matchId: input.report.matchId,
      ...(teamId === undefined ? {} : { teamId }),
      ...(opponentTeamId === undefined ? {} : { opponentTeamId }),
      category: "HARNESS_PLAUSIBILITY_WARNING",
      scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
      eventIds,
      affectedZones: affectedZones(events),
      summary: coachFacingHarnessWarningSummary(input.sanity.warnings),
      confidence: "low",
      strength: Math.min(100, 35 + input.sanity.warnings.length * 8),
      coachVisible: true,
      internalTags: input.sanity.warnings,
    },
  ];
}

export function buildMatchReportWarnings(input: {
  readonly report: MatchReport;
  readonly sanity: FullMatchHarnessSanityReport;
  readonly evidenceFacts: readonly MatchReportEvidenceFact[];
}): readonly MatchReportWarning[] {
  if (input.sanity.warnings.length <= 1) {
    return [];
  }

  const harnessFact = input.evidenceFacts.find((fact) => fact.category === "HARNESS_PLAUSIBILITY_WARNING");
  const eventIds = evidenceEventIds(input.report, input.sanity);
  const uniqueTypes = [...new Set(input.sanity.warnings.map(warningTypeForHarnessWarning))];

  return uniqueTypes.map((type) => {
    const dominantTeamId = input.sanity.scoringDominance.dominantTeamId;
    const dominatedTeamId = input.sanity.scoringDominance.dominatedTeamId;

    return {
      warningId: `${input.report.matchId}-${type.toLowerCase()}`,
      type,
      scope: "coach_visible",
      severity: severityForWarning(type),
      title: titleForWarning(type),
      coachSummary: coachFacingWarningSummaryByType({
        warningType: type,
        fallbackSummary: coachFacingHarnessWarningSummary(input.sanity.warnings),
        score: input.report.score,
        ...(dominantTeamId === undefined ? {} : { dominantTeamId }),
        ...(dominatedTeamId === undefined ? {} : { dominatedTeamId }),
      }),
      technicalSummary: `Harness warnings: ${input.sanity.warnings.join(", ")}. Scope: ${input.sanity.scope}. May invalidate global economy: false.`,
      evidenceFactIds: harnessFact === undefined ? [] : [harnessFact.factId],
      eventIds,
      mayInvalidateGlobalScoringEconomy: false,
    };
  });
}
