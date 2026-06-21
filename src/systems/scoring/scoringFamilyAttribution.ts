import type {
  OfficialScoringFamily,
  ScoringAttributionConfidence,
  ScoringFamilyAttribution,
  ScoringFamilyAttributionWarningCode,
} from "../../contracts/scoringFamily";
import type { MatchEvent, MatchEventType } from "../../contracts/engineToCoach";
import type { ScoringType } from "../../models/scoring";

const OFFICIAL_SCORING_FAMILIES: readonly OfficialScoringFamily[] = [
  "SHOT_GOAL",
  "TRY_TOUCHDOWN",
  "CONVERSION_GOAL",
  "DROP_GOAL",
  "PENALTY_SHOT",
  "UNKNOWN",
];

const SCORING_TYPE_TO_FAMILY: Readonly<Record<ScoringType | string, OfficialScoringFamily>> = {
  goal: "SHOT_GOAL",
  shot: "SHOT_GOAL",
  shot_goal: "SHOT_GOAL",
  SHOT_GOAL: "SHOT_GOAL",
  try: "TRY_TOUCHDOWN",
  try_touchdown: "TRY_TOUCHDOWN",
  TRY_TOUCHDOWN: "TRY_TOUCHDOWN",
  conversion: "CONVERSION_GOAL",
  conversion_goal: "CONVERSION_GOAL",
  CONVERSION_GOAL: "CONVERSION_GOAL",
  drop: "DROP_GOAL",
  drop_goal: "DROP_GOAL",
  DROP_GOAL: "DROP_GOAL",
  penalty: "PENALTY_SHOT",
  penalty_shot: "PENALTY_SHOT",
  PENALTY_SHOT: "PENALTY_SHOT",
};

const EXPECTED_POINTS: Readonly<Record<OfficialScoringFamily, number | null>> = {
  SHOT_GOAL: 3,
  TRY_TOUCHDOWN: 5,
  CONVERSION_GOAL: 2,
  DROP_GOAL: 2,
  PENALTY_SHOT: null,
  UNKNOWN: null,
};

export interface ScoringFamilyClassificationInput {
  readonly eventType?: MatchEventType;
  readonly tags?: readonly string[];
  readonly scoringAction?: string;
  readonly scoringFamily?: string;
  readonly tacticalMoveType?: string;
  readonly consequencePointValue?: number;
  readonly consequenceDescriptions?: readonly string[];
  readonly eventSummary?: string;
  readonly routeType?: string;
  readonly selectedRoute?: string;
  readonly actionType?: string;
}

function normalize(value: string): string {
  return value.trim().replace(/[\s-]+/gu, "_");
}

function familyFromValue(value: string | undefined): OfficialScoringFamily | null {
  if (value === undefined || value.trim().length === 0) {
    return null;
  }

  const normalized = normalize(value);
  const upper = normalized.toUpperCase();
  const lower = normalized.toLowerCase();

  if (OFFICIAL_SCORING_FAMILIES.includes(upper as OfficialScoringFamily)) {
    return upper as OfficialScoringFamily;
  }

  return SCORING_TYPE_TO_FAMILY[lower] ?? SCORING_TYPE_TO_FAMILY[upper] ?? null;
}

function tagValuesForPrefix(tags: readonly string[], prefix: string): readonly string[] {
  return tags
    .filter((tag) => tag.toLowerCase().startsWith(prefix.toLowerCase()))
    .map((tag) => tag.slice(prefix.length));
}

function familyFromTags(tags: readonly string[]): { readonly family: OfficialScoringFamily | null; readonly fields: readonly string[] } {
  const candidates = [
    ...tagValuesForPrefix(tags, "scoring_family_").map((value) => ({ value, field: "tags.scoring_family" })),
    ...tagValuesForPrefix(tags, "scoring_action_").map((value) => ({ value, field: "tags.scoring_action" })),
    ...tagValuesForPrefix(tags, "scoring_type_").map((value) => ({ value, field: "tags.scoring_type" })),
    ...tags.map((value) => ({ value, field: "tags" })),
  ];

  for (const candidate of candidates) {
    const family = familyFromValue(candidate.value);
    if (family !== null && family !== "UNKNOWN") {
      return { family, fields: [candidate.field] };
    }
  }

  return { family: null, fields: [] };
}

function pointValueFromEvent(event: MatchEvent): number | undefined {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce<number | undefined>((total, consequence) => {
      if (consequence.value === undefined) {
        return total;
      }

      return (total ?? 0) + consequence.value;
    }, undefined);
}

function pointValueFamily(points: number | undefined): OfficialScoringFamily | null {
  if (points === 3) {
    return "SHOT_GOAL";
  }
  if (points === 5) {
    return "TRY_TOUCHDOWN";
  }
  if (points === 2) {
    return "CONVERSION_GOAL";
  }
  return null;
}

function textFamily(input: ScoringFamilyClassificationInput): { readonly family: OfficialScoringFamily | null; readonly field: string | null } {
  const textSources = [
    { value: input.eventSummary, field: "eventSummary" },
    { value: input.routeType, field: "routeType" },
    { value: input.selectedRoute, field: "selectedRoute" },
    { value: input.actionType, field: "actionType" },
    { value: input.consequenceDescriptions?.join(" "), field: "consequence.description" },
  ];

  for (const source of textSources) {
    const text = source.value?.toLowerCase() ?? "";
    if (text.includes("try_touchdown") || text.includes("try scored") || text.includes(" via try")) {
      return { family: "TRY_TOUCHDOWN", field: source.field };
    }
    if (text.includes("conversion_goal") || text.includes("conversion")) {
      return { family: "CONVERSION_GOAL", field: source.field };
    }
    if (text.includes("drop_goal") || text.includes("drop")) {
      return { family: "DROP_GOAL", field: source.field };
    }
    if (text.includes("shot_goal") || text.includes("goal") || text.includes(" via goal")) {
      return { family: "SHOT_GOAL", field: source.field };
    }
    if (text.includes("penalty_shot") || text.includes("penalty")) {
      return { family: "PENALTY_SHOT", field: source.field };
    }
  }

  return { family: null, field: null };
}

export function classifyScoringEventFamily(input: ScoringFamilyClassificationInput): ScoringFamilyAttribution {
  const tags = input.tags ?? [];
  const sourceFieldsUsed: string[] = [];
  const missingFields: string[] = [];
  const warningCodes: ScoringFamilyAttributionWarningCode[] = [];
  const candidates: OfficialScoringFamily[] = [];

  const directFamily = familyFromValue(input.scoringFamily);
  if (directFamily !== null) {
    candidates.push(directFamily);
    sourceFieldsUsed.push("scoringFamily");
  }

  const directAction = familyFromValue(input.scoringAction);
  if (directAction !== null) {
    candidates.push(directAction);
    sourceFieldsUsed.push("scoringAction");
  } else {
    missingFields.push("scoringAction");
    warningCodes.push("MISSING_SCORING_ACTION");
  }

  const tagFamily = familyFromTags(tags);
  if (tagFamily.family !== null) {
    candidates.push(tagFamily.family);
    sourceFieldsUsed.push(...tagFamily.fields);
  }

  const moveTypeFamily = familyFromValue(input.tacticalMoveType);
  if (moveTypeFamily !== null) {
    candidates.push(moveTypeFamily);
    sourceFieldsUsed.push("tacticalContext.moveType");
  }

  const textCandidate = textFamily(input);
  if (textCandidate.family !== null) {
    candidates.push(textCandidate.family);
    if (textCandidate.field !== null) {
      sourceFieldsUsed.push(textCandidate.field);
    }
  }

  const pointCandidate = pointValueFamily(input.consequencePointValue);
  if (pointCandidate !== null) {
    candidates.push(pointCandidate);
    sourceFieldsUsed.push("score_change.value");
  }

  if (input.eventType !== "scoring") {
    warningCodes.push("SCORING_EVENT_WITHOUT_OFFICIAL_CONSEQUENCE");
  }
  if (input.consequencePointValue === undefined) {
    missingFields.push("score_change.value");
    warningCodes.push("MISSING_SCORE_CHANGE_POINT_VALUE");
  }

  const nonUnknownCandidates = candidates.filter((family) => family !== "UNKNOWN");
  const uniqueCandidates = [...new Set(nonUnknownCandidates)];
  const selectedFamily = uniqueCandidates[0] ?? "UNKNOWN";
  const expectedPoints = EXPECTED_POINTS[selectedFamily];

  if (uniqueCandidates.length > 1) {
    warningCodes.push("AMBIGUOUS_SCORING_FAMILY");
  }
  if (expectedPoints !== null && input.consequencePointValue !== undefined && input.consequencePointValue !== expectedPoints) {
    warningCodes.push("FAMILY_POINT_VALUE_MISMATCH");
  }
  if (selectedFamily === "PENALTY_SHOT") {
    warningCodes.push("INACTIVE_PENALTY_SHOT_USED");
  }

  const confidence: ScoringAttributionConfidence =
    selectedFamily === "UNKNOWN"
      ? "low"
      : sourceFieldsUsed.some((field) => field === "scoringFamily" || field === "scoringAction" || field.startsWith("tags."))
        ? "high"
        : sourceFieldsUsed.length >= 2
          ? "medium"
          : "low";

  if (confidence === "low") {
    warningCodes.push("LOW_CONFIDENCE_SCORING_ATTRIBUTION");
  }
  if (selectedFamily === "UNKNOWN") {
    warningCodes.push("UNKNOWN_SCORING_FAMILY", "SCORE_CHANGE_WITHOUT_SCORING_FAMILY");
  }

  const dedupedWarnings = [...new Set(warningCodes)];
  const reason = selectedFamily === "UNKNOWN"
    ? "Official score_change event lacks enough scoring action, route, tag, or point-value evidence for a safe family attribution."
    : `${selectedFamily} attributed from ${[...new Set(sourceFieldsUsed)].join(", ")}.`;

  return {
    family: selectedFamily,
    scoringAction: selectedFamily,
    confidence,
    attributionReason: reason,
    sourceFieldsUsed: [...new Set(sourceFieldsUsed)],
    missingFields: [...new Set(missingFields)],
    warningCodes: dedupedWarnings,
    ...(input.consequencePointValue === undefined ? {} : { pointValue: input.consequencePointValue }),
    ...(selectedFamily === "UNKNOWN" ? { unknownReason: reason } : {}),
  };
}

export function classifyMatchEventScoringFamily(event: MatchEvent): ScoringFamilyAttribution {
  const consequencePointValue = pointValueFromEvent(event);

  return classifyScoringEventFamily({
    eventType: event.eventType,
    tags: event.tags,
    consequenceDescriptions: event.consequences.map((consequence) => consequence.description),
    ...(event.scoringAction === undefined ? {} : { scoringAction: event.scoringAction }),
    ...(event.scoringFamily === undefined ? {} : { scoringFamily: event.scoringFamily }),
    ...(event.tacticalContext.moveType === undefined ? {} : { tacticalMoveType: event.tacticalContext.moveType }),
    ...(consequencePointValue === undefined ? {} : { consequencePointValue }),
    ...(event.tacticalContext.reason === undefined ? {} : { eventSummary: event.tacticalContext.reason }),
  });
}

export function scoringFamilyTags(attribution: ScoringFamilyAttribution): readonly string[] {
  const baseTags = [
    `scoring_family_${attribution.family}`,
    `scoring_action_${attribution.scoringAction}`,
    `scoring_attribution_confidence_${attribution.confidence}`,
  ];

  return attribution.family === "UNKNOWN"
    ? [...baseTags, "scoring_family_unknown_reason_explicit"]
    : baseTags;
}
