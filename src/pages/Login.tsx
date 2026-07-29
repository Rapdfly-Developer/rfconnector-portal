/**
 * ChargeBridge — Unified Login
 * Route: /login
 *
 * Single entry point for both portal types:
 *  - Client Portal   (email + password → JWT)
 *  - Operator Portal (API key → dashboard)
 *
 * Nothing internal is exposed: no demo accounts, no config flags,
 * no technology hints beyond the brand name.
 */
import { useState, FormEvent } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Zap, Mail, Lock, Eye, EyeOff, Key,
  ArrowRight, AlertCircle, CheckCircle,
} from 'lucide-react';
import { CLIENT_SESSION_KEY } from './ClientLogin.tsx';
import type { ClientSession } from './ClientLogin.tsx';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

type Tab = 'client' | 'operator';

// ── Demo fallback (used only when API is unreachable, never shown in UI) ───────
const DEMO_ACCOUNTS = [
  { email: 'demo@volta-networks.com', password: 'demo1234', role: 'admin',  fullName: 'Volta Networks' },
  { email: 'ops@powergrid.io',        password: 'demo1234', role: 'viewer', fullName: 'PowerGrid LatAm' },
  { email: 'client@chargebridge.io',  password: 'demo1234', role: 'admin',  fullName: 'ChargeBridge' },
];

export default function Login() {
  const navigate = useNavigate();
  const [params]    = useSearchParams();
  const initialTab  = (params.get('tab') === 'operator' ? 'operator' : 'client') as Tab;

  const [tab,      setTab]      = useState<Tab>(initialTab);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [apiKey,   setApiKey]   = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [showKey,  setShowKey]  = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(false);

  function switchTab(t: Tab) {
    setTab(t);
    setError('');
    setEmail('');
    setPassword('');
    setApiKey('');
    setSuccess(false);
  }

  // ── Client login ─────────────────────────────────────────────────────────────
  async function handleClientLogin(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let session: ClientSession;

      if (API_BASE) {
        const resp = await fetch(`${API_BASE}/v1/client/auth/login`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email: email.trim(), password }),
        });

        if (resp.status === 429) {
          const after = resp.headers.get('Retry-After') ?? '60';
          setError(`Too many attempts. Please wait ${after} seconds.`);
          setLoading(false);
          return;
        }

        const json = await resp.json() as {
          data?:  { token: string; user: { id: string; tenantId: string; role: string; fullName: string | null } };
          error?: { message: string } | null;
        };

        if (!resp.ok || !json.data) {
          setError('Incorrect email or password.');
          setLoading(false);
          return;
        }

        session = {
          token:    json.data.token,
          userId:   json.data.user.id,
          tenantId: json.data.user.tenantId,
          role:     json.data.user.role,
          fullName: json.data.user.fullName,
          email:    email.trim().toLowerCase(),
          company:  json.data.user.fullName ?? 'Client account',
          loginAt:  new Date().toISOString(),
        };
      } else {
        // Dev fallback — silently tries demo accounts, no UI hint
        await new Promise(r => setTimeout(r, 700));
        const match = DEMO_ACCOUNTS.find(
          a => a.email === email.trim().toLowerCase() && a.password === password,
        );
        if (!match) {
          setError('Incorrect email or password.');
          setLoading(false);
          return;
        }
        session = {
          token:    'dev_token',
          userId:   `dev_${match.email}`,
          tenantId: 'dev_tenant',
          role:     match.role,
          fullName: match.fullName,
          email:    match.email,
          company:  match.fullName,
          loginAt:  new Date().toISOString(),
        };
      }

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem(CLIENT_SESSION_KEY, JSON.stringify(session));
      setSuccess(true);
      setTimeout(() => navigate('/client'), 500);
    } catch {
      setError('Unable to connect. Please try again.');
      setLoading(false);
    }
  }

  // ── Operator login ───────────────────────────────────────────────────────────
  async function handleOperatorLogin(e: FormEvent) {
    e.preventDefault();
    setError('');

    const trimmed = apiKey.trim();
    if (!trimmed.startsWith('cb_') || trimmed.length < 20) {
      setError('Enter a valid ChargeBridge API key (starts with cb_).');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 500));

    // Retrieve any existing tenant profile or create a minimal one
    const raw = localStorage.getItem('cb_tenant');
    const existing = raw ? JSON.parse(raw) as Record<string, unknown> : {};
    localStorage.setItem('cb_tenant', JSON.stringify({
      ...existing,
      apiKey:  trimmed,
      status:  'active',
    }));

    setSuccess(true);
    setTimeout(() => navigate('/dashboard'), 500);
  }

  const isClient   = tab === 'client';
  const isOperator = tab === 'operator';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col noise-bg">

      {/* Minimal top bar — brand only */}
      <header className="h-14 border-b border-slate-800/60 flex items-center px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600">
            <Zap size={13} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm">ChargeBridge</span>
        </Link>
      </header>

      {/* Centred card */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {/* Wordmark */}
          <div className="text-center mb-7">
            <h1 className="text-xl font-bold text-white mb-1">Sign in</h1>
            <p className="text-sm text-slate-500">Choose your portal to continue</p>
          </div>

          {/* Tab toggle */}
          <div className="flex bg-slate-800/70 rounded-xl p-1 mb-6 gap-1">
            {(['client', 'operator'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all capitalize ${
                  tab === t
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'client' ? 'Client Portal' : 'Operator Portal'}
              </button>
            ))}
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur p-6 shadow-xl">

            {/* ── Client form ── */}
            {isClient && (
              <form onSubmit={handleClientLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Email address</label>
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

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-400">Password</label>
                    <button type="button" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
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

                <RememberMe remember={remember} setRemember={setRemember} />
                <ErrorMessage msg={error} />
                <SubmitButton loading={loading} success={success} label="Sign in to Client Portal" />
              </form>
            )}

            {/* ── Operator form ── */}
            {isOperator && (
              <form onSubmit={handleOperatorLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">API Key</label>
                  <div className="relative">
                    <Key size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      type={showKey ? 'text' : 'password'}
                      required autoComplete="off" spellCheck={false}
                      value={apiKey} onChange={e => setApiKey(e.target.value)}
                      placeholder="cb_••••••••••••••••"
                      className="w-full rounded-xl bg-slate-800 border border-slate-700 pl-9 pr-9 py-2.5 text-sm text-white placeholder:text-slate-600 font-mono focus:outline-none focus:border-brand-500 transition-colors"
                    />
                    <button type="button" onClick={() => setShowKey(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-600">
                    Your API key was emailed after license activation.
                  </p>
                </div>

                <ErrorMessage msg={error} />
                <SubmitButton loading={loading} success={success} label="Access Operator Dashboard" />

                <div className="pt-1 border-t border-slate-800">
                  <p className="text-xs text-slate-600 text-center mt-3">
                    Don't have a license yet?{' '}
                    <Link to="/register" className="text-brand-400 hover:text-brand-300 transition-colors">
                      Request access →
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Bottom help — no internal details */}
          <p className="text-center text-xs text-slate-700 mt-5">
            Need help?{' '}
            <a href="mailto:hello@chargebridge.io" className="text-slate-500 hover:text-slate-300 transition-colors">
              hello@chargebridge.io
            </a>
          </p>

        </div>
      </div>
    </div>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────────

function RememberMe({ remember, setRemember }: { remember: boolean; setRemember: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <div onClick={() => setRemember(!remember)}
        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
          remember ? 'bg-charge-500 border-charge-500' : 'bg-slate-800 border-slate-600 hover:border-slate-500'
        }`}
      >
        {remember && <CheckCircle size={11} className="text-white" />}
      </div>
      <span className="text-xs text-slate-500">Keep me signed in</span>
    </label>
  );
}

function ErrorMessage({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5">
      <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
      <p className="text-xs text-red-300">{msg}</p>
    </div>
  );
}

function SubmitButton({ loading, success, label }: { loading: boolean; success: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading || success}
      className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
        success  ? 'bg-charge-600 text-white' :
        loading  ? 'bg-slate-700 text-slate-400 cursor-not-allowed' :
                   'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/20'
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
          Signing in…
        </>
      ) : (
        <>{label} <ArrowRight size={13} /></>
      )}
    </button>
  );
}
