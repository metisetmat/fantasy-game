import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { CoachReplayUXIterationView8G } from "./coachReplayUXIterationTypes8G";
import type { CoachReplayUXIterationWarningCode } from "./coachReplayUXIterationWarnings";

export interface CoachReplayWordingUXAudit8G {
  readonly status: OfficialCausalityStatus;
  readonly naturalReplayTextPreserved: boolean;
  readonly actorRoleTextPreserved: boolean;
  readonly technicalIdInMainTextCount: number;
  readonly rawPlayerIdInMainTextCount: number;
  readonly rawEventIdInMainTextCount: number;
  readonly rawEffectLabelInMainTextCount: number;
  readonly repeatedMomentWhyPhraseCount: number;
  readonly mechanicalUXPhraseCount: number;
  readonly coachReadableMomentCount: number;
  readonly coachReadabilityScore: number;
  readonly uxWordingWarningCodes: readonly CoachReplayUXIterationWarningCode[];
  readonly recommendation: string;
}

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

export function auditCoachReplayWordingUX8G(input: {
  readonly view: CoachReplayUXIterationView8G;
  readonly baselineNaturalText: readonly string[];
}): CoachReplayWordingUXAudit8G {
  const mainText = input.view.momentCards.map((card) =>
    `${card.title} ${card.subtitle} ${card.actorRoleLine} ${card.zoneLine} ${card.coachReadLine} ${card.whyItMattersLine} ${card.limitationLine}`
  ).join(" ");
  const naturalReplayTextPreserved = input.baselineNaturalText.every((text) =>
    text.length > 0 && input.view.momentCards.some((card) => card.coachReadLine === text)
  );
  const actorRoleTextPreserved = input.view.momentCards.every((card) => card.actorRoleLine.includes(" / ") && card.actorRoleLine.length > 5);
  const technicalIdInMainTextCount = countMatches(mainText, /\b(?:rc-|event-|full-match-|sequence_actor_contribution_8d)\b/giu);
  const rawPlayerIdInMainTextCount = countMatches(mainText, /\brc-[a-z0-9_-]+\b/giu);
  const rawEventIdInMainTextCount = countMatches(mainText, /\b(?:contract-fixture-|full-match-)[a-z0-9_-]+\b/giu);
  const rawEffectLabelInMainTextCount = countMatches(mainText, /\b(?:score_created|fatigue_visible|official_with_limitation)\b/giu);
  const repeatedMomentWhyPhraseCount = Math.max(0, countMatches(mainText, /Ce moment change le rythme du match/giu) - 1);
  const mechanicalUXPhraseCount = countMatches(mainText, /Il relie une sequence officielle|sans creer une deuxieme source de verite|donne une cle de lecture claire/giu);
  const coachReadableMomentCount = input.view.momentCards.filter((card) =>
    card.coachReadLine.length >= 32 && card.actorRoleLine.length > 0 && card.zoneLine.length > 0
  ).length;
  const coachReadabilityScore = Math.min(100, 82 + coachReadableMomentCount * 3);
  const warningCodes: CoachReplayUXIterationWarningCode[] = [];
  if (technicalIdInMainTextCount > 0) warningCodes.push("TECHNICAL_ID_IN_MAIN_TEXT");
  if (rawPlayerIdInMainTextCount > 0) warningCodes.push("RAW_PLAYER_ID_IN_MAIN_TEXT");
  if (rawEventIdInMainTextCount > 0) warningCodes.push("RAW_EVENT_ID_IN_MAIN_TEXT");
  if (rawEffectLabelInMainTextCount > 0) warningCodes.push("RAW_EFFECT_LABEL_IN_MAIN_TEXT");
  if (repeatedMomentWhyPhraseCount > 0 || mechanicalUXPhraseCount > 0) warningCodes.push("REPEATED_MECHANICAL_UX_PHRASE");
  if (warningCodes.length === 0) warningCodes.push("NATURAL_NARRATIVE_PRESERVED");
  const pass = naturalReplayTextPreserved &&
    actorRoleTextPreserved &&
    technicalIdInMainTextCount === 0 &&
    rawPlayerIdInMainTextCount === 0 &&
    rawEventIdInMainTextCount === 0 &&
    rawEffectLabelInMainTextCount === 0 &&
    repeatedMomentWhyPhraseCount === 0 &&
    mechanicalUXPhraseCount === 0 &&
    coachReadableMomentCount === 6 &&
    coachReadabilityScore >= 92;

  return {
    status: pass ? "PASS" : "FAIL",
    naturalReplayTextPreserved,
    actorRoleTextPreserved,
    technicalIdInMainTextCount,
    rawPlayerIdInMainTextCount,
    rawEventIdInMainTextCount,
    rawEffectLabelInMainTextCount,
    repeatedMomentWhyPhraseCount,
    mechanicalUXPhraseCount,
    coachReadableMomentCount,
    coachReadabilityScore,
    uxWordingWarningCodes: warningCodes,
    recommendation: pass ? "KEEP_REPLAY_WORDING_UX_8G" : "REVIEW_REPLAY_WORDING_UX_8G",
  };
}
