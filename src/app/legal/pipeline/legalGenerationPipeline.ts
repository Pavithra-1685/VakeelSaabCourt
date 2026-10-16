// ============================================================
// VAKEEL SAAB — Multi-Stage Legal Generation Pipeline
// Implements Stages A through G:
//   Stage A — Intent Classification
//   Stage B — Fact Extraction
//   Stage C — Missing-Information / Prerequisite Detection
//   Stage D — Legal Research & Provision Resolution
//   Stage E — Document Drafting (via Groq LLM)
//   Stage F — Legal Validation
//   Stage G — Human Review Metadata
// ============================================================

import {
  EnhancedDocumentType,
  UserSituationInput,
  ClassificationResult,
  classifyLegalIntent,
  StatutoryPrerequisiteCheck,
} from '../classification/intentClassifier';
import { VerifiedStatute, searchStatutesByKeyword } from '../registry/statutoryRegistry';
import { buildDraftingSystemPrompt } from '../templates/documentTemplates';
import { validateLegalDraft, LegalValidationResult } from '../validation/legalValidator';

export interface AdvocateCredentials {
  fullName?: string;
  barCouncilNo?: string;
  courtJurisdiction?: string;
}

export interface LegalGenerationResult {
  contentHtml: string;
  rawText: string;
  documentType: EnhancedDocumentType;
  officialTitle: string;
  classification: ClassificationResult;
  validation: LegalValidationResult;
  verifiedProvisions: VerifiedStatute[];
  statutoryPrerequisites: StatutoryPrerequisiteCheck[];
  qualityScore: number;
  warnings: string[];
}

/**
 * Converts plain legal text output into formatted HTML for Tiptap
 */
function plainTextToLegalHTML(text: string): string {
  const lines = text.split('\n');
  const html: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (trimmed === '') {
      html.push('<p></p>');
      continue;
    }

    // Separators
    if (/^[-=_]{10,}$/.test(trimmed)) {
      html.push('<hr>');
      continue;
    }

    // Uppercase headings
    const letters = trimmed.replace(/[^a-zA-Z]/g, '');
    const upperCount = (trimmed.match(/[A-Z]/g) || []).length;
    const upperRatio = letters.length > 0 ? upperCount / letters.length : 0;
    const isHeading =
      upperRatio >= 0.65 &&
      trimmed.length <= 95 &&
      !/^\d+\./.test(trimmed) &&
      !/^\([a-z]\)/.test(trimmed);

    if (isHeading) {
      if (/^[IVXLCDM]+\.\s/.test(trimmed) || /^\d+\.\s[A-Z]/.test(trimmed)) {
        html.push(`<h3>${escapeHtml(trimmed)}</h3>`);
      } else {
        html.push(`<h2>${escapeHtml(trimmed)}</h2>`);
      }
      continue;
    }

    // Numbered list items
    if (/^\d+\.\s/.test(trimmed) || /^\([a-z]\)\s/.test(trimmed)) {
      html.push(`<p>${escapeHtml(raw)}</p>`);
      continue;
    }

    // Default paragraph
    html.push(`<p>${escapeHtml(raw)}</p>`);
  }

  return html.join('');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Fallback static drafter for when network/Groq API is offline or during testing
 */
function draftFallbackDocument(
  docType: EnhancedDocumentType,
  context: string,
  verifiedProvisions: VerifiedStatute[],
  advocate?: AdvocateCredentials
): string {
  const now = new Date().toLocaleDateString('en-IN');
  const advName = advocate?.fullName || '[NAME OF ADVOCATE]';
  const advBar = advocate?.barCouncilNo || '[BAR COUNCIL ENROLLMENT NO.]';

  if (docType === 'police-complaint' || docType === 'fir-complaint') {
    return `TO,
THE STATION HOUSE OFFICER,
POLICE STATION: [NAME OF POLICE STATION],
[DISTRICT / CITY], [STATE]

DATE: ${now}

SUBJECT: WRITTEN COMPLAINT UNDER SECTION 173 OF THE BHARATIYA NAGARIK SURAKSHA SANHITA, 2023 REGARDING COMMISSION OF COGNIZABLE OFFENCE UNDER THE BHARATIYA NYAYA SANHITA, 2023.

COMPLAINANT DETAILS:
Name: [NAME OF COMPLAINANT], S/o [PARENT NAME]
Address: [RESIDENTIAL ADDRESS]
Contact: [PHONE NUMBER]

AGAINST ACCUSED:
[NAME OF ACCUSED / UNKNOWN ACCUSED PERSONS], [ADDRESS/DETAILS IF KNOWN]

RESPECTED SIR/MADAM,

I, the Complainant named above, most respectfully bring to your immediate notice the following facts constituting serious cognizable offences:

1. That the Complainant is a law-abiding citizen residing at the address mentioned hereinabove.

2. CHRONOLOGY OF THE INCIDENT:
${context.trim() || 'On [DATE] at approximately [TIME], at [LOCATION], the accused persons wrongfully committed the alleged acts...'}

3. STATUTORY PROVISIONS INVOLVED:
The aforesaid acts of the accused persons disclose commission of offences punishable under the Bharatiya Nyaya Sanhita, 2023, specifically:
${verifiedProvisions.map((p) => `• Section ${p.section} of the Bharatiya Nyaya Sanhita, 2023 (${p.officialHeading})`).join('\n') || '• Section 303(2) of Bharatiya Nyaya Sanhita, 2023 (Theft)'}

4. PRAYER / RELIEF SOUGHT:
In the premises aforesaid, it is most respectfully prayed that this Police Station may be pleased to:
(a) Register a First Information Report (FIR) under Section 173 of the Bharatiya Nagarik Suraksha Sanhita, 2023 against the accused persons;
(b) Initiate a prompt and impartial investigation into the matter and preserve all relevant CCTV footage and electronic evidence;
(c) Apprehend the accused persons and recover the stolen property in accordance with law.

Yours faithfully,

___________________________
[NAME OF COMPLAINANT]
(Complainant / Informant)
Contact: [PHONE NUMBER]`;
  }

  if (docType === 'sp-representation') {
    return `TO,
THE SUPERINTENDENT OF POLICE / COMMISSIONER OF POLICE,
[DISTRICT / COMMISSIONERATE], [STATE]

DATE: ${now}

SUBJECT: REPRESENTATION UNDER SECTION 173(4) OF THE BHARATIYA NAGARIK SURAKSHA SANHITA, 2023 AGAINST INACTION / REFUSAL BY POLICE STATION [NAME OF POLICE STATION].

APPLICANT:
[NAME OF APPLICANT], Residing at [ADDRESS]

RESPECTED SIR,

The Applicant most respectfully submits as under:

1. That on [DATE OF FIRST COMPLAINT], the Applicant submitted a written complaint to the Station House Officer, Police Station [NAME OF POLICE STATION] regarding commission of cognizable offences. Copy of the said complaint is annexed herewith as ANNEXURE A.

2. That despite receipt of the complaint, the Station House Officer has refused / failed to register an FIR under Section 173(1) BNSS and has taken no investigative action whatsoever.

3. DETAILS OF THE OFFENCE:
${context.trim()}

4. PRAYER:
The Applicant therefore prays that the Superintendent of Police may kindly exercise powers under Section 173(4) of the Bharatiya Nagarik Suraksha Sanhita, 2023 and:
(a) Investigate the matter himself or direct an officer subordinate to him to register the FIR and investigate;
(b) Ensure protection of the Applicant and witnesses against retaliation.

Yours faithfully,

___________________________
[NAME OF APPLICANT]`;
  }

  if (docType === 'bnss-175-3-application') {
    return `IN THE COURT OF THE LD. CHIEF JUDICIAL MAGISTRATE / JUDICIAL MAGISTRATE FIRST CLASS,
AT [DISTRICT / CITY], [STATE]

CRIMINAL MISC. APPLICATION NO. [   ] OF 2026

IN THE MATTER OF:
[NAME OF APPLICANT], S/o [PARENT NAME],
Residing at [ADDRESS]
                                                      ... APPLICANT
                       VERSUS
1. STATE (THROUGH S.H.O., P.S. [NAME OF POLICE STATION])
2. [NAME OF PROPOSED ACCUSED PERSONS]
                                                      ... RESPONDENTS

APPLICATION UNDER SECTION 175(3) OF THE BHARATIYA NAGARIK SURAKSHA SANHITA, 2023 SEEKING DIRECTION FOR REGISTRATION OF FIR AND INVESTIGATION.

MOST RESPECTFULLY SHOWETH:

1. That the Applicant is a resident of [ADDRESS] and is the aggrieved party in the present case.

2. COMPLIANCE WITH STATUTORY REMEDIES UNDER SECTION 173 BNSS:
(a) That on [DATE OF SHO COMPLAINT], the Applicant approached the SHO, Police Station [NAME OF POLICE STATION] with a written complaint under Section 173(1) BNSS. (Annexed as ANNEXURE P-1).
(b) That upon failure of the SHO to register an FIR, the Applicant sent a representation by registered post to the Superintendent of Police under Section 173(4) BNSS on [DATE OF SP COMPLAINT] (Postal receipt and tracking annexed as ANNEXURE P-2).
(c) That despite exhaustion of statutory police remedies, no action has been taken, necessitating this Application under Section 175(3) BNSS.

3. FACTUAL MATRIX DISCLOSING COGNIZABLE OFFENCE:
${context.trim()}

4. PRAYER:
It is therefore most respectfully prayed that this Hon'ble Court may be pleased to:
(a) Direct the Station House Officer, P.S. [NAME OF POLICE STATION] to register an FIR under Section 175(3) BNSS and investigate the offences;
(b) Direct filing of a compliance report before this Court within a specified timeframe.

Filed By:
${advName}, Advocate
${advBar}
Chambers: [ADDRESS]

SUPPORTING AFFIDAVIT SWORN ON OATH UNDER SECTION 175(3) PROVISO
I, [NAME OF APPLICANT], aged [AGE] years, do hereby solemnly affirm and declare on oath that the contents of paragraphs 1 to 4 above are true to my personal knowledge and belief, and that I have complied with the statutory prerequisites of Section 173(4) BNSS.

DEPONENT
Verified at [PLACE] on this ${now}.`;
  }

  if (docType === 'anticipatory-bail') {
    return `IN THE COURT OF LD. SESSIONS JUDGE / HON'BLE HIGH COURT OF [STATE],
AT [PLACE]

ANTICIPATORY BAIL APPLICATION NO. [   ] OF 2026

IN THE MATTER OF:
[NAME OF APPLICANT], S/o [PARENT NAME],
Residing at [ADDRESS]
                                                      ... APPLICANT
                       VERSUS
THE STATE (GOVERNMENT OF [STATE])
                                                      ... RESPONDENT

APPLICATION UNDER SECTION 482 OF THE BHARATIYA NAGARIK SURAKSHA SANHITA, 2023 FOR GRANT OF ANTICIPATORY BAIL.

MOST RESPECTFULLY SHOWETH:

1. That the Applicant has not been arrested and is not in police or judicial custody.

2. That the Applicant has tangible and reasonable apprehension of arrest in connection with [FIR NO. IF LODGED / APPREHENDED COMPLAINT AT P.S. [NAME OF POLICE STATION]].

3. GROUNDS FOR ANTICIPATORY BAIL:
(a) The allegations are false, frivolous, and motivated by enmity.
(b) Fact summary: ${context.trim()}
(c) The Applicant is a respectable citizen with clean antecedents and deep roots in society.
(d) Statutory undertaking under Section 482(2) BNSS: The Applicant undertakes to make himself available for interrogation by police whenever required and shall not tamper with evidence or witnesses.

PRAYER:
It is prayed that in the event of arrest, the Applicant be released on anticipatory bail on terms this Hon'ble Court deems fit.

Filed By:
${advName}, Advocate
${advBar}`;
  }

  // Regular bail
  if (docType === 'bail-petition') {
    return `IN THE COURT OF LD. SESSIONS JUDGE / CHIEF JUDICIAL MAGISTRATE,
AT [DISTRICT / CITY], [STATE]

BAIL APPLICATION NO. [   ] OF 2026
IN FIR NO. [NUMBER/YEAR], P.S. [NAME OF POLICE STATION]

IN THE MATTER OF:
[NAME OF APPLICANT], Currently in Judicial Custody at [NAME OF JAIL]
                                                      ... APPLICANT
                       VERSUS
THE STATE
                                                      ... RESPONDENT

APPLICATION UNDER SECTION 480 / 483 OF THE BHARATIYA NAGARIK SURAKSHA SANHITA, 2023 FOR REGULAR BAIL.

MOST RESPECTFULLY SHOWETH:

1. That the Applicant was arrested on [DATE OF ARREST] and is currently in judicial custody at [NAME OF JAIL].

2. That the Applicant is innocent and has been falsely implicated.
Facts: ${context.trim()}

3. That investigation is substantially complete, custody is no longer required for interrogation, and the Applicant undertakes to abide by all conditions imposed by this Court.

PRAYER:
It is respectfully prayed that the Applicant be released on regular bail.

Filed By:
${advName}, Advocate`;
  }

  // Legal notice fallback
  return `LEGAL DEMAND NOTICE ISSUED UNDER INSTRUCTIONS OF CLIENT

TO: [NAME OF OPPOSITE PARTY], [ADDRESS]
DATE: ${now}

FROM: ${advName}, Advocate, ${advBar}

UNDER INSTRUCTIONS FROM MY CLIENT: [NAME OF CLIENT]

Sir/Madam,
Under instructions from my client, I hereby serve upon you this Legal Notice:
1. Facts: ${context.trim()}
2. You are hereby called upon to comply with the demands within 15 days of receipt of this notice, failing which appropriate legal proceedings shall be initiated against you.

${advName}, Advocate`;
}

/**
 * Executes the complete Multi-Stage Legal Generation Pipeline
 */
export async function executeLegalPipeline(params: {
  situation: UserSituationInput;
  advocate?: AdvocateCredentials;
  overrideType?: EnhancedDocumentType;
}): Promise<LegalGenerationResult> {
  const { situation, advocate, overrideType } = params;

  // ─────────────────────────────────────────────────────────
  // STAGE A & C: Intent Classification & Prerequisite Check
  // ─────────────────────────────────────────────────────────
  const classification = classifyLegalIntent(situation);
  const activeDocType = overrideType || classification.recommendedType;

  // ─────────────────────────────────────────────────────────
  // STAGE D: Legal Research & Provision Resolution
  // ─────────────────────────────────────────────────────────
  let verifiedProvisions = [...classification.applicableProvisions];
  if (verifiedProvisions.length === 0) {
    const keywords = `${situation.incidentDescription} ${situation.rawUserPrompt || ''}`;
    const autoResolved = searchStatutesByKeyword(keywords.substring(0, 50));
    verifiedProvisions.push(...autoResolved.slice(0, 3));
  }

  // ─────────────────────────────────────────────────────────
  // STAGE E: Document Drafting
  // ─────────────────────────────────────────────────────────
  const apiKey = import.meta.env?.VITE_GROQ_API_KEY;
  let rawText = '';

  if (apiKey && apiKey !== 'your_groq_api_key_here') {
    const systemPrompt = buildDraftingSystemPrompt(activeDocType, verifiedProvisions, advocate);
    const userPrompt = `DRAFTING INTAKE:
Document Type Requested: ${activeDocType}
Incident Description: ${situation.incidentDescription}
Incident Date: ${situation.incidentDate || 'Not specified'}
Police Approach Status: ${situation.hasApproachedPolice ? 'Yes' : 'No'}
Superintendent of Police Approach Status: ${situation.hasApproachedSP ? 'Yes' : 'No'}
Custody / Arrest Status: ${situation.isApplicantArrestedOrInCustody ? 'In Custody' : 'Not in custody'}
Existing FIR No: ${situation.existingFirNo || 'None'}

Please draft the complete formal legal document now following the mandatory structural guidelines.`;

    const modelsToTry = [
      'llama-3.3-70b-versatile',
      'qwen/qwen3.8-27b',
      'openai/gpt-oss-120b',
      'groq/compound',
    ];

    for (const model of modelsToTry) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            model,
            temperature: 0.15,
            max_tokens: 3800,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          let txt = data.choices[0]?.message?.content || '';
          txt = txt.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
          if (txt.length > 100) {
            rawText = txt;
            break;
          }
        }
      } catch (e) {
        console.warn(`Groq pipeline model ${model} error, attempting fallback:`, e);
      }
    }
  }

  // Use robust legal fallback if Groq API is unavailable or in offline test environment
  if (!rawText) {
    rawText = draftFallbackDocument(
      activeDocType,
      situation.incidentDescription,
      verifiedProvisions,
      advocate
    );
  }

  // ─────────────────────────────────────────────────────────
  // STAGE F: Legal Validation
  // ─────────────────────────────────────────────────────────
  const validation = validateLegalDraft({
    docType: activeDocType,
    content: rawText,
    classification,
    userFacts: situation.incidentDescription,
  });

  // ─────────────────────────────────────────────────────────
  // STAGE G: Human Review & HTML Compilation
  // ─────────────────────────────────────────────────────────
  const contentHtml = plainTextToLegalHTML(rawText);

  const warnings = [
    ...classification.warnings,
    ...validation.criticalErrors.map((e) => `[CRITICAL] ${e.message} — ${e.recommendation}`),
    ...validation.warnings.map((w) => `[WARNING] ${w.message}`),
  ];

  return {
    contentHtml,
    rawText,
    documentType: activeDocType,
    officialTitle: classification.officialDocumentTitle,
    classification,
    validation,
    verifiedProvisions,
    statutoryPrerequisites: classification.statutoryPrerequisites,
    qualityScore: validation.qualityScore,
    warnings,
  };
}
