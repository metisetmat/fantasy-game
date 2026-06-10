import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { SnapshotReference } from "../visualization";

type CleanupStatus = "PASS" | "FAIL";

interface CleanupCheck {
  readonly label: string;
  readonly status: CleanupStatus;
  readonly detail: string;
}

export interface ReceiverAvailabilityCleanupResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly CleanupCheck[];
}

function playerInitials(input: {
  readonly snapshots: readonly SnapshotReference[];
  readonly sequenceNumber: number;
  readonly actionNumber: number;
  readonly frame: "before" | "after";
}): string {
  const snapshot = input.snapshots.find(
    (candidate) => candidate.sequenceNumber === input.sequenceNumber && candidate.actionNumber === input.actionNumber,
  );
  const metadata = input.frame === "before" ? snapshot?.beforeMetadata : snapshot?.afterMetadata;
  return metadata?.playerStates.find((player) => player.hasBall)?.roleInitials ?? "missing";
}

function check(label: string, passed: boolean, detail: string): CleanupCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function containsTransferField(markdown: string, field: "previousCarrier" | "newCarrier", roleInitials: string): boolean {
  return markdown.includes(`- ${field}: ${roleInitials}`);
}

function containsWorkbenchTransferField(html: string, field: "previousCarrier" | "newCarrier", roleInitials: string): boolean {
  return (
    html.includes(`<dt>${field}</dt>`) &&
    (html.includes(`<dd>${roleInitials}</dd>`) || html.includes(`<dd>${roleInitials}@`))
  );
}

function renderMarkdown(input: {
  readonly checks: readonly CleanupCheck[];
  readonly staleMatches: readonly string[];
}): string {
  return [
    "# receiver availability cleanup",
    "",
    "This validation keeps legacy geometric receiver availability out of coach-facing reports after the Sequence 1 Action 1 reception-quality calibration.",
    "",
    "## Checks",
    "",
    "| Check | Status | Detail |",
    "| --- | --- | --- |",
    ...input.checks.map((item) => `| ${item.label} | ${item.status} | ${item.detail.replace(/\|/g, "/")} |`),
    "",
    "## Stale Match Scan",
    "",
    ...(input.staleMatches.length === 0
      ? ["- no stale receiver-availability phrases found in latest-mini-match.md"]
      : input.staleMatches.map((match) => `- ${match}`)),
    "",
  ].join("\n");
}

export function validateReceiverAvailabilityCleanup(input: {
  readonly reportMarkdown: string;
  readonly snapshots: readonly SnapshotReference[];
  readonly reportDirectory: string;
}): ReceiverAvailabilityCleanupResult {
  const workbenchPath = join(input.reportDirectory, "workbench", "sequence-1-action-1.html");
  const workbenchHtml = existsSync(workbenchPath) ? readFileSync(workbenchPath, "utf8") : "";
  const stalePatterns = [
    /\bbest free receiver\b/i,
    /\bfree receivers\b/i,
    /\bavailable receivers:/i,
    /\breceiver availability:/i,
    /tempo_half.*free receiver/i,
    /free receiver.*tempo_half/i,
  ] as const;
  const staleMatches = stalePatterns
    .flatMap((pattern) => input.reportMarkdown.match(pattern) ?? [])
    .filter((match, index, matches) => matches.indexOf(match) === index);
  const beforeCarrier = playerInitials({
    snapshots: input.snapshots,
    sequenceNumber: 1,
    actionNumber: 1,
    frame: "before",
  });
  const afterCarrier = playerInitials({
    snapshots: input.snapshots,
    sequenceNumber: 1,
    actionNumber: 1,
    frame: "after",
  });
  const checks: readonly CleanupCheck[] = [
    check(
      "no stale coach-facing receiver availability lines",
      staleMatches.length === 0,
      staleMatches.length === 0 ? "latest-mini-match.md contains no old free/available receiver phrases" : staleMatches.join(", "),
    ),
    check(
      "no tempo_half free receiver self-target text",
      !/tempo_half.*free receiver|free receiver.*tempo_half/i.test(input.reportMarkdown),
      "tempo_half is not described as a free receiver for his own pass/recycle",
    ),
    check(
      "Reception Quality section present",
      input.reportMarkdown.includes("### Reception Quality"),
      "latest-mini-match.md includes coach-facing reception-quality tables",
    ),
    check(
      "Ball Transfer Result section present",
      input.reportMarkdown.includes("### Ball Transfer Result"),
      "latest-mini-match.md includes explicit previous/new carrier transfer truth",
    ),
    check(
      "Sequence 1 Action 1 previous carrier is TH",
      beforeCarrier === "TH" && containsTransferField(input.reportMarkdown, "previousCarrier", "TH"),
      `before snapshot carrier ${beforeCarrier}`,
    ),
    check(
      "Sequence 1 Action 1 new carrier is ML",
      afterCarrier === "ML" && containsTransferField(input.reportMarkdown, "newCarrier", "ML"),
      `after snapshot carrier ${afterCarrier}`,
    ),
    check(
      "workbench and report agree on new carrier ML",
      containsWorkbenchTransferField(workbenchHtml, "newCarrier", "ML") &&
        containsTransferField(input.reportMarkdown, "newCarrier", "ML"),
      "workbench and latest-mini-match.md both expose newCarrier: ML",
    ),
  ];
  const reportPath = join(input.reportDirectory, "receiver-availability-cleanup.md");
  const valid = checks.every((item) => item.status === "PASS");

  writeFileSync(reportPath, renderMarkdown({ checks, staleMatches }), "utf8");

  return {
    valid,
    reportPath,
    checks,
  };
}
