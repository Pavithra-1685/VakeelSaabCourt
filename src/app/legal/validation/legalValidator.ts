// ============================================================
// VAKEEL SAAB — Legal Validation Layer (Stage F)
// Validates terminology, statutory provisions against registry,
// procedural prerequisites, placeholder integrity, and prevents hallucination
// ============================================================

import { EnhancedDocumentType, ClassificationResult } from '../classification/intentClassifier';
import { VerifiedStatute, lookupStatute } from '../registry/statutoryRegistry';

export interface LegalIssue {
  code: string;
  level: 'critical' | 'warning' | 'info';
  category: 'terminology' | 'statute' | 'prerequisite' | 'hallucination' | 'jurisdiction';
  message: string;
  recommendation: string;
}

export interface LegalValidationResult {
  isValid: boolean;
  qualityScore: number; // 0 - 100
  criticalErrors: LegalIssue[];
  warnings: LegalIssue[];
  infoNotices: LegalIssue[];
  verifiedStatutes: VerifiedStatute[];
  unverifiedStatutes: string[];
  detectedLegacyStatutes: string[];
  placeholdersDetected: string[];
  prerequisiteAudit: {
    prerequisite: string;
    satisfied: boolean;
    statutoryBasis: string;
    details: string;
  }[];
  isCourtHeadingAppropriate: boolean;
  containsUnsupportedConclusions: boolean;
  containsAllegationsPhrasedAsFacts: boolean;
}

/**
 * Stage F: Comprehensive Legal Validation
 */
export function validateLegalDraft(params: {
  docType: EnhancedDocumentType;
  content: string;
  classification?: ClassificationResult;
  userFacts?: string;
}): LegalValidationResult {
  const { docType, content, classification } = params;
  const lower = content.toLowerCase();

  const criticalErrors: LegalIssue[] = [];
  const warnings: LegalIssue[] = [];
  const infoNotices: LegalIssue[] = [];
  const verifiedStatutes: VerifiedStatute[] = [];
  const unverifiedStatutes: string[] = [];
  const detectedLegacyStatutes: string[] = [];

  // ─────────────────────────────────────────────────────────
  // 1. RECIPIENT & FORUM TERMINOLOGY AUDIT
  // ─────────────────────────────────────────────────────────
  const hasCourtHeading =
    /in the court of/i.test(content) ||
    /before the hon'?ble/i.test(content) ||
    /before the ld\.?/i.test(content) ||
    /in the high court/i.test(content) ||
    /in the supreme court/i.test(content);

  let isCourtHeadingAppropriate = true;

  if (docType === 'police-complaint' || docType === 'fir-complaint') {
    if (hasCourtHeading) {
      isCourtHeadingAppropriate = false;
      criticalErrors.push({
        code: 'ERR_COURT_HEADING_IN_POLICE_COMPLAINT',
        level: 'critical',
        category: 'terminology',
        message: 'Court heading detected in a Police Complaint intended for the Station House Officer.',
        recommendation:
          'Remove court headers ("IN THE COURT OF..."). A police complaint must be addressed directly to "THE STATION HOUSE OFFICER, Police Station: [...]".',
      });
    }

    if (/\bthis hon'?ble court\b/i.test(content)) {
      criticalErrors.push({
        code: 'ERR_PRAYER_TO_COURT_IN_POLICE_COMPLAINT',
        level: 'critical',
        category: 'terminology',
        message: 'Document uses "This Hon’ble Court" in a complaint meant for the police station.',
        recommendation:
          'Replace references to "Court" with "Station House Officer" or "investigating agency". The prayer should request registration of an FIR and investigation.',
      });
    }

    if (/first information report registered/i.test(content) || /fir no\.?\s*\d+\/\d+/i.test(content)) {
      warnings.push({
        code: 'WARN_FALSE_FIR_EXISTENCE',
        level: 'warning',
        category: 'hallucination',
        message: 'Draft appears to represent that an FIR has already been registered.',
        recommendation:
          'Clarify that this is a written complaint requesting the registration of an FIR under Section 173 BNSS.',
      });
    }
  }

  if (docType === 'sp-representation') {
    if (hasCourtHeading) {
      isCourtHeadingAppropriate = false;
      criticalErrors.push({
        code: 'ERR_COURT_HEADING_IN_SP_REPRESENTATION',
        level: 'critical',
        category: 'terminology',
        message: 'Court heading found in a Representation to the Superintendent of Police under Section 173(4) BNSS.',
        recommendation:
          'Address document to "THE SUPERINTENDENT OF POLICE / COMMISSIONER OF POLICE, [DISTRICT]" instead of a Court.',
      });
    }
  }

  if (docType === 'bnss-175-3-application') {
    if (!hasCourtHeading && !/judicial magistrate/i.test(content) && !/chief judicial magistrate/i.test(content)) {
      warnings.push({
        code: 'WARN_MISSING_MAGISTRATE_HEADING',
        level: 'warning',
        category: 'jurisdiction',
        message: 'Application under Section 175(3) BNSS must be addressed to the competent Judicial Magistrate.',
        recommendation:
          'Ensure the heading addresses "IN THE COURT OF THE LD. CHIEF JUDICIAL MAGISTRATE / JUDICIAL MAGISTRATE FIRST CLASS, AT [PLACE]".',
      });
    }
  }

  // ─────────────────────────────────────────────────────────
  // 2. STATUTORY PROVISION VERIFICATION AGAINST REGISTRY
  // ─────────────────────────────────────────────────────────
  // Scan for BNS / BNSS / BSA / IPC / CrPC citations (both "Act Sec X" and "Sec X of Act")
  const bnsPatternA = /\b(?:bns|bharatiya nyaya sanhita)\D{0,15}(\d{1,3}(?:\(\d\))?)/gi;
  const bnsPatternB = /\b(?:section|sec\.?)\s*(\d{1,3}(?:\(\d\))?)\s*(?:of\s+(?:the\s+)?)?(?:bns|bharatiya nyaya sanhita)\b/gi;
  const bnsMatches = [
    ...(content.match(bnsPatternA) || []),
    ...(content.match(bnsPatternB) || []),
  ];

  const bnssPatternA = /\b(?:bnss|bharatiya nagarik suraksha sanhita)\D{0,15}(\d{1,3}(?:\(\d\))?)/gi;
  const bnssPatternB = /\b(?:section|sec\.?)\s*(\d{1,3}(?:\(\d\))?)\s*(?:of\s+(?:the\s+)?)?(?:bnss|bharatiya nagarik suraksha sanhita)\b/gi;
  const bnssMatches = [
    ...(content.match(bnssPatternA) || []),
    ...(content.match(bnssPatternB) || []),
  ];

  const bsaPatternA = /\b(?:bsa|bharatiya sakshya adhiniyam)\D{0,15}(\d{1,3}(?:\(\d\))?)/gi;
  const bsaPatternB = /\b(?:section|sec\.?)\s*(\d{1,3}(?:\(\d\))?)\s*(?:of\s+(?:the\s+)?)?(?:bsa|bharatiya sakshya adhiniyam)\b/gi;
  const bsaMatches = [
    ...(content.match(bsaPatternA) || []),
    ...(content.match(bsaPatternB) || []),
  ];

  const ipcPatternA = /\b(?:ipc|indian penal code)\D{0,15}(\d{1,3}[a-z]?)/gi;
  const ipcPatternB = /\b(?:section|sec\.?)\s*(\d{1,3}[a-z]?)\s*(?:of\s+(?:the\s+)?)?(?:ipc|indian penal code)\b/gi;
  const ipcMatches = [
    ...(content.match(ipcPatternA) || []),
    ...(content.match(ipcPatternB) || []),
  ];

  const crpcPatternA = /\b(?:crpc|code of criminal procedure)\D{0,15}(\d{1,3}[a-z]?(?:\(\d\))?)/gi;
  const crpcPatternB = /\b(?:section|sec\.?)\s*(\d{1,3}[a-z]?(?:\(\d\))?)\s*(?:of\s+(?:the\s+)?)?(?:crpc|code of criminal procedure)\b/gi;
  const crpcMatches = [
    ...(content.match(crpcPatternA) || []),
    ...(content.match(crpcPatternB) || []),
  ];

  // Helper to extract section number
  const extractSec = (str: string) => {
    const m = str.match(/\d{1,3}(?:\(\d\))?/);
    return m ? m[0] : '';
  };

  // Check BNS provisions
  for (const match of bnsMatches) {
    const sec = extractSec(match);
    if (!sec) continue;
    const stat = lookupStatute('BNS', sec);
    if (stat) {
      if (!verifiedStatutes.some((s) => s.act === 'BNS' && s.section === stat.section)) {
        verifiedStatutes.push(stat);
      }
    } else {
      unverifiedStatutes.push(`BNS Section ${sec}`);
      warnings.push({
        code: 'WARN_UNVERIFIED_BNS_SECTION',
        level: 'warning',
        category: 'statute',
        message: `Cited section "BNS Section ${sec}" could not be verified in the authoritative statutory registry.`,
        recommendation:
          'Verify this provision directly in the Gazette of India Act No. 45 of 2023. Do not rely solely on generative output for penal sections.',
      });
    }
  }

  // Check BNSS provisions
  for (const match of bnssMatches) {
    const sec = extractSec(match);
    if (!sec) continue;
    const stat = lookupStatute('BNSS', sec);
    if (stat) {
      if (!verifiedStatutes.some((s) => s.act === 'BNSS' && s.section === stat.section)) {
        verifiedStatutes.push(stat);
      }
    } else {
      unverifiedStatutes.push(`BNSS Section ${sec}`);
      warnings.push({
        code: 'WARN_UNVERIFIED_BNSS_SECTION',
        level: 'warning',
        category: 'statute',
        message: `Cited procedural section "BNSS Section ${sec}" could not be verified in the authoritative registry.`,
        recommendation:
          'Verify this provision in the Gazette of India Act No. 46 of 2023 before submission.',
      });
    }
  }

  // Check BSA provisions
  for (const match of bsaMatches) {
    const sec = extractSec(match);
    if (!sec) continue;
    const stat = lookupStatute('BSA', sec);
    if (stat) {
      if (!verifiedStatutes.some((s) => s.act === 'BSA' && s.section === stat.section)) {
        verifiedStatutes.push(stat);
      }
    } else {
      unverifiedStatutes.push(`BSA Section ${sec}`);
    }
  }

  // Detect repealed IPC provisions
  for (const match of ipcMatches) {
    const sec = extractSec(match);
    if (!sec) continue;
    detectedLegacyStatutes.push(`IPC Section ${sec}`);
    warnings.push({
      code: 'WARN_REPEALED_IPC_PROVISION',
      level: 'warning',
      category: 'statute',
      message: `The draft cites repealed "IPC Section ${sec}". Under the 1 July 2024 criminal law transition, IPC applies ONLY if the offence occurred prior to 1 July 2024.`,
      recommendation:
        'If the offence occurred on or after 1 July 2024, replace with the corresponding Bharatiya Nyaya Sanhita, 2023 (BNS) section.',
    });
  }

  // Detect repealed CrPC provisions
  for (const match of crpcMatches) {
    const sec = extractSec(match);
    if (!sec) continue;
    detectedLegacyStatutes.push(`CrPC Section ${sec}`);
    criticalErrors.push({
      code: 'ERR_REPEALED_CRPC_PROVISION',
      level: 'critical',
      category: 'statute',
      message: `The draft cites repealed "CrPC Section ${sec}". All procedural actions filed currently are strictly governed by the Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS).`,
      recommendation:
        'Replace CrPC procedural sections with corresponding BNSS sections (e.g. S. 154 -> S. 173; S. 156(3) -> S. 175(3); S. 438 -> S. 482; S. 439 -> S. 483).',
    });
  }

  // ─────────────────────────────────────────────────────────
  // 3. STATUTORY PREREQUISITE AUDIT
  // ─────────────────────────────────────────────────────────
  const prerequisiteAudit: LegalValidationResult['prerequisiteAudit'] = [];

  if (docType === 'bnss-175-3-application') {
    // Must aver exhaustion of S. 173(4) SP remedy
    const mentionsSP =
      lower.includes('superintendent of police') ||
      lower.includes('173(4)') ||
      lower.includes('representation') ||
      lower.includes('sp ');
    prerequisiteAudit.push({
      prerequisite: 'Prior representation to Superintendent of Police under Section 173(4) BNSS',
      satisfied: mentionsSP,
      statutoryBasis: 'Proviso to Section 175(3) BNSS, 2023',
      details: mentionsSP
        ? 'Averment of representation to Superintendent of Police found in draft.'
        : 'CRITICAL DEFECT: Draft lacks an averment that the applicant exhausted remedies with the Superintendent of Police under Section 173(4) BNSS.',
    });
    if (!mentionsSP) {
      criticalErrors.push({
        code: 'ERR_BNSS_175_3_MISSING_SP_AVERMENT',
        level: 'critical',
        category: 'prerequisite',
        message: 'Missing mandatory averment of prior approach to the Superintendent of Police under Section 173(4) BNSS.',
        recommendation:
          'Section 175(3) BNSS explicitly prohibits the Magistrate from entertaining an application unless the complainant has first approached the Superintendent of Police. Add averments and postal receipt details.',
      });
    }

    // Must mention Supporting Affidavit
    const mentionsAffidavit =
      lower.includes('affidavit') ||
      lower.includes('solemnly affirm') ||
      lower.includes('sworn on oath');
    prerequisiteAudit.push({
      prerequisite: 'Supporting affidavit on oath',
      satisfied: mentionsAffidavit,
      statutoryBasis: 'Section 175(3) BNSS proviso & Priyanka Srivastava v. State of UP doctrine',
      details: mentionsAffidavit
        ? 'Affidavit / verification clause detected.'
        : 'MANDATORY PREREQUISITE: Application must be supported by an affidavit verifying the facts.',
    });
    if (!mentionsAffidavit) {
      criticalErrors.push({
        code: 'ERR_BNSS_175_3_MISSING_AFFIDAVIT',
        level: 'critical',
        category: 'prerequisite',
        message: 'No affidavit clause found. Applications under Section 175(3) BNSS must be accompanied by an affidavit.',
        recommendation: 'Append a supporting affidavit sworn on oath by the applicant.',
      });
    }
  }

  if (docType === 'bail-petition') {
    const mentionsCustody =
      lower.includes('custody') ||
      lower.includes('arrested on') ||
      lower.includes('judicial custody') ||
      lower.includes('jail') ||
      lower.includes('detained');
    prerequisiteAudit.push({
      prerequisite: 'Applicant in actual custody or appearing before court',
      satisfied: mentionsCustody,
      statutoryBasis: 'Section 480 / 483 BNSS, 2023',
      details: mentionsCustody
        ? 'Custody / arrest details averred.'
        : 'Notice: Regular bail requires that the applicant be in custody or produced before court.',
    });
    if (!mentionsCustody) {
      warnings.push({
        code: 'WARN_BAIL_UNCLEAR_CUSTODY_STATUS',
        level: 'warning',
        category: 'prerequisite',
        message: 'The draft does not clearly specify the applicant’s date of arrest or custody status.',
        recommendation:
          'Specify the date of arrest, whether applicant is in police custody or judicial custody, and the jail where detained.',
      });
    }
  }

  if (docType === 'anticipatory-bail') {
    const allegesAlreadyArrested =
      lower.includes('applicant is in custody') ||
      lower.includes('applicant was arrested') ||
      lower.includes('applicant is in jail');
    if (allegesAlreadyArrested) {
      criticalErrors.push({
        code: 'ERR_ANTICIPATORY_BAIL_ALREADY_ARRESTED',
        level: 'critical',
        category: 'prerequisite',
        message: 'Anticipatory bail is drafted, but the text states the applicant is already arrested or in custody.',
        recommendation:
          'Anticipatory bail under Section 482 BNSS is only maintainable before arrest. Convert to a Regular Bail application under Section 483 BNSS.',
      });
    }
  }

  // Cross-reference any prerequisites verified or flagged during intake classification
  if (classification?.statutoryPrerequisites) {
    for (const prereq of classification.statutoryPrerequisites) {
      if (!prerequisiteAudit.some((pa) => pa.prerequisite.toLowerCase() === prereq.requirement.toLowerCase())) {
        prerequisiteAudit.push({
          prerequisite: prereq.requirement,
          satisfied: prereq.isSatisfied,
          statutoryBasis: prereq.statutoryBasis,
          details: prereq.isSatisfied
            ? 'Prerequisite marked satisfied during intake classification.'
            : (prereq.cureGuidance || 'Prerequisite unfulfilled during intake classification.'),
        });
      }
    }
  }

  // ─────────────────────────────────────────────────────────
  // 4. PLACEHOLDER & HALLUCINATION CHECK
  // ─────────────────────────────────────────────────────────
  const placeholderRegex = /\[([A-Z0-9_\s/-]+)\]/g;
  const placeholdersDetected: string[] = [];
  let pMatch;
  while ((pMatch = placeholderRegex.exec(content)) !== null) {
    if (!placeholdersDetected.includes(pMatch[0])) {
      placeholdersDetected.push(pMatch[0]);
    }
  }

  // Check if allegations are presented as established facts
  const containsAllegationsPhrasedAsFacts =
    lower.includes('the accused has committed the crime of') &&
    !lower.includes('alleged') &&
    !lower.includes('allegations');

  if (containsAllegationsPhrasedAsFacts) {
    warnings.push({
      code: 'WARN_FACTUAL_CERTAINTY_IN_ALLEGATION',
      level: 'warning',
      category: 'hallucination',
      message: 'Allegations appear to be phrased as established judicial facts rather than allegations.',
      recommendation:
        'Phrase facts as allegations (e.g. "It is alleged that...", "As per the complainant...") until adjudicated by a court of competent jurisdiction.',
    });
  }

  // Check for suspicious fabricated case citations
  const citationRegex = /\b(\d{4})\s*\(?\d?\)?\s*(?:scc|scr|air|scale)\s*(\d+)\b/gi;
  const citationsFound = content.match(citationRegex) || [];
  for (const c of citationsFound) {
    // We flag generative citations for human advocate verification
    infoNotices.push({
      code: 'INFO_VERIFY_JUDICIAL_CITATION',
      level: 'info',
      category: 'statute',
      message: `Judicial citation "${c}" detected in draft.`,
      recommendation: 'Advocate must verify official reporter volume and page number before filing.',
    });
  }

  // ─────────────────────────────────────────────────────────
  // 5. OVERALL QUALITY SCORE CALCULATION
  // ─────────────────────────────────────────────────────────
  let qualityScore = 100;
  qualityScore -= criticalErrors.length * 25;
  qualityScore -= warnings.length * 10;
  if (unverifiedStatutes.length > 0) qualityScore -= 10;
  if (qualityScore < 0) qualityScore = 0;

  const isValid = criticalErrors.length === 0;

  return {
    isValid,
    qualityScore,
    criticalErrors,
    warnings,
    infoNotices,
    verifiedStatutes,
    unverifiedStatutes,
    detectedLegacyStatutes,
    placeholdersDetected,
    prerequisiteAudit,
    isCourtHeadingAppropriate,
    containsUnsupportedConclusions: false,
    containsAllegationsPhrasedAsFacts,
  };
}
