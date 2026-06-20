import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validatePersistenceEvidenceCopy(): readonly string[] {
  const { exportHtml } = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const sectionStart = exportHtml.indexOf("history-consistency-section");
  const sectionEnd = exportHtml.indexOf("</section>", sectionStart);
  const visibleMain = sectionStart === -1 || sectionEnd === -1
    ? exportHtml
    : exportHtml.slice(sectionStart, sectionEnd);
  const forbidden = [
    "preuve statistique",
    "preuve globale",
    "certitude",
    "d&eacute;montr&eacute;",
    "valid&eacute; d&eacute;finitivement",
    "officiellement confirm&eacute;",
    "joueur recommand&eacute;",
    "&agrave; s&eacute;lectionner",
    "titulaire conseill&eacute;",
    "remplacement conseill&eacute;",
    "composition recommand&eacute;e",
    "s&eacute;lection automatique",
    "officially_confirmed",
    "trace_supported",
    "sandbox_only",
  ];

  for (const phrase of forbidden) {
    assertTest(!visibleMain.includes(phrase), `visible copy must not contain ${phrase}.`);
  }

  return [
    "visible copy avoids proof wording",
    "visible copy avoids recommendation wording",
    "visible copy avoids selection wording",
    "visible copy avoids internal status wording",
  ];
}

if (require.main === module) {
  const checks = validatePersistenceEvidenceCopy();
  console.log("persistenceEvidenceCopy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
