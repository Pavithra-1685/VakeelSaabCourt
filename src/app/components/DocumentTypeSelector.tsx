import { FileText, Scale, AlertCircle, ScrollText, Shield, Gavel, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export type DocumentType =
  | 'fir-complaint'
  | 'bail-petition'
  | 'affidavit'
  | 'legal-notice'
  | 'writ-petition'
  | 'criminal-complaint'
  | 'civil-pleading'
  | 'counter-affidavit'
  | 'written-statement'
  | 'general-legal-advice';

interface DocumentTypeOption {
  id: DocumentType;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

const DOCUMENT_TYPES: DocumentTypeOption[] = [
  {
    id: 'fir-complaint',
    title: 'FIR Complaint',
    description: 'First Information Report for criminal matters',
    icon: AlertCircle,
  },
  {
    id: 'bail-petition',
    title: 'Bail Petition',
    description: 'Application for bail in criminal proceedings',
    icon: Scale,
  },
  {
    id: 'affidavit',
    title: 'Affidavit',
    description: 'Sworn statement of facts',
    icon: FileText,
  },
  {
    id: 'legal-notice',
    title: 'Legal Notice',
    description: 'Formal notice under Indian law',
    icon: ScrollText,
  },
  {
    id: 'writ-petition',
    title: 'Writ Petition',
    description: 'Constitutional remedy under Article 226/32',
    icon: Shield,
  },
  {
    id: 'criminal-complaint',
    title: 'Criminal Complaint',
    description: 'Complaint in criminal matters',
    icon: Gavel,
  },
  {
    id: 'civil-pleading',
    title: 'Civil Pleading',
    description: 'Plaint or written statement in civil suits',
    icon: FileText,
  },
  {
    id: 'counter-affidavit',
    title: 'Counter Affidavit',
    description: 'Reply affidavit in response to petition',
    icon: FileText,
  },
  {
    id: 'written-statement',
    title: 'Written Statement',
    description: 'Defendant\'s reply in civil suit',
    icon: ScrollText,
  },
  {
    id: 'general-legal-advice',
    title: 'Legal Advice',
    description: 'Get AI-powered legal analysis and advice',
    icon: Sparkles,
  },
];

interface DocumentTypeSelectorProps {
  onSelect: (type: DocumentType) => void;
  selectedType?: DocumentType;
}

export function DocumentTypeSelector({ onSelect, selectedType }: DocumentTypeSelectorProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-2"
      >
        <h2 style={{ fontFamily: 'var(--font-heading)' }} className="text-3xl text-[var(--matte-black)]">
          Select Document Type
        </h2>
        <p className="text-[var(--grey-600)]">
          Choose the type of legal document you need to draft
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {DOCUMENT_TYPES.map((docType) => {
          const Icon = docType.icon;
          const isSelected = selectedType === docType.id;

          return (
            <motion.button
              key={docType.id}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02,
                borderColor: 'var(--matte-black)',
                backgroundColor: 'var(--grey-100)'
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(docType.id)}
              className={`
                p-6 border text-left transition-all
                ${
                  isSelected
                    ? 'border-[var(--matte-black)] bg-[var(--grey-100)]'
                    : 'border-[var(--grey-300)] bg-[var(--pure-white)]'
                }
              `}
            >
              <Icon
                className={`w-8 h-8 mb-4 ${isSelected ? 'text-[var(--matte-black)]' : 'text-[var(--grey-600)]'}`}
                strokeWidth={1.5}
              />
              <h3
                style={{ fontFamily: 'var(--font-heading)' }}
                className={`text-lg mb-2 ${isSelected ? 'text-[var(--matte-black)]' : 'text-[var(--grey-900)]'}`}
              >
                {docType.title}
              </h3>
              <p className="text-sm text-[var(--grey-600)] leading-relaxed">{docType.description}</p>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
