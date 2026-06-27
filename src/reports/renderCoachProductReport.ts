import type {
  CoachProductReportAppendix,
  CoachProductReportProfile,
  CoachProductReportSignal,
  CoachProductReportViewModel,
} from "./coachProductReportView";
import {
  COACH_REPORT_PHASE_VISUALS_SCRIPT_ID,
  serializeCoachReportPhaseVisualSeed,
} from "./coachReportPhaseVisuals";
import { buildCoachProductReportPolish } from "./buildCoachProductReportPolish";
import {
  buildCoachDeepInsights,
  buildNextMatchRecommendations,
  renderCoachDeepInsights,
  renderNextMatchPlan,
} from "./coachDeepInsights";
import {
  buildCoachActionPlanCards,
  buildTrainingFocusPackages,
  renderCoachActionPlanCards,
  renderTrainingFocusPackage,
} from "./coachActionPlanCards";
import {
  buildCoachTacticalMapCardsFromProductReport,
  renderCoachTacticalMapCardsSection,
} from "./coachReportTacticalMapCards";
import {
  buildCoachMultiMatchTrendSummary,
  buildCoachTrendSignalCardsFromProductReport,
  renderCoachMultiMatchTrendSignalsSection,
} from "./coachReportMultiMatchTrendSignals";
import { escapeHtml } from "./htmlCoachReport";
import {
  candidateDisplayPriorityLabel,
  type PlayerCandidateComparisonCard,
  type PlayerCandidateComparisonProfileBlock,
} from "./playerCandidateComparisonView";
import {
  playerMatchupFitBandLabel,
  type PlayerMatchupCandidate,
  type PlayerMatchupProfileBlock,
} from "./playerMatchupView";

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

function renderMatchupCandidate(candidate: PlayerMatchupCandidate): string {
  return `
    <article class="matchup-card">
      <div class="matchup-head">
        <div>
          <h4>${escapeHtml(candidate.playerName)}</h4>
          <p class="muted">R&ocirc;le actuel : ${escapeHtml(candidate.currentRoleLabel)}</p>
        </div>
        ${renderBadge(playerMatchupFitBandLabel(candidate.fitBand))}
      </div>
      <p class="card-kicker">Compatibilité profil-joueur</p>
      <p><strong>Compatibilit&eacute; calibr&eacute;e :</strong> ${escapeHtml(playerMatchupFitBandLabel(candidate.fitBand))}${candidate.calibratedFitScore === undefined ? "" : ` (${candidate.calibratedFitScore}/100)`}</p>
      <div class="matchup-grid">
        <section>
          <h5>Pourquoi ce joueur est visible</h5>
          ${renderList((candidate.calibrationWhyVisible ?? candidate.whyStudy).slice(0, 3))}
        </section>
        <section>
          <h5>Atouts visibles</h5>
          ${renderList(candidate.matchedAttributes.length === 0 ? ["Aucun atout net dans ce run."] : candidate.matchedAttributes.slice(0, 3))}
        </section>
        <section>
          <h5>Points à vérifier</h5>
          ${renderList(candidate.whatIsMissing.slice(0, 3))}
        </section>
        <section>
          <h5>Risque si utilisé dans ce rôle</h5>
          ${renderList(candidate.riskIfUsed.slice(0, 2))}
        </section>
        <section>
          <h5>Limites du profil</h5>
          ${renderList((candidate.calibrationLimits ?? ["Compatibilit&eacute; non appliqu&eacute;e, &agrave; confirmer par plusieurs matchs."]).slice(0, 3))}
        </section>
        <section>
          <h5>Signal à observer au prochain match</h5>
          ${renderList(candidate.nextObservationSignal.slice(0, 2))}
        </section>
      </div>
      <p class="guard">${escapeHtml(candidate.nonAppliedLabel)} — ${escapeHtml(candidate.confirmationLabel)}.</p>
    </article>`;
}

function renderMatchupBlock(block: PlayerMatchupProfileBlock): string {
  if (block.candidates.length === 0) {
    return `
      <article class="product-card matchup-block">
        <h3>${escapeHtml(block.profileTitle)}</h3>
        <p class="empty">${escapeHtml(block.emptyState ?? "Aucun joueur ne ressort clairement pour ce profil dans ce run. Le profil reste à observer, sans joueur associé.")}</p>
      </article>`;
  }

  return `
    <article class="product-card matchup-block">
      <h3>${escapeHtml(block.profileTitle)}</h3>
      <div class="badge-row attributes" aria-label="Attributs de profil">
        ${block.usefulAttributes.slice(0, 6).map(renderBadge).join("")}
      </div>
      <div class="matchup-candidates">${block.candidates.map(renderMatchupCandidate).join("")}</div>
    </article>`;
}

function renderComparisonDifferentiator(card: PlayerCandidateComparisonCard, title: string): string {
  const differentiator = card.differentiators.find((item) => item.title === title);

  return `<p>${escapeHtml(differentiator?.summary ?? "")}</p>`;
}

function renderComparisonDetailCard(card: PlayerCandidateComparisonCard): string {
  return `
    <article class="comparison-detail-card">
      <div class="matchup-head">
        <div>
          <h4>${escapeHtml(card.playerName)}</h4>
          <p class="muted">R&ocirc;le actuel : ${escapeHtml(card.roleLabel)}</p>
        </div>
        ${renderBadge(candidateDisplayPriorityLabel(card.displayPriority))}
      </div>
      <p><strong>Compatibilit&eacute; calibr&eacute;e :</strong> ${escapeHtml(card.fitBandLabel)} (${card.calibratedFitScore}/100)</p>
      <div class="matchup-grid">
        <section>
          <h5>Atouts visibles</h5>
          ${renderList(card.matchedAttributes.length === 0 ? [card.strongestVisibleAsset] : card.matchedAttributes.slice(0, 3))}
        </section>
        <section>
          <h5>Points &agrave; v&eacute;rifier</h5>
          ${renderList(card.missingAttributes.length === 0 ? [card.mainGapOrCheck] : card.missingAttributes.slice(0, 3))}
        </section>
        <section>
          <h5>Risque si utilis&eacute; dans ce r&ocirc;le</h5>
          ${renderList([card.mainRisk, ...card.limitNotes].slice(0, 3))}
        </section>
        <section>
          <h5>Signal &agrave; observer au prochain match</h5>
          ${renderList([card.nextObservationSignal])}
        </section>
      </div>
      <p class="guard">${escapeHtml(card.nonAppliedLabel)} &mdash; ${escapeHtml(card.confirmationLabel)}.</p>
    </article>`;
}

function renderComparisonCard(card: PlayerCandidateComparisonCard): string {
  return `
    <article class="comparison-card">
      <div class="matchup-head">
        <div>
          <h4>${escapeHtml(card.playerName)}</h4>
          <p class="muted">R&ocirc;le actuel : ${escapeHtml(card.roleLabel)}</p>
        </div>
        ${renderBadge(escapeHtml(candidateDisplayPriorityLabel(card.displayPriority)))}
      </div>
      <p class="card-kicker">Compatibilit&eacute; profil-joueur</p>
      <p><strong>Compatibilit&eacute; calibr&eacute;e :</strong> ${escapeHtml(card.fitBandLabel)} (${card.calibratedFitScore}/100)</p>
      <div class="comparison-grid">
        <section>
          <h5>Pourquoi ce joueur est visible</h5>
          <p>${escapeHtml(card.shortWhyVisible)}</p>
        </section>
        <section>
          <h5>Point fort distinctif</h5>
          ${renderComparisonDifferentiator(card, "Point fort distinctif")}
        </section>
        <section>
          <h5>Point &agrave; v&eacute;rifier</h5>
          ${renderComparisonDifferentiator(card, "Point a verifier")}
        </section>
        <section>
          <h5>Risque principal</h5>
          ${renderComparisonDifferentiator(card, "Risque principal")}
        </section>
        <section>
          <h5>&Agrave; v&eacute;rifier au prochain match</h5>
          ${renderComparisonDifferentiator(card, "A verifier au prochain match")}
        </section>
      </div>
      <p class="guard">${escapeHtml(card.nonAppliedLabel)} &mdash; ${escapeHtml(card.confirmationLabel)}.</p>
    </article>`;
}

function renderComparisonBlock(block: PlayerCandidateComparisonProfileBlock): string {
  if (block.emptyStateUsed || block.cards.length === 0) {
    return `
      <article class="product-card comparison-block">
        <h3>${escapeHtml(block.profileTitle)}</h3>
        <p>${escapeHtml(block.profileSummary)}</p>
        <p class="empty">${escapeHtml(block.emptyState ?? "Aucune piste credible ne ressort encore pour ce profil.")}</p>
      </article>`;
  }

  const compactCards = block.cards.filter((card) => card.compactVisible);
  const detailCards = block.cards.filter((card) => !card.compactVisible);

  return `
    <article class="product-card comparison-block">
      <h3>${escapeHtml(block.profileTitle)}</h3>
      <p>${escapeHtml(block.profileSummary)}</p>
      ${renderList(block.comparisonSummary.slice(0, 3))}
      <div class="comparison-cards">${compactCards.map(renderComparisonCard).join("")}</div>
      ${detailCards.length === 0 ? "" : `
        <details class="comparison-details">
          <summary>D&eacute;tails repli&eacute;s (${detailCards.length})</summary>
          <div class="comparison-detail-list">${detailCards.map(renderComparisonDetailCard).join("")}</div>
        </details>
      `}
    </article>`;
}

function renderExpressRead(input: {
  readonly model: CoachProductReportViewModel;
  readonly primaryActionTitle: string;
  readonly primarySignal: string;
  readonly primaryRisk: string;
}): string {
  return `
  <section id="express-read" class="product-section express-read" aria-label="Lecture express">
    <div class="express-head">
      <div>
        <p class="card-kicker">Lecture express</p>
        <h2>En 30 secondes</h2>
      </div>
      <div class="express-score">
        <span class="score-label">Score officiel</span>
        <strong>${escapeHtml(input.model.scoreLabel)}</strong>
      </div>
    </div>
    <div class="express-grid">
      <article><h3>Priorite principale</h3><p>${escapeHtml(input.primaryActionTitle)}</p></article>
      <article><h3>Signal terrain a verifier</h3><p>${escapeHtml(input.primarySignal)}</p></article>
      <article><h3>Risque principal</h3><p>${escapeHtml(input.primaryRisk)}</p></article>
      <article><h3>Garde-fou source de verite</h3><p>Score issu des evenements officiels; diagnostics et sandbox restent separes.</p></article>
    </div>
  </section>`;
}

function renderOfficialMatchStorySpine(model: CoachProductReportViewModel): string {
  const story = model.officialMatchStorySpine;
  if (story === undefined) {
    return "";
  }

  return `
  <section id="official-match-story-spine" class="product-section official-story-spine" aria-label="Recit officiel du match">
    <div class="story-head">
      <div>
        <p class="card-kicker">Lecture officielle</p>
        <h2>R&eacute;cit officiel du match</h2>
      </div>
      ${renderBadge(`Score officiel : ${story.officialScore}`)}
    </div>
    <article class="product-card official-story-card">
      <h3>Le match en 45 secondes</h3>
      <p>${escapeHtml(story.narrative.shortNarrative)}</p>
      <div class="story-turning-points">
        ${story.turningPoints.slice(0, 4).map((turningPoint) => `
          <section>
            <h4>${escapeHtml(turningPoint.title)}</h4>
            <p>${escapeHtml(turningPoint.coachMeaning)}</p>
          </section>`).join("")}
      </div>
      <p class="guard">${escapeHtml(story.narrative.sourceOfTruthNote)}</p>
    </article>
  </section>`;
}

function renderOfficialCausality8C(model: CoachProductReportViewModel): string {
  const causality = model.officialMatchCausality;
  if (causality === undefined) {
    return "";
  }
  const cards = causality.evidenceFacts.slice(0, 2);

  return `
  <section id="official-causality-8c" class="product-section official-causality-8c" aria-label="Pourquoi le match a bascule">
    <div class="story-head">
      <div>
        <p class="card-kicker">Causalit&eacute; officielle</p>
        <h2>Pourquoi le match a bascul&eacute;</h2>
      </div>
      ${renderBadge(`Confiance : ${causality.status}`)}
    </div>
    <p class="guard">Deux causes officielles sont retenues ici; le rapport 8C garde la matrice compl&egrave;te.</p>
    <div class="cards">
      ${cards.map((fact) => `
        <article class="product-card causality-card">
          <div class="badge-row">
            ${renderBadge(`Source officielle : ${fact.linkedOfficialEventIds[0]}`)}
            ${renderBadge(`Confiance ${fact.confidence}`)}
          </div>
          <h3>${escapeHtml(fact.causeLabel)}</h3>
          <p><strong>Effet :</strong> ${escapeHtml(fact.effectLabel)}</p>
          <p><strong>Joueur / r&ocirc;le :</strong> ${escapeHtml([fact.primaryPlayerId, fact.role].filter((value): value is string => value !== undefined).join(" / ") || "non pr&eacute;cis&eacute;")}</p>
          <p><strong>Zone :</strong> ${escapeHtml(fact.zoneIds.join(", ") || "non pr&eacute;cis&eacute;e")}</p>
          <p><strong>Limite :</strong> ${escapeHtml(fact.limitationNote)}</p>
        </article>`).join("")}
    </div>
  </section>`;
}

function renderAppendix(appendix: CoachProductReportAppendix, tags: readonly string[]): string {
  const detail = appendix.details !== undefined
    ? appendix.details
    : (appendix.contentKind === "technical"
    ? tags.slice(0, 48)
    : [
      appendix.summary,
      "Ce contenu reste séparé du corps principal pour préserver une lecture coach claire.",
    ]);

  return `
    <details class="appendix">
      <summary>${escapeHtml(appendix.title)}</summary>
      <p>${escapeHtml(appendix.summary)}</p>
      ${renderList(detail)}
    </details>`;
}

function renderPhaseVisualSeedScript(model: CoachProductReportViewModel): string {
  if (model.phaseVisualSeed === undefined) {
    return "";
  }

  return `
  <script type="application/json" id="${COACH_REPORT_PHASE_VISUALS_SCRIPT_ID}">
${serializeCoachReportPhaseVisualSeed(model.phaseVisualSeed)}
  </script>`;
}

export function renderCoachProductReport(model: CoachProductReportViewModel): string {
  const polish = buildCoachProductReportPolish({ productReportView: model });
  const technicalTags = [...model.tags, ...polish.tags];
  const deepInsights = buildCoachDeepInsights(model);
  const nextMatchRecommendations = buildNextMatchRecommendations(deepInsights);
  const actionPlanCards = buildCoachActionPlanCards(deepInsights);
  const trainingFocuses = buildTrainingFocusPackages(actionPlanCards);
  const tacticalMapCards = buildCoachTacticalMapCardsFromProductReport(model);
  const trendSignalCards = buildCoachTrendSignalCardsFromProductReport(model, tacticalMapCards);
  const trendSummary = buildCoachMultiMatchTrendSummary(trendSignalCards);
  const primaryActionCard = actionPlanCards[0];
  const primarySignal = model.nextMatchSignals[0] ?? model.keyCoachSignals[0]?.summary ?? "Signal a confirmer au prochain match.";
  const primaryRisk = primaryActionCard?.riskOrTradeoff ?? "Risque a surveiller: ne pas transformer un signal en consigne automatique.";

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rapport coach produit</title>
  <style>
    :root { color-scheme: light; --ink: #172033; --muted: #5f6c7b; --line: #d9e2ec; --soft: #f6f8fb; --accent: #1f6f8b; --accent-strong: #15495e; --accent-soft: #e8f4f7; --paper: #ffffff; --success: #1d7a50; --watch: #8a5a13; }
    body { margin: 0; font-family: Inter, "Segoe UI", Arial, sans-serif; color: var(--ink); background: #eef3f7; line-height: 1.5; overflow-x: hidden; }
    main { max-width: 1080px; margin: 0 auto; padding: 32px 20px 56px; }
    header { background: linear-gradient(135deg, #ffffff 0%, #edf7fa 100%); border: 1px solid var(--line); border-radius: 14px; padding: 26px; margin-bottom: 26px; box-shadow: 0 14px 40px rgba(23, 32, 51, .08); }
    .premium-cover { position: relative; overflow: hidden; }
    .premium-cover::after { content: ""; position: absolute; inset: auto 0 0 0; height: 5px; background: linear-gradient(90deg, var(--accent), var(--success), var(--watch)); }
    h1 { margin: 0 0 12px; font-size: 2.2rem; line-height: 1.1; }
    h2 { margin: 34px 0 12px; font-size: 1.35rem; }
    h3 { margin: 0 0 10px; font-size: 1.05rem; }
    h4 { margin: 0 0 6px; font-size: .9rem; text-transform: uppercase; letter-spacing: .02em; color: var(--muted); }
    h5 { margin: 0 0 6px; font-size: .82rem; text-transform: uppercase; letter-spacing: .02em; color: var(--muted); }
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
    .express-read { background: var(--paper); border: 1px solid var(--line); border-radius: 12px; padding: 18px; box-shadow: 0 10px 30px rgba(23, 32, 51, .06); }
    .express-head { display: flex; justify-content: space-between; gap: 16px; align-items: start; margin-bottom: 12px; }
    .express-score { min-width: 150px; border: 1px solid var(--line); border-radius: 10px; padding: 10px 12px; text-align: right; background: var(--soft); }
    .express-score strong { display: block; font-size: 1.25rem; }
    .express-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
    .express-grid article { border: 1px solid var(--line); border-radius: 9px; padding: 12px; background: #fbfdff; }
    .summary-list { background: var(--paper); border: 1px solid var(--line); border-radius: 10px; padding: 16px 18px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }
    .signal-grid, .profile-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; }
    .signal-grid section, .profile-grid section { background: var(--soft); border-radius: 8px; padding: 12px; }
    .matchup-candidates { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
    .matchup-card { border: 1px solid var(--line); border-radius: 8px; padding: 14px; background: var(--soft); }
    .matchup-head { display: flex; gap: 12px; justify-content: space-between; align-items: flex-start; }
    .matchup-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
    .matchup-grid section { background: #fff; border-radius: 8px; padding: 10px; }
    .comparison-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; }
    .comparison-card, .comparison-detail-card { border: 1px solid var(--line); border-radius: 8px; padding: 14px; background: var(--soft); }
    .comparison-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
    .comparison-grid section { background: #fff; border-radius: 8px; padding: 10px; }
    .comparison-details { margin-top: 12px; border: 1px solid var(--line); border-radius: 8px; background: #fff; padding: 12px; }
    .comparison-details summary { cursor: pointer; font-weight: 700; }
    .comparison-detail-list { display: grid; gap: 12px; margin-top: 12px; }
    .badge-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
    .badge { display: inline-block; border: 1px solid var(--line); border-radius: 999px; padding: 3px 10px; font-size: .82rem; color: var(--accent); background: #f8fbfd; }
    .attributes .badge { color: #515f6f; background: #fbfcfd; }
    .card-kicker { color: var(--accent); font-size: .78rem; font-weight: 800; letter-spacing: .08em; margin-bottom: 4px; text-transform: uppercase; }
    .guard { border-left: 3px solid var(--accent); padding: 10px 0 10px 12px; color: var(--muted); background: var(--accent-soft); border-radius: 0 8px 8px 0; }
    .action-plan-card--primary { border-color: var(--accent); box-shadow: 0 14px 34px rgba(31, 111, 139, .13); }
    .action-plan-card--primary h3 { font-size: 1.2rem; color: var(--accent-strong); }
    .action-plan-card--primary .badge:first-child { color: #fff; background: var(--accent); border-color: var(--accent); }
    .action-plan-card-grid { align-items: stretch; }
    .tactical-map-section { margin-top: 20px; }
    .tactical-map-card-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    .tactical-map-card { border: 1px solid var(--line); border-radius: 10px; padding: 14px; background: #fbfdff; break-inside: avoid; }
    .tactical-map-card h3 { margin-bottom: 12px; }
    .tactical-map-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; margin: 10px 0 12px; }
    .tactical-map-zone { min-height: 50px; border: 1px solid var(--line); border-radius: 8px; padding: 8px; display: grid; align-content: center; text-align: center; background: var(--soft); }
    .tactical-map-zone strong { font-size: .86rem; }
    .tactical-map-zone span { color: var(--muted); font-size: .78rem; }
    .tactical-map-zone--danger { background: #fff4ec; border-color: #f0c5a6; }
    .tactical-map-zone--recovery { background: #eef9f3; border-color: #b8dfca; }
    .tactical-map-zone--pressure { background: #fff8df; border-color: #ead486; }
    .tactical-map-zone--high { box-shadow: inset 0 0 0 2px rgba(31, 111, 139, .2); }
    .tactical-map-zone--empty { color: var(--muted); background: var(--soft); border-style: dashed; }
    .tactical-map-legend { color: var(--muted); font-size: .9rem; }
    .story-head { display: flex; justify-content: space-between; gap: 14px; align-items: start; }
    .official-story-card { border-color: rgba(31, 111, 139, .32); }
    .story-turning-points { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 10px; margin: 12px 0; }
    .story-turning-points section { background: var(--soft); border: 1px solid var(--line); border-radius: 8px; padding: 11px; }
    .trend-signals-section { margin-top: 20px; }
    .trend-card-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 12px; }
    .trend-card { background: #fbfdff; break-inside: avoid; }
    .trend-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
    .trend-grid section { border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: var(--soft); }
    .interpretation-guard { border: 1px solid var(--line); border-left: 4px solid var(--accent); border-radius: 10px; background: #fff; padding: 16px; }
    .appendix { border: 1px solid var(--line); border-radius: 8px; padding: 12px 14px; margin: 10px 0; background: var(--paper); }
    .appendix summary { cursor: pointer; font-weight: 700; }
    .empty { color: var(--muted); }
    @media (max-width: 720px) {
      .header-grid { grid-template-columns: 1fr; }
      .score-box { text-align: left; }
      .express-head { display: block; }
      .express-score { text-align: left; margin-top: 10px; }
      .express-grid { grid-template-columns: 1fr; }
      .tactical-map-card-grid { grid-template-columns: 1fr; }
      .trend-card-grid, .trend-grid { grid-template-columns: 1fr; }
      .cards, .signal-grid, .profile-grid, .matchup-candidates, .comparison-cards, .comparison-grid, .matchup-grid { grid-template-columns: 1fr; }
      .product-card, .express-read, .tactical-map-card, .trend-card { overflow-wrap: anywhere; }
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
  <header id="premium-cover" class="premium-cover">
    <div class="header-grid">
      <div>
        <h1>Rapport coach — lecture produit</h1>
        <div class="header-meta">
          ${renderBadge(`Match : ${model.matchId}`)}
          ${renderBadge("Type : rapport produit")}
          ${renderBadge("Score officiel")}
          ${renderBadge("Diagnostics separes")}
          ${renderBadge("Sandbox non applique")}
        </div>
        <p class="muted">${escapeHtml(model.scoreSourceNote)}</p>
      </div>
      <div class="score-box">
        <span class="score-label">Score du rapport full-match</span>
        <span class="score">${escapeHtml(model.scoreLabel)}</span>
      </div>
    </div>
  </header>

  ${renderExpressRead({
    model,
    primaryActionTitle: primaryActionCard?.title ?? "Priorite principale a confirmer.",
    primarySignal,
    primaryRisk,
  })}

  ${renderOfficialMatchStorySpine(model)}

  ${renderOfficialCausality8C(model)}

  <section id="executive-summary" class="product-section">
    <h2>Résumé coach</h2>
    <div class="summary-list">${renderList(model.executiveSummary.slice(0, 4))}</div>
  </section>

  ${renderCoachActionPlanCards(actionPlanCards)}

  ${renderCoachTacticalMapCardsSection(tacticalMapCards)}

  ${renderCoachMultiMatchTrendSignalsSection({ summary: trendSummary, cards: trendSignalCards })}

  ${renderTrainingFocusPackage(trainingFocuses)}

  ${renderNextMatchPlan(nextMatchRecommendations)}

  <section id="key-coach-signals" class="product-section">
    <h2>3 signaux clés</h2>
    <div class="cards">${model.keyCoachSignals.map(renderSignal).join("")}</div>
  </section>

  <section id="profiles-to-observe" class="product-section">
    <h2>Profils à observer</h2>
    <p class="guard">Prévisualisation non appliquée — non confirmée comme recommandation officielle.</p>
    ${model.profilesToObserve.map(renderProfile).join("")}
  </section>

  <section id="players-to-study" class="product-section">
    <h2>Joueurs à étudier</h2>
    <p class="guard">Les joueurs affichés sont issus d'une calibration rôle-attributs. Certains profils peuvent rester sans candidat si aucun joueur ne franchit le seuil de crédibilité.</p>
    <p class="guard">Les rapprochements profil-joueur ne sont pas des choix de composition. Ils servent à préparer l'observation et doivent être confirmés par plusieurs matchs.</p>
    <p class="guard">Un joueur peut être utile pour un profil et non pertinent pour un autre.</p>
        <p class="guard">Les cartes comparent des pistes d'observation. Elles ne changent ni la composition, ni le onze de depart, ni le banc.</p>
    ${(model.playerCandidateComparisonView?.profileBlocks ?? []).length > 0
      ? model.playerCandidateComparisonView!.profileBlocks.map(renderComparisonBlock).join("").trimStart()
      : model.playerMatchupView.blocks.map(renderMatchupBlock).join("").trimStart()}
  </section>

  <section id="next-match-signals" class="product-section">
    <h2>À vérifier au prochain match</h2>
    ${renderList(model.nextMatchSignals.slice(0, 5))}
  </section>

  <section id="official-match-reading" class="product-section">
    <h2>Ce que le match dit</h2>
    <div class="badge-row">${renderBadge("Source : Officiel")}</div>
    ${renderList(model.officialMatchReading)}
  </section>

  ${renderCoachDeepInsights(deepInsights)}

  <section id="training-focus" class="product-section">
    <h2>&Agrave; travailler</h2>
    <article class="product-card training-card">
      <div class="badge-row">
        ${renderBadge("Source : Officiel")}
        ${renderBadge("Confiance moyenne")}
      </div>
      <h3>Stabiliser la premi&egrave;re sortie utile</h3>
      <div class="signal-grid">
        <section>
          <h4>Axe prioritaire</h4>
          <p>S&eacute;curiser la premi&egrave;re sortie apr&egrave;s r&eacute;cup&eacute;ration sans perdre la structure derri&egrave;re le ballon.</p>
        </section>
        <section>
          <h4>Justification simple</h4>
          <p>Les signaux officiels relient r&eacute;cup&eacute;ration, progression et continuit&eacute;; ils doivent rester lisibles au prochain match.</p>
        </section>
        <section>
          <h4>Signal observable</h4>
          <p>La premi&egrave;re passe ou conservation apr&egrave;s r&eacute;cup&eacute;ration cr&eacute;e-t-elle une continuit&eacute; propre ?</p>
        </section>
      </div>
    </article>
  </section>

  <section id="interpretation-guard" class="product-section">
    <h2>À ne pas sur-interpréter</h2>
    <div class="interpretation-guard">
      <p>Ces profils ne sont pas des choix imposés. Ils servent à guider l'observation et doivent être confirmés sur d'autres matchs.</p>
      <p>Les associations profil-joueur restent des pistes d'observation multi-match, sans effet sur la composition.</p>
      <p>Un joueur peut être utile pour un profil et non pertinent pour un autre.</p>
    </div>
  </section>

  <section id="guardrail-summary" class="product-section">
    <h2>R&eacute;sum&eacute; guardrails</h2>
    <div class="interpretation-guard">
      <p>Score issu des &eacute;v&eacute;nements officiels score_change.</p>
      <p>Diagnostics batch et &eacute;chantillons live s&eacute;par&eacute;s du score officiel.</p>
      <p>Sandbox non appliqu&eacute; : aucune modification de score, possession, timeline, composition ou scoring event.</p>
      <p>Sans cap de score, sans score forc&eacute;, sans comeback forc&eacute;, sans opportunit&eacute; impos&eacute;e.</p>
    </div>
  </section>

  <section id="appendices" class="product-section">
    <h2>Annexes</h2>
    <p class="muted">Les annexes gardent les hypothèses, la traçabilité et les validations hors de la lecture principale.</p>
    ${model.appendices.map((appendix) => renderAppendix(appendix, technicalTags)).join("")}
  </section>
  ${renderPhaseVisualSeedScript(model)}
</main>
</body>
</html>`;
}
