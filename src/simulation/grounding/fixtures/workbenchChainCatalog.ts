import { sequence1Action1Chain } from "./sequence1Action1.chain.fixture";
import { sequence1MultiActionChain } from "./sequence1MultiAction.chain.fixture";

export const WORKBENCH_CHAIN_CATALOG = [
  sequence1Action1Chain,
  sequence1MultiActionChain,
] as const;

// Future chain catalog entries:
// - sequence-1-action-2
// - sequence-1-action-3
// - sequence-3-action-1
// - full opening possession chain
