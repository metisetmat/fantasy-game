import { OccupationFunction } from "./occupationTypes";

export function describeOccupationBehavior(functionType: OccupationFunction): string {
  switch (functionType) {
    case OccupationFunction.SupportBehindBall:
      return "stays behind the carrier as a pressure-release option";
    case OccupationFunction.DirectSupport:
      return "occupies a nearby angle that keeps the carrier connected";
    case OccupationFunction.ThirdManConnector:
      return "positions for the pass after the next pass";
    case OccupationFunction.WeakSideConnector:
      return "keeps the far-side continuation visible without forcing rupture";
    case OccupationFunction.WidthFixer:
      return "holds width to stretch the defensive line";
    case OccupationFunction.DepthThreat:
      return "pins depth and threatens the space behind recovery";
    case OccupationFunction.RestDefenseAnchor:
      return "protects the central transition lane";
    case OccupationFunction.HalfSpaceRecycle:
      return "offers a half-space reset rather than duplicating the anchor";
    case OccupationFunction.PressingTrap:
      return "compresses the ball-side lane as part of a trap";
    case OccupationFunction.TransitionHunter:
      return "prepares the first vertical outlet after a regain";
    case OccupationFunction.SwitchReceiver:
      return "stays reachable for a switch or indirect progression";
    case OccupationFunction.ContactPlatform:
      return "absorbs contact and sets the next receiver";
    case OccupationFunction.ChaosAttacker:
      return "attacks unstable second-ball space";
    case OccupationFunction.OverloadSupport:
      return "adds numbers around the decisive lane";
    case OccupationFunction.ScreenSupport:
      return "screens pressure while remaining playable";
    case OccupationFunction.PressureAbsorber:
      return "holds a stable touch under pressure";
    case OccupationFunction.PressTrigger:
      return "steps forward when the pressure cue appears";
    case OccupationFunction.CoverShadowBlocker:
      return "blocks the next lane rather than only marking a zone";
    case OccupationFunction.CounterpressBalancer:
      return "guards the counterpress/rest-defense balance";
    case OccupationFunction.SafeRecycle:
      return "keeps possession secure through a low-risk reset";
    case OccupationFunction.TempoAccelerator:
      return "speeds the next action toward vertical pressure";
    case OccupationFunction.TempoController:
      return "slows or accelerates play according to support quality";
  }
}
