import type { MatchInput, TrainingFocusSuggestion } from "../../contracts/engineToCoach";
import type { MatchEvidenceCategory, MatchEvidenceFact } from "./matchReportEvidence";

const FALLBACK_FOCUS_TITLE = "Finaliser l'adaptation du contrat moteur";

function priorityForCategory(category: MatchEvidenceCategory): number {
  switch (category) {
    case "converted_scoring":
      return 100;
    case "dominated_team_no_payoff":
      return 95;
    case "high_danger_sequences":
      return 90;
    case "unstable_under_pressure":
      return 80;
    case "visible_pressure_zone":
      return 70;
  }
}

function selectPrimaryFact(facts: readonly MatchEvidenceFact[]): MatchEvidenceFact | null {
  const sortedFacts = [...facts].sort(
    (a, b) => priorityForCategory(b.category) - priorityForCategory(a.category) || b.strength - a.strength,
  );

  return sortedFacts[0] ?? null;
}

function focusTitleForFact(fact: MatchEvidenceFact): string {
  switch (fact.category) {
    case "high_danger_sequences":
      return `Répéter les entrées dangereuses en ${fact.zone}`;
    case "unstable_under_pressure":
      return `Stabiliser la possession sous pression en ${fact.zone}`;
    case "converted_scoring":
      return "Sécuriser la séquence qui mène au score";
    case "visible_pressure_zone":
      return `Préparer une sortie de pression depuis ${fact.zone}`;
    case "dominated_team_no_payoff":
      return `Transformer la pression de ${fact.teamId.toUpperCase()} en plateforme de conversion`;
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
