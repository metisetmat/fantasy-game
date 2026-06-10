import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type ConsistencyStatus = "PASS" | "FAIL";

interface ConsistencyCheck {
  readonly label: string;
  readonly status: ConsistencyStatus;
  readonly detail: string;
}

export interface PostResolutionConsistencyResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly ConsistencyCheck[];
}

function check(label: string, passed: boolean, detail: string): ConsistencyCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function unlabelledLegacyLines(text: string, token: string): readonly string[] {
  return text
    .split("\n")
    .filter((line) => line.includes(token))
    .filter((line) => !line.includes("DEBUG_FULL") && !line.includes("pre-resolution"));
}

function countUnlabelledLegacyZones(text: string): number {
  return ["FL@Z5-C", "SH@Z5-CR", "ML@Z3-C"].reduce(
    (total, token) => total + unlabelledLegacyLines(text, token).length,
    0,
  );
}

function sectionText(input: { readonly markdown: string; readonly heading: string }): string {
  const start = input.markdown.indexOf(input.heading);

  if (start < 0) {
    return "";
  }

  const nextHeading = input.markdown.indexOf("\n### ", start + input.heading.length);
  return nextHeading < 0 ? input.markdown.slice(start) : input.markdown.slice(start, nextHeading);
}

function renderMarkdown(input: { readonly checks: readonly ConsistencyCheck[] }): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Post-Resolution Consistency",
    "",
    `Status: ${status}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
    "## Required Counts",
    "",
    ...input.checks.map((item) => `- ${item.label}`),
    "",
  ].join("\n");
}

export function validatePostResolutionConsistency(input: {
  readonly reportMarkdown: string;
  readonly reportDirectory: string;
}): PostResolutionConsistencyResult {
  const workbenchPath = join(input.reportDirectory, "workbench", "sequence-1-action-1.html");
  const workbenchHtml = existsSync(workbenchPath) ? readFileSync(workbenchPath, "utf8") : "";
  const combinedCoachText = `${input.reportMarkdown}\n${workbenchHtml}`;
  const rankedOptions = `${sectionText({ markdown: input.reportMarkdown, heading: "### Chain-Aware Ranked Options" })}\n${sectionText({ markdown: workbenchHtml, heading: "Ranked Options" })}`;
  const receptionQuality = `${sectionText({ markdown: input.reportMarkdown, heading: "### Reception Quality" })}\n${sectionText({ markdown: workbenchHtml, heading: "Reception Follow-Up" })}`;
  const ballTransfer = `${sectionText({ markdown: input.reportMarkdown, heading: "### Ball Transfer Result" })}\n${sectionText({ markdown: workbenchHtml, heading: "Ball Transfer Result" })}`;
  const receiverMismatchCount = [
    "receiver: TH at Z3-C",
    "receiver</dt><dd>TH at Z3-C",
    "new carrier: ML at Z3-C",
  ].reduce((total, token) => total + (combinedCoachText.includes(token) ? 1 : 0), 0);
  const gkThirdManMisuseCount =
    /TH -> FL -> GK[\s\S]{0,240}VALID_THIRD_MAN_PROGRESSION/.test(combinedCoachText) ||
    /TH -&gt; FL -&gt; GK[\s\S]{0,240}THIRD_MAN_PROGRESSION/.test(combinedCoachText)
      ? 1
      : 0;
  const rankedStale = countUnlabelledLegacyZones(rankedOptions);
  const receptionStale = countUnlabelledLegacyZones(receptionQuality);
  const transferStale = countUnlabelledLegacyZones(ballTransfer) + receiverMismatchCount;
  const allStale = countUnlabelledLegacyZones(combinedCoachText);
  const targetActualMismatchAllowed =
    combinedCoachText.includes("tactical target cluster: Z3-C") &&
    combinedCoachText.includes("actual ball zone after action: Z3-HSL");
  const worldStateMismatchCount = combinedCoachText.includes("world state ball zone after action: Z3-HSL") ? 0 : 1;
  const illegalSelectedTargetAsBallZoneCount =
    combinedCoachText.includes("selectedTargetZoneSemantics: TACTICAL_TARGET_CLUSTER") &&
    combinedCoachText.includes("actual ball zone after action: Z3-HSL")
      ? 0
      : 1;
  const carrierActualMismatchCount =
    combinedCoachText.includes("newCarrier: ML at Z3-HSL") &&
    combinedCoachText.includes("actual ball zone after action: Z3-HSL")
      ? 0
      : 1;
  const candidateExecutedMismatchCount =
    (input.reportMarkdown.match(/candidate\/executed consistency: FAIL/g) ?? []).length;
  const checks: readonly ConsistencyCheck[] = [
    check("workbench exists", workbenchHtml.length > 0, workbenchPath),
    check("latest-mini-match exists", input.reportMarkdown.length > 0, "report markdown available to validator"),
    check("ranked options stale zone count = 0", rankedStale === 0, `${rankedStale}`),
    check("reception quality stale zone count = 0", receptionStale === 0, `${receptionStale}`),
    check("ball transfer stale zone count = 0", transferStale === 0, `${transferStale}`),
    check("receiver/new carrier mismatch count = 0", receiverMismatchCount === 0, `${receiverMismatchCount}`),
    check(
      "third-man classification displayed for all chains",
      input.reportMarkdown.includes("strictThirdManStatus") && workbenchHtml.includes("Strict Third-Man Logic"),
      "strict-third-man status/reason visible in report and workbench",
    ),
    check("GK third-man misuse count = 0", gkThirdManMisuseCount === 0, `${gkThirdManMisuseCount}`),
    check(
      "legacy pre-resolution traces are hidden or labelled DEBUG_FULL",
      allStale === 0,
      `${allStale} unlabelled stale coach-facing lines`,
    ),
    check(
      "tacticalTargetCluster / actualBallZone mismatch count = 1 allowed",
      targetActualMismatchAllowed,
      targetActualMismatchAllowed ? "1 allowed divergence" : "0 allowed divergence detected",
    ),
    check(
      "allowed target/ball divergence count = 1",
      targetActualMismatchAllowed,
      targetActualMismatchAllowed ? "1" : "0",
    ),
    check(
      "illegal selectedTargetZone-as-ballZone count = 0",
      illegalSelectedTargetAsBallZoneCount === 0,
      `${illegalSelectedTargetAsBallZoneCount}`,
    ),
    check("worldStateBallZone mismatch count = 0", worldStateMismatchCount === 0, `${worldStateMismatchCount}`),
    check(
      "carrierResolvedZone / actualBallZone mismatch count = 0",
      carrierActualMismatchCount === 0,
      `${carrierActualMismatchCount}`,
    ),
    check(
      "candidate/executed semantic mismatch count = 0",
      candidateExecutedMismatchCount === 0,
      `${candidateExecutedMismatchCount}`,
    ),
  ];
  const reportPath = join(input.reportDirectory, "post-resolution-consistency.md");
  const valid = checks.every((item) => item.status === "PASS");

  writeFileSync(reportPath, renderMarkdown({ checks }), "utf8");

  return {
    valid,
    reportPath,
    checks,
  };
}
