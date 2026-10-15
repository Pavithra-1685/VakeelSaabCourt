import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Scale,
  Lock,
  Mail,
  User,
  Building2,
  Award,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  X,
  ArrowRight
} from 'lucide-react';

const COURT_JURISDICTIONS = [
  'Supreme Court of India',
  'High Court of Delhi',
  'High Court of Bombay',
  'High Court of Judicature at Allahabad',
  'High Court of Karnataka',
  'High Court of Madras',
  'High Court of Calcutta',
  'High Court of Telangana',
  'District & Sessions Court',
  'National Company Law Tribunal (NCLT)',
  'Other High Court / Tribunal'
];

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    isSupabaseConfigured
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [barCouncilNo, setBarCouncilNo] = useState('');
  const [courtJurisdiction, setCourtJurisdiction] = useState(COURT_JURISDICTIONS[1]);

  useEffect(() => {
    setActiveTab(authModalTab);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [authModalTab, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await signInWithEmail(email, password);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password || !fullName) {
      setErrorMessage('Please fill in your name, email, and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password should be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUpWithEmail(email, password, {
      fullName,
      barCouncilNo: barCouncilNo.trim() || undefined,
      courtJurisdiction,
    });
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || 'Registration failed. Please try again.');
    } else {
      setSuccessMessage('Chambers account created successfully!');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email) {
      setErrorMessage('Please provide your registered advocate email address.');
      return;
    }

    setIsSubmitting(true);
    const { error, message } = await resetPassword(email);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || 'Could not send reset link. Please check the email provided.');
    } else {
      setSuccessMessage(message || 'Password reset link sent to your email.');
    }
  };

  const handleFillDemo = (demoType: 'delhi' | 'supreme') => {
    if (demoType === 'delhi') {
      setEmail('adv.rajesh.verma@highcourt.in');
      setPassword('Vakeel@2026');
      setFullName('Adv. Rajesh Verma');
      setBarCouncilNo('D/1482/2016');
      setCourtJurisdiction('High Court of Delhi');
    } else {
      setEmail('adv.kavita.sharma@sci.gov.in');
      setPassword('Vakeel@2026');
      setFullName('Adv. Kavita Sharma (Sr. Counsel)');
      setBarCouncilNo('SC/890/2012');
      setCourtJurisdiction('Supreme Court of India');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[var(--pure-white)] text-[var(--matte-black)] border border-[var(--grey-300)] shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '92vh' }}
      >
        {/* Top Decorative Gold Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold)] to-[var(--gold-light)]" />

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[var(--grey-300)] flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[var(--gold)]" />
              <h2
                style={{ fontFamily: 'var(--font-heading)' }}
                className="text-xl font-medium tracking-tight text-[var(--matte-black)]"
              >
                Vakeel Saab<span className="text-[var(--gold)]">.</span>
              </h2>
            </div>
            <p className="text-xs text-[var(--grey-600)] tracking-wide uppercase">
              Advocate Access &amp; Cloud Chambers
            </p>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1.5 text-[var(--grey-600)] hover:text-[var(--matte-black)] hover:bg-[var(--grey-100)] rounded transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        {activeTab !== 'forgot' && (
          <div className="flex border-b border-[var(--grey-300)] bg-[var(--grey-100)]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'login'
                  ? 'border-[var(--matte-black)] bg-[var(--pure-white)] text-[var(--matte-black)] font-semibold'
                  : 'border-transparent text-[var(--grey-600)] hover:text-[var(--matte-black)]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'register'
                  ? 'border-[var(--matte-black)] bg-[var(--pure-white)] text-[var(--matte-black)] font-semibold'
                  : 'border-transparent text-[var(--grey-600)] hover:text-[var(--matte-black)]'
              }`}
            >
              Join Chambers
            </button>
          </div>
        )}

        {/* Modal Body / Scrollable Form */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Status Messages */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2 rounded">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 rounded">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Fallback Local Mode Notice */}
          {!isSupabaseConfigured && (
            <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded text-[11px] text-amber-900 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--gold)]" />
                <span>Demo Auth Active (Supabase keys optional)</span>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => handleFillDemo('delhi')}
                  className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-medium text-[10px] rounded transition-colors"
                >
                  Quick Fill
                </button>
              </div>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--matte-black)] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[var(--gold)]" />
                  Advocate Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="counsel@highcourt.in"
                  required
                  className="w-full px-3 py-2 text-sm border border-[var(--grey-300)] focus:border-[var(--matte-black)] focus:ring-1 focus:ring-[var(--matte-black)] outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[var(--matte-black)] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[var(--gold)]" />
                    Chambers Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('forgot')}
                    className="text-[11px] text-[var(--grey-600)] hover:text-[var(--gold-dark)] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2 text-sm border border-[var(--grey-300)] focus:border-[var(--matte-black)] focus:ring-1 focus:ring-[var(--matte-black)] outline-none pr-9 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--grey-600)] hover:text-[var(--matte-black)]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[var(--matte-black)] text-[var(--pure-white)] text-sm font-medium hover:bg-[var(--gold-dark)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In to Chambers'}
                <ArrowRight className="w-4 h-4" />
              </button>


            </form>
          )}

          {/* 2. REGISTER / JOIN CHAMBERS FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--matte-black)] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[var(--gold)]" />
                  Full Advocate Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Adv. Rajesh Verma"
                  required
                  className="w-full px-3 py-2 text-sm border border-[var(--grey-300)] focus:border-[var(--matte-black)] outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--matte-black)] flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[var(--gold)]" />
                    Bar Enrollment No.
                  </label>
                  <input
                    type="text"
                    value={barCouncilNo}
                    onChange={(e) => setBarCouncilNo(e.target.value)}
                    placeholder="D/1482/2016"
                    className="w-full px-3 py-2 text-sm border border-[var(--grey-300)] focus:border-[var(--matte-black)] outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--matte-black)] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[var(--gold)]" />
                    Jurisdiction
                  </label>
                  <select
                    value={courtJurisdiction}
                    onChange={(e) => setCourtJurisdiction(e.target.value)}
                    className="w-full px-2 py-2 text-xs border border-[var(--grey-300)] focus:border-[var(--matte-black)] outline-none bg-white transition-colors"
                  >
                    {COURT_JURISDICTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--matte-black)] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[var(--gold)]" />
                  Official Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="counsel@bar.in"
                  required
                  className="w-full px-3 py-2 text-sm border border-[var(--grey-300)] focus:border-[var(--matte-black)] outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--matte-black)] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[var(--gold)]" />
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    required
                    className="w-full px-3 py-2 text-sm border border-[var(--grey-300)] focus:border-[var(--matte-black)] outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--matte-black)] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[var(--gold)]" />
                    Confirm
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    className="w-full px-3 py-2 text-sm border border-[var(--grey-300)] focus:border-[var(--matte-black)] outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 bg-[var(--matte-black)] text-[var(--pure-white)] text-sm font-medium hover:bg-[var(--gold-dark)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Registering Advocate...' : 'Enroll Chambers Account'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--matte-black)] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[var(--gold)]" />
                  Your Registered Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="advocate@bar.in"
                  required
                  className="w-full px-3 py-2 text-sm border border-[var(--grey-300)] focus:border-[var(--matte-black)] outline-none transition-colors"
                />
              </div>

              <p className="text-xs text-[var(--grey-600)] leading-relaxed">
                Enter your chambers email address and we will send you instructions to securely reset your credentials.
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[var(--matte-black)] text-[var(--pure-white)] text-sm font-medium hover:bg-[var(--gold-dark)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Sending Instructions...' : 'Send Recovery Link'}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs text-[var(--grey-600)] hover:text-[var(--matte-black)] underline"
                >
                  Return to Sign In
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer / Court Disclaimer */}
        <div className="px-6 py-3 bg-[var(--grey-100)] border-t border-[var(--grey-300)] text-center text-[10px] text-[var(--grey-600)]">
          Encrypted &amp; confidential legal drafting workspace for Indian Bar advocates.
        </div>
      </div>
    </div>
  );
}
