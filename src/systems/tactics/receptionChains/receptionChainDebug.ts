import { chainPath } from "./receptionChainNarrative";
import type { ReceptionChain } from "./receptionChainTypes";

export function formatReceptionChainDebug(chain: ReceptionChain): string {
  return `${chainPath(chain)} direct ${chain.directValue}, chain ${chain.chainValue}, risk ${chain.totalRisk}, effectiveChainQuality ${chain.effectiveChainQuality}, chain timing ${chain.chainTiming.openingTick}-${chain.chainTiming.closingTick}`;
}
