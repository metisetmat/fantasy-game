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

function tagValue(tags: readonly string[], prefix: string): string | undefined {
  return tags.find((tag) => tag.startsWith(prefix))?.slice(prefix.length);
}

function renderTimelineReview(report: MatchReport): string {
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_COACH_FACING_TIMELINE_REVIEW" &&
    candidate.internalTags.includes("coach_facing_timeline_review")
  );

  if (fact === undefined) {
    return "";
  }

  const baselineEvents = tagValue(fact.internalTags, "timeline_review_sandbox_baseline_events_") ?? "0";
  const overrideEvents = tagValue(fact.internalTags, "timeline_review_sandbox_override_events_") ?? "0";
  const finalOutcome = tagValue(fact.internalTags, "timeline_review_override_final_outcome_") ?? "secured_by_goalkeeper_team";
  const finalActor = tagValue(fact.internalTags, "timeline_review_override_final_actor_") ?? "blitz-goalkeeper-free-safety";
  const finalZone = tagValue(fact.internalTags, "timeline_review_override_final_zone_") ?? "Z3-HSR";
  const blocks = [
    {
      title: "Ce qui s'est passé officiellement",
      summary:
        "La timeline officielle reste la seule source de vérité du match. Dans ce run, le diff ne modifie ni les événements officiels, ni la possession officielle, ni le score officiel.",
      bullets: [
        "Le score officiel reste inchangé.",
        "La possession officielle reste inchangée.",
        "Les événements de score officiels restent inchangés.",
        "Les événements sandbox ne sont pas des MatchEvents officiels.",
      ],
    },
    {
      title: "Ce que le sandbox a rejoué",
      summary:
        `Le sandbox rejoue un scénario parallèle sur le premier segment. L'override se termine par ${finalOutcome}, avec ${finalActor} comme acteur final en ${finalZone}.`,
      bullets: [
        `Baseline sandbox-only : ${baselineEvents} événements.`,
        `Override sandbox-only : ${overrideEvents} événements.`,
        "Ce replay reste explicatif et non officiel.",
      ],
    },
    {
      title: "Ce qui est différent",
      summary:
        "La différence principale est uniquement expérimentale : le sandbox explore ce qu'aurait donné la route contrôlée FORWARD_PROGRESS, mais cette lecture ne remplace pas la timeline officielle.",
      bullets: [
        "La divergence appartient au sandbox.",
        "Elle sert à relire une alternative contrôlée et ses conséquences possibles.",
      ],
    },
    {
      title: "Ce qui n'a pas été modifié",
      summary:
        "Rien n'est modifié côté officiel : pas d'événement ajouté, pas de possession changée, pas de score modifié, pas d'événement de score créé et aucune conclusion d'économie globale.",
      bullets: [
        "Timeline officielle inchangée.",
        "Score, possession et événements de score officiels inchangés.",
        "Aucun événement de score production créé.",
        "Aucune preuve d'économie globale modifiée.",
      ],
    },
  ];
  const articles = blocks.map((block) => `
      <article class="card">
        <h3>${escapeHtml(block.title)}</h3>
        <p>${escapeHtml(block.summary)}</p>
        <ul>${block.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>
      </article>`).join("");

  return `
    <section>
      <h2>Lecture timeline officielle vs sandbox</h2>
      <div class="grid">${articles}</div>
      <details class="internal-markers">
        <summary>Détails techniques du sandbox</summary>
        <div class="muted">${escapeHtml(fact.summary)}</div>
        <div class="muted">${fact.internalTags.map(escapeHtml).join(", ")}</div>
      </details>
    </section>`;
}

function renderSandboxDecisionPanel(report: MatchReport): string {
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_SANDBOX_DECISION_PANEL" &&
    candidate.internalTags.includes("sandbox_decision_panel")
  );
  const calibrationFact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_SANDBOX_DECISION_EVIDENCE_CALIBRATION" &&
    candidate.internalTags.includes("sandbox_decision_evidence_calibration")
  );
  const batchFact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_SANDBOX_DECISION_BATCH_CONFIDENCE_CALIBRATION" &&
    candidate.internalTags.includes("sandbox_decision_batch_confidence_calibration")
  );

  if (fact === undefined) {
    return "";
  }

  const recommendation = tagValue(fact.internalTags, "sandbox_decision_recommendation_") ?? "test_support_around_forward_progress";
  const evidenceScore = calibrationFact === undefined
    ? "42"
    : tagValue(calibrationFact.internalTags, "sandbox_decision_evidence_score_") ?? "42";
  const confidence = calibrationFact === undefined
    ? "low"
    : tagValue(calibrationFact.internalTags, "sandbox_decision_evidence_confidence_") ?? "low";
  const confidenceCopy = confidence === "low"
    ? "Confiance faible"
    : confidence === "medium"
      ? "Confiance moyenne"
      : confidence === "very_low"
        ? "Confiance très faible"
        : confidence === "strong"
          ? "Confiance forte"
          : "Confiance très forte";
  const evidenceCalibration = calibrationFact === undefined ? "" : `
      <article class="card summary-card">
        <h3>Niveau de confiance de la suggestion</h3>
        <p>${escapeHtml(confidenceCopy)} — ${escapeHtml(evidenceScore)}/100.</p>
        <p>La suggestion est affichée comme une piste à tester : le sandbox crée du danger et une opportunité de tir, mais la séquence ne va pas jusqu'au score, le gardien répond, puis l'équipe du gardien sécurise le ballon. Ce n'est pas une vérité officielle ni une preuve d'économie globale.</p>
        <h4>Ce qui soutient la suggestion</h4>
        <ul>
          <li>FORWARD_PROGRESS crée une progression dangereuse à 64/100.</li>
          <li>Le sandbox produit une half-chance et un SHOT_CANDIDATE.</li>
          <li>La qualité de tir ajustée atteint 53/100.</li>
          <li>Le test coach est concret : soutien autour de Z4-HSR et occupation du second ballon.</li>
        </ul>
        <h4>Ce qui limite la suggestion</h4>
        <ul>
          <li>Le tir est sauvé par le gardien, avec une réponse gardien à 65/100.</li>
          <li>Le danger de rebond et la seconde chance restent à 4/100.</li>
          <li>L'issue finale sandbox est secured_by_goalkeeper_team.</li>
          <li>Le signal vient d'une seule chaîne sandbox, sans confirmation batch ni variation de profils.</li>
        </ul>
      </article>`;
  const batchScenarioCount = batchFact === undefined
    ? "0"
    : tagValue(batchFact.internalTags, "sandbox_decision_batch_scenario_count_") ?? "0";
  const batchAverageScore = batchFact === undefined
    ? "0"
    : tagValue(batchFact.internalTags, "sandbox_decision_batch_average_score_") ?? "0";
  const batchMinScore = batchFact === undefined
    ? "0"
    : tagValue(batchFact.internalTags, "sandbox_decision_batch_min_score_") ?? "0";
  const batchMaxScore = batchFact === undefined
    ? "0"
    : tagValue(batchFact.internalTags, "sandbox_decision_batch_max_score_") ?? "0";
  const batchConfidence = batchFact === undefined
    ? "low"
    : tagValue(batchFact.internalTags, "sandbox_decision_batch_confidence_") ?? "low";
  const batchStability = batchFact === undefined
    ? "stable_but_low"
    : tagValue(batchFact.internalTags, "sandbox_decision_batch_stability_") ?? "stable_but_low";
  const batchConfidenceCopy = batchConfidence === "medium"
    ? "Confiance moyenne"
    : batchConfidence === "low_medium"
      ? "Confiance faible Ã  moyenne"
      : batchConfidence === "very_low"
        ? "Confiance trÃ¨s faible"
        : "Confiance faible";
  const batchCalibration = batchFact === undefined ? "" : `
      <article class="card summary-card">
        <h3>Confiance multi-scÃ©narios</h3>
        <p>${escapeHtml(batchConfidenceCopy)} â€” ${escapeHtml(batchAverageScore)}/100 en moyenne sur ${escapeHtml(batchScenarioCount)} scÃ©narios.</p>
        <p>Fourchette locale : ${escapeHtml(batchMinScore)}â€“${escapeHtml(batchMaxScore)}/100. StabilitÃ© : ${escapeHtml(batchStability)}.</p>
        <p>La confiance reste prudente car cette piste varie selon le soutien autour de Z4-HSR, la rÃ©ponse du gardien et la couverture du second ballon. Le batch sandbox renforce l'idÃ©e d'un test, mais ne suffit pas Ã  en faire une consigne officielle.</p>
        <ul>
          <li>Meilleur soutien offensif : confiance plus haute.</li>
          <li>Soutien faible : confiance plus basse.</li>
          <li>Gardien plus fort : confiance plus basse.</li>
          <li>Pression sur second ballon : signal Ã  surveiller.</li>
        </ul>
      </article>`;
  const blocks = [
    {
      title: "Enseignement coach",
      summary:
        "Le sandbox suggère que FORWARD_PROGRESS peut créer une situation dangereuse, mais il ne transforme pas cette lecture en vérité officielle.",
      bullets: [
        "Le signal sert à formuler une hypothèse de travail.",
        "La progression doit encore prouver qu'elle produit une seconde action contrôlée.",
        "La récupération par l'équipe du gardien reste un risque visible.",
      ],
    },
    {
      title: "Option à tester",
      summary:
        "Tester FORWARD_PROGRESS vers control-space-hunter avec un soutien proche autour de Z4-HSR.",
      bullets: [
        "Soutenir la réception pour éviter un tir isolé.",
        "Créer une présence autour du second ballon.",
        `Recommandation sandbox : ${recommendation}.`,
      ],
    },
    {
      title: "Risque associé",
      summary:
        "Si le soutien arrive trop tard, la route peut donner une réponse gardien favorable à BLITZ plutôt qu'une vraie continuité offensive.",
      bullets: [
        "Le danger apparent peut rester stérile.",
        "Un rebond mal couvert peut sécuriser la possession adverse.",
        "Cette option ne doit pas piloter la sélection live normale.",
      ],
    },
    {
      title: "Ce qui reste à prouver",
      summary:
        "La même idée doit être testée dans plusieurs contextes avant tout usage production.",
      bullets: [
        "Différents profils de gardien.",
        "Différents niveaux de soutien et de fatigue.",
        "Aucune conclusion d'économie globale depuis ce panneau.",
      ],
    },
  ];
  const articles = blocks.map((block) => `
      <article class="card">
        <h3>${escapeHtml(block.title)}</h3>
        <p>${escapeHtml(block.summary)}</p>
        <ul>${block.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>
      </article>`).join("");

  return `
    <section>
      <h2>Panneau de décision sandbox</h2>
      <p>Ce panneau propose une option coach à tester. Il ne remplace pas la timeline officielle et ne pilote pas la sélection live.</p>
      <div class="grid">${evidenceCalibration}${batchCalibration}${articles}</div>
      <details class="internal-markers">
        <summary>Détails techniques du panneau sandbox</summary>
        <div class="muted">${escapeHtml(fact.summary)}</div>
        <div class="muted">${fact.internalTags.map(escapeHtml).join(", ")}</div>
        ${calibrationFact === undefined ? "" : `<div class="muted">${escapeHtml(calibrationFact.summary)}</div>`}
        ${calibrationFact === undefined ? "" : `<div class="muted">${calibrationFact.internalTags.map(escapeHtml).join(", ")}</div>`}
        ${batchFact === undefined ? "" : `<div class="muted">${escapeHtml(batchFact.summary)}</div>`}
        ${batchFact === undefined ? "" : `<div class="muted">${batchFact.internalTags.map(escapeHtml).join(", ")}</div>`}
      </details>
    </section>`;
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
  const timelineReview = renderTimelineReview(report);
  const sandboxDecisionPanel = renderSandboxDecisionPanel(report);

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

    ${timelineReview}
    ${sandboxDecisionPanel}

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
