import { BallTargetType } from "../ball";

export function describeTargetSemantics(input: {
  readonly targetType: BallTargetType;
  readonly tacticalTargetCluster?: string | undefined;
  readonly receiverLabel?: string | undefined;
  readonly receiverResolvedZone?: string | undefined;
  readonly actualReceptionZone?: string | undefined;
}): { readonly reason: string; readonly whyTargetDiffersFromReceiverZone: string } {
  const target = input.tacticalTargetCluster ?? input.actualReceptionZone ?? input.receiverResolvedZone ?? "the target";
  const receiver = input.receiverLabel ?? "the receiver";
  const receiverZone = input.receiverResolvedZone ?? input.actualReceptionZone ?? target;
  const receptionZone = input.actualReceptionZone ?? receiverZone;

  switch (input.targetType) {
    case BallTargetType.SupportCluster:
    case BallTargetType.PressureEscapeCluster:
    case BallTargetType.PressureEscapeZone:
      return {
        reason: `${target} is the pressure escape cluster; ${receiver} receives from ${receptionZone}.`,
        whyTargetDiffersFromReceiverZone: `${target} is the pressure-escape support cluster; ${receiver} receives from the adjacent half-space support lane ${receiverZone}.`,
      };
    case BallTargetType.StructureAdvancementTarget:
    case BallTargetType.ForwardProgressTarget:
      return {
        reason: `${target} is the structure-advancement target cluster; ${receiver} receives in ${receptionZone}.`,
        whyTargetDiffersFromReceiverZone: `${target} is the intended structure-advancement lane; ${receiver} receives from the adjacent support lane ${receiverZone}.`,
      };
    case BallTargetType.CentralRebuildTarget:
      return {
        reason: `${target} is the central rebuild target cluster; ${receiver} receives in ${receptionZone}.`,
        whyTargetDiffersFromReceiverZone: `${target} is the central rebuild lane; ${receiver} receives from the adjacent support lane ${receiverZone}.`,
      };
    case BallTargetType.RestDefenseResetTarget:
      return {
        reason: `${target} is the rest-defense reset target; ${receiver} receives while the team preserves security behind the ball.`,
        whyTargetDiffersFromReceiverZone: `${target} is the secure reset lane; ${receiver} receives from the adjacent support lane ${receiverZone}.`,
      };
    case BallTargetType.WeakSidePreparationTarget:
      return {
        reason: `${target} is the weak-side preparation target; ${receiver} receives to prepare the next switch.`,
        whyTargetDiffersFromReceiverZone: `${target} is the weak-side preparation lane; ${receiver} receives from ${receiverZone}.`,
      };
    case BallTargetType.WeakSideExploitTarget:
      return {
        reason: `${target} is the weak-side exploit target; ${receiver} receives beyond the compressed pressure.`,
        whyTargetDiffersFromReceiverZone: `${target} is the weak-side exploit lane; ${receiver} receives from ${receiverZone}.`,
      };
    case BallTargetType.ShotTarget:
      return {
        reason: `${target} is the shot target created by the attacking window.`,
        whyTargetDiffersFromReceiverZone: "shot target and receiver zone are evaluated separately from support-lane targets.",
      };
    case BallTargetType.CarryTarget:
      return {
        reason: `${target} is the carry target; the ball remains with the current carrier.`,
        whyTargetDiffersFromReceiverZone: "carry target and receiver zone match because no separate receiver is selected.",
      };
    case BallTargetType.PlayerTarget:
      return {
        reason: "tactical target and actual ball zone match.",
        whyTargetDiffersFromReceiverZone: "the tactical target and receiver resolved zone match.",
      };
    case BallTargetType.SpaceTarget:
      return {
        reason: `${target} is the intended space target; ${receiver} receives in ${receptionZone}.`,
        whyTargetDiffersFromReceiverZone: `${target} is the intended space target; ${receiver} receives from ${receiverZone}.`,
      };
  }
}

export function forbiddenTargetReasonTerms(targetType: BallTargetType): readonly string[] {
  switch (targetType) {
    case BallTargetType.StructureAdvancementTarget:
    case BallTargetType.ForwardProgressTarget:
      return ["safe recycle cluster", "pressure-escape support cluster"];
    case BallTargetType.ShotTarget:
      return ["recycle", "support cluster", "rebuild"];
    default:
      return [];
  }
}
