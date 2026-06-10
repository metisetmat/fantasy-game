import { LATERAL_CORRIDORS, type LateralCorridor } from "../../core/zones";
import type { PlayerMatchState } from "../../systems/players";
import { StoryboardCameraMode, TACTICAL_STORYBOARD_CONFIG } from "./storyboardConfig";
import type { StoryboardCamera } from "./tacticalStoryboard";

export const STORYBOARD_ZONES: readonly string[] = ["Z0", "Z1", "Z2", "Z3", "Z4", "Z5", "Z6", "Z7", "Z8"];
export const STORYBOARD_CELL_WIDTH = 92;
export const STORYBOARD_CELL_HEIGHT = 62;
export const STORYBOARD_LEFT = 70;
export const STORYBOARD_TOP = 70;

export interface StoryboardPoint {
  readonly x: number;
  readonly y: number;
}

export interface StoryboardMarkerPoint extends StoryboardPoint {
  readonly visible: boolean;
}

export function parseStoryboardZone(zone: string): { readonly z: string; readonly lane: string } {
  const [z, lane] = zone.split("-");

  return {
    z: z ?? "Z4",
    lane: lane ?? "C",
  };
}

export function storyboardCellPoint(zone: string): StoryboardPoint {
  const parsed = parseStoryboardZone(zone);
  const zoneIndex = Math.max(0, STORYBOARD_ZONES.indexOf(parsed.z));
  const laneIndex = Math.max(0, LATERAL_CORRIDORS.indexOf(parsed.lane as LateralCorridor));

  return {
    x: STORYBOARD_LEFT + zoneIndex * STORYBOARD_CELL_WIDTH + STORYBOARD_CELL_WIDTH / 2,
    y: STORYBOARD_TOP + laneIndex * STORYBOARD_CELL_HEIGHT + STORYBOARD_CELL_HEIGHT / 2,
  };
}

export function storyboardMarkerPoint(input: {
  readonly player: PlayerMatchState;
  readonly players: readonly PlayerMatchState[];
}): StoryboardPoint {
  const peers = input.players
    .filter((player) => player.zone === input.player.zone)
    .sort((left, right) => left.playerId.localeCompare(right.playerId));
  const peerIndex = Math.max(
    0,
    peers.findIndex((player) => player.playerId === input.player.playerId),
  );
  const point = storyboardCellPoint(input.player.zone);

  if (peers.length <= 1) {
    return point;
  }

  const offsets = [
    { x: -18, y: -12 },
    { x: 0, y: -12 },
    { x: 18, y: -12 },
    { x: -18, y: 6 },
    { x: 0, y: 6 },
    { x: 18, y: 6 },
    { x: -8, y: 23 },
    { x: 8, y: 23 },
  ] as const;
  const offset = offsets[peerIndex] ?? { x: (peerIndex % 4) * 9 - 14, y: 28 };

  return {
    x: point.x + offset.x,
    y: point.y + offset.y,
  };
}

function zoneIndex(zone: string): number {
  return Math.max(0, STORYBOARD_ZONES.indexOf(parseStoryboardZone(zone).z));
}

function laneIndex(zone: string): number {
  return Math.max(0, LATERAL_CORRIDORS.indexOf(parseStoryboardZone(zone).lane as LateralCorridor));
}

export function buildStoryboardCamera(input: {
  readonly zones: readonly string[];
  readonly mode?: StoryboardCameraMode;
}): StoryboardCamera {
  const mode = input.mode ?? TACTICAL_STORYBOARD_CONFIG.defaultCameraMode;
  const zones = input.zones.length === 0 ? ["Z4-C"] : input.zones;
  const zoneIndexes = zones.map(zoneIndex);
  const laneIndexes = zones.map(laneIndex);
  const minZone = Math.max(0, Math.min(...zoneIndexes) - 1);
  const maxZone = Math.min(STORYBOARD_ZONES.length - 1, Math.max(...zoneIndexes) + 1);
  const minLane = Math.max(0, Math.min(...laneIndexes) - 1);
  const maxLane = Math.min(LATERAL_CORRIDORS.length - 1, Math.max(...laneIndexes) + 1);
  const fullWidth = STORYBOARD_LEFT * 2 + STORYBOARD_ZONES.length * STORYBOARD_CELL_WIDTH;
  const fullHeight = STORYBOARD_TOP * 2 + LATERAL_CORRIDORS.length * STORYBOARD_CELL_HEIGHT;

  if (mode === StoryboardCameraMode.FullField) {
    return {
      mode,
      viewBox: `0 0 ${fullWidth} ${fullHeight}`,
      focusZone: zones[0] ?? "Z4-C",
      includedZones: zones,
      cameraKey: `FULL_FIELD:${zones.join("|")}`,
    };
  }

  const x = Math.max(0, STORYBOARD_LEFT + minZone * STORYBOARD_CELL_WIDTH - 26);
  const y = Math.max(0, STORYBOARD_TOP + minLane * STORYBOARD_CELL_HEIGHT - 30);
  const width = Math.min(fullWidth - x, (maxZone - minZone + 1) * STORYBOARD_CELL_WIDTH + 52);
  const height = Math.min(fullHeight - y, (maxLane - minLane + 1) * STORYBOARD_CELL_HEIGHT + 60);

  return {
    mode,
    viewBox: `${x} ${y} ${width} ${height}`,
    focusZone: zones[0] ?? "Z4-C",
    includedZones: zones,
    cameraKey: `${mode}:${x}:${y}:${width}:${height}`,
  };
}

export function collectCameraZones(input: {
  readonly beforePlayers: readonly PlayerMatchState[];
  readonly afterPlayers: readonly PlayerMatchState[];
  readonly selectedTargetZone: string | null;
  readonly passingLaneFrom: string | null;
  readonly passingLaneTo: string | null;
  readonly overloadZone: string | null;
  readonly recoveryZones: readonly string[];
}): readonly string[] {
  const ballZones = [...input.beforePlayers, ...input.afterPlayers]
    .filter((player) => player.hasBall)
    .map((player) => player.zone);

  return [
    ...ballZones,
    ...(input.selectedTargetZone === null ? [] : [input.selectedTargetZone]),
    ...(input.passingLaneFrom === null ? [] : [input.passingLaneFrom]),
    ...(input.passingLaneTo === null ? [] : [input.passingLaneTo]),
    ...(input.overloadZone === null ? [] : [input.overloadZone]),
    ...input.recoveryZones,
  ];
}
