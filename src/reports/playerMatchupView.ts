import type { MatchInput, MatchReport, PlayerSnapshot } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";
import { PlayerRole } from "../models/player";

export type PlayerMatchupViewStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export type PlayerMatchupViewOrigin = "selection_preview_profile_view";

export type PlayerMatchupFitBand =
  | "low"
  | "medium"
  | "high";

export type PlayerMatchupAttributeSignal =
  | "match"
  | "partial"
  | "gap";

export interface PlayerMatchupAttributeComparison {
  readonly attributeLabel: string;
  readonly playerValueLabel: string;
  readonly expectedProfileValueLabel: string;
  readonly signal: PlayerMatchupAttributeSignal;
  readonly explanation: string;
}

export interface PlayerMatchupCandidate {
  readonly playerId: string;
  readonly playerName: string;
  readonly currentRoleLabel: string;
  readonly fitBand: PlayerMatchupFitBand;
  readonly fitScore: number;
  readonly matchedAttributes: readonly string[];
  readonly partialAttributes: readonly string[];
  readonly missingAttributes: readonly string[];
  readonly attributeComparisons: readonly PlayerMatchupAttributeComparison[];
  readonly whyStudy: readonly string[];
  readonly whatIsMissing: readonly string[];
  readonly riskIfUsed: readonly string[];
  readonly nextObservationSignal: readonly string[];
  readonly nonAppliedLabel: "Comparaison non appliquée";
  readonly confirmationLabel: "Non confirmée comme recommandation officielle";
  readonly canChangeLineup: false;
  readonly canChangeStarters: false;
  readonly canChangeBench: false;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canMutateTimeline: false;
  readonly canMutateScore: false;
  readonly canMutatePossession: false;
  readonly canCreateScoringEvent: false;
  readonly canClaimGlobalEconomy: false;
}

export interface PlayerMatchupProfileBlock {
  readonly profileId: string;
  readonly profileTitle: string;
  readonly roleFamilies: readonly string[];
  readonly usefulAttributes: readonly string[];
  readonly candidates: readonly PlayerMatchupCandidate[];
  readonly emptyState: string | null;
  readonly candidateCount: number;
  readonly highFitCount: number;
  readonly mediumFitCount: number;
  readonly lowFitCount: number;
  readonly noAutomaticSelection: true;
  readonly profileStillNonApplied: true;
  readonly officiallyConfirmed: false;
}

export interface PlayerMatchupViewModel {
  readonly status: PlayerMatchupViewStatus;
  readonly origin: PlayerMatchupViewOrigin;
  readonly profileBlockCount: number;
  readonly playerCandidateCount: number;
  readonly highFitCount: number;
  readonly mediumFitCount: number;
  readonly lowFitCount: number;
  readonly blocks: readonly PlayerMatchupProfileBlock[];
  readonly noAutomaticSelection: true;
  readonly profileAppliedCount: 0;
  readonly playerSelectedCount: 0;
  readonly lineupMutationCount: 0;
  readonly startersMutationCount: 0;
  readonly benchMutationCount: 0;
  readonly officiallyConfirmedCount: 0;
  readonly confidenceUpgradeCount: 0;
  readonly diagnosticAggregatesKeptSeparate: true;
  readonly sandboxAggregatesKeptSeparate: true;
  readonly officialAggregatesUsedAsSupportOnly: true;
  readonly canChangeLineup: false;
  readonly canChangeStarters: false;
  readonly canChangeBench: false;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canMutateTimeline: false;
  readonly canMutateScore: false;
  readonly canMutatePossession: false;
  readonly canCreateScoringEvent: false;
  readonly canClaimGlobalEconomy: false;
  readonly scoringConstantsUnchanged: true;
  readonly matchBonusEventUnchanged: true;
  readonly fullMatchBatchEconomyRemainsOnlyGlobalProof: true;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
}

export function playerMatchupFitBandLabel(fitBand: PlayerMatchupFitBand): string {
  switch (fitBand) {
    case "high":
      return "Compatibilité forte";
    case "medium":
      return "Compatibilité moyenne";
    case "low":
      return "Compatibilité faible";
  }
}

export function buildPlayerMatchupViewTags(model: Omit<PlayerMatchupViewModel, "tags">): readonly string[] {
  return [
    "player_matchup_view",
    `player_matchup_view_status_${model.status}`,
    `player_matchup_profile_block_count_${model.profileBlockCount}`,
    model.playerCandidateCount > 0 ? "player_matchup_candidate_count_present" : "player_matchup_candidate_count_empty",
    "player_matchup_no_automatic_selection_true",
    "player_matchup_player_selected_count_0",
    "player_matchup_lineup_mutation_count_0",
    "player_matchup_starters_mutation_count_0",
    "player_matchup_bench_mutation_count_0",
    "player_matchup_live_selection_driver_count_0",
    "player_matchup_production_route_resolution_driver_count_0",
    "player_matchup_score_mutation_count_0",
    "player_matchup_possession_mutation_count_0",
    "player_matchup_production_scoring_event_creation_count_0",
    "player_matchup_global_economy_claim_forbidden",
    "player_matchup_scoring_constants_unchanged",
  ];
}

export function playerMatchupViewCannotMutateOfficialState(model: PlayerMatchupViewModel): boolean {
  return !model.canMutateTimeline &&
    !model.canMutateScore &&
    !model.canMutatePossession &&
    !model.canCreateScoringEvent;
}

export function playerMatchupViewCannotDriveSelection(model: PlayerMatchupViewModel): boolean {
  return !model.canChangeLineup &&
    !model.canChangeStarters &&
    !model.canChangeBench &&
    !model.canDriveCoachInstruction &&
    !model.canDriveLiveSelection &&
    !model.canDriveProductionRouteResolution &&
    model.playerSelectedCount === 0 &&
    model.lineupMutationCount === 0 &&
    model.startersMutationCount === 0 &&
    model.benchMutationCount === 0;
}

export function playerMatchupViewEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: PlayerMatchupViewModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  return {
    factId: `${input.report.matchId}-player-matchup-view`,
    matchId: input.report.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_PLAYER_MATCHUP_VIEW",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: input.report.timeline.slice(0, 3).map((event) => event.eventId),
    affectedZones: [],
    summary:
      `Player Matchup View ${input.model.status}: profiles=${input.model.profileBlockCount}, ` +
      `candidates=${input.model.playerCandidateCount}, high=${input.model.highFitCount}, ` +
      `medium=${input.model.mediumFitCount}, low=${input.model.lowFitCount}; no automatic selection, player selection, lineup mutation, score mutation, possession mutation, production route driver, production scoring event creation, or global economy claim.`,
    confidence: "low",
    strength: 48,
    coachVisible: false,
    internalTags: input.model.tags,
  };
}

export function playerMatchupViewLimitations(model: PlayerMatchupViewModel): readonly string[] {
  if (model.status === "not_available") {
    return ["Player Matchup View is not available for this run."];
  }

  return [
    `Player Matchup View: ${model.profileBlockCount} profile blocks and ${model.playerCandidateCount} roster comparisons.`,
    "Player Matchup View is a study layer only: it cannot select players, change lineup, drive coach instruction, drive live selection, alter production route resolution, mutate score, mutate possession, create scoring events, upgrade confidence, or claim global economy.",
  ];
}

export function fallbackPlayerSnapshotFromStats(playerId: string): PlayerSnapshot {
  return {
    playerId,
    name: playerId,
    role: PlayerRole.Pivot,
    attributes: {
      speed: 58,
      agility: 58,
      endurance: 60,
      power: 56,
      handPlay: 58,
      footPlayDribble: 58,
      footPlayPassingShooting: 58,
      intelligence: 60,
      mental: 60,
    },
    traits: [],
    currentCondition: 60,
    mentalFreshness: 60,
  };
}
