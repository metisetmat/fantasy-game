import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import { createMatchReportSignature, runMatch } from "./runMatch";
import { createTacticalPlanInfluence } from "./adapters/tacticalPlanInfluence";

function assertGuard(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function planTags(report: MatchReport): readonly string[] {
  return [...new Set(report.timeline.flatMap((event) => event.tags.filter((tag) => tag.startsWith("plan_"))))].sort();
}

function withAggressiveHomePlan(input: MatchInput): MatchInput {
  return {
    ...input,
    homePlan: {
      ...input.homePlan,
      tempo: "fast",
      riskLevel: "high",
      pressingIntensity: 92,
      targetZones: ["Z4-C"],
      scoringBias: "try_first",
    },
  };
}

function validatePlanTags(report: MatchReport): void {
  const tags = planTags(report);

  assertGuard(tags.length > 0, "runMatch must expose tactical-plan-derived tags.");
  assertGuard(tags.some((tag) => tag.includes("tempo_")), "runMatch must expose plan tempo tags.");
  assertGuard(tags.some((tag) => tag.includes("risk_")), "runMatch must expose plan risk tags.");
  assertGuard(tags.some((tag) => tag.includes("pressing_")), "runMatch must expose plan pressing tags.");
}

function planDiagnosisSummary(report: MatchReport): string {
  return report.tacticalReport.diagnoses.find((diagnosis) => diagnosis.title === "Plan de match observé")?.summary ?? "";
}

export function validateTacticalPlanInfluence(): readonly string[] {
  const baselineInput = engineToCoachPublicContractFixtures.matchInputFixture;
  const influencedInput = withAggressiveHomePlan(baselineInput);
  const baselineReport = runMatch(baselineInput);
  const repeatedBaselineReport = runMatch(baselineInput);
  const influencedReport = runMatch(influencedInput);
  const baselineInfluence = createTacticalPlanInfluence(baselineInput);
  const influencedInfluence = createTacticalPlanInfluence(influencedInput);
  const baselineSignature = createMatchReportSignature(baselineReport);
  const repeatedBaselineSignature = createMatchReportSignature(repeatedBaselineReport);
  const influencedSignature = createMatchReportSignature(influencedReport);
  const baselineTags = planTags(baselineReport);
  const influencedTags = planTags(influencedReport);

  validatePlanTags(baselineReport);
  validatePlanTags(influencedReport);
  assertGuard(baselineInfluence.homeSummary.length > 0, "baseline influence must include home plan summary.");
  assertGuard(baselineInfluence.awaySummary.length > 0, "baseline influence must include away plan summary.");
  assertGuard(baselineInfluence.matchEffectSummary.length > 0, "baseline influence must include match effect summary.");
  assertGuard(planDiagnosisSummary(baselineReport).length > 0, "baseline report must include plan diagnosis summary.");
  assertGuard(baselineSignature === repeatedBaselineSignature, "baseline tactical plan influence must remain deterministic.");
  assertGuard(
    baselineSignature !== influencedSignature || baselineTags.join("|") !== influencedTags.join("|"),
    "changing meaningful TacticalPlan fields must change the report signature or plan influence tags.",
  );
  assertGuard(
    influencedTags.includes("plan_home_tempo_fast"),
    "fast home tempo must produce plan_home_tempo_fast tag.",
  );
  assertGuard(
    influencedTags.includes("plan_home_risk_high"),
    "high home risk must produce plan_home_risk_high tag.",
  );
  assertGuard(
    influencedTags.includes("plan_home_pressing_high"),
    "high home pressing must produce plan_home_pressing_high tag.",
  );
  assertGuard(
    baselineInfluence.homeSummary !== influencedInfluence.homeSummary || baselineTags.join("|") !== influencedTags.join("|"),
    "changing home plan must change at least one plan summary or plan tag set.",
  );
  assertGuard(
    planDiagnosisSummary(influencedReport).includes("tempo rapide") || planDiagnosisSummary(influencedReport).includes("risque élevé"),
    "influenced report must include readable aggressive plan summary text.",
  );

  return [
    "tactical plan influence is deterministic for the same input",
    "tactical plan influence produces explicit plan tags",
    "tactical plan influence produces readable summaries",
    "changing tempo/risk/pressing changes report output or plan tags",
  ];
}

if (require.main === module) {
  const checks = validateTacticalPlanInfluence();

  console.log("Tactical plan influence guard passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
