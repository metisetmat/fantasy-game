import type { ZoneId } from "../../core/zones";
import { BallTargetType } from "../ball";

export interface TargetSemanticResolution {
  readonly targetType: BallTargetType;
  readonly tacticalTargetCluster?: ZoneId | undefined;
  readonly receiverResolvedZone?: ZoneId | undefined;
  readonly actualReceptionZone?: ZoneId | undefined;
  readonly reason: string;
  readonly whyTargetDiffersFromReceiverZone: string;
}

export interface TargetSemanticValidationResult {
  readonly valid: boolean;
  readonly forbiddenTerms: readonly string[];
}
