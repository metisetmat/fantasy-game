import type { CoachProductReportSignal, CoachProductReportViewModel } from "./coachProductReportView";
import { escapeHtml } from "./htmlCoachReport";

export type CoachDeepInsightSourceType = "official" | "diagnostic" | "sandbox" | "mixed";
export type CoachDeepInsightConfidence = "low" | "medium" | "high";

export interface CoachDeepInsight {
  readonly insightId: string;
  readonly title: string;
  readonly sourceType: CoachDeepInsightSourceType;
  readonly confidence: CoachDeepInsightConfidence;
  readonly observation: string;
  readonly whyItMatters: string;
  readonly probableCause: string;
  readonly tacticalConsequence: string;
  readonly riskIfRepeated: string;
  readonly nextMatchCheck: string;
  readonly trainingFocus: string;
  readonly evidenceSummary: readonly string[];
  readonly evidenceEventIds: readonly string[];
  readonly affectedZones: readonly string[];
  readonly affectedPlayersOrProfiles: readonly string[];
  readonly coachAction: string;
  readonly tradeoff: string;
  readonly nonAppliedPreviewNote?: string;
  readonly limitationNote?: string;
}

export interface NextMatchRecommendation {
  readonly recommendationId: string;
  readonly priority: string;
  readonly whatToImprove: string;
  readonly why: string;
  readonly observableSignal: string;
  readonly tradeoff: string;
  readonly trainingFocus: string;
  readonly confidence: CoachDeepInsightConfidence;
  readonly sourceInsightIds: readonly string[];
  readonly evidenceSummary: readonly string[];
}

function confidenceFromLabel(label: CoachProductReportSignal["confidenceLabel"]): CoachDeepInsightConfidence {
  if (label === "faible") {
    return "low";
  }
  if (label === "moyenne") {
    return "medium";
  }
  return "high";
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values.filter((value) => value.length > 0))];
}

function zonesFromText(text: string): readonly string[] {
  return unique([...text.matchAll(/\bZ\d(?:-[A-Z]+)?\b/gu)].map((match) => match[0] ?? ""));
}

function coachReadableSignalSummary(summary: string): string {
  let readable = summary.trim();
  let previous = "";

  while (readable !== previous) {
    previous = readable;
    readable = readable
      .replace(/^Le rapport officiel\s+(?:met en avant|fait ressortir)\s+/iu, "")
      .replace(/^La deuxieme lecture\s+(?:met en avant|signale)\s+/iu, "")
      .replace(/^La suite du rapport\s+signale\s+/iu, "")
      .trim();
  }

  return readable
    .replace(/^La qualit[ée]\s+/iu, "la qualite ")
    .replace(/^La suite\s+/iu, "la suite ")
    .replace(/\.+$/u, "")
    .trim();
}

function sentence(text: string): string {
  const trimmed = text.trim().replace(/\.+$/u, "");

  return `${trimmed}.`;
}

function deepInsightTemplate(signal: CoachProductReportSignal, index: number): Omit<CoachDeepInsight, "insightId" | "title" | "confidence" | "evidenceSummary" | "affectedZones"> {
  const readableSummary = coachReadableSignalSummary(signal.summary);

  if (index === 0) {
    return {
      sourceType: "official",
      observation: sentence(`Signal officiel: ${readableSummary}`),
      whyItMatters: "C'est important parce que la progression propre donne au coach un repere sur la premiere structure offensive utile.",
      probableCause: "Le porteur trouve une solution proche avant que la pression ne ferme la zone.",
      tacticalConsequence: "L'equipe peut avancer sans transformer chaque recuperation en action forcee.",
      riskIfRepeated: "Trop de soutien proche peut ralentir la sortie et exposer la rest-defense si la perte arrive au mauvais moment.",
      nextMatchCheck: "A verifier au prochain match: la premiere sortie apres recuperation reste-t-elle propre sous pression ?",
      trainingFocus: "A travailler: offrir une solution proche au porteur apres recuperation, puis liberer une deuxieme ligne.",
      evidenceEventIds: [signal.signalId],
      affectedPlayersOrProfiles: ["soutien proche", "porteur", "rest-defense"],
      coachAction: "Observer la qualite de la premiere passe avant de transformer ce signal en consigne.",
      tradeoff: "Securiser la sortie aide la conservation, mais peut reduire la vitesse de projection.",
    };
  }
  if (index === 1) {
    return {
      sourceType: "official",
      observation: sentence(`Deuxieme lecture: ${readableSummary}`),
      whyItMatters: "C'est important parce que la deuxieme action decide si le gain initial devient une sequence stable ou une perte rapide.",
      probableCause: "L'equipe cherche le second ballon ou le relais avant que le bloc adverse ne se replace.",
      tacticalConsequence: "Une bonne deuxieme action peut maintenir la pression sans forcer une finition precoce.",
      riskIfRepeated: "Chercher trop vite le second ballon peut ouvrir une transition adverse dans l'axe.",
      nextMatchCheck: "A verifier au prochain match: les secondes actions augmentent-elles sans exposer l'axe central ?",
      trainingFocus: "A travailler: coordonner le relais de soutien et le joueur de couverture derriere l'action.",
      evidenceEventIds: [signal.signalId],
      affectedPlayersOrProfiles: ["second ballon", "relayeur", "couverture"],
      coachAction: "Comparer le nombre de secondes actions utiles avec les pertes immediates.",
      tradeoff: "Attaquer le second ballon augmente le danger, mais demande une couverture plus rigoureuse.",
    };
  }
  return {
    sourceType: "official",
    observation: sentence(`Suite d'action a surveiller: ${readableSummary}`),
    whyItMatters: "C'est important parce que la reponse a la pression et au gardien stabilise la fin de sequence.",
    probableCause: "La ligne de soutien reste disponible quand la premiere option est neutralisee.",
    tacticalConsequence: "L'equipe peut conserver une menace sans confondre continuation et score automatique.",
    riskIfRepeated: "Multiplier les continuations peut user le bloc et laisser des rebonds centraux a defendre.",
    nextMatchCheck: "A verifier au prochain match: la continuite reste-t-elle lisible apres arret, pression ou rebond ?",
    trainingFocus: "A travailler: replacer vite le soutien autour du gardien ou du porteur apres action neutralisee.",
    evidenceEventIds: [signal.signalId],
    affectedPlayersOrProfiles: ["gardien", "soutien", "continuite"],
    coachAction: "Surveiller si la continuite vient d'un vrai soutien ou d'une lecture opportuniste.",
    tradeoff: "Prolonger l'action garde la pression, mais peut masquer une fatigue ou une organisation defensive fragile.",
  };
}

export function buildCoachDeepInsights(model: CoachProductReportViewModel): readonly CoachDeepInsight[] {
  return model.keyCoachSignals.slice(0, 3).map((signal, index) => {
    const template = deepInsightTemplate(signal, index);
    const evidenceText = [signal.summary, signal.coachMeaning, ...signal.evidenceSummary].join(" ");
    return {
      insightId: `deep-insight-${index + 1}-${signal.signalId}`,
      title: signal.title,
      confidence: confidenceFromLabel(signal.confidenceLabel),
      evidenceSummary: signal.evidenceSummary.length === 0 ? [signal.coachMeaning] : signal.evidenceSummary.slice(0, 3),
      affectedZones: zonesFromText(evidenceText),
      limitationNote: "Lecture issue du rapport officiel de ce match; a confirmer sur plusieurs matchs avant d'en faire une regle.",
      ...template,
    };
  });
}

export function buildNextMatchRecommendations(insights: readonly CoachDeepInsight[]): readonly NextMatchRecommendation[] {
  return insights.slice(0, 3).map((insight, index) => ({
    recommendationId: `next-match-priority-${index + 1}`,
    priority: index === 0 ? "Priorite 1" : index === 1 ? "Priorite 2" : "Priorite 3",
    whatToImprove: insight.trainingFocus,
    why: insight.whyItMatters,
    observableSignal: insight.nextMatchCheck,
    tradeoff: insight.tradeoff,
    trainingFocus: insight.coachAction,
    confidence: insight.confidence,
    sourceInsightIds: [insight.insightId],
    evidenceSummary: insight.evidenceSummary.slice(0, 2),
  }));
}

export function buildCoachTrainingFocusFromInsights(insights: readonly CoachDeepInsight[]): readonly string[] {
  return insights.slice(0, 3).map((insight) => insight.trainingFocus);
}

export function buildInsightCausalExplanation(insight: CoachDeepInsight): string {
  return `${insight.probableCause} ${insight.tacticalConsequence}`;
}

export function buildInsightTradeoff(insight: CoachDeepInsight): string {
  return insight.tradeoff;
}

export function buildInsightNextMatchCheck(insight: CoachDeepInsight): string {
  return insight.nextMatchCheck;
}

export function renderInsightEvidenceBadges(insight: CoachDeepInsight): string {
  return `
    <div class="badge-row">
      <span class="badge">Source : ${insight.sourceType === "official" ? "Officiel" : escapeHtml(insight.sourceType)}</span>
      <span class="badge">Confiance ${insight.confidence === "high" ? "haute" : insight.confidence === "medium" ? "moyenne" : "faible"}</span>
      ${insight.affectedZones.slice(0, 3).map((zone) => `<span class="badge">Zone ${escapeHtml(zone)}</span>`).join("")}
    </div>`;
}

export function renderInsightConfidenceLabels(insight: CoachDeepInsight): string {
  return `<p class="muted">Niveau de confiance: ${insight.confidence}. ${escapeHtml(insight.limitationNote ?? "A confirmer au prochain match.")}</p>`;
}

export function renderCoachDeepInsights(insights: readonly CoachDeepInsight[]): string {
  return `
  <section id="coach-deep-insights" class="product-section">
    <h2>Insights coach approfondis</h2>
    <div class="cards">
      ${insights.map((insight) => `
        <article class="product-card deep-insight-card">
          ${renderInsightEvidenceBadges(insight)}
          <h3>${escapeHtml(insight.title)}</h3>
          <div class="signal-grid">
            <section><h4>Observation</h4><p>${escapeHtml(insight.observation)}</p></section>
            <section><h4>Pourquoi c'est important</h4><p>${escapeHtml(insight.whyItMatters)}</p></section>
            <section><h4>Cause probable</h4><p>${escapeHtml(insight.probableCause)}</p></section>
            <section><h4>Consequence tactique</h4><p>${escapeHtml(insight.tacticalConsequence)}</p></section>
            <section><h4>Risque si repete</h4><p>${escapeHtml(insight.riskIfRepeated)}</p></section>
            <section><h4>A verifier au prochain match</h4><p>${escapeHtml(insight.nextMatchCheck)}</p></section>
          </div>
          <p class="guard">Action coach : ${escapeHtml(insight.coachAction)}</p>
          <p class="muted">Risque / tradeoff : ${escapeHtml(insight.tradeoff)}</p>
          ${renderInsightConfidenceLabels(insight)}
        </article>`).join("")}
    </div>
  </section>`;
}

export function renderNextMatchPlan(recommendations: readonly NextMatchRecommendation[]): string {
  return `
  <section id="next-match-plan" class="product-section">
    <h2>Plan prochain match</h2>
    <p class="guard">Plan d'observation prudent: il guide le travail et ne force ni selection, ni composition, ni score.</p>
    <div class="cards">
      ${recommendations.map((item) => `
        <article class="product-card next-match-plan-card">
          <div class="badge-row">
            <span class="badge">${escapeHtml(item.priority)}</span>
            <span class="badge">Confiance ${item.confidence === "high" ? "haute" : item.confidence === "medium" ? "moyenne" : "faible"}</span>
          </div>
          <h3>${escapeHtml(item.whatToImprove)}</h3>
          <div class="signal-grid">
            <section><h4>Pourquoi</h4><p>${escapeHtml(item.why)}</p></section>
            <section><h4>Signal observable</h4><p>${escapeHtml(item.observableSignal)}</p></section>
            <section><h4>Risque / tradeoff</h4><p>${escapeHtml(item.tradeoff)}</p></section>
            <section><h4>Travail</h4><p>${escapeHtml(item.trainingFocus)}</p></section>
          </div>
        </article>`).join("")}
    </div>
  </section>`;
}
