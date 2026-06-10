import { IntentType } from "../intentTypes";

export const INTENT_TRANSITION_GRAPH: Readonly<Record<IntentType, readonly IntentType[]>> = {
  [IntentType.OrganizeTempo]: [IntentType.SupportBall, IntentType.PrepareFinish, IntentType.ResetShape],
  [IntentType.SupportBall]: [IntentType.ScreenPressure, IntentType.SecureRecycle, IntentType.PressBall],
  [IntentType.SecureRecycle]: [IntentType.SupportBall, IntentType.ResetShape],
  [IntentType.AttackDepth]: [IntentType.PrepareFinish, IntentType.ContestLooseBall, IntentType.RecoverStructure],
  [IntentType.AttackWeakSide]: [IntentType.AttackDepth, IntentType.PrepareFinish, IntentType.SupportBall],
  [IntentType.OccupyWidth]: [IntentType.AttackWeakSide, IntentType.SupportBall],
  [IntentType.CreateOverload]: [IntentType.SupportBall, IntentType.PrepareFinish, IntentType.ScreenPressure],
  [IntentType.ScreenPressure]: [IntentType.SupportBall, IntentType.ContestLooseBall, IntentType.ResetShape],
  [IntentType.PrepareFinish]: [IntentType.ContestLooseBall, IntentType.SupportBall, IntentType.ResetShape],
  [IntentType.AnticipateRebound]: [IntentType.ContestLooseBall, IntentType.PrepareFinish],
  [IntentType.ContestLooseBall]: [IntentType.PressBall, IntentType.ResetShape, IntentType.SupportBall],
  [IntentType.PressBall]: [IntentType.RecoverStructure, IntentType.ContestLooseBall],
  [IntentType.CutPassingLane]: [IntentType.PressBall, IntentType.CoverShadow],
  [IntentType.CoverShadow]: [IntentType.CutPassingLane, IntentType.RecoverStructure],
  [IntentType.ProtectGoalSide]: [IntentType.PressBall, IntentType.RecoverStructure],
  [IntentType.ProtectRestDefense]: [IntentType.PressBall, IntentType.ResetShape],
  [IntentType.RecoverStructure]: [IntentType.ResetShape, IntentType.ProtectGoalSide],
  [IntentType.MarkRunner]: [IntentType.RecoverStructure, IntentType.PressBall],
  [IntentType.ProtectFrame]: [IntentType.ContestLooseBall, IntentType.ResetShape],
  [IntentType.SweepDepth]: [IntentType.ProtectFrame, IntentType.ResetShape],
  [IntentType.ResetShape]: [IntentType.HoldPosition, IntentType.SupportBall],
  [IntentType.FollowPlay]: [IntentType.SupportBall, IntentType.PressBall],
  [IntentType.HoldPosition]: [IntentType.ResetShape, IntentType.SupportBall],
};

export function canTransitionIntent(from: IntentType, to: IntentType): boolean {
  return INTENT_TRANSITION_GRAPH[from].includes(to);
}
