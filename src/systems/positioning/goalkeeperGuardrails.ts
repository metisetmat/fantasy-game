import type { TeamId } from "../../core/ids";
import { type ZoneId } from "../../core/zones";
import { PlayerRole } from "../../models/player";

export enum GoalkeeperAdvanceTrigger {
  SweepDepth = "SWEEP_DEPTH",
  LooseBallAttack = "LOOSE_BALL_ATTACK",
  EmergencySupport = "EMERGENCY_SUPPORT",
  LateGameRisk = "LATE_GAME_RISK",
}

export interface GoalkeeperGuardrailEvaluation {
  readonly teamId: TeamId;
  readonly expectedBaseZone: ZoneId;
  readonly advancedSupportMaxZone: ZoneId;
  readonly actualZone: ZoneId;
  readonly correctedZone: ZoneId;
  readonly status: "OK" | "CORRECTED" | "ADVANCED_ALLOWED" | "VIOLATION";
  readonly reason: string;
}

function zoneColumn(zone: ZoneId): number {
  const match = /^Z([0-8])-/.exec(zone);
  return match?.[1] === undefined ? 4 : Number.parseInt(match[1], 10);
}

function centralZone(column: number): ZoneId {
  return `Z${column}-C` as ZoneId;
}

function guardrailForTeam(teamId: TeamId): {
  readonly base: ZoneId;
  readonly max: ZoneId;
  readonly direction: "LOW_TO_HIGH" | "HIGH_TO_LOW";
} {
  return teamId === "blitz"
    ? { base: "Z7-C" as ZoneId, max: "Z6-C" as ZoneId, direction: "HIGH_TO_LOW" }
    : { base: "Z1-C" as ZoneId, max: "Z2-C" as ZoneId, direction: "LOW_TO_HIGH" };
}

function isBeyondMax(input: {
  readonly zone: ZoneId;
  readonly maxZone: ZoneId;
  readonly direction: "LOW_TO_HIGH" | "HIGH_TO_LOW";
}): boolean {
  const actual = zoneColumn(input.zone);
  const max = zoneColumn(input.maxZone);

  return input.direction === "LOW_TO_HIGH" ? actual > max : actual < max;
}

export function evaluateGoalkeeperGuardrail(input: {
  readonly teamId: TeamId;
  readonly actualZone: ZoneId;
  readonly triggers?: readonly GoalkeeperAdvanceTrigger[];
}): GoalkeeperGuardrailEvaluation {
  const guardrail = guardrailForTeam(input.teamId);
  const triggers = input.triggers ?? [];
  const advancedAllowed = triggers.length > 0;
  const beyond = isBeyondMax({
    zone: input.actualZone,
    maxZone: guardrail.max,
    direction: guardrail.direction,
  });

  if (!beyond) {
    return {
      teamId: input.teamId,
      expectedBaseZone: guardrail.base,
      advancedSupportMaxZone: guardrail.max,
      actualZone: input.actualZone,
      correctedZone: input.actualZone,
      status: "OK",
      reason: "inside default goalkeeper support guardrail",
    };
  }

  if (advancedAllowed) {
    return {
      teamId: input.teamId,
      expectedBaseZone: guardrail.base,
      advancedSupportMaxZone: guardrail.max,
      actualZone: input.actualZone,
      correctedZone: input.actualZone,
      status: "ADVANCED_ALLOWED",
      reason: `advanced goalkeeper position allowed by ${triggers.join(", ")}`,
    };
  }

  return {
    teamId: input.teamId,
    expectedBaseZone: guardrail.base,
    advancedSupportMaxZone: guardrail.max,
    actualZone: input.actualZone,
    correctedZone: guardrail.max,
    status: "CORRECTED",
    reason: "goalkeeper cannot be used as a normal midfielder without an explicit sweep/emergency trigger",
  };
}

export function applyGoalkeeperGuardrailsToAssignments<TAssignment extends { readonly role: PlayerRole; readonly zone: ZoneId }>(input: {
  readonly teamId: TeamId;
  readonly assignments: readonly TAssignment[];
  readonly triggers?: readonly GoalkeeperAdvanceTrigger[];
}): readonly TAssignment[] {
  return input.assignments.map((assignment) => {
    if (assignment.role !== PlayerRole.GoalkeeperFreeSafety && assignment.role !== PlayerRole.FreeSafety) {
      return assignment;
    }

    const evaluation = evaluateGoalkeeperGuardrail({
      teamId: input.teamId,
      actualZone: assignment.zone,
      ...(input.triggers === undefined ? {} : { triggers: input.triggers }),
    });

    if (evaluation.status !== "CORRECTED") {
      return assignment;
    }

    return {
      ...assignment,
      zone: centralZone(zoneColumn(evaluation.correctedZone)),
    };
  });
}
