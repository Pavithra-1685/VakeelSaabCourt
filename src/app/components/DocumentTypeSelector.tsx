import React, { useState } from 'react';
import {
  FileText,
  Scale,
  AlertCircle,
  ScrollText,
  Shield,
  Gavel,
  Sparkles,
  Send,
  Building,
  UserCheck,
  Search,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { classifyLegalIntent } from '../legal/classification/intentClassifier';

export type DocumentType =
  | 'police-complaint'
  | 'sp-representation'
  | 'bnss-175-3-application'
  | 'bail-petition'
  | 'anticipatory-bail'
  | 'magistrate-complaint'
  | 'legal-notice'
  | 'writ-petition'
  | 'civil-pleading'
  | 'counter-affidavit'
  | 'written-statement'
  | 'affidavit'
  | 'general-legal-advice'
  | 'fir-complaint'
  | 'criminal-complaint';

interface DocumentTypeOption {
  id: DocumentType;
  title: string;
  category: 'criminal' | 'bail' | 'civil' | 'advisory';
  statutoryBasis: string;
  description: string;
  icon: React.ComponentType<any>;
  badge?: string;
}

const DOCUMENT_TYPES: DocumentTypeOption[] = [
  // 1. Criminal Procedure (BNSS 2023)
  {
    id: 'police-complaint',
    title: 'Complaint to Police (SHO)',
    category: 'criminal',
    statutoryBasis: 'Section 173 BNSS, 2023',
    description: 'Written complaint to Station House Officer requesting FIR registration for an alleged cognizable offence.',
    icon: AlertCircle,
    badge: 'Step 1: SHO',
  },
  {
    id: 'sp-representation',
    title: 'Representation to SP',
    category: 'criminal',
    statutoryBasis: 'Section 173(4) BNSS, 2023',
    description: 'Representation to Superintendent of Police by post upon refusal or inaction by the police station.',
    icon: Send,
    badge: 'Step 2: SP Escalate',
  },
  {
    id: 'bnss-175-3-application',
    title: 'Magistrate Investigation [175(3)]',
    category: 'criminal',
    statutoryBasis: 'Section 175(3) BNSS, 2023',
    description: 'Application before Judicial Magistrate directing police investigation, with mandatory SP proof & affidavit.',
    icon: Gavel,
    badge: 'Step 3: Magistrate',
  },
  {
    id: 'magistrate-complaint',
    title: 'Private Complaint [S. 223]',
    category: 'criminal',
    statutoryBasis: 'Section 223 BNSS, 2023',
    description: 'Direct private complaint before Judicial Magistrate with pre-cognizance examination on oath.',
    icon: FileText,
  },

  // 2. Bail Applications
  {
    id: 'bail-petition',
    title: 'Regular Bail Application',
    category: 'bail',
    statutoryBasis: 'Section 480 / 483 BNSS',
    description: 'Application for release on bail for an accused person currently in custody or under arrest.',
    icon: Scale,
    badge: 'In Custody',
  },
  {
    id: 'anticipatory-bail',
    title: 'Anticipatory Bail Application',
    category: 'bail',
    statutoryBasis: 'Section 482 BNSS, 2023',
    description: 'Pre-arrest protection application before Sessions Court or High Court for person apprehending arrest.',
    icon: Shield,
    badge: 'Pre-Arrest',
  },

  // 3. Civil, Commercial & Constitutional
  {
    id: 'legal-notice',
    title: 'Legal Demand Notice',
    category: 'civil',
    statutoryBasis: 'CPC / NI Act Section 138',
    description: 'Formal advocate notice asserting rights, specifying demands, and giving 15 days cure period before suit.',
    icon: ScrollText,
  },
  {
    id: 'writ-petition',
    title: 'Writ Petition',
    category: 'civil',
    statutoryBasis: 'Article 226 / 32 Constitution',
    description: 'Constitutional writ remedy before High Court or Supreme Court against arbitrary state action.',
    icon: Shield,
  },
  {
    id: 'civil-pleading',
    title: 'Civil Plaint / Suit',
    category: 'civil',
    statutoryBasis: 'Order VII, Code of Civil Procedure',
    description: 'Plaint in civil suit for recovery, declaration, specific performance, or permanent injunction.',
    icon: Building,
  },
  {
    id: 'written-statement',
    title: 'Written Statement',
    category: 'civil',
    statutoryBasis: 'Order VIII, CPC',
    description: 'Defendant\'s formal defense, paragraph-wise admissions/denials, and counterclaims in civil suit.',
    icon: ScrollText,
  },
  {
    id: 'affidavit',
    title: 'General Affidavit',
    category: 'civil',
    statutoryBasis: 'Order XIX, CPC / Notaries Act',
    description: 'Sworn statement of facts affirmed on oath before an Oath Commissioner or Notary Public.',
    icon: UserCheck,
  },
  {
    id: 'counter-affidavit',
    title: 'Counter Affidavit',
    category: 'civil',
    statutoryBasis: 'High Court Rules / CPC',
    description: 'Reply affidavit in response to writ petitions, interlocutory applications, or show-cause notices.',
    icon: FileText,
  },

  // 4. Advisory
  {
    id: 'general-legal-advice',
    title: 'Legal Opinion & Strategy',
    category: 'advisory',
    statutoryBasis: 'Indian Legal Jurisprudence',
    description: 'Comprehensive AI legal assessment, statutory provisions analysis, and recommended procedural roadmap.',
    icon: Sparkles,
  },
];

interface DocumentTypeSelectorProps {
  onSelect: (type: DocumentType) => void;
  selectedType?: DocumentType;
}

export function DocumentTypeSelector({ onSelect, selectedType }: DocumentTypeSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'criminal' | 'bail' | 'civil' | 'advisory'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showClassifierWizard, setShowClassifierWizard] = useState(false);
  const [situationDescription, setSituationDescription] = useState('');
  const [classificationResult, setClassificationResult] = useState<any>(null);

  const filteredDocs = DOCUMENT_TYPES.filter((doc) => {
    const matchesCategory = activeCategory === 'all' || doc.category === activeCategory;
    const matchesQuery =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.statutoryBasis.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleRunClassifier = () => {
    if (!situationDescription.trim()) return;
    const result = classifyLegalIntent({
      incidentDescription: situationDescription,
      rawUserPrompt: situationDescription,
    });
    setClassificationResult(result);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.96, y: 8 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[var(--grey-300)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-[var(--gold)]/20 text-[var(--gold-dark)] border border-[var(--gold)]/30 rounded">
              BNSS 2023 Compliant
            </span>
            <span className="text-xs text-neutral-500">• Verified Indian Statutory Framework</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)' }} className="text-2xl sm:text-3xl font-medium text-[var(--matte-black)]">
            Select Legal Document Type
          </h2>
          <p className="text-xs sm:text-sm text-[var(--grey-600)]">
            Choose the exact procedural document tailored to your legal stage and jurisdiction.
          </p>
        </div>

        {/* Intent Classifier Toggle Button */}
        <button
          onClick={() => setShowClassifierWizard(!showClassifierWizard)}
          className={`px-4 py-2 text-xs font-medium border flex items-center gap-2 transition-all shadow-sm ${
            showClassifierWizard
              ? 'bg-[var(--matte-black)] text-white border-[var(--matte-black)]'
              : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[var(--gold)]" />
          <span>{showClassifierWizard ? 'Close Procedural Wizard' : 'Help Me Classify My Situation'}</span>
        </button>
      </div>

      {/* Procedural Intent Classifier Wizard */}
      {showClassifierWizard && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-gradient-to-br from-neutral-50 to-amber-50/40 border border-neutral-300 rounded shadow-sm space-y-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[var(--matte-black)] text-[var(--gold)] rounded">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">AI Document Intent Classifier</h3>
              <p className="text-xs text-neutral-600 mt-0.5">
                Describe what happened, what legal outcome is desired, and whether you have approached the police. Vakeel Saab will identify the correct legal document and statutory prerequisites.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <textarea
              value={situationDescription}
              onChange={(e) => setSituationDescription(e.target.value)}
              placeholder="e.g. Someone stole my laptop and mobile from my shop yesterday, and I have not approached the police station yet... OR Police refused to register my theft complaint last week and I need to escalate..."
              rows={3}
              className="w-full p-3 text-xs border border-neutral-300 focus:border-neutral-800 bg-white rounded outline-none"
            />

            <div className="flex justify-between items-center">
              <span className="text-[11px] text-neutral-500">
                Tip: State whether a police complaint was previously submitted, or whether the person is under arrest.
              </span>
              <button
                type="button"
                onClick={handleRunClassifier}
                disabled={!situationDescription.trim()}
                className="px-4 py-1.5 text-xs font-semibold bg-[var(--matte-black)] text-white hover:bg-[var(--gold-dark)] disabled:opacity-50 transition-colors flex items-center gap-1.5 rounded"
              >
                <span>Classify Document</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Classification Result Card */}
          {classificationResult && (
            <div className="p-4 bg-white border border-neutral-200 rounded space-y-3 animate-in fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-neutral-500">Recommended Document:</span>
                  <h4 className="text-base font-bold text-neutral-900 mt-0.5">
                    {classificationResult.officialDocumentTitle}
                  </h4>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    {classificationResult.proceduralExplanation}
                  </p>
                </div>

                <button
                  onClick={() => onSelect(classificationResult.recommendedType)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded shadow flex items-center gap-1.5 transition-all flex-shrink-0 ml-4"
                >
                  <span>Select &amp; Draft</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Statutory Prerequisites */}
              {classificationResult.statutoryPrerequisites?.length > 0 && (
                <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded text-xs space-y-1.5">
                  <span className="font-semibold text-neutral-800 text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Procedural Prerequisites Check:
                  </span>
                  <ul className="space-y-1 text-[11px] text-neutral-600">
                    {classificationResult.statutoryPrerequisites.map((p: any, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="font-mono text-neutral-400">•</span>
                        <span>
                          <strong>{p.requirement}:</strong> {p.note}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings if any */}
              {classificationResult.warnings?.length > 0 && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded text-xs space-y-1">
                  <span className="font-semibold text-[11px]">Procedural Guidance:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                    {classificationResult.warnings.map((w: string, idx: number) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Category Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-100 rounded border border-neutral-200">
          {[
            { id: 'all', label: 'All Documents' },
            { id: 'criminal', label: 'Criminal (BNSS)' },
            { id: 'bail', label: 'Bail Applications' },
            { id: 'civil', label: 'Civil & Notice' },
            { id: 'advisory', label: 'Advisory' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                activeCategory === cat.id
                  ? 'bg-white text-[var(--matte-black)] shadow-sm font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by act, section, or keyword..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-300 rounded bg-white focus:border-neutral-800 outline-none"
          />
        </div>
      </div>

      {/* Grid of Documents */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filteredDocs.map((docType) => {
          const Icon = docType.icon;
          const isSelected = selectedType === docType.id;

          return (
            <motion.button
              key={docType.id}
              variants={itemVariants}
              whileHover={{
                scale: 1.015,
                borderColor: 'var(--matte-black)',
                backgroundColor: 'var(--grey-100)',
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(docType.id)}
              className={`
                p-5 border text-left transition-all relative flex flex-col justify-between
                ${
                  isSelected
                    ? 'border-[var(--matte-black)] bg-[var(--grey-100)] ring-1 ring-[var(--matte-black)]'
                    : 'border-[var(--grey-300)] bg-[var(--pure-white)] hover:border-neutral-400'
                }
              `}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded bg-neutral-100 text-neutral-800">
                    <Icon className="w-5 h-5 text-[var(--matte-black)]" strokeWidth={1.7} />
                  </div>
                  {docType.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-200 text-neutral-800 tracking-wide uppercase">
                      {docType.badge}
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-mono font-medium text-[var(--gold-dark)] block mb-1">
                  {docType.statutoryBasis}
                </span>

                <h3
                  style={{ fontFamily: 'var(--font-heading)' }}
                  className={`text-base font-semibold mb-1.5 leading-snug ${
                    isSelected ? 'text-[var(--matte-black)]' : 'text-neutral-900'
                  }`}
                >
                  {docType.title}
                </h3>

                <p className="text-xs text-[var(--grey-600)] leading-relaxed">{docType.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                <span>Select Document</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
