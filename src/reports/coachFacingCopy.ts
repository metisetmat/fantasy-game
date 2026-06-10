import type { FullMatchHarnessSanityWarning } from "../simulation/diagnostics/fullMatchHarnessSanity";
import type { FullMatchScoringDominanceReport } from "../simulation/diagnostics/fullMatchScoringDominanceDiagnostics";
import { normalizeCoachFacingCopy } from "./coachCopyQuality";

function teamLabel(teamId: string | undefined, fallback: string): string {
  return (teamId ?? fallback).toUpperCase();
}

function warningTheme(warning: FullMatchHarnessSanityWarning): string {
  switch (warning) {
    case "SINGLE_RUN_NOT_GLOBAL_ECONOMY":
      return "run déterministe unique";
    case "INFLATED_SINGLE_RUN_SCORE":
      return "score local élevé";
    case "POSSIBLE_SEGMENT_PATTERN_REPETITION":
    case "MISSING_SEGMENT_STATE_PROPAGATION":
    case "MISSING_MOMENTUM_VARIATION":
      return "répétition de segments";
    case "REPETITIVE_KEY_MOMENTS":
      return "moments clés répétitifs";
    case "FLAT_FATIGUE_SIGNAL":
    case "MISSING_FATIGUE_PROPAGATION":
      return "fatigue peu différenciée";
    case "ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN":
    case "ZERO_SCORING_EVENTS_FOR_ONE_TEAM":
    case "HIGH_SCORING_EVENT_COUNT_SINGLE_TEAM":
    case "SCORING_EVENTS_CLUSTERED_IN_SAME_ZONE":
    case "SCORING_EVENTS_CLUSTERED_IN_SAME_EVENT_FAMILY":
    case "SCORING_EVENTS_CLUSTERED_IN_SAME_SEGMENT_PATTERN":
    case "DOMINATED_TEAM_HAS_DANGER_WITHOUT_SCORE":
    case "DOMINATED_TEAM_HAS_PRESSURE_WITHOUT_CONVERSION":
    case "DOMINATED_TEAM_HIGH_LOAD_NO_PAYOFF":
      return "domination scoring locale";
  }
}

export function coachFacingHarnessWarningSummary(warnings: readonly FullMatchHarnessSanityWarning[]): string {
  const themes = [...new Set(warnings.map(warningTheme))].slice(0, 4).join(", ");

  return normalizeCoachFacingCopy(
    `Ce run déterministe unique révèle un signal de plausibilité du harnais (${themes}). Il s’agit d’un avertissement de lecture du rapport, pas d’un verdict global sur l’économie du score : la référence reste l’économie validée sur 50 matchs.`,
  );
}

export function coachFacingScoringDominanceSummary(dominance: FullMatchScoringDominanceReport): string {
  const dominantTeam = teamLabel(dominance.dominantTeamId, "l'équipe dominante");
  const dominatedTeam = teamLabel(dominance.dominatedTeamId, "l'adversaire");
  const dominantScoring = dominance.scoringEventsByTeam.find((team) => team.teamId === dominance.dominantTeamId);
  const dominatedScoring = dominance.scoringEventsByTeam.find((team) => team.teamId === dominance.dominatedTeamId);
  const dominantCount = dominantScoring?.scoringEventCount ?? 0;
  const dominatedCount = dominatedScoring?.scoringEventCount ?? 0;
  const dominatedClause = dominatedCount === 0
    ? `${dominatedTeam} n’a converti aucun événement de score`
    : `${dominatedTeam} a converti ${dominatedCount} événement${dominatedCount === 1 ? "" : "s"} de score pour ${dominatedScoring?.points ?? 0} point${(dominatedScoring?.points ?? 0) === 1 ? "" : "s"}, mais reste nettement derrière`;

  return normalizeCoachFacingCopy(
    `${dominantTeam} a converti ${dominantCount} actions décisives tandis que ${dominatedClause}. Ce run déterministe unique révèle une domination scoring locale. Il s’agit d’un signal de plausibilité du harnais, pas d’un verdict global sur l’économie du score.`,
  );
}

export function coachFacingEvidenceSummary(summary: string): string {
  return normalizeCoachFacingCopy(summary);
}
