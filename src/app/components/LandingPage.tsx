import { FileText, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { UserProfileMenu } from './auth/UserProfileMenu';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const { profile, isAuthenticated, openAuthModal } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex flex-col">

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-[var(--grey-300)] px-8 py-5"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Brand */}
          <div className="flex flex-col">
            <h1
              style={{ fontFamily: 'var(--font-heading)' }}
              className="text-2xl tracking-tight text-[var(--matte-black)]"
            >
              Vakeel Saab<span className="text-[var(--gold)]">.</span>
            </h1>

            <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--grey-600)] mt-0.5">
              by Naratral
            </span>
          </div>

          {/* Right Action Menu: Only Sign In / Profile */}
          <div className="flex items-center">
            <UserProfileMenu />
          </div>

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

          {/* Hero Heading */}
          <div className="space-y-4">
            {profile && (
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--grey-100)] border border-[var(--gold)]/40 rounded-full text-xs text-[var(--matte-black)] mb-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Chambers Session: <strong>{profile.fullName}</strong> ({profile.courtJurisdiction || 'Verified Advocate'})</span>
              </motion.div>
            )}

            <motion.h2
              variants={itemVariants}
              style={{ fontFamily: 'var(--font-heading)' }}
              className="text-4xl md:text-6xl tracking-tight text-[var(--matte-black)] leading-tight"
            >
              Professional Indian{' '}
              <span className="text-[var(--gold)]">
                Legal Drafting
              </span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              style={{ fontFamily: 'var(--font-heading)' }}
              className="text-2xl text-[var(--matte-black)] opacity-90"
            >
              Legal intelligence,{' '}
              <span className="text-[var(--gold)]">
                simplified.
              </span>
            </motion.p>

          </div>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-lg text-[var(--grey-600)] max-w-2xl mx-auto leading-relaxed"
          >
            Generate court-ready legal drafts using structured Indian legal
            intelligence. From FIR complaints to writ petitions, maintain
            professional advocate standards.
          </motion.p>

          {/* Join Chambers CTA */}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!isAuthenticated) {
                openAuthModal('register');
              } else {
                onGetStarted();
              }
            }}
            className="mt-8 px-10 py-4 bg-[var(--matte-black)] text-[var(--pure-white)] border border-[var(--matte-black)] hover:bg-[var(--gold)] hover:border-[var(--gold)] transition-colors text-lg font-medium cursor-pointer"
          >
            {isAuthenticated ? 'Enter Chambers Workspace' : 'Join Chambers'}
          </motion.button>

          {/* Feature Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-16 border-t border-[var(--grey-300)]"
          >

            {/* Court-Ready Formats */}
            <motion.div
              variants={itemVariants}
              className="space-y-3 group cursor-default"
            >
              <FileText
                className="w-10 h-10 text-[var(--gold)] mx-auto transition-transform group-hover:scale-110"
                strokeWidth={1.5}
              />

              <h3
                style={{ fontFamily: 'var(--font-heading)' }}
                className="text-xl"
              >
                Court-Ready Formats
              </h3>

              <p className="text-sm text-[var(--grey-600)] leading-relaxed">
                Professional drafting that follows Indian High Court
                conventions and advocate-style formatting.
              </p>
            </motion.div>

            {/* Indian Law Compliance */}
            <motion.div
              variants={itemVariants}
              className="space-y-3 group cursor-default"
            >
              <Shield
                className="w-10 h-10 text-[var(--gold)] mx-auto transition-transform group-hover:scale-110"
                strokeWidth={1.5}
              />

              <h3
                style={{ fontFamily: 'var(--font-heading)' }}
                className="text-xl"
              >
                Indian Law Compliance
              </h3>

              <p className="text-sm text-[var(--grey-600)] leading-relaxed">
                Accurate section suggestions from IPC, BNS, CrPC, BNSS,
                and Indian Evidence Act.
              </p>
            </motion.div>

            {/* AI-Powered Intelligence */}
            <motion.div
              variants={itemVariants}
              className="space-y-3 group cursor-default"
            >
              <Sparkles
                className="w-10 h-10 text-[var(--gold)] mx-auto transition-transform group-hover:scale-110"
                strokeWidth={1.5}
              />

              <h3
                style={{ fontFamily: 'var(--font-heading)' }}
                className="text-xl"
              >
                AI-Powered Intelligence
              </h3>

              <p className="text-sm text-[var(--grey-600)] leading-relaxed">
                Convert rough legal facts into polished drafts while
                maintaining professional litigation tone.
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
