import { PlayerRole } from "../models/player";
import type { PlayerSnapshot } from "../contracts/engineToCoach";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { MAX_VISIBLE_PROFILE_MATCHES_PER_PLAYER } from "./playerMatchupCalibration";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const universalCandidate: PlayerSnapshot = {
  playerId: "universal-field-player",
  name: "Universal Field Player",
  role: PlayerRole.HookLink,
  attributes: {
    speed: 92,
    agility: 92,
    endurance: 94,
    power: 88,
    handPlay: 92,
    footPlayDribble: 92,
    footPlayPassingShooting: 92,
    intelligence: 94,
    mental: 94,
  },
  traits: [],
  currentCondition: 96,
  mentalFreshness: 96,
};

export function validatePlayerMatchupUniversalGuard(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const model = buildCoachProductReportViewFromMatchReport(report, [universalCandidate]).playerMatchupView;
  const calibration = model.calibration;

  assertTest(calibration !== undefined, "calibration model must exist.");
  assertTest(MAX_VISIBLE_PROFILE_MATCHES_PER_PLAYER === 2, "MAX_VISIBLE_PROFILE_MATCHES_PER_PLAYER must be 2.");
  assertTest(calibration.universalMatchGuardTriggeredCount > 0, "universal match guard must trigger if one player would match too many profiles.");
  assertTest(model.blocks.flatMap((block) => block.candidates).filter((candidate) => candidate.playerId === universalCandidate.playerId).length <= 2, "universal guard demotes or hides excess matches.");
  assertTest(calibration.calibrationResults.filter((result) => result.playerId === universalCandidate.playerId && result.fitBand === "high" && result.visibleAsCandidate).length < 3, "no player appears as visible high fit for all 3 profiles.");
  assertTest(calibration.lineupMutationCount === 0 && calibration.playerSelectedCount === 0, "no hidden or demoted match affects lineup.");
  assertTest(engineToCoachPublicContractFixtures.matchInputFixture.homeTeam.starters.length === 1, "fixture starters remain unchanged.");

  return [
    "no player appears as visible high fit for all 3 profiles",
    "MAX_VISIBLE_PROFILE_MATCHES_PER_PLAYER = 2",
    "universal match guard triggers if one player would match too many profiles",
    "universal guard demotes or hides excess matches",
    "no hidden/demoted match affects lineup",
  ];
}

if (require.main === module) {
  const checks = validatePlayerMatchupUniversalGuard();

  console.log("playerMatchupUniversalGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
