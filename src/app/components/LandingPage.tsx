import { Scale, FileText, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[var(--pure-white)] flex flex-col">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-[var(--grey-300)] px-8 py-6"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="w-8 h-8 text-[var(--matte-black)]" strokeWidth={1.5} />
            <h1 style={{ fontFamily: 'var(--font-heading)' }} className="text-2xl tracking-tight text-[var(--matte-black)]">
              Vakeel Saab
            </h1>
          </div>
          <button
            onClick={onGetStarted}
            className="px-6 py-2.5 bg-[var(--matte-black)] text-[var(--pure-white)] border border-[var(--matte-black)] hover:bg-[var(--grey-900)] transition-all hover:scale-105 active:scale-95"
          >
            Launch Workspace
          </button>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-8 py-20">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center space-y-8"
        >
          <div className="space-y-4">
            <motion.h2
              variants={itemVariants}
              style={{ fontFamily: 'var(--font-heading)' }}
              className="text-4xl md:text-6xl tracking-tight text-[var(--matte-black)] leading-tight"
            >
              Professional Indian Legal Drafting
            </motion.h2>
            <motion.p
              variants={itemVariants}
              style={{ fontFamily: 'var(--font-heading)' }}
              className="text-2xl text-[var(--matte-black)] opacity-90"
            >
              Powered by AI.
            </motion.p>
          </div>

          <motion.p variants={itemVariants} className="text-lg text-[var(--grey-600)] max-w-2xl mx-auto leading-relaxed">
            Generate court-ready legal drafts using structured Indian legal intelligence.
            From FIR complaints to writ petitions, maintain professional advocate standards.
          </motion.p>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="mt-8 px-10 py-4 bg-[var(--matte-black)] text-[var(--pure-white)] border border-[var(--matte-black)] hover:bg-[var(--grey-900)] transition-colors text-lg"
          >
            Get Started
          </motion.button>

          {/* Feature Grid */}
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-16 border-t border-[var(--grey-300)]"
          >
            <motion.div variants={itemVariants} className="space-y-3 group cursor-default">
              <FileText className="w-10 h-10 text-[var(--matte-black)] mx-auto transition-transform group-hover:scale-110" strokeWidth={1.5} />
              <h3 style={{ fontFamily: 'var(--font-heading)' }} className="text-xl">
                Court-Ready Formats
              </h3>
              <p className="text-sm text-[var(--grey-600)] leading-relaxed">
                Professional drafting that follows Indian High Court conventions and advocate-style formatting.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-3 group cursor-default">
              <Shield className="w-10 h-10 text-[var(--matte-black)] mx-auto transition-transform group-hover:scale-110" strokeWidth={1.5} />
              <h3 style={{ fontFamily: 'var(--font-heading)' }} className="text-xl">
                Indian Law Compliance
              </h3>
              <p className="text-sm text-[var(--grey-600)] leading-relaxed">
                Accurate section suggestions from IPC, BNS, CrPC, BNSS, and Indian Evidence Act.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-3 group cursor-default">
              <Sparkles className="w-10 h-10 text-[var(--matte-black)] mx-auto transition-transform group-hover:scale-110" strokeWidth={1.5} />
              <h3 style={{ fontFamily: 'var(--font-heading)' }} className="text-xl">
                AI-Powered Intelligence
              </h3>
              <p className="text-sm text-[var(--grey-600)] leading-relaxed">
                Convert rough legal facts into polished drafts while maintaining professional litigation tone.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--grey-300)] px-8 py-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-[var(--grey-600)]">
            Professional legal drafting assistant for Indian advocates
          </p>
        </div>
      </footer>
    </div>
  );
}
