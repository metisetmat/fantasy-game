import type { LateralCorridor, ZoneId } from "../../core/zones";
import type { PlayerMatchState } from "../players";
import type {
  TeamShapeCalibrationResult,
  TeamShapeFrameResolution,
  TeamShapeIntent,
  TeamShapePlayerResolution,
} from "./teamShapeIntentTypes";
import { evaluateTeamShapeIntentCalibration } from "./teamShapeIntentEvaluator";

function laneFromZone(zone: ZoneId): LateralCorridor {
  const lane = zone.split("-")[1] ?? "C";
  return lane as LateralCorridor;
}

function updatePlayerZone(player: PlayerMatchState, zone: ZoneId): PlayerMatchState {
  return {
    ...player,
    zone,
    lane: laneFromZone(zone),
    currentPosition: {
      ...player.currentPosition,
      zone,
    },
    targetPosition: {
      ...player.targetPosition,
      zone,
    },
    activeTrajectory:
      player.activeTrajectory === null
        ? null
        : {
            ...player.activeTrajectory,
            targetZone: zone,
            currentPosition: {
              ...player.activeTrajectory.currentPosition,
              zone,
            },
            targetPosition: {
              ...player.activeTrajectory.targetPosition,
              zone,
            },
          },
  };
}

function preferredZoneForBefore(player: PlayerMatchState): ZoneId | null {
  if (player.teamId !== "blitz") {
    return null;
  }

  switch (player.roleInitials) {
    case "LP":
      return "Z5-CL" as ZoneId;
    case "TH":
      return "Z5-HSL" as ZoneId;
    case "PM":
      return "Z5-HSL" as ZoneId;
    case "RP":
      return "Z5-C" as ZoneId;
    case "SH":
      return "Z5-C" as ZoneId;
    case "FL":
      return "Z4-C" as ZoneId;
    case "ML":
      return "Z4-HSL" as ZoneId;
    case "PV":
      return "Z4-HSL" as ZoneId;
    default:
      return null;
  }
}

function preferredZoneForAfter(player: PlayerMatchState): ZoneId | null {
  if (player.teamId === "control") {
    switch (player.roleInitials) {
      case "GK":
        return "Z1-C" as ZoneId;
      case "PV":
        return "Z2-HSL" as ZoneId;
      case "PM":
        return "Z2-C" as ZoneId;
      case "SH":
        return "Z4-C" as ZoneId;
      case "TH":
        return "Z3-HSL" as ZoneId;
      case "ML":
        return "Z3-HSL" as ZoneId;
      default:
        return null;
    }
  }

  switch (player.roleInitials) {
    case "ML":
      return "Z3-HSL" as ZoneId;
    case "PV":
      return "Z3-HSL" as ZoneId;
    case "FL":
      return "Z2-HSL" as ZoneId;
    case "LP":
      return "Z4-CL" as ZoneId;
    case "PM":
      return "Z4-HSL" as ZoneId;
    case "TH":
      return "Z4-HSL" as ZoneId;
    case "RP":
      return "Z4-C" as ZoneId;
    case "SH":
      return "Z3-C" as ZoneId;
    default:
      return null;
  }
}

function functionFor(player: PlayerMatchState, frame: "before" | "after"): string {
  if (frame === "before" && player.teamId === "blitz") {
    if (["LP", "TH", "PM"].includes(player.roleInitials)) {
      return "ball-to-score axis protection";
    }
    if (["RP", "SH"].includes(player.roleInitials)) {
      return "central cover / intercept lane";
    }
    return "compact support behind pressure";
  }

  if (frame === "after" && player.teamId === "control") {
    if (player.roleInitials === "GK") {
      return "last-rempart";
    }
    if (["PV", "PM"].includes(player.roleInitials)) {
      return "rest-defense triangle";
    }
    if (player.roleInitials === "SH") {
      return "second-phase reconnection";
    }
    if (player.roleInitials === "ML") {
      return "new ball carrier";
    }
    return "secure support";
  }

  if (frame === "after" && player.teamId === "blitz") {
    if (["ML", "PV", "FL"].includes(player.roleInitials)) {
      return "ball-side pressure";
    }
    if (["PM", "TH", "RP", "SH"].includes(player.roleInitials)) {
      return "compact cover line";
    }
    return "pressing support";
  }

  return "team-shape support";
}

function reasonFor(player: PlayerMatchState, frame: "before" | "after", selectedZone: ZoneId): string {
  if (frame === "before" && player.teamId === "blitz") {
    return `${player.roleInitials} holds ${selectedZone} so BLITZ protects the ball-to-score axis before chasing TH.`;
  }

  if (frame === "after" && player.teamId === "control") {
    if (player.roleInitials === "PV") {
      return "PV slides into Z2-HSL to close the immediate loss channel behind ML.";
    }
    if (player.roleInitials === "PM") {
      return "PM protects Z2-C so the recycle does not expose central counterattack.";
    }
    if (player.roleInitials === "GK") {
      return "GK retreats to Z1-C as last-rempart rather than duplicating the midfield anchor.";
    }
    if (player.roleInitials === "SH") {
      return "SH reconnects toward Z4-C as useful second-phase support after being unused.";
    }
    return `${player.roleInitials} supports CONTROL's cautious rest-defense shape after the recycle.`;
  }

  if (frame === "after" && player.teamId === "blitz") {
    return `${player.roleInitials} shifts to ${selectedZone} so BLITZ presses ML while keeping compact central cover.`;
  }

  return `${player.roleInitials} remains in ${selectedZone} for team-shape continuity.`;
}

function resolveFrame(players: readonly PlayerMatchState[], frame: "before" | "after"): TeamShapeFrameResolution {
  const playerResolutions: TeamShapePlayerResolution[] = [];
  const resolvedPlayers = players.map((player) => {
    const selectedZone = frame === "before" ? preferredZoneForBefore(player) : preferredZoneForAfter(player);
    const finalZone = selectedZone ?? player.zone;

    playerResolutions.push({
      teamId: player.teamId,
      playerId: player.playerId,
      roleInitials: player.roleInitials,
      beforeZone: player.zone,
      afterZone: finalZone,
      function: functionFor(player, frame),
      reason: reasonFor(player, frame, finalZone),
    });

    return finalZone === player.zone ? player : updatePlayerZone(player, finalZone);
  });

  return {
    frame,
    players: resolvedPlayers,
    playerResolutions,
  };
}

export function resolveTeamShapeIntentForSequenceOneActionOne(input: {
  readonly beforePlayers: readonly PlayerMatchState[];
  readonly afterPlayers: readonly PlayerMatchState[];
  readonly phase: string;
}): TeamShapeCalibrationResult {
  const controlBeforeIntent: TeamShapeIntent = {
    teamId: "control",
    phase: input.phase,
    possessionState: "IN_POSSESSION",
    style: "CONTROL",
    ballZone: "Z4-HSL" as ZoneId,
    attackingDirection: "Z1_TO_Z7",
    defendingDirection: "Z7_TO_Z1",
    primaryIntent: "PRESSURE_ESCAPE",
    secondaryIntents: ["secure first recycle", "preserve rest-defense base"],
    requiredZones: ["Z3-HSL", "Z3-C", "Z2-C"] as readonly ZoneId[],
    preferredZones: ["Z3-HSL", "Z2-HSL", "Z2-C"] as readonly ZoneId[],
    allowedRiskTradeoffs: ["sacrifices immediate weak-side access"],
    explanation: "CONTROL keeps the TH -> ML recycle but must preserve enough structure to survive an immediate turnover.",
  };
  const blitzBeforeIntent: TeamShapeIntent = {
    teamId: "blitz",
    phase: input.phase,
    possessionState: "OUT_OF_POSSESSION",
    style: "BLITZ",
    ballZone: "Z4-HSL" as ZoneId,
    attackingDirection: "Z7_TO_Z1",
    defendingDirection: "Z1_TO_Z7",
    primaryIntent: "BALL_GOAL_AXIS_PROTECTION",
    secondaryIntents: ["TRY_ACCESS_PROTECTION", "near-side pressure support", "central cover"],
    requiredZones: ["Z5-CL", "Z5-HSL", "Z5-C"] as readonly ZoneId[],
    preferredZones: ["Z5-CL", "Z5-HSL", "Z5-C", "Z4-HSL"] as readonly ZoneId[],
    allowedRiskTradeoffs: ["controlled weak-side exposure"],
    explanation: "BLITZ protects the ball-to-score axis before chasing the carrier; aggressive style can accept weak-side exposure, not an open central route.",
  };
  const controlAfterIntent: TeamShapeIntent = {
    teamId: "control",
    phase: input.phase,
    possessionState: "IN_POSSESSION",
    style: "CONTROL",
    ballZone: "Z3-HSL" as ZoneId,
    attackingDirection: "Z1_TO_Z7",
    defendingDirection: "Z7_TO_Z1",
    primaryIntent: "REST_DEFENSE_PROTECTION",
    secondaryIntents: ["loss-channel protection", "secure nearby support", "methodical reset"],
    requiredZones: ["Z2-HSL", "Z2-C", "Z1-C"] as readonly ZoneId[],
    preferredZones: ["Z2-HSL", "Z2-C", "Z1-C", "Z4-C"] as readonly ZoneId[],
    allowedRiskTradeoffs: ["delays immediate rupture to protect against counterattack"],
    explanation: "CONTROL's recycle is safe only if PV/PM/GK form a staggered rest-defense triangle behind ML.",
  };
  const blitzAfterIntent: TeamShapeIntent = {
    teamId: "blitz",
    phase: input.phase,
    possessionState: "OUT_OF_POSSESSION",
    style: "BLITZ",
    ballZone: "Z3-HSL" as ZoneId,
    attackingDirection: "Z7_TO_Z1",
    defendingDirection: "Z1_TO_Z7",
    primaryIntent: "COMPACT_PRESS",
    secondaryIntents: ["COUNTERPRESS", "central recycle cut", "next-lane protection"],
    requiredZones: ["Z3-HSL", "Z2-HSL", "Z4-HSL", "Z4-C", "Z3-C"] as readonly ZoneId[],
    preferredZones: ["Z3-HSL", "Z2-HSL", "Z4-HSL", "Z4-C", "Z3-C"] as readonly ZoneId[],
    allowedRiskTradeoffs: ["intentional opposite-side weak-side exposure"],
    explanation: "BLITZ compresses the new carrier and nearest escape routes while preserving central cover behind the press.",
  };
  const before = resolveFrame(input.beforePlayers, "before");
  const after = resolveFrame(input.afterPlayers, "after");
  const evaluation = evaluateTeamShapeIntentCalibration({ beforePlayers: before.players, afterPlayers: after.players });

  return {
    controlBeforeIntent,
    blitzBeforeIntent,
    controlAfterIntent,
    blitzAfterIntent,
    before,
    after,
    evaluation,
    recommendation: evaluation.blitzBeforeBallGoalAxisProtected &&
      evaluation.controlAfterLossChannelProtected &&
      evaluation.blitzAfterPressesNewCarrierArea
      ? "KEEP_TEAM_SHAPE_INTENT_MODEL"
      : "NEEDS_MORE_SAMPLE",
  };
}
