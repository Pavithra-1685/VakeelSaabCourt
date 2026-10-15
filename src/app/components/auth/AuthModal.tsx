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
    signInWithGoogle,
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
  const [showGoogleConfig, setShowGoogleConfig] = useState(false);
  const [googleClientIdInput, setGoogleClientIdInput] = useState(
    localStorage.getItem('vakeel_saab_google_client_id') || ''
  );

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

              {/* OAuth Providers */}
              <div className="pt-2">
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-[var(--grey-300)] w-full" />
                  <span className="bg-[var(--pure-white)] px-3 text-[11px] text-[var(--grey-600)] uppercase tracking-wider whitespace-nowrap">
                    or authenticate with
                  </span>
                  <div className="border-t border-[var(--grey-300)] w-full" />
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    const res = await signInWithGoogle();
                    if (res?.error) {
                      if (res.error.message.includes('GOOGLE_CLIENT_ID_REQUIRED')) {
                        setShowGoogleConfig(true);
                      } else {
                        setErrorMessage(res.error.message);
                      }
                    }
                  }}
                  className="w-full mt-3 py-2 border border-[var(--grey-300)] hover:border-[var(--matte-black)] text-sm font-medium text-[var(--matte-black)] flex items-center justify-center gap-2 hover:bg-[var(--grey-100)] transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Continue with Google
                </button>

                {showGoogleConfig && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-xs space-y-2 text-amber-950 animate-in fade-in">
                    <p className="font-semibold text-xs">
                      Navigate to Real Google Accounts:
                    </p>
                    <p className="text-[11px] text-amber-900 leading-relaxed">
                      To open Google's account chooser (<code className="bg-amber-100 px-1 font-mono">accounts.google.com</code>), enter your Google OAuth Web Client ID (or add <code className="bg-amber-100 px-1 font-mono">VITE_GOOGLE_CLIENT_ID</code> in <code className="bg-amber-100 px-1 font-mono">.env.local</code>):
                    </p>
                    <div className="space-y-2 pt-1">
                      <input
                        type="text"
                        placeholder="e.g. 123456789-xyz.apps.googleusercontent.com"
                        value={googleClientIdInput}
                        onChange={(e) => setGoogleClientIdInput(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-amber-300 text-xs text-black outline-none"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!googleClientIdInput.trim()) {
                            setErrorMessage('Please enter a valid Google Client ID.');
                            return;
                          }
                          localStorage.setItem('vakeel_saab_google_client_id', googleClientIdInput.trim());
                          await signInWithGoogle();
                        }}
                        className="w-full py-1.5 bg-[var(--matte-black)] text-white hover:bg-[var(--gold-dark)] text-xs font-medium transition-colors"
                      >
                        Navigate to Google Accounts →
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
