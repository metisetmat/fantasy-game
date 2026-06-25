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

function deepInsightTemplate(signal: CoachProductReportSignal, index: number): Omit<CoachDeepInsight, "insightId" | "title" | "confidence" | "evidenceSummary" | "affectedZones"> {
  if (index === 0) {
    return {
      sourceType: "official",
      observation: `Le signal principal montre ${signal.summary}`,
      whyItMatters: "C'est important parce que la progression propre donne au coach un repere sur la premiere structure offensive utile.",
      probableCause: "Cause probable: le porteur trouve une solution proche avant que la pression ne ferme la zone.",
      tacticalConsequence: "Consequence tactique: l'equipe peut avancer sans transformer chaque recuperation en action forcee.",
      riskIfRepeated: "Risque si on insiste: trop de soutien proche peut ralentir la sortie et exposer la rest-defense si la perte arrive au mauvais moment.",
      nextMatchCheck: "A verifier au prochain match: la premiere sortie apres recuperation reste-t-elle propre sous pression ?",
      trainingFocus: "A travailler: offrir une solution proche au porteur apres recuperation, puis liberer une deuxieme ligne.",
      evidenceEventIds: [signal.signalId],
      affectedPlayersOrProfiles: ["soutien proche", "porteur", "rest-defense"],
      coachAction: "Action coach prudente: observer la qualite de la premiere passe avant de transformer ce signal en consigne.",
      tradeoff: "Tradeoff: securiser la sortie aide la conservation, mais peut reduire la vitesse de projection.",
    };
  }
  if (index === 1) {
    return {
      sourceType: "official",
      observation: `Le deuxieme signal indique ${signal.summary}`,
      whyItMatters: "C'est important parce que la deuxieme action decide si le gain initial devient une sequence stable ou une perte rapide.",
      probableCause: "Cause probable: l'equipe cherche le second ballon ou le relais avant que le bloc adverse ne se replace.",
      tacticalConsequence: "Consequence tactique: une bonne deuxieme action peut maintenir la pression sans forcer une finition precoce.",
      riskIfRepeated: "Risque si on insiste: chercher trop vite le second ballon peut ouvrir une transition adverse dans l'axe.",
      nextMatchCheck: "A verifier au prochain match: les secondes actions augmentent-elles sans exposer l'axe central ?",
      trainingFocus: "A travailler: coordonner le relais de soutien et le joueur de couverture derriere l'action.",
      evidenceEventIds: [signal.signalId],
      affectedPlayersOrProfiles: ["second ballon", "relayeur", "couverture"],
      coachAction: "Action coach prudente: comparer le nombre de secondes actions utiles avec les pertes immediates.",
      tradeoff: "Tradeoff: attaquer le second ballon augmente le danger, mais demande une couverture plus rigoureuse.",
    };
  }
  return {
    sourceType: "official",
    observation: `Le troisieme signal montre ${signal.summary}`,
    whyItMatters: "C'est important parce que la reponse a la pression et au gardien stabilise la fin de sequence.",
    probableCause: "Cause probable: la ligne de soutien reste disponible quand la premiere option est neutralisee.",
    tacticalConsequence: "Consequence tactique: l'equipe peut conserver une menace sans confondre continuation et score automatique.",
    riskIfRepeated: "Risque si on insiste: multiplier les continuations peut user le bloc et laisser des rebonds centraux a defendre.",
    nextMatchCheck: "A verifier au prochain match: la continuite reste-t-elle lisible apres arret, pression ou rebond ?",
    trainingFocus: "A travailler: replacer vite le soutien autour du gardien ou du porteur apres action neutralisee.",
    evidenceEventIds: [signal.signalId],
    affectedPlayersOrProfiles: ["gardien", "soutien", "continuite"],
    coachAction: "Action coach prudente: surveiller si la continuite vient d'un vrai soutien ou d'une lecture opportuniste.",
    tradeoff: "Tradeoff: prolonger l'action garde la pression, mais peut masquer une fatigue ou une organisation defensive fragile.",
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
          <p class="guard">Action coach prudente: ${escapeHtml(insight.coachAction)}</p>
          <p class="muted">Tradeoff: ${escapeHtml(insight.tradeoff)}</p>
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
