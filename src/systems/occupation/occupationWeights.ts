import { PlayerRole } from "../../models/player";
import { OccupationFunction } from "./occupationTypes";

export interface OccupationFunctionProfile {
  readonly preferred: readonly OccupationFunction[];
  readonly secondary: readonly OccupationFunction[];
  readonly forbidden: readonly OccupationFunction[];
}

const NONE: readonly OccupationFunction[] = [];

const CONTROL_PROFILES: Readonly<Record<PlayerRole, OccupationFunctionProfile>> = {
  [PlayerRole.TempoHalf]: {
    preferred: [OccupationFunction.TempoController, OccupationFunction.DirectSupport, OccupationFunction.PressureAbsorber],
    secondary: [OccupationFunction.SafeRecycle, OccupationFunction.ThirdManConnector],
    forbidden: [OccupationFunction.ChaosAttacker],
  },
  [PlayerRole.HookLink]: {
    preferred: [OccupationFunction.DirectSupport, OccupationFunction.ScreenSupport, OccupationFunction.SafeRecycle],
    secondary: [OccupationFunction.WidthFixer, OccupationFunction.ThirdManConnector],
    forbidden: NONE,
  },
  [PlayerRole.ForwardLeader]: {
    preferred: [OccupationFunction.ContactPlatform, OccupationFunction.WidthFixer, OccupationFunction.ScreenSupport],
    secondary: [OccupationFunction.OverloadSupport, OccupationFunction.ThirdManConnector],
    forbidden: [OccupationFunction.SafeRecycle],
  },
  [PlayerRole.Playmaker]: {
    preferred: [OccupationFunction.DirectSupport, OccupationFunction.ThirdManConnector, OccupationFunction.TempoController],
    secondary: [OccupationFunction.WeakSideConnector, OccupationFunction.SwitchReceiver],
    forbidden: NONE,
  },
  [PlayerRole.SpaceHunter]: {
    preferred: [OccupationFunction.WeakSideConnector, OccupationFunction.DepthThreat, OccupationFunction.SwitchReceiver],
    secondary: [OccupationFunction.TransitionHunter, OccupationFunction.ChaosAttacker],
    forbidden: [OccupationFunction.RestDefenseAnchor],
  },
  [PlayerRole.Pivot]: {
    preferred: [OccupationFunction.RestDefenseAnchor, OccupationFunction.SafeRecycle, OccupationFunction.CounterpressBalancer],
    secondary: [OccupationFunction.HalfSpaceRecycle, OccupationFunction.CoverShadowBlocker],
    forbidden: [OccupationFunction.DepthThreat],
  },
  [PlayerRole.MobileLock]: {
    preferred: [OccupationFunction.HalfSpaceRecycle, OccupationFunction.CounterpressBalancer, OccupationFunction.CoverShadowBlocker],
    secondary: [OccupationFunction.RestDefenseAnchor, OccupationFunction.PressTrigger],
    forbidden: NONE,
  },
  [PlayerRole.LeftPiston]: {
    preferred: [OccupationFunction.WidthFixer, OccupationFunction.SupportBehindBall, OccupationFunction.SafeRecycle],
    secondary: [OccupationFunction.WeakSideConnector, OccupationFunction.SwitchReceiver],
    forbidden: NONE,
  },
  [PlayerRole.RightPiston]: {
    preferred: [OccupationFunction.SupportBehindBall, OccupationFunction.SafeRecycle, OccupationFunction.WeakSideConnector],
    secondary: [OccupationFunction.SwitchReceiver, OccupationFunction.WidthFixer],
    forbidden: NONE,
  },
  [PlayerRole.GoalkeeperFreeSafety]: {
    preferred: [OccupationFunction.RestDefenseAnchor, OccupationFunction.SafeRecycle],
    secondary: [OccupationFunction.PressureAbsorber, OccupationFunction.SwitchReceiver],
    forbidden: [OccupationFunction.DepthThreat, OccupationFunction.ChaosAttacker],
  },
  [PlayerRole.FreeSafety]: {
    preferred: [OccupationFunction.RestDefenseAnchor, OccupationFunction.CoverShadowBlocker],
    secondary: [OccupationFunction.SafeRecycle],
    forbidden: [OccupationFunction.DepthThreat],
  },
  [PlayerRole.LeftAnchor]: {
    preferred: [OccupationFunction.RestDefenseAnchor, OccupationFunction.WidthFixer],
    secondary: [OccupationFunction.SafeRecycle],
    forbidden: NONE,
  },
  [PlayerRole.RightAnchor]: {
    preferred: [OccupationFunction.RestDefenseAnchor, OccupationFunction.WidthFixer],
    secondary: [OccupationFunction.SafeRecycle],
    forbidden: NONE,
  },
  [PlayerRole.PowerRunner]: {
    preferred: [OccupationFunction.ContactPlatform, OccupationFunction.OverloadSupport],
    secondary: [OccupationFunction.ScreenSupport],
    forbidden: NONE,
  },
};

const BLITZ_PROFILES: Readonly<Record<PlayerRole, OccupationFunctionProfile>> = {
  ...CONTROL_PROFILES,
  [PlayerRole.TempoHalf]: {
    preferred: [OccupationFunction.TempoAccelerator, OccupationFunction.DirectSupport, OccupationFunction.PressTrigger],
    secondary: [OccupationFunction.DepthThreat, OccupationFunction.ChaosAttacker],
    forbidden: NONE,
  },
  [PlayerRole.Playmaker]: {
    preferred: [OccupationFunction.TempoAccelerator, OccupationFunction.ThirdManConnector, OccupationFunction.ChaosAttacker],
    secondary: [OccupationFunction.DepthThreat, OccupationFunction.SwitchReceiver],
    forbidden: NONE,
  },
  [PlayerRole.SpaceHunter]: {
    preferred: [OccupationFunction.DepthThreat, OccupationFunction.ChaosAttacker, OccupationFunction.TransitionHunter],
    secondary: [OccupationFunction.WeakSideConnector, OccupationFunction.OverloadSupport],
    forbidden: [OccupationFunction.SafeRecycle],
  },
  [PlayerRole.RightPiston]: {
    preferred: [OccupationFunction.TransitionHunter, OccupationFunction.OverloadSupport, OccupationFunction.TempoAccelerator],
    secondary: [OccupationFunction.WidthFixer, OccupationFunction.WeakSideConnector],
    forbidden: NONE,
  },
  [PlayerRole.LeftPiston]: {
    preferred: [OccupationFunction.PressingTrap, OccupationFunction.WidthFixer, OccupationFunction.PressTrigger],
    secondary: [OccupationFunction.TransitionHunter, OccupationFunction.CoverShadowBlocker],
    forbidden: NONE,
  },
  [PlayerRole.MobileLock]: {
    preferred: [OccupationFunction.PressTrigger, OccupationFunction.CounterpressBalancer, OccupationFunction.CoverShadowBlocker],
    secondary: [OccupationFunction.PressingTrap, OccupationFunction.RestDefenseAnchor],
    forbidden: NONE,
  },
  [PlayerRole.Pivot]: {
    preferred: [OccupationFunction.CounterpressBalancer, OccupationFunction.CoverShadowBlocker, OccupationFunction.RestDefenseAnchor],
    secondary: [OccupationFunction.PressingTrap, OccupationFunction.SafeRecycle],
    forbidden: [OccupationFunction.ChaosAttacker],
  },
  [PlayerRole.GoalkeeperFreeSafety]: {
    preferred: [OccupationFunction.RestDefenseAnchor, OccupationFunction.SwitchReceiver],
    secondary: [OccupationFunction.TempoAccelerator, OccupationFunction.SafeRecycle],
    forbidden: [OccupationFunction.ChaosAttacker],
  },
};

export function getOccupationFunctionProfile(
  role: PlayerRole,
  style: "CONTROL" | "BLITZ",
): OccupationFunctionProfile {
  return style === "CONTROL" ? CONTROL_PROFILES[role] : BLITZ_PROFILES[role];
}
