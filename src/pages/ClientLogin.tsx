/**
 * ChargeBridge — Client Portal Login
 * Route: /login  (on portal.chargebridge.io)
 *
 * Step 1 — email + password
 * Step 2 — 6-digit TOTP (2FA)
 */
import { useState, FormEvent, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PORTAL_TYPE } from '../lib/hostConfig.ts';
import {
  Zap, Mail, Lock, Eye, EyeOff, ArrowRight,
  AlertCircle, CheckCircle, Activity, FileText,
  Receipt, BarChart3, ShieldCheck, Sun, Moon,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

// ── Session storage contract (shared with App.tsx guard) ─────────────────────

export const CLIENT_SESSION_KEY = 'cb_client_session';

export interface ClientSession {
  token:    string;
  userId:   string;
  tenantId: string;
  role:     string;
  fullName: string | null;
  email:    string;
  company:  string;
  loginAt:  string;
}

// ── Dev fallback — never shown in UI ─────────────────────────────────────────

const _DEV_ACCOUNTS = [
  { email: 'demo@volta-networks.com', password: 'demo1234', role: 'admin',  fullName: 'Volta Networks' },
  { email: 'ops@powergrid.io',        password: 'demo1234', role: 'viewer', fullName: 'PowerGrid LatAm' },
  { email: 'client@rfconnector.io',  password: 'demo1234', role: 'admin',  fullName: 'RFConnector' },
];

const API_BASE = import.meta.env.VITE_API_URL ?? '';

// ── What clients see in the portal (brief, honest) ────────────────────────────

const PORTAL_FEATURES = [
  { icon: Activity,  label: 'Live sessions',  desc: 'Track active charging sessions in real time' },
  { icon: FileText,  label: 'CDR & billing',  desc: 'Full charge detail records with Eichrecht sign-off' },
  { icon: Receipt,   label: 'Invoicing',       desc: 'Monthly invoices and outstanding balance at a glance' },
  { icon: BarChart3, label: 'Usage analytics', desc: 'Energy, cost and session trends across all sites' },
];

type Step = 'credentials' | 'otp';

// ── Component ─────────────────────────────────────────────────────────────────

export default function ClientLogin() {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();

  // Step 1
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [remember, setRemember] = useState(false);

  // Step 2
  const [otp,    setOtp]    = useState('');
  const otpRef = useRef<HTMLInputElement>(null);

  // Shared
  const [step,    setStep]    = useState<Step>('credentials');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  // Partial session held between steps
  const pendingSession = useRef<ClientSession | null>(null);

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
        const resp = await fetch(`${API_BASE}/v1/client/auth/login`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email: email.trim(), password }),
        });

        if (resp.status === 429) {
          const after = resp.headers.get('Retry-After') ?? '60';
          setError(`Too many attempts. Try again in ${after} seconds.`);
          setLoading(false);
          return;
        }

        const json = await resp.json() as {
          data?:  { sessionId: string; user: { id: string; tenantId: string; role: string; fullName: string | null } };
          error?: { message: string } | null;
        };

        if (!resp.ok || !json.data) {
          setError('Incorrect email or password.');
          setLoading(false);
          return;
        }

        pendingSession.current = {
          token:    json.data.sessionId,
          userId:   json.data.user.id,
          tenantId: json.data.user.tenantId,
          role:     json.data.user.role,
          fullName: json.data.user.fullName,
          email:    email.trim().toLowerCase(),
          company:  json.data.user.fullName ?? 'Client account',
          loginAt:  new Date().toISOString(),
        };
      } else {
        // Dev fallback
        await new Promise(r => setTimeout(r, 700));
        const match = _DEV_ACCOUNTS.find(
          a => a.email === email.trim().toLowerCase() && a.password === password,
        );
        if (!match) {
          setError('Incorrect email or password.');
          setLoading(false);
          return;
        }
        pendingSession.current = {
          token: 'dev_token', userId: `dev_${match.email}`,
          tenantId: 'dev_tenant', role: match.role,
          fullName: match.fullName,
          email: match.email,
          company: match.fullName,
          loginAt: new Date().toISOString(),
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
        const resp = await fetch(`${API_BASE}/v1/client/auth/verify-otp`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ sessionToken: pendingSession.current?.token, otp }),
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

        const session: ClientSession = { ...pendingSession.current!, token: json.data.token };
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem(CLIENT_SESSION_KEY, JSON.stringify(session));
      } else {
        // Dev fallback — any 6-digit code
        await new Promise(r => setTimeout(r, 500));
        if (!/^\d{6}$/.test(otp)) {
          setError('Enter a 6-digit numeric code.');
          setLoading(false);
          return;
        }
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem(CLIENT_SESSION_KEY, JSON.stringify(pendingSession.current!));
      }

      setSuccess(true);
      setTimeout(() => navigate(PORTAL_TYPE === 'client' ? '/' : '/client'), 500);
    } catch {
      setError('Unable to connect. Please try again.');
      setLoading(false);
    }
  }

  // Auto-submit when 6 digits entered
  function handleOtpChange(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 6);
    setOtp(digits);
    setError('');
    if (digits.length === 6) {
      setTimeout(() => {
        (document.getElementById('client-otp-form') as HTMLFormElement | null)?.requestSubmit();
      }, 50);
    }
  }

  // ── Layout ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col noise-bg">

      {/* Top bar */}
      <header className="h-14 border-b border-slate-800/50 flex items-center justify-between px-6 shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600">
            <Zap size={13} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm">RFConnector</span>
        </Link>
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>

      <div className="flex flex-1">

        {/* ── Left panel — feature context (always visible, both steps) ───── */}
        <aside className="hidden lg:flex flex-col justify-center w-96 shrink-0 px-12 border-r border-slate-800/50 bg-slate-900/30">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-charge-400 mb-3">Client Portal</p>
            <h2 className="text-2xl font-bold text-white leading-snug mb-3">
              Your charging operations,<br />all in one place.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Monitor usage, review billing records, and track your roaming activity across every site.
            </p>
          </div>
          <ul className="space-y-5">
            {PORTAL_FEATURES.map(({ icon: Icon, label, desc }) => (
              <li key={label} className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={14} className="text-charge-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* ── Right panel ──────────────────────────────────────────────────── */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">

            {step === 'credentials' ? (
              /* ── Step 1: email + password ─────────────────────────────── */
              <>
                <div className="mb-7">
                  <h1 className="text-xl font-bold text-white mb-1">Sign in</h1>
                  <p className="text-sm text-slate-500">Client Portal access</p>
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
                        className="w-full rounded-xl bg-slate-800 border border-slate-700 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-charge-500 transition-colors"
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
                        className="w-full rounded-xl bg-slate-800 border border-slate-700 pl-9 pr-9 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-charge-500 transition-colors"
                      />
                      <button type="button" onClick={() => setShowPwd(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {showPwd ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember */}
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <div onClick={() => setRemember(v => !v)}
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                        remember ? 'bg-charge-500 border-charge-500' : 'bg-slate-800 border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      {remember && <CheckCircle size={11} className="text-white" />}
                    </div>
                    <span className="text-xs text-slate-500">Keep me signed in</span>
                  </label>

                  {error && (
                    <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5">
                      <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-300">{error}</p>
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                      loading ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                              : 'bg-charge-600 hover:bg-charge-500 text-white shadow-lg shadow-charge-500/20'
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Verifying…
                      </>
                    ) : (
                      <>Continue <ArrowRight size={13} /></>
                    )}
                  </button>
                </form>

                <p className="text-xs text-slate-700 mt-6 text-center">
                  Need access?{' '}
                  <a href="mailto:hello@rfconnector.io" className="text-slate-500 hover:text-slate-300 transition-colors">
                    Contact your operator
                  </a>
                </p>

                {/* Dev hint */}
                {import.meta.env.DEV && (
                  <div className="mt-6 rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-3">
                      Dev — demo accounts
                    </p>
                    {_DEV_ACCOUNTS.map(a => (
                      <button key={a.email} type="button"
                        onClick={() => { setEmail(a.email); setPassword(a.password); }}
                        className="w-full text-left rounded-lg px-3 py-2 mb-1.5 last:mb-0 bg-slate-800 hover:bg-slate-700 transition-colors group">
                        <p className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
                          {a.fullName}
                          <span className="ml-2 text-[10px] font-normal text-slate-500 uppercase">{a.role}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{a.email}</p>
                      </button>
                    ))}
                    <p className="text-[10px] text-slate-600 mt-2 text-center">
                      Password for all: <span className="font-mono text-slate-500">demo1234</span>
                    </p>
                  </div>
                )}
              </>
            ) : (
              /* ── Step 2: OTP ──────────────────────────────────────────── */
              <>
                <div className="mb-8 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-charge-500/15 border border-charge-500/25 flex items-center justify-center mb-4">
                    <ShieldCheck size={20} className="text-charge-400" />
                  </div>
                  <h1 className="text-xl font-bold text-white mb-1">Two-factor authentication</h1>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Enter the 6-digit code from your<br />authenticator app.
                  </p>
                  <p className="text-xs text-slate-600 mt-2 font-mono">{email}</p>
                </div>

                <form id="client-otp-form" onSubmit={handleOtp} className="space-y-4">

                  <input
                    ref={otpRef}
                    type="text" inputMode="numeric" autoComplete="one-time-code"
                    value={otp} onChange={e => handleOtpChange(e.target.value)}
                    placeholder="000000" maxLength={6}
                    className={`w-full rounded-xl bg-slate-800 border text-center py-4 text-2xl font-mono tracking-[0.5em] text-white placeholder:text-slate-700 focus:outline-none transition-colors ${
                      success ? 'border-charge-500' : 'border-slate-700 focus:border-charge-500'
                    }`}
                  />

                  {error && (
                    <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5">
                      <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-300">{error}</p>
                    </div>
                  )}

                  <button type="submit" disabled={loading || success || otp.length < 6}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                      success        ? 'bg-charge-600 text-white' :
                      loading        ? 'bg-slate-700 text-slate-400 cursor-not-allowed' :
                      otp.length < 6 ? 'bg-slate-700 text-slate-600 cursor-not-allowed' :
                                       'bg-charge-600 hover:bg-charge-500 text-white shadow-lg shadow-charge-500/20'
                    }`}
                  >
                    {success ? (
                      <><CheckCircle size={14} /> Redirecting…</>
                    ) : loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Verifying…
                      </>
                    ) : (
                      <>Verify &amp; sign in <ArrowRight size={13} /></>
                    )}
                  </button>

                  <button type="button"
                    onClick={() => { setStep('credentials'); setOtp(''); setError(''); }}
                    className="w-full text-xs text-slate-600 hover:text-slate-400 transition-colors py-1">
                    ← Back to login
                  </button>
                </form>

                {/* Dev hint */}
                {import.meta.env.DEV && (
                  <div className="mt-6 rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-3 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-1">Dev mode</p>
                    <p className="text-xs text-slate-500">
                      Any 6-digit code works — e.g.{' '}
                      <button type="button" onClick={() => handleOtpChange('123456')}
                        className="font-mono text-charge-400 hover:text-charge-300">
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
    </div>
  );
}
