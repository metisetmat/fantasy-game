import type { PlayerMatchState } from "../players";
import {
  ReceptionFollowUpRole,
  ReceptionQualityLevel,
  type ReceptionQualityEvaluation,
} from "./receptionQuality";

export interface ReceptionUpgradeInput {
  readonly evaluation: ReceptionQualityEvaluation;
  readonly receiver: PlayerMatchState;
  readonly supportAvailable: boolean;
  readonly teamStyle: "CONTROL" | "BLITZ";
}

function technicalScore(player: PlayerMatchState): number {
  const attributes = player.visibleAttributes;
  if (attributes === undefined) {
    return 55;
  }

  return Math.round(
    attributes.composure * 0.28 +
      attributes.vision * 0.24 +
      attributes.handPlay * 0.18 +
      attributes.ballCarrying * 0.16 +
      attributes.power * 0.08 +
      attributes.creativity * 0.06,
  );
}

function upgradedQuality(input: ReceptionUpgradeInput): {
  readonly quality: ReceptionQualityLevel | null;
  readonly reason: string | null;
} {
  const score = technicalScore(input.receiver);
  const pressure = input.evaluation.pressure;
  const followUp = input.evaluation.followUpRole;
  const supportBonus = input.supportAvailable ? 8 : 0;
  const styleBonus =
    input.teamStyle === "CONTROL" &&
    (followUp === ReceptionFollowUpRole.WallPass ||
      followUp === ReceptionFollowUpRole.ThirdManSet ||
      followUp === ReceptionFollowUpRole.SecureRecycle)
      ? 6
      : 0;
  const upgradeScore = score + supportBonus + styleBonus - Math.round(pressure * 0.36);

  if (input.evaluation.quality === ReceptionQualityLevel.Neutral && upgradeScore >= 88 && pressure <= 42) {
    return {
      quality: ReceptionQualityLevel.Excellent,
      reason: `rare elite reception upgrade under manageable pressure (${pressure}/100)`,
    };
  }

  if (input.evaluation.quality === ReceptionQualityLevel.Neutral && upgradeScore >= 72 && pressure <= 62) {
    return {
      quality: ReceptionQualityLevel.Positive,
      reason: `upgraded by composure/vision profile (${score}/100) and ${followUp.toLowerCase().replace(/_/g, " ")}`,
    };
  }

  if (input.evaluation.quality === ReceptionQualityLevel.Neutral && upgradeScore < 34 && pressure >= 72) {
    if (
      pressure < 90 &&
      (followUp === ReceptionFollowUpRole.ContactPlatform || followUp === ReceptionFollowUpRole.ThirdManSet)
    ) {
      return {
        quality: null,
        reason: null,
      };
    }

    return {
      quality: ReceptionQualityLevel.Negative,
      reason: "downgraded because pressure overwhelms receiving profile",
    };
  }

  return {
    quality: null,
    reason: null,
  };
}

export function applyReceptionUpgrade(input: ReceptionUpgradeInput): ReceptionQualityEvaluation {
  const upgrade = upgradedQuality(input);
  const finalQuality = upgrade.quality ?? input.evaluation.quality;

  return {
    ...input.evaluation,
    upgradedQuality: upgrade.quality,
    upgradeReason: upgrade.reason,
    quality: finalQuality,
    explanation:
      upgrade.reason === null
        ? input.evaluation.explanation
        : `${input.evaluation.explanation}; ${upgrade.reason}`,
  };
}
