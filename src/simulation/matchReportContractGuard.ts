import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import type { MatchReport } from "../contracts/engineToCoach";
import { containsMojibake } from "../reports/coachCopyQuality";
import { runFullMatch } from "./runFullMatch";
import { runMatch } from "./runMatch";

function assertGuard(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function validateScoreFromConsequences(report: MatchReport): void {
  const [homeTeam, awayTeam] = report.teamStats;

  if (homeTeam === undefined || awayTeam === undefined) {
    return;
  }

  const score = report.timeline.reduce(
    (currentScore, event) => {
      const points = event.consequences
        .filter((consequence) => consequence.type === "score_change")
        .reduce((total, consequence) => total + (consequence.value ?? 0), 0);

      return {
        home: currentScore.home + (event.teamId === homeTeam.teamId ? points : 0),
        away: currentScore.away + (event.teamId === awayTeam.teamId ? points : 0),
      };
    },
    { home: 0, away: 0 },
  );

  assertGuard(score.home === report.score.home && score.away === report.score.away, "MatchReport score must equal score_change consequences.");
}

function validateReportContract(report: MatchReport, expectedScope: MatchReport["reportMeta"]["reportScope"]): void {
  const eventIds = new Set(report.timeline.map((event) => event.eventId));
  const factIds = new Set(report.evidenceFacts.map((fact) => fact.factId));

  assertGuard(report.evidenceFacts.length > 0, "MatchReport.evidenceFacts must be non-empty when timeline evidence exists.");
  assertGuard(report.warnings.length >= 0, "MatchReport.warnings must exist.");
  assertGuard(report.reportMeta.reportScope === expectedScope, `reportMeta.reportScope must be ${expectedScope}.`);

  for (const fact of report.evidenceFacts) {
    assertGuard(!containsMojibake(fact.summary), `${fact.factId} evidence summary contains mojibake.`);
    assertGuard(fact.strength >= 0 && fact.strength <= 100, `${fact.factId} strength must stay within 0-100.`);
    for (const eventId of fact.eventIds) {
      assertGuard(eventIds.has(eventId), `${fact.factId} references missing event ${eventId}.`);
    }
  }

  for (const warning of report.warnings) {
    assertGuard(warning.mayInvalidateGlobalScoringEconomy === false, `${warning.warningId} must not invalidate global scoring economy.`);
    assertGuard(!containsMojibake(warning.coachSummary), `${warning.warningId} coach summary contains mojibake.`);
    for (const factId of warning.evidenceFactIds) {
      assertGuard(factIds.has(factId), `${warning.warningId} references missing evidence fact ${factId}.`);
    }
    for (const eventId of warning.eventIds) {
      assertGuard(eventIds.has(eventId), `${warning.warningId} references missing event ${eventId}.`);
    }
  }

  for (const insight of report.coachInsights) {
    assertGuard(!containsMojibake(insight.summary), `${insight.insightId} summary contains mojibake.`);
    for (const evidence of insight.evidence) {
      for (const eventId of evidence.eventIds) {
        assertGuard(eventIds.has(eventId), `${insight.insightId} references missing event ${eventId}.`);
      }
    }
  }

  for (const diagnosis of report.tacticalReport.diagnoses) {
    assertGuard(!containsMojibake(diagnosis.summary), `${diagnosis.diagnosisId} summary contains mojibake.`);
    for (const eventId of diagnosis.evidenceEventIds) {
      assertGuard(eventIds.has(eventId), `${diagnosis.diagnosisId} references missing event ${eventId}.`);
    }
  }

  for (const moment of report.keyMoments) {
    assertGuard(eventIds.has(moment.eventId), `${moment.title} references missing event ${moment.eventId}.`);
    assertGuard(!containsMojibake(moment.summary), `${moment.title} summary contains mojibake.`);
    if (moment.evidenceFactId !== undefined) {
      assertGuard(factIds.has(moment.evidenceFactId), `${moment.title} references missing evidence fact ${moment.evidenceFactId}.`);
    }
  }

  validateScoreFromConsequences(report);
}

export function validateCanonicalMatchReportContract(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const miniReport = runMatch(input);
  const fullReport = runFullMatch(input);

  validateReportContract(miniReport, "MINI_MATCH_LOCAL");
  validateReportContract(fullReport, "FULL_MATCH_HARNESS_SINGLE_RUN");
  assertGuard(fullReport.warnings.every((warning) => !warning.coachSummary.includes("FULL_MATCH_HARNESS_SINGLE_RUN")), "Visible warning copy must not expose raw harness scope enum.");
  assertGuard(fullReport.warnings.every((warning) => warning.technicalSummary.includes("FULL_MATCH_HARNESS_SINGLE_RUN")), "Technical warning summary must preserve raw harness scope.");

  return [
    "runMatch returns canonical evidenceFacts, warnings, and reportMeta",
    "runFullMatch returns canonical evidenceFacts, warnings, and reportMeta",
    "runMatch reportMeta scope is MINI_MATCH_LOCAL",
    "runFullMatch reportMeta scope is FULL_MATCH_HARNESS_SINGLE_RUN",
    "evidence fact event IDs reference real timeline events",
    "warning evidence fact IDs reference real evidence facts",
    "key moments reference real events and evidence facts when present",
    "coach insights and diagnoses reference real timeline events",
    "visible report summaries contain no mojibake",
    "full-match warnings cannot invalidate global scoring economy",
    "technical summaries preserve internal scope while coach summaries stay clean",
    "final score equals score_change consequences",
  ];
}

if (require.main === module) {
  const checks = validateCanonicalMatchReportContract();

  console.log("Canonical MatchReport contract guard passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
