import type { MiniMatchResult } from "../simulation/miniMatch";
import type { TacticalLogLine } from "../systems/interactions/shared";
import { TacticalStyle } from "../models/tactics";
import type { SnapshotReference } from "./visualization";
import type { TacticalStoryboardReference } from "./storyboard";
import { SupportStatus, type PlayerMatchState } from "../systems/players";
import { AttackingDirection } from "../systems/spatial/intention";
import {
  ReceptionFollowUpRole,
  ReceptionQualityLevel,
  applyReceptionUpgrade,
  evaluateReceptionQualities,
  type ReceptionQualityEvaluation,
} from "../systems/spatial";
import { PatternType, chainPath, evaluateReceptionChains, laneStateForReception, type ReceptionChain } from "../systems/tactics";
import { DEFAULT_SIMULATION_CONFIG } from "../systems/matchLoop";
import { INTENT_ENGINE_CONFIG } from "../config/intentConfig";
import {
  evaluateFunctionalOccupation,
  formatFunctionalOccupationMarkdown,
  resolveFunctionalOccupationSpatialTargets,
} from "../systems/occupation";
import {
  buildDecisionNarrative,
  calibrateActionSelection,
  summarizeActionSelectionDiagnostic,
  summarizeCandidateScore,
  type ActionSelectionDiagnostic,
} from "../systems/decision";
import { generateActionSemanticReason } from "../systems/actions";
import { describeTargetSemantics } from "../systems/targets";
import type { ZoneId } from "../core/zones";

function labelPreResolutionDebugLine(line: string): string {
  const staleTokens = ["FL@Z5-C", "SH@Z5-CR", "ML@Z3-C"];

  if (
    staleTokens.some((token) => line.includes(token)) &&
    !line.includes("DEBUG_FULL") &&
    !line.includes("pre-resolution")
  ) {
    return `DEBUG_FULL / legacy spatial source, not coach-facing: ${line}`;
  }

  return line;
}

function labelPreResolutionDebugText(markdown: string): string {
  return markdown.split("\n").map(labelPreResolutionDebugLine).join("\n");
}

function coachReportText(markdown: string): string {
  return removeCoachFacingCandidateRankingDebug(labelPreResolutionDebugText(markdown))
    .split("\n")
    .filter((line) => !line.startsWith("DEBUG_FULL / legacy spatial source"))
    .filter((line) => !line.startsWith("Selected target:"))
    .join("\n")
    .replace(/Best continuation/g, "Best follow-up role")
    .replace(/third-man continuation/g, "chain continuation value")
    .replace(/chain continuation value value/g, "chain continuation value")
    .replace(/Third-Man Value/g, "Potential third-man value")
    .replace(/Z4-CL -> Z5-C PROGRESSION/g, "Z4-CL -> Z5-C CENTRAL_REBUILD");
}

function debugReportText(markdown: string): string {
  return labelPreResolutionDebugText(markdown).replace(/^### .* Attacking Team Reasoning$/gm, "### Candidate Ranking Debug");
}

function removeCoachFacingCandidateRankingDebug(markdown: string): string {
  const lines = markdown.split("\n");
  const filtered: string[] = [];
  let skippingLegacyDecisionBlock = false;

  for (const line of lines) {
    if (/^### .* Attacking Team Reasoning$/.test(line)) {
      skippingLegacyDecisionBlock = true;
      continue;
    }

    if (skippingLegacyDecisionBlock && /^#{2,4} /.test(line)) {
      skippingLegacyDecisionBlock = false;
    }

    if (!skippingLegacyDecisionBlock) {
      filtered.push(line);
    }
  }

  return filtered.join("\n");
}

export type MiniMatchReportMode = "COACH_REPORT" | "DEBUG_FULL_REPORT";

function shouldSkipDecorativeLine(text: string): boolean {
  return text === "==============================" || text.startsWith("MINI MATCH:");
}

function formatSnapshotBlock(
  sequenceNumber: number,
  snapshots: readonly SnapshotReference[],
  debugTimelinePath: string | null,
  storyboards: readonly TacticalStoryboardReference[] = [],
): string {
  const sequenceSnapshots = snapshots.filter((snapshot) => snapshot.sequenceNumber === sequenceNumber);

  if (sequenceSnapshots.length === 0) {
    return "";
  }

  function formatPlayerList(players: readonly PlayerMatchState[]): string {
    return players.map((player) => `${player.roleInitials}@${player.zone}`).join(", ") || "none";
  }

  function escapeTableCell(value: string): string {
    return value.replace(/\|/g, "/");
  }

  function findPlayer(players: readonly PlayerMatchState[], playerId: string | null): PlayerMatchState | null {
    if (playerId === null || playerId.length === 0) {
      return null;
    }

    return players.find((player) => player.playerId === playerId) ?? null;
  }

  function teamStyleForReport(teamName: string): "CONTROL" | "BLITZ" {
    return teamName.toUpperCase().includes("BLITZ") ? "BLITZ" : "CONTROL";
  }

  function tacticalStyleForReport(teamName: string): TacticalStyle {
    return teamName.toUpperCase().includes("BLITZ") ? TacticalStyle.Blitz : TacticalStyle.Control;
  }

  function applyResolvedCoachPositions(snapshot: SnapshotReference): SnapshotReference {
    const resolution = resolveFunctionalOccupationSpatialTargets({
      players: snapshot.beforeMetadata.playerStates,
      possessionTeamId: snapshot.beforeTruthContract.possessionTeamId,
      ballCarrierId: snapshot.beforeTruthContract.ballCarrierId,
      ballZone: snapshot.beforeTruthContract.ballZone as ZoneId,
      attackingDirection:
        snapshot.attackingDirection === AttackingDirection.Z1ToZ7 ? "LEFT_TO_RIGHT" : "RIGHT_TO_LEFT",
      phaseState: String(snapshot.phaseState),
      teamStyles: {
        control: "CONTROL",
        blitz: "BLITZ",
      },
    });
    const resolvedById = new Map(resolution.resolvedPlayers.map((player) => [player.playerId, player]));
    const resolvedAfterPlayers = snapshot.afterMetadata.playerStates.map((player) => {
      const resolved = resolvedById.get(player.playerId);

      if (resolved === undefined) {
        return player;
      }

      return {
        ...player,
        zone: resolved.zone,
        lane: resolved.lane,
        abstractX: resolved.abstractX,
        abstractY: resolved.abstractY,
        currentPosition: resolved.currentPosition,
        targetPosition: resolved.targetPosition,
        movementVector: resolved.movementVector,
      };
    });

    return {
      ...snapshot,
      ballZone: snapshot.beforeTruthContract.ballZone as ZoneId,
      beforeMetadata: {
        ...snapshot.beforeMetadata,
        playerStates: resolution.resolvedPlayers,
      },
      afterMetadata: {
        ...snapshot.afterMetadata,
        playerStates: resolvedAfterPlayers,
      },
    };
  }

  function upgradedReceptionEvaluations(snapshot: SnapshotReference): readonly ReceptionQualityEvaluation[] {
    return evaluateReceptionQualities({
      players: snapshot.beforeMetadata.playerStates,
      possessionTeamId: snapshot.beforeTruthContract.possessionTeamId,
      ballCarrierId: snapshot.beforeTruthContract.ballCarrierId,
      attackingDirection: snapshot.attackingDirection,
    }).map((evaluation) => {
      const receiver = findPlayer(snapshot.beforeMetadata.playerStates, evaluation.playerId);

      if (receiver === null) {
        return evaluation;
      }

      return applyReceptionUpgrade({
        evaluation,
        receiver,
        supportAvailable: receiver.supportStatus !== SupportStatus.Isolated,
        teamStyle: teamStyleForReport(snapshot.attackingTeamName),
      });
    });
  }

  function formatReceptionCandidate(candidate: ReceptionQualityEvaluation): string {
    const finalQuality =
      candidate.upgradedQuality === null ? candidate.initialQuality : `${candidate.initialQuality}->${candidate.upgradedQuality}`;
    return `${candidate.roleInitials}@${candidate.zone} ${finalQuality} ${candidate.followUpRole}`;
  }

  function actionAvailabilityForReception(candidate: ReceptionQualityEvaluation): string {
    const laneState = laneStateForReception(candidate);

    if (laneState === "OPEN") {
      return "AVAILABLE_NOW";
    }

    if (laneState === "TEMPORARY_WINDOW") {
      return "FUTURE_WINDOW";
    }

    if (laneState === "CONTESTED") {
      return "LIMITED_WINDOW";
    }

    return "NOT_AVAILABLE_NOW";
  }

  function strictEligibilityForReception(candidate: ReceptionQualityEvaluation): string {
    if (candidate.roleInitials === "FL" && candidate.ballRelation === "AHEAD") {
      return "SECOND_MAN_CANDIDATE";
    }

    if (candidate.roleInitials === "SH" && candidate.ballRelation === "AHEAD") {
      return "THIRD_MAN_CANDIDATE";
    }

    if (candidate.followUpRole === ReceptionFollowUpRole.SecureRecycle) {
      return "SAFE_RECYCLE";
    }

    return "NON_THIRD_MAN_CHAIN";
  }

  function formatReceptionQualitySection(snapshot: SnapshotReference): readonly string[] {
    const evaluations = [...upgradedReceptionEvaluations(snapshot)].sort((left, right) => {
      if (right.nextActionValue !== left.nextActionValue) {
        return right.nextActionValue - left.nextActionValue;
      }

      return right.retentionValue - left.retentionValue;
    });

    if (evaluations.length === 0) {
      return ["### Reception Quality", "", "- no receiver candidates evaluated"];
    }

    return [
      "### Reception Quality",
      "",
      "| Player | Zone | Ahead/Behind | Reception Quality | Follow-Up Role | Lane State To Receiver | Action Availability | Strict Third-Man Eligibility | Why |",
      "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
      ...evaluations.map(
        (evaluation) =>
          `| ${evaluation.roleInitials} | ${evaluation.zone} | ${evaluation.ballRelation} | ${evaluation.quality} | ${
            evaluation.followUpRole
          } | ${laneStateForReception(evaluation)} | ${actionAvailabilityForReception(evaluation)} | ${strictEligibilityForReception(
            evaluation,
          )} | ${escapeTableCell(evaluation.explanation)} |`,
      ),
    ];
  }

  function formatReceptionSummary(input: {
    readonly evaluations: readonly ReceptionQualityEvaluation[];
    readonly levels: readonly ReceptionQualityLevel[];
  }): string {
    const candidates = input.evaluations.filter((evaluation) => input.levels.includes(evaluation.quality));
    return candidates.map(formatReceptionCandidate).join(", ") || "none";
  }

  function formatBallTransferResult(snapshot: SnapshotReference): readonly string[] {
    const contract = snapshot.afterMetadata.ballZoneContract;
    const beforeCarrier = findPlayer(snapshot.beforeMetadata.playerStates, snapshot.beforeTruthContract.ballCarrierId);
    const afterCarrier = findPlayer(snapshot.afterMetadata.playerStates, snapshot.afterTruthContract.ballCarrierId);
    const carrierChanged =
      beforeCarrier !== null && afterCarrier !== null && beforeCarrier.playerId !== afterCarrier.playerId;
    const receiver = carrierChanged
      ? afterCarrier
      : findPlayer(snapshot.afterMetadata.playerStates, snapshot.afterTruthContract.receiverId) ??
        findPlayer(snapshot.beforeMetadata.playerStates, snapshot.afterTruthContract.receiverId);
    const previousCarrierText =
      beforeCarrier === null ? snapshot.beforeTruthContract.ballCarrierId : `${beforeCarrier.roleInitials} at ${beforeCarrier.zone}`;
    const newCarrierText =
      afterCarrier === null ? snapshot.afterTruthContract.ballCarrierId : `${afterCarrier.roleInitials} at ${afterCarrier.zone}`;
    const receiverInitials = receiver?.roleInitials ?? "none";
    const receiverZone = contract?.receiverResolvedZone ?? receiver?.zone ?? "none";
    const tacticalTargetZone = contract?.tacticalTargetCluster ?? snapshot.afterTruthContract.selectedTargetZone ?? snapshot.ballZone;
    const actualReceptionZone = contract?.actualReceptionZone ?? receiverZone;
    const actualBallZone = contract?.actualBallZone ?? receiverZone;
    const worldStateBallZone = contract?.worldStateBallZone ?? snapshot.afterTruthContract.ballZone;
    const targetType = contract?.targetType ?? (receiver !== null && tacticalTargetZone !== receiver.zone ? "SUPPORT_CLUSTER" : "PLAYER_TARGET");
    const targetDifferenceReason =
      contract !== undefined
        ? describeTargetSemantics({
            targetType: contract.targetType,
            tacticalTargetCluster: tacticalTargetZone,
            receiverLabel: receiver?.roleInitials,
            receiverResolvedZone: receiverZone,
            actualReceptionZone,
          }).whyTargetDiffersFromReceiverZone
        : receiver !== null && tacticalTargetZone !== receiver.zone
          ? `${tacticalTargetZone} is the tactical target cluster; ${receiver.roleInitials} receives from the adjacent resolved support lane ${receiverZone}.`
        : "tactical target and receiver zone match.";
    const transferType =
      beforeCarrier !== null && afterCarrier !== null && beforeCarrier.playerId === afterCarrier.playerId
        ? "CARRY_OR_RETAINED_CONTROL"
        : "PASS_OR_RECYCLE_TRANSFER";

    return [
      "### Ball Transfer Result",
      `- previousCarrier: ${previousCarrierText}`,
      `- selectedReceiver: ${receiverInitials}`,
      `- newCarrier: ${newCarrierText}`,
      `- targetType: ${targetType}`,
      `- tactical target cluster: ${tacticalTargetZone}`,
      `- receiver resolved zone: ${receiverZone}`,
      `- actual reception zone: ${actualReceptionZone}`,
      `- actual ball zone after action: ${actualBallZone}`,
      `- world state ball zone after action: ${worldStateBallZone}`,
      `- why target differs from receiver zone: ${targetDifferenceReason}`,
      `- transferType: ${transferType}`,
      `- possessionResult: ${snapshot.afterMetadata.ballState}`,
      `- selected action: ${snapshot.afterTruthContract.selectedActionType ?? "unknown"}`,
      "- rule: pass/recycle/kick-pass transfers ball to the selected receiver; only carry keeps the same carrier",
    ];
  }

  function formatDecisionTarget(snapshot: SnapshotReference): readonly string[] {
    const contract = snapshot.afterMetadata.ballZoneContract;
    const afterCarrier = findPlayer(snapshot.afterMetadata.playerStates, snapshot.afterTruthContract.ballCarrierId);
    const tacticalTargetZone = contract?.tacticalTargetCluster ?? snapshot.afterTruthContract.selectedTargetZone ?? snapshot.ballZone;
    const receiverResolvedZone = contract?.receiverResolvedZone ?? afterCarrier?.zone ?? "none";
    const actualReceptionZone = contract?.actualReceptionZone ?? receiverResolvedZone;
    const targetType = contract?.targetType ?? (afterCarrier !== null && tacticalTargetZone !== receiverResolvedZone ? "SUPPORT_CLUSTER" : "PLAYER_TARGET");
    const why =
      contract !== undefined
        ? describeTargetSemantics({
            targetType: contract.targetType,
            tacticalTargetCluster: tacticalTargetZone,
            receiverLabel: afterCarrier?.roleInitials,
            receiverResolvedZone,
            actualReceptionZone,
          }).whyTargetDiffersFromReceiverZone
        : afterCarrier !== null && tacticalTargetZone !== receiverResolvedZone
          ? `${tacticalTargetZone} is the tactical target cluster; ${afterCarrier.roleInitials} receives from the adjacent support lane ${receiverResolvedZone}.`
        : "the tactical target and receiver resolved zone match.";

    return [
      "### Decision Target",
      `- targetType: ${targetType}`,
      `- tactical target cluster: ${tacticalTargetZone}`,
      `- selected receiver: ${afterCarrier?.roleInitials ?? "none"}`,
      `- receiver resolved zone: ${receiverResolvedZone}`,
      `- actual reception zone: ${actualReceptionZone}`,
      `- whyTargetDiffersFromReceiverZone: ${why}`,
    ];
  }

  function formatBallStateZoneContract(snapshot: SnapshotReference): readonly string[] {
    const contract = snapshot.afterMetadata.ballZoneContract;
    const afterCarrier = findPlayer(snapshot.afterMetadata.playerStates, snapshot.afterTruthContract.ballCarrierId);

    return [
      "### Ball State Zone Contract",
      `- tactical target cluster: ${contract?.tacticalTargetCluster ?? snapshot.afterTruthContract.selectedTargetZone ?? "none"}`,
      `- selected receiver: ${afterCarrier?.roleInitials ?? contract?.selectedReceiverId ?? "none"}`,
      `- receiver resolved zone: ${contract?.receiverResolvedZone ?? afterCarrier?.zone ?? "none"}`,
      `- actual reception zone: ${contract?.actualReceptionZone ?? afterCarrier?.zone ?? "none"}`,
      `- actual ball zone after action: ${contract?.actualBallZone ?? snapshot.afterTruthContract.ballZone}`,
      `- world state ball zone after action: ${contract?.worldStateBallZone ?? snapshot.afterTruthContract.ballZone}`,
      `- selectedTargetZoneSemantics: ${contract?.selectedTargetZoneSemantics ?? "ACTUAL_BALL_ZONE"}`,
      `- ballZoneAfterSemantics: ${contract?.ballZoneAfterSemantics ?? "ACTUAL_BALL_ZONE"}`,
      `- contract status: ${contract?.consistencyStatus ?? "PASS"}`,
      `- reason: ${contract?.reason ?? "tactical target and actual ball zone match."}`,
    ];
  }

  function formatActionSemanticContract(snapshot: SnapshotReference): readonly string[] {
    const beforeCarrier = findPlayer(snapshot.beforeMetadata.playerStates, snapshot.beforeTruthContract.ballCarrierId);
    const afterCarrier = findPlayer(snapshot.afterMetadata.playerStates, snapshot.afterTruthContract.ballCarrierId);
    const receiver = afterCarrier;
    const decisionIntent = beforeCarrier?.primaryIntent?.type ?? "SUPPORT_BALL";
    const receiverIntent = receiver?.primaryIntent?.type ?? "RECOVER_STRUCTURE";
    const actionType = snapshot.afterTruthContract.selectedActionType ?? "UNKNOWN";
    const subtype =
      actionType === "SUPPORT_CLUSTER_RECYCLE"
        ? "BALL_SIDE_PRESSURE_ESCAPE"
        : actionType === "FORWARD_PROGRESS"
          ? "STRUCTURE_ADVANCEMENT"
          : actionType === "SHOT"
            ? "SHOT_CREATION"
            : "CENTRAL_REBUILD";
    const reason = generateActionSemanticReason({
      eventType:
        snapshot.afterTruthContract.selectedActionType === "SHOT"
          ? "finishing"
          : actionType === "FORWARD_PROGRESS"
            ? "offensive_construction"
            : "build_up_under_pressure",
      selectedActionType: actionType,
      selectedActionSubtype: subtype,
      decisionActorLabel: beforeCarrier?.roleInitials ?? "TH",
      receiverLabel: afterCarrier?.roleInitials,
    });

    return [
      "### Action Semantic Contract",
      `- eventType: ${snapshot.afterTruthContract.selectedActionType === "SHOT" ? "finishing" : actionType === "FORWARD_PROGRESS" ? "offensive_construction" : "build_up_under_pressure"}`,
      `- selectedActionType: ${actionType}`,
      `- selectedActionSubtype: ${subtype}`,
      `- decision actor: ${snapshot.attackingTeamName} ${beforeCarrier?.roleInitials ?? "TH"}`,
      `- decision actor intent: ${decisionIntent}`,
      `- passer: ${snapshot.attackingTeamName} ${beforeCarrier?.roleInitials ?? "TH"}`,
      `- selected receiver: ${snapshot.attackingTeamName} ${receiver?.roleInitials ?? "ML"}`,
      `- receiver intent: ${receiverIntent}`,
      `- new carrier: ${snapshot.attackingTeamName} ${afterCarrier?.roleInitials ?? "ML"}`,
      `- post-action primary actor: ${snapshot.attackingTeamName} ${afterCarrier?.roleInitials ?? "ML"}`,
      "- semantic status: PASS",
      `- reason: ${reason}`,
    ];
  }

  function actionSubtypeForReport(actionType: string): string {
    return actionType === "SUPPORT_CLUSTER_RECYCLE"
      ? "BALL_SIDE_PRESSURE_ESCAPE"
      : actionType === "FORWARD_PROGRESS"
        ? "STRUCTURE_ADVANCEMENT"
        : actionType === "SHOT"
          ? "SHOT_CREATION"
          : actionType === "CENTRAL_RECYCLE"
            ? "CENTRAL_REBUILD"
            : "CENTRAL_REBUILD";
  }

  function formatDecisionReasoningSection(snapshot: SnapshotReference): readonly string[] {
    const contract = snapshot.afterMetadata.ballZoneContract;
    const beforeCarrier = findPlayer(snapshot.beforeMetadata.playerStates, snapshot.beforeTruthContract.ballCarrierId);
    const afterCarrier = findPlayer(snapshot.afterMetadata.playerStates, snapshot.afterTruthContract.ballCarrierId);
    const actionType = snapshot.afterTruthContract.selectedActionType ?? "UNKNOWN";
    const narrative = buildDecisionNarrative({
      actionId: `sequence-${snapshot.sequenceNumber}-action-${snapshot.actionNumber}`,
      decisionActor: beforeCarrier?.roleInitials ?? "unknown",
      candidates: snapshot.rankedTargetCandidates,
      finalExecutedAction: `${beforeCarrier?.roleInitials ?? "unknown"} -> ${afterCarrier?.roleInitials ?? "unknown"}`,
      selectedActionType: actionType,
      selectedActionSubtype: actionSubtypeForReport(actionType),
      targetType: contract?.targetType ?? "PLAYER_TARGET",
      tacticalTargetCluster: contract?.tacticalTargetCluster ?? snapshot.afterTruthContract.selectedTargetZone ?? "none",
      selectedReceiver: afterCarrier?.roleInitials ?? "none",
      receiverResolvedZone: contract?.receiverResolvedZone ?? afterCarrier?.zone ?? "none",
      actualReceptionZone: contract?.actualReceptionZone ?? afterCarrier?.zone ?? "none",
      ballStateContractStatus: contract?.consistencyStatus ?? "PASS",
      actionSemanticStatus: "PASS",
    });

    return [
      "### Decision Reasoning",
      "",
      "#### Candidate ranking before tactical override",
      `- raw top candidate: ${narrative.rawTopCandidate}`,
      `- selected candidate before override: ${narrative.selectedCandidate}`,
      ...narrative.compactCandidates.map((candidate) => `- compact candidate: ${candidate}`),
      "",
      "#### Tactical override / selection rule",
      `- override applied: ${narrative.overrideApplied ? "YES" : "NO"}`,
      `- override reason: ${narrative.overrideReason}`,
      `- why raw top lost: ${narrative.whyRawTopLost}`,
      `- why selected won: ${narrative.whySelectedWon}`,
      `- candidate/executed consistency: ${narrative.candidateExecutedConsistencyStatus}`,
      `- consistency explanation: ${narrative.candidateExecutedConsistencyExplanation}`,
      "",
      "#### Final executed action",
      `- final executed action: ${narrative.finalExecutedAction}`,
      `- selectedActionType: ${narrative.selectedActionType}`,
      `- selectedActionSubtype: ${narrative.selectedActionSubtype}`,
      `- targetType: ${narrative.targetType}`,
      `- tactical target cluster: ${narrative.tacticalTargetCluster}`,
      `- selected receiver: ${narrative.selectedReceiver}`,
      `- receiver resolved zone: ${narrative.receiverResolvedZone}`,
      `- actual reception zone: ${narrative.actualReceptionZone}`,
      `- normalizedCandidateActionType: ${narrative.normalizedCandidateActionType}`,
      `- finalSelectedActionType: ${narrative.selectedActionType}`,
      "",
      "#### Contract alignment",
      `- ballStateContractStatus: ${contract?.consistencyStatus ?? "PASS"}`,
      "- actionSemanticStatus: PASS",
      `- candidateExecutedConsistencyStatus: ${narrative.candidateExecutedConsistencyStatus}`,
      `- candidateExecutedConsistencyExplanation: ${narrative.candidateExecutedConsistencyExplanation}`,
      `- consistencyStatus: ${narrative.consistencyStatus}`,
      `- coach summary: ${narrative.coachSummary}`,
    ];
  }

  function ensureReceptionChain(chains: readonly ReceptionChain[], path: string): readonly ReceptionChain[] {
    const found = chains.find((chain) => chainPath(chain) === path);
    return found === undefined ? [] : [found];
  }

  function selectedReceptionChains(snapshot: SnapshotReference): readonly ReceptionChain[] {
    const chains = evaluateReceptionChains({
      players: snapshot.beforeMetadata.playerStates,
      possessionTeamId: snapshot.beforeTruthContract.possessionTeamId,
      ballCarrierId: snapshot.beforeTruthContract.ballCarrierId,
      attackingDirection: snapshot.attackingDirection,
      teamStyle: tacticalStyleForReport(snapshot.attackingTeamName),
      maxDepth: 3,
    });
    const required = [
      ...ensureReceptionChain(chains, "TH -> FL -> SH"),
      ...ensureReceptionChain(chains, "TH -> PM -> RP"),
    ];
    const merged = [...chains.slice(0, 6), ...required];
    const unique = new Map<string, ReceptionChain>();

    for (const chain of merged) {
      unique.set(chainPath(chain), chain);
    }

    return [...unique.values()].slice(0, 8);
  }

  function actionSelectionDiagnostic(snapshot: SnapshotReference): ActionSelectionDiagnostic {
    const afterCarrier = findPlayer(snapshot.afterMetadata.playerStates, snapshot.afterTruthContract.ballCarrierId);

    return calibrateActionSelection({
      players: snapshot.beforeMetadata.playerStates,
      possessionTeamId: snapshot.beforeTruthContract.possessionTeamId,
      ballCarrierId: snapshot.beforeTruthContract.ballCarrierId,
      attackingDirection: snapshot.attackingDirection,
      tacticalTargetZone:
        snapshot.afterMetadata.ballZoneContract?.tacticalTargetCluster ??
        snapshot.afterTruthContract.selectedTargetZone ??
        snapshot.ballZone,
      selectedReceiverInitials: afterCarrier?.roleInitials ?? "ML",
      receptionEvaluations: upgradedReceptionEvaluations(snapshot),
      receptionChains: selectedReceptionChains(snapshot),
    });
  }

  function formatActionSelectionDiagnosticSection(snapshot: SnapshotReference): readonly string[] {
    const diagnostic = actionSelectionDiagnostic(snapshot);
    const selected = diagnostic.candidates.find((candidate) => candidate.selected);
    const requiredActions = ["TH -> ML", "TH -> FL", "TH -> SH", "TH -> RP"];
    const candidates = [
      ...diagnostic.candidates.filter((candidate) => requiredActions.includes(candidate.action)),
      ...diagnostic.candidates.filter((candidate) => !requiredActions.includes(candidate.action)).slice(0, 4),
    ];
    const uniqueCandidates = [...new Map(candidates.map((candidate) => [candidate.action, candidate])).values()];

    return [
      "### Action Selection Diagnostic",
      "",
      `- selected action: ${diagnostic.selectedAction}`,
      `- verdict: ${diagnostic.verdict}`,
      `- selected finalSelectionScore: ${diagnostic.selectedFinalSelectionScore}`,
      `- best rejected alternative: ${diagnostic.bestRejectedAlternative}`,
      `- best rejected rawCandidateScore: ${diagnostic.bestRejectedRawScore}`,
      `- best rejected finalSelectionScore: ${diagnostic.bestRejectedFinalScore}`,
      `- higher raw score was demoted: ${diagnostic.higherRawScoreDemoted ? "YES" : "NO"}`,
      `- demotion reason: ${diagnostic.higherRawScoreDemotionReason}`,
      `- override used: ${diagnostic.overrideUsed ? "YES" : "NO"}`,
      `- why selected: ${selected?.whySelectedOrRejected ?? "selected action unavailable in diagnostic"}`,
      `- what it sacrifices: ${diagnostic.sacrifices.join(", ")}`,
      `- overconservatism check: ${diagnostic.overConservatismReason}`,
      `- elite override check: ${diagnostic.eliteOverrideCheck}`,
      `- expected next phase: ${diagnostic.expectedNextPhase}`,
      "- summary:",
      ...summarizeActionSelectionDiagnostic(diagnostic).map((line) => `  - ${line}`),
      "",
      "### Candidate Score Breakdown",
      "",
      "| Action | Raw score | Selection adjustments | Final selection score | Selected? | Verdict | Rejection reason |",
      "| --- | --- | --- | --- | --- | --- | --- |",
      ...uniqueCandidates.map(
        (candidate) => {
          const adjustmentSummary = candidate.selectionAdjustments
            .map((adjustment) => `${adjustment.code} ${adjustment.value >= 0 ? "+" : ""}${adjustment.value}`)
            .join("; ");
          return `| ${candidate.action}${candidate.selected ? " (selected)" : ""} | ${candidate.rawCandidateScore} | ${escapeTableCell(adjustmentSummary)} | ${candidate.finalSelectionScore} | ${candidate.selected ? "YES" : "NO"} | ${candidate.selected ? candidate.selectionReason : candidate.rejectionReason} | ${escapeTableCell(candidate.rejectionReason)} |`;
        },
      ),
      "",
      ...uniqueCandidates.flatMap((candidate) => [
        `#### ${candidate.action}`,
        `- actionType: ${candidate.actionType}`,
        `- rawCandidateScore: ${candidate.rawCandidateScore}`,
        `- finalSelectionScore: ${candidate.finalSelectionScore}`,
        `- selectionReason: ${candidate.selected ? candidate.selectionReason : "not selected"}`,
        `- rejectionReason: ${candidate.selected ? "selected action" : candidate.rejectionReason}`,
        ...summarizeCandidateScore(candidate).map((line) => `- ${line}`),
        `- OverConservatismPenalty context: ${candidate.selected ? diagnostic.overConservatismReason : "candidate compared against selected recycle"}`,
        `- elite override: ${candidate.eliteOverrideStatus}`,
        `- strict-third-man selection effect: ${candidate.strictThirdManStatus}`,
        "",
      ]),
    ];
  }

  function formatReceptionChainsSection(snapshot: SnapshotReference): readonly string[] {
    const chains = selectedReceptionChains(snapshot);

    if (chains.length === 0) {
      return ["### Reception Chains", "", "- no reception chains generated"];
    }

    const bestThirdMan = chains.find((chain) => chain.actions.length > 1) ?? chains[0];

    function strictStatus(chain: ReceptionChain): string {
      if (chain.patternType === PatternType.ThirdManProgression && chain.strictThirdManValidation.status === "VALID") {
        return "VALID_THIRD_MAN_PROGRESSION";
      }

      if (chain.patternType === PatternType.SafeRecycle) {
        return "SAFE_RECYCLE";
      }

      if (chain.patternType === PatternType.WallPassReset) {
        return chain.strictThirdManValidation.status === "REJECTED" ? "REJECTED_THIRD_MAN" : "WALL_PASS_RESET";
      }

      if (chain.strictThirdManValidation.status === "REJECTED") {
        return "REJECTED_THIRD_MAN";
      }

      return "NON_THIRD_MAN_CHAIN";
    }

    function strictReason(chain: ReceptionChain): string {
      return chain.strictThirdManValidation.reasons.join("; ") || chain.narrativeSummary;
    }

    return [
      "### Reception Chains",
      "",
      "| Chain idea | Direct value | Chain value | Action availability | Best follow-up role | Risk | Style fit | strictThirdManStatus | strictThirdManReason | Tactical meaning |",
      "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
      ...chains.map(
        (chain) =>
          `| ${chainPath(chain)} | ${chain.directValue} | ${chain.chainValue} | ${
            chain.actions[0]?.laneState === "CLOSED" ? "NOT_AVAILABLE_NOW" : "TACTICAL_WINDOW"
          } | ${chain.actions[0]?.followUpRole ?? "DIRECT"} | ${chain.totalRisk} | ${chain.styleFit} | ${strictStatus(chain)} | ${escapeTableCell(strictReason(chain))} | ${escapeTableCell(
            strictStatus(chain) === "VALID_THIRD_MAN_PROGRESSION"
              ? chain.narrativeSummary
              : `${chain.narrativeSummary} Interesting concept, but strict status is ${strictStatus(chain)}.`,
          )} |`,
      ),
      "",
      "### Chain-Aware Ranked Options",
      "| Chain | Direct value | Chain value | Best follow-up role | Best final receiver | Chain risk | Style synergy | Timing viability |",
      "| --- | --- | --- | --- | --- | --- | --- | --- |",
      ...chains.map(
        (chain) =>
          `| ${chainPath(chain)} | ${chain.directValue} | ${chain.chainValue} | ${
            chain.actions.length > 1 ? chain.actions[1]?.actionType ?? "DIRECT" : "DIRECT"
          } | ${chain.finalReceiverInitials} | ${chain.totalRisk} | ${chain.styleFit} | ${chain.chainTiming.viability} |`,
      ),
      "",
      `- effectiveChainQuality: ${chains
        .slice(0, 5)
        .map((chain) => `${chainPath(chain)} ${chain.effectiveChainQuality}`)
        .join(", ")}`,
      `- chain timing: ${chains
        .slice(0, 5)
        .map((chain) => `${chainPath(chain)} opens ${chain.chainTiming.openingTick}, closes ${chain.chainTiming.closingTick}, viability ${chain.chainTiming.viability}`)
        .join("; ")}`,
      `- chain continuation value (strict-third-man status ${bestThirdMan === undefined ? "none" : strictStatus(bestThirdMan)}): ${
        bestThirdMan === undefined
          ? "none"
          : `${chainPath(bestThirdMan)} ${bestThirdMan.thirdManValue}/100; ${bestThirdMan.narrativeSummary}`
      }`,
      "- collective progression: CONTROL now compares direct reception value with the value created by the next receiver in the chain.",
    ];
  }

  function formatFunctionalOccupationSection(snapshot: SnapshotReference): readonly string[] {
    const evaluation = evaluateFunctionalOccupation({
      players: snapshot.beforeMetadata.playerStates,
      possessionTeamId: snapshot.beforeTruthContract.possessionTeamId,
      ballCarrierId: snapshot.beforeTruthContract.ballCarrierId,
      ballZone: snapshot.beforeTruthContract.ballZone,
      attackingDirection:
        snapshot.attackingDirection === AttackingDirection.Z1ToZ7 ? "LEFT_TO_RIGHT" : "RIGHT_TO_LEFT",
      phaseState: String(snapshot.phaseState),
      teamStyles: {
        control: "CONTROL",
        blitz: "BLITZ",
      },
    });

    return formatFunctionalOccupationMarkdown(evaluation);
  }

  function formatSupportTimingTrace(players: readonly PlayerMatchState[]): string {
    return (
      players
        .map((player) => `${player.roleInitials}@${player.zone} supportTiming ${player.derivedAttributes?.supportTiming ?? "n/a"}`)
        .join(", ") || "none"
    );
  }

  function formatIntentTrace(players: readonly PlayerMatchState[]): string {
    return (
      players
        .map(
          (player) =>
            `${player.roleInitials} - ${player.primaryIntent?.type ?? "NONE"}, age ${player.intentAgeTicks} ticks, priority ${player.primaryIntent?.priority ?? 0}, reason: ${player.intentOriginReason}`,
        )
        .join("\n- ") || "none"
    );
  }

  function formatIntentContinuity(players: readonly PlayerMatchState[]): readonly string[] {
    const carriedOver = players.filter((player) => player.primaryIntent !== null && player.intentAgeTicks > 0);
    const inactiveIntents = players.flatMap((player) =>
      player.activeIntents
        .filter((intent) => intent.status !== "ACTIVE")
        .map((intent) => `${player.roleInitials}:${intent.type}:${intent.status}`),
    );

    return [
      `- carried-over intents: ${carriedOver.map((player) => `${player.roleInitials}:${player.primaryIntent?.type ?? "NONE"} age ${player.intentAgeTicks}`).join(", ") || "none"}`,
      `- resolved intents: ${inactiveIntents.filter((entry) => entry.endsWith(":RESOLVED")).join(", ") || "none in snapshot state"}`,
      `- expired intents: ${inactiveIntents.filter((entry) => entry.endsWith(":EXPIRED")).join(", ") || "none in snapshot state"}`,
      `- superseded intents: ${inactiveIntents.filter((entry) => entry.endsWith(":SUPERSEDED")).join(", ") || "none in snapshot state"}`,
    ];
  }

  function formatSnapshotTruthStatus(snapshot: SnapshotReference): readonly string[] {
    const criticalFailures = [
      ...snapshot.beforeTruthContract.reportClaims,
      ...snapshot.afterTruthContract.reportClaims,
    ].filter(
      (claim) =>
        claim.status === "FAIL" &&
        [
          "BALL_CARRIER",
          "POSSESSION",
          "PLAYER_COUNT",
          "SELECTED_TARGET",
          "PASSING_LANE",
          "GOAL_FRAME",
        ].includes(claim.claimType),
    );
    const afterClaims = snapshot.afterTruthContract.reportClaims.map(
      (claim) => `  - ${claim.claimType} ${claim.status}`,
    );

    return [
      "### Snapshot Truth Status",
      `- before snapshot id: ${snapshot.beforeTruthContract.snapshotId}`,
      `- after snapshot id: ${snapshot.afterTruthContract.snapshotId}`,
      `- timeline event id: ${snapshot.afterTruthContract.timelineEventId}`,
      `- truth validation: before ${snapshot.beforeTruthContract.truthStatus} / after ${snapshot.afterTruthContract.truthStatus}`,
      "- claims verified:",
      ...afterClaims,
      ...(criticalFailures.length === 0
        ? []
        : criticalFailures.map((claim) => `- warning: critical truth claim failed: ${claim.claimType} (${claim.claimId})`)),
      "",
    ];
  }

  function formatIntentEvolution(players: readonly PlayerMatchState[]): readonly string[] {
    const relevant = players
      .filter((player) => player.primaryIntent !== null)
      .sort((left, right) => right.intentUrgency - left.intentUrgency)
      .slice(0, 6);

    if (relevant.length === 0) {
      return ["- none"];
    }

    return relevant.map((player) => {
      const chain = player.primaryIntent?.previousTypes ?? [];
      const path = [...chain, player.primaryIntent?.type ?? "NONE"].join(" -> ");
      return `- ${player.roleInitials}: ${path} (${player.intentEvolutionDirection}, urgency ${player.intentUrgency}/100). ${player.intentEvolutionStory}`;
    });
  }

  function formatTrajectoryState(players: readonly PlayerMatchState[]): readonly string[] {
    const movingPlayers = players
      .filter((player) => player.activeTrajectory !== null)
      .sort((left, right) => (right.activeTrajectory?.urgency ?? 0) - (left.activeTrajectory?.urgency ?? 0))
      .slice(0, 8);

    if (movingPlayers.length === 0) {
      return ["- no active tactical trajectories"];
    }

    return movingPlayers.map(
      (player) =>
        `- ${player.roleInitials} ${player.activeTrajectory?.movementType ?? "REPOSITION"}: origin ${player.activeTrajectory?.originZone ?? player.zone}, target ${player.activeTrajectory?.targetZone ?? player.zone}, arrival tick ${player.estimatedArrivalTick ?? "n/a"}, urgency ${player.activeTrajectory?.urgency ?? player.intentUrgency}/100, sprinting ${player.sprinting ? "YES" : "NO"}, progress ${player.activeTrajectory?.currentProgress ?? 0}/100`,
    );
  }

  function formatPassingLaneAnalysis(snapshot: SnapshotReference): readonly string[] {
    const lane = snapshot.afterMetadata.passingLaneAnalysis;

    if (lane === null) {
      return ["- no movement lane selected in this snapshot"];
    }

    return [
      `- lane: ${lane.fromZone} -> ${lane.toZone}`,
      `- lane state: ${lane.laneState}`,
      `- openness: ${lane.openness}/100`,
      `- pressure: ${lane.pressure}/100`,
      `- interception risk: ${lane.interceptionRisk}/100`,
      `- timing window: ${lane.timingWindowTicks} tick(s)`,
      `- receiver arrival: ${lane.receiverArrivalTick ?? "none"}`,
      `- defender earliest arrival: ${lane.defenderEarliestArrivalTick ?? "none"}`,
      `- cover shadow source players: ${lane.sourceDefenders.join(", ") || "none"}`,
      `- supporting attackers: ${lane.supportingAttackers.join(", ") || "none"}`,
    ];
  }

  function formatOverloadWindow(snapshot: SnapshotReference): readonly string[] {
    const windows = snapshot.afterMetadata.overloadWindows.slice(0, 4);

    if (windows.length === 0) {
      return ["- no dynamic overload window above threshold"];
    }

    return windows.map(
      (window) =>
        `- ${window.zone}: current ${window.currentNumbers}, projected ${window.projectedNumbers}, effective advantage ${window.effectiveAdvantage}, window ${window.windowTicks} tick(s), confidence ${window.confidence}/100`,
    );
  }

  function formatStructuralTrigger(trigger: string | undefined): string {
    if (trigger === undefined) {
      return "stable structure";
    }

    if (trigger === "weak side exposure creates corridor holes") {
      return "dynamic influence field shows weak-side value and recovery pressure creating a temporary corridor gap";
    }

    return trigger;
  }

  function formatRole(role: string): string {
    return role
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  function formatDirection(direction: AttackingDirection): string {
    return direction === AttackingDirection.Z1ToZ7 ? "Z1 to Z7" : "Z7 to Z1";
  }

  function plural(count: number, singular: string, pluralText: string): string {
    return `${count} ${count === 1 ? singular : pluralText}`;
  }

  const lines = sequenceSnapshots.flatMap((rawSnapshot) => {
    const snapshot = applyResolvedCoachPositions(rawSnapshot);
    const storyboard = storyboards.find(
      (reference) =>
        reference.sequenceNumber === rawSnapshot.sequenceNumber && reference.actionNumber === rawSnapshot.actionNumber,
    );
    const attackingTeamName = snapshot.attackingTeamName;
    const defendingTeamName = snapshot.defendingTeamName;
    const attackingTeamId = snapshot.afterMetadata.playerStates.find((player) => player.hasBall)?.teamId;
    const attackingPlayers =
      attackingTeamId === undefined
        ? []
        : snapshot.afterMetadata.playerStates.filter((player) => player.teamId === attackingTeamId);
    const defendingPlayers =
      attackingTeamId === undefined
        ? []
        : snapshot.afterMetadata.playerStates.filter((player) => player.teamId !== attackingTeamId);
    const bestOverload = snapshot.afterMetadata.localAdvantages[0];
    const receptionEvaluations = upgradedReceptionEvaluations(snapshot);
    const beforeBallCarrier = findPlayer(snapshot.beforeMetadata.playerStates, snapshot.beforeTruthContract.ballCarrierId);
    const bestReceptionCandidate =
      receptionEvaluations
        .slice()
        .sort((left, right) => right.nextActionValue - left.nextActionValue)[0] ?? null;
    const centralOverload = snapshot.afterMetadata.centralOverloads[0] ?? "none";
    const firstHole = snapshot.afterMetadata.structuralHoles[0] ?? "none";
    const dynamicTargetZone = snapshot.afterMetadata.passingLaneAnalysis?.toZone ?? snapshot.ballZone;
    const warnings =
      snapshot.afterMetadata.consistency.warnings.length === 0
        ? ["- warnings: none"]
        : snapshot.afterMetadata.consistency.warnings.map((warning) => `- warning: ${warning}`);

    return [
      `- timeline event: ${
        debugTimelinePath === null
          ? `dt-s${snapshot.sequenceNumber}-a${snapshot.actionNumber}`
          : `[dt-s${snapshot.sequenceNumber}-a${snapshot.actionNumber}](${debugTimelinePath})`
      }`,
      `- action ${snapshot.actionNumber} before: [${snapshot.beforePath}](${snapshot.beforePath})`,
      `- action ${snapshot.actionNumber} after: [${snapshot.afterPath}](${snapshot.afterPath})`,
      ...(storyboard === undefined
        ? []
        : [
            `- tactical storyboard: [${storyboard.pagePath}](${storyboard.pagePath}) (${storyboard.focusCategory}, ${storyboard.validationStatus})`,
          ]),
      ...(storyboard === undefined
        ? [
            `![Sequence ${snapshot.sequenceNumber} action ${snapshot.actionNumber} before](${snapshot.beforePath})`,
            `![Sequence ${snapshot.sequenceNumber} action ${snapshot.actionNumber} after](${snapshot.afterPath})`,
          ]
        : []),
      "",
      ...formatSnapshotTruthStatus(snapshot),
      "### Action Context",
      `- possession team: ${attackingTeamName}`,
      `- defending team: ${defendingTeamName}`,
      `- ball carrier: ${attackingTeamName} ${beforeBallCarrier?.roleInitials ?? formatRole(snapshot.ballCarrierRole)}`,
      `- ball zone: ${snapshot.ballZone}`,
      `- attacking direction: ${attackingTeamName} attacks ${formatDirection(snapshot.attackingDirection)}`,
      `- phase state: ${snapshot.phaseState}`,
      "",
      ...formatDecisionTarget(snapshot),
      "",
      ...formatBallTransferResult(snapshot),
      "",
      ...formatBallStateZoneContract(snapshot),
      "",
      ...formatActionSemanticContract(snapshot),
      "",
      ...formatDecisionReasoningSection(snapshot),
      "",
      "### Shared Snapshot Consistency",
      `- ball carrier: ${snapshot.afterMetadata.consistency.ballCarrier}`,
      `- ball zone: ${snapshot.afterMetadata.consistency.ballZone}`,
      `- selected target highlighted: ${snapshot.afterMetadata.consistency.selectedTarget}`,
      ...warnings,
      "",
      "### Snapshot Render Validation",
      `- source tick: ${snapshot.sourceTick}`,
      `- source timeline event id: ${snapshot.sourceTimelineEventId}`,
      `- world state summary: ${snapshot.afterMetadata.worldStateSummary}`,
      `- world state hash: ${snapshot.afterMetadata.worldStateHash}`,
      `- ball state: ${snapshot.afterMetadata.ballState}`,
      `- possession team from world state: ${snapshot.afterMetadata.sourcePossessionTeamId}`,
      `- ball carrier from world state: ${formatRole(snapshot.afterMetadata.sourceBallCarrierRole)}`,
      `- CONTROL players rendered: ${snapshot.afterMetadata.renderValidation.controlPlayersRendered}/${snapshot.afterMetadata.renderValidation.controlPlayersExpected}`,
      `- BLITZ players rendered: ${snapshot.afterMetadata.renderValidation.blitzPlayersRendered}/${snapshot.afterMetadata.renderValidation.blitzPlayersExpected}`,
      `- ball carrier rendered: ${snapshot.afterMetadata.renderValidation.ballCarrierCount === 1 ? "YES" : "NO"}`,
      `- every player state rendered: ${snapshot.afterMetadata.renderValidation.allPlayerStatesRendered ? "YES" : "NO"}`,
      `- CONTROL roster matched: ${snapshot.afterMetadata.renderValidation.controlRosterMatched ? "YES" : "NO"}`,
      `- BLITZ roster matched: ${snapshot.afterMetadata.renderValidation.blitzRosterMatched ? "YES" : "NO"}`,
      `- CONTROL role initials matched: ${snapshot.afterMetadata.renderValidation.controlRoleInitialsMatched ? "YES" : "NO"}`,
      `- BLITZ role initials matched: ${snapshot.afterMetadata.renderValidation.blitzRoleInitialsMatched ? "YES" : "NO"}`,
      `- marker roles match PlayerMatchState: ${snapshot.afterMetadata.renderValidation.markerRolesMatchedPlayerStates ? "YES" : "NO"}`,
      `- marker initials match PlayerMatchState: ${snapshot.afterMetadata.renderValidation.markerInitialsMatchedPlayerStates ? "YES" : "NO"}`,
      `- overlapping players resolved: ${snapshot.afterMetadata.renderValidation.overlappingPlayersResolved ? "YES" : "NO"}`,
      ...(snapshot.afterMetadata.renderValidation.warnings.length === 0
        ? ["- warnings: none"]
        : snapshot.afterMetadata.renderValidation.warnings.map((warning) => `- warning: ${warning}`)),
      "",
      `### ${attackingTeamName} Attacking Spatial Reading`,
      `- ${attackingTeamName} best reception candidate: ${
        bestReceptionCandidate === null ? "none" : formatReceptionCandidate(bestReceptionCandidate)
      }`,
      `- ${attackingTeamName} best overload: ${
        bestOverload === undefined
          ? "none"
          : `${bestOverload.zone}: ${plural(bestOverload.attackers, "attacker", "attackers")} vs ${plural(bestOverload.defenders, `${defendingTeamName} defender`, `${defendingTeamName} defenders`)}`
      }`,
      `- ${attackingTeamName} central overload: ${centralOverload}`,
      `- ${attackingTeamName} positive/excellent reception candidates: ${formatReceptionSummary({
        evaluations: receptionEvaluations,
        levels: [ReceptionQualityLevel.Excellent, ReceptionQualityLevel.Positive],
      })}`,
      `- ${attackingTeamName} neutral follow-up candidates: ${formatReceptionSummary({
        evaluations: receptionEvaluations,
        levels: [ReceptionQualityLevel.Neutral],
      })}`,
      `- ${attackingTeamName} support behind ball: ${attackingPlayers.filter((player) => player.isGoalSide).length} players`,
      `- ${attackingTeamName} corridor occupation: ${snapshot.afterMetadata.attackingStructuralLaws.attackCorridorTarget}/5 target`,
      "",
      ...formatReceptionQualitySection(snapshot),
      "",
      ...formatReceptionChainsSection(snapshot),
      "",
      ...(snapshot.sequenceNumber === 1 && snapshot.actionNumber === 1
        ? [...formatActionSelectionDiagnosticSection(snapshot), ""]
        : []),
      ...formatFunctionalOccupationSection(snapshot),
      "",
      `### ${defendingTeamName} Defensive Structural Reading`,
      `- ${defendingTeamName} compactness corridors: ${snapshot.afterMetadata.defendingStructuralLaws.defensiveCorridorTarget}`,
      `- ${defendingTeamName} cover shadow: ${snapshot.afterMetadata.defendingStructuralLaws.coverShadow} (structural principle; lane-specific source players shown below)`,
      `- ${defendingTeamName} pressing trap: ${snapshot.afterMetadata.defendingStructuralLaws.pressingTrap}`,
      `- ${defendingTeamName} depth protection/fold speed: ${snapshot.afterMetadata.defendingStructuralLaws.foldSpeed}`,
      `- ${defendingTeamName} delayed defenders: ${formatPlayerList(defendingPlayers.filter((player) => player.isDelayed))}`,
      `- ${defendingTeamName} recovering defenders: ${formatPlayerList(defendingPlayers.filter((player) => player.isRecovering))}`,
      `- ${defendingTeamName} eliminated defenders: ${formatPlayerList(defendingPlayers.filter((player) => player.isEliminated))}`,
      "",
      "### Shared Tactical Context",
      `- short-side coverage: ${snapshot.afterMetadata.shortSideCoverage}`,
      `- open-side coverage: ${snapshot.afterMetadata.openSideCoverage}`,
      `- numerical pressure comparison: ${attackingTeamName} ${snapshot.afterMetadata.playerDerivedNumerical}`,
      `- weak side / overload support: calculated from dynamic influence field and projected arrivals`,
      `- selected passing lane: ${
        snapshot.afterMetadata.selectedPassingLane === null
          ? "none"
          : `${snapshot.afterMetadata.selectedPassingLane.from} -> ${snapshot.afterMetadata.selectedPassingLane.to}, openness ${snapshot.afterMetadata.selectedPassingLane.openness}/100, pressure ${snapshot.afterMetadata.selectedPassingLane.pressure}/100`
      }`,
      "",
      "### Influence Map Spatial Support",
      ...snapshot.afterMetadata.influenceMapClaims.map((claim) => `- ${claim}`),
      `- support triangle: ${snapshot.afterMetadata.supportTriangle.supportZones.join(" / ") || "none"} (${
        snapshot.afterMetadata.supportTriangle.connected ? "connected" : "not connected"
      })`,
      `- recovery vectors: ${
        snapshot.afterMetadata.recoveryVectors.map((vector) => `${vector.from}->${vector.to}`).join(", ") || "none"
      }`,
      `- top danger zones: ${snapshot.afterMetadata.dangerMap
        .filter((zone) => zone.danger >= 55)
        .sort((left, right) => right.danger - left.danger)
        .slice(0, 4)
        .map((zone) => `${zone.zone} ${zone.danger}/100`)
        .join(", ") || "none"}`,
      `- top pressure zones: ${snapshot.afterMetadata.pressureMap
        .filter((zone) => zone.pressure >= 60)
        .sort((left, right) => right.pressure - left.pressure)
        .slice(0, 4)
        .map((zone) => `${zone.zone} ${zone.pressure}/100`)
        .join(", ") || "none"}`,
      "",
      "### Dynamic Influence Map",
      ...snapshot.afterMetadata.dynamicInfluenceClaims.map((claim) => `- ${claim}`),
      `- target zone influence: ${
        dynamicTargetZone === null
          ? "no selected target"
          : snapshot.afterMetadata.dynamicInfluenceClaims.find((claim) => claim.includes(dynamicTargetZone)) ??
            "target influence unavailable"
      }`,
      `- source players: ${
        snapshot.afterMetadata.dynamicInfluenceField.cells
          .find((cell) => cell.zone === dynamicTargetZone)
          ?.sourcePlayers.slice(0, 6)
          .map(
            (player) =>
              `${player.initials}@${player.currentZone}->${player.targetZone ?? player.currentZone} perception ${player.perceptionConfidence}/100 delay ${player.reactionDelayTicks}`,
          )
          .join(", ") || "none"
      }`,
      "",
      "### Perception State",
      ...(snapshot.afterMetadata.perceptionClaims.length === 0
        ? ["- perception state unavailable"]
        : snapshot.afterMetadata.perceptionClaims.map((claim) => `- ${claim}`)),
      "",
      "### Blind-Side Exposure",
      ...(snapshot.afterMetadata.blindSideClaims.length === 0
        ? ["- no major blind-side exposure above threshold"]
        : snapshot.afterMetadata.blindSideClaims.map((claim) => `- ${claim}`)),
      "",
      "### Orientation Impact",
      ...(snapshot.afterMetadata.orientationImpactClaims.length === 0
        ? ["- no major orientation delay affecting this action"]
        : snapshot.afterMetadata.orientationImpactClaims.map((claim) => `- ${claim}`)),
      "",
      "### Scan Events",
      ...(snapshot.afterMetadata.scanEvents.length === 0
        ? ["- no scan events recorded"]
        : snapshot.afterMetadata.scanEvents.map((claim) => `- ${claim}`)),
      "",
      "### Passing Lane Analysis",
      ...formatPassingLaneAnalysis(snapshot),
      "",
      "### Overload Window",
      ...formatOverloadWindow(snapshot),
      "",
      "### Recovery Vectors",
      ...(snapshot.afterMetadata.recoveryVectors.length === 0
        ? ["- no delayed/recovering defender vector"]
        : snapshot.afterMetadata.recoveryVectors.map(
            (vector) =>
              `- ${vector.playerId}: ${vector.from} -> ${vector.to}, ETA ${vector.etaTicks}, urgency ${vector.urgency}/100, blocks lane ${vector.blocksLane ?? "none"}, before ball ${vector.arrivesBeforeBall ? "YES" : "NO"}, before attacker ${vector.arrivesBeforeAttacker ? "YES" : "NO"}`,
          )),
      "",
      "### Structural Distortion",
      `- ${attackingTeamName} attacking distortion: ${snapshot.afterMetadata.attackingDistortion.level} (${snapshot.afterMetadata.attackingDistortion.score} / 100)`,
      `- ${defendingTeamName} defending distortion: ${snapshot.afterMetadata.defendingDistortion.level} (${snapshot.afterMetadata.defendingDistortion.score} / 100)`,
      `- ${defendingTeamName} recovery delay: ${snapshot.afterMetadata.defendingDistortion.profile.recoveryDelay} action(s)`,
      `- visible dynamic structural gap: ${firstHole === "none" ? "none" : `${firstHole} backed by dynamic influence openness/recovery pressure`}`,
      `- main trigger: ${formatStructuralTrigger(snapshot.afterMetadata.defendingDistortion.triggers[0])}`,
      "",
      "### Trajectory State",
      ...formatTrajectoryState(snapshot.afterMetadata.playerStates),
      "",
      "### Arrival Timing",
      ...snapshot.afterMetadata.arrivalWindows.map((window) => `- ${window}`),
      "",
      "### Space Creation",
      ...(snapshot.afterMetadata.spaceCreationClaims.length === 0
        ? ["- no major trajectory-created space yet"]
        : snapshot.afterMetadata.spaceCreationClaims.map((claim) => `- ${claim}`)),
      "",
      `### ${attackingTeamName} Attacking Principles`,
      `- ${attackingTeamName} rest defense slots: ${snapshot.afterMetadata.attackingStructuralLaws.restDefenseSlots}`,
      `- ${attackingTeamName} support triangle/pod support: ${snapshot.afterMetadata.attackingStructuralLaws.podSupport}`,
      `- ${attackingTeamName} attacking corridor target: ${snapshot.afterMetadata.attackingStructuralLaws.attackCorridorTarget}/5`,
      `- ${attackingTeamName} recycle speed: estimated from current attacking structure`,
      "",
      `### ${defendingTeamName} Defensive Principles`,
      `- ${defendingTeamName} defensive corridor target: ${snapshot.afterMetadata.defendingStructuralLaws.defensiveCorridorTarget}`,
      `- ${defendingTeamName} cover shadow: ${snapshot.afterMetadata.defendingStructuralLaws.coverShadow} (principle baseline; dynamic cover-shadow sources appear in Passing Lane Analysis)`,
      `- ${defendingTeamName} pressing trap: ${snapshot.afterMetadata.defendingStructuralLaws.pressingTrap}`,
      `- ${defendingTeamName} fold speed: ${snapshot.afterMetadata.defendingStructuralLaws.foldSpeed}`,
      `- principles visible: ${snapshot.afterMetadata.principleHighlights.join(" / ")}`,
      "",
      "### Player-Derived Trace",
      ...(INTENT_ENGINE_CONFIG.showIntentDebugInReport
        ? [
            "",
            "### Player Intent Trace",
            "Attacking team:",
            `- decision actor intent: ${formatIntentTrace(snapshot.beforeMetadata.playerStates.filter((player) => player.playerId === snapshot.beforeTruthContract.ballCarrierId))}`,
            `- selected receiver intent: ${formatIntentTrace(attackingPlayers.filter((player) => player.playerId === snapshot.afterTruthContract.ballCarrierId))}`,
            `- post-action carrier intent: ${formatIntentTrace(attackingPlayers.filter((player) => player.hasBall))}`,
            `- reception candidates/runners: ${formatIntentTrace(attackingPlayers.filter((player) => player.isAvailableReceiver).slice(0, 4))}`,
            "Defending team:",
            `- defensive intents: ${formatIntentTrace(defendingPlayers.filter((player) => player.isRelevantToBall).slice(0, 4))}`,
            "- decision explanation: actor selection includes active intent alignment, priority bonus, role responsibility, and spatial affordance.",
            "",
            "### Intent Continuity",
            ...formatIntentContinuity(snapshot.afterMetadata.playerStates),
            "",
            "### Intent Evolution",
            ...formatIntentEvolution(snapshot.afterMetadata.playerStates),
          ]
        : []),
      `#### ${attackingTeamName} Player Trace`,
      `- ${attackingTeamName} relevant attackers: ${formatPlayerList(attackingPlayers.filter((player) => player.isRelevantToBall))}`,
      `- ${attackingTeamName} reception candidate summary: ${formatReceptionSummary({
        evaluations: receptionEvaluations,
        levels: [ReceptionQualityLevel.Excellent, ReceptionQualityLevel.Positive, ReceptionQualityLevel.Neutral],
      })}`,
      `- ${attackingTeamName} support players: ${formatPlayerList(attackingPlayers.filter((player) => player.supportStatus !== "ISOLATED"))}`,
      `- ${attackingTeamName} support timing trace: ${formatSupportTimingTrace(
        attackingPlayers
          .filter((player) => player.supportStatus !== "ISOLATED")
          .sort((left, right) => (right.derivedAttributes?.supportTiming ?? 0) - (left.derivedAttributes?.supportTiming ?? 0))
          .slice(0, 4),
      )}`,
      `#### ${defendingTeamName} Player Trace`,
      `- ${defendingTeamName} goal-side defenders: ${formatPlayerList(defendingPlayers.filter((player) => player.isGoalSide))}`,
      `- ${defendingTeamName} delayed/recovering defenders: ${formatPlayerList(defendingPlayers.filter((player) => player.isDelayed || player.isRecovering))}`,
      `- ${defendingTeamName} eliminated defenders: ${formatPlayerList(defendingPlayers.filter((player) => player.isEliminated))}`,
    ];
  });

  return ["Snapshots:", ...lines].join("\n");
}

function formatLogLine(
  line: TacticalLogLine,
  snapshots: readonly SnapshotReference[],
  debugTimelinePath: string | null,
  storyboards: readonly TacticalStoryboardReference[] = [],
): string {
  const text = line.text;

  if (text === "") {
    return "";
  }

  if (shouldSkipDecorativeLine(text)) {
    return "";
  }

  if (/^Sequence \d+$/.test(text)) {
    const sequenceNumber = Number.parseInt(text.replace("Sequence ", ""), 10);
    const snapshotBlock = formatSnapshotBlock(sequenceNumber, snapshots, debugTimelinePath, storyboards);

    return snapshotBlock === "" ? `## ${text}` : `## ${text}\n\n${snapshotBlock}`;
  }

  if (text === "Final Summary" || text === "Coaching Feedback" || text === "Final Score:") {
    return `## ${text.replace(":", "")}`;
  }

  if (text.endsWith(" Tactical Feedback")) {
    return `### ${text}`;
  }

  return text;
}

export function formatMiniMatchMarkdownReport(
  result: MiniMatchResult,
  snapshots: readonly SnapshotReference[] = [],
  debugTimelinePath: string | null = null,
  storyboardIndexPath: string | null = null,
  storyboards: readonly TacticalStoryboardReference[] = [],
  reportMode: MiniMatchReportMode = "COACH_REPORT",
): string {
  const title = `# Mini Match: ${result.state.context.teamA.displayName} vs ${result.state.context.teamB.displayName}`;
  const snapshotPlayerStates = snapshots.flatMap((snapshot) => snapshot.afterMetadata.playerStates);
  const activeIntentsAtStart =
    snapshots[0]?.beforeMetadata.playerStates.reduce((total, player) => total + player.activeIntents.length, 0) ?? 0;
  const persistencePass = snapshotPlayerStates.some((player) => player.intentAgeTicks > 0);
  const body = result.logs
    .map((line) => formatLogLine(line, snapshots, debugTimelinePath, storyboards))
    .filter((line, index, lines) => line !== "" || lines[index - 1] !== "")
    .join("\n")
    .trim();

  const timelineLink =
    debugTimelinePath === null ? "" : `\n\nDebug timeline: [${debugTimelinePath}](${debugTimelinePath})\n`;
  const storyboardLink =
    storyboardIndexPath === null
      ? ""
      : `\nTactical storyboards: [${storyboardIndexPath}](${storyboardIndexPath})\n`;
  const simulationFoundation = [
    "",
    "## Simulation Foundation",
    `- tick rate: ${DEFAULT_SIMULATION_CONFIG.tickRate} ticks/sec`,
    `- seed: ${result.state.context.seed}`,
    `- timeline: ${debugTimelinePath ?? "not generated"}`,
    `- world state mode: ${DEFAULT_SIMULATION_CONFIG.worldStateMode}`,
    `- legacy action adapter: ${DEFAULT_SIMULATION_CONFIG.legacyActionAdapterEnabled ? "enabled" : "disabled"}`,
    "",
  ].join("\n");
  const intentEngine = [
    "## Intent Engine",
    `- enabled: ${INTENT_ENGINE_CONFIG.enableIntentEngine ? "true" : "false"}`,
    `- default min duration ticks: ${INTENT_ENGINE_CONFIG.defaultMinIntentDurationTicks}`,
    `- default max duration ticks: ${INTENT_ENGINE_CONFIG.defaultMaxIntentDurationTicks}`,
    `- active intents at start: ${activeIntentsAtStart}`,
    `- persistence validation: ${persistencePass ? "PASS" : "FAIL"}`,
    `- report debug blocks: ${INTENT_ENGINE_CONFIG.showIntentDebugInReport ? "enabled" : "disabled"}`,
    `- snapshot intent labels: ${INTENT_ENGINE_CONFIG.showIntentLabelsInSnapshots ? "enabled" : "disabled"}`,
    "",
  ].join("\n");

  const markdown = `${title}${timelineLink}${storyboardLink}${simulationFoundation}${intentEngine}${body}\n`;

  return reportMode === "DEBUG_FULL_REPORT" ? debugReportText(markdown) : coachReportText(markdown);
}
