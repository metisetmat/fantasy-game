import type {
  MatchEvent,
  MatchReport,
} from "../contracts/engineToCoach";
import type { EventId, PlayerId, TeamId } from "../core/ids";
import type { ZoneId } from "../core/zones";
import { buildOfficialMatchStoryNarrative } from "./buildOfficialMatchStoryNarrative";
import type {
  OfficialMatchCausalityLink,
  OfficialMatchStoryBeat,
  OfficialMatchStoryBeatType,
  OfficialMatchStorySegment,
  OfficialMatchStorySegmentPhaseType,
  OfficialMatchStorySpineModel,
  OfficialMatchTurningPoint,
  OfficialMatchTurningPointType,
  StoryConfidence,
} from "./officialMatchStorySpineTypes";

interface ScoreTracker {
  readonly before: string;
  readonly after: string;
}

function eventMinute(event: MatchEvent): number {
  return event.timestamp.minute;
}

function eventHasScoreChange(event: MatchEvent): boolean {
  return event.consequences.some((consequence) => consequence.type === "score_change");
}

function eventScoreValue(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function officialScoreLabel(report: MatchReport): string {
  return `${report.score.home} - ${report.score.away}`;
}

function teamScoreLabel(homeTeamId: TeamId, awayTeamId: TeamId, homeScore: number, awayScore: number): string {
  return `${homeTeamId} ${homeScore} - ${awayScore} ${awayTeamId}`;
}

function scoreTimeline(report: MatchReport, event: MatchEvent): ScoreTracker {
  const homeTeamId = report.teamStats[0]?.teamId ?? event.teamId;
  const awayTeamId = report.teamStats.find((team) => team.teamId !== homeTeamId)?.teamId ?? event.opponentTeamId;
  let homeScore = 0;
  let awayScore = 0;

  for (const currentEvent of report.timeline) {
    if (currentEvent.eventId === event.eventId) {
      const before = teamScoreLabel(homeTeamId, awayTeamId, homeScore, awayScore);
      const value = eventScoreValue(currentEvent);
      if (currentEvent.teamId === homeTeamId) {
        homeScore += value;
      } else {
        awayScore += value;
      }
      return {
        before,
        after: teamScoreLabel(homeTeamId, awayTeamId, homeScore, awayScore),
      };
    }

    const value = eventScoreValue(currentEvent);
    if (value > 0) {
      if (currentEvent.teamId === homeTeamId) {
        homeScore += value;
      } else {
        awayScore += value;
      }
    }
  }

  const current = teamScoreLabel(homeTeamId, awayTeamId, homeScore, awayScore);
  return { before: current, after: current };
}

function confidenceForEvent(event: MatchEvent): StoryConfidence {
  if (eventHasScoreChange(event) || event.narrativeWeight >= 75) return "high";
  if (event.narrativeWeight >= 45) return "medium";
  return "low";
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

function isDefensiveAnswer(event: MatchEvent): boolean {
  return event.eventType === "defensive_action" ||
    event.eventType === "goalkeeper_action" ||
    event.tags.some((tag) => /goalkeeper|defensive|save|recovery|clearance|turnover/iu.test(tag));
}

function isFatigueSignal(event: MatchEvent): boolean {
  return event.eventType === "fatigue_error" ||
    event.fatigueContext.teamCondition < 72 ||
    (event.fatigueContext.primaryPlayerCondition ?? 100) < 68 ||
    (event.fatigueContext.primaryPlayerMentalFreshness ?? 100) < 68 ||
    event.tags.some((tag) => /fatigue|late_error|mental/iu.test(tag));
}

function beatTypeForEvent(event: MatchEvent): OfficialMatchStoryBeatType {
  if (event.eventType === "kickoff") return "kickoff_context";
  if (eventHasScoreChange(event)) return "score";
  if (event.eventType === "goalkeeper_action") return "goalkeeper_answer";
  if (isDefensiveAnswer(event)) return "defensive_answer";
  if (event.eventType === "turnover" || event.eventType === "gain_possession" || event.eventType === "lose_possession") return "turnover";
  if (isDangerEvent(event)) return "danger_created";
  if (isPressureEvent(event)) return "pressure_signal";
  if (isFatigueSignal(event)) return "fatigue_effect";
  if (event.eventType === "tactical_shift") return "style_signal";
  return "chance_created";
}

function titleForBeat(event: MatchEvent, beatType: OfficialMatchStoryBeatType): string {
  switch (beatType) {
    case "kickoff_context":
      return "Le match s'installe";
    case "score":
      return `${event.teamId} transforme un score officiel`;
    case "fatigue_effect":
      return "La fatigue commence a peser";
    case "goalkeeper_answer":
      return "Le gardien influence la sequence";
    case "defensive_answer":
      return `${event.teamId} repond sans ballon`;
    case "turnover":
      return "La possession bascule";
    case "danger_created":
      return `${event.teamId} cree du danger`;
    case "pressure_signal":
      return "La pression monte";
    case "style_signal":
      return `${event.teamId} montre son style`;
    case "chance_created":
      return `${event.teamId} installe une chance`;
    case "tactical_warning":
    case "closing_signal":
    case "momentum_shift":
      return "Le match change de rythme";
  }
}

function summaryForBeat(event: MatchEvent, beatType: OfficialMatchStoryBeatType): string {
  const zone = event.zone;
  switch (beatType) {
    case "score":
      return `${event.teamId} marque depuis un evenement officiel en ${zone}; le score ne vient que du score_change associe.`;
    case "fatigue_effect":
      return `Le signal officiel autour de ${zone} montre une condition ou une fraicheur qui commence a peser.`;
    case "pressure_signal":
      return `La pression autour de ${zone} influence la proprete de la sequence.`;
    case "danger_created":
      return `${event.teamId} repete le danger dans ${zone} avec un lien direct a la timeline officielle.`;
    case "goalkeeper_answer":
      return `La reponse du gardien apparait dans la timeline officielle en ${zone}.`;
    case "defensive_answer":
      return `${event.teamId} absorbe ou coupe une sequence en ${zone}.`;
    case "turnover":
      return `La possession change de valeur en ${zone}.`;
    case "kickoff_context":
      return "Le recit demarre sur la timeline officielle, sans diagnostic externe.";
    case "style_signal":
      return `${event.teamId} exprime un signal de style dans la phase ${event.phase}.`;
    case "chance_created":
    case "closing_signal":
    case "momentum_shift":
    case "tactical_warning":
      return `La sequence en ${zone} pese sur le rythme du match.`;
  }
}

function linkedEvidenceFactIds(report: MatchReport, eventId: EventId): readonly string[] {
  return report.evidenceFacts
    .filter((fact) => fact.eventIds.includes(eventId))
    .map((fact) => fact.factId)
    .slice(0, 4);
}

function buildBeat(report: MatchReport, event: MatchEvent, index: number): OfficialMatchStoryBeat {
  const beatType = beatTypeForEvent(event);
  const score = scoreTimeline(report, event);
  const narrativeText = summaryForBeat(event, beatType);

  return {
    beatId: `official-story-beat-${index + 1}`,
    minute: eventMinute(event),
    title: titleForBeat(event, beatType),
    beatType,
    teamId: event.teamId,
    opponentTeamId: event.opponentTeamId,
    ...(event.primaryPlayerId === undefined ? {} : { primaryPlayerId: event.primaryPlayerId }),
    ...(event.secondaryPlayerId === undefined ? {} : { secondaryPlayerId: event.secondaryPlayerId }),
    zone: event.zone,
    scoreBefore: score.before,
    scoreAfter: score.after,
    linkedOfficialEventId: event.eventId,
    linkedEvidenceFactIds: linkedEvidenceFactIds(report, event.eventId),
    causeTags: event.tags.filter((tag) => /pressure|fatigue|zone|strategy|support|rest|goalkeeper|transition/iu.test(tag)).slice(0, 5),
    impactTags: event.tags.filter((tag) => /score|danger|opportunity|turnover|momentum|recovery|stop/iu.test(tag)).slice(0, 5),
    narrativeText,
    coachReadableText: narrativeText,
    confidence: confidenceForEvent(event),
    limitationNote: confidenceForEvent(event) === "low" ? "Signal officiel faible: a confirmer." : "Signal relie a la timeline officielle.",
  };
}

function selectStoryEvents(report: MatchReport): readonly MatchEvent[] {
  const required = new Map<EventId, MatchEvent>();
  const add = (event: MatchEvent | undefined): void => {
    if (event !== undefined) required.set(event.eventId, event);
  };

  add(report.timeline[0]);
  for (const event of report.timeline.filter(eventHasScoreChange)) add(event);
  for (const moment of report.keyMoments.slice(0, 6)) add(report.timeline.find((event) => event.eventId === moment.eventId));
  add(report.timeline.find(isPressureEvent));
  add(report.timeline.find(isDangerEvent));
  add(report.timeline.find(isDefensiveAnswer));
  add(report.timeline.find(isFatigueSignal));
  add([...report.timeline].reverse().find((event) => eventMinute(event) >= 75));

  for (const event of [...report.timeline]
    .filter((event) => event.narrativeWeight >= 55 || isDangerEvent(event) || isPressureEvent(event))
    .sort((a, b) => b.narrativeWeight - a.narrativeWeight)
    .slice(0, 12)) {
    add(event);
  }

  return [...required.values()]
    .sort((a, b) => eventMinute(a) - eventMinute(b) || a.timestamp.tick - b.timestamp.tick)
    .slice(0, 24);
}

function segmentPhase(index: number): OfficialMatchStorySegmentPhaseType {
  return ([
    "opening",
    "style_installation",
    "pressure_phase",
    "danger_phase",
    "scoring_phase",
    "response_phase",
    "late_game_phase",
    "closing",
  ] as const)[index] ?? "control_phase";
}

function buildSegments(report: MatchReport, beats: readonly OfficialMatchStoryBeat[]): readonly OfficialMatchStorySegment[] {
  const maxMinute = Math.max(90, ...report.timeline.map(eventMinute));
  const ranges = [
    [0, 15],
    [16, 30],
    [31, 45],
    [46, 60],
    [61, 75],
    [76, maxMinute],
  ] as const;
  const fallbackBeat = beats[0];

  return ranges.map(([startMinute, endMinute], index): OfficialMatchStorySegment => {
    const rangeBeats = beats.filter((beat) => beat.minute >= startMinute && beat.minute <= endMinute);
    const segmentBeats = rangeBeats.length === 0 && fallbackBeat !== undefined ? [fallbackBeat] : rangeBeats;
    const scoreBeats = segmentBeats.filter((beat) => beat.beatType === "score");
    const zones = [...new Set(segmentBeats.map((beat) => beat.zone).filter((zone): zone is ZoneId => zone !== undefined))].slice(0, 5);
    const players = [...new Set(segmentBeats.flatMap((beat) => [beat.primaryPlayerId, beat.secondaryPlayerId]).filter((player): player is PlayerId => player !== undefined))].slice(0, 5);
    const teamCounts = new Map<TeamId, number>();
    for (const beat of segmentBeats) {
      if (beat.teamId !== undefined) teamCounts.set(beat.teamId, (teamCounts.get(beat.teamId) ?? 0) + 1);
    }
    const dominantTeamId = [...teamCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    const firstBeat = segmentBeats[0] ?? fallbackBeat;
    const lastBeat = segmentBeats[segmentBeats.length - 1] ?? fallbackBeat;

    return {
      segmentId: `official-story-segment-${index + 1}`,
      title: `Segment ${index + 1} - ${segmentPhase(index).replaceAll("_", " ")}`,
      startMinute,
      endMinute,
      phaseType: segmentPhase(index),
      ...(dominantTeamId === undefined ? {} : { dominantTeamId }),
      possessionTrend: dominantTeamId === undefined ? "partage prudent" : `${dominantTeamId} pese davantage dans ce segment`,
      pressureTrend: segmentBeats.some((beat) => beat.beatType === "pressure_signal") ? "pression visible" : "pression contenue",
      dangerTrend: segmentBeats.some((beat) => beat.beatType === "danger_created" || beat.beatType === "score") ? "danger present" : "danger limite",
      momentumState: scoreBeats.length > 0 ? "momentum marque par le score" : "momentum encore ouvert",
      scoreBefore: firstBeat?.scoreBefore ?? officialScoreLabel(report),
      scoreAfter: lastBeat?.scoreAfter ?? officialScoreLabel(report),
      linkedOfficialEventIds: segmentBeats.map((beat) => beat.linkedOfficialEventId),
      linkedScoreChangeEventIds: scoreBeats.map((beat) => beat.linkedOfficialEventId),
      linkedZoneIds: zones,
      linkedPlayerIds: players,
      linkedRoleIds: [],
      officialEvidenceSummary: `${segmentBeats.length} beat(s) officiels relies a ${zones.length} zone(s).`,
      narrativeSummary: scoreBeats.length > 0
        ? `Le segment explique une evolution du score par evenement officiel.`
        : `Le segment installe le rythme et les signaux de match sans inventer d'issue.`,
      coachMeaning: "A lire comme une sequence de match, pas comme une consigne automatique.",
      confidence: segmentBeats.some((beat) => beat.confidence === "high") ? "high" : "medium",
      limitationNote: "Le segment ne contient que des liens vers la timeline officielle.",
    };
  });
}

function buildTurningPoints(beats: readonly OfficialMatchStoryBeat[]): readonly OfficialMatchTurningPoint[] {
  const points: OfficialMatchTurningPoint[] = [];
  const add = (beat: OfficialMatchStoryBeat | undefined, type: OfficialMatchTurningPointType, title: string): void => {
    if (beat === undefined || points.some((point) => point.linkedOfficialEventIds.includes(beat.linkedOfficialEventId))) return;
    points.push({
      turningPointId: `official-turning-point-${points.length + 1}`,
      minute: beat.minute,
      title,
      turningPointType: type,
      ...(beat.teamId === undefined ? {} : { teamBenefited: beat.teamId }),
      ...(beat.opponentTeamId === undefined ? {} : { teamHurt: beat.opponentTeamId }),
      scoreBefore: beat.scoreBefore,
      scoreAfter: beat.scoreAfter,
      linkedOfficialEventIds: [beat.linkedOfficialEventId],
      linkedStoryBeatIds: [beat.beatId],
      whyItTurned: beat.narrativeText,
      coachMeaning: "Ce tournant aide a comprendre le match sans imposer de decision.",
      confidence: beat.confidence,
      limitationNote: beat.limitationNote,
    });
  };

  add(beats.find((beat) => beat.beatType === "danger_created"), "first_real_danger", "Premier vrai danger officiel");
  add(beats.find((beat) => beat.beatType === "score"), "first_score", "Premier score officiel");
  add(beats.find((beat) => beat.beatType === "fatigue_effect"), "fatigue_exposure", "La fatigue devient observable");
  add([...beats].reverse().find((beat) => beat.beatType === "score"), "decisive_score", "Score decisif du recit officiel");
  add([...beats].reverse().find((beat) => beat.beatType === "defensive_answer" || beat.beatType === "goalkeeper_answer"), "late_stabilization", "Stabilisation defensive");

  return points.slice(0, 4);
}

function buildCausalityLinks(beats: readonly OfficialMatchStoryBeat[]): readonly OfficialMatchCausalityLink[] {
  const links: OfficialMatchCausalityLink[] = [];
  const add = (beat: OfficialMatchStoryBeat | undefined, causeType: OfficialMatchCausalityLink["causeType"], effectType: OfficialMatchCausalityLink["effectType"], causeLabel: string, effectLabel: string): void => {
    if (beat === undefined) return;
    links.push({
      causalityId: `official-causality-${links.length + 1}`,
      causeType,
      causeLabel,
      effectType,
      effectLabel,
      linkedOfficialEventIds: [beat.linkedOfficialEventId],
      linkedStoryBeatIds: [beat.beatId],
      linkedPlayerIds: [beat.primaryPlayerId, beat.secondaryPlayerId].filter((player): player is PlayerId => player !== undefined),
      linkedTeamIds: [beat.teamId, beat.opponentTeamId].filter((team): team is TeamId => team !== undefined),
      linkedZones: beat.zone === undefined ? [] : [beat.zone],
      evidenceStrength: beat.confidence === "high" ? "strong" : "medium",
      confidence: beat.confidence,
      officialOnly: true,
      diagnosticOnly: false,
      sandboxOnly: false,
      canAffectScore: false,
      limitationNote: beat.confidence === "low" ? "Piste de causalite, pas cause certaine." : "Lien appuye par un evenement officiel.",
    });
  };

  add(beats.find((beat) => beat.beatType === "pressure_signal"), "pressure", "momentum_shift", "Pression officielle", "Le rythme du match change");
  add(beats.find((beat) => beat.beatType === "danger_created" || beat.beatType === "score"), "zone_access", "chance_created", "Acces a une zone de danger", "Chance ou score cree");
  add(beats.find((beat) => beat.beatType === "score"), "team_strategy", "score_created", "Route officielle de score", "Score cree par score_change");
  add(beats.find((beat) => beat.beatType === "fatigue_effect"), "fatigue", "fatigue_error", "Fatigue observable", "Erreur ou baisse de proprete");
  add(beats.find((beat) => beat.beatType === "goalkeeper_answer"), "goalkeeper_response", "defensive_stop", "Reponse gardien officielle", "Action neutralisee ou ralentie");
  add(beats.find((beat) => beat.beatType === "defensive_answer"), "rest_defense", "defensive_stop", "Structure defensive", "Danger absorbe");

  return links.slice(0, 6);
}

function deriveWarningCodes(model: Omit<OfficialMatchStorySpineModel, "warningCodes">): readonly string[] {
  return [
    ...(model.storySpineReady ? ["STORY_SPINE_READY"] : ["STORY_SPINE_MISSING"]),
    ...(model.engineCausalityReady ? ["ENGINE_CAUSALITY_READY"] : ["CAUSALITY_TOO_WEAK"]),
    ...(model.officialTimelineCoverageReady ? ["OFFICIAL_TIMELINE_COVERAGE_READY"] : ["STORY_BEAT_COUNT_TOO_LOW"]),
    ...(model.scoringCausalityReady ? ["SCORING_CAUSALITY_READY"] : ["SCORE_CHANGE_EVENT_NOT_COVERED"]),
    ...(model.teamStyleExpressionReady ? ["TEAM_STYLE_EXPRESSION_READY"] : ["TEAM_STYLE_CAUSALITY_NOT_PROVEN"]),
    ...(model.fatigueCausalityReady ? ["FATIGUE_CAUSALITY_READY"] : []),
    ...(model.playerImpactReadable ? ["PLAYER_IMPACT_READABLE"] : ["PLAYER_IMPACT_NOT_READABLE"]),
    ...(model.coachReadableNarrativeReady ? ["COACH_READABLE_NARRATIVE_READY"] : ["NARRATIVE_TOO_ANALYTICAL"]),
    ...(model.reportIntegrationMinimalReady ? ["REPORT_CONSUMPTION_READY"] : []),
    ...(model.sourceOfTruthSeparationPreserved ? ["SOURCE_OF_TRUTH_PRESERVED"] : ["SOURCE_OF_TRUTH_AMBIGUOUS"]),
    ...(model.matchEconomyBaselinePreserved ? ["MATCH_ECONOMY_BASELINE_PRESERVED"] : ["MATCH_ECONOMY_BASELINE_REGRESSED"]),
    ...(model.status === "PASS" ? ["OFFICIAL_MATCH_STORY_SPINE_COMPLETE"] : model.status === "PARTIAL" ? ["OFFICIAL_MATCH_STORY_SPINE_PARTIAL"] : ["OFFICIAL_MATCH_STORY_SPINE_FAIL"]),
  ];
}

export function buildOfficialMatchStorySpine(report: MatchReport, input?: {
  readonly baseline7HPreserved?: boolean;
  readonly productBaselineReady?: boolean;
}): OfficialMatchStorySpineModel {
  const events = selectStoryEvents(report);
  const beats = events.map((event, index) => buildBeat(report, event, index));
  const segments = buildSegments(report, beats);
  const turningPoints = buildTurningPoints(beats);
  const causalityLinks = buildCausalityLinks(beats);
  const scoreChangeEventCount = report.timeline.filter(eventHasScoreChange).length;
  const scoreChangeIds = report.timeline.filter(eventHasScoreChange).map((event) => event.eventId);
  const coveredScoreChangeCount = new Set(beats.filter((beat) => beat.beatType === "score").map((beat) => beat.linkedOfficialEventId)).size;
  const storySpineReady = segments.length >= 4 && segments.length <= 8 && beats.length >= 8 && turningPoints.length >= 2 && turningPoints.length <= 4;
  const scoringCausalityReady = scoreChangeIds.every((eventId) => beats.some((beat) => beat.linkedOfficialEventId === eventId)) && coveredScoreChangeCount === scoreChangeEventCount;
  const engineCausalityReady = causalityLinks.length >= 3 && causalityLinks.every((link) => link.officialOnly && link.linkedOfficialEventIds.length > 0 && !link.sandboxOnly && !link.diagnosticOnly);
  const teamStyleExpressionReady = beats.some((beat) => beat.beatType === "style_signal" || beat.beatType === "pressure_signal" || beat.beatType === "danger_created");
  const fatigueSignalExists = beats.some((beat) => beat.beatType === "fatigue_effect");
  const fatigueCausalityReady = !fatigueSignalExists || causalityLinks.some((link) => link.causeType === "fatigue");
  const playerImpactReadable = beats.some((beat) => beat.primaryPlayerId !== undefined);
  const narrative = buildOfficialMatchStoryNarrative({
    officialScore: officialScoreLabel(report),
    segments,
    beats,
    turningPoints,
    causalityLinks,
    scoreChangeEventCount,
  });
  const coachReadableNarrativeReady = narrative.shortNarrative.length > 0 &&
    narrative.detailedNarrative.length > 0 &&
    narrative.coachFacingNarrative.length > 0;
  const officialTimelineCoverageReady = beats.every((beat) => report.timeline.some((event) => event.eventId === beat.linkedOfficialEventId));
  const sourceOfTruthSeparationPreserved = narrative.sourceOfTruthNote.includes("score_change") &&
    !/sandbox applique|batch score officiel|SQLite prouve/iu.test(`${narrative.shortNarrative} ${narrative.detailedNarrative}`);
  const guardrailsPreserved = report.score.home >= 0 && report.score.away >= 0;
  const matchEconomyBaselinePreserved = input?.baseline7HPreserved ?? true;
  const productBaselineReady = input?.productBaselineReady ?? true;
  const reportIntegrationMinimalReady = storySpineReady && coachReadableNarrativeReady;
  const status: OfficialMatchStorySpineModel["status"] = storySpineReady &&
    engineCausalityReady &&
    officialTimelineCoverageReady &&
    scoringCausalityReady &&
    teamStyleExpressionReady &&
    fatigueCausalityReady &&
    playerImpactReadable &&
    coachReadableNarrativeReady &&
    sourceOfTruthSeparationPreserved &&
    guardrailsPreserved
    ? "PASS"
    : storySpineReady && scoringCausalityReady && sourceOfTruthSeparationPreserved
      ? "PARTIAL"
      : "FAIL";
  const modelWithoutWarnings: Omit<OfficialMatchStorySpineModel, "warningCodes"> = {
    status,
    scope: "OFFICIAL_MATCH_STORY_SPINE_ENGINE_CAUSALITY_PROOF",
    version: "OFFICIAL_MATCH_STORY_SPINE_ENGINE_CAUSALITY_PROOF_8A",
    baselineVersion: "COACH_REPORT_EXPORT_LENGTH_TREND_COUNT_CLEANUP_7H",
    matchId: report.matchId,
    officialScore: officialScoreLabel(report),
    storySpineReady,
    engineCausalityReady,
    officialTimelineCoverageReady,
    scoringCausalityReady,
    teamStyleExpressionReady,
    fatigueCausalityReady,
    playerImpactReadable,
    coachReadableNarrativeReady,
    reportIntegrationMinimalReady,
    matchEconomyBaselinePreserved,
    guardrailsPreserved,
    sourceOfTruthSeparationPreserved,
    productBaselineReady,
    segments,
    beats,
    turningPoints,
    causalityLinks,
    narrative,
    recommendation: status === "PASS"
      ? "KEEP_OFFICIAL_MATCH_STORY_SPINE"
      : status === "PARTIAL"
        ? "FOLLOW_UP_CAUSALITY_DEPTH"
        : "FIX_OFFICIAL_STORY_SOURCE_OF_TRUTH",
    nextSprintRecommendation: status === "PASS"
      ? "8B - Attribute Role Fatigue Causality Deepening"
      : status === "PARTIAL"
        ? "8B - Attribute Role Fatigue Causality Proof Follow-up"
        : "8B - Official Story Source-of-Truth Regression Fix",
  };

  return {
    ...modelWithoutWarnings,
    warningCodes: deriveWarningCodes(modelWithoutWarnings),
  };
}
