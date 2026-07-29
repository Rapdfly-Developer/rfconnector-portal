import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PORTAL_TYPE } from './lib/hostConfig.ts';
import { CLIENT_SESSION_KEY } from './pages/ClientLogin.tsx';
import { OPERATOR_SESSION_KEY } from './pages/DeveloperLogin.tsx';

// ── Page imports ──────────────────────────────────────────────────────────────
import Home              from './pages/Home.tsx';
import Register          from './pages/Register.tsx';
import ClientPortal      from './pages/ClientPortal.tsx';
import ClientLogin       from './pages/ClientLogin.tsx';
import DeveloperLogin    from './pages/DeveloperLogin.tsx';
import OperatorDashboard from './pages/OperatorDashboard.tsx';

// ── Auth guards ───────────────────────────────────────────────────────────────

function RequireOperatorAuth({ children }: { children: React.ReactNode }) {
  const raw = sessionStorage.getItem(OPERATOR_SESSION_KEY);
  if (!raw) return <Navigate to="/login" replace />;
  try {
    const s = JSON.parse(raw) as { token?: string };
    if (!s.token) return <Navigate to="/login" replace />;
  } catch { return <Navigate to="/login" replace />; }
  return <>{children}</>;
}

function RequireClientAuth({ children }: { children: React.ReactNode }) {
  const raw =
    sessionStorage.getItem(CLIENT_SESSION_KEY) ??
    localStorage.getItem(CLIENT_SESSION_KEY);

  const loginPath = PORTAL_TYPE === 'client' ? '/login' : '/client-login';

  if (!raw) return <Navigate to={loginPath} replace />;

  try {
    const session = JSON.parse(raw) as { token?: string };
    if (!session.token) return <Navigate to={loginPath} replace />;
  } catch {
    return <Navigate to={loginPath} replace />;
  }

  return <>{children}</>;
}

// ── CLIENT PORTAL host  (portal.chargebridge.io) ─────────────────────────────
//
//   /         →  ClientPortal  (guarded — redirects to /login if not authed)
//   /login    →  ClientLogin
//   *         →  /

function ClientPortalApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<ClientLogin />} />
        <Route
          path="/"
          element={
            <RequireClientAuth>
              <ClientPortal />
            </RequireClientAuth>
          }
        />
        {/* Catch-all → root (guarded, so unauthenticated → /login) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// ── OPERATOR DASHBOARD host  (app.chargebridge.io) ───────────────────────────
//
//   /              →  Home (marketing)
//   /register      →  Register
//   /login         →  DeveloperLogin
//   /dashboard     →  Dashboard
//   *              →  /

function OperatorDashboardApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/login"     element={<DeveloperLogin />} />
        <Route path="/dashboard" element={<RequireOperatorAuth><OperatorDashboard /></RequireOperatorAuth>} />

        {/* Client portal login — accessible from the landing page portal chooser */}
        <Route path="/client-login" element={<ClientLogin />} />

        {/* Client portal — guarded, redirects to /client-login if not authed */}
        <Route path="/client" element={<RequireClientAuth><ClientPortal /></RequireClientAuth>} />

        {/* Legacy redirects */}
        <Route path="/dashboard/login" element={<Navigate to="/login"       replace />} />
        <Route path="/client/login"    element={<Navigate to="/client-login" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// ── Root — pick routing tree by host ─────────────────────────────────────────

export default function App() {
  return PORTAL_TYPE === 'client'
    ? <ClientPortalApp />
    : <OperatorDashboardApp />;
}
