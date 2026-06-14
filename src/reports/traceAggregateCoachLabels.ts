import type { MatchTraceCauseTag, MatchTraceImpactTag } from "../simulation/tracing/matchTraceEvent";

export const TRACE_CAUSE_LABELS_FR: Readonly<Record<MatchTraceCauseTag, string>> = {
  speed_advantage: "avantage de vitesse",
  power_advantage: "avantage physique",
  pressure_forced_error: "erreurs provoquÃ©es par la pression",
  fatigue_drop: "fatigue visible",
  lack_of_support: "manque de soutien",
  good_support: "soutien efficace",
  goalkeeper_quality: "qualitÃ© du gardien",
  poor_decision: "dÃ©cision fragile",
  good_decision: "bonne dÃ©cision",
  space_behind: "espace dans le dos",
  defensive_recovery: "rÃ©cupÃ©ration dÃ©fensive",
  second_ball_presence: "prÃ©sence au second ballon",
  unknown_cause: "cause encore non prÃ©cisÃ©e",
};

export const TRACE_IMPACT_LABELS_FR: Readonly<Record<MatchTraceImpactTag, string>> = {
  danger_created: "danger crÃ©Ã©",
  line_broken: "ligne cassÃ©e",
  fatigue_generated: "fatigue provoquÃ©e",
  possession_secured: "possession sÃ©curisÃ©e",
  possession_lost: "possession perdue",
  chance_conceded: "occasion concÃ©dÃ©e",
  shot_prevented: "tir empÃªchÃ©",
  second_chance_allowed: "seconde chance concÃ©dÃ©e",
  rest_defense_exposed: "rest-defense exposÃ©e",
  no_clear_impact: "impact encore peu lisible",
};

function fallbackLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .toLowerCase();
}

export function traceCauseLabelFr(tag: MatchTraceCauseTag | string): string {
  return TRACE_CAUSE_LABELS_FR[tag as MatchTraceCauseTag] ?? fallbackLabel(tag);
}

export function traceImpactLabelFr(tag: MatchTraceImpactTag | string): string {
  return TRACE_IMPACT_LABELS_FR[tag as MatchTraceImpactTag] ?? fallbackLabel(tag);
}

