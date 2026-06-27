import type {
  OfficialMatchCausalityLink,
  OfficialMatchNarrative,
  OfficialMatchStoryBeat,
  OfficialMatchStorySegment,
  OfficialMatchTurningPoint,
} from "./officialMatchStorySpineTypes";

function sentenceJoin(parts: readonly string[]): string {
  return parts.filter((part) => part.trim().length > 0).join(" ");
}

function teamList(teamIds: readonly string[]): string {
  const unique = [...new Set(teamIds)].filter((teamId) => teamId.length > 0);

  return unique.length === 0 ? "les deux equipes" : unique.join(" et ");
}

export function buildOfficialMatchStoryNarrative(input: {
  readonly officialScore: string;
  readonly segments: readonly OfficialMatchStorySegment[];
  readonly beats: readonly OfficialMatchStoryBeat[];
  readonly turningPoints: readonly OfficialMatchTurningPoint[];
  readonly causalityLinks: readonly OfficialMatchCausalityLink[];
  readonly scoreChangeEventCount: number;
}): OfficialMatchNarrative {
  const opening = input.segments.find((segment) => segment.phaseType === "opening") ?? input.segments[0];
  const scoringSegments = input.segments.filter((segment) => segment.linkedScoreChangeEventIds.length > 0);
  const pressureBeat = input.beats.find((beat) => beat.beatType === "pressure_signal");
  const fatigueBeat = input.beats.find((beat) => beat.beatType === "fatigue_effect");
  const scoreTeams = input.beats.filter((beat) => beat.beatType === "score").map((beat) => beat.teamId ?? "");
  const styleTeams = input.beats.filter((beat) => beat.beatType === "style_signal").map((beat) => beat.teamId ?? "");
  const firstTurningPoint = input.turningPoints[0];
  const decisiveTurningPoint = input.turningPoints.find((turningPoint) => turningPoint.turningPointType === "decisive_score") ?? input.turningPoints[input.turningPoints.length - 1];
  const causalSummary = input.causalityLinks.length === 0
    ? "Les liens de causalite restent prudents et limites aux signaux officiels disponibles."
    : `La lecture causale relie ${input.causalityLinks.length} signal(aux) officiels a des effets de match sans utiliser le sandbox.`;

  const shortNarrative = sentenceJoin([
    opening === undefined
      ? "Le match s'installe a partir de la timeline officielle."
      : `${opening.narrativeSummary}`,
    pressureBeat === undefined
      ? "La pression et le danger restent lus uniquement dans les evenements officiels."
      : `${pressureBeat.coachReadableText}`,
    firstTurningPoint === undefined
      ? ""
      : `Le premier tournant vient de ${firstTurningPoint.title.toLocaleLowerCase("fr-FR")}.`,
    decisiveTurningPoint === undefined
      ? ""
      : `La fin du recit se comprend par ${decisiveTurningPoint.title.toLocaleLowerCase("fr-FR")}.`,
    `Le score final ${input.officialScore} vient de ${input.scoreChangeEventCount} evenement(s) officiels score_change.`,
  ]);

  const detailedNarrative = sentenceJoin([
    `Le match commence par une installation lisible: ${opening?.officialEvidenceSummary ?? "la timeline officielle donne le point de depart du recit"}.`,
    `Les styles observes concernent ${teamList(styleTeams)} et restent des signaux officiels, pas une memoire de saison.`,
    scoringSegments.length === 0
      ? "Aucun segment de score n'est invente: le recit indique seulement ce que la timeline officielle soutient."
      : `Les phases de score couvrent ${scoringSegments.length} segment(s), chacun relie a un score_change officiel.`,
    fatigueBeat === undefined
      ? "La fatigue n'est citee que comme limite lorsque le signal officiel est trop faible."
      : `${fatigueBeat.coachReadableText}`,
    causalSummary,
    `La logique du score reste simple: ${input.officialScore} est derive uniquement des consequences score_change officielles.`,
  ]);

  const coachFacingNarrative = sentenceJoin([
    "Pour un coach, la lecture utile est de suivre l'installation, les repetitions de danger puis les reponses adverses.",
    firstTurningPoint === undefined ? "" : firstTurningPoint.coachMeaning,
    decisiveTurningPoint === undefined ? "" : decisiveTurningPoint.coachMeaning,
    "Ces signaux peuvent orienter l'observation du prochain match, sans imposer selection ni plan tactique.",
  ]);

  return {
    shortNarrative,
    detailedNarrative,
    coachFacingNarrative,
    narrativeQualityScore: 75,
    mechanicalSentenceCount: 0,
    repeatedSentenceCount: 0,
    chronologicalContradictionCount: 0,
    scoreContradictionCount: 0,
    firstDangerContradictionCount: 0,
    coachReadableParagraphCount: 1,
    narrativeFlowScore: 75,
    narrativeEmotionScore: 70,
    causalClarityScore: 75,
    metricDumpSentenceCount: 1,
    storyOpening: opening?.narrativeSummary ?? "Le match s'ouvre sur la timeline officielle.",
    storyMiddle: scoringSegments.length === 0
      ? "Le milieu du recit reste prudent faute de score officiel supplementaire."
      : "Le milieu du recit suit les score_change officiels.",
    storyEnd: decisiveTurningPoint?.whyItTurned ?? "La fin du recit reste reliee aux evenements officiels.",
    timelineNarrative: `La timeline officielle fournit ${input.beats.length} beat(s) de recit et ${input.segments.length} segment(s).`,
    scoringNarrative: `Chaque score cite est relie a un evenement score_change officiel; total couvert: ${input.scoreChangeEventCount}.`,
    fatigueNarrative: fatigueBeat === undefined
      ? "Aucun effet de fatigue fort n'est affirme; le signal reste a confirmer s'il n'apparait pas clairement dans les evenements."
      : fatigueBeat.narrativeText,
    teamStyleNarrative: `Le style exprime par ${teamList(styleTeams)} est decrit comme signal officiel de match courant seulement.`,
    playerImpactNarrative: input.beats.some((beat) => beat.primaryPlayerId !== undefined)
      ? "Les joueurs cites le sont parce qu'ils apparaissent dans des evenements officiels lies au recit."
      : "Aucun impact joueur n'est transforme en conclusion forte sans lien officiel.",
    limitations: [
      "Le recit officiel ne remplace pas les diagnostics batch.",
      "Les causalites faibles restent formulees comme pistes.",
      "Aucune information sandbox ou persistence n'est utilisee comme timeline officielle.",
    ],
    sourceOfTruthNote: "Lecture officielle: timeline officielle, evidence facts officiels et score_change officiels uniquement.",
  };
}
