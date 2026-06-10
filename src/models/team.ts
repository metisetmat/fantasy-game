import type { TeamId } from "../core/ids";
import type { PlayerState } from "./player";
import type {
  CollectiveProperties,
  TacticalInstructions,
  TacticalState,
  TacticalStyle,
  TerritorialControl,
} from "./tactics";

export interface TeamIdentity {
  readonly id: TeamId;
  readonly name: string;
  readonly tacticalStyle: TacticalStyle;
}

export interface TeamState extends TeamIdentity {
  readonly players: readonly PlayerState[];
  readonly collectiveProperties: CollectiveProperties;
  readonly tacticalInstructions: TacticalInstructions;
  readonly tacticalState: TacticalState;
  readonly territorialControl: TerritorialControl;
}
