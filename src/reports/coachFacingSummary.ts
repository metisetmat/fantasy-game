import { normalizeCoachFacingCopy } from "./coachCopyQuality";

const TECHNICAL_CONTEXT_FRAGMENTS = [
  "Final danger",
  "Score context",
  "Plan influence",
  "Adapter influence",
  "Scoring summary converted",
  "Official tactical plans influence",
  "FULL_MATCH_HARNESS_SINGLE_RUN",
  "run_match_adapter",
  "mini_match_sequence",
  "interaction_sequence",
  "temporary_control_blitz_mapping",
  "scoring_type_",
  "momentum_",
] as const;

const ALLOWED_UPPERCASE_TOKENS = new Set([
  "CONTROL",
  "BLITZ",
  "LOW",
  "MEDIUM",
  "HIGH",
  "PASS",
  "FAIL",
]);

function teamLabel(teamId: string | undefined): string {
  return teamId === undefined || teamId.length === 0 ? "l'equipe" : teamId.toUpperCase();
}

function zoneLabel(zone: string | undefined): string {
  return zone === undefined || zone.length === 0 ? "la zone concernee" : zone;
}

function containsRawEnumToken(value: string): boolean {
  const enumTokens = value.match(/\b[A-Z][A-Z0-9]+(?:_[A-Z0-9]+)+\b/g) ?? [];

  return enumTokens.some((token) => !ALLOWED_UPPERCASE_TOKENS.has(token));
}

export function isTechnicalContextLeak(value: string): boolean {
  return TECHNICAL_CONTEXT_FRAGMENTS.some((fragment) => value.includes(fragment)) || containsRawEnumToken(value);
}

export function assertNoTechnicalContextLeak(value: string, context: string): void {
  if (isTechnicalContextLeak(value)) {
    throw new Error(`${context} contains technical context leak: ${value}`);
  }
}

function fallbackSummary(input: {
  readonly title: string;
  readonly teamId?: string;
  readonly zone?: string;
  readonly category?: string;
}): string {
  const team = teamLabel(input.teamId);
  const zone = zoneLabel(input.zone);

  switch (input.category) {
    case "PRESSURE_WITHOUT_CONVERSION":
      return `${team} subit une sequence de pression en ${zone} sans reussir a transformer ce volume en evenement de score.`;
    case "SCORING_CONVERSION":
      return `${team} convertit une action decisive en points. Le score evolue, mais ce moment reste un fait local du run de harnais.`;
    case "MOMENTUM_SHIFT":
      return `L'elan du match bascule dans une zone ou ${team} subit la pression sans convertir.`;
    case "DANGER_CREATION":
      return `${team} cree une sequence dangereuse en ${zone}, avec une pression territoriale visible.`;
    case "TERRITORIAL_PRESSURE":
      return `${team} concentre une pression territoriale visible en ${zone}.`;
    case "POSSESSION_INSTABILITY":
      return `${team} traverse une sequence instable sous pression en ${zone}.`;
    case "FATIGUE_LOAD":
      return `La charge physique devient visible et influence la stabilite collective autour de ${zone}.`;
    case "TACTICAL_PLAN_SIGNAL":
      return `${team} laisse apparaitre un signal de plan de match lisible en ${zone}.`;
    case "HARNESS_PLAUSIBILITY_WARNING":
      return "Ce moment sert de signal de lecture du harnais: il aide a evaluer la plausibilite du recit sans juger l'economie globale.";
    default:
      if (input.title.toLowerCase().includes("score") || input.title.toLowerCase().includes("decisive")) {
        return `${team} convertit une action decisive en points dans ce run.`;
      }
      return `${team} produit une sequence tactique visible en ${zone}.`;
  }
}

export function coachFacingKeyMomentSummary(input: {
  readonly title: string;
  readonly evidenceSummary?: string;
  readonly eventContext?: string;
  readonly teamId?: string;
  readonly zone?: string;
  readonly category?: string;
}): string {
  const preferredSummary =
    input.evidenceSummary !== undefined && !isTechnicalContextLeak(input.evidenceSummary)
      ? input.evidenceSummary
      : fallbackSummary(input);

  return normalizeCoachFacingCopy(preferredSummary);
}

export function coachFacingWarningSummaryByType(input: {
  readonly warningType: string;
  readonly fallbackSummary: string;
  readonly dominantTeamId?: string;
  readonly dominatedTeamId?: string;
  readonly score?: { readonly home: number; readonly away: number };
}): string {
  const dominantTeam = teamLabel(input.dominantTeamId);
  const dominatedTeam = teamLabel(input.dominatedTeamId);
  const summary = (() => {
    switch (input.warningType) {
      case "FULL_MATCH_HARNESS_SINGLE_RUN":
        return "Ce rapport vient d'un run deterministe unique. Il sert a tester la lisibilite du harnais, pas a juger l'economie globale du score.";
      case "INFLATED_SINGLE_RUN_SCORE":
        return "Le score local est tres eleve dans ce run. C'est un signal de plausibilite du harnais a surveiller, pas une raison de modifier les points.";
      case "REPEATED_SEGMENT_PATTERN":
        return "Plusieurs segments semblent produire des motifs similaires. Le rapport doit donc etre lu comme un echantillon de harnais encore repetitif.";
      case "ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN":
        return `${dominantTeam} concentre les conversions dans ce run, tandis que ${dominatedTeam} ne transforme pas ses sequences en points.`;
      case "ZERO_SCORING_EVENTS_FOR_ONE_TEAM":
        return `${dominatedTeam} ne convertit aucun evenement de score dans ce run, malgre des sequences de pression et de progression visibles.`;
      case "LOW_EVENT_FAMILY_DIVERSITY":
        return "Les evenements visibles sont encore trop concentres autour de quelques familles. Le harnais doit produire plus de variete pour enrichir le recit coach.";
      case "FATIGUE_SIGNAL_FLAT":
        return "Le signal de fatigue reste trop plat dans ce run. Il faut le lire comme une limite de harnais, pas comme une preuve d'economie globale.";
      case "HIGH_LOAD_WITH_NO_PAYOFF":
        return `${dominatedTeam} supporte une charge elevee sans payoff scoring. Le signal utile est de verifier si le pressing cree du volume sterile ou une route non convertissante.`;
      case "REPORT_COPY_LIMITATION":
        return "La copie du rapport reste partiellement limitee par l'etat actuel des donnees exposees au coach.";
      case "ADAPTER_LIMITATION":
        return "L'adaptateur produit un signal utile mais encore partiel. Les details techniques restent disponibles pour le diagnostic interne.";
      default:
        return isTechnicalContextLeak(input.fallbackSummary)
          ? "Ce warning signale une limite de lecture du rapport et doit rester separe des conclusions d'economie globale."
          : input.fallbackSummary;
    }
  })();

  return normalizeCoachFacingCopy(summary);
}
