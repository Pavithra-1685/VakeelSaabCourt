// ============================================================
// VAKEEL SAAB — Document-Specific Legal Templates & Structural Rules
// Defines distinct headings, recipients, prayers, and verification clauses
// Never forces all documents into a generic court-petition format
// ============================================================

import { EnhancedDocumentType } from '../classification/intentClassifier';
import { VerifiedStatute } from '../registry/statutoryRegistry';

export interface DocumentTemplateDefinition {
  type: EnhancedDocumentType;
  title: string;
  defaultHeading: string;
  recipientFormat: string;
  partiesFormat: string;
  statutoryGroundsHeader: string;
  prayerFormat: string;
  verificationRequired: boolean;
  affidavitRequired: boolean;
  annexuresRequired: string[];
  mandatoryPlaceholders: string[];
  systemInstructionSnippet: string;
}

export const DOCUMENT_TEMPLATES: Record<string, DocumentTemplateDefinition> = {
  // ─────────────────────────────────────────────────────────
  // 1. POLICE COMPLAINT (SHO) — NEVER A COURT HEADING!
  // ─────────────────────────────────────────────────────────
  'police-complaint': {
    type: 'police-complaint',
    title: 'Complaint to the Station House Officer',
    defaultHeading: 'WRITTEN COMPLAINT REGARDING COMMISSION OF COGNIZABLE OFFENCE',
    recipientFormat: `TO,
THE STATION HOUSE OFFICER,
POLICE STATION: [NAME OF POLICE STATION],
[DISTRICT / COMMISSIONERATE], [STATE]`,
    partiesFormat: `COMPLAINANT:
[NAME OF COMPLAINANT], S/o or D/o [PARENT NAME],
Residing at: [FULL RESIDENTIAL ADDRESS],
Contact No.: [PHONE NUMBER], Email: [EMAIL ADDRESS]

AGAINST ACCUSED PERSON(S):
1. [NAME OF ACCUSED / UNKNOWN ACCUSED PERSONS], [ADDRESS/DETAILS IF KNOWN]`,
    statutoryGroundsHeader: 'APPLICABLE STATUTORY PROVISIONS UNDER BHARATIYA NYAYA SANHITA, 2023',
    prayerFormat: `PRAYER / RELIEF SOUGHT:
In the premises aforesaid, it is most respectfully prayed that this Police Station may be pleased to:
(a) Register a First Information Report (FIR) under Section 173 of the Bharatiya Nagarik Suraksha Sanhita, 2023 for offences under the Bharatiya Nyaya Sanhita, 2023 against the accused persons;
(b) Promptly initiate an investigation into the allegations and preserve all relevant CCTV footage, CDRs, and electronic evidence;
(c) Recover the stolen property / secure the scene of crime in accordance with law;
(d) Take all necessary steps to apprehend the accused persons and protect the life and property of the complainant.`,
    verificationRequired: false,
    affidavitRequired: false,
    annexuresRequired: ['Copy of Identity Proof of Complainant', 'List of Stolen Articles / Proof of Ownership', 'Electronic Evidence / Relevant Receipts'],
    mandatoryPlaceholders: ['[NAME OF POLICE STATION]', '[NAME OF COMPLAINANT]', '[DATE OF INCIDENT]', '[PLACE OF OCCURRENCE]'],
    systemInstructionSnippet: `
CRITICAL DRAFTING MANDATE FOR POLICE COMPLAINT:
- Do NOT use court headings such as "IN THE COURT OF...".
- Do NOT address the police as "This Hon'ble Court".
- State facts chronologically: Date, Time, Exact Location, Mode of Occurrence, Role of Accused.
- Explicitly cite Section 173 of the Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS) as the procedural basis.
- Cite substantive BNS provisions (e.g. S. 303(2) for theft, S. 318(4) for cheating).
- Conclude with Complainant signature and date.`,
  },

  // ─────────────────────────────────────────────────────────
  // 2. REPRESENTATION TO SUPERINTENDENT OF POLICE (S. 173(4) BNSS)
  // ─────────────────────────────────────────────────────────
  'sp-representation': {
    type: 'sp-representation',
    title: 'Representation to the Superintendent of Police under Section 173(4) BNSS',
    defaultHeading: 'REPRESENTATION UNDER SECTION 173(4) OF THE BHARATIYA NAGARIK SURAKSHA SANHITA, 2023',
    recipientFormat: `TO,
THE SUPERINTENDENT OF POLICE / COMMISSIONER OF POLICE,
[DISTRICT / POLICE COMMISSIONERATE], [STATE]`,
    partiesFormat: `APPLICANT / AGGRIEVED PERSON:
[FULL NAME OF APPLICANT], [RESIDENTIAL ADDRESS, CONTACT DETAILS]

SUBJECT: Representation under Section 173(4) BNSS against refusal / inaction of Police Station [NAME OF POLICE STATION] regarding cognizable offences committed against the applicant.`,
    statutoryGroundsHeader: 'PROCEDURAL HISTORY & FAILURE OF POLICE STATION TO ACT',
    prayerFormat: `PRAYER:
In light of the refusal and inaction by the local police station, it is humbly prayed that the Superintendent of Police may be pleased to:
(a) Exercise powers under Section 173(4) of the Bharatiya Nagarik Suraksha Sanhita, 2023 and investigate the cognizable offence himself; OR
(b) Direct any officer subordinate to him to register the FIR and investigate the matter in accordance with law;
(c) Direct immediate protection for the complainant against threats from the accused persons.`,
    verificationRequired: false,
    affidavitRequired: false,
    annexuresRequired: [
      'Annexure A: True copy of original complaint submitted to SHO dated [DATE]',
      'Annexure B: Proof of submission / Postal tracking / Acknowledgment slip with Police Station',
    ],
    mandatoryPlaceholders: ['[DISTRICT / COMMISSIONERATE]', '[NAME OF POLICE STATION]', '[DATE OF SHO COMPLAINT]'],
    systemInstructionSnippet: `
CRITICAL DRAFTING MANDATE FOR SP REPRESENTATION:
- Must aver that a prior written complaint was submitted to the SHO on [DATE] and no action/FIR was taken.
- Reference Section 173(4) of the BNSS, 2023 as the statutory source of power.
- State clearly whether this representation is delivered in person or sent by registered speed post.`,
  },

  // ─────────────────────────────────────────────────────────
  // 3. APPLICATION TO MAGISTRATE UNDER SECTION 175(3) BNSS
  // ─────────────────────────────────────────────────────────
  'bnss-175-3-application': {
    type: 'bnss-175-3-application',
    title: 'Application under Section 175(3) of the BNSS, 2023',
    defaultHeading: `IN THE COURT OF THE LD. CHIEF JUDICIAL MAGISTRATE / JUDICIAL MAGISTRATE FIRST CLASS,
AT [DISTRICT / CITY], [STATE]`,
    recipientFormat: `CRIMINAL MISC. APPLICATION NO. [   ] OF 2026`,
    partiesFormat: `IN THE MATTER OF:
[NAME OF APPLICANT], S/o [PARENT NAME],
Residing at [ADDRESS]
                                                      ... APPLICANT / COMPLAINANT
                       VERSUS
1. STATE (THROUGH S.H.O., P.S. [NAME OF POLICE STATION])
2. [NAME OF PROPOSED ACCUSED PERSONS], [ADDRESS]
                                                      ... RESPONDENTS / ACCUSED`,
    statutoryGroundsHeader: 'STATUTORY COMPLIANCE WITH SECTION 173(1) AND SECTION 173(4) BNSS',
    prayerFormat: `PRAYER:
In the premises aforesaid, it is most respectfully prayed that this Hon'ble Court may graciously be pleased to:
(a) Exercise jurisdiction under Section 175(3) of the Bharatiya Nagarik Suraksha Sanhita, 2023 and direct the Station House Officer, Police Station [NAME] to register a First Information Report (FIR) under the relevant provisions of the Bharatiya Nyaya Sanhita, 2023;
(b) Direct the investigating agency to conduct a fair, impartial, and prompt investigation and file a compliance report before this Hon'ble Court within a stipulated time;
(c) Pass any further order or directions as this Hon'ble Court may deem fit and proper in the interest of justice.`,
    verificationRequired: true,
    affidavitRequired: true,
    annexuresRequired: [
      'Annexure P-1: Copy of Complaint submitted to SHO under S. 173(1) BNSS dated [DATE]',
      'Annexure P-2: Copy of Representation sent to Superintendent of Police under S. 173(4) BNSS dated [DATE] along with Postal Receipt & Tracking Report',
      'Annexure P-3: Supporting Affidavit on Oath as mandated by Section 175(3) proviso',
    ],
    mandatoryPlaceholders: ['[DISTRICT / CITY]', '[NAME OF POLICE STATION]', '[DATE OF SP REPRESENTATION]'],
    systemInstructionSnippet: `
CRITICAL DRAFTING MANDATE FOR SECTION 175(3) BNSS:
- Addressed to the Ld. Judicial Magistrate First Class / Chief Judicial Magistrate.
- Must contain an explicit paragraph averring strict compliance with Section 173(4) BNSS (prior approach to the SP by post).
- Must include a full Supporting Affidavit clause sworn on oath as mandated by the proviso to Section 175(3) BNSS and the Supreme Court judgment in Priyanka Srivastava v. State of UP.
- Emphasize that the facts disclose cognizable offences requiring police investigation and recovery of evidence.`,
  },

  // ─────────────────────────────────────────────────────────
  // 4. REGULAR BAIL APPLICATION (S. 480 / 483 BNSS)
  // ─────────────────────────────────────────────────────────
  'bail-petition': {
    type: 'bail-petition',
    title: 'Application for Regular Bail under Section 480 / 483 BNSS',
    defaultHeading: `IN THE COURT OF LD. SESSIONS JUDGE / CHIEF JUDICIAL MAGISTRATE,
AT [DISTRICT / CITY], [STATE]`,
    recipientFormat: `IN THE MATTER OF BAIL APPLICATION NO. [   ] OF 2026
IN FIR NO. [NUMBER/YEAR], DATED [DATE]
U/S: [SECTIONS UNDER BNS / SPECIAL ACTS]
POLICE STATION: [NAME OF POLICE STATION]`,
    partiesFormat: `[NAME OF APPLICANT/ACCUSED], S/o [PARENT NAME],
Currently lodged in [CENTRAL/DISTRICT JAIL, LOCATION]
                                                      ... APPLICANT / ACCUSED
                       VERSUS
THE STATE (NCT OF DELHI / STATE OF [STATE])
                                                      ... RESPONDENT`,
    statutoryGroundsHeader: 'GROUNDS FOR GRANT OF REGULAR BAIL',
    prayerFormat: `PRAYER:
In the premises aforesaid, it is most respectfully prayed that this Hon'ble Court may graciously be pleased to:
(a) Release the Applicant on regular bail in FIR No. [NUMBER/YEAR], registered at P.S. [NAME] under Sections [SECTIONS], on such terms and conditions and with such solvent sureties as this Hon'ble Court may deem fit;
(b) Pass any other order(s) as this Hon'ble Court may deem fit and proper in the interest of justice.`,
    verificationRequired: true,
    affidavitRequired: true,
    annexuresRequired: ['Copy of FIR No. [NUMBER]', 'Copy of Arrest Memo / Remand Order', 'Proof of Local Residence and Solvent Sureties'],
    mandatoryPlaceholders: ['[FIR NUMBER/YEAR]', '[NAME OF POLICE STATION]', '[DATE OF ARREST]', '[NAME OF JAIL]'],
    systemInstructionSnippet: `
CRITICAL DRAFTING MANDATE FOR REGULAR BAIL:
- Applicant MUST be in custody (or surrendering). Specify date of arrest and current custody.
- Cite Section 480 BNSS (if before Magistrate) or Section 483 BNSS (if before Sessions Court / High Court).
- Set out established bail jurisprudence: presumption of innocence, bail is rule and jail is exception, investigation complete/substantially complete, deep roots in society, no flight risk, ready to furnish reliable local sureties.`,
  },

  // ─────────────────────────────────────────────────────────
  // 5. ANTICIPATORY BAIL APPLICATION (S. 482 BNSS)
  // ─────────────────────────────────────────────────────────
  'anticipatory-bail': {
    type: 'anticipatory-bail',
    title: 'Application for Anticipatory Bail under Section 482 BNSS',
    defaultHeading: `IN THE COURT OF LD. SESSIONS JUDGE / HON'BLE HIGH COURT OF [STATE],
AT [PLACE]`,
    recipientFormat: `IN THE MATTER OF ANTICIPATORY BAIL APPLICATION NO. [   ] OF 2026
IN RELATION TO: [FIR NO. IF LODGED / APPREHENDED COMPLAINT AT P.S. [NAME]]`,
    partiesFormat: `[NAME OF APPLICANT], S/o [PARENT NAME],
Residing at [PERMANENT ADDRESS]
                                                      ... APPLICANT
                       VERSUS
THE STATE (GOVERNMENT OF [STATE])
                                                      ... RESPONDENT`,
    statutoryGroundsHeader: 'GROUNDS DEMONSTRATING REASONABLE APPREHENSION OF ARREST AND FALSE IMPLICATION',
    prayerFormat: `PRAYER:
In the premises aforesaid, it is most respectfully prayed that this Hon'ble Court may graciously be pleased to:
(a) Direct that in the event of arrest of the Applicant in connection with FIR No. [NUMBER/YEAR] or any complaint arising out of the alleged incident at P.S. [NAME], the Applicant be released on bail on such terms and conditions as this Hon'ble Court may deem fit;
(b) Grant ad-interim ex-parte protection against coercive measures during the pendency of the present application;
(c) Pass any further order(s) as this Hon'ble Court may deem fit and proper.`,
    verificationRequired: true,
    affidavitRequired: true,
    annexuresRequired: ['Copy of Notice/Summons or FIR (if available)', 'Identity and Address Proof', 'Affidavit on Oath'],
    mandatoryPlaceholders: ['[NAME OF POLICE STATION]', '[APPREHENDED SECTIONS]', '[GROUNDS OF APPREHENSION]'],
    systemInstructionSnippet: `
CRITICAL DRAFTING MANDATE FOR ANTICIPATORY BAIL:
- The applicant is NOT arrested and is NOT in custody.
- Cite Section 482 of the Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS).
- Must include express undertakings under Section 482(2) BNSS: (i) to make himself available for interrogation by police, (ii) not to induce or tamper with witnesses, (iii) not to leave India without prior permission.`,
  },

  // ─────────────────────────────────────────────────────────
  // 6. PRIVATE CRIMINAL COMPLAINT (S. 223 BNSS)
  // ─────────────────────────────────────────────────────────
  'magistrate-complaint': {
    type: 'magistrate-complaint',
    title: 'Private Criminal Complaint under Section 223 BNSS',
    defaultHeading: `IN THE COURT OF LD. METROPOLITAN MAGISTRATE / JUDICIAL MAGISTRATE FIRST CLASS,
AT [DISTRICT / CITY], [STATE]`,
    recipientFormat: `CRIMINAL COMPLAINT CASE NO. [   ] OF 2026`,
    partiesFormat: `[NAME OF COMPLAINANT], S/o [PARENT NAME],
[ADDRESS]
                                                      ... COMPLAINANT
                       VERSUS
1. [NAME OF ACCUSED NO. 1], [ADDRESS]
2. [NAME OF ACCUSED NO. 2], [ADDRESS]
                                                      ... ACCUSED PERSONS`,
    statutoryGroundsHeader: 'STATEMENT OF FACTS CONSTITUTING THE OFFENCES',
    prayerFormat: `PRAYER:
It is most respectfully prayed that this Hon'ble Court may graciously be pleased to:
(a) Take cognizance of the offences committed by the accused persons under the applicable provisions of the Bharatiya Nyaya Sanhita, 2023;
(b) Examine the Complainant and witnesses on oath in terms of Section 223 of the Bharatiya Nagarik Suraksha Sanhita, 2023;
(c) Issue summons / warrants against the accused persons and try and punish them in accordance with law;
(d) Award compensation to the Complainant in terms of Section 395 BNSS.`,
    verificationRequired: true,
    affidavitRequired: false,
    annexuresRequired: ['List of Witnesses under Section 223 BNSS', 'List of Documentary Evidences and Certificates'],
    mandatoryPlaceholders: ['[DISTRICT / CITY]', '[ACCUSED NAMES]', '[FACTUAL DATES]'],
    systemInstructionSnippet: `
CRITICAL DRAFTING MANDATE FOR PRIVATE COMPLAINT:
- Addressed to the Judicial Magistrate First Class / Metropolitan Magistrate.
- Cite Section 223 of the BNSS, 2023 for examination of complainant on oath.
- Note that under BNSS S. 223 proviso, the Magistrate provides an opportunity of being heard to the accused before taking cognizance.`,
  },

  // ─────────────────────────────────────────────────────────
  // 7. LEGAL NOTICE (CIVIL / COMMERCIAL)
  // ─────────────────────────────────────────────────────────
  'legal-notice': {
    type: 'legal-notice',
    title: 'Statutory / Legal Demand Notice by Advocate',
    defaultHeading: 'LEGAL DEMAND NOTICE ISSUED UNDER INSTRUCTIONS OF CLIENT',
    recipientFormat: `TO,
1. [NAME OF OPPOSITE PARTY / RECIPIENT],
[DESIGNATION / FIRM NAME],
[FULL POSTAL ADDRESS],
Email: [EMAIL ADDRESS]`,
    partiesFormat: `FROM:
[ADVOCATE FULL NAME], ADVOCATE
Bar Council Enrollment: [BAR ENROLLMENT NO.]
Chambers: [OFFICE ADDRESS], Contact: [PHONE NUMBER]

UNDER INSTRUCTIONS FROM MY CLIENT:
[NAME OF CLIENT], Residing / having office at [CLIENT ADDRESS]`,
    statutoryGroundsHeader: 'FACTUAL MATRIX AND BREACH OF LEGAL / CONTRACTUAL OBLIGATIONS',
    prayerFormat: `DEMAND / REQUISITION:
Now, therefore, I hereby call upon you on behalf of my client to:
(a) Pay to my client the outstanding sum of Rs. [AMOUNT] along with interest @ 18% p.a. within 15 (fifteen) days from receipt of this notice; OR
(b) Perform the obligations specified in paragraph [X] of this notice within 15 days;
Failing which my client has given me strict instructions to institute appropriate civil proceedings for recovery and damages, as well as criminal proceedings under the relevant provisions of the law, entirely at your risk, cost, and consequences.`,
    verificationRequired: false,
    affidavitRequired: false,
    annexuresRequired: ['Copies of Invoices / Agreements / Dishonoured Cheques and Bank Memos'],
    mandatoryPlaceholders: ['[ADVOCATE FULL NAME]', '[NAME OF OPPOSITE PARTY]', '[AMOUNT / RELIEF DEMANDED]'],
    systemInstructionSnippet: `
CRITICAL DRAFTING MANDATE FOR LEGAL NOTICE:
- Formal professional advocate letterhead notice.
- Strict 15-day timeline for compliance before legal action.
- Mention cost of notice (e.g. Rs. 5,500/- for drafting and service).`,
  },
};

/**
 * Generates structured drafting instructions for Groq LLM based on template and verified provisions
 */
export function buildDraftingSystemPrompt(
  docType: EnhancedDocumentType,
  verifiedProvisions: VerifiedStatute[],
  customAdvocate?: { fullName?: string; barCouncilNo?: string; courtJurisdiction?: string }
): string {
  const template = DOCUMENT_TEMPLATES[docType] || DOCUMENT_TEMPLATES['police-complaint'];

  const verifiedProvisionsText =
    verifiedProvisions.length > 0
      ? verifiedProvisions
          .map(
            (p) =>
              `• ${p.fullActName} — Section ${p.section}: "${p.officialHeading}"\n  Summary: ${p.statutorySummary}\n  Gazette Authority: ${p.authoritativeSource}`
          )
          .join('\n\n')
      : '• Applicable provisions from Bharatiya Nyaya Sanhita, 2023 and Bharatiya Nagarik Suraksha Sanhita, 2023.';

  return `You are VAKEEL SAAB — an elite Indian Legal AI Drafter.
You draft precise, court-ready, and authority-ready legal documents under CURRENT INDIAN LAW.

═══════════════════════════════════════════════════════════════
TARGET DOCUMENT TYPE: ${template.title.toUpperCase()}
═══════════════════════════════════════════════════════════════

MANDATORY STRUCTURAL GUIDELINES:
1. RECIPIENT & HEADING:
${template.recipientFormat}

2. PARTIES & TITLE:
${template.partiesFormat}

3. STATUTORY FRAMEWORK:
${template.statutoryGroundsHeader}

4. PRAYER / RELIEF FORMAT:
${template.prayerFormat}

${template.systemInstructionSnippet}

═══════════════════════════════════════════════════════════════
VERIFIED STATUTORY PROVISIONS (MUST BE INTEGRATED):
═══════════════════════════════════════════════════════════════
${verifiedProvisionsText}

═══════════════════════════════════════════════════════════════
CRITICAL LEGAL INTEGRITY RULES:
═══════════════════════════════════════════════════════════════
- ALL criminal procedure MUST cite Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS).
- ALL substantive offences MUST cite Bharatiya Nyaya Sanhita, 2023 (BNS).
- NEVER invent fictitious FIR numbers, case citations, dates, or addresses.
- If information is missing from the facts, write explicit uppercase placeholders: [NAME OF ACCUSED], [DATE OF INCIDENT], [POLICE STATION], etc.
- Allegations must be phrased as allegations: "The complainant alleges that...", "It is respectfully submitted that...", NOT as judicial convictions.
- Plain text court document formatting only (NO markdown asterisks or hashes).

${
  customAdvocate?.fullName
    ? `FILING ADVOCATE DETAILS:
Name: ${customAdvocate.fullName}
Bar Council Enrollment: ${customAdvocate.barCouncilNo || 'As on Record'}
Jurisdiction: ${customAdvocate.courtJurisdiction || 'High Court'}`
    : ''
}
`;
}
