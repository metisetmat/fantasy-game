import { OccupationFunction, MicroPosition } from "./occupationTypes";

export function resolveMicroPosition(functionType: OccupationFunction): MicroPosition {
  switch (functionType) {
    case OccupationFunction.WidthFixer:
      return MicroPosition.HighPin;
    case OccupationFunction.DirectSupport:
      return MicroPosition.RightSupportAngle;
    case OccupationFunction.SafeRecycle:
    case OccupationFunction.SupportBehindBall:
      return MicroPosition.LowSupport;
    case OccupationFunction.RestDefenseAnchor:
      return MicroPosition.RestDefenseBase;
    case OccupationFunction.HalfSpaceRecycle:
      return MicroPosition.LeftSupportAngle;
    case OccupationFunction.ThirdManConnector:
      return MicroPosition.InsideShoulder;
    case OccupationFunction.WeakSideConnector:
    case OccupationFunction.SwitchReceiver:
      return MicroPosition.WeakSideSlot;
    case OccupationFunction.ContactPlatform:
    case OccupationFunction.ScreenSupport:
      return MicroPosition.OutsideShoulder;
    case OccupationFunction.PressingTrap:
    case OccupationFunction.PressTrigger:
      return MicroPosition.PressureAngle;
    case OccupationFunction.CoverShadowBlocker:
    case OccupationFunction.CounterpressBalancer:
      return MicroPosition.CoverLane;
    case OccupationFunction.TransitionHunter:
    case OccupationFunction.TempoAccelerator:
    case OccupationFunction.DepthThreat:
    case OccupationFunction.ChaosAttacker:
      return MicroPosition.HighPin;
    case OccupationFunction.OverloadSupport:
    case OccupationFunction.PressureAbsorber:
    case OccupationFunction.TempoController:
      return MicroPosition.Center;
  }
}
