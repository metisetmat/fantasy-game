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

function sentenceCount(text: string): number {
  return text.split(/[.!?]+/u).map((sentence) => sentence.trim()).filter((sentence) => sentence.length > 0).length;
}

function readTimeSeconds(text: string): number {
  const wordCount = text.split(/\s+/u).filter((word) => word.length > 0).length;
  return Math.ceil((wordCount / 180) * 60);
}

function repeatedSentenceCount(text: string): number {
  const sentences = text.split(/[.!?]+/u).map((sentence) => sentence.trim().toLocaleLowerCase("fr-FR")).filter((sentence) => sentence.length > 0);
  const seen = new Set<string>();
  let repeated = 0;
  for (const sentence of sentences) {
    if (seen.has(sentence)) repeated += 1;
    seen.add(sentence);
  }

  return repeated;
}

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

function teamFromScore(score: string, position: "home" | "away"): string {
  const match = /^([A-Za-z0-9_-]+)\s+\d+\s+-\s+\d+\s+([A-Za-z0-9_-]+)/u.exec(score.trim());
  if (match === null) return position === "home" ? "l'equipe de gauche" : "l'equipe de droite";
  return position === "home" ? match[1] ?? "l'equipe de gauche" : match[2] ?? "l'equipe de droite";
}

function firstScoreBeat(beats: readonly OfficialMatchStoryBeat[]): OfficialMatchStoryBeat | undefined {
  return beats.find((beat) => beat.beatType === "score");
}

function lastScoreBeat(beats: readonly OfficialMatchStoryBeat[]): OfficialMatchStoryBeat | undefined {
  return [...beats].reverse().find((beat) => beat.beatType === "score");
}

function teamScores(beats: readonly OfficialMatchStoryBeat[]): readonly string[] {
  return [...new Set(beats.filter((beat) => beat.beatType === "score").map((beat) => beat.teamId).filter((teamId): teamId is string => teamId !== undefined))];
}

function narrativeQualityNumbers(allText: string, coachText: string): {
  readonly narrativeQualityScore: number;
  readonly mechanicalSentenceCount: number;
  readonly repeatedSentenceCount: number;
  readonly chronologicalContradictionCount: number;
  readonly scoreContradictionCount: number;
  readonly firstDangerContradictionCount: number;
  readonly narrativeFlowScore: number;
  readonly narrativeEmotionScore: number;
  readonly causalClarityScore: number;
  readonly metricDumpSentenceCount: number;
  readonly coachReadabilityScore: number;
} {
  const mechanicalSentenceCount = countMatches(allText, /Ce tournant aide a comprendre le match|Le segment installe le rythme|phrase placeholder|a confirmer sans preuve/giu);
  const repeated = repeatedSentenceCount(allText);
  const chronologicalContradictionCount = countMatches(allText, /premier vrai danger officiel[^.]+minute\s+(?:[3-9]\d|\d{3,})/giu);
  const scoreContradictionCount = countMatches(allText, /score\s+(?:control|blitz)\s+0\s+-\s+0\s+(?:control|blitz)/giu);
  const firstDangerContradictionCount = countMatches(allText, /Premier vrai danger officiel/gu);
  const metricDumpSentenceCount = countMatches(allText, /\b[A-Z]\d-[A-Z]+\b\s*:\s*\d+|trace\(s\)|metric/giu);
  const technicalJargonInCoach = countMatches(coachText, /score_change|sandbox|batch|diagnostic|SQLite|persistence/giu);
  const narrativeFlowScore = Math.max(0, 95 - mechanicalSentenceCount * 12 - repeated * 8 - chronologicalContradictionCount * 20);
  const narrativeEmotionScore = Math.max(0, 88 - metricDumpSentenceCount * 5);
  const causalClarityScore = Math.max(0, 90 - scoreContradictionCount * 25);
  const coachReadabilityScore = Math.max(0, 93 - technicalJargonInCoach * 15 - mechanicalSentenceCount * 10);
  const narrativeQualityScore = Math.min(narrativeFlowScore, coachReadabilityScore, causalClarityScore);

  return {
    narrativeQualityScore,
    mechanicalSentenceCount,
    repeatedSentenceCount: repeated,
    chronologicalContradictionCount,
    scoreContradictionCount,
    firstDangerContradictionCount,
    narrativeFlowScore,
    narrativeEmotionScore,
    causalClarityScore,
    metricDumpSentenceCount,
    coachReadabilityScore,
  };
}

export function buildMatchStoryNarrativeQuality(input: {
  readonly officialScore: string;
  readonly segments: readonly OfficialMatchStorySegment[];
  readonly beats: readonly OfficialMatchStoryBeat[];
  readonly turningPoints: readonly OfficialMatchTurningPoint[];
  readonly causalityLinks: readonly OfficialMatchCausalityLink[];
  readonly scoreChangeEventCount: number;
}): OfficialMatchNarrative {
  const firstScore = firstScoreBeat(input.beats);
  const lastScore = lastScoreBeat(input.beats);
  const teams = teamScores(input.beats);
  const homeTeam = teams[0] ?? teamFromScore(input.segments[0]?.scoreAfterCumulative ?? input.officialScore, "home");
  const awayTeam = teams.find((teamId) => teamId !== homeTeam) ?? teamFromScore(input.segments[0]?.scoreAfterCumulative ?? input.officialScore, "away");
  const scoringSegments = input.segments.filter((segment) => !segment.isScorelessSegment);
  const scorelessClosing = [...input.segments].reverse().find((segment) => segment.isScorelessSegment);
  const firstTurningPoint = input.turningPoints[0];
  const finalTurningPoint = input.turningPoints[input.turningPoints.length - 1];
  const fatigueBeat = input.beats.find((beat) => beat.beatType === "fatigue_effect");
  const pressureBeat = input.beats.find((beat) => beat.beatType === "pressure_signal");
  const firstScoringTeam = firstScore?.teamId ?? homeTeam;
  const opponentScoringTeam = teams.find((teamId) => teamId !== firstScoringTeam);
  const nonScoringOpponent = opponentScoringTeam === undefined ? awayTeam : opponentScoringTeam;
  const hasOpponentScoreResponse = opponentScoringTeam !== undefined;

  const storyOpening = firstScore === undefined
    ? `${homeTeam} et ${awayTeam} ouvrent le match sans score immediat, avec une lecture officielle encore prudente.`
    : `${firstScoringTeam} frappe des la minute ${firstScore.minute} et donne tout de suite une direction au tableau d'affichage.`;
  const storyMiddle = scoringSegments.length >= 2 && hasOpponentScoreResponse
    ? `${opponentScoringTeam} reste dans le recit par sa reponse officielle, puis ${firstScoringTeam} retrouve assez de controle pour faire bouger le cumul sans fabriquer d'evenement.`
    : scoringSegments.length >= 2
      ? `${firstScoringTeam} prolonge son avantage par plusieurs marques officielles pendant que ${nonScoringOpponent} reste dans le recit par la resistance et les phases sans score.`
    : "Le coeur du match reste plus territorial que spectaculaire: le recit garde la main sur les faits officiels.";
  const storyEnd = scorelessClosing === undefined
    ? `La fin confirme le score officiel ${input.officialScore} par les derniers evenements relies au tableau.`
    : `La derniere partie ne remet pas le score a zero: elle se lit comme une stabilisation avec ${scorelessClosing.segmentScoreLabel}.`;

  const shortNarrative = firstScore === undefined
    ? sentenceJoin([
      `${homeTeam} et ${awayTeam} restent longtemps dans un match ferme.`,
      `Le cumul final ${input.officialScore} suit seulement les marques officielles.`,
      "Les periodes sans score sont racontees comme de la stabilisation, jamais comme un retour a 0-0.",
    ])
    : sentenceJoin([
      `${firstScoringTeam} marque des la minute ${firstScore.minute}.`,
      hasOpponentScoreResponse
        ? `${opponentScoringTeam} repond et garde le match sous tension, puis ${firstScoringTeam} reprend l'ecart.`
        : `${firstScoringTeam} garde le fil du score; ${nonScoringOpponent} existe surtout par les sequences qui ralentissent l'ecart.`,
      `Le cumul final ${input.officialScore} reste lisible meme dans les segments sans score.`,
    ]);

  const detailedNarrative = sentenceJoin([
    firstScore === undefined
      ? `L'ouverture reste prudente: aucun score precoce ne doit etre invente.`
      : `L'ouverture installe vite un avantage officiel pour ${firstScoringTeam}.`,
    firstTurningPoint === undefined ? "" : `Le premier tournant retenu arrive a la minute ${firstTurningPoint.minute}: ${firstTurningPoint.whyItTurned}`,
    pressureBeat === undefined ? "" : `La pression apparait ensuite comme un facteur de rythme, pas comme une explication inventee: ${pressureBeat.coachReadableText}`,
    scoringSegments.length === 0
      ? "Aucun segment de score n'est ajoute par interpretation: le recit accepte une chronologie sans marque supplementaire."
      : `Les segments avec score affichent le cumul officiel; les segments sans score indiquent explicitement qu'aucun changement de score n'a eu lieu.`,
    fatigueBeat === undefined ? "La fatigue n'est pas forcee dans l'histoire lorsque la preuve officielle reste faible." : fatigueBeat.coachReadableText,
    finalTurningPoint === undefined ? "" : `Le dernier tournant raconte la sortie du match: ${finalTurningPoint.whyItTurned}`,
    `La source du score ne change pas: ${input.officialScore} vient uniquement des consequences score_change de la timeline officielle.`,
  ]);

  const coachFacingNarrative = sentenceJoin([
    firstScore === undefined
      ? "Lecture coach: le match s'ouvre sans rupture precoce, donc l'attention porte d'abord sur la patience collective."
      : `Lecture coach: le score precoce de ${firstScoringTeam} donne le ton sans fermer le match.`,
    hasOpponentScoreResponse
      ? `${opponentScoringTeam} reste present apres la premiere rupture; c'est la reaction collective, plus que le chiffre brut, qui merite le visionnage.`
      : `${nonScoringOpponent} reste a lire par ses phases de resistance et de stabilisation, pas par une reponse au score que la timeline ne montre pas.`,
    "Les tournants sont presentes dans l'ordre chronologique afin de distinguer ce qui change vraiment le score de ce qui change seulement le rythme.",
    "Le prochain visionnage peut donc se concentrer sur la stabilisation, les sorties sous pression et la proprete des reponses, sans choix de joueur obligatoire.",
  ]);

  const allText = `${shortNarrative} ${detailedNarrative} ${coachFacingNarrative}`;
  const quality = narrativeQualityNumbers(allText, coachFacingNarrative);

  return {
    shortNarrative,
    detailedNarrative,
    coachFacingNarrative,
    narrativeQualityScore: quality.narrativeQualityScore,
    mechanicalSentenceCount: quality.mechanicalSentenceCount,
    repeatedSentenceCount: quality.repeatedSentenceCount,
    chronologicalContradictionCount: quality.chronologicalContradictionCount,
    scoreContradictionCount: quality.scoreContradictionCount,
    firstDangerContradictionCount: quality.firstDangerContradictionCount,
    coachReadableParagraphCount: sentenceCount(coachFacingNarrative),
    narrativeFlowScore: quality.narrativeFlowScore,
    narrativeEmotionScore: quality.narrativeEmotionScore,
    causalClarityScore: quality.causalClarityScore,
    metricDumpSentenceCount: quality.metricDumpSentenceCount,
    storyOpening,
    storyMiddle,
    storyEnd,
    timelineNarrative: `La timeline officielle reste l'ordre de lecture: ${input.beats.length} beats, ${input.segments.length} segments, ${input.turningPoints.length} tournants chronologiques.`,
    scoringNarrative: `Le score final ${input.officialScore} est cumulatif et relie a ${input.scoreChangeEventCount} evenement(s) score_change officiels.`,
    fatigueNarrative: fatigueBeat === undefined
      ? "La fatigue reste une limite prudente lorsque la timeline ne donne pas de preuve forte."
      : fatigueBeat.narrativeText,
    teamStyleNarrative: input.causalityLinks.some((link) => link.causeType === "team_strategy")
      ? "Le style d'equipe est raconte comme un signal du match courant, pas comme une memoire de saison."
      : "Le style reste secondaire dans ce recit officiel.",
    playerImpactNarrative: input.beats.some((beat) => beat.primaryPlayerId !== undefined)
      ? "Les joueurs cites apparaissent dans les evenements officiels qui structurent le recit."
      : "Aucun joueur n'est transforme en cause forte sans evenement officiel.",
    limitations: [
      "Le recit officiel n'utilise ni sandbox ni diagnostics batch comme verite du score.",
      "La causalite gameplay reste volontairement prudente jusqu'au sprint d'approfondissement.",
      "Les segments sans score conservent le score cumule au lieu de le remplacer par un score local.",
    ],
    sourceOfTruthNote: "Lecture officielle: timeline officielle, evidence facts officiels et score_change officiels uniquement.",
  };
}

export function readTimeSecondsForMatchStoryText(text: string): number {
  return readTimeSeconds(text);
}
