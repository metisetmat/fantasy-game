export enum ShotType {
  GroundKick = "GROUND_KICK",
  FirstTimeKick = "FIRST_TIME_KICK",
  VolleyFromPass = "VOLLEY_FROM_PASS",
  HalfVolleyFromPass = "HALF_VOLLEY_FROM_PASS",
  IllegalSelfVolley = "ILLEGAL_SELF_VOLLEY",
  IllegalHandShot = "ILLEGAL_HAND_SHOT",
  IllegalSelfDrop = "ILLEGAL_SELF_DROP",
}

export interface ShotLegality {
  readonly legal: boolean;
  readonly reason: string;
  readonly shotType: ShotType;
  readonly requiredAttributes: readonly string[];
}

export function evaluateShotLegality(input: {
  readonly attemptedWith: "FOOT" | "HAND";
  readonly ballAlreadyArrivingFromAnotherAction: boolean;
  readonly selfGeneratedVolley: boolean;
  readonly selfDrop: boolean;
  readonly firstTime: boolean;
}): ShotLegality {
  const requiredAttributes = ["Foot Play", "Power", "Composure", "Vision"] as const;

  if (input.attemptedWith === "HAND") {
    return {
      legal: false,
      reason: "goal attempt cannot be a hand-thrown shot",
      shotType: ShotType.IllegalHandShot,
      requiredAttributes,
    };
  }

  if (input.selfGeneratedVolley) {
    return {
      legal: false,
      reason: "player cannot create a self half-volley or volley for himself",
      shotType: ShotType.IllegalSelfVolley,
      requiredAttributes,
    };
  }

  if (input.selfDrop) {
    return {
      legal: false,
      reason: "self drop shot is not available until a legal drop mechanic exists",
      shotType: ShotType.IllegalSelfDrop,
      requiredAttributes,
    };
  }

  if (input.ballAlreadyArrivingFromAnotherAction) {
    return {
      legal: true,
      reason: "foot strike is legal because the ball arrives from another action",
      shotType: input.firstTime ? ShotType.FirstTimeKick : ShotType.HalfVolleyFromPass,
      requiredAttributes: [...requiredAttributes, "firstTouch"],
    };
  }

  return {
    legal: true,
    reason: "outside the goal area, a controlled ball may be shot by foot from the ground",
    shotType: ShotType.GroundKick,
    requiredAttributes,
  };
}
