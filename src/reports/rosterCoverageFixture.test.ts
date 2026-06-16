import { PlayerRole } from "../models/player";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRosterCoverageFixture(): readonly string[] {
  assertTest(rosterCoverageFixturePlayers.length >= 10, "roster coverage fixture must contain at least 10 players.");
  assertTest(rosterCoverageFixturePlayers.some((player) => player.role === PlayerRole.GoalkeeperFreeSafety), "fixture must contain a goalkeeper specialist.");
  assertTest(rosterCoverageFixturePlayers.some((player) => player.playerId === "rc-mobile-connector" && player.role === PlayerRole.HookLink), "fixture must contain the mobile support connector.");
  assertTest(rosterCoverageFixturePlayers.some((player) => player.playerId === "rc-creative-support" && player.role === PlayerRole.Playmaker), "fixture must contain the creative support player.");
  assertTest(rosterCoverageFixturePlayers.some((player) => player.playerId === "rc-second-ball-chaser" && player.role === PlayerRole.SpaceHunter), "fixture must contain the second-ball chaser.");
  assertTest(rosterCoverageFixturePlayers.some((player) => player.playerId === "rc-intense-recovery" && player.role === PlayerRole.MobileLock), "fixture must contain the intense recovery player.");
  assertTest(rosterCoverageFixturePlayers.some((player) => player.playerId === "rc-rest-defense-anchor" && player.role === PlayerRole.Pivot), "fixture must contain the rest-defense anchor.");
  assertTest(rosterCoverageFixturePlayers.some((player) => player.playerId === "rc-pure-finisher" && player.role === PlayerRole.PowerRunner), "fixture must contain the pure finisher.");
  assertTest(rosterCoverageFixturePlayers.some((player) => player.playerId === "rc-low-endurance-creator" && player.currentCondition < 50), "fixture must contain the low-endurance creator.");
  assertTest(rosterCoverageFixturePlayers.some((player) => player.playerId === "rc-low-block-specialist" && player.role === PlayerRole.RightAnchor), "fixture must contain the defensive low-block specialist.");
  assertTest(rosterCoverageFixturePlayers.some((player) => player.playerId === "rc-hybrid-role"), "fixture must contain the hybrid role player.");

  return [
    "fixture contains at least 10 players",
    "fixture contains the goalkeeper specialist",
    "fixture contains connector, creator, chaser, anchor, finisher, and hybrid profiles",
    "fixture includes penalized and incomplete player archetypes",
  ];
}

if (require.main === module) {
  const checks = validateRosterCoverageFixture();

  console.log("rosterCoverageFixture tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
