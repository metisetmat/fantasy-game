import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import {
  selectionPreviewProfileAttributeLabels,
  selectionPreviewProfileRoleFamilyLabels,
} from "./selectionPreviewProfileView";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validatePlayerMatchupView(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const model = buildCoachProductReportViewFromMatchReport(
    report,
    engineToCoachPublicContractFixtures.matchInputFixture.homeTeam.roster,
  ).playerMatchupView;

  assertTest(model.status === "available", "player matchup view must be available.");
  assertTest(model.profileBlockCount === 3, "profile block count must be 3.");
  assertTest(model.playerCandidateCount > 0, "player candidate count must be present.");
  assertTest(model.blocks.every((block) => block.candidates.length > 0 || block.emptyState !== null), "each block must have candidates or an honest empty state.");
  const supportBlock = model.blocks.find((block) => block.profileId === "support_near_z4_hsr_profile");
  assertTest(supportBlock !== undefined, "support-near profile block must exist.");
  assertTest(
    supportBlock.roleFamilies.includes(selectionPreviewProfileRoleFamilyLabels.hook_link),
    "accented role family labels must survive profile reconstruction.",
  );
  assertTest(
    supportBlock.usefulAttributes.includes(selectionPreviewProfileAttributeLabels.handling),
    "accented useful attribute labels must survive profile reconstruction.",
  );
  for (const block of model.blocks) {
    for (const candidate of block.candidates) {
      assertTest(candidate.fitScore >= 0 && candidate.fitScore <= 100, "fitScore must be between 0 and 100.");
      assertTest(["low", "medium", "high"].includes(candidate.fitBand), "fitBand must be low, medium, or high.");
    }
  }
  assertTest(model.playerSelectedCount === 0, "no player must be selected.");
  assertTest(model.noAutomaticSelection, "no automatic selection must be true.");

  return [
    "model exists",
    "status is available when profile view and roster are available",
    "profile block count is 3",
    "player candidate count is present",
    "each block has candidates or an honest empty state",
    "accented role family labels survive profile reconstruction",
    "accented useful attribute labels survive profile reconstruction",
    "fitScore and fitBand are bounded",
    "no player is selected",
    "no automatic selection is true",
  ];
}

if (require.main === module) {
  const checks = validatePlayerMatchupView();

  console.log("playerMatchupView tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
