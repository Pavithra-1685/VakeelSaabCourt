// ============================================================
// VAKEEL SAAB — Verified Indian Statutory Provision Registry
// Authoritative Registry of BNS (2023), BNSS (2023), BSA (2023)
// and Legacy Cross-References (IPC 1860, CrPC 1973, IEA 1872)
// ============================================================

export interface VerifiedStatute {
  act: 'BNS' | 'BNSS' | 'BSA' | 'CPC' | 'Constitution' | 'NI Act' | 'IPC' | 'CrPC' | 'IEA';
  fullActName: string;
  section: string;
  subsection?: string;
  officialHeading: string;
  statutorySummary: string;
  effectiveDate: string; // YYYY-MM-DD
  authoritativeSource: string;
  category: 'substantive' | 'procedural' | 'evidence' | 'constitutional' | 'civil';
  isCognizable?: boolean;
  isBailable?: boolean;
  cognizabilityNote?: string;
  statutoryPrerequisites?: string[];
  repealsLegacy?: {
    act: string;
    section: string;
    notes: string;
  };
}

export interface LegacyMapping {
  legacyAct: 'IPC' | 'CrPC' | 'IEA';
  legacySection: string;
  legacyHeading: string;
  currentAct: 'BNS' | 'BNSS' | 'BSA';
  currentSection: string;
  currentHeading: string;
  transitionRule: string;
  notes: string;
}

// ────────────────────────────────────────────────────────────
// 1. VERIFIED STATUTORY PROVISIONS REGISTRY
// ────────────────────────────────────────────────────────────
export const VERIFIED_REGISTRY: Record<string, VerifiedStatute> = {
  // BNSS — Criminal Procedure
  'BNSS:173': {
    act: 'BNSS',
    fullActName: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
    section: '173',
    officialHeading: 'Information in cognizable cases',
    statutorySummary:
      'Mandates that information relating to the commission of a cognizable offence given orally or by electronic communication to an officer in charge of a police station shall be reduced to writing and registered as an FIR. Also allows preliminary enquiry in offences punishable with 3 to 7 years with prior DySP permission.',
    effectiveDate: '2024-07-01',
    authoritativeSource: 'Gazette of India, Extraordinary, Part II, Section 1, Act No. 46 of 2023',
    category: 'procedural',
    repealsLegacy: {
      act: 'CrPC',
      section: '154',
      notes: 'Subsumes Section 154 CrPC with additions for e-FIR and preliminary enquiry in specified offences.',
    },
  },
  'BNSS:173(4)': {
    act: 'BNSS',
    fullActName: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
    section: '173(4)',
    officialHeading: 'Representation to Superintendent of Police upon refusal by Station House Officer',
    statutorySummary:
      'Any person aggrieved by a refusal on the part of an officer in charge of a police station to record the information under sub-section (1) may send the substance of such information, in writing and by post, to the Superintendent of Police concerned.',
    effectiveDate: '2024-07-01',
    authoritativeSource: 'Gazette of India, Extraordinary, Part II, Section 1, Act No. 46 of 2023',
    category: 'procedural',
    statutoryPrerequisites: [
      'Prior written complaint submitted to the Station House Officer (SHO)',
      'Refusal or inaction by the police station concerned',
      'Sent in writing and by post (registered/speed post with proof) or recorded delivery to Superintendent of Police',
    ],
    repealsLegacy: {
      act: 'CrPC',
      section: '154(3)',
      notes: 'Direct correspondence to Section 154(3) CrPC.',
    },
  },
  'BNSS:175(3)': {
    act: 'BNSS',
    fullActName: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
    section: '175(3)',
    officialHeading: 'Magistrate directing investigation in cognizable offence upon statutory compliance',
    statutorySummary:
      'Any Magistrate empowered under section 210 may order an investigation on an application made by any person alleging commission of a cognizable offence. The application MUST be accompanied by an affidavit stating that the applicant has exhausted remedies under sub-section (4) of section 173 with the Superintendent of Police.',
    effectiveDate: '2024-07-01',
    authoritativeSource: 'Gazette of India, Extraordinary, Part II, Section 1, Act No. 46 of 2023',
    category: 'procedural',
    statutoryPrerequisites: [
      'Prior written complaint to Station House Officer under Section 173(1) BNSS',
      'Prior written representation sent by post to Superintendent of Police under Section 173(4) BNSS',
      'Affidavit sworn on oath accompanying application verifying factual matrix and non-compliance by police (Priyanka Srivastava doctrine)',
      'Submission before the competent Judicial Magistrate having local jurisdiction',
    ],
    repealsLegacy: {
      act: 'CrPC',
      section: '156(3)',
      notes:
        'Replaces Section 156(3) CrPC with express statutory codification of the mandatory affidavit requirement and prior exhaustion of SP remedy.',
    },
  },
  'BNSS:223': {
    act: 'BNSS',
    fullActName: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
    section: '223',
    officialHeading: 'Examination of complainant in Private Criminal Complaint',
    statutorySummary:
      'A Magistrate taking cognizance of an offence on complaint shall examine upon oath the complainant and the witnesses present. Provided that no cognizance on a complaint against any person shall be taken without giving the accused an opportunity of being heard.',
    effectiveDate: '2024-07-01',
    authoritativeSource: 'Gazette of India, Extraordinary, Part II, Section 1, Act No. 46 of 2023',
    category: 'procedural',
    statutoryPrerequisites: [
      'Written complaint detailing facts constituting cognizable or non-cognizable offence',
      'Complainant deposition on oath before Magistrate',
      'Accused opportunity of hearing prior to taking cognizance',
    ],
    repealsLegacy: {
      act: 'CrPC',
      section: '200',
      notes: 'Replaces Section 200 CrPC with new proviso requiring notice to accused before cognizance.',
    },
  },
  'BNSS:480': {
    act: 'BNSS',
    fullActName: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
    section: '480',
    officialHeading: 'When bail may be taken in case of non-bailable offence (Magistrate Bail)',
    statutorySummary:
      'When any person accused of, or suspected of, the commission of any non-bailable offence is arrested or detained without warrant by an officer in charge of a police station or appears or is brought before a Court other than the High Court or Court of Session, he may be released on bail.',
    effectiveDate: '2024-07-01',
    authoritativeSource: 'Gazette of India, Extraordinary, Part II, Section 1, Act No. 46 of 2023',
    category: 'procedural',
    statutoryPrerequisites: [
      'Person is arrested, detained, in custody, or appearing before the court',
      'Case relates to a non-bailable offence',
      'Undertaking to comply with conditions of bail and furnish sureties',
    ],
    repealsLegacy: {
      act: 'CrPC',
      section: '437',
      notes: 'Direct correspondence to Section 437 CrPC with expanded first-time offender considerations.',
    },
  },
  'BNSS:482': {
    act: 'BNSS',
    fullActName: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
    section: '482',
    officialHeading: 'Direction for grant of bail to person apprehending arrest (Anticipatory Bail)',
    statutorySummary:
      'Where any person has reason to believe that he may be arrested on accusation of having committed a non-bailable offence, he may apply to the High Court or the Court of Session for a direction under this section that in the event of such arrest, he shall be released on bail.',
    effectiveDate: '2024-07-01',
    authoritativeSource: 'Gazette of India, Extraordinary, Part II, Section 1, Act No. 46 of 2023',
    category: 'procedural',
    statutoryPrerequisites: [
      'Applicant is NOT yet arrested and is not in police or judicial custody',
      'Reasonable, tangible apprehension of arrest on accusation of non-bailable offence',
      'Undertaking to make himself available for interrogation by police officer under Section 482(2) BNSS',
      'Undertaking not to induce, threaten, or tamper with witnesses or evidence',
    ],
    repealsLegacy: {
      act: 'CrPC',
      section: '438',
      notes: 'Direct correspondence to Section 438 CrPC.',
    },
  },
  'BNSS:483': {
    act: 'BNSS',
    fullActName: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
    section: '483',
    officialHeading: 'Special powers of High Court or Court of Session regarding bail (Regular Bail)',
    statutorySummary:
      'A High Court or Court of Session may direct that any person accused of an offence and in custody be released on bail, and if the offence is of the nature specified in sub-section (3) of section 480, may impose any condition.',
    effectiveDate: '2024-07-01',
    authoritativeSource: 'Gazette of India, Extraordinary, Part II, Section 1, Act No. 46 of 2023',
    category: 'procedural',
    statutoryPrerequisites: [
      'Applicant MUST be in actual custody (judicial or police custody)',
      'Chargesheet status / stage of investigation stated',
      'Grounds showing custody no longer required for interrogation',
    ],
    repealsLegacy: {
      act: 'CrPC',
      section: '439',
      notes: 'Direct correspondence to Section 439 CrPC.',
    },
  },
  'BNSS:531': {
    act: 'BNSS',
    fullActName: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
    section: '531',
    officialHeading: 'Repeal and savings',
    statutorySummary:
      'Repeals the Code of Criminal Procedure, 1973. Saves all pending investigations, trials, appeals, applications, or proceedings initiated prior to 1 July 2024, which continue under CrPC 1973.',
    effectiveDate: '2024-07-01',
    authoritativeSource: 'Gazette of India, Extraordinary, Part II, Section 1, Act No. 46 of 2023',
    category: 'procedural',
  },

  // BNS — Substantive Criminal Offences
  'BNS:303(2)': {
    act: 'BNS',
    fullActName: 'Bharatiya Nyaya Sanhita, 2023',
    section: '303(2)',
    officialHeading: 'Theft',
    statutorySummary:
      'Whoever commits theft shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both. For second/subsequent convictions or community service provisions, subsections apply.',
    effectiveDate: '2024-07-01',
    authoritativeSource: 'Gazette of India, Extraordinary, Part II, Section 1, Act No. 45 of 2023',
    category: 'substantive',
    isCognizable: true,
    isBailable: false,
    cognizabilityNote: 'Cognizable, Non-bailable, triable by any Magistrate.',
    repealsLegacy: {
      act: 'IPC',
      section: '379',
      notes: 'Replaces Section 379 IPC. Note: community service introduced for small theft below Rs 5,000 on first conviction.',
    },
  },
  'BNS:305': {
    act: 'BNS',
    fullActName: 'Bharatiya Nyaya Sanhita, 2023',
    section: '305',
    officialHeading: 'Theft in dwelling house, or means of transportation or place of worship, etc.',
    statutorySummary:
      'Punishment for theft in any building, tent, or vessel used as a human dwelling, or place of worship, or used for the custody of property. Imprisonment up to seven years and fine.',
    effectiveDate: '2024-07-01',
    authoritativeSource: 'Gazette of India, Extraordinary, Part II, Section 1, Act No. 45 of 2023',
    category: 'substantive',
    isCognizable: true,
    isBailable: false,
    repealsLegacy: {
      act: 'IPC',
      section: '380',
      notes: 'Replaces Section 380 IPC.',
    },
  },
  'BNS:316': {
    act: 'BNS',
    fullActName: 'Bharatiya Nyaya Sanhita, 2023',
    section: '316',
    officialHeading: 'Criminal breach of trust',
    statutorySummary:
      'Dishonest misappropriation or conversion of property entrusted to a person. Punishable with imprisonment up to five years, or fine, or both.',
    effectiveDate: '2024-07-01',
    authoritativeSource: 'Gazette of India, Extraordinary, Part II, Section 1, Act No. 45 of 2023',
    category: 'substantive',
    isCognizable: true,
    isBailable: false,
    repealsLegacy: {
      act: 'IPC',
      section: '406',
      notes: 'Replaces Section 406 IPC.',
    },
  },
  'BNS:318(4)': {
    act: 'BNS',
    fullActName: 'Bharatiya Nyaya Sanhita, 2023',
    section: '318(4)',
    officialHeading: 'Cheating and dishonestly inducing delivery of property',
    statutorySummary:
      'Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, shall be punished with imprisonment up to seven years and fine.',
    effectiveDate: '2024-07-01',
    authoritativeSource: 'Gazette of India, Extraordinary, Part II, Section 1, Act No. 45 of 2023',
    category: 'substantive',
    isCognizable: true,
    isBailable: false,
    repealsLegacy: {
      act: 'IPC',
      section: '420',
      notes: 'Replaces Section 420 IPC.',
    },
  },
  'BNS:115': {
    act: 'BNS',
    fullActName: 'Bharatiya Nyaya Sanhita, 2023',
    section: '115',
    officialHeading: 'Voluntarily causing hurt',
    statutorySummary:
      'Whoever causes bodily pain, disease or infirmity to any person is said to cause hurt. Punishable under 115(2) with imprisonment up to one year, or fine up to ten thousand rupees, or both.',
    effectiveDate: '2024-07-01',
    authoritativeSource: 'Gazette of India, Extraordinary, Part II, Section 1, Act No. 45 of 2023',
    category: 'substantive',
    isCognizable: false,
    isBailable: true,
    cognizabilityNote: 'Non-cognizable offence. Requires Magistrate direction for police investigation.',
    repealsLegacy: {
      act: 'IPC',
      section: '323',
      notes: 'Replaces Section 323 IPC.',
    },
  },
  'BNS:117': {
    act: 'BNS',
    fullActName: 'Bharatiya Nyaya Sanhita, 2023',
    section: '117',
    officialHeading: 'Voluntarily causing grievous hurt',
    statutorySummary:
      'Grievous hurt (emasculation, permanent privation of sight/hearing, fracture, severe danger to life for 15 days). Punishable under 117(2) with imprisonment up to seven years and fine.',
    effectiveDate: '2024-07-01',
    authoritativeSource: 'Gazette of India, Extraordinary, Part II, Section 1, Act No. 45 of 2023',
    category: 'substantive',
    isCognizable: true,
    isBailable: false,
    repealsLegacy: {
      act: 'IPC',
      section: '325',
      notes: 'Replaces Section 325 IPC.',
    },
  },
  'BNS:336': {
    act: 'BNS',
    fullActName: 'Bharatiya Nyaya Sanhita, 2023',
    section: '336',
    officialHeading: 'Forgery',
    statutorySummary:
      'Making false documents or electronic records with intent to cause damage or injury to the public or any person. Punishable under 336(2) with imprisonment up to two years, or fine, or both.',
    effectiveDate: '2024-07-01',
    authoritativeSource: 'Gazette of India, Extraordinary, Part II, Section 1, Act No. 45 of 2023',
    category: 'substantive',
    isCognizable: false,
    isBailable: true,
    repealsLegacy: {
      act: 'IPC',
      section: '465',
      notes: 'Replaces Section 465 IPC.',
    },
  },
  'BNS:338': {
    act: 'BNS',
    fullActName: 'Bharatiya Nyaya Sanhita, 2023',
    section: '338',
    officialHeading: 'Forgery for purpose of cheating',
    statutorySummary:
      'Whoever commits forgery, intending that the document or electronic record forged shall be used for cheating, shall be punished with imprisonment up to seven years and fine.',
    effectiveDate: '2024-07-01',
    authoritativeSource: 'Gazette of India, Extraordinary, Part II, Section 1, Act No. 45 of 2023',
    category: 'substantive',
    isCognizable: true,
    isBailable: false,
    repealsLegacy: {
      act: 'IPC',
      section: '468',
      notes: 'Replaces Section 468 IPC.',
    },
  },
  'BNS:340': {
    act: 'BNS',
    fullActName: 'Bharatiya Nyaya Sanhita, 2023',
    section: '340',
    officialHeading: 'Using as genuine a forged document or electronic record',
    statutorySummary:
      'Whoever fraudulently or dishonestly uses as genuine any document or electronic record which he knows or has reason to believe to be a forged document.',
    effectiveDate: '2024-07-01',
    authoritativeSource: 'Gazette of India, Extraordinary, Part II, Section 1, Act No. 45 of 2023',
    category: 'substantive',
    isCognizable: true,
    isBailable: false,
    repealsLegacy: {
      act: 'IPC',
      section: '471',
      notes: 'Replaces Section 471 IPC.',
    },
  },
  'BNS:351': {
    act: 'BNS',
    fullActName: 'Bharatiya Nyaya Sanhita, 2023',
    section: '351',
    officialHeading: 'Criminal intimidation',
    statutorySummary:
      'Whoever threatens another with injury to person, reputation or property. Punishable under 351(2) with imprisonment up to two years, or fine, or both. Sub-section (3) applies if threat is to cause death or grievous hurt (up to 7 years).',
    effectiveDate: '2024-07-01',
    authoritativeSource: 'Gazette of India, Extraordinary, Part II, Section 1, Act No. 45 of 2023',
    category: 'substantive',
    isCognizable: false,
    isBailable: true,
    cognizabilityNote: 'Simple criminal intimidation is non-cognizable; threat to cause death/grievous hurt is cognizable and non-bailable.',
    repealsLegacy: {
      act: 'IPC',
      section: '506',
      notes: 'Replaces Section 506 IPC.',
    },
  },
  'BNS:352': {
    act: 'BNS',
    fullActName: 'Bharatiya Nyaya Sanhita, 2023',
    section: '352',
    officialHeading: 'Intentional insult with intent to provoke breach of peace',
    statutorySummary:
      'Whoever intentionally insults, and thereby gives provocation to any person, intending or knowing it to be likely that such provocation will cause him to break the public peace.',
    effectiveDate: '2024-07-01',
    authoritativeSource: 'Gazette of India, Extraordinary, Part II, Section 1, Act No. 45 of 2023',
    category: 'substantive',
    isCognizable: false,
    isBailable: true,
    cognizabilityNote: 'Non-cognizable offence.',
    repealsLegacy: {
      act: 'IPC',
      section: '504',
      notes: 'Replaces Section 504 IPC.',
    },
  },
  'BNS:61': {
    act: 'BNS',
    fullActName: 'Bharatiya Nyaya Sanhita, 2023',
    section: '61',
    officialHeading: 'Criminal conspiracy',
    statutorySummary:
      'When two or more persons agree to do, or cause to be done, an illegal act, or an act which is not illegal by illegal means.',
    effectiveDate: '2024-07-01',
    authoritativeSource: 'Gazette of India, Extraordinary, Part II, Section 1, Act No. 45 of 2023',
    category: 'substantive',
    repealsLegacy: {
      act: 'IPC',
      section: '120B',
      notes: 'Replaces Section 120B IPC.',
    },
  },
  'BNS:103': {
    act: 'BNS',
    fullActName: 'Bharatiya Nyaya Sanhita, 2023',
    section: '103',
    officialHeading: 'Murder',
    statutorySummary:
      'Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine. Sub-section (2) provides punishment for murder by a group on grounds of race, caste, community, etc.',
    effectiveDate: '2024-07-01',
    authoritativeSource: 'Gazette of India, Extraordinary, Part II, Section 1, Act No. 45 of 2023',
    category: 'substantive',
    isCognizable: true,
    isBailable: false,
    repealsLegacy: {
      act: 'IPC',
      section: '302',
      notes: 'Replaces Section 302 IPC. Sub-section (2) adds specific mob lynching provision.',
    },
  },

  // BSA — Bharatiya Sakshya Adhiniyam, 2023 (Evidence)
  'BSA:61': {
    act: 'BSA',
    fullActName: 'Bharatiya Sakshya Adhiniyam, 2023',
    section: '61',
    officialHeading: 'Electronic record admissibility and certificate requirement',
    statutorySummary:
      'Electronic records are treated as documents. Requires certification signed by a person in official charge of the relevant device or management of the activities, specifying device particulars and lawful custody.',
    effectiveDate: '2024-07-01',
    authoritativeSource: 'Gazette of India, Extraordinary, Part II, Section 1, Act No. 47 of 2023',
    category: 'evidence',
    repealsLegacy: {
      act: 'IEA',
      section: '65B',
      notes: 'Replaces Section 65B of Indian Evidence Act, 1872.',
    },
  },

  // NI Act — Commercial / Cheque Bounce
  'NI Act:138': {
    act: 'NI Act',
    fullActName: 'Negotiable Instruments Act, 1881',
    section: '138',
    officialHeading: 'Dishonour of cheque for insufficiency, etc., of funds in the account',
    statutorySummary:
      'Where any cheque drawn by a person on an account maintained by him with a banker for payment of any amount is returned unpaid. Requires statutory demand notice within 30 days of memo and 15 days cure period before filing complaint.',
    effectiveDate: '1882-03-01',
    authoritativeSource: 'Negotiable Instruments Act, 1881 as amended',
    category: 'substantive',
    isCognizable: false,
    isBailable: true,
    statutoryPrerequisites: [
      'Cheque presented within validity period (3 months)',
      'Cheque returned unpaid with bank memo',
      'Statutory demand notice issued in writing within 30 days of receipt of bank memo',
      'Drawer fails to make payment within 15 days of receipt of demand notice',
      'Complaint filed within 1 month after expiry of 15-day notice period before competent Magistrate',
    ],
  },
};

// ────────────────────────────────────────────────────────────
// 2. COMPREHENSIVE LEGACY MAPPING (IPC/CrPC/IEA -> BNS/BNSS/BSA)
// ────────────────────────────────────────────────────────────
export const LEGACY_MAPPINGS: LegacyMapping[] = [
  // CrPC -> BNSS
  {
    legacyAct: 'CrPC',
    legacySection: '154',
    legacyHeading: 'Information in cognizable cases',
    currentAct: 'BNSS',
    currentSection: '173',
    currentHeading: 'Information in cognizable cases',
    transitionRule:
      'Procedural matters filed on or after 1 July 2024 must cite Section 173 BNSS. Proceedings initiated before 1 July 2024 continue under CrPC per Section 531 BNSS.',
    notes: 'Subsumes Section 154 CrPC and introduces e-FIR provisions.',
  },
  {
    legacyAct: 'CrPC',
    legacySection: '154(3)',
    legacyHeading: 'Representation to Superintendent of Police',
    currentAct: 'BNSS',
    currentSection: '173(4)',
    currentHeading: 'Representation to Superintendent of Police upon SHO refusal',
    transitionRule:
      'Any escalation to the SP on or after 1 July 2024 is governed by Section 173(4) BNSS.',
    notes: 'Mandatory prerequisite before moving Magistrate under Section 175(3) BNSS.',
  },
  {
    legacyAct: 'CrPC',
    legacySection: '156(3)',
    legacyHeading: 'Magistrate ordering police investigation',
    currentAct: 'BNSS',
    currentSection: '175(3)',
    currentHeading: 'Magistrate directing investigation in cognizable offence',
    transitionRule:
      'Applications filed before a Magistrate on or after 1 July 2024 must strictly cite Section 175(3) BNSS and comply with the mandatory affidavit and prior SP approach prerequisites.',
    notes: 'Strict statutory codification of Priyanka Srivastava affidavit requirements.',
  },
  {
    legacyAct: 'CrPC',
    legacySection: '200',
    legacyHeading: 'Examination of complainant',
    currentAct: 'BNSS',
    currentSection: '223',
    currentHeading: 'Examination of complainant in Private Criminal Complaint',
    transitionRule:
      'Private complaints filed on or after 1 July 2024 follow Section 223 BNSS. Accused is given pre-cognizance hearing.',
    notes: 'Requires prior notice/hearing to accused before taking cognizance.',
  },
  {
    legacyAct: 'CrPC',
    legacySection: '437',
    legacyHeading: 'When bail may be taken in non-bailable case',
    currentAct: 'BNSS',
    currentSection: '480',
    currentHeading: 'When bail may be taken in case of non-bailable offence (Magistrate Bail)',
    transitionRule:
      'Bail applications filed before a Magistrate on or after 1 July 2024 must cite Section 480 BNSS.',
    notes: 'Replaces Section 437 CrPC.',
  },
  {
    legacyAct: 'CrPC',
    legacySection: '438',
    legacyHeading: 'Direction for grant of bail to person apprehending arrest',
    currentAct: 'BNSS',
    currentSection: '482',
    currentHeading: 'Direction for grant of bail to person apprehending arrest (Anticipatory Bail)',
    transitionRule:
      'Anticipatory bail applications filed before Sessions Court or High Court on or after 1 July 2024 must cite Section 482 BNSS.',
    notes: 'Replaces Section 438 CrPC.',
  },
  {
    legacyAct: 'CrPC',
    legacySection: '439',
    legacyHeading: 'Special powers of High Court or Court of Session regarding bail',
    currentAct: 'BNSS',
    currentSection: '483',
    currentHeading: 'Special powers of High Court or Court of Session regarding bail (Regular Bail)',
    transitionRule:
      'Regular bail applications filed before Sessions Court or High Court on or after 1 July 2024 must cite Section 483 BNSS.',
    notes: 'Replaces Section 439 CrPC.',
  },

  // IPC -> BNS
  {
    legacyAct: 'IPC',
    legacySection: '379',
    legacyHeading: 'Punishment for theft',
    currentAct: 'BNS',
    currentSection: '303(2)',
    currentHeading: 'Theft',
    transitionRule:
      'For offences committed on or after 1 July 2024, charge Section 303(2) BNS. If offence occurred before 1 July 2024, substantive charge remains Section 379 IPC per Article 20(1) Constitution and Section 531 BNSS.',
    notes: 'Replaces Section 379 IPC.',
  },
  {
    legacyAct: 'IPC',
    legacySection: '380',
    legacyHeading: 'Theft in dwelling house, etc.',
    currentAct: 'BNS',
    currentSection: '305',
    currentHeading: 'Theft in dwelling house, place of worship, etc.',
    transitionRule:
      'Offences committed on/after 1 July 2024: cite Section 305 BNS. Prior offences: cite Section 380 IPC.',
    notes: 'Replaces Section 380 IPC.',
  },
  {
    legacyAct: 'IPC',
    legacySection: '406',
    legacyHeading: 'Punishment for criminal breach of trust',
    currentAct: 'BNS',
    currentSection: '316',
    currentHeading: 'Criminal breach of trust',
    transitionRule:
      'Offences committed on/after 1 July 2024: cite Section 316 BNS. Prior offences: cite Section 406 IPC.',
    notes: 'Replaces Section 406 IPC.',
  },
  {
    legacyAct: 'IPC',
    legacySection: '420',
    legacyHeading: 'Cheating and dishonestly inducing delivery of property',
    currentAct: 'BNS',
    currentSection: '318(4)',
    currentHeading: 'Cheating and dishonestly inducing delivery of property',
    transitionRule:
      'Offences committed on/after 1 July 2024: cite Section 318(4) BNS. Prior offences: cite Section 420 IPC.',
    notes: 'Replaces Section 420 IPC.',
  },
  {
    legacyAct: 'IPC',
    legacySection: '323',
    legacyHeading: 'Punishment for voluntarily causing hurt',
    currentAct: 'BNS',
    currentSection: '115(2)',
    currentHeading: 'Voluntarily causing hurt',
    transitionRule:
      'Offences committed on/after 1 July 2024: cite Section 115(2) BNS. Prior offences: cite Section 323 IPC.',
    notes: 'Replaces Section 323 IPC.',
  },
  {
    legacyAct: 'IPC',
    legacySection: '325',
    legacyHeading: 'Punishment for voluntarily causing grievous hurt',
    currentAct: 'BNS',
    currentSection: '117(2)',
    currentHeading: 'Voluntarily causing grievous hurt',
    transitionRule:
      'Offences committed on/after 1 July 2024: cite Section 117(2) BNS. Prior offences: cite Section 325 IPC.',
    notes: 'Replaces Section 325 IPC.',
  },
  {
    legacyAct: 'IPC',
    legacySection: '465',
    legacyHeading: 'Punishment for forgery',
    currentAct: 'BNS',
    currentSection: '336(2)',
    currentHeading: 'Forgery',
    transitionRule:
      'Offences committed on/after 1 July 2024: cite Section 336(2) BNS. Prior offences: cite Section 465 IPC.',
    notes: 'Replaces Section 465 IPC.',
  },
  {
    legacyAct: 'IPC',
    legacySection: '468',
    legacyHeading: 'Forgery for purpose of cheating',
    currentAct: 'BNS',
    currentSection: '338',
    currentHeading: 'Forgery for purpose of cheating',
    transitionRule:
      'Offences committed on/after 1 July 2024: cite Section 338 BNS. Prior offences: cite Section 468 IPC.',
    notes: 'Replaces Section 468 IPC.',
  },
  {
    legacyAct: 'IPC',
    legacySection: '471',
    legacyHeading: 'Using as genuine a forged document',
    currentAct: 'BNS',
    currentSection: '340',
    currentHeading: 'Using as genuine a forged document',
    transitionRule:
      'Offences committed on/after 1 July 2024: cite Section 340 BNS. Prior offences: cite Section 471 IPC.',
    notes: 'Replaces Section 471 IPC.',
  },
  {
    legacyAct: 'IPC',
    legacySection: '504',
    legacyHeading: 'Intentional insult to provoke breach of peace',
    currentAct: 'BNS',
    currentSection: '352',
    currentHeading: 'Intentional insult with intent to provoke breach of peace',
    transitionRule:
      'Offences committed on/after 1 July 2024: cite Section 352 BNS. Prior offences: cite Section 504 IPC.',
    notes: 'Replaces Section 504 IPC.',
  },
  {
    legacyAct: 'IPC',
    legacySection: '506',
    legacyHeading: 'Punishment for criminal intimidation',
    currentAct: 'BNS',
    currentSection: '351(2)',
    currentHeading: 'Criminal intimidation',
    transitionRule:
      'Offences committed on/after 1 July 2024: cite Section 351(2) BNS. Prior offences: cite Section 506 IPC.',
    notes: 'Replaces Section 506 IPC.',
  },
  {
    legacyAct: 'IPC',
    legacySection: '302',
    legacyHeading: 'Punishment for murder',
    currentAct: 'BNS',
    currentSection: '103(1)',
    currentHeading: 'Murder',
    transitionRule:
      'Offences committed on/after 1 July 2024: cite Section 103(1) BNS. Prior offences: cite Section 302 IPC.',
    notes: 'Replaces Section 302 IPC.',
  },

  // Evidence -> BSA
  {
    legacyAct: 'IEA',
    legacySection: '65B',
    legacyHeading: 'Admissibility of electronic records',
    currentAct: 'BSA',
    currentSection: '61',
    currentHeading: 'Electronic record admissibility and certificate requirement',
    transitionRule:
      'Evidence produced in proceedings on or after 1 July 2024 is governed by Section 61 BSA.',
    notes: 'Replaces Section 65B Indian Evidence Act, 1872.',
  },
];

// ────────────────────────────────────────────────────────────
// 3. REGISTRY RESOLVER & SEARCH HELPERS
// ────────────────────────────────────────────────────────────

export interface StatuteResolutionResult {
  verified: VerifiedStatute[];
  unverified: string[];
  legacyResolved: {
    legacy: string;
    resolvedTo: VerifiedStatute;
    transitionNote: string;
  }[];
  transitionalGuidance?: string;
}

/**
 * Resolves a given act and section against the verified registry.
 */
export function lookupStatute(act: string, section: string): VerifiedStatute | null {
  const normalizedAct = act.trim().toUpperCase();
  const cleanSection = section.trim().replace(/^Sec(tion)?\.?\s*/i, '');

  // Direct key lookup
  const directKey = `${normalizedAct}:${cleanSection}`;
  if (VERIFIED_REGISTRY[directKey]) {
    return VERIFIED_REGISTRY[directKey];
  }

  // Base section lookup (e.g. "303" if "303(2)")
  const baseSection = cleanSection.split('(')[0];
  const baseKey = `${normalizedAct}:${baseSection}`;
  if (VERIFIED_REGISTRY[baseKey]) {
    return VERIFIED_REGISTRY[baseKey];
  }

  return null;
}

/**
 * Resolves legacy provisions (IPC, CrPC, Evidence Act) into current BNS, BNSS, BSA counterparts.
 */
export function resolveLegacyProvision(
  legacyAct: 'IPC' | 'CrPC' | 'IEA',
  legacySection: string,
  incidentDate?: string
): { current: VerifiedStatute | null; mapping: LegacyMapping | null; transitionNote: string } {
  const cleanSec = legacySection.trim().replace(/^Sec(tion)?\.?\s*/i, '');
  const match = LEGACY_MAPPINGS.find(
    (m) =>
      m.legacyAct === legacyAct &&
      (m.legacySection === cleanSec || m.legacySection === cleanSec.split('(')[0])
  );

  if (!match) {
    return {
      current: null,
      mapping: null,
      transitionNote: `Legacy section ${legacyAct} ${legacySection} has no automatic 1-to-1 mapping. Legal verification required.`,
    };
  }

  const currentStatute = lookupStatute(match.currentAct, match.currentSection);

  // Transition date check: 1 July 2024
  let transitionNote = match.transitionRule;
  if (incidentDate) {
    const isPreJuly2024 = new Date(incidentDate) < new Date('2024-07-01');
    if (isPreJuly2024 && match.legacyAct === 'IPC') {
      transitionNote = `Incident occurred on ${incidentDate} (prior to 1 July 2024). Under Article 20(1) of the Constitution of India and Section 531 of BNSS, substantive penal provisions of the Indian Penal Code (${legacyAct} Section ${legacySection}) apply to this offence. However, all procedural steps filed now follow the BNSS, 2023.`;
    }
  }

  return {
    current: currentStatute,
    mapping: match,
    transitionNote,
  };
}

/**
 * Searches the registry for statutes matching keywords (e.g. "theft", "bail", "cheating", "police").
 */
export function searchStatutesByKeyword(query: string): VerifiedStatute[] {
  const q = query.toLowerCase();
  return Object.values(VERIFIED_REGISTRY).filter(
    (s) =>
      s.officialHeading.toLowerCase().includes(q) ||
      s.statutorySummary.toLowerCase().includes(q) ||
      s.section.toLowerCase().includes(q)
  );
}
