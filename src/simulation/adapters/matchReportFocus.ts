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
