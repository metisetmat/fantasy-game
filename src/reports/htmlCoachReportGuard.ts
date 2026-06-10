import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { containsMojibake } from "./coachCopyQuality";
import { assertNoTechnicalContextLeak } from "./coachFacingSummary";
import { renderHtmlCoachReport } from "./htmlCoachReport";

function assertGuard(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function visibleHtml(html: string): string {
  return html.replace(/<details[\s\S]*?<\/details>/g, "");
}

export function validateHtmlCoachReportRenderer(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture);
  const html = renderHtmlCoachReport(report);
  const visible = visibleHtml(html);
  const firstInsight = report.coachInsights[0];
  const firstKeyMoment = report.keyMoments[0];
  const uniqueKeyMomentTitles = new Set(report.keyMoments.map((moment) => moment.title));
  const hasStructuredWarnings = report.warnings.length > 0;
  const conditionDecreased = report.fatigueReport.playerSummaries.some((summary) => summary.conditionEnd < summary.conditionStart);
  const hasHarnessWarning = report.tacticalReport.diagnoses.some((diagnosis) => diagnosis.title === "Avertissement de harnais full-match");
  const hasDominanceWarning = report.tacticalReport.diagnoses.some((diagnosis) => diagnosis.title === "Domination scoring single-run à surveiller");

  assertGuard(html.includes("<html"), "rendered coach report must include an html document root.");
  assertGuard(!containsMojibake(html), "rendered coach report must not contain mojibake markers.");
  assertGuard(html.includes("Rapport du coach"), "rendered coach report must include the French report title.");
  assertGuard(html.includes("Résumé"), "rendered coach report must include the French summary section.");
  assertGuard(html.includes("Moments clés"), "rendered coach report must include the French key moments section.");
  assertGuard(html.includes("Généré depuis le rapport de match typé."), "rendered coach report must include clean generated-from copy.");
  assertGuard(html.includes("Analyse du coach"), "rendered coach report must include the French coach insight section.");
  assertGuard(html.includes("Repères internes"), "rendered coach report must label internal tags in French.");
  assertGuard(html.includes("Action décisive"), "rendered coach report must display timeline event types in French.");
  assertGuard(html.includes("Séquence dangereuse"), "rendered coach report must include clean dangerous-sequence copy.");
  assertGuard(html.includes("Équipe"), "rendered coach report must include clean team label copy.");
  assertGuard(html.includes("Événement"), "rendered coach report must include clean event label copy.");
  assertGuard(html.includes("Plan de match observé"), "rendered coach report must include observed match plan diagnosis.");
  assertGuard(
    html.includes("tempo rapide") || html.includes("risque élevé"),
    "rendered coach report must include readable BLITZ tactical-plan summary text.",
  );
  assertGuard(html.includes(`${report.score.home} - ${report.score.away}`), "rendered coach report must include the final score.");
  assertGuard(html.includes("Afficher les"), "rendered coach report must keep the expandable timeline control.");

  if (hasHarnessWarning) {
    assertGuard(html.includes("Avertissement de harnais full-match"), "rendered coach report must include the full-match harness warning when warnings exist.");
    assertGuard(html.includes("Ce run déterministe unique révèle"), "rendered coach report must describe harness warnings in French coach-facing copy.");
    assertGuard(!html.includes("Harness warning:"), "rendered coach report must not expose raw English harness warning copy.");
  }

  if (hasDominanceWarning) {
    assertGuard(html.includes("Domination scoring single-run à surveiller"), "rendered coach report must include scoring dominance warning when the score is lopsided.");
    assertGuard(html.includes("CONTROL a converti"), "rendered coach report must explain the scoring dominance in French.");
    assertGuard(html.includes("économie du score"), "rendered coach report must preserve the scoring-economy warning context.");
  }

  if (hasStructuredWarnings) {
    assertGuard(html.includes("Avertissements structur"), "rendered coach report must include the structured warnings section.");
    assertGuard(html.includes("techniques") && html.includes("Type :"), "rendered coach report must keep technical warning context inside details.");
    assertGuard(html.includes("Faits d'"), "rendered coach report must link structured warnings to evidence facts.");
  }

  assertGuard(html.includes("Condition finale"), "rendered coach report must include fatigue values.");
  assertGuard(conditionDecreased, "full-match report must show at least one player condition decrease.");
  assertGuard(report.timeline.length >= 30, `HTML guard report should use the full-match harness, received ${report.timeline.length} events.`);

  if (report.keyMoments.length > 1) {
    assertGuard(uniqueKeyMomentTitles.size >= 2, "key moments should not all have identical titles when non-scoring candidates exist.");
  }

  assertGuard(
    report.keyMoments.every((moment) => report.keyMoments.filter((candidate) => candidate.title === moment.title).length <= 2),
    "key moment titles should not repeat more than twice when alternatives exist.",
  );

  if (firstInsight !== undefined) {
    assertGuard(html.includes(firstInsight.title), `rendered coach report must include insight title ${firstInsight.title}.`);
  }

  if (firstKeyMoment !== undefined) {
    assertGuard(html.includes(firstKeyMoment.title), `rendered coach report must include key moment title ${firstKeyMoment.title}.`);
  }

  assertGuard(!html.includes("[object Object]"), "rendered coach report must not leak object stringification.");
  assertGuard(!html.includes(">Coach Report<"), "rendered coach report must not use the old top-level English title.");
  assertGuard(!html.includes(">Tags:"), "rendered coach report must not expose the old raw Tags label.");
  assertGuard(!html.includes("adapter-visible tactical sequence"), "rendered coach report must not expose old English adapter fallback copy.");
  assertGuard(!html.includes("<strong>1' scoring</strong>"), "rendered coach report must not expose raw scoring event type labels.");
  assertGuard(!html.includes("mini-match"), "rendered coach report must not expose mini-match wording.");
  assertGuard(!html.includes("adapter de simulation actuel"), "rendered coach report must not expose old adapter limitation wording.");
  assertGuard(!html.includes("visible par l'adapter"), "rendered coach report must not expose old adapter visibility wording.");
  assertGuard(!html.includes("Ãƒ"), "rendered coach report must not contain double-encoded UTF-8 fragments.");
  assertGuard(!html.includes("Ã‚"), "rendered coach report must not contain stray mojibake markers.");
  assertGuard(!html.includes("Ã¢â‚¬"), "rendered coach report must not contain mojibake punctuation.");
  assertGuard(!html.includes("global scoring incoherence"), "rendered coach report must not claim global scoring incoherence from one run.");
  assertGuard(!html.includes("change scoring values"), "rendered coach report must not recommend scoring value changes from one run.");
  assertNoTechnicalContextLeak(visible, "visible coach HTML");

  return [
    "HTML coach report includes document root",
    "HTML coach report contains no mojibake markers",
    "HTML coach report includes French report title",
    "HTML coach report includes clean French summary, generated-from, key moments, and coach analysis sections",
    "HTML coach report uses French timeline labels",
    "HTML coach report includes observed match plan summary",
    "HTML coach report includes final score",
    "HTML coach report uses full-match event volume",
    "HTML coach report keeps expandable timeline control",
    "HTML coach report includes full-match harness warning",
    "HTML coach report includes structured MatchReport warnings when available",
    "HTML coach report includes scoring dominance warning when lopsided",
    "HTML coach report uses coach-facing harness warning wording",
    "HTML coach report includes fatigue values",
    "HTML coach report shows condition decrease",
    "HTML coach report key moments are not all identical when alternatives exist",
    "HTML coach report key moment titles repeat no more than twice",
    "HTML coach report includes at least one coach insight title when available",
    "HTML coach report includes at least one key moment title when available",
    "HTML coach report does not contain [object Object]",
    "HTML coach report does not contain old top-level English title",
    "HTML coach report does not expose old raw internal labels",
    "HTML coach report does not expose old technical product wording",
    "HTML coach report keeps raw harness enum wording inside technical warning details only",
    "HTML coach report does not claim global scoring incoherence",
    "HTML coach report does not recommend scoring value changes",
    "HTML visible copy contains no technical context leaks",
  ];
}

if (require.main === module) {
  const checks = validateHtmlCoachReportRenderer();

  console.log("HTML coach report guard passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
