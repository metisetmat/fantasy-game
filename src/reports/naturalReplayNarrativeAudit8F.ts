import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { NaturalReplayNarrative8F } from "./buildNaturalReplayNarrative8F";
import type { ReplayActorMappingNaturalNarrativeFixWarningCode } from "./replayActorMappingNaturalNarrativeFixWarnings";

export interface NaturalReplayNarrativeAudit8F {
  readonly status: OfficialCausalityStatus;
  readonly shortNaturalReplayNarrativeAvailable: boolean;
  readonly detailedNaturalReplayNarrativeAvailable: boolean;
  readonly coachReplaySummaryAvailable: boolean;
  readonly naturalReplayLineCount: number;
  readonly technicalIdInMainTextCount: number;
  readonly rawPlayerIdInMainTextCount: number;
  readonly rawEventIdInMainTextCount: number;
  readonly rawEffectLabelInMainTextCount: number;
  readonly repeatedGuardrailPhraseCount: number;
  readonly mechanicalPhraseCount: number;
  readonly genericReplayPhraseCount: number;
  readonly defensiveSourceOfTruthPhraseCount: number;
  readonly actionVerbsCount: number;
  readonly coachReadableMomentCount: number;
  readonly narrativeFlowScore: number;
  readonly immersionScore: number;
  readonly coachReadabilityScore: number;
  readonly naturalReplayWarningCodes: readonly ReplayActorMappingNaturalNarrativeFixWarningCode[];
  readonly recommendation: string;
}

function countPattern(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

export function auditNaturalReplayNarrative8F(narrative: NaturalReplayNarrative8F): NaturalReplayNarrativeAudit8F {
  const mainText = narrative.replayMomentLines.map((line) => line.naturalText).join("\n");
  const rawPlayerIdInMainTextCount = countPattern(mainText, /\brc-[a-z0-9-]+|control-gk|blitz-gk\b/giu);
  const rawEventIdInMainTextCount = countPattern(mainText, /\b(?:event-|full-match-segment-|score-change-)[a-z0-9-]*/giu);
  const rawEffectLabelInMainTextCount = countPattern(mainText, /\b(?:score_created|fatigue_visible|goalkeeper_action|danger_created)\b/giu);
  const technicalIdInMainTextCount = rawPlayerIdInMainTextCount + rawEventIdInMainTextCount + rawEffectLabelInMainTextCount;
  const repeatedGuardrailPhraseCount = countPattern(mainText, /deuxieme source de verite|source-of-truth|sans creer|cle de lecture claire/giu);
  const mechanicalPhraseCount = countPattern(mainText, /il relie une sequence officielle|la sequence .* laisse le score|couvre comme gardien-libero/giu);
  const genericReplayPhraseCount = countPattern(mainText, /donne une cle de lecture|moment officiel generique/giu);
  const defensiveSourceOfTruthPhraseCount = countPattern(`${mainText}\n${narrative.coachReplaySummary}`, /source de verite|source-of-truth|score officiel/giu);
  const actionVerbsCount = countPattern(mainText, /frappe|transforme|reste|ramene|conclut|change|apparait|fixe|devient/giu);
  const coachReadableMomentCount = narrative.replayMomentLines.filter((line) =>
    !line.hasTechnicalIdLeak && !line.hasGuardrailPhraseLeak && !line.hasMechanicalPhrase && !line.hasUnsupportedClaim
  ).length;
  const totalIssues = technicalIdInMainTextCount + repeatedGuardrailPhraseCount + mechanicalPhraseCount + genericReplayPhraseCount;
  const narrativeFlowScore = Math.max(0, 96 - totalIssues * 12);
  const immersionScore = Math.max(0, 94 - (genericReplayPhraseCount + mechanicalPhraseCount) * 10);
  const coachReadabilityScore = Math.max(0, 98 - totalIssues * 10);
  const warningCodes: ReplayActorMappingNaturalNarrativeFixWarningCode[] = [];
  if (technicalIdInMainTextCount > 0) warningCodes.push("TECHNICAL_ID_IN_MAIN_TEXT");
  if (rawPlayerIdInMainTextCount > 0) warningCodes.push("RAW_PLAYER_ID_IN_MAIN_TEXT");
  if (rawEventIdInMainTextCount > 0) warningCodes.push("RAW_EVENT_ID_IN_MAIN_TEXT");
  if (rawEffectLabelInMainTextCount > 0) warningCodes.push("RAW_EFFECT_LABEL_IN_MAIN_TEXT");
  if (repeatedGuardrailPhraseCount > 0) warningCodes.push("REPEATED_GUARDRAIL_PHRASE");
  if (mechanicalPhraseCount > 0) warningCodes.push("MECHANICAL_REPLAY_PHRASE");
  if (genericReplayPhraseCount > 0) warningCodes.push("GENERIC_REPLAY_PHRASE");
  if (warningCodes.length === 0) warningCodes.push("NATURAL_REPLAY_NARRATIVE_READY");
  const status: OfficialCausalityStatus = warningCodes.length === 1 && warningCodes[0] === "NATURAL_REPLAY_NARRATIVE_READY" &&
    actionVerbsCount >= narrative.replayMomentLines.length &&
    coachReadableMomentCount === narrative.replayMomentLines.length &&
    narrativeFlowScore >= 85 &&
    immersionScore >= 82 &&
    coachReadabilityScore >= 90
      ? "PASS"
      : "FAIL";

  return {
    status,
    shortNaturalReplayNarrativeAvailable: narrative.shortNaturalReplayNarrative.length > 0,
    detailedNaturalReplayNarrativeAvailable: narrative.detailedNaturalReplayNarrative.length > 0,
    coachReplaySummaryAvailable: narrative.coachReplaySummary.length > 0,
    naturalReplayLineCount: narrative.replayMomentLines.length,
    technicalIdInMainTextCount,
    rawPlayerIdInMainTextCount,
    rawEventIdInMainTextCount,
    rawEffectLabelInMainTextCount,
    repeatedGuardrailPhraseCount,
    mechanicalPhraseCount,
    genericReplayPhraseCount,
    defensiveSourceOfTruthPhraseCount,
    actionVerbsCount,
    coachReadableMomentCount,
    narrativeFlowScore,
    immersionScore,
    coachReadabilityScore,
    naturalReplayWarningCodes: warningCodes,
    recommendation: status === "PASS" ? "KEEP_NATURAL_REPLAY_NARRATIVE_8F" : "REVIEW_NATURAL_REPLAY_NARRATIVE_8F",
  };
}
