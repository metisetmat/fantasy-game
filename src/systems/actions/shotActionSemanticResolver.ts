import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import type { ShotActionSemanticContract, ShotActionShotType } from "./shotActionSemanticTypes";

export interface ResolveShotActionSemanticInput {
  readonly actionId: string;
  readonly shooterId: PlayerId;
  readonly shooterRole: string;
  readonly shootingTeamId: TeamId;
  readonly shotOriginZone: ZoneId;
  readonly shotTargetZone?: ZoneId;
  readonly shotTargetFrame?: string;
  readonly shotType?: ShotActionShotType;
  readonly pressureLevel: string;
  readonly pressureSource: string;
}

export function resolveShotActionSemanticContract(input: ResolveShotActionSemanticInput): ShotActionSemanticContract {
  const shotType = input.shotType ?? "FOOT_STRIKE";
  const legal = shotType !== "DROP_ATTEMPT";

  const contract: Omit<ShotActionSemanticContract, "shotTargetZone"> = {
    actionId: input.actionId,
    eventType: "finishing",
    selectedActionType: "SHOT",
    selectedActionSubtype: "SHOT_CREATION",
    decisionActorId: input.shooterId,
    decisionActorRole: input.shooterRole,
    shootingTeamId: input.shootingTeamId,
    shotOriginZone: input.shotOriginZone,
    shotTargetFrame: input.shotTargetFrame ?? "GOAL_FRAME",
    shotType,
    shotLegality: legal ? "LEGAL" : "ILLEGAL",
    shotLegalityReason: legal
      ? "Controlled foot shot is legal in the current abstract finishing model."
      : "Self half-volley/drop attempts are not legal unless explicitly modelled.",
    ballOutcome: "PENDING",
    possessionAfterShot: "PENDING",
    pressureLevel: input.pressureLevel,
    pressureSource: input.pressureSource,
    semanticStatus: legal ? "PASS" : "FAIL",
    reason: `${input.shooterRole} attempts a controlled shot from ${input.shotOriginZone}; shot target and outcome semantics are used instead of receiver/new-carrier semantics.`,
  };

  return input.shotTargetZone === undefined ? contract : { ...contract, shotTargetZone: input.shotTargetZone };
}
