import { ReceptionFollowUpRole } from "../../spatial";
import type { ReceptionChain, ReceptionChainAction } from "./receptionChainTypes";

function actionPhrase(action: ReceptionChainAction): string {
  if (action.followUpRole === ReceptionFollowUpRole.ContactPlatform) {
    return `${action.toInitials} acts as a contact platform`;
  }

  if (action.followUpRole === ReceptionFollowUpRole.WallPass) {
    return `${action.toInitials} offers a wall pass`;
  }

  if (action.followUpRole === ReceptionFollowUpRole.ThirdManSet) {
    return `${action.toInitials} sets the third-man lane`;
  }

  if (action.followUpRole === ReceptionFollowUpRole.FastRelease) {
    return `${action.toInitials} can release quickly`;
  }

  if (action.followUpRole === ReceptionFollowUpRole.SecureRecycle) {
    return `${action.toInitials} secures the recycle`;
  }

  return `${action.toInitials} receives`;
}

export function summarizeReceptionChain(actions: readonly ReceptionChainAction[]): string {
  if (actions.length === 0) {
    return "No reception chain generated.";
  }

  if (actions.length === 1) {
    return `${actions[0]?.fromInitials ?? "?"} -> ${actions[0]?.toInitials ?? "?"}: ${actionPhrase(actions[0] as ReceptionChainAction)} before the attacking side rebuilds the next phase.`;
  }

  const first = actions[0] as ReceptionChainAction;
  const final = actions[actions.length - 1] as ReceptionChainAction;
  const middle = actions.slice(0, -1).map(actionPhrase).join("; ");

  return `${first.fromInitials} -> ${actions.map((action) => action.toInitials).join(" -> ")}: ${middle} before ${final.toInitials} attacks the next progression window.`;
}

export function chainPath(chain: ReceptionChain): string {
  const firstAction = chain.actions[0];
  if (firstAction === undefined) {
    return chain.chainId;
  }

  return [firstAction.fromInitials, ...chain.actions.map((action) => action.toInitials)].join(" -> ");
}
