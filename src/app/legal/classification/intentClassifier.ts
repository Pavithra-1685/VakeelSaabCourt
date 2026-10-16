// ============================================================
// VAKEEL SAAB — Legal Intent Classifier & Procedural Router
// Classifies user situations into exact, legally sound document types
// Enforces Indian criminal procedure prerequisites (BNSS 2023)
// ============================================================

import {
  VerifiedStatute,
  lookupStatute,
  resolveLegacyProvision,
  searchStatutesByKeyword,
} from '../registry/statutoryRegistry';

export type EnhancedDocumentType =
  | 'police-complaint' // Complaint to SHO under S. 173 BNSS (Never an FIR)
  | 'sp-representation' // Representation to SP under S. 173(4) BNSS
  | 'bnss-175-3-application' // Application to Magistrate under S. 175(3) BNSS
  | 'bail-petition' // Regular Bail under S. 480 or S. 483 BNSS
  | 'anticipatory-bail' // Anticipatory Bail under S. 482 BNSS
  | 'magistrate-complaint' // Private Criminal Complaint under S. 223 BNSS
  | 'legal-notice' // Civil/Commercial Demand Notice
  | 'writ-petition' // Art. 226 / 32 Constitutional Writ
  | 'civil-pleading' // Plaint or Civil Suit
  | 'affidavit' // General Sworn Affidavit
  | 'counter-affidavit' // Reply Affidavit
  | 'written-statement' // Defense in Civil Suit
  | 'general-legal-advice' // Legal Analysis & Opinion
  // Backwards compatibility alias:
  | 'fir-complaint'
  | 'criminal-complaint';

export interface UserSituationInput {
  rawUserPrompt?: string;
  incidentDescription: string;
  desiredOutcome?:
    | 'report_offence'
    | 'escalate_police_inaction'
    | 'magistrate_investigation'
    | 'seek_bail'
    | 'seek_anticipatory_bail'
    | 'private_prosecution'
    | 'demand_cure_civil'
    | 'constitutional_remedy'
    | 'general_advice';
  hasApproachedPolice?: boolean | 'yes' | 'no' | 'unspecified';
  policeActionTaken?: 'none' | 'refused' | 'fir_registered' | 'investigating' | 'unspecified';
  hasApproachedSP?: boolean | 'yes' | 'no' | 'unspecified';
  hasSupportingAffidavit?: boolean | 'yes' | 'no' | 'unspecified';
  isApplicantArrestedOrInCustody?: boolean | 'yes' | 'no' | 'unspecified';
  existingFirNo?: string;
  incidentDate?: string;
  citedSections?: string[];
}

export interface StatutoryPrerequisiteCheck {
  id: string;
  requirement: string;
  isSatisfied: boolean;
  isMandatory: boolean;
  statutoryBasis: string;
  note: string;
}

export interface ClassificationResult {
  recommendedType: EnhancedDocumentType;
  officialDocumentTitle: string;
  recipientDescription: string;
  proceduralExplanation: string;
  statutoryPrerequisites: StatutoryPrerequisiteCheck[];
  hasMissingMandatoryPrerequisite: boolean;
  missingMaterialFacts: string[];
  followUpQuestions: string[];
  applicableProvisions: VerifiedStatute[];
  legacyResolved?: {
    legacy: string;
    resolvedTo: VerifiedStatute;
    transitionNote: string;
  }[];
  escalationPath: string[];
  cognizabilityAssessment: {
    isCognizable: boolean;
    requiresMagistrateOrder: boolean;
    reasoning: string;
  };
  warnings: string[];
  isAmbiguous: boolean;
}

/**
 * Normalizes boolean or 'yes'/'no' string inputs
 */
function toBoolean(val?: boolean | string): boolean {
  if (typeof val === 'boolean') return val;
  if (!val) return false;
  const s = String(val).toLowerCase().trim();
  return s === 'yes' || s === 'true' || s === '1';
}

/**
 * Stage A & C: Intent Classification, Procedural Escalation & Prerequisite Detection
 */
export function classifyLegalIntent(input: UserSituationInput): ClassificationResult {
  const text = `${input.rawUserPrompt || ''} ${input.incidentDescription || ''}`.toLowerCase();
  const hasPoliceApproach = toBoolean(input.hasApproachedPolice);
  const hasSPApproach = toBoolean(input.hasApproachedSP);
  const inCustody = toBoolean(input.isApplicantArrestedOrInCustody);
  const hasAffidavit = toBoolean(input.hasSupportingAffidavit);
  const hasFir = Boolean(input.existingFirNo && input.existingFirNo.trim().length > 0) || text.includes('fir no');

  const warnings: string[] = [];
  const followUpQuestions: string[] = [];
  const missingMaterialFacts: string[] = [];
  const prerequisites: StatutoryPrerequisiteCheck[] = [];
  const applicableProvisions: VerifiedStatute[] = [];
  const legacyResolved: ClassificationResult['legacyResolved'] = [];

  // Check for legacy IPC/CrPC citations in input
  const ipcMatches = text.match(/\b(?:ipc|section|sec\.?)\s*(\d{2,3}[a-z]?)\b/gi) || [];
  const crpcMatches = text.match(/\b(?:crpc|section|sec\.?)\s*(\d{2,3}[a-z]?(?:\(\d\))?)\b/gi) || [];

  for (const m of ipcMatches) {
    const secNum = m.replace(/[^0-9a-zA-Z]/g, '');
    const res = resolveLegacyProvision('IPC', secNum, input.incidentDate);
    if (res.current) {
      applicableProvisions.push(res.current);
      legacyResolved.push({
        legacy: `IPC Section ${secNum}`,
        resolvedTo: res.current,
        transitionNote: res.transitionNote,
      });
    }
  }

  for (const m of crpcMatches) {
    const secNum = m.replace(/[^0-9a-zA-Z]/g, '');
    const res = resolveLegacyProvision('CrPC', secNum, input.incidentDate);
    if (res.current) {
      applicableProvisions.push(res.current);
      legacyResolved.push({
        legacy: `CrPC Section ${secNum}`,
        resolvedTo: res.current,
        transitionNote: res.transitionNote,
      });
    }
  }

  // Cognizability assessment
  let isCognizable = true;
  let requiresMagistrateOrder = false;
  let cognizabilityReasoning = 'Offence appears to disclose a cognizable case under BNS 2023.';

  const isSimpleAbuse =
    (text.includes('abuse') || text.includes('abusive') || text.includes('insult') || text.includes('quarrel')) &&
    !text.includes('theft') &&
    !text.includes('snatch') &&
    !text.includes('kill') &&
    !text.includes('fracture') &&
    !text.includes('cheat') &&
    !text.includes('stole');

  if (isSimpleAbuse || text.includes('non-cognizable') || text.includes('petty dispute')) {
    isCognizable = false;
    requiresMagistrateOrder = true;
    cognizabilityReasoning =
      'Allegations may relate to non-cognizable offences (e.g. S. 352 BNS). Police cannot register an FIR or investigate without a Magistrate order under S. 174 BNSS.';
    warnings.push(
      'Notice: The facts may constitute a non-cognizable offence. Police are barred from registering an FIR without an order from the Judicial Magistrate under Section 174 BNSS.'
    );
  }

  // Missing material facts inspection
  if (!input.incidentDate && !text.match(/\b\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}\b/)) {
    missingMaterialFacts.push('Incident Date');
    followUpQuestions.push('When exactly did the incident take place?');
  }

  if (
    !text.includes('police station') &&
    !text.includes('ps ') &&
    !text.includes('p.s.') &&
    !text.includes('jurisdiction')
  ) {
    missingMaterialFacts.push('Police Station / Local Jurisdiction');
    followUpQuestions.push('Which local police station or district holds territorial jurisdiction over the incident?');
  }

  // -------------------------------------------------------------
  // BRANCH 1: BAIL MATTERS (REGULAR vs ANTICIPATORY)
  // -------------------------------------------------------------
  const isBailIntent =
    input.desiredOutcome === 'seek_bail' ||
    input.desiredOutcome === 'seek_anticipatory_bail' ||
    text.includes('anticipatory bail') ||
    text.includes('regular bail') ||
    (text.includes('bail') && (text.includes('arrest') || text.includes('custody') || hasFir));

  if (isBailIntent) {
    const isAnticipatory =
      input.desiredOutcome === 'seek_anticipatory_bail' ||
      text.includes('anticipatory') ||
      text.includes('pre-arrest') ||
      text.includes('apprehending arrest') ||
      (!inCustody && text.includes('fear of arrest'));

    if (isAnticipatory) {
      const bnss482 = lookupStatute('BNSS', '482');
      if (bnss482) applicableProvisions.push(bnss482);

      prerequisites.push({
        id: 'not_in_custody',
        requirement: 'Applicant must NOT be in police or judicial custody',
        isSatisfied: !inCustody,
        isMandatory: true,
        statutoryBasis: 'Section 482 of Bharatiya Nagarik Suraksha Sanhita, 2023',
        note: inCustody
          ? 'CRITICAL DEFECT: Person is already in custody. Anticipatory bail under Section 482 is not maintainable. Regular bail under Section 480 or 483 must be filed instead.'
          : 'Satisfied: Applicant is not under arrest and apprehends arrest.',
      });

      prerequisites.push({
        id: 'tangible_apprehension',
        requirement: 'Tangible, reasonable apprehension of arrest on accusation of non-bailable offence',
        isSatisfied: true,
        isMandatory: true,
        statutoryBasis: 'Section 482(1) BNSS & Supreme Court guidelines (Gurbaksh Singh Sibbia)',
        note: 'Must articulate concrete grounds of apprehension, such as police visits, summons, or registered FIR.',
      });

      if (inCustody) {
        warnings.push(
          'Conflict detected: You specified anticipatory bail, but the applicant is already in custody. In Indian criminal procedure, once arrested, only a Regular Bail Application is legally maintainable.'
        );
      }

      return {
        recommendedType: 'anticipatory-bail',
        officialDocumentTitle: 'Application for Anticipatory Bail under Section 482 of the BNSS, 2023',
        recipientDescription: 'In the Court of Ld. Sessions Judge / Hon’ble High Court',
        proceduralExplanation:
          'Applicant has not been arrested and seeks pre-arrest protection under Section 482 BNSS against apprehended arrest in a non-bailable offence.',
        statutoryPrerequisites: prerequisites,
        hasMissingMandatoryPrerequisite: inCustody,
        missingMaterialFacts,
        followUpQuestions,
        applicableProvisions,
        legacyResolved,
        escalationPath: [
          '1. Move Application before the Court of Session under Section 482 BNSS',
          '2. If rejected by Sessions, approach the Hon’ble High Court under Section 482 BNSS',
        ],
        cognizabilityAssessment: {
          isCognizable: true,
          requiresMagistrateOrder: false,
          reasoning: 'Anticipatory bail pertains to apprehension of arrest in non-bailable offences.',
        },
        warnings,
        isAmbiguous: false,
      };
    }

    // Regular Bail
    const bnss480 = lookupStatute('BNSS', '480');
    const bnss483 = lookupStatute('BNSS', '483');
    if (bnss480) applicableProvisions.push(bnss480);
    if (bnss483) applicableProvisions.push(bnss483);

    prerequisites.push({
      id: 'in_custody',
      requirement: 'Applicant must be in actual custody (judicial or police) or appearing before court',
      isSatisfied: inCustody || Boolean(hasFir),
      isMandatory: true,
      statutoryBasis: 'Section 480 / 483 of Bharatiya Nagarik Suraksha Sanhita, 2023',
      note: 'Regular bail requires custody or surrender to court jurisdiction.',
    });

    if (!hasFir) {
      missingMaterialFacts.push('FIR Number and Police Station');
      followUpQuestions.push('What is the FIR Number and Police Station under which the applicant was arrested?');
    }

    return {
      recommendedType: 'bail-petition',
      officialDocumentTitle: 'Application for Regular Bail under Section 480 / 483 of the BNSS, 2023',
      recipientDescription: 'In the Court of Ld. Magistrate / Sessions Judge',
      proceduralExplanation:
        'Applicant is in custody pursuant to arrest in an existing criminal case and seeks release on regular bail under Section 480 or Section 483 BNSS.',
      statutoryPrerequisites: prerequisites,
      hasMissingMandatoryPrerequisite: false,
      missingMaterialFacts,
      followUpQuestions,
      applicableProvisions,
      legacyResolved,
      escalationPath: [
        '1. Application before competent Judicial Magistrate under Section 480 BNSS',
        '2. If rejected or triable by Sessions, Application before Court of Session under Section 483 BNSS',
        '3. If rejected by Sessions, Application before Hon’ble High Court under Section 483 BNSS',
      ],
      cognizabilityAssessment: {
        isCognizable: true,
        requiresMagistrateOrder: false,
        reasoning: 'Regular bail proceedings arise from arrest in criminal matters.',
      },
      warnings,
      isAmbiguous: false,
    };
  }

  // -------------------------------------------------------------
  // BRANCH 2: CRIMINAL COMPLAINT ESCALATION (SHO -> SP -> MAGISTRATE)
  // -------------------------------------------------------------

  const isCriminalReport =
    input.desiredOutcome === 'report_offence' ||
    input.desiredOutcome === 'escalate_police_inaction' ||
    input.desiredOutcome === 'magistrate_investigation' ||
    input.desiredOutcome === 'private_prosecution' ||
    text.includes('theft') ||
    text.includes('snatch') ||
    text.includes('snatched') ||
    text.includes('rob') ||
    text.includes('robbed') ||
    text.includes('robbery') ||
    text.includes('loot') ||
    text.includes('pickpocket') ||
    text.includes('cheating') ||
    text.includes('fraud') ||
    text.includes('assault') ||
    text.includes('fir') ||
    text.includes('police complaint') ||
    text.includes('156(3)') ||
    text.includes('175(3)') ||
    text.includes('stole') ||
    text.includes('stolen') ||
    text.includes('harassment') ||
    text.includes('threaten');

  if (isCriminalReport) {
    // SCENARIO 2C: User explicitly requests Section 175(3) BNSS or Magistrate Order
    const userWantsMagistrate =
      input.desiredOutcome === 'magistrate_investigation' ||
      text.includes('175(3)') ||
      text.includes('156(3)') ||
      text.includes('direct police to register fir') ||
      text.includes('magistrate direction');

    if (userWantsMagistrate) {
      const bnss175 = lookupStatute('BNSS', '175(3)');
      if (bnss175) applicableProvisions.push(bnss175);

      const shoPrereqSatisfied = hasPoliceApproach;
      const spPrereqSatisfied = hasSPApproach;
      const affidavitSatisfied = hasAffidavit;

      prerequisites.push({
        id: 'prior_sho_complaint',
        requirement: 'Prior written complaint submitted to Station House Officer under Section 173(1) BNSS',
        isSatisfied: shoPrereqSatisfied,
        isMandatory: true,
        statutoryBasis: 'Section 175(3) BNSS & Sakiri Vasu v. State of UP doctrine',
        note: shoPrereqSatisfied
          ? 'Satisfied: Written complaint previously lodged with police station.'
          : 'MISSING PREREQUISITE: Cannot approach Magistrate without first submitting written complaint to local police station under Section 173(1) BNSS.',
      });

      prerequisites.push({
        id: 'prior_sp_representation',
        requirement:
          'Prior written representation sent by post to Superintendent of Police under Section 173(4) BNSS upon SHO refusal',
        isSatisfied: spPrereqSatisfied,
        isMandatory: true,
        statutoryBasis: 'Mandatory statutory prerequisite under Section 175(3) BNSS proviso',
        note: spPrereqSatisfied
          ? 'Satisfied: Representation sent to Superintendent of Police.'
          : 'CRITICAL MISSING PREREQUISITE: Section 175(3) BNSS strictly bars an application unless remedy under Section 173(4) with the Superintendent of Police has been exhausted and demonstrated.',
      });

      prerequisites.push({
        id: 'supporting_affidavit',
        requirement: 'Accompanying affidavit sworn on oath confirming truth of facts and police inaction',
        isSatisfied: affidavitSatisfied,
        isMandatory: true,
        statutoryBasis: 'Section 175(3) BNSS proviso & Priyanka Srivastava v. State of UP (2015)',
        note: affidavitSatisfied
          ? 'Satisfied: Affidavit on oath will be annexed.'
          : 'MANDATORY REQUIREMENT: An affidavit duly sworn on oath must be attached to prevent frivolous applications.',
      });

      const missingPrereq = !shoPrereqSatisfied || !spPrereqSatisfied || !affidavitSatisfied;

      if (!spPrereqSatisfied) {
        warnings.push(
          'Statutory Bar Warning: Section 175(3) BNSS mandates prior written representation to the Superintendent of Police under Section 173(4) BNSS. If you have not approached the SP, the Magistrate is legally bound to dismiss or return the application.'
        );
        followUpQuestions.push(
          'Did you send a written complaint to the Superintendent of Police / Commissioner of Police by registered post? If not, you must first file a Representation to the SP under Section 173(4) BNSS.'
        );
      }

      if (!shoPrereqSatisfied) {
        warnings.push(
          'Procedural Gap: You cannot skip the police station and directly file a Section 175(3) BNSS application before the Magistrate.'
        );
      }

      return {
        recommendedType: 'bnss-175-3-application',
        officialDocumentTitle:
          'Application under Section 175(3) of the Bharatiya Nagarik Suraksha Sanhita, 2023',
        recipientDescription:
          'In the Court of Ld. Chief Judicial Magistrate / Judicial Magistrate First Class',
        proceduralExplanation:
          'Application to the Judicial Magistrate seeking an order directing the police to register an FIR and investigate a cognizable offence, subject to fulfilling statutory prerequisites under Section 173(4) BNSS.',
        statutoryPrerequisites: prerequisites,
        hasMissingMandatoryPrerequisite: missingPrereq,
        missingMaterialFacts,
        followUpQuestions,
        applicableProvisions,
        legacyResolved,
        escalationPath: [
          'Step 1: Written Complaint to SHO under Section 173(1) BNSS',
          'Step 2: Representation to Superintendent of Police by post under Section 173(4) BNSS',
          'Step 3: Application before Judicial Magistrate under Section 175(3) BNSS with Supporting Affidavit',
        ],
        cognizabilityAssessment: {
          isCognizable,
          requiresMagistrateOrder,
          reasoning: cognizabilityReasoning,
        },
        warnings,
        isAmbiguous: false,
      };
    }

    // SCENARIO 2B: Police refused or failed to act on earlier complaint -> Escalate to SP
    const policeRefused =
      input.policeActionTaken === 'refused' ||
      input.policeActionTaken === 'none' ||
      input.desiredOutcome === 'escalate_police_inaction' ||
      text.includes('refused to register') ||
      text.includes('police refused') ||
      text.includes('no action taken') ||
      text.includes('sho did not');

    if (hasPoliceApproach && policeRefused && !hasSPApproach) {
      const bnss173_4 = lookupStatute('BNSS', '173(4)');
      if (bnss173_4) applicableProvisions.push(bnss173_4);

      prerequisites.push({
        id: 'prior_sho_complaint',
        requirement: 'Prior complaint submitted to the Station House Officer',
        isSatisfied: true,
        isMandatory: true,
        statutoryBasis: 'Section 173(4) BNSS',
        note: 'Satisfied: Written complaint was lodged with police station and no action was taken.',
      });

      return {
        recommendedType: 'sp-representation',
        officialDocumentTitle:
          'Representation under Section 173(4) of the Bharatiya Nagarik Suraksha Sanhita, 2023',
        recipientDescription:
          'To The Superintendent of Police / Deputy Commissioner of Police / Commissioner of Police',
        proceduralExplanation:
          'Because the Station House Officer refused or failed to act on the written complaint, Indian law provides a statutory remedy under Section 173(4) BNSS by sending a written representation to the Superintendent of Police.',
        statutoryPrerequisites: prerequisites,
        hasMissingMandatoryPrerequisite: false,
        missingMaterialFacts,
        followUpQuestions,
        applicableProvisions,
        legacyResolved,
        escalationPath: [
          'Step 1: Written Complaint to SHO [Completed / Refused]',
          'Step 2: Representation to Superintendent of Police under Section 173(4) BNSS [Current Step]',
          'Step 3: If SP does not act, Application before Magistrate under Section 175(3) BNSS',
        ],
        cognizabilityAssessment: {
          isCognizable,
          requiresMagistrateOrder,
          reasoning: cognizabilityReasoning,
        },
        warnings,
        isAmbiguous: false,
      };
    }

    // SCENARIO 2A: Initial reporting of an alleged offence -> Police Complaint (SHO)
    // NEVER GENERATE AN FIR AS IF DRAFTED BY AN ADVOCATE!
    const bnss173 = lookupStatute('BNSS', '173');
    if (bnss173) applicableProvisions.push(bnss173);

    // Resolve substantive offence (e.g. theft S. 303(2), cheating S. 318(4))
    if (text.includes('theft') || text.includes('stole') || text.includes('stolen')) {
      const theftStatute = lookupStatute('BNS', '303(2)');
      if (theftStatute) applicableProvisions.push(theftStatute);
    } else if (text.includes('cheat') || text.includes('fraud') || text.includes('money')) {
      const cheatStatute = lookupStatute('BNS', '318(4)');
      if (cheatStatute) applicableProvisions.push(cheatStatute);
    } else if (text.includes('breach of trust') || text.includes('entrusted')) {
      const cbtStatute = lookupStatute('BNS', '316');
      if (cbtStatute) applicableProvisions.push(cbtStatute);
    } else if (text.includes('hurt') || text.includes('beat') || text.includes('injury')) {
      const hurtStatute = lookupStatute('BNS', '115');
      if (hurtStatute) applicableProvisions.push(hurtStatute);
    }

    return {
      recommendedType: 'police-complaint',
      officialDocumentTitle: 'Complaint to the Station House Officer under Section 173 of the BNSS, 2023',
      recipientDescription: 'To The Station House Officer, Police Station: [POLICE STATION NAME]',
      proceduralExplanation:
        'A formal written complaint addressed to the local Station House Officer requesting registration of an FIR and investigation of an alleged cognizable offence. An advocate drafts a complaint; only police officers register an FIR.',
      statutoryPrerequisites: [
        {
          id: 'factual_allegation',
          requirement: 'Clear narration of facts disclosing commission of cognizable offence',
          isSatisfied: true,
          isMandatory: true,
          statutoryBasis: 'Section 173(1) of Bharatiya Nagarik Suraksha Sanhita, 2023',
          note: 'Must set out date, time, place, accused identity (or unknown persons), and stolen property/injury.',
        },
      ],
      hasMissingMandatoryPrerequisite: false,
      missingMaterialFacts,
      followUpQuestions,
      applicableProvisions,
      legacyResolved,
      escalationPath: [
        'Step 1: Submit Written Complaint to SHO under Section 173(1) BNSS [Current Step]',
        'Step 2: Obtain GD / acknowledgment entry',
        'Step 3: If SHO refuses or fails to investigate, submit representation to Superintendent of Police under Section 173(4) BNSS',
        'Step 4: If police remedies exhausted, move Magistrate under Section 175(3) BNSS',
      ],
      cognizabilityAssessment: {
        isCognizable,
        requiresMagistrateOrder,
        reasoning: cognizabilityReasoning,
      },
      warnings,
      isAmbiguous: false,
    };
  }

  // -------------------------------------------------------------
  // BRANCH 3: CIVIL / COMMERCIAL / LEGAL NOTICE
  // -------------------------------------------------------------
  const isCivilNotice =
    input.desiredOutcome === 'demand_cure_civil' ||
    text.includes('legal notice') ||
    text.includes('notice') ||
    text.includes('cheque bounce') ||
    text.includes('138') ||
    text.includes('breach of contract') ||
    text.includes('recovery of money') ||
    text.includes('tenant') ||
    text.includes('defamation');

  if (isCivilNotice) {
    if (text.includes('cheque') || text.includes('138')) {
      const ni138 = lookupStatute('NI Act', '138');
      if (ni138) applicableProvisions.push(ni138);
    }

    return {
      recommendedType: 'legal-notice',
      officialDocumentTitle: 'Statutory / Legal Demand Notice by Advocate',
      recipientDescription: 'To The Opposite Party / Addressee',
      proceduralExplanation:
        'Formal demand notice drafted by an enrolled advocate setting forth client grievances, factual breaches, specific statutory demands, and a strict timeline (typically 15 days) before instituting legal proceedings.',
      statutoryPrerequisites: [
        {
          id: 'cause_of_action',
          requirement: 'Clear statement of contract, debt, or legal right breached',
          isSatisfied: true,
          isMandatory: true,
          statutoryBasis: 'Code of Civil Procedure, 1908 / Section 138 NI Act',
          note: 'Must specify payment amount, invoice/cheque numbers, or specific performance demanded.',
        },
      ],
      hasMissingMandatoryPrerequisite: false,
      missingMaterialFacts,
      followUpQuestions,
      applicableProvisions,
      legacyResolved,
      escalationPath: [
        '1. Service of Legal Notice via Speed Post with Acknowledgment Due',
        '2. Await statutory cure period (15 days)',
        '3. Institute civil suit for recovery or Section 138 NI Act criminal complaint before Magistrate',
      ],
      cognizabilityAssessment: {
        isCognizable: false,
        requiresMagistrateOrder: false,
        reasoning: 'Civil/commercial disputes are outside police cognizable jurisdiction.',
      },
      warnings,
      isAmbiguous: false,
    };
  }

  // -------------------------------------------------------------
  // BRANCH 4: CONSTITUTIONAL WRIT PETITION
  // -------------------------------------------------------------
  if (
    input.desiredOutcome === 'constitutional_remedy' ||
    text.includes('writ') ||
    text.includes('article 226') ||
    text.includes('article 32') ||
    text.includes('mandamus') ||
    text.includes('habeas corpus') ||
    text.includes('certiorari')
  ) {
    return {
      recommendedType: 'writ-petition',
      officialDocumentTitle: 'Writ Petition under Article 226 / Article 32 of the Constitution of India',
      recipientDescription: 'In the Hon’ble High Court of [STATE] / Hon’ble Supreme Court of India',
      proceduralExplanation:
        'Extraordinary constitutional remedy invoking writ jurisdiction for enforcement of fundamental rights or remedy against illegal state action.',
      statutoryPrerequisites: [
        {
          id: 'state_action',
          requirement: 'Respondent must be State or instrumentality of State under Article 12',
          isSatisfied: true,
          isMandatory: true,
          statutoryBasis: 'Article 12 and 226 of the Constitution of India',
          note: 'Writ does not ordinarily lie against purely private entities without public duty.',
        },
      ],
      hasMissingMandatoryPrerequisite: false,
      missingMaterialFacts,
      followUpQuestions,
      applicableProvisions,
      legacyResolved,
      escalationPath: [
        '1. Representation to competent State Authority',
        '2. File Writ Petition before Hon’ble High Court under Article 226',
        '3. Special Leave Petition before Hon’ble Supreme Court under Article 136',
      ],
      cognizabilityAssessment: {
        isCognizable: false,
        requiresMagistrateOrder: false,
        reasoning: 'Constitutional writ jurisdiction.',
      },
      warnings,
      isAmbiguous: false,
    };
  }

  // DEFAULT / GENERAL LEGAL ADVICE
  return {
    recommendedType: 'general-legal-advice',
    officialDocumentTitle: 'Comprehensive Legal Opinion & Procedural Assessment',
    recipientDescription: 'Prepared for Advocate Chambers & Client Advisory',
    proceduralExplanation:
      'The facts provided indicate a mixed or preliminary legal scenario. A structured legal opinion analyzing rights, remedies, and applicable Indian statutes is recommended.',
    statutoryPrerequisites: [],
    hasMissingMandatoryPrerequisite: false,
    missingMaterialFacts,
    followUpQuestions: [
      'What specific outcome is desired (e.g. criminal action, financial recovery, defense, or injunction)?',
      'Have any steps already been taken with the police or courts?',
    ],
    applicableProvisions,
    legacyResolved,
    escalationPath: ['1. Preliminary legal consultation', '2. Evidence assessment', '3. Appropriate proceeding'],
    cognizabilityAssessment: {
      isCognizable: false,
      requiresMagistrateOrder: false,
      reasoning: 'Preliminary advisory phase.',
    },
    warnings,
    isAmbiguous: text.trim().length < 20,
  };
}
