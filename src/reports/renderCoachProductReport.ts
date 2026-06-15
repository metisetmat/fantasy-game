import type {
  CoachProductReportAppendix,
  CoachProductReportProfile,
  CoachProductReportSignal,
  CoachProductReportViewModel,
} from "./coachProductReportView";
import { escapeHtml } from "./htmlCoachReport";

function renderList(items: readonly string[]): string {
  if (items.length === 0) {
    return "<p class=\"empty\">Aucun signal disponible.</p>";
  }

  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderBadge(label: string): string {
  return `<span class="badge">${escapeHtml(label)}</span>`;
}

function renderSignal(signal: CoachProductReportSignal): string {
  return `
    <article class="product-card">
      <div class="badge-row">
        ${renderBadge(`Source : ${signal.sourceLabel}`)}
        ${renderBadge(`Confiance ${signal.confidenceLabel}`)}
      </div>
      <h3>${escapeHtml(signal.title)}</h3>
      <p>${escapeHtml(signal.summary)}</p>
      <p><strong>Ce que cela signifie pour le coach :</strong> ${escapeHtml(signal.coachMeaning)}</p>
      <div class="compact-list">
        <strong>Preuves lisibles :</strong>
        ${renderList(signal.evidenceSummary)}
      </div>
    </article>`;
}

function renderProfile(profile: CoachProductReportProfile): string {
  return `
    <article class="product-card profile-card">
      <h3>${escapeHtml(profile.title)}</h3>
      <p><strong>Famille de rôle :</strong> ${escapeHtml(profile.roleFamilies.join(", "))}</p>
      <p><strong>Attributs utiles :</strong> ${escapeHtml(profile.usefulAttributes.join(", "))}</p>
      <div class="product-grid">
        <section>
          <h4>Pourquoi l’observer</h4>
          ${renderList(profile.whyObserve)}
        </section>
        <section>
          <h4>Ce que les traces soutiennent</h4>
          ${renderList(profile.traceSupport)}
        </section>
        <section>
          <h4>Bénéfice attendu</h4>
          ${renderList(profile.expectedBenefit)}
        </section>
        <section>
          <h4>Risque tactique</h4>
          ${renderList(profile.tacticalRisk)}
        </section>
      </div>
      <section>
        <h4>Signal à vérifier au prochain match</h4>
        ${renderList(profile.nextMatchSignal)}
      </section>
      <p class="guard">${escapeHtml(profile.nonAppliedLabel)} — ${escapeHtml(profile.confirmationLabel.toLocaleLowerCase("fr-FR"))}.</p>
    </article>`;
}

function renderAppendix(appendix: CoachProductReportAppendix, tags: readonly string[]): string {
  const detail = appendix.contentKind === "technical"
    ? tags.slice(0, 40)
    : [
      appendix.summary,
      "Ce contenu reste séparé du corps principal pour préserver une lecture coach claire.",
    ];

  return `
    <details class="appendix">
      <summary>${escapeHtml(appendix.title)}</summary>
      <p>${escapeHtml(appendix.summary)}</p>
      ${renderList(detail)}
    </details>`;
}

export function renderCoachProductReport(model: CoachProductReportViewModel): string {
  const statusNote = model.status === "available"
    ? "Rapport produit disponible."
    : "Rapport produit non disponible pour ce run.";

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rapport coach produit</title>
  <style>
    :root { color-scheme: light; --ink: #172033; --muted: #5f6c7b; --line: #d9e2ec; --soft: #f6f8fb; --accent: #1f6f8b; }
    body { margin: 0; font-family: Inter, "Segoe UI", Arial, sans-serif; color: var(--ink); background: #fff; line-height: 1.5; }
    main { max-width: 1040px; margin: 0 auto; padding: 32px 20px 56px; }
    header { border-bottom: 1px solid var(--line); padding-bottom: 20px; margin-bottom: 28px; }
    h1 { margin: 0 0 8px; font-size: 2rem; }
    h2 { margin: 32px 0 12px; font-size: 1.35rem; }
    h3 { margin: 0 0 8px; font-size: 1.05rem; }
    h4 { margin: 12px 0 6px; font-size: .95rem; }
    .score { font-size: 1.35rem; font-weight: 700; }
    .muted { color: var(--muted); }
    .product-card { border: 1px solid var(--line); border-radius: 8px; padding: 16px; margin: 12px 0; background: #fff; }
    .summary-list { background: var(--soft); border-radius: 8px; padding: 16px 18px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }
    .product-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
    .badge-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
    .badge { display: inline-block; border: 1px solid var(--line); border-radius: 999px; padding: 2px 9px; font-size: .82rem; color: var(--accent); background: #f8fbfd; }
    .guard { border-left: 3px solid var(--accent); padding-left: 10px; color: var(--muted); }
    .appendix { border: 1px solid var(--line); border-radius: 8px; padding: 12px 14px; margin: 10px 0; background: var(--soft); }
    .appendix summary { cursor: pointer; font-weight: 700; }
    .empty { color: var(--muted); }
  </style>
</head>
<body>
<main id="product-main">
  <header>
    <p class="muted">${escapeHtml(statusNote)}</p>
    <h1>Rapport coach</h1>
    <p><strong>Match :</strong> ${escapeHtml(model.matchId)}</p>
    <p class="score">${escapeHtml(model.scoreLabel)}</p>
    <p><strong>Score du rapport full-match</strong></p>
    <p class="muted">${escapeHtml(model.scoreSourceNote)}</p>
  </header>

  <section id="executive-summary">
    <h2>Résumé coach</h2>
    <div class="summary-list">${renderList(model.executiveSummary.slice(0, 4))}</div>
  </section>

  <section id="official-match-reading">
    <h2>Ce que le match dit</h2>
    <div class="badge-row">${renderBadge("Source : Officiel")}</div>
    ${renderList(model.officialMatchReading)}
  </section>

  <section id="key-coach-signals">
    <h2>3 signaux clés</h2>
    <div class="cards">${model.keyCoachSignals.map(renderSignal).join("")}</div>
  </section>

  <section id="profiles-to-observe">
    <h2>Profils à observer</h2>
    <p class="muted">Ces profils aident à regarder le prochain match. Ils ne sont pas appliqués et ne deviennent pas des recommandations officielles.</p>
    ${model.profilesToObserve.map(renderProfile).join("")}
  </section>

  <section id="next-match-signals">
    <h2>À vérifier au prochain match</h2>
    ${renderList(model.nextMatchSignals.slice(0, 5))}
  </section>

  <section id="appendices">
    <h2>Annexes</h2>
    <p class="muted">Les annexes gardent les hypothèses, la traçabilité et les validations hors de la lecture principale.</p>
    ${model.appendices.map((appendix) => renderAppendix(appendix, model.tags)).join("")}
  </section>
</main>
</body>
</html>`;
}
