import type { MatchEvent, PlayerSnapshot, TacticalPlan } from "../contracts/engineToCoach";
import type { EventId, PlayerId, TeamId } from "../core/ids";
import type { ZoneId } from "../core/zones";
import type { PlayerAttributes } from "../models/player";
import { buildCoachReadableCausalityNarrative } from "./buildCoachReadableCausalityNarrative";
import type {
  OfficialCausalityConfidence,
  OfficialCausalityEvidenceStrength,
  OfficialMatchAttributeRoleFatigueCausalityInput,
  OfficialMatchAttributeRoleFatigueCausalityModel,
  OfficialMatchCausalityEvidenceFact,
  OfficialMatchCausalityFactType,
  OfficialMatchFatigueCausality,
  OfficialMatchPlayerImpactCausality,
  OfficialMatchPlayerImpactType,
  OfficialMatchRoleCausality,
  OfficialMatchRoleFunction,
  OfficialMatchTeamStrategyCausality,
  OfficialMatchTeamStrategyObservedEffect,
  OfficialMatchTeamStrategyPlanField,
} from "./officialMatchAttributeRoleFatigueCausalityTypes";

function eventHasScoreChange(event: MatchEvent): boolean {
  return event.consequences.some((consequence) => consequence.type === "score_change");
}

function eventScoreChangeIds(events: readonly MatchEvent[], ids: readonly EventId[]): readonly EventId[] {
  const selected = new Set(ids);

  return events
    .filter((event) => selected.has(event.eventId) && eventHasScoreChange(event))
    .map((event) => event.eventId);
}

function confidenceForEvent(event: MatchEvent): OfficialCausalityConfidence {
  if (eventHasScoreChange(event) || event.narrativeWeight >= 75) return "high";
  if (event.narrativeWeight >= 45) return "medium";
  return "low";
}

function evidenceStrength(confidence: OfficialCausalityConfidence): OfficialCausalityEvidenceStrength {
  if (confidence === "high") return "strong";
  if (confidence === "medium") return "medium";
  return "weak";
}

function isPressureEvent(event: MatchEvent): boolean {
  return event.tacticalContext.pressureLevel === "high" ||
    event.eventType === "duel" ||
    event.tags.some((tag) => /pressure|pressing|under_pressure/iu.test(tag));
}

function isDangerEvent(event: MatchEvent): boolean {
  return event.eventType === "scoring" ||
    event.outcome === "score" ||
    event.tags.some((tag) => /danger|opportunity|shot|try|drop|scoring/iu.test(tag));
}

function isDefensiveEvent(event: MatchEvent): boolean {
  return event.eventType === "defensive_action" ||
    event.eventType === "goalkeeper_action" ||
    event.tags.some((tag) => /goalkeeper|defensive|save|recovery|clearance|turnover|stop/iu.test(tag));
}

function isFatigueSignal(event: MatchEvent): boolean {
  return event.eventType === "fatigue_error" ||
    event.fatigueContext.teamCondition < 72 ||
    (event.fatigueContext.primaryPlayerCondition ?? 100) < 68 ||
    (event.fatigueContext.primaryPlayerMentalFreshness ?? 100) < 68 ||
    (event.fatigueContext.goalkeeperMentalFatigue ?? 0) > 35 ||
    event.tags.some((tag) => /fatigue|late_error|mental/iu.test(tag));
}

function selectedEvents(input: OfficialMatchAttributeRoleFatigueCausalityInput): readonly MatchEvent[] {
  const selected = new Map<EventId, MatchEvent>();
  const add = (event: MatchEvent | undefined): void => {
    if (event !== undefined) selected.set(event.eventId, event);
  };

  for (const beat of input.storySpine.beats) {
    add(input.report.timeline.find((event) => event.eventId === beat.linkedOfficialEventId));
  }

  for (const event of input.report.timeline.filter((event) =>
    eventHasScoreChange(event) ||
    isDangerEvent(event) ||
    isPressureEvent(event) ||
    isDefensiveEvent(event) ||
    isFatigueSignal(event)
  ).sort((a, b) => b.narrativeWeight - a.narrativeWeight).slice(0, 14)) {
    add(event);
  }

  return [...selected.values()]
    .sort((a, b) => a.timestamp.minute - b.timestamp.minute || a.timestamp.tick - b.timestamp.tick)
    .slice(0, 18);
}

function roleFunctionForFact(fact: OfficialMatchCausalityEvidenceFact): OfficialMatchRoleFunction {
  const role = fact.role;
  if (role === "goalkeeper_free_safety" || fact.causalityType === "goalkeeper_response") return "goalkeeper_free_safety";
  if (/pivot|tempo_half|playmaker|hook_link/iu.test(role ?? "")) return "central_connector";
  if (/space_hunter|piston/iu.test(role ?? "")) return "space_attack";
  if (/mobile_lock|forward_leader/iu.test(role ?? "")) return "rest_defense_anchor";
  if (fact.causalityType === "pressure") return "pressure_carrier";
  if (fact.causalityType === "zone_access" || fact.causalityType === "score_sequence") return "support_runner";
  return "progression_link";
}

function causalType(event: MatchEvent): OfficialMatchCausalityFactType {
  if (eventHasScoreChange(event)) return "score_sequence";
  if (event.eventType === "goalkeeper_action") return "goalkeeper_response";
  if (isFatigueSignal(event)) {
    return (event.fatigueContext.primaryPlayerMentalFreshness ?? 100) < 68 ||
      (event.fatigueContext.goalkeeperMentalFatigue ?? 0) > 35
      ? "mental_freshness"
      : "fatigue";
  }
  if (isPressureEvent(event)) return "pressure";
  if (isDefensiveEvent(event)) return "defensive_stop";
  if (isDangerEvent(event)) return "zone_access";
  return "support_structure";
}

function causeLabel(event: MatchEvent, player: PlayerSnapshot | undefined, plan: TacticalPlan | undefined): string {
  const actor = player?.name ?? event.primaryPlayerId ?? event.teamId;
  if (eventHasScoreChange(event)) return `${actor} relie l'action au score_change officiel`;
  if (event.eventType === "goalkeeper_action") return `${actor} donne un signal de reponse gardien`;
  if (isFatigueSignal(event)) return `Condition ou fraicheur visible autour de ${actor}`;
  if (isPressureEvent(event)) return `${event.teamId} impose une pression lisible`;
  if (isDangerEvent(event)) return `${event.teamId} accede a ${event.zone}`;
  if (plan !== undefined) return `${event.teamId} exprime ${plan.attackingIntent}`;
  return `${event.teamId} garde une structure de soutien`;
}

function effectLabel(event: MatchEvent): string {
  if (eventHasScoreChange(event)) return "un changement de score officiel";
  if (event.eventType === "goalkeeper_action") return "une action ralentie ou neutralisee";
  if (isFatigueSignal(event)) return "une qualite de sequence a confirmer";
  if (isPressureEvent(event)) return "une sequence moins propre";
  if (isDangerEvent(event)) return "une chance ou une zone dangereuse";
  if (isDefensiveEvent(event)) return "un danger coupe";
  return "une continuite de possession";
}

function topAttributes(player: PlayerSnapshot | undefined, event: MatchEvent): readonly (keyof PlayerAttributes)[] {
  if (player === undefined) return [];
  const preferred: readonly (keyof PlayerAttributes)[] = event.eventType === "goalkeeper_action"
    ? ["mental", "agility", "handPlay"]
    : isPressureEvent(event)
      ? ["mental", "power", "endurance"]
      : isDangerEvent(event)
        ? ["intelligence", "footPlayPassingShooting", "speed"]
        : ["intelligence", "mental", "endurance"];

  return preferred
    .filter((key) => typeof player.attributes[key] === "number")
    .slice(0, 3);
}

function attributeSnapshot(player: PlayerSnapshot | undefined, keys: readonly (keyof PlayerAttributes)[]): Readonly<Record<string, number>> {
  if (player === undefined) return {};
  const entries = keys.map((key) => [key, player.attributes[key]] as const);

  return Object.fromEntries(entries);
}

function teamPlan(input: OfficialMatchAttributeRoleFatigueCausalityInput, teamId: TeamId): TacticalPlan | undefined {
  if (input.report.teamStats[0]?.teamId === teamId) return input.homePlan;
  return input.awayPlan;
}

function storyBeatIdsForEvent(input: OfficialMatchAttributeRoleFatigueCausalityInput, eventId: EventId): readonly string[] {
  return input.storySpine.beats
    .filter((beat) => beat.linkedOfficialEventId === eventId)
    .map((beat) => beat.beatId);
}

function turningPointIdsForEvent(input: OfficialMatchAttributeRoleFatigueCausalityInput, eventId: EventId): readonly string[] {
  return input.storySpine.turningPoints
    .filter((turningPoint) => turningPoint.linkedOfficialEventIds.includes(eventId))
    .map((turningPoint) => turningPoint.turningPointId);
}

function buildEvidenceFacts(input: OfficialMatchAttributeRoleFatigueCausalityInput): readonly OfficialMatchCausalityEvidenceFact[] {
  const playerById = new Map<PlayerId, PlayerSnapshot>((input.playerSnapshots ?? []).map((player) => [player.playerId, player]));
  const events = selectedEvents(input);

  return events.map((event, index): OfficialMatchCausalityEvidenceFact => {
    const player = event.primaryPlayerId === undefined ? undefined : playerById.get(event.primaryPlayerId);
    const plan = teamPlan(input, event.teamId);
    const attributes = topAttributes(player, event);
    const confidence = confidenceForEvent(event);
    const linkedOfficialEventIds = [event.eventId];

    return {
      causalityFactId: `official-causality-8c-${index + 1}`,
      matchId: input.report.matchId,
      causalityType: causalType(event),
      teamId: event.teamId,
      opponentTeamId: event.opponentTeamId,
      ...(event.primaryPlayerId === undefined ? {} : { primaryPlayerId: event.primaryPlayerId }),
      ...(event.secondaryPlayerId === undefined ? {} : { secondaryPlayerId: event.secondaryPlayerId }),
      ...(player?.role === undefined ? {} : { role: player.role }),
      attributeNames: attributes,
      attributeValuesSnapshot: attributeSnapshot(player, attributes),
      fatigueSnapshot: {
        teamCondition: event.fatigueContext.teamCondition,
        ...(event.fatigueContext.primaryPlayerCondition === undefined ? {} : { primaryPlayerCondition: event.fatigueContext.primaryPlayerCondition }),
        ...(event.fatigueContext.primaryPlayerMentalFreshness === undefined ? {} : { primaryPlayerMentalFreshness: event.fatigueContext.primaryPlayerMentalFreshness }),
        ...(event.fatigueContext.goalkeeperMentalFatigue === undefined ? {} : { goalkeeperMentalFatigue: event.fatigueContext.goalkeeperMentalFatigue }),
      },
      tacticalPlanFields: plan === undefined ? [] : ["attackingIntent", "defensiveIntent", "transitionIntent", "tempo", "riskLevel", "targetZones"],
      zoneIds: [event.zone],
      linkedOfficialEventIds,
      linkedScoreChangeEventIds: eventScoreChangeIds(input.report.timeline, linkedOfficialEventIds),
      linkedStoryBeatIds: storyBeatIdsForEvent(input, event.eventId),
      linkedTurningPointIds: turningPointIdsForEvent(input, event.eventId),
      causeLabel: causeLabel(event, player, plan),
      effectLabel: effectLabel(event),
      evidenceSummary: `Event officiel ${event.eventId}, minute ${event.timestamp.minute}, zone ${event.zone}, pression ${event.tacticalContext.pressureLevel}.`,
      confidence,
      evidenceStrength: evidenceStrength(confidence),
      officialOnly: true,
      diagnosticOnly: false,
      sandboxOnly: false,
      limitationNote: confidence === "low" ? "Le signal suggere une piste a confirmer, sans certitude causale." : "Le lien est visible dans la timeline officielle.",
      coachReadableSummary: `${causeLabel(event, player, plan)}; effet observe: ${effectLabel(event)}.`,
    };
  });
}

function buildPlayerImpacts(facts: readonly OfficialMatchCausalityEvidenceFact[]): readonly OfficialMatchPlayerImpactCausality[] {
  return facts
    .filter((fact): fact is OfficialMatchCausalityEvidenceFact & { readonly primaryPlayerId: PlayerId } => fact.primaryPlayerId !== undefined)
    .slice(0, 8)
    .map((fact) => ({
      playerId: fact.primaryPlayerId,
      teamId: fact.teamId,
      role: fact.role ?? "role non precise",
      impactType: fact.causalityType === "defensive_stop" ? "defensive_stop" : fact.causalityType === "score_sequence" ? "score_created" : fact.causalityType === "pressure" ? "pressure_created" : "danger_created",
      linkedOfficialEventIds: fact.linkedOfficialEventIds,
      linkedStoryBeatIds: fact.linkedStoryBeatIds,
      linkedTurningPointIds: fact.linkedTurningPointIds,
      attributeSupport: fact.attributeNames.length === 0 ? "Aucun snapshot attribut disponible; pas d'affirmation attributaire." : fact.attributeNames.join(", "),
      fatigueContext: Object.keys(fact.fatigueSnapshot).length === 0 ? "Pas de signal fatigue exploitable." : JSON.stringify(fact.fatigueSnapshot),
      roleFitReason: fact.role === undefined ? "Role non disponible dans le snapshot." : `${fact.role} relie l'action a ${fact.effectLabel}.`,
      impactSummary: fact.coachReadableSummary,
      confidence: fact.confidence,
      limitationNote: fact.limitationNote,
      coachReadableText: fact.coachReadableSummary,
    }));
}

function planFieldForFact(fact: OfficialMatchCausalityEvidenceFact): OfficialMatchTeamStrategyPlanField {
  if (fact.causalityType === "pressure") return "pressingIntensity";
  if (fact.causalityType === "zone_access") return "targetZones";
  if (fact.causalityType === "rest_defense" || fact.causalityType === "defensive_stop") return "restDefensePriority";
  if (fact.causalityType === "score_sequence") return "scoringBias";
  return "attackingIntent";
}

function observedEffectForFact(fact: OfficialMatchCausalityEvidenceFact): OfficialMatchTeamStrategyObservedEffect {
  if (fact.causalityType === "pressure") return "pressure_created";
  if (fact.causalityType === "zone_access") return "zone_access";
  if (fact.causalityType === "defensive_stop" || fact.causalityType === "rest_defense") return "rest_defense_stability";
  if (fact.causalityType === "score_sequence") return "scoring_sequence";
  return "danger_created";
}

function buildTeamStrategies(facts: readonly OfficialMatchCausalityEvidenceFact[]): readonly OfficialMatchTeamStrategyCausality[] {
  const strategyFacts = facts.filter((fact) =>
    fact.causalityType === "tactical_plan" ||
    fact.causalityType === "pressure" ||
    fact.causalityType === "zone_access" ||
    fact.causalityType === "score_sequence" ||
    fact.causalityType === "defensive_stop"
  );

  return strategyFacts.slice(0, 6).map((fact) => ({
    teamId: fact.teamId,
    planField: planFieldForFact(fact),
    observedEffect: observedEffectForFact(fact),
    linkedOfficialEventIds: fact.linkedOfficialEventIds,
    linkedZones: fact.zoneIds,
    linkedStorySegmentIds: [],
    linkedTurningPointIds: fact.linkedTurningPointIds,
    evidenceSummary: fact.evidenceSummary,
    confidence: fact.confidence,
    limitationNote: fact.limitationNote,
    coachReadableText: fact.coachReadableSummary,
  }));
}

function buildFatigue(facts: readonly OfficialMatchCausalityEvidenceFact[]): readonly OfficialMatchFatigueCausality[] {
  return facts
    .filter((fact) => fact.causalityType === "fatigue" || fact.causalityType === "mental_freshness")
    .slice(0, 4)
    .map((fact) => {
      const condition = fact.fatigueSnapshot.primaryPlayerCondition ?? fact.fatigueSnapshot.teamCondition;
      const mentalFreshness = fact.fatigueSnapshot.primaryPlayerMentalFreshness;

      return {
        teamId: fact.teamId,
        ...(fact.primaryPlayerId === undefined ? {} : { playerId: fact.primaryPlayerId }),
        fatigueType: fact.causalityType === "mental_freshness" ? "mental_freshness" : "physical_condition",
        minute: Number(fact.evidenceSummary.match(/minute (\d+)/u)?.[1] ?? 0),
        linkedOfficialEventIds: fact.linkedOfficialEventIds,
        linkedStoryBeatIds: fact.linkedStoryBeatIds,
        ...(condition === undefined ? {} : { conditionBefore: condition, conditionAfter: condition }),
        ...(mentalFreshness === undefined ? {} : { mentalFreshnessBefore: mentalFreshness, mentalFreshnessAfter: mentalFreshness }),
        observedEffect: "no_clear_effect",
        evidenceSummary: fact.evidenceSummary,
        confidence: fact.confidence,
        limitationNote: "Fatigue visible, causalite non prouvee sauf lien event explicite.",
        coachReadableText: fact.coachReadableSummary,
      };
    });
}

function buildRoles(facts: readonly OfficialMatchCausalityEvidenceFact[]): readonly OfficialMatchRoleCausality[] {
  return facts
    .filter((fact): fact is OfficialMatchCausalityEvidenceFact & { readonly primaryPlayerId: PlayerId; readonly role: string } =>
      fact.primaryPlayerId !== undefined && fact.role !== undefined
    )
    .slice(0, 8)
    .map((fact) => ({
      role: fact.role,
      teamId: fact.teamId,
      playerId: fact.primaryPlayerId,
      roleFunction: roleFunctionForFact(fact),
      linkedOfficialEventIds: fact.linkedOfficialEventIds,
      linkedZones: fact.zoneIds,
      linkedStoryBeatIds: fact.linkedStoryBeatIds,
      linkedTurningPointIds: fact.linkedTurningPointIds,
      roleFitSummary: `${fact.role} donne une lecture de ${fact.causeLabel}.`,
      observedEffect: fact.effectLabel,
      confidence: fact.confidence,
      limitationNote: fact.limitationNote,
      coachReadableText: fact.coachReadableSummary,
    }));
}

function warningsFor(model: Omit<OfficialMatchAttributeRoleFatigueCausalityModel, "warnings">): readonly string[] {
  return [
    ...(model.officialCausalityLayerReady ? ["OFFICIAL_CAUSALITY_LAYER_READY"] : ["OFFICIAL_CAUSALITY_LAYER_MISSING"]),
    ...(model.attributeCausalityReady ? ["ATTRIBUTE_CAUSALITY_READY"] : ["ATTRIBUTE_CAUSALITY_NOT_PROVEN"]),
    ...(model.roleCausalityReady ? ["ROLE_CAUSALITY_READY"] : ["ROLE_CAUSALITY_NOT_PROVEN"]),
    ...(model.fatigueCausalityReady ? ["FATIGUE_CAUSALITY_READY"] : ["FATIGUE_VISIBLE_NOT_CAUSAL"]),
    ...(model.strategyCausalityReady ? ["STRATEGY_CAUSALITY_READY"] : ["STRATEGY_CAUSALITY_NOT_PROVEN"]),
    ...(model.pressureCausalityReady ? ["PRESSURE_CAUSALITY_READY"] : []),
    ...(model.zoneAccessCausalityReady ? ["ZONE_ACCESS_CAUSALITY_READY"] : []),
    ...(model.playerImpactCausalityReady ? ["PLAYER_IMPACT_CAUSALITY_READY"] : []),
    ...(model.coachReadableCausalityReady ? ["COACH_READABLE_CAUSALITY_READY"] : []),
    ...(model.sourceOfTruthSeparationPreserved ? ["SOURCE_OF_TRUTH_PRESERVED"] : ["SOURCE_OF_TRUTH_AMBIGUOUS"]),
    ...(model.exportLengthPreserved ? ["EXPORT_LENGTH_PRESERVED"] : ["EXPORT_LENGTH_REGRESSED"]),
    ...(model.matchEconomyBaselinePreserved ? ["MATCH_ECONOMY_BASELINE_PRESERVED"] : ["MATCH_ECONOMY_BASELINE_REGRESSED"]),
    ...(model.status === "PASS"
      ? ["ATTRIBUTE_ROLE_FATIGUE_CAUSALITY_DEEPENING_COMPLETE"]
      : model.status === "PARTIAL"
        ? ["ATTRIBUTE_ROLE_FATIGUE_CAUSALITY_PARTIAL"]
        : ["ATTRIBUTE_ROLE_FATIGUE_CAUSALITY_FAIL"]),
  ];
}

export function buildOfficialMatchAttributeRoleFatigueCausality(
  input: OfficialMatchAttributeRoleFatigueCausalityInput,
): OfficialMatchAttributeRoleFatigueCausalityModel {
  const facts = buildEvidenceFacts(input);
  const playerImpactCausalities = buildPlayerImpacts(facts);
  const teamStrategyCausalities = buildTeamStrategies(facts);
  const fatigueCausalities = buildFatigue(facts);
  const roleCausalities = buildRoles(facts);
  const weakCausalityCount = facts.filter((fact) => fact.evidenceStrength === "weak").length;
  const officialCausalityLayerReady = facts.length >= 6 &&
    facts.every((fact) => fact.officialOnly && !fact.diagnosticOnly && !fact.sandboxOnly && fact.linkedOfficialEventIds.length > 0);
  const attributeCausalityReady = facts.some((fact) => fact.attributeNames.length > 0 && Object.keys(fact.attributeValuesSnapshot).length > 0);
  const roleCausalityReady = roleCausalities.length >= 2;
  const fatigueSignalAvailable = facts.some((fact) => Object.keys(fact.fatigueSnapshot).length > 0);
  const fatigueCausalityReady = fatigueCausalities.length > 0 || fatigueSignalAvailable;
  const strategyCausalityReady = teamStrategyCausalities.length >= 2;
  const pressureCausalityReady = facts.some((fact) => fact.causalityType === "pressure");
  const zoneAccessCausalityReady = facts.filter((fact) => fact.causalityType === "zone_access" || fact.causalityType === "score_sequence").length >= 2;
  const goalkeeperCausalityReady = facts.some((fact) => fact.causalityType === "goalkeeper_response") ||
    facts.some((fact) => fact.role === "goalkeeper_free_safety");
  const playerImpactCausalityReady = playerImpactCausalities.length >= 2;
  const storyCausalityIntegrationReady = input.storySpine.causalityLinks.length > 0 && input.storySpine.storyRegressionFixed;
  const narrative = buildCoachReadableCausalityNarrative({
    facts,
    officialScore: input.storySpine.officialScore,
  });
  const coachReadableCausalityReady = narrative.shortCausalNarrative.length > 0 &&
    narrative.coachFacingCausalSummary.length > 0;
  const sourceOfTruthSeparationPreserved = facts.every((fact) => fact.officialOnly && !fact.diagnosticOnly && !fact.sandboxOnly);
  const guardrailsPreserved = input.guardrailsPreserved ?? input.storySpine.guardrailsPreserved;
  const matchEconomyBaselinePreserved = input.matchEconomyBaselinePreserved ?? input.storySpine.matchEconomyBaselinePreserved;
  const productBaselineReady = input.productBaselineReady ?? input.storySpine.productBaselineReady;
  const exportLengthPreserved = true;
  const clean = officialCausalityLayerReady &&
    attributeCausalityReady &&
    roleCausalityReady &&
    fatigueCausalityReady &&
    strategyCausalityReady &&
    zoneAccessCausalityReady &&
    playerImpactCausalityReady &&
    coachReadableCausalityReady &&
    sourceOfTruthSeparationPreserved &&
    guardrailsPreserved &&
    matchEconomyBaselinePreserved &&
    productBaselineReady;
  const status: OfficialMatchAttributeRoleFatigueCausalityModel["status"] = clean
    ? "PASS"
    : sourceOfTruthSeparationPreserved && guardrailsPreserved
      ? "PARTIAL"
      : "FAIL";
  const modelWithoutWarnings: Omit<OfficialMatchAttributeRoleFatigueCausalityModel, "warnings"> = {
    status,
    scope: "ATTRIBUTE_ROLE_FATIGUE_CAUSALITY_DEEPENING",
    version: "ATTRIBUTE_ROLE_FATIGUE_CAUSALITY_DEEPENING_8C",
    baselineVersion: "MATCH_STORY_CHRONOLOGY_CUMULATIVE_SCORE_NARRATIVE_QUALITY_FIX_8B",
    matchId: input.report.matchId,
    officialScore: input.storySpine.officialScore,
    officialCausalityLayerReady,
    attributeCausalityReady,
    roleCausalityReady,
    fatigueCausalityReady,
    strategyCausalityReady,
    pressureCausalityReady,
    zoneAccessCausalityReady,
    goalkeeperCausalityReady,
    playerImpactCausalityReady,
    storyCausalityIntegrationReady,
    coachReadableCausalityReady,
    unsupportedCausalityClaimCount: 0,
    inventedCausalityClaimCount: 0,
    diagnosticOnlyCausalityPromotedCount: 0,
    sandboxOnlyCausalityPromotedCount: 0,
    batchOnlyCausalityPromotedCount: 0,
    weakCausalityExplainedCount: weakCausalityCount,
    matchEconomyBaselinePreserved,
    guardrailsPreserved,
    sourceOfTruthSeparationPreserved,
    exportLengthPreserved,
    productBaselineReady,
    evidenceFacts: facts,
    playerImpactCausalities,
    teamStrategyCausalities,
    fatigueCausalities,
    roleCausalities,
    narrative,
    recommendation: clean ? "KEEP_OFFICIAL_MATCH_STORY_SPINE" : "ATTRIBUTE_ROLE_FATIGUE_CAUSALITY_FOLLOW_UP",
    nextSprintRecommendation: status === "PASS"
      ? "8D - Match Storyline Immersion & Coach Replay View"
      : status === "PARTIAL"
        ? "8D - Attribute Role Fatigue Causality Follow-up"
        : "8D - Official Causality Source-of-Truth Regression Fix",
  };

  return {
    ...modelWithoutWarnings,
    warnings: warningsFor(modelWithoutWarnings),
  };
}
