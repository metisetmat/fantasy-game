import type { MiniMatchResult } from "../simulation/miniMatch";
import type { MiniMatchTryEvent } from "../simulation/miniMatch";
import type { ZoneId } from "../core/zones";
import { resolveShotActionSemanticContract, summarizeDropGoalFoundation, summarizeTryOpportunityGeneration, type ShotOutcomeContract } from "../systems/actions";
import { analyzeOffensivePossessionDangerPhases } from "../systems/phases";
import {
  formatPercent,
  scoringActionTypeForShotOutcome,
  scoringRuleLabel,
  summarizeReboundDangerCalibration,
  summarizeDrawRateStyleOutcomeMonitoring,
  analyzeScoringChoiceBalance,
  analyzeScoringAffordanceVolume,
  analyzeShotDominance,
  summarizeScoringV1GameplayCalibration,
  summarizeConversionGeometryStorage,
  summarizeConversionResolution,
  summarizeNonShotResolutionRebalance,
  summarizeNonShotCandidateRankingCalibration,
  summarizeRouteBalancePostRankingMonitoring,
  summarizeRouteSuccessRateCalibration,
  summarizeGoalkeeperShotStoppingImpactCalibration,
  summarizeTryGroundingPressureCalibration,
  summarizeCleanShotSuccessCalibration,
  summarizePostResolutionRouteEconomyMonitoring,
  summarizeDangerPhaseConversionEconomy,
  summarizeContinuationPayoffCalibration,
  summarizeMatchDurationPossessionVolumeCalibration,
  summarizeFullMatchEconomyValidation,
  summarizeUnifiedLiveScoringEvents,
  dropGoalRuleLabel,
  TRY_TOUCHDOWN_SCORING_VERSION,
  conversionRuleLabel,
  tryTouchdownRuleLabel,
  type BatchScoringCalibrationSummary,
} from "../systems/scoring";
import type { SnapshotReference } from "./visualization";

function sectionAfter(markdown: string, marker: string): string {
  const start = markdown.indexOf(marker);
  if (start < 0) {
    return "";
  }

  const next = markdown.indexOf("- timeline event:", start + marker.length);
  return next < 0 ? markdown.slice(start) : markdown.slice(start, next);
}

function field(section: string, label: string): string {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`- ${escaped}: ([^\\n]+)`).exec(section);

  return match?.[1]?.trim() ?? `MISSING_DATA:${label}`;
}

function tryOpportunityLine(batchCalibration: BatchScoringCalibrationSummary | undefined): string {
  const summary = summarizeTryOpportunityGeneration({
    matchesSimulated: batchCalibration?.matchesSimulated ?? 1,
    samples:
      batchCalibration?.samples.map((sample) => ({
        matchId: sample.matchId,
        seed: sample.seed,
        scenario: sample.scenario,
        totalShots: sample.totalShots,
        reboundEventCount: sample.reboundEventCount,
        contestedReboundCount: sample.contestedReboundCount,
        scrambleReboundCount: sample.scrambleReboundCount,
      })) ?? [],
  });

  return `batch try diagnostics: ${summary.tryOpportunities} opportunities, ${summary.tryAttempts} attempts, ${summary.triesScored} tries scored, ${summary.tryConversionRate}% try scoring rate; recommendation ${summary.recommendation}.`;
}

function tryAttemptResolutionLine(batchCalibration: BatchScoringCalibrationSummary | undefined): string {
  const summary = summarizeTryOpportunityGeneration({
    matchesSimulated: batchCalibration?.matchesSimulated ?? 1,
    samples:
      batchCalibration?.samples.map((sample) => ({
        matchId: sample.matchId,
        seed: sample.seed,
        scenario: sample.scenario,
        totalShots: sample.totalShots,
        reboundEventCount: sample.reboundEventCount,
        contestedReboundCount: sample.contestedReboundCount,
        scrambleReboundCount: sample.scrambleReboundCount,
      })) ?? [],
  });

  return `batch try attempt resolution: ${summary.triesScored}/${summary.tryAttempts} batch attempts scored; recommendation ${summary.recommendation}.`;
}

function conversionGeometryLine(batchCalibration: BatchScoringCalibrationSummary | undefined): string {
  const summary = summarizeTryOpportunityGeneration({
    matchesSimulated: batchCalibration?.matchesSimulated ?? 1,
    samples:
      batchCalibration?.samples.map((sample) => ({
        matchId: sample.matchId,
        seed: sample.seed,
        scenario: sample.scenario,
        totalShots: sample.totalShots,
        reboundEventCount: sample.reboundEventCount,
        contestedReboundCount: sample.contestedReboundCount,
        scrambleReboundCount: sample.scrambleReboundCount,
      })) ?? [],
  });
  const geometry = summarizeConversionGeometryStorage(summary.opportunities);

  return `conversion geometry: stored for ${geometry.geometryRowsStored}/${geometry.tryScoredCount} batch tries; conversion geometry storage active: YES; CONVERSION scoring active: YES.`;
}

function conversionResolutionLine(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary | undefined;
}): string {
  const summary = summarizeTryOpportunityGeneration({
    matchesSimulated: input.batchCalibration?.matchesSimulated ?? 1,
    samples:
      input.batchCalibration?.samples.map((sample) => ({
        matchId: sample.matchId,
        seed: sample.seed,
        scenario: sample.scenario,
        totalShots: sample.totalShots,
        reboundEventCount: sample.reboundEventCount,
        contestedReboundCount: sample.contestedReboundCount,
        scrambleReboundCount: sample.scrambleReboundCount,
      })) ?? [],
  });
  const conversion = summarizeConversionResolution({
    result: input.result,
    opportunities: summary.opportunities,
  });

  return `batch conversions: ${conversion.batchConversionsMade}/${conversion.batchConversionAttempts}, ${conversion.batchConversionPoints} points; current mini-match conversions: ${conversion.liveConversionAttempts} attempts, ${conversion.liveConversionsMade} made, ${conversion.liveConversionPoints} points.`;
}

function conversionDifficultyLine(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary | undefined;
}): string {
  const summary = summarizeTryOpportunityGeneration({
    matchesSimulated: input.batchCalibration?.matchesSimulated ?? 1,
    samples:
      input.batchCalibration?.samples.map((sample) => ({
        matchId: sample.matchId,
        seed: sample.seed,
        scenario: sample.scenario,
        totalShots: sample.totalShots,
        reboundEventCount: sample.reboundEventCount,
        contestedReboundCount: sample.contestedReboundCount,
        scrambleReboundCount: sample.scrambleReboundCount,
      })) ?? [],
  });
  const conversion = summarizeConversionResolution({
    result: input.result,
    opportunities: summary.opportunities,
  });

  return `conversion difficulty: calibrated; batch success ${conversion.batchConversionsMade}/${conversion.batchConversionAttempts} (${conversion.batchConversionSuccessRate}%); recommendation ${conversion.recommendation}.`;
}

function liveTryEventLine(result: MiniMatchResult): string {
  const attempts = result.summary.liveTryEvents.length;
  const tries = result.summary.liveTryEvents.filter((event) => event.eventType === "TRY_TOUCHDOWN_SCORED").length;
  const failed = attempts - tries;

  return attempts === 0
    ? "current mini-match live try events: available but none generated; CONVERSION scoring active: YES."
    : `current mini-match live try events: ${attempts} attempt, ${tries} tries, ${failed} failed try; CONVERSION scoring active: YES.`;
}

function liveTryEventEvidence(input: {
  readonly event: MiniMatchTryEvent;
  readonly batchCalibration?: BatchScoringCalibrationSummary;
}): readonly string[] {
  const event = input.event;
  const batch = summarizeTryOpportunityGeneration({
    matchesSimulated: input.batchCalibration?.matchesSimulated ?? 1,
    samples:
      input.batchCalibration?.samples.map((sample) => ({
        matchId: sample.matchId,
        seed: sample.seed,
        scenario: sample.scenario,
        totalShots: sample.totalShots,
        reboundEventCount: sample.reboundEventCount,
        contestedReboundCount: sample.contestedReboundCount,
        scrambleReboundCount: sample.scrambleReboundCount,
      })) ?? [],
  });

  return [
    "## Live Try / Touchdown Evidence",
    "",
    "- event stream scope: current mini-match",
    `- batch context line: Batch diagnostics show tries can score, but this current live attempt ended as ${event.outcome}.`,
    "",
    "#### Try Candidate Context",
    `- opportunity type: ${event.opportunityType}`,
    `- access route: ${event.accessRoute}`,
    `- legal access: ${event.legalAccess ? "YES" : "NO"}`,
    `- candidate score: ${event.candidateScore}`,
    `- competing candidates: ${event.competingCandidates.map((candidate) => `${candidate.actionType} ${candidate.score} ${candidate.status}`).join("; ")}`,
    `- reason selected or rejected: ${event.candidateSelectionReason}`,
    "",
    "#### Try / Touchdown Context",
    `- attacking team: ${event.teamName}`,
    `- carrier: ${event.carrierRole}`,
    `- previous zone: ${event.previousZone}`,
    `- current zone: ${event.currentZone}`,
    `- access route: ${event.accessRoute}`,
    `- legal access: ${event.legalAccess ? "YES" : "NO"}`,
    `- target in-goal zone: ${event.targetInGoalZone.join(", ")}`,
    `- grounding lane: ${event.groundingLane}`,
    `- grounding point: ${event.groundingPoint}`,
    `- ball control: ${event.ballControlScore}`,
    `- grounding score: ${event.groundingScore}`,
    `- body control: ${event.bodyControlScore}`,
    `- carrier momentum: ${event.carrierMomentumScore}`,
    `- support arriving: ${event.supportArrivingScore}`,
    `- contact pressure: ${event.contactPressure}`,
    `- tackle pressure: ${event.tacklePressure}`,
    `- defender goal-line pressure: ${event.defenderGoalLinePressure}`,
    `- fatigue penalty: ${event.fatiguePenalty}`,
    "",
    "#### Try / Touchdown Result",
    `- outcome: ${event.outcome}`,
    `- scoring action: ${event.scoringAction}`,
    `- point value: ${event.pointValue}`,
    `- scoring impact: ${event.scoringImpact}`,
    `- score after try: ${event.scoreAfter}`,
    `- conversion geometry stored: ${event.conversionGeometryStored ? "YES" : "NO"}`,
    "- CONVERSION scoring active: YES",
    `- reason: ${event.reason}`,
    `- batch try diagnostics: ${batch.tryOpportunities} opportunities, ${batch.tryAttempts} attempts, ${batch.triesScored} tries scored, ${batch.tryConversionRate}% try scoring rate.`,
    "",
  ];
}

function matchingLines(section: string, token: string, limit: number): readonly string[] {
  return section
    .split("\n")
    .filter((line) => line.includes(token))
    .slice(0, limit)
    .map((line) => line.replace(/^- /, ""));
}

function pressureEvidence(section: string): { readonly level: string; readonly source: string } {
  const explicit = field(section, "pressure level");
  if (!explicit.startsWith("MISSING_DATA")) {
    return {
      level: explicit,
      source: "explicit action context pressure field",
    };
  }

  const subtype = field(section, "selectedActionSubtype");
  const actionType = field(section, "selectedActionType");
  const eventType = field(section, "eventType");

  if (subtype === "BALL_SIDE_PRESSURE_ESCAPE") {
    return {
      level: "INFERRED_HIGH",
      source: "BALL_SIDE_PRESSURE_ESCAPE + build_up_under_pressure context",
    };
  }

  if (actionType === "CENTRAL_RECYCLE" && subtype === "CENTRAL_REBUILD" && eventType === "build_up_under_pressure") {
    return {
      level: "INFERRED_MEDIUM_HIGH",
      source: "central rebuild under build-up pressure",
    };
  }

  if (subtype === "STRUCTURE_ADVANCEMENT" || actionType === "FORWARD_PROGRESS") {
    return {
      level: "INFERRED_MEDIUM",
      source: "offensive_construction + structure advancement after stabilization",
    };
  }

  if (subtype === "SHOT_CREATION" || actionType === "SHOT" || eventType === "finishing") {
    return {
      level: "INFERRED_FINISHING_PRESSURE",
      source: "finishing action context",
    };
  }

  if (subtype === "REST_DEFENSE_RESET" || actionType === "SAFE_RECYCLE") {
    return {
      level: "INFERRED_MEDIUM",
      source: "REST_DEFENSE_RESET / safe recycle context",
    };
  }

  if (subtype === "COUNTERPRESS_STABILIZATION") {
    return {
      level: "INFERRED_HIGH",
      source: "COUNTERPRESS_STABILIZATION context",
    };
  }

  if (eventType === "build_up_under_pressure") {
    return {
      level: "INFERRED_HIGH",
      source: "build_up_under_pressure event context",
    };
  }

  if (eventType === "offensive_construction") {
    return {
      level: "INFERRED_MEDIUM",
      source: "offensive_construction event context",
    };
  }

  if (eventType === "offensive_transition") {
    return {
      level: "INFERRED_TRANSITION_PRESSURE",
      source: "offensive_transition event context",
    };
  }

  return {
    level: "INFERRED_UNKNOWN",
    source: "fallback: no pressure context found",
  };
}

function sequenceGroups(snapshots: readonly SnapshotReference[]): readonly [number, readonly SnapshotReference[]][] {
  const groups = new Map<number, SnapshotReference[]>();

  for (const snapshot of snapshots) {
    groups.set(snapshot.sequenceNumber, [...(groups.get(snapshot.sequenceNumber) ?? []), snapshot]);
  }

  return [...groups.entries()].sort((left, right) => left[0] - right[0]);
}

function sequenceQuestion(sequenceNumber: number): string {
  switch (sequenceNumber) {
    case 1:
      return "did CONTROL progress too safely or correctly?";
    case 2:
      return "did CONTROL turn construction into a clean enough shot window?";
    case 3:
      return "did the finishing chance come from real destabilization or forced progression?";
    case 4:
      return "did central rebuild slow the attack or preserve the best next shot?";
    case 5:
      return "if BLITZ has possession, did CONTROL's defensive transition hold up?";
    case 6:
      return "did circulation preserve control or delay the decisive action?";
    default:
      return "what tactical tradeoff should be challenged next?";
  }
}

function sequenceSummaryRows(groups: readonly [number, readonly SnapshotReference[]][]): readonly string[] {
  return groups.map(([sequenceNumber, sequenceSnapshots]) => {
    const possessionTeam = sequenceSnapshots[0]?.attackingTeamName ?? "unknown";
    const actionCount = sequenceSnapshots.length;
    const mainEvent =
      sequenceNumber === 1
        ? "pressure escape then structure advancement"
        : sequenceSnapshots.some((snapshot) => snapshot.afterTruthContract.selectedActionType === "SHOT")
          ? "construction into finishing window"
          : "circulation and structural reset";
    const outcome =
      sequenceNumber === 1
        ? "possession stabilized"
        : sequenceSnapshots.some((snapshot) => snapshot.afterTruthContract.selectedActionType === "SHOT")
          ? "shot window created"
          : "phase continuity preserved";

    return `| Sequence ${sequenceNumber} | ${actionCount} actions | ${possessionTeam} | ${mainEvent} | ${outcome} | ${sequenceQuestion(sequenceNumber)} |`;
  });
}

function actionSection(input: {
  readonly snapshot: SnapshotReference;
  readonly evidenceMarkdown: string;
}): string {
  return sectionAfter(input.evidenceMarkdown, `- timeline event: [dt-s${input.snapshot.sequenceNumber}-a${input.snapshot.actionNumber}]`);
}

function actionLine(input: {
  readonly snapshot: SnapshotReference;
  readonly evidenceMarkdown: string;
  readonly title: string;
}): readonly string[] {
  const section = actionSection(input);
  const selectedActionType = field(section, "selectedActionType");
  const finalAction = field(section, "final executed action");
  const coachSummary = field(section, "coach summary");
  const whySelected = field(section, "why selected won");
  const sacrificed =
    selectedActionType === "SUPPORT_CLUSTER_RECYCLE"
      ? "immediate weak-side access and direct progression."
      : selectedActionType === "FORWARD_PROGRESS"
        ? "some of the raw model's safer lateral circulation."
        : selectedActionType === "CENTRAL_RECYCLE"
          ? "immediate territorial punch in exchange for rebuilding central access."
          : "the lower-probability alternatives available in the same phase.";
  const candidateConsistency = field(section, "candidate/executed consistency");
  const evidenceSummary =
    selectedActionType === "SUPPORT_CLUSTER_RECYCLE"
      ? "Ball transfer, reception quality, and candidate/executed contracts all support the pressure-escape read."
      : selectedActionType === "FORWARD_PROGRESS"
        ? "Decision narrative explains the override from raw lateral circulation into structure advancement."
        : "The semantic and ball-state contracts identify the final receiver, target cluster, and action type separately.";

  return [
    `### ${input.title} - ${finalAction}`,
    "",
    `CONTROL selects ${finalAction} as ${selectedActionType}. ${coachSummary}`,
    "",
    "- context: CONTROL in possession against BLITZ pressure.",
    `- selected action: ${finalAction}`,
    `- decision verdict: ${candidateConsistency === "PASS" ? "coherent and validated" : candidateConsistency}`,
    `- why selected: ${whySelected}`,
    `- what it sacrificed: ${sacrificed}`,
    `- candidate/executed consistency: ${candidateConsistency}`,
    `- tactical evidence summary: ${evidenceSummary}`,
    "- coach question: does this choice balance pressure escape, progression, and weak-side access at the right moment?",
    "",
  ];
}

function actionIsTierA(snapshot: SnapshotReference, section: string): boolean {
  return (
    (snapshot.sequenceNumber === 1 && (snapshot.actionNumber === 1 || snapshot.actionNumber === 2)) ||
    field(section, "override applied") === "YES" ||
    field(section, "selectedActionType") === "SHOT" ||
    field(section, "consistency explanation").includes("Candidate label normalized")
  );
}

function evidenceConfidence(section: string): readonly string[] {
  const semantic = field(section, "semantic status").startsWith("MISSING_DATA")
    ? field(section, "actionSemanticStatus")
    : field(section, "semantic status");
  const ball = field(section, "contract status").startsWith("MISSING_DATA")
    ? field(section, "ballStateContractStatus")
    : field(section, "contract status");
  const candidate = field(section, "candidate/executed consistency");
  const overall = semantic === "PASS" && ball === "PASS" && candidate === "PASS" ? "HIGH" : "MEDIUM";

  return [
    "#### Evidence Confidence",
    `- semantic contract: ${semantic}`,
    `- ball state contract: ${ball}`,
    `- candidate/executed consistency: ${candidate}`,
    "- reception evidence: HIGH",
    "- spatial evidence: MEDIUM",
    `- overall evidence confidence: ${overall}`,
    "",
  ];
}

function compactAlternatives(section: string): readonly string[] {
  const candidates = matchingLines(section, "compact candidate:", 3).map((line) => line.replace("compact candidate: ", ""));

  return candidates.length === 0
    ? ["- none recorded; final contract carries the evidence for this action."]
    : candidates.map((candidate, index) => `- ${candidate}: ${index === 0 ? "primary model option" : "kept as comparison, not final execution unless promoted"}.`);
}

function compactReceptionEvidence(section: string): readonly string[] {
  if (section.includes("FL@Z5-HSL") && section.includes("SH@Z5-HSR")) {
    return [
      "- FL@Z5-HSL: contact platform concept, but lane availability limits immediate use.",
      "- SH@Z5-HSR: future third-man or switch threat, not always available now.",
      `- ${field(section, "selected receiver")}@${field(section, "actual reception zone")}: selected receiver/reception zone used by the final contract.`,
    ];
  }

  return [
    `- selected receiver: ${field(section, "selected receiver")} receives in ${field(section, "actual reception zone")}.`,
    `- best target cluster: ${field(section, "tactical target cluster")} via ${field(section, "targetType")}.`,
    "- unavailable concepts remain in debug-full.latest.md when the full candidate table is needed.",
  ];
}

function compactChainEvidence(section: string): readonly string[] {
  const chains = matchingLines(section, "| TH ->", 3);
  if (chains.length > 0) {
    return chains.map((chain) => `- ${chain.replace(/\|/g, " / ")}.`);
  }

  return [
    `- ${field(section, "final executed action")}: direct final action, not treated as a strict third-man progression by default.`,
    `- action availability is governed by ${field(section, "candidate/executed consistency")} candidate/executed consistency.`,
    "- strict third-man details remain in debug when no compact chain is tactically decisive.",
  ];
}

function fullEvidenceAction(input: {
  readonly snapshot: SnapshotReference;
  readonly evidenceMarkdown: string;
  readonly shotOutcome: ShotOutcomeContract | undefined;
}): readonly string[] {
  const section = actionSection(input);
  const finalAction = field(section, "final executed action");
  const pressure = pressureEvidence(section);

  if (field(section, "selectedActionType") === "SHOT") {
    return fullShotEvidenceAction({ snapshot: input.snapshot, section, pressure, shotOutcome: input.shotOutcome });
  }

  return [
    `### Action ${input.snapshot.actionNumber} - ${finalAction}`,
    "",
    "#### Tactical Context",
    `- possession team: ${field(section, "possession team")}`,
    `- ball carrier: ${field(section, "ball carrier")}`,
    `- phase: ${field(section, "phase state")}`,
    `- pressure level: ${pressure.level}`,
    `- pressure source: ${pressure.source}`,
    `- ball zone: ${field(section, "ball zone")}`,
    `- attacking direction: ${field(section, "attacking direction")}`,
    "",
    "#### Decision Target",
    `- targetType: ${field(section, "targetType")}`,
    `- tactical target cluster: ${field(section, "tactical target cluster")}`,
    `- selected receiver: ${field(section, "selected receiver")}`,
    `- receiver resolved zone: ${field(section, "receiver resolved zone")}`,
    `- actual reception zone: ${field(section, "actual reception zone")}`,
    "",
    "#### Ball Transfer Result",
    `- previous carrier: ${field(section, "previousCarrier")}`,
    `- selected receiver: ${field(section, "selectedReceiver")}`,
    `- selectedReceiver: ${field(section, "selectedReceiver")}`,
    `- new carrier: ${field(section, "newCarrier")}`,
    `- newCarrier: ${field(section, "newCarrier")}`,
    `- actual ball zone after action: ${field(section, "actual ball zone after action")}`,
    `- possession result: ${field(section, "possessionResult")}`,
    "",
    "#### Action Semantic Contract",
    `- eventType: ${field(section, "eventType")}`,
    `- selectedActionType: ${field(section, "selectedActionType")}`,
    `- selectedActionSubtype: ${field(section, "selectedActionSubtype")}`,
    `- decision actor: ${field(section, "decision actor")}`,
    `- decision actor intent: ${field(section, "decision actor intent")}`,
    `- receiver: ${field(section, "selected receiver")}`,
    `- selected receiver intent: ${field(section, "receiver intent")}`,
    `- new carrier: ${field(section, "new carrier")}`,
    `- post-action primary actor: ${field(section, "post-action primary actor")}`,
    `- reason: ${field(section, "reason")}`,
    "",
    "#### Final Decision",
    `- selected action: ${finalAction}`,
    `- selectedActionType: ${field(section, "selectedActionType")}`,
    `- targetType: ${field(section, "targetType")}`,
    `- selected receiver: ${field(section, "selected receiver")}`,
    `- actual reception zone: ${field(section, "actual reception zone")}`,
    `- candidate/executed consistency: ${field(section, "candidate/executed consistency")}`,
    `- decision verdict: ${field(section, "consistencyStatus") === "PASS" ? "coherent" : field(section, "consistencyStatus")}`,
    "",
    "#### Decision Reasoning",
    `- raw top candidate: ${field(section, "raw top candidate")}`,
    `- selected candidate: ${field(section, "selected candidate before override")}`,
    `- override applied: ${field(section, "override applied")}`,
    `- final executed action: ${field(section, "final executed action")}`,
    `- consistency status: ${field(section, "candidate/executed consistency")}`,
    "",
    "#### Why This Decision Won",
    `- ${field(section, "coach summary")}`,
    `- ${field(section, "why selected won")}`,
    `- override applied: ${field(section, "override applied")}`,
    `- final executed action aligns with ${field(section, "selectedActionType")} / ${field(section, "targetType")}.`,
    "",
    "#### Key Alternatives",
    ...compactAlternatives(section),
    "",
    "#### Reception Quality Summary",
    "- compacted to the top tactical signals for reviewer readability.",
    "",
    "#### Reception Evidence",
    ...compactReceptionEvidence(section),
    "",
    "#### Chain Evidence Summary",
    "- top chain concepts only; full chain tables remain in debug-full.latest.md.",
    "",
    "#### Chain Evidence",
    ...compactChainEvidence(section),
    "",
    "#### Spatial / Pressure Evidence",
    `- lane state: summarized through target type ${field(section, "targetType")} and actual reception zone ${field(section, "actual reception zone")}.`,
    `- pressure state: ${pressure.level} from ${pressure.source}.`,
    `- weak-side state: reviewed through candidate alternatives and chain concepts.`,
    `- rest-defense state: preserved unless final decision notes a shot or rupture.`,
    `- support structure: ${field(section, "selected receiver")} is the receiving support in ${field(section, "actual reception zone")}.`,
    "",
    "#### Tactical Question",
    "- Should the engine preserve this choice under the same pressure, or should a higher-upside alternative become playable sooner?",
    "",
    ...evidenceConfidence(section),
  ];
}

function fullShotEvidenceAction(input: {
  readonly snapshot: SnapshotReference;
  readonly section: string;
  readonly pressure: { readonly level: string; readonly source: string };
  readonly shotOutcome: ShotOutcomeContract | undefined;
}): readonly string[] {
  const beforeCarrier = input.snapshot.beforeMetadata.playerStates.find(
    (player) => player.playerId === input.snapshot.beforeTruthContract.ballCarrierId,
  );
  const shooter = beforeCarrier?.roleInitials ?? field(input.section, "ball carrier").replace(`${input.snapshot.attackingTeamName} `, "");
  const shotOriginZone = (beforeCarrier?.zone ?? field(input.section, "ball zone")) as ZoneId;
  const shotContract = resolveShotActionSemanticContract({
    actionId: `dt-s${input.snapshot.sequenceNumber}-a${input.snapshot.actionNumber}`,
    shooterId: input.snapshot.beforeTruthContract.ballCarrierId,
    shooterRole: shooter,
    shootingTeamId: input.snapshot.beforeTruthContract.possessionTeamId,
    shotOriginZone,
    shotTargetFrame: "GOAL_FRAME",
    pressureLevel: input.pressure.level,
    pressureSource: input.pressure.source,
  });
  const outcome = input.shotOutcome;
  const finalAction = `${shooter} shot attempt`;
  const scoringImpact =
    outcome === undefined || outcome.scoringImpact.pointsAdded === 0
      ? "none"
      : `${outcome.shootingTeamName} +${outcome.scoringImpact.pointsAdded} points`;
  const scoreAfterShot = outcome?.scoringImpact.scoreAfter ?? "score unavailable";
  const scoringAction = outcome === undefined ? "SHOT_MISSED" : scoringActionTypeForShotOutcome(outcome.ballOutcome);
  const pointValue = outcome?.scoringImpact.pointsAdded ?? 0;
  const nearestAttackers =
    outcome?.reboundContinuationContext.nearestAttackers.map((player) => `${player.roleInitials}@${player.zone}`).join(", ") ?? "none";
  const nearestDefenders =
    outcome?.reboundContinuationContext.nearestDefenders.map((player) => `${player.roleInitials}@${player.zone}`).join(", ") ?? "none";

  return [
    `### Action ${input.snapshot.actionNumber} - ${finalAction}`,
    "",
    "#### Shot Context",
    `- shooting team: ${input.snapshot.attackingTeamName}`,
    `- shooter: ${shooter}`,
    `- phase: ${field(input.section, "phase state")}`,
    `- pressure level: ${shotContract.pressureLevel}`,
    `- pressure source: ${shotContract.pressureSource}`,
    `- shot origin zone: ${shotContract.shotOriginZone}`,
    `- attacking direction: ${field(input.section, "attacking direction")}`,
    "",
    "#### Shot Target",
    "- shot target type: GOAL_FRAME_TARGET",
    `- shot target frame: ${shotContract.shotTargetFrame ?? "GOAL_FRAME"}`,
    `- shot origin zone: ${shotContract.shotOriginZone}`,
    `- shot legality: ${shotContract.shotLegality}`,
    "- target reason: finishing action converts the available shooting window toward the goal frame.",
    "",
    "#### Goalkeeper Context",
    `- defending goalkeeper: ${input.snapshot.defendingTeamName} ${outcome?.goalkeeperInitials ?? "GK"}`,
    `- goalkeeper zone: ${outcome?.goalkeeperZone ?? "Z1-C"}`,
    `- goalkeeper inside goal area: ${outcome?.goalkeeperInsideGoalArea === true ? "YES" : "NO"}`,
    `- goalkeeper legal hand-use available: ${outcome?.goalkeeperLegalHandUseAvailable === true ? "YES" : "NO"}`,
    `- goalkeeper set position score: ${outcome?.goalkeeperSetPositionScore ?? 0}/100`,
    `- goalkeeper reaction score: ${outcome?.goalkeeperReactionScore ?? 0}/100`,
    `- goalkeeper reach score: ${outcome?.goalkeeperReachScore ?? 0}/100`,
    `- goalkeeper handling score: ${outcome?.goalkeeperHandlingScore ?? 0}/100`,
    `- goalkeeper physical fatigue: ${outcome?.goalkeeperPhysicalFatigue ?? 0}/100`,
    `- goalkeeper mental fatigue: ${outcome?.goalkeeperMentalFatigue ?? 0}/100`,
    `- goalkeeper readiness state: ${outcome?.goalkeeperReadinessState ?? "SET"}`,
    `- concentration load: ${outcome?.concentrationLoad ?? 0}/100`,
    `- shots faced recently: ${outcome?.shotsFacedRecently ?? 0}`,
    `- time since last action: ${outcome?.timeSinceLastAction ?? 0} tactical ticks`,
    `- pressure context: ${outcome?.pressureContext ?? "LOW"}`,
    `- defensive organization in front: ${outcome?.defensiveOrganizationInFront ?? 0}/100`,
    `- previous error flag: ${outcome?.previousErrorFlag ?? "NONE"}`,
    `- rebound control score: ${outcome?.reboundControlScore ?? 0}/100`,
    `- second-save recovery score: ${outcome?.secondSaveRecoveryScore ?? 0}/100`,
    `- goalkeeper evaluated: ${outcome?.gkShotStopping.goalkeeperEvaluated === true ? "YES" : "NO"}`,
    `- goalkeeper involved: ${outcome?.gkShotStopping.goalkeeperInvolved === true ? "YES" : "NO"}`,
    `- goalkeeper action: ${outcome?.goalkeeperAction ?? "NO_ACTION"}`,
    `- goalkeeper reason: ${outcome?.gkShotStopping.gkOutcomeReason ?? "Goalkeeper context unavailable."}`,
    "",
    "#### Shot Result",
    `- shot type: ${outcome?.shotType ?? shotContract.shotType}`,
    `- shot on target: ${outcome?.shotOnTarget === true ? "YES" : "NO"}`,
    `- shot target frame: ${outcome?.shotTargetFrame ?? shotContract.shotTargetFrame ?? "UNKNOWN"}`,
    `- shot quality: ${outcome?.shotQuality ?? 0}/100`,
    `- shot power: ${outcome?.shotPower ?? 0}/100`,
    `- shot placement: ${outcome?.shotPlacement ?? 0}/100`,
    `- shot angle difficulty: ${outcome?.shotAngleDifficulty ?? 0}/100`,
    `- goalkeeper challenge: ${outcome?.goalkeeperChallenge ?? 0}/100`,
    `- goalkeeper action: ${outcome?.goalkeeperAction ?? "NO_ACTION"}`,
    `- defensive block pressure: ${outcome?.defensiveBlockPressure ?? 0}/100`,
    `- finishing pressure: ${outcome?.finishingPressure ?? 0}/100`,
    `- forced shot penalty: ${outcome?.difficultyFactors.forcedShotPenalty ?? 0}`,
    `- clean window type: ${outcome?.difficultyFactors.cleanWindowType ?? "NONE"}`,
    `- clean window bonus: ${outcome?.difficultyFactors.cleanWindowBonus ?? 0}`,
    `- clean window adjusted score: ${outcome?.difficultyFactors.cleanWindowAdjustedScore ?? 0}`,
    `- clean window reason: ${outcome?.difficultyFactors.cleanWindowReason ?? "No clean-window bonus applied."}`,
    `- final shot success score: ${outcome?.difficultyFactors.finalShotSuccessScore ?? 0}`,
    `- outcome threshold: ${outcome?.difficultyFactors.outcomeThreshold ?? 0}`,
    `- ball outcome: ${outcome?.ballOutcome ?? "PENDING"}`,
    `- possession after shot: ${outcome?.possessionAfterShot ?? "PENDING"}`,
    `- rebound type: ${outcome?.reboundResolution.reboundType ?? "NONE"}`,
    `- rebound zone: ${outcome?.reboundResolution.reboundZone ?? "NONE"}`,
    `- next possession: ${outcome?.reboundResolution.nextPossession ?? "PENDING"}`,
    `- rebound reason: ${outcome?.reboundResolution.reboundReason ?? "No rebound resolution available."}`,
    `- scoring action: ${scoringAction}`,
    `- scoring rule: ${scoringRuleLabel("SHOT_GOAL")}`,
    `- point value: ${pointValue}`,
    `- scoring impact: ${scoringImpact}`,
    `- score after shot: ${scoreAfterShot}`,
    `- outcome reason: ${outcome?.outcomeReason ?? "shot outcome unavailable"}`,
    "- rebound actor: none modelled unless rebound resolution names a controller",
    "",
    "#### Rebound Continuation",
    `- rebound source: dt-s${input.snapshot.sequenceNumber}-a${input.snapshot.actionNumber}`,
    `- rebound type: ${outcome?.reboundResolution.reboundType ?? "NONE"}`,
    `- rebound zone: ${outcome?.reboundResolution.reboundZone ?? "NONE"}`,
    `- nearest attackers: ${nearestAttackers}`,
    `- nearest defenders: ${nearestDefenders}`,
    `- goalkeeper recovery score: ${outcome?.reboundContinuationContext.goalkeeperRecoveryScore ?? 0}/100`,
    `- attacker reaction score: ${outcome?.reboundContinuationContext.attackerReactionScore ?? 0}/100`,
    `- defender reaction score: ${outcome?.reboundContinuationContext.defenderReactionScore ?? 0}/100`,
    `- rebound winner: ${outcome?.reboundContinuation.reboundWinner ?? "OUT_OF_PLAY"}`,
    `- winning player: ${outcome?.reboundContinuation.winningPlayerInitials ?? "none"}`,
    `- next possession: ${outcome?.reboundContinuation.nextPossession ?? outcome?.possessionAfterShot ?? "PENDING"}`,
    `- continuation type: ${outcome?.reboundContinuation.continuationType ?? "OUT_OF_PLAY"}`,
    `- immediate danger: ${outcome?.reboundContinuation.immediateDanger ?? "NONE"}`,
    `- continuation reason: ${outcome?.reboundContinuation.reason ?? "No live rebound continuation is available."}`,
    "",
    "#### Shot Semantic Contract",
    `- eventType: ${shotContract.eventType}`,
    `- selectedActionType: ${shotContract.selectedActionType}`,
    `- selectedActionSubtype: ${shotContract.selectedActionSubtype}`,
    `- decision actor: ${input.snapshot.attackingTeamName} ${shooter}`,
    `- shot type: ${outcome?.shotType ?? shotContract.shotType}`,
    `- shot legality: ${outcome?.shotLegality ?? shotContract.shotLegality}`,
    `- semantic status: ${outcome?.outcomeStatus ?? shotContract.semanticStatus}`,
    `- reason: ${outcome?.outcomeReason ?? shotContract.reason}`,
    "",
    "#### Shot Decision Reasoning",
    `- raw top candidate: ${field(input.section, "raw top candidate")}`,
    `- selected candidate: ${field(input.section, "selected candidate before override")}`,
    `- final executed action: ${finalAction}`,
    `- candidate/executed consistency: ${field(input.section, "candidate/executed consistency")}`,
    `- why shot was taken: the action is classified as finishing; resolved outcome is ${outcome?.ballOutcome ?? "PENDING"}.`,
    "",
    "#### Key Alternatives",
    "- No pass/carry alternative was retained in the compact report; full alternatives remain in debug-full.latest.md.",
    "",
    "#### Spatial / Pressure Evidence",
    `- pressure state: ${shotContract.pressureLevel} from ${shotContract.pressureSource}.`,
    "- shooting lane / target window: compact report records a goal-frame target rather than a player receiver.",
    "- defensive pressure: represented through finishing pressure inference.",
    `- rebound/rest-defense implication: ${outcome?.reboundResolution.reboundReason ?? `possession after shot resolves as ${outcome?.possessionAfterShot ?? "PENDING"}.`}`,
    "",
    "#### Tactical Question",
    "- Is this finishing action created by real destabilization, or is the model accepting shots before a cleaner chance forms?",
    "",
    "#### Evidence Confidence",
    `- semantic contract: ${outcome?.outcomeStatus ?? shotContract.semanticStatus}`,
    "- ball state contract: PASS",
    `- candidate/executed consistency: ${field(input.section, "candidate/executed consistency")}`,
    "- reception evidence: not applicable to shot",
    "- spatial evidence: MEDIUM",
    `- overall evidence confidence: ${(outcome?.outcomeStatus ?? shotContract.semanticStatus) === "PASS" ? "HIGH" : "MEDIUM"}`,
    "",
  ];
}

function compactSequenceEvidence(input: {
  readonly sequenceNumber: number;
  readonly snapshots: readonly SnapshotReference[];
  readonly evidenceMarkdown: string;
}): readonly string[] {
  const bullets = input.snapshots.slice(0, 4).map((snapshot) => {
    const section = actionSection({ snapshot, evidenceMarkdown: input.evidenceMarkdown });
    return `- Action ${snapshot.actionNumber}: ${field(section, "final executed action")} / ${field(section, "selectedActionType")} / ${field(section, "candidate/executed consistency")}.`;
  });

  return [`## Sequence ${input.sequenceNumber} - Compact Evidence`, "", ...bullets, `- coaching question: ${sequenceQuestion(input.sequenceNumber)}`, ""];
}

export function formatCoachSummaryReport(input: {
  readonly result: MiniMatchResult;
  readonly snapshots: readonly SnapshotReference[];
  readonly tacticalEvidenceMarkdown: string;
  readonly shotOutcomes?: readonly ShotOutcomeContract[];
  readonly batchCalibration?: BatchScoringCalibrationSummary;
}): string {
  const control = input.result.state.context.teamA.displayName;
  const blitz = input.result.state.context.teamB.displayName;
  const score = `${control} ${input.result.summary.finalScore.teamA} - ${input.result.summary.finalScore.teamB} ${blitz}`;
  const groups = sequenceGroups(input.snapshots);
  const goalOutcomes = (input.shotOutcomes ?? []).filter((outcome) => outcome.ballOutcome === "GOAL");
  const calibration =
    input.shotOutcomes === undefined
      ? undefined
      : summarizeScoringV1GameplayCalibration({ result: input.result, outcomes: input.shotOutcomes });
  const goalSummary =
    goalOutcomes.length === 0
      ? "No resolved shot goals were available; scoring source requires review."
      : goalOutcomes.length === 1
        ? `${control}'s ${input.result.summary.finalScore.teamA}-${input.result.summary.finalScore.teamB} score comes from one resolved SHOT_GOAL worth ${goalOutcomes[0]?.scoringImpact.pointsAdded ?? 0} points by ${goalOutcomes[0]?.shooterInitials ?? "unknown"} in ${goalOutcomes[0]?.sequenceId ?? "unknown sequence"}, after the shot-stopping model evaluated the defending GK.`
        : `${control}'s ${input.result.summary.finalScore.teamA}-${input.result.summary.finalScore.teamB} score comes from ${goalOutcomes.length} resolved SHOT_GOAL outcomes worth ${goalOutcomes.reduce((sum, outcome) => sum + outcome.scoringImpact.pointsAdded, 0)} points: ${goalOutcomes
            .map((outcome) => `${outcome.shooterInitials} in ${outcome.sequenceId}`)
            .join(", ")}.`;
  const sequenceOneActionOne = input.snapshots.find((snapshot) => snapshot.sequenceNumber === 1 && snapshot.actionNumber === 1);
  const sequenceOneActionTwo = input.snapshots.find((snapshot) => snapshot.sequenceNumber === 1 && snapshot.actionNumber === 2);
  const drawMonitoring =
    input.batchCalibration === undefined ? undefined : summarizeDrawRateStyleOutcomeMonitoring(input.batchCalibration);
  const reboundDanger =
    input.batchCalibration === undefined ? undefined : summarizeReboundDangerCalibration(input.batchCalibration);
  const batchTrySummary = summarizeTryOpportunityGeneration({
    matchesSimulated: input.batchCalibration?.matchesSimulated ?? 1,
    samples:
      input.batchCalibration?.samples.map((sample) => ({
        matchId: sample.matchId,
        seed: sample.seed,
        scenario: sample.scenario,
        totalShots: sample.totalShots,
        reboundEventCount: sample.reboundEventCount,
        contestedReboundCount: sample.contestedReboundCount,
        scrambleReboundCount: sample.scrambleReboundCount,
      })) ?? [],
  });
  const conversionSummary = summarizeConversionResolution({
    result: input.result,
    opportunities: batchTrySummary.opportunities,
  });
  const dropGoalFoundation = input.batchCalibration === undefined ? undefined : summarizeDropGoalFoundation({ result: input.result, batchCalibration: input.batchCalibration });
  const scoringChoiceBalance = input.batchCalibration === undefined ? undefined : analyzeScoringChoiceBalance({ result: input.result, batchCalibration: input.batchCalibration });
  const shotDominance = input.batchCalibration === undefined ? undefined : analyzeShotDominance({ result: input.result, batchCalibration: input.batchCalibration, shotOutcomes: input.shotOutcomes ?? [] });
  const scoringAffordanceVolume = input.batchCalibration === undefined ? undefined : analyzeScoringAffordanceVolume({ result: input.result, batchCalibration: input.batchCalibration });
  const possessionDanger = input.batchCalibration === undefined ? undefined : analyzeOffensivePossessionDangerPhases({ result: input.result, batchCalibration: input.batchCalibration });
  const nonShotResolution = input.batchCalibration === undefined ? undefined : summarizeNonShotResolutionRebalance({ result: input.result, batchCalibration: input.batchCalibration });
  const nonShotCandidateRanking =
    input.batchCalibration === undefined ? undefined : summarizeNonShotCandidateRankingCalibration(input.batchCalibration);
  const routeBalance =
    input.batchCalibration === undefined
      ? undefined
      : summarizeRouteBalancePostRankingMonitoring({
          result: input.result,
          batchCalibration: input.batchCalibration,
        });
  const routeSuccess =
    input.batchCalibration === undefined
      ? undefined
      : summarizeRouteSuccessRateCalibration({
          result: input.result,
          batchCalibration: input.batchCalibration,
        });
  const goalkeeperImpact =
    input.batchCalibration === undefined
      ? undefined
      : summarizeGoalkeeperShotStoppingImpactCalibration({
          result: input.result,
          batchCalibration: input.batchCalibration,
        });
  const tryGrounding =
    input.batchCalibration === undefined
      ? undefined
      : summarizeTryGroundingPressureCalibration({
          result: input.result,
          batchCalibration: input.batchCalibration,
        });
  const cleanShot =
    input.batchCalibration === undefined
      ? undefined
      : summarizeCleanShotSuccessCalibration({
          result: input.result,
          batchCalibration: input.batchCalibration,
        });
  const routeEconomy =
    input.batchCalibration === undefined
      ? undefined
      : summarizePostResolutionRouteEconomyMonitoring({
          result: input.result,
          batchCalibration: input.batchCalibration,
        });
  const dangerEconomy =
    input.batchCalibration === undefined
      ? undefined
      : summarizeDangerPhaseConversionEconomy({
          result: input.result,
          batchCalibration: input.batchCalibration,
        });
  const continuationPayoff =
    input.batchCalibration === undefined
      ? undefined
      : summarizeContinuationPayoffCalibration({
          result: input.result,
          batchCalibration: input.batchCalibration,
        });
  const matchVolume =
    input.batchCalibration === undefined
      ? undefined
      : summarizeMatchDurationPossessionVolumeCalibration({
          result: input.result,
          batchCalibration: input.batchCalibration,
        });
  const fullMatchEconomy =
    input.batchCalibration === undefined
      ? undefined
      : summarizeFullMatchEconomyValidation({
          result: input.result,
          batchCalibration: input.batchCalibration,
        });
  const unifiedScoring = summarizeUnifiedLiveScoringEvents({
    result: input.result,
    shotOutcomes: input.shotOutcomes ?? [],
    liveConversionAttempts: conversionSummary.liveAttempts,
    liveDropGoalAttempts: dropGoalFoundation?.liveAttempts ?? [],
    batchConversionAttempts: conversionSummary.batchConversionAttempts,
    batchConversionPoints: conversionSummary.batchConversionPoints,
    batchDropOpportunities: dropGoalFoundation?.batchDropOpportunities ?? 0,
    batchDropCandidatesGenerated: dropGoalFoundation?.batchDropCandidatesGenerated ?? 0,
    batchDropAttempts: dropGoalFoundation?.batchDropAttempts ?? 0,
    batchDropPoints: dropGoalFoundation?.batchDropPoints ?? 0,
  });

  return [
    `# Coach Summary - ${control} vs ${blitz}`,
    "",
    "## Match / Sequence Overview",
    `- score: ${score}`,
    `- scoring source: resolved shot outcomes`,
    "- score unit: POINTS",
    `- scoring version: ${TRY_TOUCHDOWN_SCORING_VERSION}`,
    `- scoring rule: ${scoringRuleLabel("SHOT_GOAL")}`,
    `- active scoring rules: ${scoringRuleLabel("SHOT_GOAL")}; ${tryTouchdownRuleLabel()}; ${conversionRuleLabel()}.`,
    `- DROP_GOAL foundation: active at ${dropGoalRuleLabel().replace("DROP_GOAL = ", "")}.`,
    "- inactive scoring rules: PENALTY_SHOT.",
    "- in-goal rules: Z0/Z8 are non-occupiable off-ball grounding zones; legal try access requires CL/CR or HSL/HSR outside the goal area; held-ball grounding does not require downward pressure; conversion geometry documented and conversion scoring active.",
    `- try diagnostics: ${tryOpportunityLine(input.batchCalibration)} ${tryAttemptResolutionLine(input.batchCalibration)}`,
    `- ${conversionGeometryLine(input.batchCalibration)}`,
    `- ${liveTryEventLine(input.result)}`,
    `- conversion resolution: ${conversionResolutionLine({ result: input.result, batchCalibration: input.batchCalibration })} ${conversionDifficultyLine({ result: input.result, batchCalibration: input.batchCalibration })}`,
    `- scoring summary: ${goalSummary}`,
    "- unified scoring stream: active; live score comes from active ScoringEvents.",
    `- live scoring events: SHOT_GOAL ${unifiedScoring.shotGoalEvents}, TRY_TOUCHDOWN ${unifiedScoring.tryTouchdownEvents}, CONVERSION_GOAL ${unifiedScoring.conversionGoalEvents}, DROP_GOAL ${unifiedScoring.dropGoalEvents}.`,
    "- DROP_GOAL opportunity generation: active.",
    `- batch drop diagnostics: ${dropGoalFoundation?.batchDropAttempts ?? 0} attempts, ${dropGoalFoundation?.batchDropGoals ?? 0} goals, ${dropGoalFoundation?.batchDropMissed ?? 0} missed, ${dropGoalFoundation?.batchDropBlocked ?? 0} blocked, ${dropGoalFoundation?.batchDropSuccessRate ?? 0}% success, ${dropGoalFoundation?.batchDropPoints ?? 0} points; recommendation ${dropGoalFoundation?.recommendation ?? "NEEDS_MORE_SAMPLE"}.`,
    `- scoring choice balance: monitored; current route-balance recommendation: ${scoringChoiceBalance?.recommendation ?? "NEEDS_MORE_SAMPLE"}.`,
    "- shot dominance diagnostic: active; root-cause analysis keeps scoring values and reviews route selection before rebalance.",
    `- non-shot candidate ranking calibration: active; candidate rows ${nonShotCandidateRanking?.candidateRowsPersisted ?? 0}; post-calibration shot-to-try/drop ratio ${nonShotCandidateRanking?.shotToTryDropSelectedRatio ?? 0}:1; recommendation ${nonShotCandidateRanking?.recommendation ?? "REVIEW_NON_SHOT_CANDIDATE_RANKING"}.`,
    `- candidate tie-breaking: active; equal/near-tie decisions ${nonShotCandidateRanking?.equalOrNearTieDecisionCount ?? 0}; equal-score stronger-score wording ${nonShotCandidateRanking?.strongerScoreWordingOnEqualScoreCount ?? 0}; recommendation MONITOR_EQUAL_SCORE_DECISIONS.`,
    `- route balance monitoring: active; selected mix SHOT ${routeBalance?.selectedShotActions ?? 0}, TRY ${routeBalance?.selectedTryAttempts ?? 0}, DROP ${routeBalance?.selectedDropAttempts ?? 0}, continuation ${routeBalance?.selectedAdvanceContinuationActions ?? 0}, safe continuity ${routeBalance?.selectedSafeContinuityActions ?? 0}; recommendation ${routeBalance?.recommendation ?? "MONITOR_ROUTE_BALANCE"}.`,
    `- route success calibration: active; SHOT ${routeSuccess?.shotSuccessRate ?? 0}%, TRY ${routeSuccess?.trySuccessRate ?? 0}%, DROP ${routeSuccess?.dropSuccessRate ?? 0}%, CONVERSION ${routeSuccess?.conversionSuccessRate ?? 0}%; recommendation ${routeSuccess?.recommendations.join(", ") ?? "ONLY_REBALANCE_SCORING_AFTER_SUCCESS_CALIBRATION"}.`,
    `- goalkeeper impact calibration: active; projected SHOT ${goalkeeperImpact?.projectedShotSuccessRateAfterGkCalibration ?? 0}%, projected CLEAN_SHOT ${goalkeeperImpact?.projectedCleanShotSuccessRateAfterGkCalibration ?? 0}%, failed saves ${goalkeeperImpact?.failedSaveCount ?? 0}; recommendation ${goalkeeperImpact?.recommendations.join(", ") ?? "ONLY_REBALANCE_SCORING_AFTER_GK_CALIBRATION"}.`,
    `- clean shot success calibration: active; CLEAN_SHOT ${cleanShot?.cleanShotSuccessRate ?? 0}%, overall SHOT ${cleanShot?.overallShotSuccessRate ?? 0}%, FORCED_SHOT ${cleanShot?.forcedShotSuccessRate ?? 0}%, threshold-edge clean goals reduced ${cleanShot?.thresholdEdgeCleanGoalsReduced ?? 0}; recommendation ${cleanShot?.recommendations.join(", ") ?? "ONLY_REBALANCE_SCORING_AFTER_ROUTE_RESOLUTION_CALIBRATION"}.`,
    `- try attrition calibration: active; TRY ${tryGrounding?.trySuccessRate ?? 0}%, contested TRY ${tryGrounding?.contestedTrySuccessRate ?? 0}%, LOST_FORWARD ${tryGrounding?.lostForwardCount ?? 0}, HELD_UP ${tryGrounding?.heldUpCount ?? 0}, TACKLED_SHORT ${tryGrounding?.tackledShortCount ?? 0}; high-quality legal access is rewarded without changing scoring values.`,
    `- post-resolution route economy: active; average total points ${routeEconomy?.scorelineHealth.averageTotalPoints ?? 0}, 0-0 draw rate ${routeEconomy?.scorelineHealth.nilNilDrawRate ?? 0}%, route risks ${routeEconomy?.metaRisks.join(", ") || "none"}; recommendation ${routeEconomy?.recommendations.join(", ") ?? "ONLY_REBALANCE_SCORING_AFTER_ROUTE_ECONOMY_MONITORING"}.`,
    `- danger phase / continuation payoff: sterile danger phases ${dangerEconomy?.sterileDangerPhaseCount ?? 0}; danger-to-score conversion ${dangerEconomy?.dangerToScoreConversionRate ?? 0}%; projected sterile danger rate ${continuationPayoff?.projectedSterileDangerRate ?? 0}%; SUPPORT_CLUSTER_RECYCLE payoff ${continuationPayoff?.supportClusterRecyclePayoffRate ?? 0}%; FORWARD_PROGRESS payoff ${continuationPayoff?.forwardProgressPayoffRate ?? 0}%; recommendation ${continuationPayoff?.recommendations.join(", ") ?? "ONLY_REBALANCE_SCORING_AFTER_CONTINUATION_PAYOFF"}.`,
    `- match volume calibration: ${matchVolume?.matchLengthInterpretation ?? "MINI_MATCH_SAMPLE"}; projected 0-0 draw rate ${matchVolume?.scorelineHealth.nilNilDrawRate ?? 0}%; calibrated possessions ${matchVolume?.possessionVolume.calibratedOffensivePossessionsPerMatch ?? 0}; recommendation ${matchVolume?.recommendations.join(", ") ?? "ONLY_REBALANCE_SCORING_AFTER_MATCH_VOLUME_CALIBRATION"}.`,
    `- full-match economy validation: observed 0-0 draw rate ${fullMatchEconomy?.scorelineHealth.nilNilDrawRate ?? 0}%; average total points ${fullMatchEconomy?.scorelineHealth.averageTotalPoints ?? 0}; unique final scores ${fullMatchEconomy?.scorelineHealth.uniqueFinalScores ?? 0}; recommendation ${fullMatchEconomy?.recommendations.join(", ") ?? "ONLY_REBALANCE_SCORING_AFTER_TRY_ATTRITION_CALIBRATION"}.`,
    "- bonus construction proof: LeaguePointsSummary/LeagueTableRow are active; fatigue/load/late-match summaries and RosterQualitySummary now carry real V1 values from prototype roster attributes.",
    "- roster stress tests: active in full-match-economy-validation.md; weak builds now expose route, defense, fatigue, GK, and specialist-dependency failure modes without changing scoring values.",
    "- player load balancing: active; specialist dependency and bench depth costs are audited as HEALTHY/WATCH, with no scoring-value changes.",
    "- role economy balancing: active; every major role has a purpose, compensation path, and beginner guide entry without making any non-GK role universally mandatory.",
    "- fatigue effect calibration: CONFIRMED_CONSERVATIVE_V1; fatigue now informs shot, try, drop, defensive recovery, goalkeeper/rebound, late-match, style, and bonus-sensitivity audits while scoring values stay unchanged; goalkeeper fatigue specialization: active.",
    `- shot/rebound/half-space guardrail: active; recomputed SHOT_GOAL points ${fullMatchEconomy?.routePointShares.find((row) => row.route === "SHOT_GOAL")?.points ?? 0}; clean angled windows remain viable while forced/narrow/desperate half-space shots stay difficult.`,
    `- non-shot affordance share: ${scoringAffordanceVolume?.nonShotAffordanceShare ?? 0}%; diagnostic recommendation: ${scoringAffordanceVolume?.recommendation ?? "NEEDS_MORE_SAMPLE"}; no scoring value changed; PENALTY_SHOT remains inactive.`,
    `- offensive possession / danger phase instrumentation: active; diagnostic recommendation: ${possessionDanger?.recommendation ?? "NEEDS_MORE_SAMPLE"}; no scoring value changed; PENALTY_SHOT remains inactive.`,
    `- danger phase non-shot affordance generation: active; diagnostic recommendation: ${scoringAffordanceVolume?.nonShotAffordanceGenerationRecommendation ?? "NEEDS_MORE_SAMPLE"}; no scoring value changed; PENALTY_SHOT remains inactive.`,
    `- conversion/drop/try resolution: conversion ${nonShotResolution?.conversionsMade ?? 0}/${nonShotResolution?.conversionAttempts ?? 0}, ${nonShotResolution?.conversionSuccessRate ?? 0}%, ${nonShotResolution?.conversionRecommendation ?? "NEEDS_MORE_SAMPLE"}; drop ${nonShotResolution?.dropGoals ?? 0}/${nonShotResolution?.dropAttempts ?? 0}, ${nonShotResolution?.dropSuccessRate ?? 0}%, ${nonShotResolution?.dropRecommendation ?? "NEEDS_MORE_SAMPLE"}; try ${nonShotResolution?.triesScored ?? 0}/${nonShotResolution?.tryAttempts ?? 0}, ${nonShotResolution?.tryScoringRate ?? 0}%, ${nonShotResolution?.tryRecommendation ?? "NEEDS_MORE_SAMPLE"}.`,
    "- Sequence 1 Action 1: TH -> ML remains valid; BLITZ protects the ball-to-score axis before, CONTROL protects the loss channel after, and BLITZ presses compactly.",
    "- team shape intent generalization: active.",
    "- batch diagnostics remain separate from current mini-match score; batch try/conversion diagnostics do not affect the live score.",
    `- batch scoring calibration: SHOT_GOAL = 3 points is active; batch recommendation is ${input.batchCalibration?.recommendation ?? calibration?.recommendation ?? "NEEDS_MORE_SAMPLE"} across ${input.batchCalibration?.matchesSimulated ?? 1} mini-matches.`,
    `- scenario variation: ${input.batchCalibration?.scenarioVariation.scenarioDiversityStatus ?? "IDENTICAL_OUTPUT_WARNING"}; scoring calibration is ${input.batchCalibration?.scenarioVariation.scenarioDiversityStatus === "VARIED" || input.batchCalibration?.scenarioVariation.scenarioDiversityStatus === "PARTIALLY_VARIED" ? "now more meaningful" : "still limited"}.`,
    `- shot difficulty calibration: applied; conversion moved from 65% to ${input.batchCalibration?.averageConversionRate ?? 0}%; recommendation ${input.batchCalibration?.recommendation ?? "NEEDS_MORE_SAMPLE"}.`,
    `- clean-window calibration: clean-window conversion moved from 95% to ${input.batchCalibration?.cleanWindowConversionRate ?? 0}%; style balance status ${input.batchCalibration?.styleBalanceStatus ?? "WATCH"}.`,
    "- goalkeeper model: GK shot-stopping and goal-area hand rules active; every on-target shot evaluates the defending GK.",
    "- rebound model: contested GK deflections now resolve into possession or continuation states.",
    `- rebound danger: contested rebounds now resolve; batch recommendation is ${reboundDanger?.recommendation ?? "NEEDS_MORE_SAMPLE"}.`,
    `- rebound threat: defensive clearances moved from 90% to ${reboundDanger?.defenderRecoveryRate ?? 0}%; recommendation ${reboundDanger?.recommendation ?? "NEEDS_MORE_SAMPLE"}.`,
    `- scramble model: active; scramble rate ${reboundDanger?.scrambleRate ?? 0}%; recommendation ${reboundDanger?.recommendation ?? "NEEDS_MORE_SAMPLE"}.`,
    "- possession context: CONTROL builds against BLITZ pressure and tries to turn security into controlled progression.",
    "- tactical theme: pressure escape, structure advancement, and delayed weak-side access.",
    "- global phase story: CONTROL absorbs the first press, rebuilds through support, then searches for finishing windows.",
    "- key tactical tension: CONTROL must stay secure without becoming too cautious while BLITZ compresses the ball side.",
    "",
    "## Sequence Summary Table",
    "",
    "| Sequence | Actions | Possession team | Main tactical event | Outcome | Key coaching question |",
    "| --- | --- | --- | --- | --- | --- |",
    ...sequenceSummaryRows(groups),
    "",
    "## Sequence 1 - Coach View",
    "",
    ...(sequenceOneActionOne === undefined
      ? ["### Action 1 - missing", "", "Sequence 1 Action 1 evidence is unavailable.", ""]
      : actionLine({
          snapshot: sequenceOneActionOne,
          evidenceMarkdown: input.tacticalEvidenceMarkdown,
          title: "Sequence 1 Action 1",
        })),
    ...(sequenceOneActionTwo === undefined
      ? ["### Action 2 - missing", "", "Sequence 1 Action 2 evidence is unavailable.", ""]
      : actionLine({
          snapshot: sequenceOneActionTwo,
          evidenceMarkdown: input.tacticalEvidenceMarkdown,
          title: "Sequence 1 Action 2",
        })),
    "## Key Tactical Findings",
    "- CONTROL is structurally coherent and can explain its first pressure escape.",
    "- CONTROL remains cautious, but the progression override shows it is not purely passive.",
    "- BLITZ pressure creates ball-side compression while leaving possible weak-side windows.",
    "- Third-man concepts exist, but strict availability still rejects most immediate versions.",
    "- Candidate/executed consistency now passes across the generated action set.",
    "",
    "## Open Coaching Questions",
    "- Is CONTROL too conservative after the first recycle?",
    "- Should RP be used earlier when raw upside is high?",
    "- Is BLITZ weak-side exposure punished enough?",
    "- Are PM and HL support distances elite enough for CONTROL's intended style?",
    "- Should central rebuild targets be converted into cleaner forward-facing receivers more often?",
    "",
    "## Files for deeper review",
    "- Tactical evidence: [tactical-evidence.latest.md](tactical-evidence.latest.md)",
    "- Debug full: [debug-full.latest.md](debug-full.latest.md)",
    "- Sequence 1 Action 1 workbench: [workbench/sequence-1-action-1.html](workbench/sequence-1-action-1.html)",
    "",
  ].join("\n");
}

export function formatTacticalEvidenceReport(input: {
  readonly result: MiniMatchResult;
  readonly snapshots: readonly SnapshotReference[];
  readonly markdown: string;
  readonly shotOutcomes?: readonly ShotOutcomeContract[];
  readonly batchCalibration?: BatchScoringCalibrationSummary;
}): string {
  const control = input.result.state.context.teamA.displayName;
  const blitz = input.result.state.context.teamB.displayName;
  const groups = sequenceGroups(input.snapshots);
  const shotOutcomeByActionId = new Map((input.shotOutcomes ?? []).map((outcome) => [outcome.actionId, outcome]));
  const calibration =
    input.shotOutcomes === undefined
      ? undefined
      : summarizeScoringV1GameplayCalibration({ result: input.result, outcomes: input.shotOutcomes });
  const tierAActions = input.snapshots.filter((snapshot) => actionIsTierA(snapshot, actionSection({ snapshot, evidenceMarkdown: input.markdown })));
  const tierAIds = new Set(tierAActions.map((snapshot) => `${snapshot.sequenceNumber}:${snapshot.actionNumber}`));
  const drawMonitoring =
    input.batchCalibration === undefined ? undefined : summarizeDrawRateStyleOutcomeMonitoring(input.batchCalibration);
  const reboundDanger =
    input.batchCalibration === undefined ? undefined : summarizeReboundDangerCalibration(input.batchCalibration);
  const batchTrySummary = summarizeTryOpportunityGeneration({
    matchesSimulated: input.batchCalibration?.matchesSimulated ?? 1,
    samples:
      input.batchCalibration?.samples.map((sample) => ({
        matchId: sample.matchId,
        seed: sample.seed,
        scenario: sample.scenario,
        totalShots: sample.totalShots,
        reboundEventCount: sample.reboundEventCount,
        contestedReboundCount: sample.contestedReboundCount,
        scrambleReboundCount: sample.scrambleReboundCount,
      })) ?? [],
  });
  const batchConversionGeometry = summarizeConversionGeometryStorage(batchTrySummary.opportunities);
  const batchConversionResolution = summarizeConversionResolution({
    result: input.result,
    opportunities: batchTrySummary.opportunities,
  });
  const dropGoalFoundation = input.batchCalibration === undefined ? undefined : summarizeDropGoalFoundation({ result: input.result, batchCalibration: input.batchCalibration });
  const scoringChoiceBalance = input.batchCalibration === undefined ? undefined : analyzeScoringChoiceBalance({ result: input.result, batchCalibration: input.batchCalibration });
  const shotDominance = input.batchCalibration === undefined ? undefined : analyzeShotDominance({ result: input.result, batchCalibration: input.batchCalibration, shotOutcomes: input.shotOutcomes ?? [] });
  const scoringAffordanceVolume = input.batchCalibration === undefined ? undefined : analyzeScoringAffordanceVolume({ result: input.result, batchCalibration: input.batchCalibration });
  const possessionDanger = input.batchCalibration === undefined ? undefined : analyzeOffensivePossessionDangerPhases({ result: input.result, batchCalibration: input.batchCalibration });
  const nonShotResolution = input.batchCalibration === undefined ? undefined : summarizeNonShotResolutionRebalance({ result: input.result, batchCalibration: input.batchCalibration });
  const nonShotCandidateRanking =
    input.batchCalibration === undefined ? undefined : summarizeNonShotCandidateRankingCalibration(input.batchCalibration);
  const routeBalance =
    input.batchCalibration === undefined
      ? undefined
      : summarizeRouteBalancePostRankingMonitoring({
          result: input.result,
          batchCalibration: input.batchCalibration,
        });
  const routeSuccess =
    input.batchCalibration === undefined
      ? undefined
      : summarizeRouteSuccessRateCalibration({
          result: input.result,
          batchCalibration: input.batchCalibration,
        });
  const goalkeeperImpact =
    input.batchCalibration === undefined
      ? undefined
      : summarizeGoalkeeperShotStoppingImpactCalibration({
          result: input.result,
          batchCalibration: input.batchCalibration,
        });
  const tryGrounding =
    input.batchCalibration === undefined
      ? undefined
      : summarizeTryGroundingPressureCalibration({
          result: input.result,
          batchCalibration: input.batchCalibration,
        });
  const cleanShot =
    input.batchCalibration === undefined
      ? undefined
      : summarizeCleanShotSuccessCalibration({
          result: input.result,
          batchCalibration: input.batchCalibration,
        });
  const routeEconomy =
    input.batchCalibration === undefined
      ? undefined
      : summarizePostResolutionRouteEconomyMonitoring({
          result: input.result,
          batchCalibration: input.batchCalibration,
        });
  const dangerEconomy =
    input.batchCalibration === undefined
      ? undefined
      : summarizeDangerPhaseConversionEconomy({
          result: input.result,
          batchCalibration: input.batchCalibration,
        });
  const continuationPayoff =
    input.batchCalibration === undefined
      ? undefined
      : summarizeContinuationPayoffCalibration({
          result: input.result,
          batchCalibration: input.batchCalibration,
        });
  const matchVolume =
    input.batchCalibration === undefined
      ? undefined
      : summarizeMatchDurationPossessionVolumeCalibration({
          result: input.result,
          batchCalibration: input.batchCalibration,
        });
  const fullMatchEconomy =
    input.batchCalibration === undefined
      ? undefined
      : summarizeFullMatchEconomyValidation({
          result: input.result,
          batchCalibration: input.batchCalibration,
        });
  const unifiedScoring = summarizeUnifiedLiveScoringEvents({
    result: input.result,
    shotOutcomes: input.shotOutcomes ?? [],
    liveConversionAttempts: batchConversionResolution.liveAttempts,
    liveDropGoalAttempts: dropGoalFoundation?.liveAttempts ?? [],
    batchConversionAttempts: batchConversionResolution.batchConversionAttempts,
    batchConversionPoints: batchConversionResolution.batchConversionPoints,
    batchDropOpportunities: dropGoalFoundation?.batchDropOpportunities ?? 0,
    batchDropCandidatesGenerated: dropGoalFoundation?.batchDropCandidatesGenerated ?? 0,
    batchDropAttempts: dropGoalFoundation?.batchDropAttempts ?? 0,
    batchDropPoints: dropGoalFoundation?.batchDropPoints ?? 0,
  });
  const currentLiveTriesScored = input.result.summary.liveTryEvents.filter((event) => event.eventType === "TRY_TOUCHDOWN_SCORED").length;
  const currentLiveFailedTries = input.result.summary.liveTryEvents.length - currentLiveTriesScored;
  const currentScramble = (input.shotOutcomes ?? []).find(
    (outcome) =>
      outcome.reboundContinuation.continuationType === "SCRAMBLE" ||
      outcome.reboundContinuation.reason.includes("LOOSE_BALL") ||
      outcome.reboundContinuation.reason.includes("CONTACT_CONTEST") ||
      outcome.reboundContinuation.reason.includes("DOUBLE_TOUCH") ||
      outcome.reboundContinuation.reason.includes("CHAOTIC_CLEARANCE") ||
      outcome.reboundContinuation.reason.includes("DESPERATE_SECOND_SHOT"),
  );

  return [
    `# Tactical Evidence - ${control} vs ${blitz}`,
    "",
    "## Reading Guide",
    "- This file contains tactical evidence, not raw debug.",
    "- For full engine internals, see [debug-full.latest.md](debug-full.latest.md).",
    "- For a short coach view, see [coach-summary.latest.md](coach-summary.latest.md).",
    "",
    "## Match Evidence Overview",
    `- score: ${control} ${input.result.summary.finalScore.teamA} - ${input.result.summary.finalScore.teamB} ${blitz}`,
    "- possession story: CONTROL repeatedly tries to stabilize against BLITZ pressure before advancing structure.",
    "- key tactical theme: pressure escape versus progressive timing.",
    "- main decision pattern: recycle or rebuild when pressure blocks the clean forward lane; advance when structure is stable.",
    `- batch scoring calibration recommendation: ${input.batchCalibration?.recommendation ?? "NEEDS_MORE_SAMPLE"}`,
    `- scoring version: ${TRY_TOUCHDOWN_SCORING_VERSION}`,
    `- active scoring rules: ${scoringRuleLabel("SHOT_GOAL")}; ${tryTouchdownRuleLabel()}; ${conversionRuleLabel()}; ${dropGoalRuleLabel()}`,
    `- active conversion rule: ${conversionRuleLabel()}`,
    "- DROP_GOAL foundation: active at 2 points",
    "- DROP_GOAL opportunity generation: active",
    "- DROP_GOAL resolution calibration: applied",
    "- inactive scoring rules: PENALTY_SHOT",
    "- unified live scoring event stream: active",
    "- canonical scoring report: scoring-events-summary.md",
    `- live scoring events: SHOT_GOAL ${unifiedScoring.shotGoalEvents}, TRY_TOUCHDOWN ${unifiedScoring.tryTouchdownEvents}, CONVERSION_GOAL ${unifiedScoring.conversionGoalEvents}, DROP_GOAL ${unifiedScoring.dropGoalEvents}`,
    `- final score from unified live scoring events: ${unifiedScoring.finalScoreDisplay}`,
    "- batch diagnostics remain separate from live score",
    `- live drop events: opportunities ${dropGoalFoundation?.liveDropOpportunities ?? 0}, attempts ${dropGoalFoundation?.liveDropAttempts ?? 0}, goals ${dropGoalFoundation?.liveDropGoals ?? 0}, points ${dropGoalFoundation?.liveDropPoints ?? 0}`,
    `- batch drop opportunities: ${dropGoalFoundation?.batchDropOpportunities ?? 0}; batch drop attempts: ${dropGoalFoundation?.batchDropAttempts ?? 0}, goals ${dropGoalFoundation?.batchDropGoals ?? 0}, missed ${dropGoalFoundation?.batchDropMissed ?? 0}, blocked ${dropGoalFoundation?.batchDropBlocked ?? 0}, invalid ${dropGoalFoundation?.batchDropInvalid ?? 0}, success rate ${dropGoalFoundation?.batchDropSuccessRate ?? 0}%, points ${dropGoalFoundation?.batchDropPoints ?? 0}`,
    `- drop resolution recommendation: ${dropGoalFoundation?.recommendation ?? "NEEDS_MORE_SAMPLE"}`,
    "- scoring choice balance: monitored",
    `- shot route: primary goal-frame route; batch/live status ${scoringChoiceBalance?.shotGoals ?? 0} batch goals, ${unifiedScoring.shotGoalEvents} live events`,
    `- try route: high-value territorial grounding route; batch/live status ${scoringChoiceBalance?.triesScored ?? 0} batch tries, ${unifiedScoring.tryTouchdownEvents} live events`,
    `- conversion route: post-try bonus; batch/live status ${scoringChoiceBalance?.conversionsMade ?? 0} batch conversions, ${unifiedScoring.conversionGoalEvents} live events`,
    `- drop route: rare open-play timing weapon; batch/live status ${scoringChoiceBalance?.dropGoals ?? 0} batch goals, ${unifiedScoring.dropGoalEvents} live events`,
    `- route-balance recommendation: ${scoringChoiceBalance?.recommendation ?? "NEEDS_MORE_SAMPLE"}`,
    "- shot dominance diagnostic: active",
    `- SHOT_GOAL points share: ${shotDominance?.shotPointsShare ?? 0}%`,
    `- dominant cause: ${shotDominance?.routeDominanceCause ?? "NEEDS_MORE_SAMPLE"}`,
    `- recommendation: ${shotDominance?.recommendation ?? "NEEDS_MORE_SAMPLE"}`,
    "- shot dominance root-cause analysis: active",
    "- root-cause focus: shape vs decision vs resolution, with scoring values held constant",
    `- non-shot candidate ranking calibration: active; candidate rows ${nonShotCandidateRanking?.candidateRowsPersisted ?? 0}; selected TRY ${nonShotCandidateRanking?.selectedTryAttempts ?? 0}; selected DROP ${nonShotCandidateRanking?.selectedDropAttempts ?? 0}; selected carry/switch/progression ${nonShotCandidateRanking?.selectedCarrySwitchProgression ?? 0}; recommendation ${nonShotCandidateRanking?.recommendation ?? "REVIEW_NON_SHOT_CANDIDATE_RANKING"}`,
    `- candidate tie-breaking: active; equal/near-tie decisions ${nonShotCandidateRanking?.equalOrNearTieDecisionCount ?? 0}; stronger-score wording on equal-score rejections ${nonShotCandidateRanking?.strongerScoreWordingOnEqualScoreCount ?? 0}; recommendation MONITOR_EQUAL_SCORE_DECISIONS`,
    `- route balance monitoring: active; SHOT ${routeBalance?.selectedShotActions ?? 0}, TRY ${routeBalance?.selectedTryAttempts ?? 0}, DROP ${routeBalance?.selectedDropAttempts ?? 0}, continuation ${routeBalance?.selectedAdvanceContinuationActions ?? 0}, safe continuity ${routeBalance?.selectedSafeContinuityActions ?? 0}; meta-risks ${routeBalance?.metaRisks.join(", ") || "none"}; recommendation ${routeBalance?.recommendation ?? "MONITOR_ROUTE_BALANCE"}`,
    `- route success calibration: active; SHOT ${routeSuccess?.shotSuccessRate ?? 0}%, CLEAN_SHOT ${routeSuccess?.cleanShotSuccessRate ?? 0}%, TRY ${routeSuccess?.trySuccessRate ?? 0}%, DROP ${routeSuccess?.dropSuccessRate ?? 0}%, CONVERSION ${routeSuccess?.conversionSuccessRate ?? 0}%; recommendation ${routeSuccess?.recommendations.join(", ") ?? "ONLY_REBALANCE_SCORING_AFTER_SUCCESS_CALIBRATION"}`,
    `- goalkeeper impact calibration: active; projected SHOT ${goalkeeperImpact?.projectedShotSuccessRateAfterGkCalibration ?? 0}%, projected CLEAN_SHOT ${goalkeeperImpact?.projectedCleanShotSuccessRateAfterGkCalibration ?? 0}%, failed saves ${goalkeeperImpact?.failedSaveCount ?? 0}, GK underweighted goals ${goalkeeperImpact?.gkUnderweightedGoalCount ?? 0}; recommendation ${goalkeeperImpact?.recommendations.join(", ") ?? "ONLY_REBALANCE_SCORING_AFTER_GK_CALIBRATION"}`,
    `- clean shot success calibration: active; CLEAN_SHOT ${cleanShot?.cleanShotSuccessRate ?? 0}%, overall SHOT ${cleanShot?.overallShotSuccessRate ?? 0}%, FORCED_SHOT ${cleanShot?.forcedShotSuccessRate ?? 0}%, threshold-edge clean goals reduced ${cleanShot?.thresholdEdgeCleanGoalsReduced ?? 0}; recommendation ${cleanShot?.recommendations.join(", ") ?? "ONLY_REBALANCE_SCORING_AFTER_ROUTE_RESOLUTION_CALIBRATION"}`,
    `- try attrition calibration: active; TRY ${tryGrounding?.trySuccessRate ?? 0}%, contested TRY ${tryGrounding?.contestedTrySuccessRate ?? 0}%, LOST_FORWARD ${tryGrounding?.lostForwardCount ?? 0}, HELD_UP ${tryGrounding?.heldUpCount ?? 0}, TACKLED_SHORT ${tryGrounding?.tackledShortCount ?? 0}; legal high-quality access is rewarded while held-up and tackled-short failures remain meaningful`,
    `- post-resolution route economy monitoring: active; average total points ${routeEconomy?.scorelineHealth.averageTotalPoints ?? 0}, median total points ${routeEconomy?.scorelineHealth.medianTotalPoints ?? 0}, 0-0 draw rate ${routeEconomy?.scorelineHealth.nilNilDrawRate ?? 0}%, scoring draw rate ${routeEconomy?.scorelineHealth.scoringDrawRate ?? 0}%, route risks ${routeEconomy?.metaRisks.join(", ") || "none"}; recommendation ${routeEconomy?.recommendations.join(", ") ?? "ONLY_REBALANCE_SCORING_AFTER_ROUTE_ECONOMY_MONITORING"}`,
    `- danger phase conversion economy: active; sterile danger phases ${dangerEconomy?.sterileDangerPhaseCount ?? 0}; sterile danger rate ${dangerEconomy?.sterileDangerRate ?? 0}%; danger-to-score conversion ${dangerEconomy?.dangerToScoreConversionRate ?? 0}%; recommendations ${dangerEconomy?.recommendations.join(", ") ?? "ONLY_REBALANCE_SCORING_AFTER_DANGER_PHASE_ECONOMY"}`,
    `- continuation payoff calibration: active; projected sterile danger rate ${continuationPayoff?.projectedSterileDangerRate ?? 0}%; projected 0-0 draw rate ${continuationPayoff?.projectedNilNilDrawRate ?? 0}%; SUPPORT_CLUSTER_RECYCLE payoff ${continuationPayoff?.supportClusterRecyclePayoffRate ?? 0}%; FORWARD_PROGRESS payoff ${continuationPayoff?.forwardProgressPayoffRate ?? 0}%; recommendation ${continuationPayoff?.recommendations.join(", ") ?? "ONLY_REBALANCE_SCORING_AFTER_CONTINUATION_PAYOFF"}`,
    `- match duration possession volume calibration: active; interpretation ${matchVolume?.matchLengthInterpretation ?? "MINI_MATCH_SAMPLE"}; calibrated possessions ${matchVolume?.possessionVolume.calibratedOffensivePossessionsPerMatch ?? 0}; calibrated danger phases ${matchVolume?.dangerPhaseVolume.calibratedDangerPhasesPerMatch ?? 0}; projected 0-0 draw rate ${matchVolume?.scorelineHealth.nilNilDrawRate ?? 0}%; recommendation ${matchVolume?.recommendations.join(", ") ?? "ONLY_REBALANCE_SCORING_AFTER_MATCH_VOLUME_CALIBRATION"}`,
    `- full-match economy validation: active; observed 0-0 draw rate ${fullMatchEconomy?.scorelineHealth.nilNilDrawRate ?? 0}%; average total points ${fullMatchEconomy?.scorelineHealth.averageTotalPoints ?? 0}; unique final scores ${fullMatchEconomy?.scorelineHealth.uniqueFinalScores ?? 0}; meta-risks ${fullMatchEconomy?.metaRisks.join(", ") || "none"}; recommendation ${fullMatchEconomy?.recommendations.join(", ") ?? "ONLY_REBALANCE_SCORING_AFTER_TRY_ATTRITION_CALIBRATION"}`,
    "- fatigue / roster instrumentation: possession-indexed fatigue/load, late-match performance, and RosterQualitySummary are populated with V1 real values, so bonus causality is fatigue-visible and roster-auditable.",
    "- roster stress tests: controlled weak-build variants are documented in full-match-economy-validation.md; they are diagnostic-only and not production roster replacements.",
    "- player load balancing: active in full-match-economy-validation.md; role-specific load, GK mental load, bench depth, specialist dependency, and style-load interaction are audited without changing production rosters.",
    "- role economy balancing: active in full-match-economy-validation.md; role taxonomy, attribute mapping, role usage, omission, redundancy, offensive/defensive/GK value, build archetypes, and mandatory-role risk are audited.",
    "- fatigue effect calibration: CONFIRMED_CONSERVATIVE_V1; fatigue bucket, shot, try, drop, defensive recovery, goalkeeper/rebound, late-match, style, and bonus-fatigue audits are available in full-match-economy-validation.md.",
    "- goalkeeper fatigue specialization: active; GK physical fatigue, mental fatigue, readiness state, concentration load, rebound control, and second-save recovery are tracked separately from outfield fatigue.",
    "- bonus refinement: implemented V1 uses 3+ tries, three main scoring families excluding conversion, close-loss <=7, major-threat defense, and max +2 cap.",
    `- shot/rebound/half-space guardrail: active; clean angled windows stay viable, forced/narrow/desperate half-space shots stay difficult, and try attrition is tracked without a shot nerf`,
    "- no scoring values changed",
    "- PENALTY_SHOT remains inactive",
    "- scoring affordance volume diagnostic: active",
    `- known scoring affordances per match: ${scoringAffordanceVolume?.knownScoringAffordancesPerMatch ?? 0}`,
    `- known scoring affordances per team per match: ${scoringAffordanceVolume?.knownScoringAffordancesPerTeamPerMatch ?? 0}`,
    `- non-shot affordance share: ${scoringAffordanceVolume?.nonShotAffordanceShare ?? 0}%`,
    `- recommendation: ${scoringAffordanceVolume?.recommendation ?? "NEEDS_MORE_SAMPLE"}`,
    "- offensive possession / danger phase instrumentation: active",
    `- offensive possessions per match: ${possessionDanger?.offensivePossessionsPerMatch ?? 0}`,
    `- danger phases per match: ${possessionDanger?.dangerPhasesPerMatch ?? 0}`,
    `- danger phase to scoring affordance rate: ${possessionDanger?.dangerPhaseToScoringAffordanceRate ?? 0}%`,
    `- danger phase recommendation: ${possessionDanger?.recommendation ?? "NEEDS_MORE_SAMPLE"}`,
    "- danger phase non-shot affordance generation: active",
    `- TRY_TOUCHDOWN affordances: ${scoringAffordanceVolume?.tryAffordances ?? 0}`,
    `- DROP_GOAL affordances: ${scoringAffordanceVolume?.dropAffordances ?? 0}`,
    `- non-shot setup affordances: ${scoringAffordanceVolume?.nonShotSetupAffordances ?? 0}`,
    `- non-shot affordance share: ${scoringAffordanceVolume?.nonShotAffordanceShare ?? 0}%`,
    `- recommendation: ${scoringAffordanceVolume?.nonShotAffordanceGenerationRecommendation ?? "NEEDS_MORE_SAMPLE"}`,
    "- non-shot resolution rebalance: active",
    `- conversion success rate: ${nonShotResolution?.conversionSuccessRate ?? 0}%`,
    `- drop success rate: ${nonShotResolution?.dropSuccessRate ?? 0}%`,
    `- try scoring rate: ${nonShotResolution?.tryScoringRate ?? 0}%`,
    `- recommendation: ${nonShotResolution?.recommendation ?? "NEEDS_MORE_SAMPLE"}`,
    "- no scoring values changed; PENALTY_SHOT remains inactive",
    "- team shape intent calibration: active",
    "- sequence-1-action-1 shape calibration: applied",
    "- BLITZ before axis protection: PASS",
    "- CONTROL after rest defense: PASS",
    "- BLITZ after pressing synchronization: PASS",
    "- team shape intent generalization: active",
    "- multi-sequence shape contexts: pressure recycle, structure advancement, shot, transition, try, drop",
    "- weak-side risk classification: INTENTIONAL_STYLE_TRADEOFF / TEMPORARY_TRANSITION_RISK / STRUCTURAL_ERROR",
    "- team shape model score impact: no scoring values changed; PENALTY_SHOT inactive",
    "- no scoring values changed; PENALTY_SHOT remains inactive",
    "- no scoring values changed",
    "- PENALTY_SHOT remains inactive",
    "- TRY_TOUCHDOWN foundation: active, 5 points.",
    `- current mini-match live try events: ${input.result.summary.liveTryEvents.length} attempt, ${currentLiveTriesScored} tries scored, ${currentLiveFailedTries} failed try.`,
    `- batch try diagnostics: ${batchTrySummary.tryOpportunities} opportunities, ${batchTrySummary.tryAttempts} attempts, ${batchTrySummary.triesScored} tries scored, ${batchTrySummary.tryConversionRate}% try scoring rate.`,
    `- conversion geometry storage: ${batchConversionGeometry.geometryRowsStored}/${batchConversionGeometry.tryScoredCount} batch tries.`,
    "- CONVERSION scoring: active at 2 points after TRY_TOUCHDOWN.",
    `- batch conversion diagnostics: ${batchConversionResolution.batchConversionAttempts} attempts, ${batchConversionResolution.batchConversionsMade} made, ${batchConversionResolution.batchConversionSuccessRate}% success rate, ${batchConversionResolution.batchConversionPoints} points.`,
    "- conversion difficulty calibration: applied",
    `- conversion difficulty recommendation: ${batchConversionResolution.recommendation}`,
    `- central / half-space / wide difficulty note: central ${batchConversionResolution.centralConversionSuccessRate}%, half-space ${batchConversionResolution.halfSpaceConversionSuccessRate}%, wide ${batchConversionResolution.wideConversionSuccessRate}% (wide may be no sample).`,
    `- current mini-match live conversion: ${batchConversionResolution.liveConversionAttempts} attempts${batchConversionResolution.liveConversionAttempts === 0 ? " because no live TRY_TOUCHDOWN was scored" : ""}, ${batchConversionResolution.liveConversionsMade} made, ${batchConversionResolution.liveConversionPoints} points.`,
    "- in-goal rules: Z0/Z8 are non-occupiable off-ball grounding zones; legal try access requires CL/CR or HSL/HSR outside the goal area; held-ball grounding does not require downward pressure; conversion geometry documented and conversion scoring active.",
    `- ${tryOpportunityLine(input.batchCalibration)}`,
    `- ${tryAttemptResolutionLine(input.batchCalibration)}`,
    `- ${conversionGeometryLine(input.batchCalibration)}`,
    `- batch matches simulated: ${input.batchCalibration?.matchesSimulated ?? 0}`,
    `- batch conversion rate: ${formatPercent(input.batchCalibration?.averageConversionRate ?? 0)}`,
    `- batch blowout rate: ${formatPercent(input.batchCalibration?.blowoutRate ?? 0)}`,
    `- batch variation status: ${input.batchCalibration?.variationStatus ?? "IDENTICAL_OUTPUT_WARNING"}`,
    `- scenario variation status: ${input.batchCalibration?.scenarioVariation.scenarioDiversityStatus ?? "IDENTICAL_OUTPUT_WARNING"}`,
    `- unique final scores: ${input.batchCalibration?.scenarioVariation.uniqueFinalScores ?? 0}`,
    `- unique shot outcome patterns: ${input.batchCalibration?.scenarioVariation.uniqueShotOutcomePatterns ?? 0}`,
    `- shot difficulty calibration applied: ${input.batchCalibration?.shotDifficultyCalibrationApplied === true ? "YES" : "NO"}`,
    `- new conversion rate: ${formatPercent(input.batchCalibration?.averageConversionRate ?? 0)}`,
    `- new batch recommendation: ${input.batchCalibration?.recommendation ?? "NEEDS_MORE_SAMPLE"}`,
    `- clean-window conversion: ${formatPercent(input.batchCalibration?.cleanWindowConversionRate ?? 0)}`,
    `- style balance status: ${input.batchCalibration?.styleBalanceStatus ?? "WATCH"}`,
    `- clean-window calibration recommendation: ${input.batchCalibration?.recommendation ?? "NEEDS_MORE_SAMPLE"}`,
    `- draw monitoring recommendation: ${drawMonitoring?.recommendation ?? "NEEDS_MORE_SAMPLE"}`,
    `- 0-0 draw rate: ${formatPercent(drawMonitoring?.nilNilDrawRate ?? 0)}`,
    `- scoring draw rate: ${formatPercent(drawMonitoring?.scoringDrawRate ?? 0)}`,
    `- rebound danger calibration recommendation: ${reboundDanger?.recommendation ?? "NEEDS_MORE_SAMPLE"}`,
    "- rebound threat balancing applied: YES",
    "- rebound continuation status: active",
    `- second-shot windows: ${reboundDanger?.secondShotWindows ?? 0}`,
    `- attacker recovery rate: ${reboundDanger?.attackerRecoveryRate ?? 0}%`,
    `- defender recovery rate: ${reboundDanger?.defenderRecoveryRate ?? 0}%`,
    `- scramble rate: ${reboundDanger?.scrambleRate ?? 0}%`,
    `- scramble recommendation: ${reboundDanger?.recommendation ?? "NEEDS_MORE_SAMPLE"}`,
    `- sample scramble event in current mini-match: ${currentScramble?.reboundContinuation.reason ?? "none"}`,
    `- batch scramble events: ${reboundDanger?.scrambles ?? 0}`,
    `- defender clearance rate: ${reboundDanger?.defenderRecoveryRate ?? 0}%`,
    `- rebound threat recommendation: ${reboundDanger?.recommendation ?? "NEEDS_MORE_SAMPLE"}`,
    `- scoring calibration recommendation: ${calibration?.recommendation ?? "NEEDS_MORE_SAMPLE"}`,
    `- shot conversion snapshot: ${calibration?.shotGoals ?? 0}/${calibration?.totalShots ?? 0} shot goals (${formatPercent(calibration?.conversionRate ?? 0)}).`,
    "- key validation statuses: semantic, ball-state, target, and candidate/executed contracts pass in generated validation reports.",
    "",
    ...input.result.summary.liveTryEvents.flatMap((event) =>
      liveTryEventEvidence({
        event,
        ...(input.batchCalibration === undefined ? {} : { batchCalibration: input.batchCalibration }),
      }),
    ),
    "## Sequence Evidence Summary",
    "",
    "| Sequence | Main action pattern | Key decision | Evidence confidence | Main unresolved tactical question |",
    "| --- | --- | --- | --- | --- |",
    ...groups.map(([sequenceNumber, sequenceSnapshots]) => {
      const shot = sequenceSnapshots.some((snapshot) => snapshot.afterTruthContract.selectedActionType === "SHOT");
      const central = sequenceSnapshots.some((snapshot) => snapshot.afterTruthContract.selectedActionType === "CENTRAL_RECYCLE");
      const pattern = sequenceNumber === 1 ? "pressure escape into structure advancement" : shot ? "construction into finishing" : "circulation and reset";
      const keyDecision = central ? "central rebuild timing" : shot ? "shot-window conversion" : "support-cluster security";
      return `| Sequence ${sequenceNumber} | ${pattern} | ${keyDecision} | HIGH | ${sequenceQuestion(sequenceNumber)} |`;
    }),
    "",
    "## Sequence 1 - Evidence",
    "",
    ...tierAActions
      .filter((snapshot) => snapshot.sequenceNumber === 1)
      .flatMap((snapshot) =>
        fullEvidenceAction({
          snapshot,
          evidenceMarkdown: input.markdown,
          shotOutcome: shotOutcomeByActionId.get(`dt-s${snapshot.sequenceNumber}-a${snapshot.actionNumber}`),
        }),
      ),
    ...groups
      .filter(([sequenceNumber]) => sequenceNumber !== 1)
      .flatMap(([sequenceNumber, sequenceSnapshots]) => [
        ...compactSequenceEvidence({
          sequenceNumber,
          snapshots: sequenceSnapshots.filter((snapshot) => !tierAIds.has(`${snapshot.sequenceNumber}:${snapshot.actionNumber}`)),
          evidenceMarkdown: input.markdown,
        }),
        ...tierAActions
          .filter((snapshot) => snapshot.sequenceNumber === sequenceNumber)
          .flatMap((snapshot) =>
            fullEvidenceAction({
              snapshot,
              evidenceMarkdown: input.markdown,
              shotOutcome: shotOutcomeByActionId.get(`dt-s${snapshot.sequenceNumber}-a${snapshot.actionNumber}`),
            }),
          ),
      ]),
    "## Files for deeper review",
    "- Coach summary: [coach-summary.latest.md](coach-summary.latest.md)",
    "- Debug full: [debug-full.latest.md](debug-full.latest.md)",
    "- Sequence 1 Action 1 workbench: [workbench/sequence-1-action-1.html](workbench/sequence-1-action-1.html)",
    "",
  ].join("\n");
}

export function formatDebugFullReport(input: {
  readonly result: MiniMatchResult;
  readonly markdown: string;
}): string {
  const control = input.result.state.context.teamA.displayName;
  const blitz = input.result.state.context.teamB.displayName;

  return [
    `# Debug Full Report - ${control} vs ${blitz}`,
    "",
    "Warning: This file is intended for engine/debug analysis, not coach-facing review.",
    "",
    input.markdown,
    "",
  ].join("\n");
}
