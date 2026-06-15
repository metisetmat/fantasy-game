import type {
  CoachProductReportAppendix,
  CoachProductReportProfile,
  CoachProductReportSignal,
  CoachProductReportViewModel,
} from "./coachProductReportView";
import { buildCoachProductReportPolish } from "./buildCoachProductReportPolish";
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
    <article class="product-card signal-card">
      <div class="badge-row">
        ${renderBadge(`Source : ${signal.sourceLabel}`)}
        ${renderBadge(`Confiance ${signal.confidenceLabel}`)}
      </div>
      <p class="card-kicker">Signal</p>
      <h3>${escapeHtml(signal.title)}</h3>
      <div class="signal-grid">
        <section>
          <h4>Pourquoi c'est important</h4>
          <p>${escapeHtml(signal.coachMeaning)}</p>
        </section>
        <section>
          <h4>Preuve lisible</h4>
          ${renderList(signal.evidenceSummary.slice(0, 2))}
        </section>
        <section>
          <h4>À surveiller</h4>
          <p>${escapeHtml(signal.summary)}</p>
        </section>
      </div>
    </article>`;
}

function renderProfile(profile: CoachProductReportProfile): string {
  return `
    <article class="product-card profile-card">
      <h3>${escapeHtml(profile.title)}</h3>
      <div class="badge-row" aria-label="Famille de rôle">
        ${profile.roleFamilies.map(renderBadge).join("")}
      </div>
      <div class="badge-row attributes" aria-label="Attributs utiles">
        ${profile.usefulAttributes.map(renderBadge).join("")}
      </div>
      <div class="profile-grid">
        <section>
          <h4>Pourquoi l'observer</h4>
          ${renderList(profile.whyObserve)}
        </section>
        <section>
          <h4>Bénéfice attendu</h4>
          ${renderList(profile.expectedBenefit)}
        </section>
        <section>
          <h4>Risque à surveiller</h4>
          ${renderList(profile.tacticalRisk)}
        </section>
      </div>
      <p class="guard">${escapeHtml(profile.nonAppliedLabel)} — ${escapeHtml(profile.confirmationLabel)}.</p>
    </article>`;
}

function renderAppendix(appendix: CoachProductReportAppendix, tags: readonly string[]): string {
  const detail = appendix.contentKind === "technical"
    ? tags.slice(0, 48)
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
  const polish = buildCoachProductReportPolish({ productReportView: model });
  const technicalTags = [...model.tags, ...polish.tags];

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rapport coach produit</title>
  <style>
    :root { color-scheme: light; --ink: #172033; --muted: #5f6c7b; --line: #d9e2ec; --soft: #f6f8fb; --accent: #1f6f8b; --accent-soft: #e8f4f7; --paper: #ffffff; }
    body { margin: 0; font-family: Inter, "Segoe UI", Arial, sans-serif; color: var(--ink); background: #eef3f7; line-height: 1.5; }
    main { max-width: 1080px; margin: 0 auto; padding: 32px 20px 56px; }
    header { background: linear-gradient(135deg, #ffffff 0%, #edf7fa 100%); border: 1px solid var(--line); border-radius: 14px; padding: 26px; margin-bottom: 26px; box-shadow: 0 14px 40px rgba(23, 32, 51, .08); }
    h1 { margin: 0 0 12px; font-size: 2.2rem; line-height: 1.1; }
    h2 { margin: 34px 0 12px; font-size: 1.35rem; }
    h3 { margin: 0 0 10px; font-size: 1.05rem; }
    h4 { margin: 0 0 6px; font-size: .9rem; text-transform: uppercase; letter-spacing: .02em; color: var(--muted); }
    p { margin: 0 0 10px; }
    ul { margin: 8px 0 0; padding-left: 20px; }
    li + li { margin-top: 5px; }
    .header-grid { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 18px; align-items: end; }
    .header-meta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
    .score-box { min-width: 180px; padding: 16px; border-radius: 12px; background: var(--paper); border: 1px solid var(--line); text-align: right; }
    .score-label { color: var(--muted); font-size: .84rem; }
    .score { display: block; font-size: 1.65rem; font-weight: 800; margin-top: 4px; }
    .muted { color: var(--muted); }
    .product-section { margin-top: 24px; }
    .product-card { border: 1px solid var(--line); border-radius: 10px; padding: 18px; margin: 12px 0; background: var(--paper); box-shadow: 0 8px 26px rgba(23, 32, 51, .05); }
    .summary-list { background: var(--paper); border: 1px solid var(--line); border-radius: 10px; padding: 16px 18px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }
    .signal-grid, .profile-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; }
    .signal-grid section, .profile-grid section { background: var(--soft); border-radius: 8px; padding: 12px; }
    .badge-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
    .badge { display: inline-block; border: 1px solid var(--line); border-radius: 999px; padding: 3px 10px; font-size: .82rem; color: var(--accent); background: #f8fbfd; }
    .attributes .badge { color: #515f6f; background: #fbfcfd; }
    .card-kicker { color: var(--accent); font-size: .78rem; font-weight: 800; letter-spacing: .08em; margin-bottom: 4px; text-transform: uppercase; }
    .guard { border-left: 3px solid var(--accent); padding: 10px 0 10px 12px; color: var(--muted); background: var(--accent-soft); border-radius: 0 8px 8px 0; }
    .interpretation-guard { border: 1px solid var(--line); border-left: 4px solid var(--accent); border-radius: 10px; background: #fff; padding: 16px; }
    .appendix { border: 1px solid var(--line); border-radius: 8px; padding: 12px 14px; margin: 10px 0; background: var(--paper); }
    .appendix summary { cursor: pointer; font-weight: 700; }
    .empty { color: var(--muted); }
    @media (max-width: 720px) {
      .header-grid { grid-template-columns: 1fr; }
      .score-box { text-align: left; }
    }
    @media print {
      body { background: #fff; }
      main { max-width: none; padding: 0; }
      header, .product-card, .summary-list, .interpretation-guard, .appendix { box-shadow: none; }
      details[open], details { break-inside: avoid; }
      .product-card { break-inside: avoid; }
    }
  </style>
</head>
<body>
<main id="product-main">
  <header>
    <div class="header-grid">
      <div>
        <h1>Rapport coach — lecture produit</h1>
        <div class="header-meta">
          ${renderBadge(`Match : ${model.matchId}`)}
          ${renderBadge("Type : rapport produit")}
        </div>
        <p class="muted">${escapeHtml(model.scoreSourceNote)}</p>
      </div>
      <div class="score-box">
        <span class="score-label">Score du rapport full-match</span>
        <span class="score">${escapeHtml(model.scoreLabel)}</span>
      </div>
    </div>
  </header>

  <section id="executive-summary" class="product-section">
    <h2>Résumé coach</h2>
    <div class="summary-list">${renderList(model.executiveSummary.slice(0, 4))}</div>
  </section>

  <section id="official-match-reading" class="product-section">
    <h2>Ce que le match dit</h2>
    <div class="badge-row">${renderBadge("Source : Officiel")}</div>
    ${renderList(model.officialMatchReading)}
  </section>

  <section id="key-coach-signals" class="product-section">
    <h2>3 signaux clés</h2>
    <div class="cards">${model.keyCoachSignals.map(renderSignal).join("")}</div>
  </section>

  <section id="profiles-to-observe" class="product-section">
    <h2>Profils à observer</h2>
    <p class="guard">Prévisualisation non appliquée — non confirmée comme recommandation officielle.</p>
    ${model.profilesToObserve.map(renderProfile).join("")}
  </section>

  <section id="next-match-signals" class="product-section">
    <h2>À vérifier au prochain match</h2>
    ${renderList(model.nextMatchSignals.slice(0, 5))}
  </section>

  <section id="interpretation-guard" class="product-section">
    <h2>À ne pas sur-interpréter</h2>
    <div class="interpretation-guard">
      <p>Ces profils ne sont pas des choix imposés. Ils servent à guider l'observation et doivent être confirmés sur d'autres matchs.</p>
    </div>
  </section>

  <section id="appendices" class="product-section">
    <h2>Annexes</h2>
    <p class="muted">Les annexes gardent les hypothèses, la traçabilité et les validations hors de la lecture principale.</p>
    ${model.appendices.map((appendix) => renderAppendix(appendix, technicalTags)).join("")}
  </section>
</main>
</body>
</html>`;
}
