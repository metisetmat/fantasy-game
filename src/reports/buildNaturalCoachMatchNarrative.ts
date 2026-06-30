import type {
  NaturalCoachMatchNarrative,
  OfficialMatchReplayTimeline,
} from "./matchStorylineImmersionTypes";

export function buildNaturalCoachMatchNarrative(timeline: OfficialMatchReplayTimeline): NaturalCoachMatchNarrative {
  const moments = timeline.replayMoments;
  const chapters = timeline.storylineChapters;
  const firstMoment = moments[0];
  const lastMoment = moments[moments.length - 1];
  const shortImmersiveNarrative = firstMoment === undefined || lastMoment === undefined
    ? "Le replay coach reste indisponible: aucune sequence officielle exploitable n'a ete retenue."
    : `${firstMoment.teamLabel} ouvre le fil du match, puis les moments officiels montrent comment le score ${timeline.officialScore} s'est construit sans ajouter d'evenement a la timeline.`;
  const detailedImmersiveNarrative = moments.length === 0
    ? shortImmersiveNarrative
    : [
      "Le replay se lit comme une suite de bascules courtes.",
      ...moments.slice(0, 5).map((moment) => moment.coachReplayText),
      "La lecture reste volontairement bornee: elle explique ce qui est visible dans les evenements officiels, sans transformer une hypothese en consigne.",
    ].join(" ");
  const coachFacingReplaySummary = chapters.length === 0
    ? "Aucun chapitre coach n'est disponible pour cette generation."
    : chapters.map((chapter) => `${chapter.title}: ${chapter.coachMeaning}`).join(" ");

  return {
    shortImmersiveNarrative,
    detailedImmersiveNarrative,
    coachFacingReplaySummary,
    chapterNarratives: chapters.map((chapter) => chapter.chapterNarrative),
    replayMomentTexts: moments.map((moment) => moment.coachReplayText),
    limitations: timeline.replayLimitations,
  };
}
