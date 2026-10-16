import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Building,
  User,
  Calendar,
  MapPin,
  FileText,
  Send,
  Gavel,
  Scale,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { DocumentType } from './DocumentTypeSelector';
import { classifyLegalIntent } from '../legal/classification/intentClassifier';
import { DOCUMENT_TEMPLATES } from '../legal/templates/documentTemplates';

interface LegalFactsFormProps {
  documentType: DocumentType;
  onGenerate: (facts: string) => void;
  onBack: () => void;
  isGenerating?: boolean;
}

export const DOCUMENT_TITLES: Record<DocumentType, string> = {
  'police-complaint': 'Complaint to Police (Station House Officer)',
  'sp-representation': 'Representation to Superintendent of Police (S. 173(4) BNSS)',
  'bnss-175-3-application': 'Application under Section 175(3) BNSS before Magistrate',
  'bail-petition': 'Application for Regular Bail (BNSS)',
  'anticipatory-bail': 'Application for Anticipatory Bail (S. 482 BNSS)',
  'magistrate-complaint': 'Private Criminal Complaint (S. 223 BNSS)',
  'legal-notice': 'Statutory / Legal Demand Notice',
  'writ-petition': 'Writ Petition (Article 226 / 32)',
  'civil-pleading': 'Civil Plaint / Pleading',
  'counter-affidavit': 'Counter / Reply Affidavit',
  'written-statement': 'Defendant Written Statement',
  'affidavit': 'Sworn Affidavit',
  'general-legal-advice': 'General Legal Advice & Opinion',
  'fir-complaint': 'Complaint to Police (SHO)',
  'criminal-complaint': 'Private Criminal Complaint (S. 223 BNSS)',
};

export const PLACEHOLDERS: Record<DocumentType, string> = {
  'police-complaint': `State the chronological facts of the incident:
- Date, exact time, and location of the incident
- Sequence of events in numbered or chronological paragraphs
- Accused persons details (or state: "Unknown accused persons")
- Description of stolen articles, injuries, or monetary loss
- Witnesses present and available evidence (e.g. CCTV, receipts)
- Explicit relief: Requesting registration of FIR under Section 173 BNSS

Example:
On 12th August 2025, at around 4:30 PM, at Shop No. 12, Commercial Complex, Sector 18, Noida, two unknown individuals entered the shop and dishonestly took away a black leather bag containing a laptop (Dell XPS, Serial #12345) and Rs. 50,000 cash...`,

  'sp-representation': `Provide the details of earlier complaint and police inaction:
- Date when written complaint was submitted to the Station House Officer
- Name of the Police Station and Diary / GD / Acknowledgment Number
- Specific refusal or total inaction by the police station
- Gravity of the ongoing offence and threats from the accused
- Request for SP intervention under Section 173(4) of BNSS, 2023

Example:
On 5th August 2025, the applicant submitted a written complaint to the SHO, Police Station Sector 18, Noida (GD Entry #45/2025) reporting theft of property worth Rs. 1,00,000. Despite repeated visits, the SHO has refused to register an FIR...`,

  'bnss-175-3-application': `Provide facts demonstrating compliance with statutory prerequisites under BNSS:
- Date of written complaint to SHO under Section 173(1) BNSS
- Date of representation sent by post to the Superintendent of Police under Section 173(4) BNSS along with postal tracking receipt
- Failure of both SHO and SP to investigate
- Detailed facts of the cognizable offence
- Confirmation that supporting affidavit on oath is attached per Section 175(3) proviso

Example:
Applicant lodged complaint with SHO on 1st July 2025. Upon inaction, sent representation to SP Noida by registered post on 15th July 2025 (Postal Receipt #RD987654321IN). No FIR registered. Applicant approaches this Hon'ble Court with supporting affidavit on oath...`,

  'bail-petition': `Provide the case and custody particulars:
- FIR Number, Year, and Police Station
- Offence sections under Bharatiya Nyaya Sanhita, 2023 (or special acts)
- Date of arrest and current custody (e.g. Judicial Custody at Tihar Jail)
- Grounds for regular bail (false implication, investigation complete, clean antecedents, deep roots in society)
- Solvent sureties details

Example:
Applicant arrested on 10th August 2025 in FIR No. 240/2025 at P.S. Connaught Place under Section 303(2) BNS. Currently in judicial custody. Applicant is a first-time offender, recovery has been effected, investigation is complete, and applicant is ready to furnish solvent local sureties...`,

  'anticipatory-bail': `Provide details of the apprehension of arrest:
- Specific grounds of apprehension (police visits, threats, summons, co-accused arrest)
- FIR Number (if registered) or Police Station where complaint is apprehended
- Apprehended sections under Bharatiya Nyaya Sanhita, 2023
- Factual background showing false implication / civil dispute given criminal color
- Express undertaking under Section 482(2) BNSS to join interrogation whenever required

Example:
Applicant is a reputed businessman. A commercial dispute arose with complainant regarding supply agreement dated 10th January 2025. Police from P.S. Hauz Khas visited applicant's residence on 12th August 2025 threatening arrest in a fabricated cheating complaint...`,

  'magistrate-complaint': `Detail the criminal complaint under Section 223 BNSS:
- Full particulars of Complainant and Accused persons
- Chronology of events disclosing commission of offences
- Specific sections of Bharatiya Nyaya Sanhita, 2023
- List of witnesses and documents to be examined under Section 223 BNSS
- Prayer seeking summoning and trial of the accused

Example:
Complainant and accused entered into an agreement on 5th February 2025. Accused induced complainant to part with Rs. 10,00,000 on false pretext of delivering property, committing offences under Section 318(4) and Section 316 BNS...`,

  'legal-notice': `Provide the notice particulars:
- Advocate name, enrollment number, and chambers
- Client's name and residential/business details
- Opposite party's full name, designation, and address
- Transaction/dispute history (dates, invoice numbers, cheque numbers)
- Specific breach and amount/relief demanded
- 15-day cure notice period before legal action

Example:
Notice on behalf of client M/s Alpha Enterprises against M/s Beta Corp for recovery of Rs. 4,50,000 against unpaid Invoice #INV-2025-89 dated 15th March 2025, giving 15 days to pay failing which civil and criminal proceedings will follow...`,

  'writ-petition': `Describe the fundamental right violation and state action:
- Fundamental right infringed (Article 14, 19, 21, etc.)
- Respondent state authority / instrumentality of State
- Impugned administrative or police order / arbitrary action
- Lack of efficacious alternate statutory remedy
- Specific writ prayed for (Mandamus, Certiorari, Habeas Corpus)

Example:
Petitioner's commercial premises sealed by municipal authorities without issuing prior show-cause notice, in gross violation of natural justice and Article 14 and Article 21 of the Constitution...`,

  'civil-pleading': `Describe the civil dispute and cause of action:
- Parties to the suit and territorial/pecuniary jurisdiction
- Facts giving rise to cause of action and date when it arose
- Relief claimed (specific performance, declaration, injunction, damages)
- Valuation of the suit for court fees and jurisdiction`,

  'counter-affidavit': `State response to the petition / application:
- Reference to the petition number and paragraphs being responded to
- Specific admissions and parawise denials
- Preliminary legal objections (maintainability, limitation, suppression of material facts)
- Verification clause`,

  'written-statement': `State defense to the civil suit:
- Parawise specific denials and admissions
- Preliminary objections (res judicata, lack of cause of action)
- Affirmative defense and counterclaims`,

  'affidavit': `State the facts deposed on solemn affirmation:
- Deponent's full name, age, and permanent address
- Numbered factual averments
- Verification clause specifying personal knowledge vs information`,

  'general-legal-advice': `Outline the legal query or scenario for legal counsel:
- Background facts and parties involved
- Key dispute, query, or transaction
- Specific questions of law or strategy
- Relevant statutes, agreements, or jurisdiction
- Desired legal outcome or risk assessment`,

  'fir-complaint': `State the chronological facts of the incident for the police complaint to the Station House Officer...`,
  'criminal-complaint': `Detail the criminal complaint under Section 223 BNSS...`,
};

export function LegalFactsForm({
  documentType,
  onGenerate,
  onBack,
  isGenerating,
}: LegalFactsFormProps) {
  const [activeTab, setActiveTab] = useState<'structured' | 'narrative'>('structured');

  // Common Structured Fields
  const [complainantName, setComplainantName] = useState('');
  const [complainantAddress, setComplainantAddress] = useState('');
  const [complainantContact, setComplainantContact] = useState('');

  const [accusedName, setAccusedName] = useState('');
  const [accusedDetails, setAccusedDetails] = useState('');

  const [incidentDate, setIncidentDate] = useState('');
  const [incidentTime, setIncidentTime] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [policeStation, setPoliceStation] = useState('');
  const [district, setDistrict] = useState('');

  // Escalation / Prerequisite Specific Fields
  const [priorShoDate, setPriorShoDate] = useState('');
  const [priorShoAck, setPriorShoAck] = useState('');
  const [policeInactionDetails, setPoliceInactionDetails] = useState('');

  const [priorSpDate, setPriorSpDate] = useState('');
  const [spPostalReceipt, setSpPostalReceipt] = useState('');
  const [hasAffidavitSworn, setHasAffidavitSworn] = useState(true);

  // Bail Specific Fields
  const [firNumber, setFirNumber] = useState('');
  const [arrestDate, setArrestDate] = useState('');
  const [custodyLocation, setCustodyLocation] = useState('');
  const [chargedSections, setChargedSections] = useState('');
  const [apprehensionGrounds, setApprehensionGrounds] = useState('');
  const [undertakingInterrogation, setUndertakingInterrogation] = useState(true);

  // Notice Specific Fields
  const [claimAmount, setClaimAmount] = useState('');
  const [noticeDeadline, setNoticeDeadline] = useState('15 days');

  // Narrative / Core Facts
  const [narrativeFacts, setNarrativeFacts] = useState('');
  const [witnessesEvidence, setWitnessesEvidence] = useState('');
  const [reliefSought, setReliefSought] = useState('');

  // Real-time classification & prerequisite feedback
  const [preCheck, setPreCheck] = useState<any>(null);

  useEffect(() => {
    // Run live classification check
    const check = classifyLegalIntent({
      incidentDescription: narrativeFacts || 'Initial intake',
      hasApproachedPolice: Boolean(priorShoDate || priorShoAck),
      hasApproachedSP: Boolean(priorSpDate || spPostalReceipt),
      hasSupportingAffidavit: hasAffidavitSworn,
      isApplicantArrestedOrInCustody: Boolean(arrestDate || custodyLocation),
      existingFirNo: firNumber,
      incidentDate,
    });
    setPreCheck(check);
  }, [
    narrativeFacts,
    priorShoDate,
    priorShoAck,
    priorSpDate,
    spPostalReceipt,
    hasAffidavitSworn,
    arrestDate,
    custodyLocation,
    firNumber,
    incidentDate,
  ]);

  const compileFullFacts = (): string => {
    if (activeTab === 'narrative' && narrativeFacts.trim().length > 30) {
      return narrativeFacts.trim();
    }

    const sections: string[] = [];

    // 1. Parties
    sections.push(`PARTIES INVOLVED:
- Complainant / Applicant: ${complainantName.trim() || '[NAME OF COMPLAINANT]'}
- Address: ${complainantAddress.trim() || '[RESIDENTIAL ADDRESS]'}
- Contact: ${complainantContact.trim() || '[PHONE NUMBER]'}
- Accused / Opposite Party: ${accusedName.trim() || '[NAME OF ACCUSED / UNKNOWN ACCUSED PERSONS]'}
- Accused Details: ${accusedDetails.trim() || '[DETAILS OF ACCUSED]'}`);

    // 2. Incident & Jurisdiction
    sections.push(`INCIDENT & JURISDICTION:
- Date of Incident: ${incidentDate || '[DATE OF INCIDENT]'}
- Time of Incident: ${incidentTime || '[TIME OF INCIDENT]'}
- Location of Incident: ${incidentLocation.trim() || '[LOCATION OF OCCURRENCE]'}
- Police Station: ${policeStation.trim() || '[POLICE STATION NAME]'}
- District / State: ${district.trim() || '[DISTRICT/STATE]'}`);

    // 3. Conditional Procedural Escalation
    if (documentType === 'sp-representation' || documentType === 'bnss-175-3-application') {
      sections.push(`PROCEDURAL HISTORY & POLICE INACTION:
- Prior Written Complaint to SHO submitted on: ${priorShoDate || '[DATE OF SHO COMPLAINT]'}
- Police Station GD / Acknowledgment No: ${priorShoAck || '[GD / ACKNOWLEDGMENT NUMBER]'}
- Details of SHO Refusal / Inaction: ${policeInactionDetails.trim() || 'No FIR registered and no investigative steps taken despite cognizable offence.'}`);
    }

    if (documentType === 'bnss-175-3-application') {
      sections.push(`SUPERINTENDENT OF POLICE ESCALATION & AFFIDAVIT (S. 173(4) BNSS COMPLIANCE):
- Prior Representation sent to SP on: ${priorSpDate || '[DATE OF SP REPRESENTATION]'}
- Speed Post / Postal Tracking Receipt: ${spPostalReceipt || '[POSTAL RECEIPT NUMBER]'}
- Supporting Affidavit Sworn on Oath: ${hasAffidavitSworn ? 'Yes, duly executed and annexed per Section 175(3) BNSS proviso' : 'Pending execution'}`);
    }

    // 4. Bail Particulars
    if (documentType === 'bail-petition') {
      sections.push(`BAIL PARTICULARS & CUSTODY:
- FIR Number and Year: ${firNumber || '[FIR NUMBER/YEAR]'}
- Police Station: ${policeStation || '[POLICE STATION]'}
- Date of Arrest: ${arrestDate || '[DATE OF ARREST]'}
- Custody Location: ${custodyLocation || 'Judicial Custody at [NAME OF JAIL]'}
- Offences Charged: ${chargedSections || '[SECTIONS UNDER BNS]'}
- Ground Summary: False implication, investigation substantially complete, ready to furnish reliable sureties.`);
    }

    if (documentType === 'anticipatory-bail') {
      sections.push(`ANTICIPATORY BAIL PARTICULARS:
- Police Station / Apprehended FIR: ${policeStation || '[POLICE STATION]'}
- Apprehended Offences: ${chargedSections || '[APPREHENDED BNS SECTIONS]'}
- Tangible Grounds of Apprehension: ${apprehensionGrounds.trim() || 'Police visits and threats of custodial torture in a fabricated accusation.'}
- Custody Status: Applicant is NOT in custody and has not been arrested.
- Undertaking under Section 482(2) BNSS: ${undertakingInterrogation ? 'Yes, applicant undertakes to join interrogation whenever summoned.' : 'Undertaking required.'}`);
    }

    // 5. Legal Notice Particulars
    if (documentType === 'legal-notice') {
      sections.push(`LEGAL NOTICE PARTICULARS:
- Total Claim / Demand: ${claimAmount || 'Rs. [AMOUNT]'}
- Notice Cure Period: ${noticeDeadline}
- Legal Basis: Breach of contractual terms / civil liability / Section 138 NI Act.`);
    }

    // 6. Chronological Facts
    sections.push(`FACTUAL NARRATION:
${narrativeFacts.trim() || 'The complainant/applicant respectfully states that the alleged events occurred in the manner described...'}`);

    if (witnessesEvidence.trim()) {
      sections.push(`WITNESSES & EVIDENCE AVAILABLE:
${witnessesEvidence.trim()}`);
    }

    if (reliefSought.trim()) {
      sections.push(`SPECIFIC RELIEF SOUGHT:
${reliefSought.trim()}`);
    }

    return sections.join('\n\n');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const compiled = compileFullFacts();
    if (compiled.trim().length > 10) {
      onGenerate(compiled);
    } else {
      alert('Please provide sufficient factual details to generate a legally sound document.');
    }
  };

  const title = DOCUMENT_TITLES[documentType] || 'Legal Document';

  return (
    <div className="space-y-6">
      {/* Top Header & Back */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--grey-300)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-neutral-200 text-neutral-800 rounded">
              Verified Legal Intake
            </span>
            <span className="text-xs text-[var(--gold-dark)] font-semibold">
              {DOCUMENT_TEMPLATES[documentType]?.title || title}
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)' }} className="text-2xl font-semibold text-[var(--matte-black)]">
            {title}
          </h2>
        </div>

        <button
          onClick={onBack}
          className="text-xs text-[var(--grey-600)] hover:text-black flex items-center gap-1.5 px-3 py-1.5 border border-[var(--grey-300)] rounded bg-white hover:bg-neutral-50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Change Document Type</span>
        </button>
      </div>

      {/* Procedural Banner & Statutory Guidance */}
      {documentType === 'police-complaint' || documentType === 'fir-complaint' ? (
        <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded text-xs text-blue-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Station House Officer (SHO) Complaint Protocol:</p>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              In Indian law, an advocate drafts a <strong>Complaint to the SHO</strong> under Section 173 BNSS requesting the registration of an FIR. Only police officers register an official FIR. This document will NOT use court headings.
            </p>
          </div>
        </div>
      ) : null}

      {documentType === 'bnss-175-3-application' ? (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded text-xs text-amber-950 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Mandatory Statutory Prerequisites under Section 175(3) BNSS:</p>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              Per the proviso to Section 175(3) BNSS and Supreme Court guidelines (Priyanka Srivastava), the applicant <strong>MUST</strong> have already sent a written representation to the Superintendent of Police under Section 173(4) BNSS and <strong>MUST</strong> attach a supporting affidavit sworn on oath.
            </p>
          </div>
        </div>
      ) : null}

      {documentType === 'anticipatory-bail' ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-950 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Pre-Arrest Jurisdiction under Section 482 BNSS:</p>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Anticipatory bail is maintainable only <strong>prior to arrest</strong>. If the applicant has already been arrested, please switch to a Regular Bail Application under Section 483 BNSS.
            </p>
          </div>
        </div>
      ) : null}

      {/* Mode Switch Tabs */}
      <div className="flex border-b border-[var(--grey-300)]">
        <button
          type="button"
          onClick={() => setActiveTab('structured')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'structured'
              ? 'border-[var(--matte-black)] text-[var(--matte-black)]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          Structured Intake Fields (Recommended)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('narrative')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'narrative'
              ? 'border-[var(--matte-black)] text-[var(--matte-black)]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          Free-Form Case Narrative
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === 'structured' ? (
          <div className="space-y-6">
            {/* 1. Parties Section */}
            <div className="p-4 bg-white border border-neutral-200 rounded shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[var(--gold)]" />
                1. Parties Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                    Complainant / Applicant Full Name
                  </label>
                  <input
                    type="text"
                    value={complainantName}
                    onChange={(e) => setComplainantName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-neutral-800 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                    Contact Number / Email
                  </label>
                  <input
                    type="text"
                    value={complainantContact}
                    onChange={(e) => setComplainantContact(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-neutral-800 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                    Complainant Residential / Office Address
                  </label>
                  <input
                    type="text"
                    value={complainantAddress}
                    onChange={(e) => setComplainantAddress(e.target.value)}
                    placeholder="e.g. House No. 45, Sector 15, Rohini, New Delhi - 110085"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-neutral-800 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                    Accused / Opposite Party Name(s)
                  </label>
                  <input
                    type="text"
                    value={accusedName}
                    onChange={(e) => setAccusedName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma OR Unknown Persons"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-neutral-800 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                    Accused Particulars / Known Details
                  </label>
                  <input
                    type="text"
                    value={accusedDetails}
                    onChange={(e) => setAccusedDetails(e.target.value)}
                    placeholder="e.g. Resident of Sector 12, or Vehicle No. DL-01-AB-1234"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-neutral-800 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Incident & Jurisdiction */}
            <div className="p-4 bg-white border border-neutral-200 rounded shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[var(--gold)]" />
                2. Incident Date, Time &amp; Jurisdiction
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                    Date of Incident
                  </label>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-neutral-800 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                    Approximate Time
                  </label>
                  <input
                    type="text"
                    value={incidentTime}
                    onChange={(e) => setIncidentTime(e.target.value)}
                    placeholder="e.g. Around 3:30 PM"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-neutral-800 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                    Place of Occurrence
                  </label>
                  <input
                    type="text"
                    value={incidentLocation}
                    onChange={(e) => setIncidentLocation(e.target.value)}
                    placeholder="e.g. Near Metro Station Gate No. 2, Connaught Place"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-neutral-800 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                    Territorial Police Station
                  </label>
                  <input
                    type="text"
                    value={policeStation}
                    onChange={(e) => setPoliceStation(e.target.value)}
                    placeholder="e.g. Police Station Connaught Place"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-neutral-800 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                    District &amp; State / Court Jurisdiction
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. New Delhi District, New Delhi"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-neutral-800 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Conditional Fields: SP Representation & 175(3) BNSS */}
            {(documentType === 'sp-representation' || documentType === 'bnss-175-3-application') && (
              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-amber-800" />
                  3. Police Station Inaction &amp; Prior Complaint Proof
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-800 block mb-1">
                      Date Written Complaint Submitted to SHO
                    </label>
                    <input
                      type="date"
                      value={priorShoDate}
                      onChange={(e) => setPriorShoDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded bg-white focus:border-neutral-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-neutral-800 block mb-1">
                      Police Station GD / Acknowledgment No.
                    </label>
                    <input
                      type="text"
                      value={priorShoAck}
                      onChange={(e) => setPriorShoAck(e.target.value)}
                      placeholder="e.g. GD Entry No. 34A or Stamp Receipt"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded bg-white focus:border-neutral-800 outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[11px] font-semibold text-neutral-800 block mb-1">
                      Nature of Police Inaction / Refusal
                    </label>
                    <input
                      type="text"
                      value={policeInactionDetails}
                      onChange={(e) => setPoliceInactionDetails(e.target.value)}
                      placeholder="e.g. SHO orally stated it is a civil dispute and refused to lodge FIR"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded bg-white focus:border-neutral-800 outline-none"
                    />
                  </div>
                </div>

                {documentType === 'bnss-175-3-application' && (
                  <div className="pt-3 border-t border-amber-200/80 space-y-3">
                    <span className="text-[11px] font-bold text-amber-900 block">
                      Section 173(4) BNSS Superintendent of Police Verification:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[11px] font-semibold text-neutral-800 block mb-1">
                          Date Representation Sent to SP by Post
                        </label>
                        <input
                          type="date"
                          value={priorSpDate}
                          onChange={(e) => setPriorSpDate(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-neutral-300 rounded bg-white focus:border-neutral-800 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-neutral-800 block mb-1">
                          Registered Speed Post Tracking / Receipt No.
                        </label>
                        <input
                          type="text"
                          value={spPostalReceipt}
                          onChange={(e) => setSpPostalReceipt(e.target.value)}
                          placeholder="e.g. Speed Post #ED123456789IN"
                          className="w-full px-3 py-2 text-xs border border-neutral-300 rounded bg-white focus:border-neutral-800 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="affidavitCheck"
                        checked={hasAffidavitSworn}
                        onChange={(e) => setHasAffidavitSworn(e.target.checked)}
                        className="rounded border-neutral-300 text-neutral-900 focus:ring-0"
                      />
                      <label htmlFor="affidavitCheck" className="text-xs text-neutral-800 font-medium cursor-pointer">
                        Include mandatory Supporting Affidavit on Oath per Section 175(3) BNSS proviso
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. Conditional Fields: Bail Applications */}
            {(documentType === 'bail-petition' || documentType === 'anticipatory-bail') && (
              <div className="p-4 bg-white border border-neutral-200 rounded shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-[var(--gold)]" />
                  {documentType === 'bail-petition' ? 'Custody & Case Particulars' : 'Pre-Arrest Apprehension Particulars'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                      FIR Number &amp; Year
                    </label>
                    <input
                      type="text"
                      value={firNumber}
                      onChange={(e) => setFirNumber(e.target.value)}
                      placeholder="e.g. FIR No. 142/2025"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-neutral-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                      Sections Under BNS / Special Act
                    </label>
                    <input
                      type="text"
                      value={chargedSections}
                      onChange={(e) => setChargedSections(e.target.value)}
                      placeholder="e.g. Sections 303(2), 318(4) BNS"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-neutral-800 outline-none"
                    />
                  </div>

                  {documentType === 'bail-petition' ? (
                    <>
                      <div>
                        <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                          Date of Arrest
                        </label>
                        <input
                          type="date"
                          value={arrestDate}
                          onChange={(e) => setArrestDate(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-neutral-800 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                          Current Jail / Custody Location
                        </label>
                        <input
                          type="text"
                          value={custodyLocation}
                          onChange={(e) => setCustodyLocation(e.target.value)}
                          placeholder="e.g. Central Jail No. 4, Tihar, New Delhi"
                          className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-neutral-800 outline-none"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="md:col-span-2">
                        <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                          Tangible Grounds for Apprehension of Arrest
                        </label>
                        <input
                          type="text"
                          value={apprehensionGrounds}
                          onChange={(e) => setApprehensionGrounds(e.target.value)}
                          placeholder="e.g. Police visited residence on 14th Aug; co-accused arrested"
                          className="w-full px-3 py-2 text-xs border border-neutral-300 rounded focus:border-neutral-800 outline-none"
                        />
                      </div>

                      <div className="md:col-span-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="undertakeInterrogation"
                          checked={undertakingInterrogation}
                          onChange={(e) => setUndertakingInterrogation(e.target.checked)}
                          className="rounded border-neutral-300 text-neutral-900 focus:ring-0"
                        />
                        <label htmlFor="undertakeInterrogation" className="text-xs text-neutral-800 font-medium cursor-pointer">
                          Include Section 482(2) BNSS undertaking to join police interrogation whenever summoned
                        </label>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 5. Facts Narrative */}
            <div className="p-4 bg-white border border-neutral-200 rounded shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[var(--gold)]" />
                  Chronological Facts of the Matter
                </label>
                <span className="text-[10px] text-neutral-500">Provide clear sequence of events</span>
              </div>
              <textarea
                value={narrativeFacts}
                onChange={(e) => setNarrativeFacts(e.target.value)}
                placeholder="Narrate what occurred in detail. State exact conversations, actions, financial transactions, or incidents in chronological order..."
                rows={5}
                className="w-full p-3 text-xs border border-neutral-300 rounded focus:border-neutral-800 outline-none"
              />
            </div>
          </div>
        ) : (
          /* Free-Form Narrative Mode */
          <div className="space-y-4">
            <div className="p-4 bg-white border border-neutral-200 rounded shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Case Brief / Client Facts
                </label>
                <span className="text-[10px] text-neutral-500">Free-form or pasted case brief</span>
              </div>
              <textarea
                value={narrativeFacts}
                onChange={(e) => setNarrativeFacts(e.target.value)}
                placeholder={PLACEHOLDERS[documentType] || 'Enter the facts of the case in detail...'}
                rows={12}
                className="w-full p-4 text-xs font-mono border border-neutral-300 rounded focus:border-neutral-800 outline-none leading-relaxed"
                required
              />
            </div>
          </div>
        )}

        {/* Real-time Pre-Check Advisory */}
        {preCheck?.statutoryPrerequisites?.length > 0 && (
          <div className="p-3 bg-neutral-100 border border-neutral-200 rounded text-xs space-y-1">
            <span className="font-semibold text-neutral-800 text-[11px] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Statutory Prerequisites Status:
            </span>
            <div className="space-y-0.5 text-[11px] text-neutral-600">
              {preCheck.statutoryPrerequisites.map((p: any, idx: number) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className={p.isSatisfied ? 'text-emerald-700 font-medium' : 'text-amber-800 font-semibold'}>
                    {p.isSatisfied ? '✓' : '⚠'} {p.requirement}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--grey-300)]">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-xs border border-neutral-300 hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isGenerating}
            className="px-6 py-2.5 bg-[var(--matte-black)] hover:bg-[var(--gold-dark)] text-white text-xs font-semibold rounded shadow transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-[var(--gold)]" />
            <span>{isGenerating ? 'Drafting Legal Document...' : 'Generate Verified Legal Draft'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
