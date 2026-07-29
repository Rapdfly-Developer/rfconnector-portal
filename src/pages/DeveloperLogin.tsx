/**
 * ChargeBridge — Operator Back-office Login
 * Route: /login  (on app.chargebridge.io)
 *
 * Step 1 — email + password
 * Step 2 — 6-digit TOTP (2FA)
 */
import { useState, FormEvent, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Zap, Mail, Lock, Eye, EyeOff, ArrowRight,
  AlertCircle, CheckCircle, ShieldCheck,
} from 'lucide-react';

export const OPERATOR_SESSION_KEY = 'cb_operator_session';

export interface OperatorSession {
  token:    string;
  userId:   string;
  tenantId: string | null;
  email:    string;
  loginAt:  string;
}

// Dev fallback — never rendered in UI
const _DEV_ACCOUNTS = [
  { email: 'admin@rfconnector.io', password: 'admin1234', name: 'RFConnector Admin',    userId: 'dev_admin_1' },
  { email: 'ops@rfconnector.io',   password: 'admin1234', name: 'Operations Manager',   userId: 'dev_ops_1'   },
];

const API_BASE = import.meta.env.VITE_API_URL ?? '';

type Step = 'credentials' | 'otp';

export default function DeveloperLogin() {
  const navigate = useNavigate();

  // Step 1
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);

  // Step 2
  const [otp,      setOtp]      = useState('');
  const otpRef = useRef<HTMLInputElement>(null);

  // Shared
  const [step,    setStep]    = useState<Step>('credentials');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  // Temporary store between steps (not persisted)
  const pendingSession = useRef<OperatorSession | null>(null);

  useEffect(() => {
    if (step === 'otp') otpRef.current?.focus();
  }, [step]);

  // ── Step 1 — verify credentials ───────────────────────────────────────────
  async function handleCredentials(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (API_BASE) {
        const resp = await fetch(`${API_BASE}/v1/operator/auth/login`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email: email.trim(), password }),
        });

        if (resp.status === 429) {
          const after = resp.headers.get('Retry-After') ?? '60';
          setError(`Too many attempts. Try again in ${after} s.`);
          setLoading(false);
          return;
        }

        const json = await resp.json() as {
          data?:  { sessionId: string; tenantId: string; userId: string };
          error?: { message: string } | null;
        };

        if (!resp.ok || !json.data) {
          setError('Incorrect email or password.');
          setLoading(false);
          return;
        }

        // Store partial session — completed after OTP
        pendingSession.current = {
          token:    json.data.sessionId,
          userId:   json.data.userId,
          tenantId: json.data.tenantId,
          email:    email.trim(),
          loginAt:  new Date().toISOString(),
        };
      } else {
        // Dev fallback
        await new Promise(r => setTimeout(r, 600));
        const match = _DEV_ACCOUNTS.find(
          a => a.email === email.trim().toLowerCase() && a.password === password,
        );
        if (!match) {
          setError('Incorrect email or password.');
          setLoading(false);
          return;
        }
        pendingSession.current = {
          token:    'dev_operator_token',
          userId:   match.userId,
          tenantId: 'dev_tenant',
          email:    match.email,
          loginAt:  new Date().toISOString(),
        };
      }

      setLoading(false);
      setStep('otp');
    } catch {
      setError('Unable to connect. Please try again.');
      setLoading(false);
    }
  }

  // ── Step 2 — verify OTP ───────────────────────────────────────────────────
  async function handleOtp(e: FormEvent) {
    e.preventDefault();
    if (otp.length < 6) { setError('Enter the 6-digit code.'); return; }
    setError('');
    setLoading(true);

    try {
      if (API_BASE) {
        const resp = await fetch(`${API_BASE}/v1/operator/auth/verify-otp`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            sessionToken: pendingSession.current?.token,
            otp,
          }),
        });

        const json = await resp.json() as {
          data?:  { token: string };
          error?: { message: string } | null;
        };

        if (!resp.ok || !json.data) {
          setError('Incorrect code. Try again.');
          setLoading(false);
          return;
        }

        const session: OperatorSession = {
          ...pendingSession.current!,
          token: json.data.token,
        };
        sessionStorage.setItem(OPERATOR_SESSION_KEY, JSON.stringify(session));
      } else {
        // Dev fallback — any 6-digit code works
        await new Promise(r => setTimeout(r, 500));
        if (!/^\d{6}$/.test(otp)) {
          setError('Enter a 6-digit numeric code.');
          setLoading(false);
          return;
        }
        sessionStorage.setItem(
          OPERATOR_SESSION_KEY,
          JSON.stringify(pendingSession.current!),
        );
      }

      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 500);
    } catch {
      setError('Unable to connect. Please try again.');
      setLoading(false);
    }
  }

  // ── Auto-submit OTP when 6 digits entered ─────────────────────────────────
  function handleOtpChange(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 6);
    setOtp(digits);
    setError('');
    if (digits.length === 6) {
      // Trigger submit on next tick
      setTimeout(() => {
        (document.getElementById('otp-form') as HTMLFormElement | null)?.requestSubmit();
      }, 50);
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col" style={{
      backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)',
      backgroundSize: '28px 28px',
    }}>

      {/* Top bar */}
      <header className="h-14 border-b border-white/5 flex items-center px-6 shrink-0 backdrop-blur-sm">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600">
            <Zap size={13} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm tracking-tight">RFConnector</span>
        </Link>
        <span className="ml-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600 border border-slate-800 rounded px-2 py-0.5">
          Operator Console
        </span>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {step === 'credentials' ? (
            <>
              <div className="mb-8">
                <h1 className="text-xl font-bold text-white mb-1">Sign in</h1>
                <p className="text-sm text-slate-500">Operator back-office</p>
              </div>

              <form onSubmit={handleCredentials} className="space-y-4">

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      type="email" required autoComplete="email"
                      value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-400">Password</label>
                    <button type="button" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      type={showPwd ? 'text' : 'password'} required autoComplete="current-password"
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-9 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
                    />
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showPwd ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5">
                    <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-300">{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                    loading ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/20'
                  }`}
                >
                  {loading ? (
                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg> Verifying…</>
                  ) : (
                    <>Continue <ArrowRight size={13} /></>
                  )}
                </button>
              </form>

              <p className="text-xs text-slate-700 mt-6 text-center">
                No account?{' '}
                <Link to="/register" className="text-slate-500 hover:text-slate-300 transition-colors">
                  Request access →
                </Link>
              </p>

              {/* Dev hint */}
              {import.meta.env.DEV && (
                <div className="mt-6 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-3">
                    Dev — demo accounts
                  </p>
                  {_DEV_ACCOUNTS.map(a => (
                    <button key={a.email} type="button"
                      onClick={() => { setEmail(a.email); setPassword(a.password); }}
                      className="w-full text-left rounded-lg px-3 py-2 mb-1.5 last:mb-0 bg-white/5 hover:bg-white/10 transition-colors group">
                      <p className="text-xs font-medium text-slate-300 group-hover:text-white">{a.name}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5 font-mono">{a.email}</p>
                    </button>
                  ))}
                  <p className="text-[10px] text-slate-600 mt-2 text-center">
                    Password: <span className="font-mono text-slate-500">admin1234</span>
                  </p>
                </div>
              )}
            </>
          ) : (
            /* ── Step 2 — OTP ─────────────────────────────────────────────── */
            <>
              <div className="mb-8 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center mb-4">
                  <ShieldCheck size={20} className="text-brand-400" />
                </div>
                <h1 className="text-xl font-bold text-white mb-1">Two-factor authentication</h1>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Enter the 6-digit code from your<br />authenticator app.
                </p>
                <p className="text-xs text-slate-600 mt-2 font-mono">{email}</p>
              </div>

              <form id="otp-form" onSubmit={handleOtp} className="space-y-4">

                {/* OTP input */}
                <div>
                  <input
                    ref={otpRef}
                    type="text" inputMode="numeric" autoComplete="one-time-code"
                    value={otp} onChange={e => handleOtpChange(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className={`w-full rounded-xl bg-white/5 border text-center py-4 text-2xl font-mono tracking-[0.5em] text-white placeholder:text-slate-700 focus:outline-none transition-colors ${
                      success ? 'border-emerald-500' : 'border-white/10 focus:border-brand-500'
                    }`}
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5">
                    <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-300">{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading || success || otp.length < 6}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                    success           ? 'bg-emerald-600 text-white' :
                    loading           ? 'bg-slate-800 text-slate-500 cursor-not-allowed' :
                    otp.length < 6    ? 'bg-slate-800 text-slate-600 cursor-not-allowed' :
                                        'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/20'
                  }`}
                >
                  {success ? (
                    <><CheckCircle size={14} /> Redirecting…</>
                  ) : loading ? (
                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg> Verifying…</>
                  ) : (
                    <>Verify &amp; sign in <ArrowRight size={13} /></>
                  )}
                </button>

                <button type="button" onClick={() => { setStep('credentials'); setOtp(''); setError(''); }}
                  className="w-full text-xs text-slate-600 hover:text-slate-400 transition-colors py-1">
                  ← Back to login
                </button>
              </form>

              {/* Dev hint */}
              {import.meta.env.DEV && (
                <div className="mt-6 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-1">Dev mode</p>
                  <p className="text-xs text-slate-500">
                    Any 6-digit code works — e.g.{' '}
                    <button type="button" onClick={() => handleOtpChange('123456')}
                      className="font-mono text-brand-400 hover:text-brand-300">
                      123456
                    </button>
                  </p>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
