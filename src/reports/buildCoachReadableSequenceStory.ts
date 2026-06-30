import type {
  CoachReadableSequenceStory,
  OfficialMatchSequenceCausality,
} from "./officialPlayerRoleSequenceCausalityTypes";

function firstActor(sequence: OfficialMatchSequenceCausality): string {
  const actor = sequence.actorChain[0];
  return actor === undefined ? sequence.teamId : `${actor.playerId} (${actor.role})`;
}

export function buildCoachReadableSequenceStory(input: {
  readonly sequences: readonly OfficialMatchSequenceCausality[];
  readonly officialScore: string;
}): CoachReadableSequenceStory {
  const [first, second] = input.sequences;
  const shortSequenceStory = first === undefined
    ? `Score officiel ${input.officialScore}; la timeline officielle ne fournit pas encore assez de sequences causales.`
    : `Score officiel ${input.officialScore}; ${first.coachReadableSequenceSummary}`;
  const detailedSequenceStory = input.sequences
    .map((sequence) => sequence.coachReadableSequenceSummary)
    .join(" ");
  const coachFacingSequenceCausalitySummary = input.sequences
    .slice(0, 3)
    .map((sequence) => `${firstActor(sequence)} pese sur ${sequence.observedEffect} via ${sequence.zoneChain.join(" -> ")}; source ${sequence.linkedOfficialEventIds[0]}.`)
    .join(" ");

  return {
    shortSequenceStory,
    detailedSequenceStory,
    coachFacingSequenceCausalitySummary,
    sequenceCards: input.sequences.map((sequence) => sequence.coachReadableSequenceSummary),
    playerRoleHighlights: input.sequences
      .flatMap((sequence) => sequence.actorChain.map((actor) => `${actor.playerId} (${actor.role}) agit comme ${actor.roleFunction} sur ${actor.zone}.`))
      .slice(0, 8),
    fatigueSequenceNotes: input.sequences
      .flatMap((sequence) => sequence.fatigueEffects.map((effect) => effect.coachReadableText))
      .slice(0, 5),
    limitations: [
      ...(second === undefined ? ["Une seule sequence suffisamment lisible; ne pas extrapoler."] : []),
      "Ces sequences restent limitees aux evenements officiels et ne deviennent pas des consignes de selection.",
    ],
  };
}
