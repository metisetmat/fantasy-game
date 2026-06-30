import type { CoachReadableCausalityNarrative, OfficialMatchCausalityEvidenceFact } from "./officialMatchAttributeRoleFatigueCausalityTypes";

function confidenceLabel(confidence: OfficialMatchCausalityEvidenceFact["confidence"]): string {
  switch (confidence) {
    case "high":
      return "lien visible";
    case "medium":
      return "piste solide";
    case "low":
      return "piste a confirmer";
  }
}

function sentence(fact: OfficialMatchCausalityEvidenceFact): string {
  const limit = fact.confidence === "low" ? " sans en faire une certitude" : "";

  return `${fact.causeLabel} pese sur ${fact.effectLabel} (${confidenceLabel(fact.confidence)}, preuve: ${fact.linkedOfficialEventIds[0]})${limit}.`;
}

export function buildCoachReadableCausalityNarrative(input: {
  readonly facts: readonly OfficialMatchCausalityEvidenceFact[];
  readonly officialScore: string;
}): CoachReadableCausalityNarrative {
  const strongFacts = input.facts
    .filter((fact) => fact.confidence !== "low")
    .slice(0, 3);
  const fallbackFacts = input.facts.slice(0, 3);
  const exportFacts = strongFacts.length >= 2 ? strongFacts : fallbackFacts;
  const detailedFacts = input.facts.slice(0, 6);
  const playerFacts = input.facts.filter((fact) => fact.primaryPlayerId !== undefined).slice(0, 3);
  const roleFacts = input.facts.filter((fact) => fact.role !== undefined).slice(0, 3);
  const fatigueFacts = input.facts.filter((fact) => fact.causalityType === "fatigue" || fact.causalityType === "mental_freshness").slice(0, 2);
  const strategyFacts = input.facts.filter((fact) =>
    fact.causalityType === "tactical_plan" ||
    fact.causalityType === "pressure" ||
    fact.causalityType === "zone_access"
  ).slice(0, 3);

  return {
    shortCausalNarrative: exportFacts.map(sentence).join(" "),
    detailedCausalNarrative: detailedFacts.map(sentence).join(" "),
    coachFacingCausalSummary: exportFacts
      .map((fact) => `${fact.causeLabel} pese sur ${fact.effectLabel}; source officielle ${fact.linkedOfficialEventIds[0]}; confiance ${fact.confidence}.`)
      .join(" "),
    playerImpactSummary: playerFacts.length === 0
      ? "Aucun impact joueur n'est affirme sans lien officiel joueur-evenement."
      : playerFacts.map((fact) => `${fact.primaryPlayerId} (${fact.role ?? "role non precise"}) : ${fact.effectLabel}.`).join(" "),
    roleImpactSummary: roleFacts.length === 0
      ? "Aucun role n'est transforme en certitude sans joueur et evenement officiel."
      : roleFacts.map((fact) => `${fact.role}: ${fact.causeLabel} vers ${fact.effectLabel}.`).join(" "),
    fatigueImpactSummary: fatigueFacts.length === 0
      ? "Fatigue visible, causalite non prouvee ou non disponible dans les signaux officiels."
      : fatigueFacts.map((fact) => `${fact.causeLabel}: ${fact.limitationNote}`).join(" "),
    strategyImpactSummary: strategyFacts.length === 0
      ? "La strategie reste lue seulement quand les evenements officiels la soutiennent."
      : strategyFacts.map((fact) => `${fact.causeLabel} explique prudemment ${fact.effectLabel}.`).join(" "),
    limitations: [
      "Causalite evidence-limited: chaque phrase renvoie a un event officiel.",
      `Le score ${input.officialScore} reste explique uniquement par les score_change officiels.`,
      "Les diagnostics, batchs et sandbox restent exclus de la verite officielle.",
    ],
  };
}
