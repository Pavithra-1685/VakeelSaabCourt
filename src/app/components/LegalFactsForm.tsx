import { useState } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { DocumentType } from './DocumentTypeSelector';

interface LegalFactsFormProps {
  documentType: DocumentType;
  onGenerate: (facts: string) => void;
  onBack: () => void;
  isGenerating?: boolean;
}

const DOCUMENT_TITLES: Record<DocumentType, string> = {
  'fir-complaint': 'FIR Complaint',
  'bail-petition': 'Bail Petition',
  'affidavit': 'Affidavit',
  'legal-notice': 'Legal Notice',
  'writ-petition': 'Writ Petition',
  'criminal-complaint': 'Criminal Complaint',
  'civil-pleading': 'Civil Pleading',
  'counter-affidavit': 'Counter Affidavit',
  'written-statement': 'Written Statement',
};

const PLACEHOLDERS: Record<DocumentType, string> = {
  'fir-complaint': `Enter the facts of the incident in detail:

- Date, time, and place of occurrence
- Description of the incident
- Names and details of accused persons
- Witnesses present
- Any evidence or documents
- Relief sought

Example:
On 10th May 2026, at approximately 2:30 PM, at Shop No. 15, Main Market, Delhi, the accused person Rajesh Kumar wrongfully took away my mobile phone worth Rs. 45,000...`,
  'bail-petition': `Provide the case details and grounds for bail:

- Case number and court
- Nature of offence
- Date of arrest
- Grounds for bail (medical, first offender, etc.)
- Sureties available
- Previous criminal record (if any)

Example:
The petitioner was arrested on 8th May 2026 in FIR No. 123/2026 under Section 379 IPC. This is a bailable offence. The petitioner is a first-time offender with no criminal antecedents...`,
  'affidavit': `State the facts you wish to depose on oath:

- Your full name and address
- Facts in numbered paragraphs
- Documents attached (if any)
- Purpose of the affidavit

Example:
I, Ramesh Sharma, aged 45 years, residing at House No. 25, Sector 12, Noida, do hereby solemnly affirm and state as follows:

1. That I am the owner of property bearing No. 25, Sector 12, Noida...`,
  'legal-notice': `Provide the facts and demands:

- Your details and address
- Recipient's details
- Facts of the dispute
- Legal basis for the claim
- Relief/demand
- Timeline for response

Example:
My client Mr. Suresh Kumar entered into an agreement dated 1st January 2026 with your company for supply of goods worth Rs. 5,00,000. Despite full payment, goods have not been delivered...`,
  'writ-petition': `Describe the constitutional violation and relief sought:

- Fundamental right violated (Article 14, 19, 21, etc.)
- Facts showing state action
- Legal/administrative order challenged
- How it violates your rights
- Relief sought from the court

Example:
The petitioner is a resident of Delhi. By order dated 5th May 2026, the Municipal Corporation demolished the petitioner's shop without notice, violating principles of natural justice...`,
  'criminal-complaint': `State the facts constituting the offence:

- Your details as complainant
- Facts of the criminal act
- Applicable sections (if known)
- Details of accused
- Evidence available
- Prayer for prosecution

Example:
The complainant states that on 12th May 2026, the accused issued a cheque for Rs. 2,00,000 which was dishonored by the bank. Despite legal notice, payment has not been made...`,
  'civil-pleading': `Describe the cause of action and relief:

- Parties to the suit
- Facts giving rise to the dispute
- Cause of action
- Jurisdiction of the court
- Relief claimed
- Valuation

Example:
The plaintiff and defendant entered into a sale agreement dated 1st March 2026 for property in Mumbai. Despite receiving full consideration of Rs. 50,00,000, the defendant refuses to execute the sale deed...`,
  'counter-affidavit': `State your response to the petition:

- Reference to the petition being replied to
- Admission or denial of each allegation
- Additional facts in your favor
- Legal objections
- Prayer

Example:
With reference to Writ Petition No. 456/2026, the respondent respectfully submits:
1. That the contents of paragraph 3 of the petition are denied...`,
  'written-statement': `State your defense to the plaint:

- Specific admissions and denials
- Affirmative defenses
- Counterclaim (if any)
- Documents in support
- Prayer

Example:
The defendant denies the allegations in the plaint and states:
1. The contents of paragraph 2 are admitted
2. The contents of paragraph 3 are denied. The defendant states that...`,
};

export function LegalFactsForm({ documentType, onGenerate, onBack, isGenerating }: LegalFactsFormProps) {
  const [facts, setFacts] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (facts.trim()) {
      onGenerate(facts);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-[var(--grey-100)] transition-colors border border-[var(--grey-300)]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)' }} className="text-2xl md:text-3xl text-[var(--matte-black)]">
            {DOCUMENT_TITLES[documentType]}
          </h2>
          <p className="text-[var(--grey-600)] mt-1">Provide the legal facts and details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm text-[var(--matte-black)]">Legal Facts</label>
          <textarea
            value={facts}
            onChange={(e) => setFacts(e.target.value)}
            placeholder={PLACEHOLDERS[documentType]}
            className="w-full min-h-[400px] p-4 border border-[var(--grey-300)] bg-[var(--pure-white)] text-[var(--matte-black)] placeholder:text-[var(--grey-600)] focus:outline-none focus:border-[var(--matte-black)] transition-colors resize-y"
            disabled={isGenerating}
          />
          <p className="text-xs text-[var(--grey-600)]">
            Provide detailed facts in plain language. The AI will format them into a professional legal draft.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!facts.trim() || isGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--matte-black)] text-[var(--pure-white)] border border-[var(--matte-black)] hover:bg-[var(--grey-900)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? 'Generating Draft...' : 'Generate Draft'}
          </button>
        </div>
      </form>
    </div>
  );
}
