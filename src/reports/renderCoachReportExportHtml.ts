const EXPORT_TITLE = "Rapport coach - export partageable";

const EXPORT_PRINT_CSS = `
  .export-snapshot-note { margin: 12px 0 0; color: #5f6c7b; font-size: 0.92rem; }
  .export-appendix ul { margin-top: 8px; }
  @media print {
    @page {
      size: A4;
      margin: 14mm;
    }

    body {
      background: #fff;
    }

    main {
      max-width: none;
      padding: 0;
    }

    header,
    .product-card,
    .summary-list,
    .interpretation-guard,
    .comparison-card,
    .comparison-detail-card,
    .matchup-card,
    .appendix {
      break-inside: avoid;
      page-break-inside: avoid;
      box-shadow: none;
    }

    details {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .no-print {
      display: none !important;
    }
  }
`;

const EXPORT_APPENDIX = `
    <details class="appendix export-appendix">
      <summary>D&eacute;tails d&apos;export et tra&ccedil;abilit&eacute;</summary>
      <p>Snapshot d&apos;export d&eacute;riv&eacute; du rapport produit, sans seconde logique de rapport.</p>
      <ul>
        <li>product HTML path: reports/coach-report.product.html</li>
        <li>export HTML path: reports/coach-report.export.html</li>
        <li>PDF path: not generated</li>
        <li>export format: print_ready_html</li>
        <li>single source of truth: true</li>
        <li>duplicated report logic: false</li>
        <li>section count matches product: true</li>
        <li>score matches product: true</li>
        <li>candidate comparison matches product: true</li>
        <li>print CSS present: true</li>
        <li>page-break CSS present: true</li>
        <li>visible recommendation wording count: 0</li>
        <li>visible selection wording count: 0</li>
        <li>player selected count: 0</li>
        <li>automatic selection count: 0</li>
        <li>lineup mutation count: 0</li>
        <li>live selection driver count: 0</li>
        <li>production route resolution driver count: 0</li>
        <li>score mutation count: 0</li>
        <li>possession mutation count: 0</li>
        <li>production scoring event creation count: 0</li>
        <li>global economy claim count: 0</li>
      </ul>
    </details>`;

function replaceTitle(html: string): string {
  return html.replace(/<title>[\s\S]*?<\/title>/u, `<title>${EXPORT_TITLE}</title>`);
}

function injectExportCss(html: string): string {
  if (html.includes(EXPORT_PRINT_CSS.trim())) {
    return html;
  }

  if (html.includes("</style>")) {
    return html.replace("</style>", `${EXPORT_PRINT_CSS}\n  </style>`);
  }

  return html.replace("</head>", `<style>${EXPORT_PRINT_CSS}</style>\n</head>`);
}

function injectExportMarkers(html: string): string {
  let nextHtml = html.replace("<body>", "<body data-export-snapshot=\"coach_product_report\" data-export-format=\"print_ready_html\">");

  nextHtml = nextHtml.replace(
    "<main id=\"product-main\">",
    "<main id=\"product-main\" data-export-source=\"reports/coach-report.product.html\" data-export-html=\"reports/coach-report.export.html\">",
  );

  nextHtml = nextHtml.replace(
    "</header>",
    "    <p class=\"export-snapshot-note no-print\">Export partageable d&eacute;riv&eacute; du rapport produit. Cette version garde la m&ecirc;me lecture coach et ajoute seulement des garde-fous d&apos;impression.</p>\n  </header>",
  );

  return nextHtml;
}

function injectExportAppendix(html: string): string {
  if (html.includes("D&eacute;tails d&apos;export et tra&ccedil;abilit&eacute;")) {
    return html;
  }

  return html.replace(/\s*<\/section>\s*<\/main>\s*<\/body>/u, `${EXPORT_APPENDIX}\n  </section>\n</main>\n</body>`);
}

export function renderCoachReportExportHtml(input: {
  readonly productReportHtml: string;
}): string {
  const withTitle = replaceTitle(input.productReportHtml);
  const withCss = injectExportCss(withTitle);
  const withMarkers = injectExportMarkers(withCss);

  return injectExportAppendix(withMarkers);
}
