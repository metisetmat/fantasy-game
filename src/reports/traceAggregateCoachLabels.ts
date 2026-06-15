import type { MatchTraceCauseTag, MatchTraceImpactTag } from "../simulation/tracing/matchTraceEvent";

export const TRACE_CAUSE_LABELS_FR: Readonly<Record<MatchTraceCauseTag, string>> = {
  speed_advantage: "avantage de vitesse",
  power_advantage: "avantage physique",
  pressure_forced_error: "erreurs provoquées par la pression",
  fatigue_drop: "fatigue visible",
  lack_of_support: "manque de soutien",
  good_support: "soutien efficace",
  goalkeeper_quality: "qualité du gardien",
  poor_decision: "décision fragile",
  good_decision: "bonne décision",
  space_behind: "espace dans le dos",
  defensive_recovery: "récupération défensive",
  second_ball_presence: "présence au second ballon",
  unknown_cause: "cause encore non précisée",
};

export const TRACE_IMPACT_LABELS_FR: Readonly<Record<MatchTraceImpactTag, string>> = {
  danger_created: "danger créé",
  line_broken: "ligne cassée",
  fatigue_generated: "fatigue provoquée",
  possession_secured: "possession sécurisée",
  possession_lost: "possession perdue",
  chance_conceded: "occasion concédée",
  shot_prevented: "tir empêché",
  second_chance_allowed: "seconde chance concédée",
  rest_defense_exposed: "rest-defense exposée",
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
