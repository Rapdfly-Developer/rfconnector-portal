import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Zap, CheckCircle, ArrowRight, Globe, Building2,
  Mail, ChevronDown, X, Lock, Phone,
} from 'lucide-react';

const REGIONS = [
  { value: 'AF',     label: 'Africa / Ghana',  flag: '🇬🇭', note: 'Ghana DPA 2012' },
  { value: 'EU',     label: 'European Union',  flag: '🇪🇺', note: 'GDPR compliant'  },
  { value: 'SA',     label: 'South America',   flag: '🌎', note: 'LGPD compliant'  },
  { value: 'GLOBAL', label: 'Global',          flag: '🌍', note: 'No restriction'  },
];

// Sandbox removed — API keys require a paid license
const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$99',
    period: '/mo',
    features: ['50 chargers', '5k sessions/mo', 'Email support', 'Production access', 'Roaming Marketplace', 'OCPI 2.2 + eMIP', 'EVSE Repository', 'Tariff Exchange'],
    highlight: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$299',
    period: '/mo',
    features: ['500 chargers', '50k sessions/mo', 'Priority email + chat', 'CDR Exchange', 'Eichrecht CDR signing', 'Check & Bill', 'Dispute Management', 'Invoicing module', 'Supervision Dashboard'],
    highlight: true,
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: ['Unlimited chargers', 'Unlimited sessions', 'Dedicated support + SLA', 'Full roaming suite', 'In-platform Messaging', 'GDPR / Ghana DPA', 'Custom data residency', 'SSO + audit logs', 'Multi-region failover'],
    highlight: false,
  },
];

const COMPARISON = [
  { feature: 'Chargers',               starter: '50',      growth: '500',       enterprise: 'Unlimited' },
  { feature: 'Sessions / mo',          starter: '5 000',   growth: '50 000',    enterprise: 'Unlimited' },
  { feature: 'OCPP 1.6J + 2.0.1',     starter: true,      growth: true,        enterprise: true },
  { feature: 'OCPI 2.2',               starter: true,      growth: true,        enterprise: true },
  { feature: 'eMIP protocol',          starter: true,      growth: true,        enterprise: true },
  { feature: 'Real-time wallet',       starter: true,      growth: true,        enterprise: true },
  { feature: 'Roaming Marketplace',    starter: true,      growth: true,        enterprise: true },
  { feature: 'EVSE Repository',        starter: true,      growth: true,        enterprise: true },
  { feature: 'Tariff Exchange',        starter: true,      growth: true,        enterprise: true },
  { feature: 'CDR Exchange',           starter: false,     growth: true,        enterprise: true },
  { feature: 'Eichrecht CDR',          starter: false,     growth: true,        enterprise: true },
  { feature: 'CDRi (live energy)',      starter: false,     growth: true,        enterprise: true },
  { feature: 'Check & Bill',           starter: false,     growth: true,        enterprise: true },
  { feature: 'Dispute Management',     starter: false,     growth: true,        enterprise: true },
  { feature: 'Invoicing module',       starter: false,     growth: true,        enterprise: true },
  { feature: 'Supervision Dashboard',  starter: false,     growth: true,        enterprise: true },
  { feature: 'In-platform Messaging',  starter: false,     growth: false,       enterprise: true },
  { feature: 'GDPR / Ghana DPA',       starter: false,     growth: false,       enterprise: true },
  { feature: 'SLA',                    starter: false,     growth: false,       enterprise: true },
];

type Step = 'form' | 'success';

function Cell({ val }: { val: boolean | string }) {
  if (typeof val === 'boolean') {
    return val
      ? <CheckCircle size={14} className="text-charge-400 mx-auto" />
      : <X size={14} className="text-slate-700 mx-auto" />;
  }
  return <span className="text-xs text-slate-300 font-medium">{val}</span>;
}

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep]       = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [regionOpen, setRegionOpen]       = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const [form, setForm] = useState({
    company: '',
    email:   '',
    phone:   '',
    website: '',
    region:  'AF',
    plan:    'growth',       // default to Growth (most popular paid plan)
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedRegion = REGIONS.find(r => r.value === form.region)!;
  const selectedPlan   = PLANS.find(p => p.id === form.plan)!;

  function validate() {
    const e: Record<string, string> = {};
    if (!form.company.trim()) e['company'] = 'Company name is required';
    if (!form.email.trim())   e['email']   = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e['email'] = 'Enter a valid email';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await fetch('/api/v1/tenants/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
    } catch {
      // backend not yet connected — proceed with mock
    }
    await new Promise(r => setTimeout(r, 1200));

    // Store tenant info WITHOUT an API key — key is issued after license confirmation
    localStorage.setItem('cb_tenant', JSON.stringify({
      company: form.company,
      email:   form.email,
      region:  form.region,
      plan:    form.plan,
      status:  'pending_license',
    }));

    setLoading(false);
    setStep('success');
  }

  // ── Success screen ─────────────────────────────────────────────────────────

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-16 noise-bg">
        <div className="w-full max-w-lg animate-fade-in">
          <div className="rounded-2xl gradient-border bg-slate-900 p-8 shadow-2xl">

            {/* Icon + heading */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-brand-500/15 flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-brand-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Application received!</h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                Thank you, <span className="text-white font-medium">{form.company}</span>. Our team will review your application and confirm your <span className="text-brand-300 font-medium">{selectedPlan.name}</span> license within <span className="text-white font-medium">24 hours</span>.
              </p>
            </div>

            {/* What happens next */}
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 mb-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">What happens next</p>
              <ol className="space-y-3">
                {[
                  { step: '1', text: 'License confirmation email sent to ' + form.email },
                  { step: '2', text: 'Complete payment via the secure link in that email' },
                  { step: '3', text: 'API key and onboarding guide sent to your inbox' },
                  { step: '4', text: 'Connect your first charger — we\'re here to help' },
                ].map(({ step: s, text }) => (
                  <li key={s} className="flex items-start gap-3">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-[10px] font-bold text-brand-400">{s}</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{text}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* API key locked notice */}
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 mb-6">
              <Lock size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-300 mb-0.5">API key pending license activation</p>
                <p className="text-xs text-slate-400">Your API key will be generated and sent to <span className="text-slate-200">{form.email}</span> once your payment is confirmed. It will not be shown here.</p>
              </div>
            </div>

            {/* Account pills */}
            <div className="grid grid-cols-3 gap-3 mb-6 text-center text-xs">
              {[
                { label: 'Region', value: `${selectedRegion.flag} ${selectedRegion.label}` },
                { label: 'Plan',   value: selectedPlan.name },
                { label: 'Status', value: '⏳ Pending' },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-slate-800 p-2.5 border border-slate-700">
                  <p className="text-slate-500 mb-1">{label}</p>
                  <p className="text-slate-200 font-medium truncate">{value}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/20"
              >
                Go to Dashboard <ArrowRight size={15} />
              </button>
              <Link
                to="/"
                className="w-full flex items-center justify-center rounded-xl border border-slate-700 py-3 text-sm text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-colors"
              >
                Back to home
              </Link>
            </div>

          </div>

          {/* Support note */}
          <p className="text-center text-xs text-slate-600 mt-5">
            Questions?{' '}
            <a href="mailto:hello@rfconnector.io" className="text-brand-400 hover:text-brand-300 transition-colors">
              hello@rfconnector.io
            </a>
          </p>
        </div>
      </div>
    );
  }

  // ── Registration form ──────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-950 noise-bg">
      {/* Top bar */}
      <div className="border-b border-slate-800 px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600">
            <Zap size={13} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm">RFConnector</span>
        </Link>
        <span className="text-xs text-slate-500">
          Already licensed?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300">Sign in</Link>
        </span>
      </div>

      <div className="flex min-h-[calc(100vh-57px)]">

        {/* Left panel */}
        <div className="hidden lg:flex lg:w-96 shrink-0 flex-col bg-slate-900/50 border-r border-slate-800 p-10">
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-2">Licensed access</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-10">
              Register your operator account and select a plan. Our team activates your license and emails your API key — usually within 24 hours.
            </p>
            <ul className="space-y-4">
              {[
                'License reviewed and confirmed by our team',
                'API key emailed after activation',
                'OCPP 1.6J + 2.0.1 support',
                'OCPI 2.2 + eMIP protocols',
                'Roaming Marketplace access',
                'Real-time wallet engine',
                'CDR Exchange + Eichrecht',
                'GDPR & Ghana DPA compliant',
                'Supervision Dashboard',
                'Multi-tenant from day one',
              ].map(text => (
                <li key={text} className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle size={14} className="text-charge-400 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto rounded-xl bg-slate-800/60 border border-slate-700/50 p-4">
            <p className="text-xs text-slate-500 mb-1">Serving EV operators in</p>
            <p className="text-sm font-medium text-slate-200">🇬🇭 Ghana · 🇪🇺 Europe · 🌎 LatAm · 🌍 Global</p>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 flex flex-col items-center justify-start px-4 py-12 overflow-y-auto">
          <div className="w-full max-w-2xl animate-fade-in">
            <h1 className="text-2xl font-bold text-white mb-1">Request access</h1>
            <p className="text-slate-400 text-sm mb-8">
              Fill in your details and select a plan. Your API key is issued after license confirmation — not before.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Company */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  <Building2 size={11} className="inline mr-1.5 mb-0.5" />Company / App name
                </label>
                <input
                  type="text"
                  value={form.company}
                  onChange={e => { setForm(f => ({ ...f, company: e.target.value })); setErrors(v => ({ ...v, company: '' })); }}
                  placeholder="Acme EV Inc."
                  className={`w-full rounded-xl bg-slate-800 border ${errors['company'] ? 'border-red-500/60' : 'border-slate-700'} px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition-colors`}
                />
                {errors['company'] && <p className="mt-1 text-xs text-red-400">{errors['company']}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  <Mail size={11} className="inline mr-1.5 mb-0.5" />Work email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(v => ({ ...v, email: '' })); }}
                  placeholder="you@company.com"
                  className={`w-full rounded-xl bg-slate-800 border ${errors['email'] ? 'border-red-500/60' : 'border-slate-700'} px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition-colors`}
                />
                {errors['email'] && <p className="mt-1 text-xs text-red-400">{errors['email']}</p>}
              </div>

              {/* Phone (optional) */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  <Phone size={11} className="inline mr-1.5 mb-0.5" />Phone number <span className="text-slate-600">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+233 20 000 0000"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              {/* Region */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  <Globe size={11} className="inline mr-1.5 mb-0.5" />Data residency region
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRegionOpen(!regionOpen)}
                    className="w-full flex items-center justify-between rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span>{selectedRegion.flag}</span>
                      <span>{selectedRegion.label}</span>
                      <span className="text-xs text-slate-500">({selectedRegion.note})</span>
                    </span>
                    <ChevronDown size={15} className={`text-slate-400 transition-transform ${regionOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {regionOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 rounded-xl bg-slate-800 border border-slate-700 shadow-xl z-10 overflow-hidden">
                      {REGIONS.map(r => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => { setForm(f => ({ ...f, region: r.value })); setRegionOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-slate-700 transition-colors ${form.region === r.value ? 'bg-brand-500/10 text-brand-300' : 'text-slate-300'}`}
                        >
                          <span>{r.flag}</span>
                          <span>{r.label}</span>
                          <span className="ml-auto text-xs text-slate-500">{r.note}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Plan */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-slate-400">License plan</label>
                  <button
                    type="button"
                    onClick={() => setShowComparison(v => !v)}
                    className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    {showComparison ? 'Hide comparison' : 'Compare plans →'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PLANS.map(plan => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, plan: plan.id }))}
                      className={`relative rounded-xl border p-4 text-left transition-all ${
                        form.plan === plan.id
                          ? 'border-brand-500 bg-brand-500/10'
                          : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      {plan.popular && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-2.5 py-0.5 text-[10px] font-semibold text-white whitespace-nowrap">
                          Most popular
                        </span>
                      )}
                      <p className="text-sm font-semibold text-white mb-0.5">{plan.name}</p>
                      <p className="text-sm font-bold text-charge-400">{plan.price}<span className="text-xs text-slate-500 font-normal">{plan.period}</span></p>
                    </button>
                  ))}
                </div>

                {/* Selected plan features */}
                <div className="mt-3 rounded-xl bg-slate-800/50 border border-slate-700/50 p-4">
                  <p className="text-xs font-semibold text-slate-400 mb-2">{selectedPlan.name} includes:</p>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {selectedPlan.features.map(f => (
                      <li key={f} className="flex items-center gap-1.5 text-xs text-slate-300">
                        <CheckCircle size={11} className="text-charge-400 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedPlan.id === 'enterprise' && (
                  <p className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                    <Mail size={11} />
                    Enterprise plan requires a call — we'll reach out to discuss your requirements.
                  </p>
                )}
              </div>

              {/* Plan comparison table */}
              {showComparison && (
                <div className="rounded-xl border border-slate-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-700 bg-slate-800">
                          <th className="text-left px-4 py-3 text-slate-400 font-medium">Feature</th>
                          {PLANS.map(p => (
                            <th key={p.id} className={`px-3 py-3 text-center font-semibold ${form.plan === p.id ? 'text-brand-300' : 'text-slate-400'}`}>
                              {p.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {COMPARISON.map(({ feature, starter, growth, enterprise }, i) => (
                          <tr key={feature} className={`border-b border-slate-800 ${i % 2 === 0 ? 'bg-slate-900/20' : ''}`}>
                            <td className="px-4 py-2.5 text-slate-400">{feature}</td>
                            <td className="px-3 py-2.5 text-center"><Cell val={starter} /></td>
                            <td className="px-3 py-2.5 text-center"><Cell val={growth} /></td>
                            <td className="px-3 py-2.5 text-center"><Cell val={enterprise} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* License notice */}
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <Lock size={13} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400">
                  Your API key will be <span className="text-amber-300 font-medium">emailed to you after license activation</span> — it will not be shown on screen. Keep your registered email accessible.
                </p>
              </div>

              {/* Terms */}
              <p className="text-xs text-slate-500">
                By submitting you agree to our{' '}
                <a href="#" className="text-brand-400 hover:underline">Terms of Service</a> and{' '}
                <a href="#" className="text-brand-400 hover:underline">Privacy Policy</a>.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-600/20"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting application…
                  </>
                ) : (
                  <>Request Access <ArrowRight size={15} /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
