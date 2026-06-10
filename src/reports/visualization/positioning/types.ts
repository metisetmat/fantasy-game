import type { ZoneId } from "../../../core/zones";
import type { PlayerRole } from "../../../models/player";
import type { AttackingDirection } from "../../../systems/spatial/intention";
import type { SpatialTeamContext } from "../../../systems/spatial";
import type { SequenceInteractionKind, SequenceTacticalContext } from "../../../systems/sequences";
import type { StructuralDistortionEvaluation } from "../../../systems/structure/distortion";
import type { StructuralPrincipleLawProfile } from "../../../systems/principles";
import type { PlayerMatchState } from "../../../systems/players";
import type { SnapshotPlayerMarker, SnapshotStructuralState } from "../tacticalSnapshotTypes";

export interface TeamSpatialLayoutInput {
  readonly team: SpatialTeamContext;
  readonly isPossessionTeam: boolean;
  readonly ballZone: ZoneId;
  readonly ballCarrierRole: PlayerRole;
  readonly attackingDirection: AttackingDirection;
  readonly selectedTargetZone: ZoneId | null;
  readonly interaction: SequenceInteractionKind;
  readonly context: SequenceTacticalContext;
  readonly after: boolean;
  readonly tick: number;
}

export interface RoleZoneAssignment {
  readonly role: PlayerRole;
  readonly zone: ZoneId;
  readonly state: SnapshotStructuralState;
}

export interface TeamSpatialLayout {
  readonly markers: readonly SnapshotPlayerMarker[];
  readonly playerStates: readonly PlayerMatchState[];
  readonly distortion: StructuralDistortionEvaluation;
  readonly structuralLaws: StructuralPrincipleLawProfile;
}
