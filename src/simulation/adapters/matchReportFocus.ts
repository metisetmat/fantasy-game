import type { MatchInput, TrainingFocusSuggestion } from "../../contracts/engineToCoach";
import type { MatchEvidenceCategory, MatchEvidenceFact } from "./matchReportEvidence";

const FALLBACK_FOCUS_TITLE = "Finaliser l'adaptation du contrat moteur";

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
      return "Relire la consommation workbench experimentale";
    case "WORKBENCH_CHAIN_SEGMENT_CONTEXT":
      return "Relire le contexte segmentaire workbench experimental";
    case "WORKBENCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE":
      return "Relire l'influence candidate-route workbench experimentale";
    case "WORKBENCH_CHAIN_SHADOW_ROUTE_SELECTION":
      return "Relire la selection shadow de route workbench experimentale";
    case "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SELECTION":
      return "Relire la selection controlee de segment workbench experimentale";
    case "WORKBENCH_CHAIN_SEGMENT_ROUTE_INPUT":
      return "Relire l'input de route segmentaire workbench experimental";
    case "WORKBENCH_CHAIN_CONTROLLED_MINIMATCH_ROUTE_SOURCE":
      return "Relire la source de route controlee mini-match experimentale";
    case "WORKBENCH_CHAIN_LIVE_SELECTION_OVERRIDE_GUARD":
      return "Relire le garde d'override de selection live experimental";
    case "WORKBENCH_CHAIN_ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT":
      return "Relire l'experience mini-match isolee avec override";
    case "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_REPLAY_COMPARISON":
      return "Relire la comparaison de replay controle du segment";
    case "WORKBENCH_CHAIN_REAL_ISOLATED_SEGMENT_REPLAY":
      return "Relire les evenements de replay isole du segment";
    case "WORKBENCH_CHAIN_CONTROLLED_ROUTE_RESOLUTION_SANDBOX":
      return "Relire la sandbox de resolution controlee de route";
    case "WORKBENCH_CHAIN_SANDBOX_SCORING_OPPORTUNITY_MODEL":
      return "Relire le modele sandbox d'opportunite de scoring";
    case "WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_CANDIDATE":
      return "Relire le candidat sandbox d'evenement de scoring";
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
        reason: "Signal encore partiel : cette analyse sera renforcée quand les plans tactiques seront davantage branchés au moteur.",
      },
    ];
  }

  return [
    {
      focusId: `${primaryFact.factId}-focus`,
      title: focusTitleForFact(primaryFact),
      reason: `${primaryFact.summary} Signal encore partiel : cette analyse sera renforcée quand les plans tactiques seront davantage branchés au moteur.`,
    },
  ];
}
