import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { TacticalStyle } from "../../models/tactics";
import { chainPath, evaluateReceptionChains, type ReceptionChain } from "../../systems/tactics";
import type { SnapshotReference } from "../visualization";

type CalibrationStatus = "PASS" | "FAIL";

interface CalibrationCheck {
  readonly label: string;
  readonly status: CalibrationStatus;
  readonly detail: string;
}

export interface ReceptionChainCalibrationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly CalibrationCheck[];
}

function check(label: string, passed: boolean, detail: string): CalibrationCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function findChain(chains: readonly ReceptionChain[], path: string): ReceptionChain | null {
  return chains.find((chain) => chainPath(chain) === path) ?? null;
}

function formatChain(chain: ReceptionChain): string {
  return `${chainPath(chain)} direct ${chain.directValue}, chain ${chain.chainValue}, risk ${chain.totalRisk}, style ${chain.styleFit}, effectiveChainQuality ${chain.effectiveChainQuality}, chain timing ${chain.chainTiming.openingTick}-${chain.chainTiming.closingTick}`;
}

function renderMarkdown(input: {
  readonly checks: readonly CalibrationCheck[];
  readonly controlChains: readonly ReceptionChain[];
  readonly blitzChains: readonly ReceptionChain[];
}): string {
  const controlRows = input.controlChains
    .slice(0, 10)
    .map((chain) => `- ${formatChain(chain)}. ${chain.narrativeSummary}`);
  const blitzRows = input.blitzChains
    .slice(0, 10)
    .map((chain) => `- ${formatChain(chain)}. ${chain.narrativeSummary}`);

  return [
    "# reception-chain calibration",
    "",
    "Sequence 1 Action 1 calibration for collective reception intelligence.",
    "",
    "## Checks",
    "",
    "| Check | Status | Detail |",
    "| --- | --- | --- |",
    ...input.checks.map((item) => `| ${item.label} | ${item.status} | ${item.detail.replace(/\|/g, "/")} |`),
    "",
    "## CONTROL Chains",
    "",
    ...controlRows,
    "",
    "## BLITZ Style Comparison",
    "",
    ...blitzRows,
    "",
  ].join("\n");
}

export function validateReceptionChainCalibration(input: {
  readonly reportMarkdown: string;
  readonly snapshots: readonly SnapshotReference[];
  readonly reportDirectory: string;
}): ReceptionChainCalibrationResult {
  const snapshot = input.snapshots.find((candidate) => candidate.sequenceNumber === 1 && candidate.actionNumber === 1);
  const controlChains =
    snapshot === undefined
      ? []
      : evaluateReceptionChains({
          players: snapshot.beforeMetadata.playerStates,
          possessionTeamId: snapshot.beforeTruthContract.possessionTeamId,
          ballCarrierId: snapshot.beforeTruthContract.ballCarrierId,
          attackingDirection: snapshot.attackingDirection,
          teamStyle: TacticalStyle.Control,
          maxDepth: 3,
        });
  const blitzChains =
    snapshot === undefined
      ? []
      : evaluateReceptionChains({
          players: snapshot.beforeMetadata.playerStates,
          possessionTeamId: snapshot.beforeTruthContract.possessionTeamId,
          ballCarrierId: snapshot.beforeTruthContract.ballCarrierId,
          attackingDirection: snapshot.attackingDirection,
          teamStyle: TacticalStyle.Blitz,
          maxDepth: 3,
        });
  const flSh = findChain(controlChains, "TH -> FL -> SH");
  const pmRp = findChain(controlChains, "TH -> PM -> RP");
  const blitzSh = findChain(blitzChains, "TH -> FL -> SH") ?? findChain(blitzChains, "TH -> SH");
  const controlRecycle = findChain(controlChains, "TH -> ML") ?? findChain(controlChains, "TH -> PV");
  const checks: readonly CalibrationCheck[] = [
    check("chain generation exists", controlChains.length > 0, `${controlChains.length} chains generated`),
    check("chain scoring exists", controlChains.some((chain) => chain.chainValue > 0), "chainValue is populated"),
    check(
      "third-man continuation increases value",
      flSh !== null && flSh.chainValue > flSh.directValue,
      flSh === null ? "TH -> FL -> SH missing" : formatChain(flSh),
    ),
    check(
      "CONTROL values collective chains",
      flSh !== null && controlRecycle !== null && flSh.chainValue >= controlRecycle.chainValue - 10,
      flSh === null || controlRecycle === null
        ? "missing comparison chains"
        : `${formatChain(flSh)} compared with ${formatChain(controlRecycle)}`,
    ),
    check(
      "BLITZ values direct rupture more",
      blitzSh !== null && (flSh === null || blitzSh.styleFit >= flSh.styleFit),
      blitzSh === null ? "BLITZ rupture chain missing" : formatChain(blitzSh),
    ),
    check("TH -> FL -> SH evaluated", flSh !== null, flSh === null ? "missing" : formatChain(flSh)),
    check("TH -> PM -> RP evaluated", pmRp !== null, pmRp === null ? "missing" : formatChain(pmRp)),
    check(
      "chain timing windows exist",
      controlChains.every((chain) => chain.chainTiming.closingTick >= chain.chainTiming.openingTick),
      "all chains expose opening/closing tick and viability",
    ),
    check(
      "effectiveChainQuality exists",
      input.reportMarkdown.includes("effectiveChainQuality"),
      "latest-mini-match.md reports effectiveChainQuality",
    ),
    check(
      "ranked options include chain values",
      input.reportMarkdown.includes("Chain-Aware Ranked Options") &&
        input.reportMarkdown.includes("Direct value") &&
        input.reportMarkdown.includes("Chain value"),
      "report includes chain-aware option table",
    ),
    check(
      "narratives mention collective progression",
      input.reportMarkdown.includes("collective progression"),
      "report explains collective progression rather than isolated receptions",
    ),
  ];
  const reportPath = join(input.reportDirectory, "reception-chain-calibration.md");
  const valid = checks.every((item) => item.status === "PASS");

  writeFileSync(reportPath, renderMarkdown({ checks, controlChains, blitzChains }), "utf8");

  return {
    valid,
    reportPath,
    checks,
  };
}
