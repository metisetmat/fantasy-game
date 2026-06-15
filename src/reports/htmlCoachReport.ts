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
import { scoreSourceLabel } from "./scoreSourceLabel";

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

function renderScoreSourceNote(): string {
  const source = scoreSourceLabel("full_match_report");

  return `
      <div class="score-source">
        <strong>${escapeHtml(source.label)}</strong>
        <span>${escapeHtml(source.compactNote)}</span>
      </div>`;
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

function isTechnicalGroundingDiagnosis(diagnosis: TacticalDiagnosis): boolean {
  return diagnosis.title.includes("Ancrage workbench") ||
    diagnosis.title.includes("Ancrage tactique full-match");
}

function renderTechnicalGroundingDiagnosis(diagnosis: TacticalDiagnosis): string {
  return `
    <article class="card">
      <div class="card-meta">Équipe ${escapeHtml(diagnosis.teamId)} ${renderConfidence(diagnosis.confidence)}</div>
      <h3>Limite actuelle du harnais expérimental</h3>
      <p>Le moteur utilise encore un harnais expérimental : certaines lectures sandbox servent à expliquer des pistes de test, mais elles ne modifient pas la timeline officielle, le score, la possession ou les événements de score.</p>
      <div class="zones">Zones: ${diagnosis.affectedZones.map(renderBadge).join(" ") || renderBadge("none")}</div>
      <details class="internal-markers">
        <summary>Détails techniques développeur</summary>
        <div class="muted">Titre source : ${escapeHtml(diagnosis.title)}</div>
        <div class="muted">${escapeHtml(diagnosis.summary)}</div>
        <div class="muted">Événements de preuve : ${diagnosis.evidenceEventIds.map(escapeHtml).join(", ") || "aucun"}</div>
      </details>
    </article>`;
}

function renderDiagnosis(diagnosis: TacticalDiagnosis): string {
  if (isTechnicalGroundingDiagnosis(diagnosis)) {
    return renderTechnicalGroundingDiagnosis(diagnosis);
  }

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
  if (warning.title.includes("Ancrage workbench") || warning.title.includes("Ancrage tactique full-match")) {
    return `
    <article class="card">
      <div class="card-meta">${renderBadge(warning.severity)} ${renderBadge(warning.scope)}</div>
      <h3>Limite actuelle du harnais expérimental</h3>
      <p>Le moteur utilise encore un harnais expérimental : certaines lectures sandbox servent à expliquer des pistes de test, mais elles ne modifient pas la timeline officielle, le score, la possession ou les événements de score.</p>
      <details class="internal-markers">
        <summary>Détails techniques développeur</summary>
        <div class="muted">Titre source : ${escapeHtml(warning.title)}</div>
        <div class="muted">${escapeHtml(warning.coachSummary)}</div>
        <div class="muted">Type : ${escapeHtml(warning.type)}</div>
        <div class="muted">Faits d'évidence : ${warning.evidenceFactIds.map(escapeHtml).join(", ") || "aucun"}</div>
        <div class="muted">Événements : ${warning.eventIds.map(escapeHtml).join(", ") || "aucun"}</div>
        <div class="muted">${escapeHtml(warning.technicalSummary)}</div>
      </details>
    </article>`;
  }

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
      <p>Cette piste reste une suggestion sandbox, pas une consigne officielle. Elle ne modifie ni la timeline officielle, ni le score, ni la possession, ni les événements de score. Elle ne constitue pas une preuve d’économie globale.</p>
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

function confidenceLabel(value: string): string {
  switch (value) {
    case "medium":
      return "moyenne";
    case "low_medium":
      return "faible à moyenne";
    case "low":
    default:
      return "faible";
  }
}

function renderMultiScenarioCoachTestPlan(report: MatchReport): string {
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_MULTI_SCENARIO_COACH_TEST_PLAN" &&
    candidate.internalTags.includes("workbench_chain_multi_scenario_coach_test_plan")
  );

  if (fact === undefined) {
    return "";
  }

  const supportScenario = tagValue(fact.internalTags, "multi_scenario_test_support_around_z4_hsr_scenario_") ??
    "batch-scenario-better-attacking-support";
  const secondBallScenario = tagValue(fact.internalTags, "multi_scenario_test_second_ball_occupation_scenario_") ??
    "batch-scenario-better-attacking-rebound-pressure";
  const goalkeeperScenario = tagValue(fact.internalTags, "multi_scenario_test_strong_goalkeeper_fallback_scenario_") ??
    "batch-scenario-stronger-goalkeeper";
  const supportConfidence = confidenceLabel(
    tagValue(fact.internalTags, "multi_scenario_test_support_around_z4_hsr_confidence_") ?? "low",
  );
  const secondBallConfidence = confidenceLabel(
    tagValue(fact.internalTags, "multi_scenario_test_second_ball_occupation_confidence_") ?? "low",
  );
  const goalkeeperConfidence = confidenceLabel(
    tagValue(fact.internalTags, "multi_scenario_test_strong_goalkeeper_fallback_confidence_") ?? "low",
  );
  const tests = [
    {
      title: "Renforcer le soutien autour de Z4-HSR",
      summary:
        "Tester FORWARD_PROGRESS vers control-space-hunter avec un soutien plus proche autour de Z4-HSR. Le scénario avec meilleur soutien offensif est celui qui améliore le plus la piste, mais le signal reste local et ne prouve pas encore que la route est supérieure.",
      scenario: supportScenario,
      expectedSignal: "meilleure continuité après tir / meilleure présence au second ballon",
      risk: "tir isolé si le soutien arrive trop tard",
      confidence: supportConfidence,
      unproven: "La supériorité de la route reste non prouvée dans l'économie officielle.",
    },
    {
      title: "Mieux occuper le second ballon",
      summary:
        "Tester une présence plus agressive autour du rebond après tir. Le but est de vérifier si CONTROL peut transformer une parade du gardien en seconde action plutôt qu'en récupération propre par BLITZ.",
      scenario: secondBallScenario,
      expectedSignal: "la probabilité de seconde chance progresse",
      risk: "sur-engagement et exposition de la rest-defense",
      confidence: secondBallConfidence,
      unproven: "Le modèle ne prouve pas encore que cette occupation reste sûre contre une transition adverse.",
    },
    {
      title: "Prévoir la réaction au gardien fort",
      summary:
        "Tester un plan B si le gardien adverse gagne la séquence. Le scénario avec gardien plus fort fait chuter la confiance : la progression peut créer du danger, mais finir en récupération adverse.",
      scenario: goalkeeperScenario,
      expectedSignal: "continuité plus sûre ou meilleure pression après arrêt",
      risk: "gardien plus fort qui neutralise l'attaque",
      confidence: goalkeeperConfidence,
      unproven: "La réponse au gardien fort reste une hypothèse locale, pas une consigne officielle.",
    },
  ];
  const cards = tests.map((test) => `
      <article class="card">
        <h3>${escapeHtml(test.title)}</h3>
        <p>${escapeHtml(test.summary)}</p>
        <ul>
          <li><strong>Scénario lié :</strong> ${escapeHtml(test.scenario)}</li>
          <li><strong>Signal utile attendu :</strong> ${escapeHtml(test.expectedSignal)}</li>
          <li><strong>Risque à surveiller :</strong> ${escapeHtml(test.risk)}</li>
          <li><strong>Confiance :</strong> ${escapeHtml(test.confidence)}</li>
          <li><strong>Ce qui reste non prouvé :</strong> ${escapeHtml(test.unproven)}</li>
        </ul>
      </article>`).join("");

  return `
    <section>
      <h2>Plan de test coach</h2>
      <p>Ces tests sont des hypothèses issues du sandbox, pas des consignes officielles.</p>
      <p>Ils ne modifient ni la timeline officielle, ni le score, ni la possession, ni les événements de score.</p>
      <p>Ils ne constituent pas une preuve d’économie globale.</p>
      <div class="grid">${cards}</div>
      <details class="internal-markers">
        <summary>Détails techniques du plan de test</summary>
        <div class="muted">${escapeHtml(fact.summary)}</div>
        <div class="muted">${fact.internalTags.map(escapeHtml).join(", ")}</div>
      </details>
    </section>`;
}

function renderSelectionPreview(report: MatchReport): string {
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_SELECTION_PREVIEW" &&
    candidate.internalTags.includes("workbench_chain_selection_preview")
  );

  if (fact === undefined) {
    return "";
  }

  const supportScenario = tagValue(fact.internalTags, "selection_preview_support_near_z4_hsr_scenario_") ??
    "batch-scenario-better-attacking-support";
  const secondBallScenario = tagValue(fact.internalTags, "selection_preview_second_ball_presence_scenario_") ??
    "batch-scenario-better-attacking-rebound-pressure";
  const goalkeeperScenario = tagValue(fact.internalTags, "selection_preview_strong_goalkeeper_response_scenario_") ??
    "batch-scenario-stronger-goalkeeper";
  const cards = [
    {
      title: "Soutien proche autour de Z4-HSR",
      linkedTest: "support_around_z4_hsr",
      scenario: supportScenario,
      suggestedProfile: "Profil à prévisualiser : soutien mobile proche de Z4-HSR.",
      roleFamily: "support runner / mobile lock / hook link / playmaker support",
      attributes: "anticipation, handling, off-ball support, stamina",
      benefit:
        "Prévisualiser un joueur de soutien plus proche de Z4-HSR autour de control-space-hunter. L'objectif est de réduire le risque de tir isolé et d'offrir une solution immédiate après la progression.",
      tradeoff:
        "Plus de soutien offensif peut exposer la rest-defense si le ballon est perdu ou repoussé.",
      observation:
        "Vérifier si la progression mène à une continuité contrôlée plutôt qu'à une récupération adverse.",
      confidence: "faible à moyenne",
    },
    {
      title: "Présence sur second ballon",
      linkedTest: "second_ball_occupation",
      scenario: secondBallScenario,
      suggestedProfile: "Profil à prévisualiser : chasseur de rebond et coureur de pression.",
      roleFamily: "rebound chaser / pressure forward / high work-rate runner",
      attributes: "anticipation, aggression, reaction, acceleration, balance",
      benefit:
        "Prévisualiser un profil capable d'attaquer le second ballon après une parade. L'objectif est de transformer un tir repoussé en seconde action plutôt qu'en récupération propre par BLITZ.",
      tradeoff:
        "Presser le second ballon peut augmenter la fatigue et ouvrir une transition si la récupération échoue.",
      observation:
        "Vérifier si la pression au rebond augmente les secondes chances sans désorganiser la structure défensive.",
      confidence: "faible à moyenne",
    },
    {
      title: "Réponse face à un gardien fort",
      linkedTest: "strong_goalkeeper_fallback",
      scenario: goalkeeperScenario,
      suggestedProfile: "Profil à prévisualiser : option de continuité plus sûre après arrêt.",
      roleFamily: "safer continuity option / secondary playmaker / support receiver / rest-defense anchor",
      attributes: "decision-making, positioning, composure, tactical discipline",
      benefit:
        "Prévisualiser une solution de continuité si le gardien adverse neutralise le tir. L'objectif est de ne pas dépendre uniquement d'une frappe directe et de préparer une sortie sûre après l'arrêt.",
      tradeoff:
        "Un plan B plus prudent peut réduire la menace immédiate, mais stabiliser la séquence si le gardien gagne le duel.",
      observation:
        "Vérifier si l'équipe garde une structure utile après un arrêt du gardien au lieu de subir une récupération adverse.",
      confidence: "faible",
    },
  ];
  const cardHtml = cards.map((card) => `
      <article class="card">
        <h3>${escapeHtml(card.title)}</h3>
        <p>${escapeHtml(card.benefit)}</p>
        <ul>
          <li><strong>Test coach lié :</strong> ${escapeHtml(card.linkedTest)}</li>
          <li><strong>Scénario lié :</strong> ${escapeHtml(card.scenario)}</li>
          <li><strong>Profil suggéré :</strong> ${escapeHtml(card.suggestedProfile)}</li>
          <li><strong>Famille de rôle :</strong> ${escapeHtml(card.roleFamily)}</li>
          <li><strong>Attributs utiles :</strong> ${escapeHtml(card.attributes)}</li>
          <li><strong>Risque / compromis :</strong> ${escapeHtml(card.tradeoff)}</li>
          <li><strong>À observer :</strong> ${escapeHtml(card.observation)}</li>
          <li><strong>Confiance :</strong> ${escapeHtml(card.confidence)}</li>
        </ul>
        <p class="muted">Prévisualisation uniquement : aucune application automatique.</p>
      </article>`).join("");

  return `
    <section>
      <h2>Prévisualisation de sélection</h2>
      <p>Ces profils sont des pistes de sélection à prévisualiser, pas des changements appliqués.</p>
      <p>Cette prévisualisation reste fondée sur un signal sandbox local. Elle devra être confirmée par les futures traces de match complet.</p>
      <p>Aucune composition, aucun titulaire, aucun remplaçant et aucune sélection live ne sont modifiés.</p>
      <p>Cette prévisualisation ne modifie ni la timeline officielle, ni le score, ni la possession, ni les événements de score.</p>
      <p>Elle ne constitue pas une preuve d’économie globale.</p>
      <div class="grid">${cardHtml}</div>
      <details class="internal-markers">
        <summary>Détails techniques de la prévisualisation</summary>
        <div class="muted">${escapeHtml(fact.summary)}</div>
        <div class="muted">${fact.internalTags.map(escapeHtml).join(", ")}</div>
      </details>
    </section>`;
}

function renderMatchTraceSpine(report: MatchReport): string {
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_MATCH_EVENT_TRACE_SPINE" &&
    candidate.internalTags.includes("workbench_chain_match_event_trace_spine")
  );

  if (fact === undefined) {
    return "";
  }

  return `
    <section>
      <h2>Colonne de traces de match</h2>
      <p>Le moteur commence à produire des traces structurées pour expliquer les actions simulées. Ces traces servent à préparer les futurs rapports coach, mais elles ne modifient pas le match officiel.</p>
      <details class="internal-markers">
        <summary>Détails techniques des traces</summary>
        <div class="muted">${escapeHtml(fact.summary)}</div>
        <div class="muted">${fact.internalTags.map(escapeHtml).join(", ")}</div>
      </details>
    </section>`;
}

function renderMatchTraceAggregator(report: MatchReport): string {
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_MATCH_TRACE_AGGREGATOR" &&
    candidate.internalTags.includes("workbench_chain_match_trace_aggregator")
  );

  if (fact === undefined) {
    return "";
  }

  const status = tagValue(fact.internalTags, "match_trace_aggregator_status_") ?? "available";
  const inputTraceCount = tagValue(fact.internalTags, "match_trace_aggregator_input_trace_count_") ?? "0";
  const deduplicatedTraceCount = tagValue(fact.internalTags, "match_trace_aggregator_deduplicated_trace_count_") ?? "0";
  const duplicateTraceCount = tagValue(fact.internalTags, "match_trace_aggregator_duplicate_trace_count_") ?? "0";
  const officialTraceCount = tagValue(fact.internalTags, "match_trace_aggregator_official_trace_count_") ?? "0";
  const diagnosticTraceCount = tagValue(fact.internalTags, "match_trace_aggregator_diagnostic_trace_count_") ?? "0";
  const sandboxTraceCount = tagValue(fact.internalTags, "match_trace_aggregator_sandbox_trace_count_") ?? "0";

  return `
    <section>
      <h2>AgrÃ©gats de traces de match</h2>
      <p>Le moteur regroupe maintenant les traces de match pour prÃ©parer les futurs diagnostics coach. Les agrÃ©gats officiels, diagnostics et sandbox restent sÃ©parÃ©s afin d'Ã©viter les doubles comptes et les conclusions trop fortes.</p>
      <p>La prÃ©visualisation de sÃ©lection reste fondÃ©e sur un signal sandbox. L'agrÃ©gateur est une premiÃ¨re Ã©tape vers une confiance future fondÃ©e sur les traces, mais aucune confiance de prÃ©visualisation n'est relevÃ©e dans ce sprint.</p>
      <ul>
        <li><strong>Statut :</strong> ${escapeHtml(status)}</li>
        <li><strong>Traces entrantes :</strong> ${escapeHtml(inputTraceCount)}</li>
        <li><strong>Traces dÃ©dupliquÃ©es :</strong> ${escapeHtml(deduplicatedTraceCount)}</li>
        <li><strong>Doublons Ã©cartÃ©s :</strong> ${escapeHtml(duplicateTraceCount)}</li>
        <li><strong>Officiel / diagnostic / sandbox :</strong> ${escapeHtml(officialTraceCount)} / ${escapeHtml(diagnosticTraceCount)} / ${escapeHtml(sandboxTraceCount)}</li>
      </ul>
      <details class="internal-markers">
        <summary>DÃ©tails techniques des agrÃ©gats</summary>
        <div class="muted">${escapeHtml(fact.summary)}</div>
        <div class="muted">${fact.internalTags.map(escapeHtml).join(", ")}</div>
      </details>
    </section>`;
}

function itemListFromTag(fact: MatchReport["evidenceFacts"][number], prefix: string, empty: string): string[] {
  const value = tagValue(fact.internalTags, prefix);
  if (value === undefined || value === "none") {
    return [empty];
  }

  return value.split("|").map((item) => {
    const [label, count] = item.split(":");
    if (label === undefined || label.length === 0) {
      return empty;
    }
    return count === undefined ? label : `${label} : ${count}`;
  });
}

function renderTraceV0Card(input: {
  readonly title: string;
  readonly summary: string;
  readonly bullets: readonly string[];
}): string {
  return `
      <article class="card">
        <h3>${escapeHtml(input.title)}</h3>
        <p>${escapeHtml(input.summary)}</p>
        <ul>${input.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>
      </article>`;
}

function renderCoachReportFromTraceAggregates(report: MatchReport): string {
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_COACH_REPORT_FROM_TRACE_AGGREGATES" &&
    candidate.internalTags.includes("workbench_chain_coach_report_from_trace_aggregates")
  );

  if (fact === undefined) {
    return "";
  }

  const cardCount = tagValue(fact.internalTags, "coach_report_trace_aggregates_card_count_") ?? "0";
  const officialTraceCount = tagValue(fact.internalTags, "coach_report_trace_aggregates_official_trace_count_") ?? "0";
  const diagnosticTraceCount = tagValue(fact.internalTags, "coach_report_trace_aggregates_diagnostic_trace_count_") ?? "0";
  const sandboxTraceCount = tagValue(fact.internalTags, "coach_report_trace_aggregates_sandbox_trace_count_") ?? "0";
  const highPressureTraceCount = tagValue(fact.internalTags, "coach_report_trace_aggregates_high_pressure_trace_count_") ?? "0";
  const fatigueImpactTotal = tagValue(fact.internalTags, "coach_report_trace_aggregates_fatigue_impact_total_") ?? "0";
  const dangerZones = itemListFromTag(
    fact,
    "coach_report_trace_aggregates_danger_zone_items_",
    "Aucune zone de danger officielle ne ressort nettement dans ce run.",
  );
  const pressureLossZones = itemListFromTag(
    fact,
    "coach_report_trace_aggregates_pressure_loss_zone_items_",
    "Aucune zone de perte sous haute pression ne domine le signal officiel.",
  );
  const possessionLossZones = itemListFromTag(
    fact,
    "coach_report_trace_aggregates_possession_loss_zone_items_",
    "Les pertes de possession restent dispersÃ©es dans ce run.",
  );
  const recoveryZones = itemListFromTag(
    fact,
    "coach_report_trace_aggregates_recovery_zone_items_",
    "Aucune zone de rÃ©cupÃ©ration ne ressort fortement dans les traces officielles.",
  );
  const players = itemListFromTag(
    fact,
    "coach_report_trace_aggregates_player_involvement_items_",
    "Aucun joueur ne concentre encore clairement les traces officielles significatives.",
  );
  const causes = itemListFromTag(
    fact,
    "coach_report_trace_aggregates_cause_items_",
    "Aucune cause officielle ne revient assez souvent pour ressortir clairement.",
  );
  const impacts = itemListFromTag(
    fact,
    "coach_report_trace_aggregates_impact_items_",
    "Aucun impact officiel ne domine nettement.",
  );
  const firstDangerZone = dangerZones[0];
  const watchpoint = pressureLossZones.length > 0 && !pressureLossZones[0]?.startsWith("Aucune zone")
    ? "Ã€ surveiller : les sorties sous pression restent un signal officiel Ã  confirmer sur plusieurs matchs."
    : firstDangerZone !== undefined && dangerZones.length === 1 && !firstDangerZone.startsWith("Aucune zone")
      ? `Ã€ vÃ©rifier : la menace semble concentrÃ©e autour de ${firstDangerZone.split(":")[0]?.trim() ?? "une zone"} dans ce run.`
      : "Signal Ã  confirmer : les agrÃ©gats officiels donnent une premiÃ¨re lecture, mais elle doit rester prudente.";
  const cards = [
    renderTraceV0Card({
      title: "Zones de danger",
      summary:
        "Les zones de danger ressortent des traces officielles. Elles indiquent oÃ¹ l'Ã©quipe a le plus souvent crÃ©Ã© une progression dangereuse, une ligne cassÃ©e ou une situation favorable.",
      bullets: [...dangerZones, "Signal officiel dans ce run, Ã  confirmer sur plusieurs matchs."],
    }),
    renderTraceV0Card({
      title: "Pertes sous pression",
      summary:
        "Les pertes sous pression montrent oÃ¹ l'Ã©quipe a le plus souvent perdu la continuitÃ© quand la pression adverse Ã©tait forte.",
      bullets: [
        ...pressureLossZones.map((item) => `Sous haute pression : ${item}`),
        ...possessionLossZones.map((item) => `Perte de possession : ${item}`),
        `Traces haute pression utilisees : ${highPressureTraceCount}.`,
      ],
    }),
    renderTraceV0Card({
      title: "RÃ©cupÃ©rations utiles",
      summary:
        "Les rÃ©cupÃ©rations utiles indiquent les zones oÃ¹ l'Ã©quipe a interrompu ou sÃ©curisÃ© une sÃ©quence.",
      bullets: recoveryZones,
    }),
    renderTraceV0Card({
      title: "Joueurs impliquÃ©s",
      summary:
        "Les joueurs les plus impliquÃ©s sont ceux qui apparaissent le plus souvent dans les traces officielles significatives. Ce n'est pas encore une note de performance individuelle.",
      bullets: [...players, "Lecture prudente : ce n'est pas une note individuelle ni une dÃ©cision de sÃ©lection."],
    }),
    renderTraceV0Card({
      title: "Causes rÃ©currentes",
      summary:
        "Les causes rÃ©currentes regroupent les signaux qui reviennent dans les traces officielles : soutien, pression, fatigue, dÃ©cision, rÃ©cupÃ©ration ou qualitÃ© gardien.",
      bullets: [...causes, ...impacts, `Impact fatigue total : ${fatigueImpactTotal}.`],
    }),
    renderTraceV0Card({
      title: "Point de vigilance coach",
      summary:
        "Ce point de vigilance reste une piste prudente issue des agrÃ©gats officiels du run, pas une preuve globale.",
      bullets: [watchpoint],
    }),
  ].join("");

  return `
    <section>
      <h2>Rapport coach depuis les agrÃ©gats officiels</h2>
      <p>Cette lecture s'appuie d'abord sur les agrÃ©gats officiels du match. Les diagnostics et le sandbox restent sÃ©parÃ©s et ne sont pas utilisÃ©s comme vÃ©ritÃ© officielle.</p>
      <div class="grid">${cards}</div>
      <details class="internal-markers">
        <summary>DÃ©tails techniques du rapport depuis agrÃ©gats</summary>
        <div class="muted">Cartes : ${escapeHtml(cardCount)}. Traces officielles : ${escapeHtml(officialTraceCount)}. Diagnostics : ${escapeHtml(diagnosticTraceCount)}. Sandbox : ${escapeHtml(sandboxTraceCount)}.</div>
        <div class="muted">${escapeHtml(fact.summary)}</div>
        <div class="muted">${fact.internalTags.map(escapeHtml).join(", ")}</div>
      </details>
    </section>`;
}

function renderV1Badge(label: string, value: string): string {
  return `<span class="badge">${escapeHtml(`${label} : ${value}`)}</span>`;
}

function confidenceReasonForV1(title: string, confidence: "low" | "medium" | "high", emptyState: boolean): string {
  if (emptyState) {
    return "État vide volontaire : le rapport refuse de cartographier une zone instable.";
  }
  if (confidence === "medium") {
    return "Signal répété dans les agrégats officiels, à confirmer sur plusieurs matchs.";
  }
  if (confidence === "high") {
    return "Signal officiel très dense dans ce run, sans diagnostic ni sandbox comme vérité.";
  }

  return `${title} reste un signal officiel prudent, encore limité par le volume de traces.`;
}

function renderV1Card(input: {
  readonly title: string;
  readonly summary: string;
  readonly bullets: readonly string[];
  readonly confidence: "low" | "medium" | "high";
  readonly emptyState?: boolean;
}): string {
  const emptyState = input.emptyState ?? false;
  const confidenceLabel = confidenceText(input.confidence).replace("Confiance ", "");

  return `
      <article class="card coach-v1-card${emptyState ? " empty-state" : ""}">
        <div>${renderV1Badge("Source", "Officiel")} ${renderV1Badge("Confiance", confidenceLabel)}</div>
        <h3>${escapeHtml(input.title)}</h3>
        <p>${escapeHtml(input.summary)}</p>
        <ul>${input.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>
        <p class="card-meta">${escapeHtml(confidenceReasonForV1(input.title, input.confidence, emptyState))}</p>
      </article>`;
}

function confidenceFromTraceTag(fact: MatchReport["evidenceFacts"][number], cardId: string): "low" | "medium" | "high" {
  if (fact.internalTags.includes(`coach_report_trace_aggregates_card_${cardId}_confidence_high`)) {
    return "high";
  }
  if (fact.internalTags.includes(`coach_report_trace_aggregates_card_${cardId}_confidence_medium`)) {
    return "medium";
  }
  return "low";
}

function renderCoachReportV1Visualization(report: MatchReport): string {
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_COACH_REPORT_V1_VISUALIZATION" &&
    candidate.internalTags.includes("workbench_chain_coach_report_v1_visualization")
  );
  const traceFact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_COACH_REPORT_FROM_TRACE_AGGREGATES" &&
    candidate.internalTags.includes("workbench_chain_coach_report_from_trace_aggregates")
  );

  if (fact === undefined || traceFact === undefined) {
    return "";
  }

  const cardCount = tagValue(fact.internalTags, "coach_report_v1_card_count_") ?? "0";
  const officialCardsCount = tagValue(fact.internalTags, "coach_report_v1_official_cards_count_") ?? "0";
  const emptyPressureLoss = tagValue(fact.internalTags, "coach_report_v1_empty_pressure_loss_zone_state_") === "true";
  const officialTraceCount = tagValue(fact.internalTags, "coach_report_v1_official_trace_count_") ?? "0";
  const dangerZones = itemListFromTag(
    traceFact,
    "coach_report_trace_aggregates_danger_zone_items_",
    "Aucune zone de danger officielle ne ressort nettement dans ce run.",
  );
  const pressureLossZones = emptyPressureLoss
    ? ["Pression détectée, mais les zones de perte sous pression ne sont pas encore assez stabilisées pour être cartographiées."]
    : itemListFromTag(
        traceFact,
        "coach_report_trace_aggregates_pressure_loss_zone_items_",
        "Aucune zone de perte sous haute pression ne domine le signal officiel.",
      );
  const recoveryZones = itemListFromTag(
    traceFact,
    "coach_report_trace_aggregates_recovery_zone_items_",
    "Aucune zone de récupération ne ressort fortement dans les traces officielles.",
  );
  const players = itemListFromTag(
    traceFact,
    "coach_report_trace_aggregates_player_involvement_items_",
    "Aucun joueur ne concentre encore clairement les traces officielles significatives.",
  );
  const causes = itemListFromTag(
    traceFact,
    "coach_report_trace_aggregates_cause_items_",
    "Aucune cause officielle ne revient assez souvent pour ressortir clairement.",
  );
  const impacts = itemListFromTag(
    traceFact,
    "coach_report_trace_aggregates_impact_items_",
    "Aucun impact officiel ne domine nettement.",
  );
  const watchpointRaw = tagValue(fact.internalTags, "coach_report_v1_watchpoint_") ?? "Signal à confirmer.";
  const watchpoint = watchpointRaw.replaceAll("_", " ");
  const executiveBullets = [
    `Danger : ${dangerZones[0] ?? "aucun signal dominant"}`,
    `Récupération : ${recoveryZones[0] ?? "aucun signal dominant"}`,
    `Implication : ${players[0] ?? "aucun joueur dominant"}`,
    `Point de vigilance : ${watchpoint}`,
  ];
  const signalCards = [
    renderV1Card({
      title: "Synthèse coach",
      summary: `Score final : ${scoreText(report)}. Lecture officielle compacte des signaux les plus visibles.`,
      bullets: executiveBullets,
      confidence: Number(officialTraceCount) >= 20 ? "medium" : "low",
    }),
    renderV1Card({
      title: "Carte signal — Danger officiel",
      summary: "Où le match a produit des progressions dangereuses ou des situations favorables.",
      bullets: dangerZones.slice(0, 3),
      confidence: confidenceFromTraceTag(traceFact, "official_danger_zones"),
    }),
    renderV1Card({
      title: "Carte signal — Pression et pertes",
      summary: "Où la continuité s'est fragilisée sous pression adverse.",
      bullets: pressureLossZones.slice(0, 3),
      confidence: confidenceFromTraceTag(traceFact, "official_pressure_losses"),
      emptyState: emptyPressureLoss,
    }),
    renderV1Card({
      title: "Carte signal — Récupérations",
      summary: "Où l'équipe a interrompu ou sécurisé une séquence.",
      bullets: recoveryZones.slice(0, 3),
      confidence: confidenceFromTraceTag(traceFact, "official_recoveries"),
    }),
    renderV1Card({
      title: "Carte signal — Causes et impacts",
      summary: "Les libellés français ci-dessous viennent des agrégats officiels, pas du sandbox.",
      bullets: [...causes, ...impacts].slice(0, 6),
      confidence: confidenceFromTraceTag(traceFact, "official_recurring_causes"),
    }),
    renderV1Card({
      title: "Carte signal — Point de vigilance",
      summary: "Piste prudente issue des agrégats officiels du run.",
      bullets: [watchpoint],
      confidence: confidenceFromTraceTag(traceFact, "official_coach_watchpoint"),
    }),
  ].join("");
  const zoneCards = [
    renderV1Card({
      title: "Zone signal — Danger",
      summary: "Lecture zone par zone du danger officiel.",
      bullets: dangerZones.slice(0, 3),
      confidence: confidenceFromTraceTag(traceFact, "official_danger_zones"),
    }),
    renderV1Card({
      title: "Zone signal — Perte sous pression",
      summary: "Le rapport cartographie seulement un signal stabilisé.",
      bullets: pressureLossZones.slice(0, 3),
      confidence: confidenceFromTraceTag(traceFact, "official_pressure_losses"),
      emptyState: emptyPressureLoss,
    }),
    renderV1Card({
      title: "Zone signal — Récupération",
      summary: "Lecture zone par zone des récupérations utiles.",
      bullets: recoveryZones.slice(0, 3),
      confidence: confidenceFromTraceTag(traceFact, "official_recoveries"),
    }),
  ].join("");
  const playerCard = renderV1Card({
    title: "Implication joueurs",
    summary: "Ce bloc mesure l’implication dans les traces officielles, pas une note individuelle complète.",
    bullets: players.slice(0, 4),
    confidence: confidenceFromTraceTag(traceFact, "official_player_involvement"),
  });

  return `
    <section class="coach-report-v1">
      <h2>Rapport coach V1 — lecture visuelle des agrégats officiels</h2>
      <p>Cette lecture visuelle s’appuie d’abord sur les agrégats officiels du match. Les diagnostics et le sandbox restent séparés : ils servent à expliquer ou tester, pas à établir la vérité officielle.</p>
      <h3>Lecture rapide</h3>
      <div class="grid">${signalCards}</div>
      <h3>Signaux par zone</h3>
      <div class="grid">${zoneCards}</div>
      <h3>Implication et causes</h3>
      <div class="grid">${playerCard}</div>
      <details class="internal-markers">
        <summary>Détails techniques du rapport V1</summary>
        <div class="muted">Cartes : ${escapeHtml(cardCount)}. Cartes officielles : ${escapeHtml(officialCardsCount)}. Traces officielles : ${escapeHtml(officialTraceCount)}.</div>
        <div class="muted">${escapeHtml(fact.summary)}</div>
        <div class="muted">${fact.internalTags.map(escapeHtml).join(", ")}</div>
      </details>
    </section>`;
}

function hasCoachReportV1InformationHierarchy(report: MatchReport): boolean {
  return report.evidenceFacts.some((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_COACH_REPORT_V1_INFORMATION_HIERARCHY" &&
    candidate.internalTags.includes("workbench_chain_coach_report_v1_information_hierarchy")
  );
}

function renderCoachReportV1InformationHierarchy(report: MatchReport): string {
  const hierarchyFact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_COACH_REPORT_V1_INFORMATION_HIERARCHY" &&
    candidate.internalTags.includes("workbench_chain_coach_report_v1_information_hierarchy")
  );
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_COACH_REPORT_V1_VISUALIZATION" &&
    candidate.internalTags.includes("workbench_chain_coach_report_v1_visualization")
  );
  const traceFact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_COACH_REPORT_FROM_TRACE_AGGREGATES" &&
    candidate.internalTags.includes("workbench_chain_coach_report_from_trace_aggregates")
  );

  if (hierarchyFact === undefined || fact === undefined || traceFact === undefined) {
    return "";
  }

  const cardCount = tagValue(fact.internalTags, "coach_report_v1_card_count_") ?? "0";
  const officialCardsCount = tagValue(fact.internalTags, "coach_report_v1_official_cards_count_") ?? "0";
  const emptyPressureLoss = tagValue(fact.internalTags, "coach_report_v1_empty_pressure_loss_zone_state_") === "true";
  const officialTraceCount = tagValue(fact.internalTags, "coach_report_v1_official_trace_count_") ?? "0";
  const dangerZones = itemListFromTag(
    traceFact,
    "coach_report_trace_aggregates_danger_zone_items_",
    "Aucune zone de danger officielle ne ressort nettement dans ce run.",
  );
  const pressureLossZones = emptyPressureLoss
    ? ["Pression détectée, mais les zones de perte sous pression ne sont pas encore assez stabilisées pour être cartographiées."]
    : itemListFromTag(
        traceFact,
        "coach_report_trace_aggregates_pressure_loss_zone_items_",
        "Aucune zone de perte sous haute pression ne domine le signal officiel.",
      );
  const recoveryZones = itemListFromTag(
    traceFact,
    "coach_report_trace_aggregates_recovery_zone_items_",
    "Aucune zone de récupération ne ressort fortement dans les traces officielles.",
  );
  const players = itemListFromTag(
    traceFact,
    "coach_report_trace_aggregates_player_involvement_items_",
    "Aucun joueur ne concentre encore clairement les traces officielles significatives.",
  );
  const causes = itemListFromTag(
    traceFact,
    "coach_report_trace_aggregates_cause_items_",
    "Aucune cause officielle ne revient assez souvent pour ressortir clairement.",
  );
  const impacts = itemListFromTag(
    traceFact,
    "coach_report_trace_aggregates_impact_items_",
    "Aucun impact officiel ne domine nettement.",
  );
  const watchpointRaw = tagValue(fact.internalTags, "coach_report_v1_watchpoint_") ?? "Signal à confirmer.";
  const watchpoint = watchpointRaw.replaceAll("_", " ");
  const confidence = Number(officialTraceCount) >= 20 ? "medium" : "low";
  const executiveBullets = [
    `Danger : ${dangerZones[0] ?? "aucun signal dominant"}`,
    `Récupération : ${recoveryZones[0] ?? "aucun signal dominant"}`,
    `Implication : ${players[0] ?? "aucun joueur dominant"}`,
    `Point de vigilance : ${watchpoint}`,
  ];
  const officialReadingCards = [
    renderV1Card({
      title: "Synthèse coach",
      summary: `Score final : ${scoreText(report)}. Lecture officielle compacte des signaux les plus visibles.`,
      bullets: executiveBullets,
      confidence,
    }),
    renderV1Card({
      title: "Signal officiel à surveiller — danger",
      summary: "Où le match a produit des progressions dangereuses ou des situations favorables.",
      bullets: dangerZones.slice(0, 2),
      confidence: confidenceFromTraceTag(traceFact, "official_danger_zones"),
    }),
    renderV1Card({
      title: "Signal officiel à surveiller — pression",
      summary: "Où la continuité s'est fragilisée sous pression adverse.",
      bullets: pressureLossZones.slice(0, 2),
      confidence: confidenceFromTraceTag(traceFact, "official_pressure_losses"),
      emptyState: emptyPressureLoss,
    }),
    renderV1Card({
      title: "Signal officiel à surveiller — récupérations",
      summary: "Où l'équipe a interrompu ou sécurisé une séquence.",
      bullets: recoveryZones.slice(0, 2),
      confidence: confidenceFromTraceTag(traceFact, "official_recoveries"),
    }),
    renderV1Card({
      title: "Point de vigilance coach",
      summary: "Piste prudente issue des agrégats officiels du run.",
      bullets: [watchpoint],
      confidence: confidenceFromTraceTag(traceFact, "official_coach_watchpoint"),
    }),
  ].join("");
  const detailedCards = [
    renderV1Card({
      title: "Zones de danger",
      summary: "Lecture zone par zone du danger officiel.",
      bullets: dangerZones.slice(0, 3),
      confidence: confidenceFromTraceTag(traceFact, "official_danger_zones"),
    }),
    renderV1Card({
      title: "Zones de perte sous pression",
      summary: "Le rapport cartographie seulement un signal stabilisé.",
      bullets: pressureLossZones.slice(0, 3),
      confidence: confidenceFromTraceTag(traceFact, "official_pressure_losses"),
      emptyState: emptyPressureLoss,
    }),
    renderV1Card({
      title: "Récupérations utiles",
      summary: "Lecture zone par zone des récupérations utiles.",
      bullets: recoveryZones.slice(0, 3),
      confidence: confidenceFromTraceTag(traceFact, "official_recoveries"),
    }),
    renderV1Card({
      title: "Implication joueurs",
      summary: "Ce bloc mesure l'implication dans les traces officielles, pas une note individuelle complète.",
      bullets: players.slice(0, 4),
      confidence: confidenceFromTraceTag(traceFact, "official_player_involvement"),
    }),
    renderV1Card({
      title: "Causes et impacts",
      summary: "Ces libellés viennent des agrégats officiels, pas du sandbox.",
      bullets: [...causes, ...impacts].slice(0, 6),
      confidence: confidenceFromTraceTag(traceFact, "official_recurring_causes"),
    }),
  ].join("");

  return `
    <section class="coach-report-v1 official-coach-reading">
      <h2>Ce que le match dit</h2>
      <p class="card-meta">Rapport coach V1 — lecture visuelle des agrégats officiels</p>
      <p>Cette lecture visuelle s'appuie d'abord sur les agrégats officiels du match. Les diagnostics et le sandbox restent séparés : ils servent à expliquer ou tester, pas à établir la vérité officielle.</p>
      <div>${renderV1Badge("Source", "Officiel")} ${renderV1Badge("Confiance", confidenceText(confidence).replace("Confiance ", ""))}</div>
      <div class="grid">${officialReadingCards}</div>
    </section>
    <section class="coach-report-v1 official-detailed-signals">
      <h2>Signaux officiels détaillés</h2>
      <p>Ces signaux détaillent la lecture officielle par zones, joueurs, causes et impacts. Aucun contenu sandbox n'est compté comme carte officielle V1.</p>
      <div class="grid">${detailedCards}</div>
      <details class="internal-markers">
        <summary>Détails techniques du rapport V1</summary>
        <div class="muted">Cartes : ${escapeHtml(cardCount)}. Cartes officielles : ${escapeHtml(officialCardsCount)}. Traces officielles : ${escapeHtml(officialTraceCount)}.</div>
        <div class="muted">${escapeHtml(fact.summary)}</div>
        <div class="muted">${escapeHtml(hierarchyFact.summary)}</div>
        <div class="muted">${fact.internalTags.map(escapeHtml).join(", ")}</div>
        <div class="muted">${hierarchyFact.internalTags.map(escapeHtml).join(", ")}</div>
      </details>
    </section>`;
}

function renderExperimentalHypotheses(input: {
  readonly timelineReview: string;
  readonly sandboxDecisionPanel: string;
  readonly multiScenarioCoachTestPlan: string;
  readonly selectionPreview: string;
}): string {
  const content = [
    input.timelineReview,
    input.sandboxDecisionPanel,
    input.multiScenarioCoachTestPlan,
    input.selectionPreview,
  ].filter((section) => section.length > 0).join("");

  if (content.length === 0) {
    return "";
  }

  return `
    <section class="experimental-hypotheses-group">
      <h2>Hypothèses expérimentales à tester</h2>
      <p class="card summary-card">Ces éléments sont expérimentaux : ils ne modifient ni la timeline officielle, ni le score, ni la possession, ni les événements de score.</p>
      <div class="card-meta">${renderV1Badge("Source", "Sandbox")} ${renderV1Badge("Source", "Diagnostic")} ${renderV1Badge("Prévisualisation", "non appliquée")}</div>
      <p>Hypothèse expérimentale — ne modifie pas le match officiel.</p>
      <p>Cette piste reste une suggestion sandbox, pas une consigne officielle. Elle ne modifie ni la timeline officielle, ni le score, ni la possession, ni les événements de score. Elle ne constitue pas une preuve d'économie globale.</p>
      <details>
        <summary>Afficher les hypothèses expérimentales à tester</summary>
        ${content}
      </details>
    </section>`;
}

function renderTechnicalTraceability(input: {
  readonly matchTraceSpine: string;
  readonly matchTraceAggregator: string;
  readonly coachReportTraceAggregates: string;
  readonly legacyReportSections: string;
}): string {
  const content = [
    input.matchTraceSpine,
    input.matchTraceAggregator,
    input.coachReportTraceAggregates,
    input.legacyReportSections,
  ].filter((section) => section.length > 0).join("");

  if (content.length === 0) {
    return "";
  }

  return `
    <section class="technical-traceability-group">
      <details>
        <summary>Détails techniques et traçabilité</summary>
        ${content}
      </details>
    </section>`;
}

function renderLegacyReportSections(input: {
  readonly keyMoments: string;
  readonly insights: string;
}): string {
  return `
        <details class="legacy-report-reading">
          <summary>Ancienne lecture du rapport</summary>
          <p class="muted">Ces blocs sont conservés pour traçabilité. La lecture coach principale est désormais le rapport V1 officiel ci-dessus.</p>
          <section>
            <h3>Moments officiels utiles</h3>
            <div class="grid">${input.keyMoments}</div>
          </section>
          <section>
            <h3>Analyse coach héritée</h3>
            <div class="grid">${input.insights}</div>
          </section>
        </details>`;
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
        <p><strong>${escapeHtml(scoreSourceLabel("official_report_events").label)}</strong> : les conséquences officielles du rapport restent la source de ce résumé. Les diagnostics batch et les échantillons de scoring-events restent séparés.</p>
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
  const multiScenarioCoachTestPlan = renderMultiScenarioCoachTestPlan(report);
  const selectionPreview = renderSelectionPreview(report);
  const matchTraceSpine = renderMatchTraceSpine(report);
  const matchTraceAggregator = renderMatchTraceAggregator(report);
  const coachReportV1Visualization = renderCoachReportV1Visualization(report);
  const hierarchyEnabled = hasCoachReportV1InformationHierarchy(report);
  const coachReportV1Hierarchy = hierarchyEnabled ? renderCoachReportV1InformationHierarchy(report) : "";
  const coachReportTraceAggregates = renderCoachReportFromTraceAggregates(report);
  const experimentalHypotheses = hierarchyEnabled
    ? renderExperimentalHypotheses({
        timelineReview,
        sandboxDecisionPanel,
        multiScenarioCoachTestPlan,
        selectionPreview,
      })
    : "";
  const technicalTraceability = hierarchyEnabled
    ? renderTechnicalTraceability({
        matchTraceSpine,
        matchTraceAggregator,
        coachReportTraceAggregates,
        legacyReportSections: renderLegacyReportSections({ keyMoments, insights }),
      })
    : "";
  const legacyExperimentalSections = hierarchyEnabled
    ? ""
    : `${timelineReview}${sandboxDecisionPanel}${multiScenarioCoachTestPlan}${selectionPreview}${matchTraceSpine}${matchTraceAggregator}${coachReportV1Visualization}${coachReportTraceAggregates}`;

  const html = `<!doctype html>
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
    .score-source { max-width: 780px; color: #dce6ef; font-size: 13px; line-height: 1.45; margin-top: 6px; }
    .score-source strong { display: block; color: #ffffff; margin-bottom: 2px; }
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
      ${renderScoreSourceNote()}
      <div class="muted">Généré depuis le rapport de match typé.</div>
    </header>

    ${renderSummary(report)}

    ${coachReportV1Hierarchy}

    ${hierarchyEnabled ? "" : `
    <section>
      <h2>Moments clés</h2>
      <div class="grid">${keyMoments}</div>
    </section>

    <section>
      <h2>Analyse du coach</h2>
      <div class="grid">${insights}</div>
    </section>`}

    ${legacyExperimentalSections}
    ${experimentalHypotheses}
    ${technicalTraceability}

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

  return normalizeCoachFacingCopy(html);
}
