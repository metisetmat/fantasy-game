# Fantasy Game Engine

Fantasy Game is a TypeScript tactical simulation engine focused on readable tactical emergence rather than real-time physics.

The current prototype is console-first and report-driven. It simulates abstract tactical moments, produces coach-readable reports, and validates behavior through TypeScript checks, contract guards, and generated share packs.

## Current Baseline

- Sprint baseline: `Sprint 2N - Segment Diversity + Fatigue Propagation + Key Moment Diversity`
- Runtime: Node.js + TypeScript
- Source code: `src/`
- Gameplay/design docs: `docs/`
- Current review pack: `reports/share/`

## Common Commands

```bash
npm test
npm run build
npm run test:contracts
npm run reports:coach
npm run reports:share
```

## GitHub Workflow

For normal development:

```bash
git checkout -b codex/sprint-name
npm test
npm run build
npm run test:contracts
git add .
git commit -m "Describe the sprint"
```

The generated `dist/` directory and most generated reports are ignored. The compact `reports/share/` pack is intentionally kept for review.
