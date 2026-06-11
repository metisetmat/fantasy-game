import type {
  CoachInsight,
  CoachInsightType,
  EventOutcome,
  KeyMoment,
  MatchEvent,
  MatchEventType,
  MatchReport,
  TacticalDiagnosis,
  TeamMatchStats,
  TrainingFocusSuggestion,
  ZoneStats,
} from "../contracts/engineToCoach";
import { normalizeCoachFacingCopy } from "./coachCopyQuality";

export function escapeHtml(value: string): string {
  return normalizeCoachFacingCopy(productCopy(value))
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function productCopy(value: string): string {
  return value
    .replaceAll(
      "Données encore limitées par l'adapter de simulation actuel.",
      "Signal encore partiel : cette analyse sera renforcée quand les plans tactiques seront davantage branchés au moteur.",
    )
    .replaceAll(
      "DonnÃ©es encore limitÃ©es par l'adapter de simulation actuel.",
      "Signal encore partiel : cette analyse sera renforcée quand les plans tactiques seront davantage branchés au moteur.",
    )
    .replaceAll("issue du résumé de score mini-match", "identifiée dans le résumé de score")
    .replaceAll("issues du résumé de score mini-match", "identifiées dans le résumé de score")
    .replaceAll("visible par l'adapter", "visible dans les données de simulation actuelles")
    .replaceAll("visibles par l'adapter", "visibles dans les données de simulation actuelles")
    .replaceAll("Protéger la plateforme de marque", "Sécuriser la séquence qui mène au score")
    .replaceAll("Protéger le schéma qui a mené à l'action décisive", "Conserver le schéma qui a créé l'action décisive")
    .replaceAll("L'adapter mini-match", "Le moteur de simulation")
    .replaceAll("l'adapter mini-match", "le moteur de simulation")
    .replaceAll("adapter mini-match", "moteur de simulation")
    .replaceAll("adapter de simulation actuel", "moteur de simulation actuel")
    .replaceAll("mini-match", "simulation")
    .replaceAll("resolution live du simulation", "resolution live normale")
    .replaceAll("experience simulation isolee", "experience isolee")
    .replaceAll("source de route controlee pour simulation", "source de route controlee experimentale");
}

function scoreText(report: MatchReport): string {
  return `${report.score.home} - ${report.score.away}`;
}

function renderBadge(value: string): string {
  return `<span class="badge">${escapeHtml(value)}</span>`;
}

function confidenceText(value: "low" | "medium" | "high"): string {
  switch (value) {
    case "low":
      return "Confiance faible";
    case "medium":
      return "Confiance moyenne";
    case "high":
      return "Confiance élevée";
  }
}

function renderConfidence(value: "low" | "medium" | "high"): string {
  return `<span class="badge confidence confidence-${value}">${escapeHtml(confidenceText(value))}</span>`;
}

function eventTypeLabel(eventType: MatchEventType): string {
  switch (eventType) {
    case "kickoff":
      return "Coup d'envoi";
    case "gain_possession":
      return "Récupération";
    case "lose_possession":
      return "Perte de possession";
    case "turnover":
      return "Ballon rendu";
    case "progression":
      return "Progression";
    case "duel":
      return "Duel";
    case "defensive_action":
      return "Action défensive";
    case "fatigue_error":
      return "Erreur liée à la fatigue";
    case "goalkeeper_action":
      return "Intervention du gardien";
    case "scoring":
      return "Action décisive";
    case "tactical_shift":
      return "Ajustement tactique";
    case "discipline":
      return "Discipline";
  }
}

function outcomeLabel(outcome: EventOutcome): string {
  switch (outcome) {
    case "success":
      return "réussite";
    case "failure":
      return "échec";
    case "neutral":
      return "neutre";
    case "advantage":
      return "avantage";
    case "score":
      return "score";
  }
}

function insightTypeLabel(type: CoachInsightType): string {
  switch (type) {
    case "strength":
      return "point fort";
    case "weakness":
      return "point faible";
    case "tactical_success":
      return "réussite tactique";
    case "tactical_failure":
      return "échec tactique";
    case "fatigue_warning":
      return "alerte physique";
    case "player_spotlight":
      return "joueur clé";
    case "synergy_detected":
      return "synergie détectée";
    case "opponent_exploit":
      return "faille adverse";
    case "training_recommendation":
      return "recommandation";
  }
}

function consequenceTypeLabel(type: string): string {
  switch (type) {
    case "score_change":
      return "évolution du score";
    case "possession_change":
      return "changement de possession";
    case "zone_change":
      return "changement de zone";
    case "fatigue_change":
      return "impact physique";
    case "momentum_change":
      return "changement d'élan";
    case "tactical_warning":
      return "alerte tactique";
    default:
      return type;
  }
}

function pressureLevelLabel(value: string): string {
  switch (value) {
    case "low":
      return "faible";
    case "medium":
      return "moyenne";
    case "high":
      return "forte";
    default:
      return value;
  }
}

function timelineReason(event: MatchEvent): string {
  return `Contexte : ${eventTypeLabel(event.eventType)} pour ${event.teamId} en ${event.zone}, sous pression ${pressureLevelLabel(event.tacticalContext.pressureLevel)}.`;
}

function consequenceLabel(input: { readonly type: string; readonly description: string; readonly value?: number }): string {
  if (input.type === "score_change") {
    return input.value === undefined ? "évolution du score" : `+${input.value} au score`;
  }

  return `${consequenceTypeLabel(input.type)} : ${input.description}`;
}

function compareTimelineEvents(a: MatchEvent, b: MatchEvent): number {
  if (a.timestamp.minute !== b.timestamp.minute) {
    return a.timestamp.minute - b.timestamp.minute;
  }

  if (a.timestamp.tick !== b.timestamp.tick) {
    return a.timestamp.tick - b.timestamp.tick;
  }

  if (a.eventType === "scoring" && b.eventType !== "scoring") {
    return 1;
  }

  if (a.eventType !== "scoring" && b.eventType === "scoring") {
    return -1;
  }

  return a.eventId.localeCompare(b.eventId);
}

function renderEmpty(message: string): string {
  return `<p class="empty">${escapeHtml(message)}</p>`;
}

function renderKeyMoment(moment: KeyMoment): string {
  return `
    <article class="card">
      <div class="card-meta">Minute ${moment.minute}</div>
      <h3>${escapeHtml(moment.title)}</h3>
      <p>${escapeHtml(moment.summary)}</p>
      <div class="muted">Événement : ${escapeHtml(moment.eventId)}</div>
    </article>`;
}

function renderCoachInsight(insight: CoachInsight): string {
  const evidence = insight.evidence
    .map(
      (item) => `
        <li>
          <strong>${escapeHtml(item.summary)}</strong>
          <div class="muted">Événements : ${item.eventIds.map(escapeHtml).join(", ") || "aucun"}</div>
          ${item.confidenceNote === undefined ? "" : `<div class="muted">${escapeHtml(item.confidenceNote)}</div>`}
        </li>`,
    )
    .join("");
  const actions = insight.recommendedActions
    .map(
      (action) => `
        <li>
          ${escapeHtml(action.label)}
          ${action.tradeoff === undefined ? "" : `<div class="muted">Compromis : ${escapeHtml(action.tradeoff)}</div>`}
        </li>`,
    )
    .join("");

  return `
    <article class="card">
      <div class="card-meta">${renderBadge(insightTypeLabel(insight.type))} ${renderConfidence(insight.confidence)}</div>
      <h3>${escapeHtml(insight.title)}</h3>
      <p>${escapeHtml(insight.summary)}</p>
      <div class="zones">Zones: ${insight.affectedZones.map(renderBadge).join(" ") || renderBadge("none")}</div>
      <h4>Preuves</h4>
      <ul>${evidence}</ul>
      <h4>Action recommandée</h4>
      <ul>${actions}</ul>
    </article>`;
}

function renderDiagnosis(diagnosis: TacticalDiagnosis): string {
  return `
    <article class="card">
      <div class="card-meta">Équipe ${escapeHtml(diagnosis.teamId)} ${renderConfidence(diagnosis.confidence)}</div>
      <h3>${escapeHtml(diagnosis.title)}</h3>
      <p>${escapeHtml(diagnosis.summary)}</p>
      <div class="zones">Zones: ${diagnosis.affectedZones.map(renderBadge).join(" ") || renderBadge("none")}</div>
      <div class="muted">Événements de preuve : ${diagnosis.evidenceEventIds.map(escapeHtml).join(", ") || "aucun"}</div>
    </article>`;
}

function renderWarning(warning: MatchReport["warnings"][number]): string {
  return `
    <article class="card">
      <div class="card-meta">${renderBadge(warning.severity)} ${renderBadge(warning.scope)}</div>
      <h3>${escapeHtml(warning.title)}</h3>
      <p>${escapeHtml(warning.coachSummary)}</p>
      <details class="internal-markers">
        <summary>Détails techniques</summary>
        <div class="muted">Type : ${escapeHtml(warning.type)}</div>
        <div class="muted">Faits d'évidence : ${warning.evidenceFactIds.map(escapeHtml).join(", ") || "aucun"}</div>
        <div class="muted">Événements : ${warning.eventIds.map(escapeHtml).join(", ") || "aucun"}</div>
        <div class="muted">${escapeHtml(warning.technicalSummary)}</div>
      </details>
    </article>`;
}

function renderFocus(focus: TrainingFocusSuggestion): string {
  return `
    <article class="card compact">
      <h3>${escapeHtml(focus.title)}</h3>
      <p>${escapeHtml(focus.reason)}</p>
    </article>`;
}

function renderTeamStats(stats: TeamMatchStats): string {
  return `
    <tr>
      <td>${escapeHtml(stats.teamId)}</td>
      <td>${stats.score}</td>
      <td>${stats.scoringAttempts ?? "-"}</td>
      <td>${stats.turnovers ?? "-"}</td>
      <td>${stats.eventShare ?? stats.possessionShare ?? "-"}%</td>
      <td>${stats.progressionCount ?? "-"}</td>
      <td>${stats.scoringEventCount ?? "-"}</td>
      <td>${stats.pressureInstabilityCount ?? "-"}</td>
    </tr>`;
}

function renderZoneStats(stats: ZoneStats): string {
  return `
    <tr>
      <td>${escapeHtml(stats.zone)}</td>
      <td>${stats.entries}</td>
      <td>${stats.successfulProgressions}</td>
      <td>${stats.defensiveStops}</td>
      <td>${stats.scoringEvents ?? "-"}</td>
      <td>${stats.pressureEvents ?? "-"}</td>
    </tr>`;
}

function renderFatigue(report: MatchReport): string {
  const teamRows = report.fatigueReport.teamSummaries
    .map(
      (summary) => `
        <tr>
          <td>${escapeHtml(summary.teamId)}</td>
          <td>${summary.averageConditionEnd}</td>
          <td>${summary.highIntensityLoad}</td>
          <td>${summary.lateErrorCount}</td>
        </tr>`,
    )
    .join("");

  return `
    <table>
      <thead><tr><th>Équipe</th><th>Condition finale</th><th>Charge d'intensité</th><th>Erreurs tardives</th></tr></thead>
      <tbody>${teamRows}</tbody>
    </table>`;
}

function renderTimelineEvent(event: MatchEvent): string {
  const consequences = event.consequences
    .map((consequence) => consequenceLabel(consequence))
    .join("; ");

  return `
    <li class="timeline-event">
      <div><strong>${event.timestamp.minute}' ${escapeHtml(eventTypeLabel(event.eventType))}</strong> ${renderBadge(outcomeLabel(event.outcome))}</div>
      <div>${escapeHtml(event.teamId)} en ${escapeHtml(event.zone)} face à ${escapeHtml(event.opponentTeamId)}</div>
      <p>${escapeHtml(timelineReason(event))}</p>
      <details class="internal-markers">
        <summary>Repères internes</summary>
        <div class="muted">${event.tags.map(escapeHtml).join(", ")}</div>
      </details>
      ${consequences.length === 0 ? "" : `<div class="muted">Conséquences : ${escapeHtml(consequences)}</div>`}
    </li>`;
}

function renderSummary(report: MatchReport): string {
  const primaryFocus = report.suggestedFocus[0]?.title ?? "aucun axe prioritaire";
  const insightLabel = report.coachInsights.length === 1 ? "analyse principale" : "analyses principales";

  return `
    <section>
      <h2>Résumé</h2>
      <article class="card summary-card">
        <p>Score final : <strong>${escapeHtml(scoreText(report))}</strong>.</p>
        <p>Ce rapport met en avant ${report.keyMoments.length} moments clés, ${report.coachInsights.length} ${insightLabel} et un axe de travail prioritaire : <strong>${escapeHtml(primaryFocus)}</strong>.</p>
        <p>Catégories de lecture : Action décisive, Séquence dangereuse, possession sous pression.</p>
      </article>
    </section>`;
}

export function renderHtmlCoachReport(report: MatchReport): string {
  const keyMoments = report.keyMoments.map(renderKeyMoment).join("") || renderEmpty("Aucun moment clé sélectionné.");
  const insights = report.coachInsights.map(renderCoachInsight).join("") || renderEmpty("Aucune analyse coach générée.");
  const diagnoses = report.tacticalReport.diagnoses.map(renderDiagnosis).join("") || renderEmpty("Aucun diagnostic tactique généré.");
  const warnings = report.warnings.map(renderWarning).join("") || renderEmpty("Aucun avertissement structuré généré.");
  const focus = report.suggestedFocus.map(renderFocus).join("") || renderEmpty("Aucun axe de travail généré.");
  const teamStats = report.teamStats.map(renderTeamStats).join("");
  const zoneStats = report.zoneStats.map(renderZoneStats).join("");
  const timeline = [...report.timeline].sort(compareTimelineEvents).map(renderTimelineEvent).join("");

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rapport du coach ${escapeHtml(report.matchId)}</title>
  <style>
    :root { color-scheme: light; font-family: Inter, Segoe UI, Arial, sans-serif; color: #172026; background: #f3f5f7; }
    body { margin: 0; padding: 32px; }
    main { max-width: 1120px; margin: 0 auto; }
    header { background: linear-gradient(135deg, #101820, #25313b); color: white; padding: 30px; border-radius: 8px; margin-bottom: 24px; box-shadow: 0 10px 28px rgba(16, 24, 32, .14); }
    section { margin-top: 26px; }
    h1, h2, h3, h4, p { margin-top: 0; }
    h1 { font-size: 30px; margin-bottom: 8px; }
    h2 { font-size: 20px; margin: 0 0 12px; }
    h3 { font-size: 16px; margin-bottom: 8px; }
    h4 { font-size: 13px; margin: 16px 0 8px; color: #53606b; text-transform: uppercase; letter-spacing: .04em; }
    .score { display: inline-block; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.18); border-radius: 8px; font-size: 48px; font-weight: 800; line-height: 1; margin: 18px 0 8px; padding: 14px 18px; }
    .muted, .card-meta { color: #65717c; font-size: 13px; }
    header .muted { color: #bdc7d1; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }
    .card { background: white; border: 1px solid #d9e0e7; border-radius: 8px; padding: 16px; box-shadow: 0 1px 2px rgba(16, 24, 32, .04); }
    .summary-card { border-left: 4px solid #2d6cdf; }
    .compact { padding: 14px; }
    .badge { display: inline-block; background: #e8edf2; color: #26323b; border-radius: 999px; padding: 3px 8px; font-size: 12px; margin: 2px 4px 2px 0; }
    .confidence-low { background: #fff1d6; }
    .confidence-medium { background: #dceeff; }
    .confidence-high { background: #dff5e4; }
    table { width: 100%; border-collapse: collapse; background: white; border: 1px solid #d9e0e7; border-radius: 8px; overflow: hidden; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e7ecf1; font-size: 14px; }
    th { background: #eef2f5; color: #36434f; }
    tr:last-child td { border-bottom: 0; }
    details { background: white; border: 1px solid #d9e0e7; border-radius: 8px; padding: 14px 16px; }
    summary { cursor: pointer; font-weight: 700; }
    .internal-markers { border: 0; background: transparent; padding: 0; margin-top: 6px; }
    .internal-markers summary { color: #7a8792; font-size: 12px; font-weight: 600; }
    .timeline { list-style: none; padding: 0; margin: 14px 0 0; }
    .timeline-event { border-top: 1px solid #e7ecf1; padding: 12px 0; }
    .timeline-event:first-child { border-top: 0; }
    .empty { color: #65717c; font-style: italic; }
  </style>
</head>
<body>
  <main>
    <header>
      <div class="muted">Match : ${escapeHtml(report.matchId)}</div>
      <h1>Rapport du coach</h1>
      <div class="score">${escapeHtml(scoreText(report))}</div>
      <div class="muted">Généré depuis le rapport de match typé.</div>
    </header>

    ${renderSummary(report)}

    <section>
      <h2>Moments clés</h2>
      <div class="grid">${keyMoments}</div>
    </section>

    <section>
      <h2>Analyse du coach</h2>
      <div class="grid">${insights}</div>
    </section>

    <section>
      <h2>Diagnostic tactique</h2>
      <div class="grid">${diagnoses}</div>
    </section>

    <section>
      <h2>Avertissements structurés</h2>
      <div class="grid">${warnings}</div>
    </section>

    <section>
      <h2>Axe de travail recommandé</h2>
      <div class="grid">${focus}</div>
    </section>

    <section>
      <h2>Statistiques d'équipe</h2>
      <table>
        <thead><tr><th>Équipe</th><th>Score</th><th>Occasions</th><th>Pertes de balle / turnovers</th><th>Part des événements</th><th>Progressions</th><th>Actions décisives</th><th>Instabilité sous pression</th></tr></thead>
        <tbody>${teamStats}</tbody>
      </table>
    </section>

    <section>
      <h2>Analyse par zone</h2>
      <table>
        <thead><tr><th>Zone</th><th>Entrées</th><th>Progressions réussies</th><th>Stops défensifs</th><th>Actions décisives</th><th>Séquences sous pression</th></tr></thead>
        <tbody>${zoneStats}</tbody>
      </table>
    </section>

    <section>
      <h2>État physique</h2>
      ${renderFatigue(report)}
    </section>

    <section>
      <h2>Fil du match</h2>
      <details>
        <summary>Afficher les ${report.timeline.length} événements du match</summary>
        <ul class="timeline">${timeline}</ul>
      </details>
    </section>
  </main>
</body>
</html>`;
}
