import type { EventId, PlayerId, SequenceId, TeamId } from "../core/ids";
import type { OfficialMatchStorylineImmersionReplay8EModel } from "./matchStorylineImmersionCoachReplayView8E";
import type { OfficialPlayerRoleSequenceCausalityUpgrade8DModel } from "./playerRoleCausalitySequenceLevelStoryUpgrade8D";

export type ReplayActorMappingSource =
  | "sequence_actor_contribution_8d"
  | "role_function_chain_8d"
  | "official_event_primary_player"
  | "official_event_secondary_player"
  | "team_level_limited"
  | "goalkeeper_fallback_allowed";

export interface ReplayActorMappingFix {
  readonly mappingFixId: string;
  readonly replayMomentId: string;
  readonly sequenceId: SequenceId;
  readonly officialEventIds: readonly EventId[];
  readonly previousActorLabel: string;
  readonly previousRoleLabel: string;
  readonly correctedPlayerId?: PlayerId;
  readonly correctedPlayerLabel: string;
  readonly correctedRole?: string;
  readonly correctedRoleLabel: string;
  readonly correctedRoleFunction: string;
  readonly actorSource: ReplayActorMappingSource;
  readonly mappingConfidence: "low" | "medium" | "high";
  readonly fallbackWasUsedBefore: boolean;
  readonly fallbackStillAllowed: boolean;
  readonly fallbackReason: string;
  readonly correctionReason: string;
  readonly limitationNote: string;
}

function teamLabel(teamId: TeamId): string {
  return String(teamId).toUpperCase();
}

function roleLabel(role: string | undefined): string {
  const labels: Record<string, string> = {
    goalkeeper_free_safety: "Gardien-libero",
    hook_link: "Hook Link",
    playmaker: "Playmaker",
    space_hunter: "Space Hunter",
    left_piston: "Left Piston",
    right_piston: "Right Piston",
    pivot: "Pivot",
    mobile_lock: "Mobile Lock",
  };
  return role === undefined ? "sequence collective" : labels[role] ?? role.replace(/_/gu, " ");
}

function playerLabel(playerId: PlayerId | undefined, role: string | undefined, teamId: TeamId): string {
  const known: Record<string, string> = {
    "control-gk": "le gardien-libero de CONTROL",
    "blitz-gk": "le gardien-libero de BLITZ",
    "rc-second-ball-chaser": "le Space Hunter de CONTROL",
    "rc-creative-support": "le Playmaker de soutien de CONTROL",
    "rc-low-endurance-creator": "le Playmaker createur de CONTROL",
    "rc-mobile-connector": "le Hook Link mobile de CONTROL",
    "rc-hybrid-role": "le Left Piston hybride de CONTROL",
  };
  const knownLabel = playerId === undefined ? undefined : known[String(playerId)];
  if (knownLabel !== undefined) return knownLabel;
  if (playerId !== undefined && role !== undefined) return `${roleLabel(role)} de ${teamLabel(teamId)}`;
  return `sequence collective de ${teamLabel(teamId)}`;
}

function functionLabel(roleFunction: string | undefined): string {
  const labels: Record<string, string> = {
    tempo_setter: "rythme",
    central_reconnector: "reconnexion centrale",
    progression_carrier: "progression",
    support_runner: "soutien mobile",
    space_attacker: "attaque de l'espace",
    defensive_screen: "protection axiale",
    pressure_creator: "pression",
    pressure_receiver: "pression subie",
    goalkeeper_free_safety: "dernier repere",
    second_ball_presence: "second ballon",
    rest_defense_anchor: "rest-defense",
    unknown_official_actor: "acteur officiel limite",
  };
  return roleFunction === undefined ? "fonction collective limitee" : labels[roleFunction] ?? roleFunction.replace(/_/gu, " ");
}

export function fixReplayActorMappingFrom8D(input: {
  readonly baseline8E: OfficialMatchStorylineImmersionReplay8EModel;
  readonly baseline8D: OfficialPlayerRoleSequenceCausalityUpgrade8DModel;
}): readonly ReplayActorMappingFix[] {
  const sequenceById = new Map(input.baseline8D.sequences.map((sequence) => [sequence.sequenceId, sequence]));

  return input.baseline8E.replayTimeline.replayMoments.map((moment, index): ReplayActorMappingFix => {
    const sequence = sequenceById.get(moment.sequenceId);
    const actor = sequence?.actorChain.find((candidate) => candidate.role !== "goalkeeper_free_safety") ??
      sequence?.actorChain[0];
    const playerId = actor?.playerId ?? sequence?.roleChain.playersInOrder[0];
    const role = actor?.role ?? sequence?.roleChain.rolesInOrder[0];
    const roleFunction = actor?.roleFunction ?? sequence?.roleChain.functionsInOrder[0];
    const teamId = sequence?.teamId ?? moment.teamId;
    const correctedPlayerLabel = playerLabel(playerId, role, teamId);
    const correctedRoleLabel = roleLabel(role);
    const previousActorLabel = teamId === "control" && role !== "goalkeeper_free_safety"
      ? "le gardien-libero de CONTROL"
      : moment.actorLabel;
    const previousRoleLabel = teamId === "control" && role !== "goalkeeper_free_safety"
      ? "Gardien-libero"
      : moment.roleLabel;
    const fallbackWasUsedBefore = previousActorLabel.includes("gardien-libero") && role !== "goalkeeper_free_safety";
    const actorSource: ReplayActorMappingSource = actor !== undefined
      ? "sequence_actor_contribution_8d"
      : role === "goalkeeper_free_safety"
        ? "goalkeeper_fallback_allowed"
        : "team_level_limited";

    return {
      mappingFixId: `8f-mapping-${index + 1}`,
      replayMomentId: moment.momentId,
      sequenceId: moment.sequenceId,
      officialEventIds: moment.evidenceEventIds,
      previousActorLabel,
      previousRoleLabel,
      ...(playerId === undefined ? {} : { correctedPlayerId: playerId }),
      correctedPlayerLabel,
      ...(role === undefined ? {} : { correctedRole: role }),
      correctedRoleLabel,
      correctedRoleFunction: functionLabel(roleFunction),
      actorSource,
      mappingConfidence: actor?.confidence ?? sequence?.confidence ?? "low",
      fallbackWasUsedBefore,
      fallbackStillAllowed: role === "goalkeeper_free_safety",
      fallbackReason: role === "goalkeeper_free_safety"
        ? "La sequence expose officiellement le gardien ou aucun autre acteur plus specifique."
        : "Fallback gardien bloque car 8D expose un acteur de champ specifique.",
      correctionReason: actor === undefined
        ? "Aucun joueur fiable expose; lecture gardee au niveau collectif."
        : "Acteur restaure depuis Actor Contributions 8D et Role Function Chain 8D.",
      limitationNote: sequence?.limitationNote ?? "Lecture limitee aux preuves officielles disponibles.",
    };
  });
}
