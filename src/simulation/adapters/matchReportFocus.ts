import type { MatchInput, TrainingFocusSuggestion } from "../../contracts/engineToCoach";
import type { MatchEvidenceCategory, MatchEvidenceFact } from "./matchReportEvidence";

const FALLBACK_FOCUS_TITLE = "Finaliser l'adaptation du contrat moteur";
const PARTIAL_SIGNAL_REASON = "Signal encore partiel : cette analyse sera renforcée quand les plans tactiques seront davantage branchés au moteur.";

function primaryFactZone(fact: MatchEvidenceFact): string {
  return fact.affectedZones[0] ?? "Z3-C";
}

function priorityForCategory(category: MatchEvidenceCategory): number {
  switch (category) {
    case "SCORING_CONVERSION":
      return 100;
    case "PRESSURE_WITHOUT_CONVERSION":
      return 95;
    case "DANGER_CREATION":
      return 90;
    case "POSSESSION_INSTABILITY":
      return 80;
    case "TERRITORIAL_PRESSURE":
      return 70;
    case "FATIGUE_LOAD":
      return 65;
    case "MOMENTUM_SHIFT":
      return 60;
    case "TACTICAL_PLAN_SIGNAL":
      return 55;
    case "WORKBENCH_CHAIN_CONSUMPTION":
      return 52;
    case "WORKBENCH_CHAIN_SEGMENT_CONTEXT":
      return 51;
    case "WORKBENCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE":
      return 50;
    case "WORKBENCH_CHAIN_SHADOW_ROUTE_SELECTION":
      return 49;
    case "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SELECTION":
      return 48;
    case "WORKBENCH_CHAIN_SEGMENT_ROUTE_INPUT":
      return 47;
    case "WORKBENCH_CHAIN_CONTROLLED_MINIMATCH_ROUTE_SOURCE":
      return 46;
    case "WORKBENCH_CHAIN_LIVE_SELECTION_OVERRIDE_GUARD":
      return 45;
    case "WORKBENCH_CHAIN_ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT":
      return 44;
    case "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_REPLAY_COMPARISON":
      return 43;
    case "WORKBENCH_CHAIN_REAL_ISOLATED_SEGMENT_REPLAY":
      return 42;
    case "WORKBENCH_CHAIN_CONTROLLED_ROUTE_RESOLUTION_SANDBOX":
      return 41;
    case "WORKBENCH_CHAIN_SANDBOX_SCORING_OPPORTUNITY_MODEL":
      return 40;
    case "WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_CANDIDATE":
      return 39;
    case "WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_RESOLUTION":
      return 38;
    case "WORKBENCH_CHAIN_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_SANDBOX":
      return 37;
    case "WORKBENCH_CHAIN_GOALKEEPER_RESPONSE_MODEL_SANDBOX":
      return 36;
    case "WORKBENCH_CHAIN_REBOUND_SECOND_CHANCE_SANDBOX":
      return 35;
    case "WORKBENCH_CHAIN_MULTI_ACTION_CONTINUATION_SANDBOX":
      return 34;
    case "WORKBENCH_CHAIN_SANDBOX_SEQUENCE_REPLAY":
      return 33;
    case "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SANDBOX_TIMELINE":
      return 32;
    case "WORKBENCH_CHAIN_OFFICIAL_TIMELINE_DIFF_VIEW":
      return 31;
    case "WORKBENCH_CHAIN_COACH_FACING_TIMELINE_REVIEW":
      return 30;
    case "WORKBENCH_CHAIN_SANDBOX_DECISION_PANEL":
      return 29;
    case "WORKBENCH_CHAIN_SANDBOX_DECISION_EVIDENCE_CALIBRATION":
      return 28;
    case "WORKBENCH_CHAIN_SANDBOX_DECISION_BATCH_CONFIDENCE_CALIBRATION":
      return 27;
    case "WORKBENCH_CHAIN_MULTI_SCENARIO_COACH_TEST_PLAN":
      return 26;
    case "WORKBENCH_CHAIN_SELECTION_PREVIEW":
      return 25;
    case "WORKBENCH_CHAIN_SELECTION_PREVIEW_TRACE_BACKING":
      return 25;
    case "WORKBENCH_CHAIN_SELECTION_PREVIEW_COACH_COPY":
      return 25;
    case "WORKBENCH_CHAIN_SELECTION_PREVIEW_PROFILE_VIEW":
      return 25;
    case "WORKBENCH_CHAIN_PLAYER_MATCHUP_VIEW":
    case "WORKBENCH_CHAIN_PLAYER_MATCHUP_CALIBRATION":
    case "WORKBENCH_CHAIN_ROSTER_COVERAGE_MATCHUP":
    case "WORKBENCH_CHAIN_PLAYER_CANDIDATE_COMPARISON_VIEW":
      return 25;
    case "WORKBENCH_CHAIN_COACH_PRODUCT_REPORT_VIEW":
    case "WORKBENCH_CHAIN_COACH_PRODUCT_REPORT_POLISH":
    case "WORKBENCH_CHAIN_COACH_REPORT_EXPORT_SNAPSHOT":
      return 25;
    case "WORKBENCH_CHAIN_MATCH_EVENT_TRACE_SPINE":
      return 24;
    case "WORKBENCH_CHAIN_MATCH_TRACE_AGGREGATOR":
      return 23;
    case "WORKBENCH_CHAIN_COACH_REPORT_FROM_TRACE_AGGREGATES":
    case "WORKBENCH_CHAIN_COACH_REPORT_V1_VISUALIZATION":
    case "WORKBENCH_CHAIN_COACH_REPORT_V1_INFORMATION_HIERARCHY":
    case "WORKBENCH_CHAIN_COACH_REPORT_V1_LEGACY_CLEANUP":
      return 22;
    case "WORKBENCH_CHAIN_FULL_MATCH_TRACE_VALIDATION":
    case "WORKBENCH_CHAIN_PROFILE_SIGNAL_CALIBRATION":
      return 21;
    case "HARNESS_PLAUSIBILITY_WARNING":
      return 50;
  }
}

function selectPrimaryFact(facts: readonly MatchEvidenceFact[]): MatchEvidenceFact | null {
  const coachVisibleFacts = facts.filter((fact) => fact.coachVisible);
  const sortedFacts = [...coachVisibleFacts].sort(
    (a, b) => priorityForCategory(b.category) - priorityForCategory(a.category) || b.strength - a.strength,
  );

  return sortedFacts[0] ?? null;
}

function focusTitleForFact(fact: MatchEvidenceFact): string {
  switch (fact.category) {
    case "DANGER_CREATION":
      return `Répéter les entrées dangereuses en ${primaryFactZone(fact)}`;
    case "POSSESSION_INSTABILITY":
      return `Stabiliser la possession sous pression en ${primaryFactZone(fact)}`;
    case "SCORING_CONVERSION":
      return "Sécuriser la séquence qui mène au score";
    case "TERRITORIAL_PRESSURE":
      return `Préparer une sortie de pression depuis ${primaryFactZone(fact)}`;
    case "PRESSURE_WITHOUT_CONVERSION":
      return `Transformer la pression de ${(fact.teamId ?? "l'équipe").toUpperCase()} en plateforme de conversion`;
    case "FATIGUE_LOAD":
      return `Gérer la charge autour de ${primaryFactZone(fact)}`;
    case "MOMENTUM_SHIFT":
      return "Stabiliser l'élan après les bascules du match";
    case "TACTICAL_PLAN_SIGNAL":
      return "Relire le plan de match dans les zones visibles";
    case "WORKBENCH_CHAIN_CONSUMPTION":
      return "Relire la consommation workbench expérimentale";
    case "WORKBENCH_CHAIN_SEGMENT_CONTEXT":
      return "Relire le contexte segmentaire workbench expérimental";
    case "WORKBENCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE":
      return "Relire l'influence candidate-route workbench expérimentale";
    case "WORKBENCH_CHAIN_SHADOW_ROUTE_SELECTION":
      return "Relire la sélection shadow de route workbench expérimentale";
    case "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SELECTION":
      return "Relire la sélection contrôlée de segment workbench expérimentale";
    case "WORKBENCH_CHAIN_SEGMENT_ROUTE_INPUT":
      return "Relire l'input de route segmentaire workbench expérimental";
    case "WORKBENCH_CHAIN_CONTROLLED_MINIMATCH_ROUTE_SOURCE":
      return "Relire la source de route contrôlée mini-match expérimentale";
    case "WORKBENCH_CHAIN_LIVE_SELECTION_OVERRIDE_GUARD":
      return "Relire le garde d'override de sélection live expérimental";
    case "WORKBENCH_CHAIN_ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT":
      return "Relire l'expérience mini-match isolée avec override";
    case "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_REPLAY_COMPARISON":
      return "Relire la comparaison de replay contrôlé du segment";
    case "WORKBENCH_CHAIN_REAL_ISOLATED_SEGMENT_REPLAY":
      return "Relire les événements de replay isolé du segment";
    case "WORKBENCH_CHAIN_CONTROLLED_ROUTE_RESOLUTION_SANDBOX":
      return "Relire la sandbox de résolution contrôlée de route";
    case "WORKBENCH_CHAIN_SANDBOX_SCORING_OPPORTUNITY_MODEL":
      return "Relire le modèle sandbox d'opportunité de scoring";
    case "WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_CANDIDATE":
      return "Relire le candidat sandbox d'événement de scoring";
    case "WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_RESOLUTION":
      return "Relire la résolution sandbox d'événement de scoring";
    case "WORKBENCH_CHAIN_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_SANDBOX":
      return "Relire la résolution de tir attributaire sandbox";
    case "WORKBENCH_CHAIN_GOALKEEPER_RESPONSE_MODEL_SANDBOX":
      return "Relire le modèle de réponse gardien sandbox";
    case "WORKBENCH_CHAIN_REBOUND_SECOND_CHANCE_SANDBOX":
      return "Relire le rebond et la seconde chance sandbox";
    case "WORKBENCH_CHAIN_MULTI_ACTION_CONTINUATION_SANDBOX":
      return "Relire la continuation multi-action sandbox";
    case "WORKBENCH_CHAIN_SANDBOX_SEQUENCE_REPLAY":
      return "Relire le replay de mini-séquence sandbox";
    case "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SANDBOX_TIMELINE":
      return "Relire la timeline sandbox contrôlée du segment";
    case "WORKBENCH_CHAIN_OFFICIAL_TIMELINE_DIFF_VIEW":
      return "Relire le diff read-only entre timeline officielle et sandbox";
    case "WORKBENCH_CHAIN_COACH_FACING_TIMELINE_REVIEW":
      return "Relire la timeline officielle face au sandbox";
    case "WORKBENCH_CHAIN_SANDBOX_DECISION_PANEL":
      return "Relire l'option coach proposée par le sandbox";
    case "WORKBENCH_CHAIN_SANDBOX_DECISION_EVIDENCE_CALIBRATION":
      return "Relire la confiance de l'option coach sandbox";
    case "WORKBENCH_CHAIN_SANDBOX_DECISION_BATCH_CONFIDENCE_CALIBRATION":
      return "Relire la confiance multi-scénarios de l'option sandbox";
    case "WORKBENCH_CHAIN_MULTI_SCENARIO_COACH_TEST_PLAN":
      return "Relire le plan de test coach multi-scénarios";
    case "WORKBENCH_CHAIN_SELECTION_PREVIEW":
      return "Relire la prévisualisation de sélection";
    case "WORKBENCH_CHAIN_SELECTION_PREVIEW_TRACE_BACKING":
      return "Relire l'appui des traces a la previsualisation";
    case "WORKBENCH_CHAIN_SELECTION_PREVIEW_COACH_COPY":
      return "Relire les profils Ã  observer";
    case "WORKBENCH_CHAIN_SELECTION_PREVIEW_PROFILE_VIEW":
      return "Relire les profils Ã  observer";
    case "WORKBENCH_CHAIN_COACH_PRODUCT_REPORT_VIEW":
      return "Relire le rapport coach produit";
    case "WORKBENCH_CHAIN_COACH_PRODUCT_REPORT_POLISH":
      return "Relire le polish du rapport coach produit";
    case "WORKBENCH_CHAIN_COACH_REPORT_EXPORT_SNAPSHOT":
      return "Relire l'export partageable du rapport coach";
    case "WORKBENCH_CHAIN_MATCH_EVENT_TRACE_SPINE":
      return "Relire la colonne de traces de match";
    case "WORKBENCH_CHAIN_MATCH_TRACE_AGGREGATOR":
      return "Relire les agrégats de traces de match";
    case "WORKBENCH_CHAIN_COACH_REPORT_FROM_TRACE_AGGREGATES":
      return "Relire le rapport coach depuis les agrégats officiels";
    case "WORKBENCH_CHAIN_COACH_REPORT_V1_VISUALIZATION":
      return "Relire la lecture visuelle V1 des agrégats officiels";
    case "WORKBENCH_CHAIN_COACH_REPORT_V1_INFORMATION_HIERARCHY":
      return "Relire la hiérarchie visuelle V1 du rapport coach";
    case "WORKBENCH_CHAIN_COACH_REPORT_V1_LEGACY_CLEANUP":
      return "Relire le nettoyage legacy du rapport coach V1";
    case "WORKBENCH_CHAIN_FULL_MATCH_TRACE_VALIDATION":
      return "Relire la validation multi-profils des traces full-match";
    case "WORKBENCH_CHAIN_PROFILE_SIGNAL_CALIBRATION":
      return "Relire la calibration des signaux de profils";
    case "WORKBENCH_CHAIN_PLAYER_MATCHUP_CALIBRATION":
      return "Relire la calibration des joueurs a etudier";
    case "WORKBENCH_CHAIN_PLAYER_MATCHUP_VIEW":
      return "Relire les joueurs Ã  Ã©tudier";
    case "WORKBENCH_CHAIN_ROSTER_COVERAGE_MATCHUP":
      return "Relire la couverture roster des joueurs a etudier";
    case "WORKBENCH_CHAIN_PLAYER_CANDIDATE_COMPARISON_VIEW":
      return "Relire la comparaison des candidats a etudier";
    case "HARNESS_PLAUSIBILITY_WARNING":
      return "Lire le signal de harnais sans changer l'économie du score";
  }
}

export function suggestedFocusFromEvidence(input: {
  readonly matchInput: MatchInput;
  readonly facts: readonly MatchEvidenceFact[];
}): readonly TrainingFocusSuggestion[] {
  const primaryFact = selectPrimaryFact(input.facts);

  if (primaryFact === null) {
    return [
      {
        focusId: `${input.matchInput.matchId}-adapter-focus`,
        title: FALLBACK_FOCUS_TITLE,
        reason: PARTIAL_SIGNAL_REASON,
      },
    ];
  }

  return [
    {
      focusId: `${primaryFact.factId}-focus`,
      title: focusTitleForFact(primaryFact),
      reason: `${primaryFact.summary} ${PARTIAL_SIGNAL_REASON}`,
    },
  ];
}
