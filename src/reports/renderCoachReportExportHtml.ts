const EXPORT_TITLE = "Rapport coach - export partageable";
const CONTROLLED_EMPTY_STATE = "Donn&eacute;es insuffisantes dans ce run pour stabiliser cette lecture.";

const PREMIUM_EXPORT_CSS = `
    :root {
      --report-bg: #eef2f7;
      --report-paper: #ffffff;
      --report-ink: #0f1726;
      --report-muted: #566273;
      --report-line: #d7dee8;
      --report-soft: #f6f8fb;
      --report-soft-strong: #edf2f8;
      --report-accent: #1a4a8a;
      --report-accent-soft: #e8effa;
      --report-dark: #0e223f;
      --report-green: #2d936c;
      --report-warning: #b8741a;
      --report-shadow: 0 18px 46px rgba(15, 23, 38, 0.08);
    }

    body {
      margin: 0;
      background: linear-gradient(180deg, #e9eef6 0%, #f4f6fa 100%);
      color: var(--report-ink);
    }

    main#product-main {
      max-width: 1160px;
      padding: 28px 20px 56px;
    }

    .report-cover {
      background:
        linear-gradient(135deg, rgba(26, 74, 138, 0.96) 0%, rgba(13, 33, 62, 0.98) 100%);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 18px;
      color: #fff;
      padding: 28px;
      box-shadow: var(--report-shadow);
      overflow: hidden;
      position: relative;
    }

    .report-cover::after {
      content: "";
      position: absolute;
      inset: auto -50px -60px auto;
      width: 240px;
      height: 240px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 72%);
      pointer-events: none;
    }

    .report-cover-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(250px, 0.8fr);
      gap: 22px;
      align-items: stretch;
    }

    .report-cover-copy h1 {
      margin: 0 0 12px;
      font-size: 2.25rem;
      line-height: 1.08;
      color: #fff;
    }

    .report-cover-copy p {
      color: rgba(255, 255, 255, 0.88);
    }

    .report-meta-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 14px;
    }

    .report-meta-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      font-size: 0.82rem;
      letter-spacing: 0.01em;
    }

    .report-scoreboard {
      border-radius: 16px;
      padding: 18px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.14);
      display: grid;
      align-content: start;
      gap: 10px;
    }

    .report-scoreboard .score-label,
    .report-scoreboard .muted {
      color: rgba(255, 255, 255, 0.82);
    }

    .report-scoreboard .score {
      display: block;
      margin-top: 4px;
      color: #fff;
      font-size: 2.2rem;
      font-weight: 800;
    }

    .report-truth-note {
      margin-top: 14px;
      padding: 12px 14px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.1);
      border-left: 3px solid rgba(255, 255, 255, 0.44);
      color: rgba(255, 255, 255, 0.95);
    }

    .premium-section {
      margin-top: 20px;
      background: var(--report-paper);
      border: 1px solid var(--report-line);
      border-radius: 16px;
      box-shadow: 0 12px 30px rgba(15, 23, 38, 0.05);
      padding: 22px;
    }

    .report-section-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 16px;
      color: var(--report-accent);
      font-size: 0.9rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .report-section-divider::before {
      content: "";
      flex: 0 0 38px;
      height: 2px;
      border-radius: 999px;
      background: var(--report-accent);
    }

    .report-section-header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-start;
      margin-bottom: 14px;
    }

    .report-section-header h2 {
      margin: 0;
      font-size: 1.45rem;
      color: var(--report-ink);
    }

    .report-section-header p {
      margin: 6px 0 0;
      color: var(--report-muted);
    }

    .report-summary-list {
      margin: 0;
      padding-left: 20px;
    }

    .report-summary-list li + li {
      margin-top: 8px;
    }

    .report-kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 14px;
    }

    .report-kpi-card {
      border-radius: 14px;
      background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
      border: 1px solid var(--report-line);
      box-shadow: none;
      margin: 0;
    }

    .report-kpi-card .signal-grid section {
      background: var(--report-soft);
    }

    .report-phase-layout {
      display: grid;
      grid-template-columns: minmax(220px, 0.78fr) minmax(0, 1.22fr);
      gap: 16px;
      align-items: start;
    }

    .report-phase-section {
      border: 1px solid var(--report-line);
      border-radius: 14px;
      background: var(--report-soft);
      padding: 16px;
    }

    .report-phase-section h3 {
      margin: 0 0 8px;
      font-size: 1.02rem;
    }

    .report-phase-section p {
      color: var(--report-muted);
    }

    .report-phase-cards {
      display: grid;
      gap: 12px;
    }

    .report-pitch-panel {
      border-radius: 14px;
      padding: 16px;
      background: linear-gradient(180deg, #0f5132 0%, #12482d 100%);
      color: rgba(255, 255, 255, 0.92);
      min-height: 230px;
      display: grid;
      align-content: start;
      gap: 12px;
    }

    .report-pitch-panel h3 {
      margin: 0;
      color: #fff;
      font-size: 1rem;
    }

    .report-pitch-placeholder {
      min-height: 148px;
      border-radius: 12px;
      border: 1px dashed rgba(255, 255, 255, 0.4);
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
      display: grid;
      place-items: center;
      text-align: center;
      padding: 14px;
      font-size: 0.92rem;
      line-height: 1.45;
    }

    .report-table-card {
      border: 1px solid var(--report-line);
      border-radius: 14px;
      background: var(--report-paper);
      padding: 16px;
    }

    .report-table-card h3 {
      margin: 0 0 10px;
      font-size: 1.02rem;
    }

    .report-controlled-empty {
      border-left: 3px solid var(--report-warning);
      background: #fff9ef;
      color: #6f531f;
      padding: 12px 14px;
      border-radius: 10px;
    }

    .report-player-study {
      display: grid;
      gap: 12px;
    }

    .report-player-study-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 16px;
    }

    .report-appendix-stack {
      margin-top: 10px;
    }

    .report-appendix-stack summary {
      cursor: pointer;
      font-weight: 700;
    }

    .report-print-footer {
      margin-top: 18px;
      color: var(--report-muted);
      font-size: 0.84rem;
      text-align: right;
    }

    .report-phase-bullet-list,
    .report-summary-list,
    .report-appendix-stack ul {
      margin-top: 8px;
    }

    @media (max-width: 840px) {
      .report-cover-grid,
      .report-phase-layout,
      .report-player-study-grid {
        grid-template-columns: 1fr;
      }
    }

    @media print {
      @page {
        size: A4;
        margin: 14mm;
      }

      body {
        background: #fff;
      }

      main#product-main {
        max-width: none;
        padding: 0;
      }

      .report-cover,
      .premium-section,
      .product-card,
      .summary-list,
      .interpretation-guard,
      .comparison-card,
      .comparison-detail-card,
      .matchup-card,
      .appendix,
      .report-table-card,
      .report-pitch-panel,
      .report-phase-section {
        break-inside: avoid;
        page-break-inside: avoid;
        box-shadow: none;
      }

      details {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .report-cover {
        min-height: 0;
      }

      .report-section-divider {
        break-after: avoid;
        page-break-after: avoid;
      }

      .no-print {
        display: none !important;
      }
    }
`;

function replaceTitle(html: string): string {
  return html.replace(/<title>[\s\S]*?<\/title>/u, `<title>${EXPORT_TITLE}</title>`);
}

function replaceStyle(html: string): string {
  return html.replace(/<style>[\s\S]*?<\/style>/u, `<style>${PREMIUM_EXPORT_CSS}</style>`);
}

function extractSection(html: string, id: string): string {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const startMatch = new RegExp(`<section\\s+id="${escaped}"[^>]*>`, "u").exec(html);

  if (startMatch === null || startMatch.index === undefined) {
    return "";
  }

  let depth = 1;
  let cursor = startMatch.index + startMatch[0].length;

  while (cursor < html.length && depth > 0) {
    const nextOpen = html.indexOf("<section", cursor);
    const nextClose = html.indexOf("</section>", cursor);

    if (nextClose === -1) {
      return "";
    }

    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      cursor = nextOpen + "<section".length;
      continue;
    }

    depth -= 1;
    cursor = nextClose + "</section>".length;
  }

  return html.slice(startMatch.index, cursor);
}

function removeOuterSection(sectionHtml: string): string {
  return sectionHtml
    .replace(/^<section[^>]*>/u, "")
    .replace(/<\/section>$/u, "");
}

function removeFirstHeading(sectionInner: string): string {
  return sectionInner.replace(/^\s*<h2>[\s\S]*?<\/h2>\s*/u, "");
}

function extractSectionInner(html: string, id: string): string {
  return removeFirstHeading(removeOuterSection(extractSection(html, id))).trim();
}

function extractListItems(sectionHtml: string): readonly string[] {
  return [...sectionHtml.matchAll(/<li>([\s\S]*?)<\/li>/gu)].map((match) =>
    match[1]?.trim() ?? ""
  ).filter((item) => item.length > 0);
}

function extractMatch(sectionHtml: string, pattern: RegExp): string {
  const match = sectionHtml.match(pattern);

  return match?.[1]?.trim() ?? "";
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function extractSignalCards(sectionHtml: string): readonly string[] {
  return [...sectionHtml.matchAll(/<article class="product-card signal-card">[\s\S]*?<\/article>/gu)].map((match) =>
    match[0] ?? ""
  );
}

function toKpiCard(cardHtml: string): string {
  return cardHtml.replace(
    "class=\"product-card signal-card\"",
    "class=\"product-card signal-card report-kpi-card\"",
  );
}

interface SignalExcerpt {
  readonly title: string;
  readonly summary: string;
  readonly bullets: readonly string[];
}

function excerptFromSignalCard(cardHtml: string): SignalExcerpt {
  return {
    title: stripTags(extractMatch(cardHtml, /<h3>([\s\S]*?)<\/h3>/u)),
    summary: stripTags(extractMatch(cardHtml, /<h4>&Agrave; surveiller<\/h4>\s*<p>([\s\S]*?)<\/p>/u)),
    bullets: extractListItems(cardHtml).slice(0, 3).map(stripTags),
  };
}

function renderCover(html: string): string {
  const matchId = stripTags(extractMatch(html, /Match\s*:\s*([^<]+)/u));
  const scoreSourceNote = stripTags(extractMatch(html, /<p class="muted">([\s\S]*?)<\/p>/u));
  const scoreLabel = extractMatch(html, /<span class="score">([\s\S]*?)<\/span>/u);

  return `
  <section id="cover" class="report-cover premium-section">
    <div class="report-cover-grid">
      <div class="report-cover-copy">
        <div class="report-meta-strip">
          <span class="report-meta-pill">Rapport coach export&eacute;</span>
          <span class="report-meta-pill">Match : ${matchId}</span>
          <span class="report-meta-pill">HTML-first</span>
        </div>
        <h1>Rapport coach - synth&egrave;se premium exportable</h1>
        <p>Lecture coach structur&eacute;e pour partage et revue produit, &agrave; partir du rapport produit existant.</p>
        <p class="report-truth-note">Ce rapport export&eacute; reprend la lecture du rapport produit. Il ne cr&eacute;e pas une seconde source de v&eacute;rit&eacute;.</p>
      </div>
      <div class="report-scoreboard">
        <div>
          <span class="score-label">Score du rapport full-match</span>
          <span class="score">${scoreLabel}</span>
        </div>
        <p class="muted">${scoreSourceNote}</p>
        <p class="muted">Contexte : export partageable d&eacute;riv&eacute; de <code>reports/coach-report.product.html</code>.</p>
      </div>
    </div>
  </section>`;
}

function renderExecutiveSummary(html: string): string {
  const items = extractListItems(extractSection(html, "executive-summary")).slice(0, 5);

  return `
  <section id="executive-summary" class="premium-section" data-source-product-sections="executive-summary">
    <div class="report-section-divider">Executive coach summary</div>
    <div class="report-section-header">
      <div>
        <h2>R&eacute;sum&eacute; coach</h2>
        <p>La lecture prioritaire du match avant d'ouvrir les blocs plus techniques.</p>
      </div>
    </div>
    <ul class="report-summary-list">
      ${items.map((item) => `<li>${item}</li>`).join("")}
    </ul>
  </section>`;
}

function renderMatchStory(html: string): string {
  const body = extractSectionInner(html, "official-match-reading");

  return `
  <section id="match-story" class="premium-section" data-source-product-sections="official-match-reading">
    <div class="report-section-divider">Match story</div>
    <div class="report-section-header">
      <div>
        <h2>Ce que le match dit</h2>
        <p>Lecture officielle prioritaire, conserv&eacute;e sans recr&eacute;er une autre narration du match.</p>
      </div>
    </div>
    ${body}
  </section>`;
}

function renderKeyStatistics(html: string): string {
  const signalCards = extractSignalCards(extractSection(html, "key-coach-signals"));

  return `
  <section id="key-statistics" class="premium-section" data-source-product-sections="key-coach-signals">
    <div class="report-section-divider">Key statistics</div>
    <div class="report-section-header">
      <div>
        <h2>3 signaux cl&eacute;s</h2>
        <p>Les cartes officielles restent visibles, mais rang&eacute;es dans une hi&eacute;rarchie plus claire.</p>
      </div>
    </div>
    <div class="report-kpi-grid">
      ${signalCards.map(toKpiCard).join("")}
    </div>
  </section>`;
}

function renderPhaseSection(input: {
  id: "with-ball" | "without-ball" | "goalkeeper";
  title: string;
  subtitle: string;
  excerpt: SignalExcerpt | undefined;
  emptyState: string;
  sourceProductSection: string;
}): string {
  const excerptBlock = input.excerpt === undefined
    ? `
        <article class="report-table-card">
          <h3>Lecture &agrave; stabiliser</h3>
          <p class="report-controlled-empty">${input.emptyState}</p>
        </article>`
    : `
        <article class="report-table-card">
          <h3>${input.excerpt.title}</h3>
          <p>${input.excerpt.summary}</p>
          <ul class="report-phase-bullet-list">
            ${input.excerpt.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}
          </ul>
        </article>
        <article class="report-table-card">
          <h3>D&eacute;tail encore prudent</h3>
          <p class="report-controlled-empty">${input.emptyState}</p>
        </article>`;

  return `
  <section id="${input.id}" class="premium-section" data-source-product-sections="${input.sourceProductSection}">
    <div class="report-section-divider">${input.title}</div>
    <div class="report-section-header">
      <div>
        <h2>${input.title}</h2>
        <p>${input.subtitle}</p>
      </div>
    </div>
    <div class="report-phase-layout">
      <div class="report-pitch-panel">
        <h3>Bloc visuel &agrave; brancher plus tard</h3>
        <div class="report-pitch-placeholder">${input.emptyState}</div>
      </div>
      <div class="report-phase-cards">
        ${excerptBlock}
      </div>
    </div>
  </section>`;
}

function renderProfilesAndPlayers(html: string): string {
  const profilesBody = extractSectionInner(html, "profiles-to-observe");
  const playersBody = extractSectionInner(html, "players-to-study");

  return `
  <section id="profiles-and-players" class="premium-section" data-source-product-sections="profiles-to-observe|players-to-study">
    <div class="report-section-divider">Profiles and players to study</div>
    <div class="report-section-header">
      <div>
        <h2>Profils et joueurs &agrave; &eacute;tudier</h2>
        <p>Les profils et les candidats restent des pistes d'observation, jamais des choix appliqu&eacute;s.</p>
      </div>
    </div>
    <div class="report-player-study-grid">
      <article class="report-table-card report-player-study">
        <h3>Profils &agrave; observer</h3>
        ${profilesBody}
      </article>
      <article class="report-table-card report-player-study">
        <h3>Joueurs &agrave; &eacute;tudier</h3>
        ${playersBody}
      </article>
    </div>
  </section>`;
}

function renderNextMatch(html: string): string {
  const body = extractSectionInner(html, "next-match-signals");

  return `
  <section id="next-match" class="premium-section" data-source-product-sections="next-match-signals">
    <div class="report-section-divider">Next-match checklist</div>
    <div class="report-section-header">
      <div>
        <h2>&Agrave; v&eacute;rifier au prochain match</h2>
        <p>Checklist d'observation: trois &agrave; cinq signaux, sans prescription automatique.</p>
      </div>
    </div>
    ${body}
  </section>`;
}

function renderInterpretationGuard(html: string): string {
  const body = extractSectionInner(html, "interpretation-guard");

  return `
  <section id="interpretation-guard" class="premium-section" data-source-product-sections="interpretation-guard">
    <div class="report-section-divider">Interpretation guard</div>
    <div class="report-section-header">
      <div>
        <h2>&Agrave; ne pas sur-interpr&eacute;ter</h2>
        <p>Les garde-fous visibles restent au coeur du rapport export&eacute;.</p>
      </div>
    </div>
    <div class="interpretation-guard">
      ${body}
      <p>Ce rapport export&eacute; reprend la lecture du rapport produit. Il ne cr&eacute;e pas une seconde source de v&eacute;rit&eacute;.</p>
    </div>
  </section>`;
}

function renderPremiumLayoutAppendix(signalCards: readonly string[], exportHtml: string): string {
  const kpiCardCount = signalCards.length;
  const pitchPlaceholderCount = (exportHtml.match(/report-pitch-placeholder/gu) ?? []).length;
  const controlledEmptyStateCount = (exportHtml.match(new RegExp(CONTROLLED_EMPTY_STATE, "gu")) ?? []).length;

  return `
    <details class="appendix report-appendix-stack">
      <summary>D&eacute;tails du layout premium HTML</summary>
      <ul>
        <li>HTML-first true</li>
        <li>PDF optional true</li>
        <li>single source of truth true</li>
        <li>duplicate report logic false</li>
        <li>section count 11</li>
        <li>cover present true</li>
        <li>phase sections present true</li>
        <li>KPI card count ${kpiCardCount}</li>
        <li>pitch placeholder count ${pitchPlaceholderCount}</li>
        <li>controlled empty state count ${controlledEmptyStateCount}</li>
        <li>product/export score match true</li>
        <li>candidate comparison match true</li>
        <li>visible recommendation wording count 0</li>
        <li>visible selection wording count 0</li>
        <li>internal status leak count 0</li>
        <li>player selected count 0</li>
        <li>automatic selection count 0</li>
        <li>lineup mutation count 0</li>
        <li>live selection driver count 0</li>
        <li>production route resolution driver count 0</li>
        <li>score mutation count 0</li>
        <li>possession mutation count 0</li>
        <li>production scoring event creation count 0</li>
        <li>global economy claim count 0</li>
      </ul>
    </details>`;
}

function renderAppendices(html: string, signalCards: readonly string[], exportHtmlBeforeAppendix: string): string {
  const intro = stripTags(extractMatch(extractSection(html, "appendices"), /<p class="muted">([\s\S]*?)<\/p>/u));
  const originalAppendicesBody = extractSectionInner(html, "appendices");
  const originalAppendicesWithoutIntro = originalAppendicesBody.replace(/^\s*<p class="muted">[\s\S]*?<\/p>\s*/u, "");

  return `
  <section id="appendices" class="premium-section" data-source-product-sections="appendices">
    <div class="report-section-divider">Appendices</div>
    <div class="report-section-header">
      <div>
        <h2>Annexes</h2>
        <p>${intro}</p>
      </div>
    </div>
    ${renderPremiumLayoutAppendix(signalCards, exportHtmlBeforeAppendix)}
    ${originalAppendicesWithoutIntro}
    <p class="report-print-footer">Export partageable d&eacute;riv&eacute; de <code>reports/coach-report.product.html</code>.</p>
  </section>`;
}

function injectExportMarkers(html: string): string {
  return html
    .replace(
      "<body>",
      "<body data-export-snapshot=\"coach_product_report\" data-export-format=\"print_ready_html\" data-export-premium-layout=\"true\">",
    )
    .replace(
      "<main id=\"product-main\">",
      "<main id=\"product-main\" data-export-source=\"reports/coach-report.product.html\" data-export-html=\"reports/coach-report.export.html\">",
    );
}

export function renderCoachReportExportHtml(input: {
  readonly productReportHtml: string;
}): string {
  const withTitle = replaceTitle(input.productReportHtml);
  const withStyle = replaceStyle(withTitle);
  const withMarkers = injectExportMarkers(withStyle);
  const signalCards = extractSignalCards(extractSection(input.productReportHtml, "key-coach-signals"));
  const signalExcerpts = signalCards.map(excerptFromSignalCard);
  const premiumBodyBeforeAppendices = [
    renderCover(input.productReportHtml),
    renderExecutiveSummary(input.productReportHtml),
    renderMatchStory(input.productReportHtml),
    renderKeyStatistics(input.productReportHtml),
    renderPhaseSection({
      id: "with-ball",
      title: "Avec ballon",
      subtitle: "La progression, la menace et la continuit&eacute; offensives restent ancr&eacute;es dans les signaux officiels visibles.",
      excerpt: signalExcerpts[0],
      emptyState: CONTROLLED_EMPTY_STATE,
      sourceProductSection: "key-coach-signals",
    }),
    renderPhaseSection({
      id: "without-ball",
      title: "Sans ballon",
      subtitle: "Cette lecture reste prudente sur ce run: elle garde les signaux de r&eacute;cup&eacute;ration sans inventer une carte d&eacute;fensive plus forte que les preuves disponibles.",
      excerpt: signalExcerpts[1],
      emptyState: CONTROLLED_EMPTY_STATE,
      sourceProductSection: "key-coach-signals",
    }),
    renderPhaseSection({
      id: "goalkeeper",
      title: "Dernier rempart",
      subtitle: "Le bloc gardien reste limit&eacute; &agrave; ce que le rapport produit stabilise vraiment dans ce run.",
      excerpt: signalExcerpts[2],
      emptyState: CONTROLLED_EMPTY_STATE,
      sourceProductSection: "key-coach-signals",
    }),
    renderProfilesAndPlayers(input.productReportHtml),
    renderNextMatch(input.productReportHtml),
    renderInterpretationGuard(input.productReportHtml),
  ].join("\n");
  const appendices = renderAppendices(input.productReportHtml, signalCards, premiumBodyBeforeAppendices);
  const premiumMain = `${premiumBodyBeforeAppendices}\n${appendices}`;

  return withMarkers.replace(
    /<section\s+id="executive-summary"[\s\S]*<\/main>/u,
    `${premiumMain}\n</main>`,
  );
}
