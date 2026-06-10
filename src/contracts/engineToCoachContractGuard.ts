import { engineToCoachPublicContractFixtures } from "./engineToCoach.test";
import type { MatchInput, MatchReport, PlayerSnapshot, TeamSnapshot } from "./engineToCoach";

interface RatingCheck {
  readonly label: string;
  readonly value: number;
}

function assertGuard(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertRating(check: RatingCheck): void {
  assertGuard(
    Number.isFinite(check.value) && check.value >= 0 && check.value <= 100,
    `${check.label} must be a finite 0-100 rating, received ${check.value}.`,
  );
}

function rosterIds(team: TeamSnapshot): ReadonlySet<string> {
  return new Set(team.roster.map((player) => player.playerId));
}

function assertPlayerRefsExist(input: {
  readonly team: TeamSnapshot;
  readonly label: string;
  readonly playerIds: readonly string[];
  readonly knownRosterIds: ReadonlySet<string>;
}): void {
  for (const playerId of input.playerIds) {
    assertGuard(
      input.knownRosterIds.has(playerId),
      `${input.label} references ${playerId}, but ${playerId} is not present in ${input.team.name} roster.`,
    );
  }
}

function validateTeamSnapshot(team: TeamSnapshot): void {
  const knownRosterIds = rosterIds(team);

  assertPlayerRefsExist({
    team,
    label: `${team.name} goalkeeperId`,
    playerIds: [team.goalkeeperId],
    knownRosterIds,
  });
  assertPlayerRefsExist({
    team,
    label: `${team.name} starters`,
    playerIds: team.starters,
    knownRosterIds,
  });
  assertPlayerRefsExist({
    team,
    label: `${team.name} bench`,
    playerIds: team.bench,
    knownRosterIds,
  });
}

function playerRatingChecks(player: PlayerSnapshot): readonly RatingCheck[] {
  return [
    { label: `${player.name}.attributes.speed`, value: player.attributes.speed },
    { label: `${player.name}.attributes.agility`, value: player.attributes.agility },
    { label: `${player.name}.attributes.endurance`, value: player.attributes.endurance },
    { label: `${player.name}.attributes.power`, value: player.attributes.power },
    { label: `${player.name}.attributes.handPlay`, value: player.attributes.handPlay },
    { label: `${player.name}.attributes.footPlayDribble`, value: player.attributes.footPlayDribble },
    { label: `${player.name}.attributes.footPlayPassingShooting`, value: player.attributes.footPlayPassingShooting },
    { label: `${player.name}.attributes.intelligence`, value: player.attributes.intelligence },
    { label: `${player.name}.attributes.mental`, value: player.attributes.mental },
    { label: `${player.name}.currentCondition`, value: player.currentCondition },
    { label: `${player.name}.mentalFreshness`, value: player.mentalFreshness },
    ...((player.chemistryLinks ?? []).map((link) => ({
      label: `${player.name}.chemistryLinks.${link.playerId}.strength`,
      value: link.strength,
    }))),
  ];
}

function validateMatchInputRatings(input: MatchInput): void {
  const planChecks: readonly RatingCheck[] = [
    { label: "matchContext.matchImportance", value: input.matchContext.matchImportance },
    { label: "homePlan.pressingIntensity", value: input.homePlan.pressingIntensity },
    { label: "homePlan.defensiveLineHeight", value: input.homePlan.defensiveLineHeight },
    { label: "homePlan.widthUsage", value: input.homePlan.widthUsage },
    { label: "homePlan.restDefensePriority", value: input.homePlan.restDefensePriority },
    { label: "awayPlan.pressingIntensity", value: input.awayPlan.pressingIntensity },
    { label: "awayPlan.defensiveLineHeight", value: input.awayPlan.defensiveLineHeight },
    { label: "awayPlan.widthUsage", value: input.awayPlan.widthUsage },
    { label: "awayPlan.restDefensePriority", value: input.awayPlan.restDefensePriority },
  ];
  const playerChecks = [...input.homeTeam.roster, ...input.awayTeam.roster].flatMap((player) => playerRatingChecks(player));

  for (const check of [...planChecks, ...playerChecks]) {
    assertRating(check);
  }
}

function validateMatchReportReferences(report: MatchReport): void {
  const timelineEventIds = new Set(report.timeline.map((event) => event.eventId));
  const evidenceFactIds = new Set(report.evidenceFacts.map((fact) => fact.factId));

  for (const event of report.timeline) {
    assertGuard(
      event.matchId === report.matchId,
      `MatchEvent ${event.eventId} matchId ${event.matchId} does not match parent MatchReport ${report.matchId}.`,
    );
  }

  for (const insight of report.coachInsights) {
    for (const evidence of insight.evidence) {
      for (const eventId of evidence.eventIds) {
        assertGuard(
          timelineEventIds.has(eventId),
          `CoachInsight ${insight.insightId} evidence references missing event ${eventId}.`,
        );
      }
    }
  }

  for (const moment of report.keyMoments) {
    assertGuard(
      timelineEventIds.has(moment.eventId),
      `KeyMoment ${moment.title} references missing event ${moment.eventId}.`,
    );
    if (moment.evidenceFactId !== undefined) {
      assertGuard(
        evidenceFactIds.has(moment.evidenceFactId),
        `KeyMoment ${moment.title} references missing evidence fact ${moment.evidenceFactId}.`,
      );
    }
  }

  for (const fact of report.evidenceFacts) {
    for (const eventId of fact.eventIds) {
      assertGuard(
        timelineEventIds.has(eventId),
        `MatchReportEvidenceFact ${fact.factId} references missing event ${eventId}.`,
      );
    }
  }

  for (const warning of report.warnings) {
    for (const factId of warning.evidenceFactIds) {
      assertGuard(
        evidenceFactIds.has(factId),
        `MatchReportWarning ${warning.warningId} references missing evidence fact ${factId}.`,
      );
    }
    for (const eventId of warning.eventIds) {
      assertGuard(
        timelineEventIds.has(eventId),
        `MatchReportWarning ${warning.warningId} references missing event ${eventId}.`,
      );
    }
  }
}

function validateMatchReportRatings(report: MatchReport): void {
  const eventChecks = report.timeline.flatMap((event) => [
    { label: `${event.eventId}.narrativeWeight`, value: event.narrativeWeight },
    { label: `${event.eventId}.fatigueContext.teamCondition`, value: event.fatigueContext.teamCondition },
    ...(event.fatigueContext.primaryPlayerCondition === undefined
      ? []
      : [{ label: `${event.eventId}.fatigueContext.primaryPlayerCondition`, value: event.fatigueContext.primaryPlayerCondition }]),
    ...(event.fatigueContext.primaryPlayerMentalFreshness === undefined
      ? []
      : [
          {
            label: `${event.eventId}.fatigueContext.primaryPlayerMentalFreshness`,
            value: event.fatigueContext.primaryPlayerMentalFreshness,
          },
        ]),
  ]);
  const reportChecks: readonly RatingCheck[] = [
    ...eventChecks,
    ...report.teamStats.flatMap((stats) =>
      stats.possessionShare === undefined ? [] : [{ label: `${stats.teamId}.teamStats.possessionShare`, value: stats.possessionShare }],
    ),
    ...report.playerStats.map((stats) => ({
      label: `${stats.playerId}.playerStats.contributionScore`,
      value: stats.contributionScore,
    })),
    ...report.evidenceFacts.map((fact) => ({
      label: `${fact.factId}.evidenceFacts.strength`,
      value: fact.strength,
    })),
    ...report.fatigueReport.teamSummaries.flatMap((summary) => [
      { label: `${summary.teamId}.fatigueReport.averageConditionEnd`, value: summary.averageConditionEnd },
      { label: `${summary.teamId}.fatigueReport.highIntensityLoad`, value: summary.highIntensityLoad },
    ]),
    ...report.fatigueReport.playerSummaries.flatMap((summary) => [
      { label: `${summary.playerId}.fatigueReport.conditionStart`, value: summary.conditionStart },
      { label: `${summary.playerId}.fatigueReport.conditionEnd`, value: summary.conditionEnd },
      { label: `${summary.playerId}.fatigueReport.mentalFreshnessEnd`, value: summary.mentalFreshnessEnd },
    ]),
  ];

  for (const check of reportChecks) {
    assertRating(check);
  }
}

function validateMatchReportMeta(report: MatchReport): void {
  assertGuard(report.reportMeta.generatorVersion.length > 0, "MatchReport.reportMeta.generatorVersion must be populated.");
  assertGuard(report.reportMeta.sourceOfTruthNote.length > 0, "MatchReport.reportMeta.sourceOfTruthNote must be populated.");
  assertGuard(report.reportMeta.limitations.length > 0, "MatchReport.reportMeta.limitations must document report limitations.");
}

export function validateEngineToCoachContractFixtures(): readonly string[] {
  const { matchInputFixture, matchReportFixture, matchSnapshotFixture } = engineToCoachPublicContractFixtures;

  validateTeamSnapshot(matchInputFixture.homeTeam);
  validateTeamSnapshot(matchInputFixture.awayTeam);
  validateMatchInputRatings(matchInputFixture);
  validateMatchReportReferences(matchReportFixture);
  validateMatchReportRatings(matchReportFixture);
  validateMatchReportMeta(matchReportFixture);

  assertGuard(
    matchSnapshotFixture.matchId === matchInputFixture.matchId,
    `MatchSnapshot ${matchSnapshotFixture.matchId} does not match MatchInput ${matchInputFixture.matchId}.`,
  );

  return [
    "goalkeeper, starter, and bench references resolve to roster players",
    "MatchEvent.matchId values match parent MatchReport.matchId",
    "CoachInsight evidence references timeline events",
    "KeyMoment references timeline events",
    "MatchReport evidenceFacts reference timeline events",
    "MatchReport warnings reference evidenceFacts and timeline events",
    "MatchReport reportMeta is populated",
    "contract fixture ratings stay within 0-100 bounds",
  ];
}

if (require.main === module) {
  const passedChecks = validateEngineToCoachContractFixtures();

  console.log("Engine-to-Coach contract guard passed.");
  for (const check of passedChecks) {
    console.log(`- ${check}`);
  }
}
