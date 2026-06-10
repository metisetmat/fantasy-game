import type { TeamId } from "../../core/ids";
import type { FocusCategory } from "./focusCategories";

export interface TacticalFocusActor {
  readonly playerId: string;
  readonly teamId: TeamId;
  readonly initials: string;
  readonly zone: string;
  readonly role: string;
  readonly reason: string;
}

export interface TacticalFocus {
  readonly focusId: string;
  readonly category: FocusCategory;
  readonly attackingTeam: string;
  readonly defendingTeam: string;
  readonly primaryActors: readonly TacticalFocusActor[];
  readonly secondaryActors: readonly TacticalFocusActor[];
  readonly focusZone: string;
  readonly focusLane: string | null;
  readonly focusReason: string;
  readonly tacticalTension: string;
  readonly supportingEvidence: readonly string[];
  readonly suppressions: readonly string[];
  readonly storyboardPriority: number;
}
