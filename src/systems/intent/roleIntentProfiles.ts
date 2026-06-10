import { PlayerRole } from "../../models/player";
import { TacticalStyle } from "../../models/tactics";
import { IntentSource, IntentType } from "./intentTypes";

export interface RoleIntentProfileEntry {
  readonly type: IntentType;
  readonly priority: number;
  readonly confidence: number;
  readonly source: IntentSource;
  readonly reason: string;
}

function entry(type: IntentType, priority: number, confidence: number, reason: string): RoleIntentProfileEntry {
  return {
    type,
    priority,
    confidence,
    source: IntentSource.RoleDefault,
    reason,
  };
}

const CONTROL_PROFILES: Record<PlayerRole, readonly RoleIntentProfileEntry[]> = {
  [PlayerRole.TempoHalf]: [entry(IntentType.OrganizeTempo, 82, 88, "CONTROL build-up structure"), entry(IntentType.SupportBall, 78, 84, "secure nearby outlet"), entry(IntentType.SecureRecycle, 62, 74, "safe reset option")],
  [PlayerRole.HookLink]: [entry(IntentType.SupportBall, 82, 86, "secure outlet"), entry(IntentType.ScreenPressure, 78, 80, "protect receiver"), entry(IntentType.SecureRecycle, 66, 72, "phase connector")],
  [PlayerRole.ForwardLeader]: [entry(IntentType.ScreenPressure, 82, 82, "pod screen"), entry(IntentType.CreateOverload, 66, 70, "central support"), entry(IntentType.ContestLooseBall, 62, 68, "contact contest")],
  [PlayerRole.GoalkeeperFreeSafety]: [entry(IntentType.ProtectFrame, 90, 92, "goalkeeper frame protection"), entry(IntentType.SweepDepth, 68, 76, "depth control"), entry(IntentType.ProtectRestDefense, 66, 80, "last-line organization")],
  [PlayerRole.MobileLock]: [entry(IntentType.RecoverStructure, 84, 86, "emergency cover"), entry(IntentType.ContestLooseBall, 68, 74, "loose-ball stopper"), entry(IntentType.ScreenPressure, 62, 70, "lane closure")],
  [PlayerRole.SpaceHunter]: [entry(IntentType.AttackDepth, 66, 78, "selective depth threat"), entry(IntentType.AttackWeakSide, 66, 78, "weak-side runner"), entry(IntentType.AnticipateRebound, 62, 70, "late scoring runner")],
  [PlayerRole.Playmaker]: [entry(IntentType.PrepareFinish, 82, 84, "red-zone unlocker"), entry(IntentType.SupportBall, 68, 78, "creative support"), entry(IntentType.CreateOverload, 66, 76, "third-man creator")],
  [PlayerRole.Pivot]: [entry(IntentType.ProtectRestDefense, 86, 88, "central balance"), entry(IntentType.ResetShape, 80, 86, "shape reset"), entry(IntentType.SupportBall, 64, 74, "hinge support")],
  [PlayerRole.LeftPiston]: [entry(IntentType.OccupyWidth, 82, 84, "left width"), entry(IntentType.AttackWeakSide, 66, 76, "flank timing"), entry(IntentType.RecoverStructure, 62, 72, "flank recovery")],
  [PlayerRole.RightPiston]: [entry(IntentType.OccupyWidth, 82, 84, "right width"), entry(IntentType.AttackWeakSide, 66, 76, "flank timing"), entry(IntentType.RecoverStructure, 62, 72, "flank recovery")],
  [PlayerRole.LeftAnchor]: [entry(IntentType.OccupyWidth, 70, 74, "legacy left width")],
  [PlayerRole.RightAnchor]: [entry(IntentType.OccupyWidth, 70, 74, "legacy right width")],
  [PlayerRole.PowerRunner]: [entry(IntentType.CreateOverload, 72, 74, "legacy carrier support")],
  [PlayerRole.FreeSafety]: [entry(IntentType.ProtectFrame, 76, 80, "legacy last line")],
};

const BLITZ_OVERRIDES: Partial<Record<PlayerRole, readonly RoleIntentProfileEntry[]>> = {
  [PlayerRole.TempoHalf]: [entry(IntentType.AttackDepth, 76, 82, "BLITZ vertical trigger"), entry(IntentType.OrganizeTempo, 66, 70, "fast tempo organization"), entry(IntentType.PrepareFinish, 64, 70, "early strike setup")],
  [PlayerRole.SpaceHunter]: [entry(IntentType.AttackDepth, 92, 90, "BLITZ depth runner"), entry(IntentType.AttackWeakSide, 84, 86, "open-side acceleration"), entry(IntentType.AnticipateRebound, 82, 84, "chaotic second ball"), entry(IntentType.ContestLooseBall, 80, 82, "loose-ball hunter")],
  [PlayerRole.Playmaker]: [entry(IntentType.PrepareFinish, 86, 84, "high-risk creator"), entry(IntentType.CreateOverload, 82, 82, "direct overload"), entry(IntentType.AttackWeakSide, 72, 78, "unstable corridor attack")],
  [PlayerRole.GoalkeeperFreeSafety]: [entry(IntentType.SweepDepth, 86, 82, "aggressive sweeper-kicker"), entry(IntentType.ProtectFrame, 84, 82, "frame protection"), entry(IntentType.AttackDepth, 60, 66, "direct distribution support")],
  [PlayerRole.LeftPiston]: [entry(IntentType.OccupyWidth, 86, 84, "high-speed width"), entry(IntentType.AttackDepth, 82, 82, "wide depth runner"), entry(IntentType.AttackWeakSide, 82, 82, "open-side lane")],
  [PlayerRole.RightPiston]: [entry(IntentType.OccupyWidth, 86, 84, "high-speed width"), entry(IntentType.AttackDepth, 82, 82, "wide depth runner"), entry(IntentType.AttackWeakSide, 82, 82, "open-side lane")],
  [PlayerRole.MobileLock]: [entry(IntentType.PressBall, 84, 82, "forward counterpress"), entry(IntentType.ContestLooseBall, 82, 82, "chaos contest"), entry(IntentType.RecoverStructure, 66, 70, "aggressive recovery")],
  [PlayerRole.ForwardLeader]: [entry(IntentType.ScreenPressure, 84, 82, "collision screen"), entry(IntentType.ContestLooseBall, 82, 80, "second contact"), entry(IntentType.CreateOverload, 68, 72, "vertical support")],
  [PlayerRole.Pivot]: [entry(IntentType.SupportBall, 68, 72, "transition relay"), entry(IntentType.RecoverStructure, 66, 68, "unstable balance"), entry(IntentType.ResetShape, 58, 62, "delayed reset")],
};

export function getRoleIntentProfile(role: PlayerRole, style: TacticalStyle): readonly RoleIntentProfileEntry[] {
  if (style === TacticalStyle.Blitz && BLITZ_OVERRIDES[role] !== undefined) {
    return BLITZ_OVERRIDES[role];
  }

  return CONTROL_PROFILES[role];
}
