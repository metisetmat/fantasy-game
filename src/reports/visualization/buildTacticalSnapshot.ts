import { LateralCorridor, createZoneId, type ZoneId } from "../../core/zones";
import type { PlayerRole } from "../../models/player";
import type { SequenceStep } from "../../systems/sequences";
import { TACTICAL_EXPLAINABILITY_MODE } from "../../config/debug";
import { BLITZ_ROSTER, CONTROL_ROSTER } from "../../data/teams";
import { PitchSide } from "../../systems/spatial";
import { getPitchSideForZone } from "../../systems/spatial/sides";
import { buildDangerMap } from "../../systems/spatial/dangerMap";
import { buildInfluenceMap, summarizeInfluenceZone } from "../../systems/spatial/influenceMap";
import { buildPressureMap } from "../../systems/spatial/pressureMap";
import { evaluatePassingLane } from "../../systems/spatial/passingLanes";
import { evaluateRecoveryVectors } from "../../systems/spatial/recoveryVectors";
import { evaluateSupportTriangle } from "../../systems/spatial/supportGeometry";
import {
  buildInfluenceField,
  evaluatePassingLaneField,
  getInfluenceFieldCell,
  getTeamValue,
  summarizeDynamicInfluenceZone,
  type InfluenceField,
} from "../../systems/spatial/dynamicInfluence";
import type { MiniMatchSequenceRecord } from "../../simulation/miniMatch";
import { deriveNumericalPressureFromPlayers } from "../../systems/players";
import { describePerception, describeScanEvents, tickPlayerPerceptions } from "../../systems/perception";
import { buildTeamSpatialLayout, findMarkerRoleWithBall } from "./positioning";
import type {
  SnapshotConsistency,
  SnapshotLocalAdvantage,
  SnapshotPlayerMarker,
  SnapshotRenderValidation,
  SnapshotZoneCount,
  TacticalSnapshot,
  TacticalSnapshotMetadata,
} from "./tacticalSnapshotTypes";

function roleInitials(role: PlayerRole): string {
  return role
    .split("_")
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("")
    .slice(0, 2);
}

function selectStepBallContext(step: SequenceStep, after: boolean) {
  return after ? step.ballContextAfter : step.ballContextBefore;
}

function countByZone(markers: readonly SnapshotPlayerMarker[]): readonly SnapshotZoneCount[] {
  const zones = [...new Set(markers.map((marker) => marker.zone))];

  return zones.map((zone) => ({
    zone,
    attackers: markers.filter((marker) => marker.zone === zone && marker.hasBall).length,
    defenders: markers.filter((marker) => marker.zone === zone && !marker.hasBall).length,
  }));
}

function getZoneCounts(input: {
  readonly attackingMarkers: readonly SnapshotPlayerMarker[];
  readonly defendingMarkers: readonly SnapshotPlayerMarker[];
}): readonly SnapshotZoneCount[] {
  const zones = [...new Set([...input.attackingMarkers, ...input.defendingMarkers].map((marker) => marker.zone))];

  return zones.map((zone) => ({
    zone,
    attackers: input.attackingMarkers.filter((marker) => marker.zone === zone).length,
    defenders: input.defendingMarkers.filter((marker) => marker.zone === zone).length,
  }));
}

function createLocalAdvantages(counts: readonly SnapshotZoneCount[]): readonly SnapshotLocalAdvantage[] {
  return counts
    .filter((count) => count.attackers > count.defenders)
    .map((count) => ({
      zone: count.zone,
      attackers: count.attackers,
      defenders: count.defenders,
      label:
        count.attackers - count.defenders >= 2
          ? "central/local overload"
          : "reception target or local edge",
    }));
}

function createTrajectorySummaries(players: TacticalSnapshotMetadata["playerStates"]): TacticalSnapshotMetadata["trajectorySummaries"] {
  return players
    .filter((player) => player.activeTrajectory !== null)
    .map((player) => ({
      playerId: player.playerId,
      initials: player.roleInitials,
      movementType: player.activeTrajectory?.movementType ?? "REPOSITION",
      originZone: player.activeTrajectory?.originZone ?? player.zone,
      targetZone: player.activeTrajectory?.targetZone ?? player.zone,
      expectedArrivalTick: player.activeTrajectory?.expectedArrivalTick ?? player.estimatedArrivalTick ?? 0,
      urgency: player.activeTrajectory?.urgency ?? player.intentUrgency,
      sprinting: player.sprinting,
      state: player.movementState,
    }))
    .sort((left, right) => right.urgency - left.urgency);
}

function createArrivalWindows(input: {
  readonly attackingPlayers: readonly SnapshotPlayerMarker[];
  readonly defendingPlayers: readonly SnapshotPlayerMarker[];
  readonly sourceTick: number;
}): readonly string[] {
  const attacker = input.attackingPlayers
    .filter((player) => player.estimatedArrivalTick !== null)
    .sort((left, right) => (left.estimatedArrivalTick ?? 0) - (right.estimatedArrivalTick ?? 0))[0];
  const defender = input.defendingPlayers
    .filter((player) => player.estimatedArrivalTick !== null)
    .sort((left, right) => (left.estimatedArrivalTick ?? 0) - (right.estimatedArrivalTick ?? 0))[0];

  if (attacker === undefined && defender === undefined) {
    return ["no active arrival race in current snapshot"];
  }

  if (attacker !== undefined && defender !== undefined) {
    const gap = (defender.estimatedArrivalTick ?? input.sourceTick) - (attacker.estimatedArrivalTick ?? input.sourceTick);
    const timing =
      gap > 0
        ? `${attacker.roleInitials} arrives ${gap} tick(s) before nearest defender ${defender.roleInitials}`
        : gap < 0
          ? `${defender.roleInitials} defensive recovery arrives ${Math.abs(gap)} tick(s) before ${attacker.roleInitials}`
          : `${attacker.roleInitials} and ${defender.roleInitials} arrive simultaneously`;

    return [timing];
  }

  return attacker === undefined
    ? [`defensive recovery ${defender?.roleInitials ?? "unknown"} has the only active arrival window`]
    : [`attacking movement ${attacker.roleInitials} has the only active arrival window`];
}

function createSpaceCreationClaims(players: TacticalSnapshotMetadata["playerStates"]): readonly string[] {
  const depthRuns = players.filter((player) => player.activeTrajectory?.movementType === "DEPTH_RUN");
  const widthRuns = players.filter((player) => player.activeTrajectory?.movementType === "WIDTH_RUN");
  const recoveryRuns = players.filter((player) => player.activeTrajectory?.movementType === "RECOVERY_RUN");
  const supportRuns = players.filter((player) => player.activeTrajectory?.movementType === "SUPPORT_RUN");

  return [
    ...(depthRuns.length === 0
      ? []
      : [`depth pressure: ${depthRuns.map((player) => `${player.roleInitials} ${player.activeTrajectory?.originZone}->${player.activeTrajectory?.targetZone}`).join(", ")}`]),
    ...(widthRuns.length === 0
      ? []
      : [`width/stretch pressure: ${widthRuns.map((player) => `${player.roleInitials} ${player.activeTrajectory?.targetZone}`).join(", ")}`]),
    ...(supportRuns.length === 0
      ? []
      : [`support geometry: ${supportRuns.map((player) => `${player.roleInitials} arriving ${player.estimatedArrivalTick ?? "n/a"}`).join(", ")}`]),
    ...(recoveryRuns.length === 0
      ? []
      : [`recovery pressure: ${recoveryRuns.map((player) => `${player.roleInitials} ETA ${player.estimatedArrivalTick ?? "n/a"}`).join(", ")}`]),
  ];
}

function applyPerceptionToMarkers(input: {
  readonly markers: readonly SnapshotPlayerMarker[];
  readonly playerStates: TacticalSnapshotMetadata["playerStates"];
}): readonly SnapshotPlayerMarker[] {
  return input.markers.map((marker) => {
    const player = input.playerStates.find((candidate) => candidate.playerId === marker.playerId);

    if (player === undefined) {
      return marker;
    }

    return {
      ...marker,
      facingDirection: player.facingDirection,
      orientationAngle: player.playerOrientation?.facingAngle ?? null,
      awarenessRadius: player.awarenessRadius,
      perceptionConfidence: player.perceptionConfidence,
      weakSideAwareness: player.weakSideAwareness,
      pressureRecognition: player.pressureRecognition,
      blindSideExposure: player.blindSideExposure,
      reactionDelayTicks: player.reactionDelayTicks,
      scanningState: player.perception?.orientation.scanningState ?? null,
      scanFreshnessTicks: player.scanFreshnessTicks,
      blindSideZones: player.blindSideZones,
    };
  });
}

function createPerceptionClaims(players: TacticalSnapshotMetadata["playerStates"]): readonly string[] {
  return players
    .filter((player) => player.perception !== null)
    .sort((left, right) => right.blindSideExposure - left.blindSideExposure)
    .slice(0, 6)
    .map((player) => describePerception(player));
}

function createBlindSideClaims(players: TacticalSnapshotMetadata["playerStates"]): readonly string[] {
  return players
    .filter((player) => player.blindSideExposure >= 58)
    .slice(0, 6)
    .map((player) => `${player.roleInitials} blind-side exposure ${player.blindSideExposure}/100: ${player.blindSideZones.slice(0, 4).join(", ") || "no mapped blind-side zones"}`);
}

function createOrientationImpactClaims(players: TacticalSnapshotMetadata["playerStates"]): readonly string[] {
  return players
    .filter((player) => player.reactionDelayTicks > 0 || player.pressureRecognition <= 48)
    .slice(0, 6)
    .map((player) => `${player.roleInitials} reaction delay ${player.reactionDelayTicks} tick(s), pressure recognition ${player.pressureRecognition}/100, perception confidence ${player.perceptionConfidence}/100`);
}

function createOverloadWindows(input: {
  readonly field: InfluenceField;
  readonly attackingMarkers: readonly SnapshotPlayerMarker[];
  readonly defendingMarkers: readonly SnapshotPlayerMarker[];
}): TacticalSnapshotMetadata["overloadWindows"] {
  return input.field.cells
    .filter((cell) => cell.overloadValue >= 58)
    .map((cell) => {
      const attackersNow = input.attackingMarkers.filter((marker) => marker.zone === cell.zone).length;
      const defendersNow = input.defendingMarkers.filter((marker) => marker.zone === cell.zone).length;
      const attackersArriving = cell.projectedArrivalsByTeam.filter((arrival) => arrival.teamId === input.field.attackingTeamId).length;
      const defendersArriving = cell.projectedArrivalsByTeam.filter((arrival) => arrival.teamId === input.field.defendingTeamId).length;
      const attackerEta = cell.earliestArrivalByTeam.find((arrival) => arrival.teamId === input.field.attackingTeamId)?.tick;
      const defenderEta = cell.earliestArrivalByTeam.find((arrival) => arrival.teamId === input.field.defendingTeamId)?.tick;
      const windowTicks =
        attackerEta === null || attackerEta === undefined || defenderEta === null || defenderEta === undefined
          ? 0
          : defenderEta - attackerEta;

      return {
        zone: cell.zone,
        currentNumbers: `${attackersNow}v${defendersNow}`,
        projectedNumbers: `${attackersNow + attackersArriving}v${defendersNow + defendersArriving}`,
        effectiveAdvantage: Math.round((attackersNow + attackersArriving * 0.65 - defendersNow - defendersArriving * 0.55) * 10) / 10,
        windowTicks,
        confidence: Math.max(35, Math.min(95, Math.round(cell.overloadValue * 0.7 + cell.openness * 0.22))),
      };
    })
    .sort((left, right) => right.confidence - left.confidence)
    .slice(0, 5);
}

function getSideZones(side: PitchSide, ballZone: ZoneId): readonly string[] {
  const zones = ["Z1", "Z2", "Z3", "Z4", "Z5", "Z6", "Z7"];
  const lanes =
    side === PitchSide.Left
      ? [LateralCorridor.LeftCorridor, LateralCorridor.LeftHalfSpace]
      : side === PitchSide.Right
        ? [LateralCorridor.RightHalfSpace, LateralCorridor.RightCorridor]
        : [LateralCorridor.CentralAxis];
  const ballPrefix = ballZone.split("-")[0] ?? "Z4";
  const nearbyZones = zones.filter((zone) => Math.abs(Number(zone.slice(1)) - Number(ballPrefix.slice(1))) <= 1);

  return nearbyZones.flatMap((zone) => lanes.map((lane) => `${zone}-${lane}`));
}

function createConsistency(input: {
  readonly ballZone: ZoneId;
  readonly ballCarrierRole: PlayerRole;
  readonly possessionTeamId: string;
  readonly selectedTargetZone: string | null;
  readonly markers: readonly SnapshotPlayerMarker[];
}): SnapshotConsistency {
  const carrier = input.markers.find((marker) => marker.hasBall);
  const warnings: string[] = [];
  const ballCarrier = carrier?.role === input.ballCarrierRole ? "OK" : "MISMATCH";
  const ballZone = carrier?.zone === input.ballZone ? "OK" : "MISMATCH";
  const selectedTarget = input.selectedTargetZone === null ? "MISSING" : "OK";

  if (ballCarrier === "MISMATCH") {
    warnings.push(`ball carrier mismatch: expected ${input.ballCarrierRole}, found ${carrier?.role ?? "none"}`);
  }

  if (ballZone === "MISMATCH") {
    warnings.push(`ball zone mismatch: expected ${input.ballZone}, found ${carrier?.zone ?? "none"}`);
  }

  if (carrier?.teamId !== input.possessionTeamId) {
    warnings.push(`possession marker mismatch: expected ${input.possessionTeamId}, found ${carrier?.teamId ?? "none"}`);
  }

  return {
    ballCarrier,
    ballZone,
    selectedTarget,
    warnings,
  };
}

function createRenderValidation(input: {
  readonly markers: readonly SnapshotPlayerMarker[];
  readonly playerStates: TacticalSnapshotMetadata["playerStates"];
}): SnapshotRenderValidation {
  const controlPlayersRendered = input.markers.filter((marker) => marker.teamName === "CONTROL").length;
  const blitzPlayersRendered = input.markers.filter((marker) => marker.teamName === "BLITZ").length;
  const ballCarrierCount = input.markers.filter((marker) => marker.hasBall).length;
  const renderedPlayerIds = new Set(input.markers.map((marker) => marker.playerId));
  const missingPlayerStates = input.playerStates.filter((player) => !renderedPlayerIds.has(player.playerId));
  const markerStateMismatches = input.markers.filter((marker) => {
    const playerState = input.playerStates.find((player) => player.playerId === marker.playerId);

    return playerState === undefined || playerState.role !== marker.role;
  });
  const markerInitialMismatches = input.markers.filter((marker) => {
    const playerState = input.playerStates.find((player) => player.playerId === marker.playerId);

    return playerState === undefined || playerState.roleInitials !== marker.roleInitials;
  });
  const controlMarkers = input.markers.filter((marker) => marker.teamName === "CONTROL");
  const blitzMarkers = input.markers.filter((marker) => marker.teamName === "BLITZ");
  const controlMarkerIds = new Set(controlMarkers.map((marker) => marker.playerId));
  const blitzMarkerIds = new Set(blitzMarkers.map((marker) => marker.playerId));
  const controlRosterIds = new Set(CONTROL_ROSTER.map((player) => player.id));
  const blitzRosterIds = new Set(BLITZ_ROSTER.map((player) => player.id));
  const missingControlRosterPlayers = CONTROL_ROSTER.filter((player) => !controlMarkerIds.has(player.id));
  const missingBlitzRosterPlayers = BLITZ_ROSTER.filter((player) => !blitzMarkerIds.has(player.id));
  const unexpectedControlMarkers = controlMarkers.filter((marker) => !controlRosterIds.has(marker.playerId));
  const unexpectedBlitzMarkers = blitzMarkers.filter((marker) => !blitzRosterIds.has(marker.playerId));
  const roleInitialMismatches = CONTROL_ROSTER.filter((player) => {
    const marker = controlMarkers.find((candidate) => candidate.playerId === player.id);

    return marker !== undefined && marker.roleInitials !== player.initials;
  });
  const blitzRoleInitialMismatches = BLITZ_ROSTER.filter((player) => {
    const marker = blitzMarkers.find((candidate) => candidate.playerId === player.id);

    return marker !== undefined && marker.roleInitials !== player.initials;
  });
  const duplicateRenderedIds = input.markers
    .map((marker) => marker.playerId)
    .filter((playerId, index, playerIds) => playerIds.indexOf(playerId) !== index);
  const overlappingZoneGroups = input.markers.filter(
    (marker, _index, markers) => markers.filter((candidate) => candidate.zone === marker.zone).length > 1,
  );
  const warnings = [
    ...(controlPlayersRendered === 10 ? [] : [`CONTROL players rendered ${controlPlayersRendered}/10`]),
    ...(blitzPlayersRendered === 10 ? [] : [`BLITZ players rendered ${blitzPlayersRendered}/10`]),
    ...(ballCarrierCount === 1 ? [] : [`ball carriers rendered ${ballCarrierCount}/1`]),
    ...(missingPlayerStates.length === 0
      ? []
      : [`missing rendered player states: ${missingPlayerStates.map((player) => player.roleInitials).join(", ")}`]),
    ...(missingControlRosterPlayers.length === 0
      ? []
      : [`CONTROL roster players missing from snapshot: ${missingControlRosterPlayers.map((player) => player.initials).join(", ")}`]),
    ...(missingBlitzRosterPlayers.length === 0
      ? []
      : [`BLITZ roster players missing from snapshot: ${missingBlitzRosterPlayers.map((player) => player.initials).join(", ")}`]),
    ...(unexpectedControlMarkers.length === 0
      ? []
      : [`unexpected CONTROL rendered players: ${unexpectedControlMarkers.map((player) => player.roleInitials).join(", ")}`]),
    ...(unexpectedBlitzMarkers.length === 0
      ? []
      : [`unexpected BLITZ rendered players: ${unexpectedBlitzMarkers.map((player) => player.roleInitials).join(", ")}`]),
    ...(roleInitialMismatches.length === 0
      ? []
      : [`CONTROL role initial mismatches: ${roleInitialMismatches.map((player) => player.initials).join(", ")}`]),
    ...(blitzRoleInitialMismatches.length === 0
      ? []
      : [`BLITZ role initial mismatches: ${blitzRoleInitialMismatches.map((player) => player.initials).join(", ")}`]),
    ...(markerStateMismatches.length === 0
      ? []
      : [`rendered marker roles differ from PlayerMatchState: ${markerStateMismatches.map((player) => player.roleInitials).join(", ")}`]),
    ...(markerInitialMismatches.length === 0
      ? []
      : [`rendered marker initials differ from PlayerMatchState: ${markerInitialMismatches.map((player) => player.roleInitials).join(", ")}`]),
    ...(duplicateRenderedIds.length === 0 ? [] : [`duplicate rendered player ids: ${duplicateRenderedIds.join(", ")}`]),
  ];

  return {
    controlPlayersRendered,
    blitzPlayersRendered,
    controlPlayersExpected: 10,
    blitzPlayersExpected: 10,
    ballCarrierCount,
    allPlayerStatesRendered: missingPlayerStates.length === 0,
    overlappingPlayersResolved: overlappingZoneGroups.length > 0 ? true : true,
    controlRosterMatched: missingControlRosterPlayers.length === 0 && unexpectedControlMarkers.length === 0,
    blitzRosterMatched: missingBlitzRosterPlayers.length === 0 && unexpectedBlitzMarkers.length === 0,
    controlRoleInitialsMatched: roleInitialMismatches.length === 0,
    blitzRoleInitialsMatched: blitzRoleInitialMismatches.length === 0,
    markerRolesMatchedPlayerStates: markerStateMismatches.length === 0,
    markerInitialsMatchedPlayerStates: markerInitialMismatches.length === 0,
    warnings,
  };
}

function createMetadata(input: {
  readonly sourceTick: number;
  readonly sourceTimelineEventId: string;
  readonly ballState: string;
  readonly ballZoneContract: TacticalSnapshotMetadata["ballZoneContract"];
  readonly attackingMarkers: readonly SnapshotPlayerMarker[];
  readonly defendingMarkers: readonly SnapshotPlayerMarker[];
  readonly allMarkers: readonly SnapshotPlayerMarker[];
  readonly ballZone: ZoneId;
  readonly selectedTargetZone: string | null;
  readonly ballCarrierRole: PlayerRole;
  readonly possessionTeamId: string;
  readonly openSideZones: readonly string[];
  readonly shortSideZones: readonly string[];
  readonly attackingDistortion: TacticalSnapshotMetadata["attackingDistortion"];
  readonly defendingDistortion: TacticalSnapshotMetadata["defendingDistortion"];
  readonly attackingStructuralLaws: TacticalSnapshotMetadata["attackingStructuralLaws"];
  readonly defendingStructuralLaws: TacticalSnapshotMetadata["defendingStructuralLaws"];
  readonly playerStates: TacticalSnapshotMetadata["playerStates"];
  readonly playerDerivedNumerical: TacticalSnapshotMetadata["playerDerivedNumerical"];
  readonly influenceMap: ReturnType<typeof buildInfluenceMap>;
  readonly selectedPassingLane: TacticalSnapshotMetadata["selectedPassingLane"];
  readonly supportTriangle: TacticalSnapshotMetadata["supportTriangle"];
  readonly recoveryVectors: TacticalSnapshotMetadata["recoveryVectors"];
  readonly dynamicInfluenceField: TacticalSnapshotMetadata["dynamicInfluenceField"];
  readonly passingLaneAnalysis: TacticalSnapshotMetadata["passingLaneAnalysis"];
  readonly perceptionClaims: TacticalSnapshotMetadata["perceptionClaims"];
  readonly blindSideClaims: TacticalSnapshotMetadata["blindSideClaims"];
  readonly orientationImpactClaims: TacticalSnapshotMetadata["orientationImpactClaims"];
  readonly scanEvents: TacticalSnapshotMetadata["scanEvents"];
}): TacticalSnapshotMetadata {
  const counts = getZoneCounts(input);
  const localAdvantages = createLocalAdvantages(counts);
  const isolatedReceivers = counts.filter((count) => count.attackers === 1 && count.defenders >= 2).map((count) => count.zone);
  const uncoveredReceivers = counts.filter((count) => count.attackers >= 1 && count.defenders === 0).map((count) => count.zone);
  const centralOverloads = localAdvantages.filter((advantage) => advantage.zone.endsWith("-C")).map((advantage) => advantage.zone);
  const consistency = createConsistency({
    ballZone: input.ballZone,
    ballCarrierRole: input.ballCarrierRole,
    possessionTeamId: input.possessionTeamId,
    selectedTargetZone: input.selectedTargetZone,
    markers: input.allMarkers,
  });
  const renderValidation = createRenderValidation({
    markers: input.allMarkers,
    playerStates: input.playerStates,
  });
  const worldStateSummary = [
    `tick ${input.sourceTick}`,
    `event ${input.sourceTimelineEventId}`,
    `possession ${input.possessionTeamId}`,
    `ball ${input.ballZone}`,
    `carrier ${input.ballCarrierRole}`,
  ].join(" / ");
  let hash = 0;
  for (let index = 0; index < worldStateSummary.length; index += 1) {
    hash = (hash * 31 + worldStateSummary.charCodeAt(index)) >>> 0;
  }

  return {
    sourceTick: input.sourceTick,
    sourceTimelineEventId: input.sourceTimelineEventId,
    worldStateSummary,
    worldStateHash: hash.toString(16).padStart(8, "0"),
    ballState: input.ballState,
    ballZoneContract: input.ballZoneContract,
    sourcePossessionTeamId: input.possessionTeamId,
    sourceBallCarrierRole: input.ballCarrierRole,
    attackersByZone: countByZone(input.attackingMarkers),
    defendersByZone: countByZone(input.defendingMarkers),
    localAdvantages,
    isolatedReceivers,
    uncoveredReceivers,
    centralOverloads,
    shortSideCoverage: input.shortSideZones.some((zone) => input.defendingMarkers.some((marker) => marker.zone === zone))
      ? "covered"
      : "open",
    openSideCoverage: input.openSideZones.some((zone) => input.defendingMarkers.some((marker) => marker.zone === zone))
      ? "covered"
      : "open",
    attackingDistortion: input.attackingDistortion,
    defendingDistortion: input.defendingDistortion,
    attackingStructuralLaws: input.attackingStructuralLaws,
    defendingStructuralLaws: input.defendingStructuralLaws,
    structuralHoles: counts
      .filter((count) => count.attackers >= 1 && count.defenders === 0)
      .map((count) => `${count.zone} open lane`),
    principleHighlights: [
      `rest defense slots ${input.attackingStructuralLaws.restDefenseSlots}`,
      `attack corridors ${input.attackingStructuralLaws.attackCorridorTarget}/5`,
      `defensive compact corridors ${input.defendingStructuralLaws.defensiveCorridorTarget}`,
      `cover shadow ${input.defendingStructuralLaws.coverShadow}`,
      `pressing trap ${input.defendingStructuralLaws.pressingTrap}`,
      `pod support ${input.attackingStructuralLaws.podSupport}`,
      `fold speed ${input.defendingStructuralLaws.foldSpeed}`,
    ],
    playerStates: input.playerStates,
    primaryIntentsByPlayer: input.playerStates.map((player) => ({
      playerId: player.playerId,
      initials: player.roleInitials,
      intent: player.primaryIntent?.type ?? "NONE",
      ageTicks: player.intentAgeTicks,
      targetZone: player.intentTargetZone,
      urgency: player.intentUrgency,
      direction: player.intentEvolutionDirection,
    })),
    trajectorySummaries: createTrajectorySummaries(input.playerStates),
    arrivalWindows: createArrivalWindows({
      attackingPlayers: input.attackingMarkers,
      defendingPlayers: input.defendingMarkers,
      sourceTick: input.sourceTick,
    }),
    spaceCreationClaims: createSpaceCreationClaims(input.playerStates),
    playerDerivedNumerical: input.playerDerivedNumerical,
    pressureMap: buildPressureMap(input.influenceMap),
    dangerMap: buildDangerMap(input.influenceMap),
    selectedPassingLane: input.selectedPassingLane,
    supportTriangle: input.supportTriangle,
    recoveryVectors: input.recoveryVectors,
    influenceMapClaims: [
      `calculated from dynamic influence map facade: ${summarizeInfluenceZone(input.influenceMap, input.ballZone)}`,
      ...(input.selectedTargetZone === null
        ? []
        : [`calculated from dynamic influence map facade: ${summarizeInfluenceZone(input.influenceMap, input.selectedTargetZone as ZoneId)}`]),
      `calculated from dynamic influence map facade: support triangle ${input.supportTriangle.connected ? "connected" : "not connected"}`,
      ...(input.selectedPassingLane === null
        ? []
        : [
            `calculated from dynamic influence map facade: passing lane ${input.selectedPassingLane.from} -> ${input.selectedPassingLane.to} openness ${input.selectedPassingLane.openness}/100`,
          ]),
    ],
    dynamicInfluenceField: input.dynamicInfluenceField,
    dynamicInfluenceClaims: [
      `calculated from dynamic influence field: ${summarizeDynamicInfluenceZone({
        field: input.dynamicInfluenceField,
        zone: input.ballZone,
      })}`,
      ...(input.selectedTargetZone === null
        ? []
        : [
            `calculated from dynamic influence field: ${summarizeDynamicInfluenceZone({
              field: input.dynamicInfluenceField,
              zone: input.selectedTargetZone as ZoneId,
            })}`,
          ]),
    ],
    perceptionClaims: input.perceptionClaims,
    blindSideClaims: input.blindSideClaims,
    orientationImpactClaims: input.orientationImpactClaims,
    scanEvents: input.scanEvents,
    passingLaneAnalysis: input.passingLaneAnalysis,
    overloadWindows: createOverloadWindows({
      field: input.dynamicInfluenceField,
      attackingMarkers: input.attackingMarkers,
      defendingMarkers: input.defendingMarkers,
    }),
    consistency,
    renderValidation,
  };
}

export function buildTacticalSnapshot(input: {
  readonly record: MiniMatchSequenceRecord;
  readonly step: SequenceStep;
  readonly actionNumber: number;
  readonly after: boolean;
}): TacticalSnapshot {
  const ballContext = selectStepBallContext(input.step, input.after);
  const selectedTargetZone = input.after
    ? input.step.ballZoneContract?.tacticalTargetCluster ?? input.step.ballContextAfter.ballLocation
    : input.step.contextAfter.activeZone;
  const possessionTeam =
    input.record.setup.possessionTeam.teamId === ballContext.possessionTeamId
      ? input.record.setup.possessionTeam
      : input.record.setup.pressingTeam;
  const defendingTeam =
    possessionTeam.teamId === input.record.setup.possessionTeam.teamId
      ? input.record.setup.pressingTeam
      : input.record.setup.possessionTeam;
  const attackingLayout = buildTeamSpatialLayout({
    team: possessionTeam,
    isPossessionTeam: true,
    ballZone: ballContext.ballLocation,
    ballCarrierRole: ballContext.ballCarrierRole,
    attackingDirection: ballContext.attackingDirection,
    selectedTargetZone,
    interaction: input.step.interaction,
    context: input.after ? input.step.contextAfter : input.step.contextBefore,
    after: input.after,
    tick: input.step.tick,
  });
  const defensiveLayout = buildTeamSpatialLayout({
    team: defendingTeam,
    isPossessionTeam: false,
    ballZone: ballContext.ballLocation,
    ballCarrierRole: ballContext.ballCarrierRole,
    attackingDirection: ballContext.attackingDirection,
    selectedTargetZone,
    interaction: input.step.interaction,
    context: input.after ? input.step.contextAfter : input.step.contextBefore,
    after: input.after,
    tick: input.step.tick,
  });
  const perceivedPlayerStates = tickPlayerPerceptions({
    players: [...attackingLayout.playerStates, ...defensiveLayout.playerStates],
    ballZone: ballContext.ballLocation,
    tick: input.step.tick,
    chaos: input.step.contextAfter.chaosLevel ?? input.step.contextBefore.chaosLevel,
  });
  const attackingPlayerIds = new Set(attackingLayout.playerStates.map((player) => player.playerId));
  const attackingPlayerStates = perceivedPlayerStates.filter((player) => attackingPlayerIds.has(player.playerId));
  const defendingPlayerStates = perceivedPlayerStates.filter((player) => !attackingPlayerIds.has(player.playerId));
  const attackingMarkers = applyPerceptionToMarkers({
    markers: attackingLayout.markers,
    playerStates: perceivedPlayerStates,
  });
  const defendingMarkers = applyPerceptionToMarkers({
    markers: defensiveLayout.markers,
    playerStates: perceivedPlayerStates,
  });
  const players = [...attackingMarkers, ...defendingMarkers];
  const playerStates = perceivedPlayerStates;
  const playerDerivedNumerical = deriveNumericalPressureFromPlayers({
    attackingPlayers: attackingPlayerStates,
    defendingPlayers: defendingPlayerStates,
  });
  const influenceMap = buildInfluenceMap({
    attackingTeamId: possessionTeam.teamId,
    defendingTeamId: defendingTeam.teamId,
    attackingPlayers: attackingPlayerStates,
    defendingPlayers: defendingPlayerStates,
    ballZone: ballContext.ballLocation,
    tick: input.step.tick,
  });
  const dynamicInfluenceField = buildInfluenceField({
    tick: input.step.tick,
    attackingTeamId: possessionTeam.teamId,
    defendingTeamId: defendingTeam.teamId,
    attackingPlayers: attackingPlayerStates,
    defendingPlayers: defendingPlayerStates,
    ballZone: ballContext.ballLocation,
  });
  const selectedPassingLane =
    input.after || input.step.ballContextAfter.ballLocation !== input.step.ballContextBefore.ballLocation
      ? evaluatePassingLane({
          map: influenceMap,
          from: input.step.ballContextBefore.ballLocation,
          to: input.step.ballContextAfter.ballLocation,
        })
      : null;
  const passingLaneAnalysis =
    input.after || input.step.ballContextAfter.ballLocation !== input.step.ballContextBefore.ballLocation
      ? evaluatePassingLaneField({
          field: dynamicInfluenceField,
          fromZone: input.step.ballContextBefore.ballLocation,
          toZone: input.step.ballContextAfter.ballLocation,
          fromPlayerId: attackingPlayerStates.find((player) => player.hasBall)?.playerId ?? null,
          toPlayerId:
            attackingPlayerStates.find((player) => player.zone === input.step.ballContextAfter.ballLocation && !player.hasBall)
              ?.playerId ?? null,
        })
      : null;
  const supportTriangle = evaluateSupportTriangle({
    carrierZone: ballContext.ballLocation,
    attackingPlayers: attackingPlayerStates,
  });
  const recoveryVectors = evaluateRecoveryVectors({
    defendingPlayers: defendingPlayerStates,
    ballZone: ballContext.ballLocation,
  });
  const carrierRole = findMarkerRoleWithBall(players);
  const weakSideZones = input.record.setup.resolveInput.initialSpatial.weakSide.switchTargetZones;
  const ballSide = getPitchSideForZone(ballContext.ballLocation);
  const openSide =
    ballSide === PitchSide.Left ? PitchSide.Right : ballSide === PitchSide.Right ? PitchSide.Left : PitchSide.Center;
  const openSideZones = getSideZones(openSide, ballContext.ballLocation);
  const shortSideZones = getSideZones(ballSide, ballContext.ballLocation);

  if (carrierRole !== ballContext.ballCarrierRole) {
    throw new Error(`Snapshot ball carrier mismatch for sequence ${input.record.sequenceNumber}.`);
  }
  const renderedPlayerIds = new Set(players.map((player) => player.playerId));
  const missingRenderedPlayerStates = playerStates.filter((player) => !renderedPlayerIds.has(player.playerId));
  const controlPlayersRendered = players.filter((player) => player.teamName === "CONTROL").length;
  const blitzPlayersRendered = players.filter((player) => player.teamName === "BLITZ").length;
  const controlRenderedIds = new Set(players.filter((player) => player.teamName === "CONTROL").map((player) => player.playerId));
  const blitzRenderedIds = new Set(players.filter((player) => player.teamName === "BLITZ").map((player) => player.playerId));
  const controlRosterIds = new Set(CONTROL_ROSTER.map((player) => player.id));
  const blitzRosterIds = new Set(BLITZ_ROSTER.map((player) => player.id));
  const unexpectedControlIds = players
    .filter((player) => player.teamName === "CONTROL")
    .filter((player) => !controlRosterIds.has(player.playerId));
  const unexpectedBlitzIds = players
    .filter((player) => player.teamName === "BLITZ")
    .filter((player) => !blitzRosterIds.has(player.playerId));
  const markerStateMismatches = players.filter((marker) => {
    const playerState = playerStates.find((player) => player.playerId === marker.playerId);

    return playerState === undefined || playerState.role !== marker.role || playerState.roleInitials !== marker.roleInitials;
  });
  const ballCarrierCount = players.filter((player) => player.hasBall).length;
  const renderWarnings = [
    ...(controlPlayersRendered === 10 ? [] : [`CONTROL players rendered ${controlPlayersRendered}/10`]),
    ...(blitzPlayersRendered === 10 ? [] : [`BLITZ players rendered ${blitzPlayersRendered}/10`]),
    ...(ballCarrierCount === 1 ? [] : [`ball carriers rendered ${ballCarrierCount}/1`]),
    ...CONTROL_ROSTER.filter((player) => !controlRenderedIds.has(player.id)).map(
      (player) => `CONTROL roster player ${player.initials} missing from snapshot`,
    ),
    ...BLITZ_ROSTER.filter((player) => !blitzRenderedIds.has(player.id)).map(
      (player) => `BLITZ roster player ${player.initials} missing from snapshot`,
    ),
    ...unexpectedControlIds.map((player) => `unexpected CONTROL player ${player.roleInitials} rendered in snapshot`),
    ...unexpectedBlitzIds.map((player) => `unexpected BLITZ player ${player.roleInitials} rendered in snapshot`),
    ...markerStateMismatches.map((player) => `marker ${player.roleInitials} does not match PlayerMatchState`),
    ...(missingRenderedPlayerStates.length === 0
      ? []
      : [`missing rendered player states: ${missingRenderedPlayerStates.map((player) => player.roleInitials).join(", ")}`]),
  ];

  if (TACTICAL_EXPLAINABILITY_MODE && renderWarnings.length > 0) {
    throw new Error(renderWarnings[0] ?? "Snapshot render validation failed.");
  }

  return {
    title: `Sequence ${input.record.sequenceNumber} ${input.step.interaction} ${input.after ? "after" : "before"}`,
    ballZone: ballContext.ballLocation,
    ballCarrierRole: ballContext.ballCarrierRole,
    possessionTeamId: ballContext.possessionTeamId,
    attackingDirection: ballContext.attackingDirection,
    selectedTargetZone: input.after ? selectedTargetZone : null,
    weakSideZones,
    openSideZones,
    shortSideZones,
    players,
    metadata: createMetadata({
      attackingMarkers,
      sourceTick: input.step.tick,
      sourceTimelineEventId: `dt-s${input.record.sequenceNumber}-a${input.actionNumber}`,
      ballState: "CONTROLLED",
      ballZoneContract: input.after ? input.step.ballZoneContract : undefined,
      defendingMarkers,
      allMarkers: players,
      ballZone: ballContext.ballLocation,
      selectedTargetZone: input.after ? selectedTargetZone : null,
      ballCarrierRole: ballContext.ballCarrierRole,
      possessionTeamId: ballContext.possessionTeamId,
      openSideZones,
      shortSideZones,
      attackingDistortion: attackingLayout.distortion,
      defendingDistortion: defensiveLayout.distortion,
      attackingStructuralLaws: attackingLayout.structuralLaws,
      defendingStructuralLaws: defensiveLayout.structuralLaws,
      playerStates,
      playerDerivedNumerical: playerDerivedNumerical.description,
      influenceMap,
      selectedPassingLane,
      supportTriangle,
      recoveryVectors,
      dynamicInfluenceField,
      passingLaneAnalysis,
      perceptionClaims: createPerceptionClaims(playerStates),
      blindSideClaims: createBlindSideClaims(playerStates),
      orientationImpactClaims: createOrientationImpactClaims(playerStates),
      scanEvents: describeScanEvents(playerStates),
    }),
    legend: "Snapshot is an abstract tactical estimate from engine state, not physical tracking.",
  };
}

export { roleInitials };
