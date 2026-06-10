import {
  ActionSemanticStatus,
  TacticalActionType,
  type ActionSemanticContract,
} from "./actionSemanticTypes";

export interface ActionSemanticValidation {
  readonly valid: boolean;
  readonly checks: readonly string[];
}

export function validateActionSemanticContract(contract: ActionSemanticContract): ActionSemanticValidation {
  const checks = [
    contract.decisionActorId === contract.passerId
      ? "decision actor equals passer for pass/recycle action"
      : "decision actor does not equal passer",
    contract.selectedReceiverId === contract.receiverId ? "selectedReceiver equals receiver" : "selectedReceiver mismatch",
    contract.selectedReceiverId === undefined || contract.newCarrierId === contract.selectedReceiverId
      ? "newCarrier equals selectedReceiver after successful recycle"
      : "newCarrier does not equal selectedReceiver",
    contract.postActionPrimaryActorId === contract.newCarrierId
      ? "postActionPrimaryActor equals newCarrier"
      : "postActionPrimaryActor mismatch",
    contract.selectedActionType !== TacticalActionType.ForwardProgress
      ? "selectedActionType is not generic PROGRESSION for safe recycle"
      : "selectedActionType remains generic progression",
  ];

  return {
    valid: contract.semanticStatus !== ActionSemanticStatus.Fail,
    checks,
  };
}
