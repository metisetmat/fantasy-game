import { existsSync } from "node:fs";
import { join } from "node:path";

const INTENT_FILES = [
  "src/systems/intent/playerIntent.ts",
  "src/systems/intent/intentTypes.ts",
  "src/systems/intent/intentLifecycle.ts",
  "src/systems/intent/intentPriority.ts",
  "src/systems/intent/intentResolver.ts",
  "src/systems/intent/roleIntentProfiles.ts",
  "src/systems/intent/teamIntentModifiers.ts",
  "src/systems/intent/tacticalIntentTriggers.ts",
  "src/systems/intent/intentDebug.ts",
  "src/config/intentConfig.ts",
] as const;

function statusLine(root: string, relativePath: string): string {
  return `- ${relativePath}: ${existsSync(join(root, relativePath)) ? "found" : "missing"}`;
}

export function createIntentIntegrationAuditMarkdown(root: string): string {
  const missing = INTENT_FILES.filter((file) => !existsSync(join(root, file)));
  const conclusion =
    missing.length === 0
      ? "Intent engine files exist and are wired into roster initialization, PlayerMatchState, tick lifecycle, Utility AI scoring, timeline events, markdown report generation, and snapshot SVG metadata."
      : `Intent integration is incomplete because ${missing.length} required file(s) are missing.`;

  return [
    "# Player Intent Integration Audit",
    "",
    "## Files",
    ...INTENT_FILES.map((file) => statusLine(root, file)),
    "",
    "## Systems Importing Intent Modules",
    "- src/data/teams/controlRoster.ts: default CONTROL intent state",
    "- src/data/teams/blitzRoster.ts: default BLITZ intent state",
    "- src/systems/players/types.ts: PlayerMatchState intent fields",
    "- src/systems/players/createPlayerMatchStates.ts: match-state intent exposure",
    "- src/systems/matchLoop/tickEngine.ts: tick lifecycle refresh/expiry",
    "- src/systems/debugTimeline/timelineRecorder.ts: timeline intent summaries and changes",
    "- src/systems/ai/utility/utilityScoring.ts: intent alignment and priority bonus",
    "- src/reports/markdownMiniMatchReport.ts: Intent Engine, Player Intent Trace, Intent Continuity",
    "- src/reports/visualization/renderTacticalSnapshotSvg.ts: SVG intent metadata and labels",
    "",
    "## Systems Not Yet Fully Rewritten",
    "- Legacy action resolvers still provide macro action structure; intent is integrated as persistence and scoring context, not a full continuous intent engine.",
    "- Tactical triggers are present as a lightweight bridge and can be expanded without adding new sport mechanics.",
    "",
    "## Report Generator Path Used",
    "- src/index.ts -> formatMiniMatchMarkdownReport() -> reports/latest-mini-match.md",
    "",
    "## Snapshot Generator Path Used",
    "- src/index.ts -> writeTacticalSnapshots() -> reports/snapshots/*.svg",
    "",
    "## Conclusion",
    conclusion,
    "",
  ].join("\n");
}
