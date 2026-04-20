import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Portfolio } from './pages/Portfolio';
import { Orcamentos } from './pages/Orcamentos';
import { Usuarios } from './pages/Usuarios';
import './index.css';

function ProtectedApp() {
  const { user, loading, login, logout } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <span className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login onLogin={login} />} />
      <Route path="/*" element={
        !user ? <Navigate to="/login" replace /> : (
          <Layout user={user} onLogout={logout}>
            <Routes>
              <Route path="/"           element={<Dashboard />} />
              <Route path="/portfolio"  element={<Portfolio />} />
              <Route path="/orcamentos" element={<Orcamentos />} />
              <Route path="/usuarios"   element={<Usuarios />} />
              <Route path="*"           element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        )
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a2e', color: '#f1f1f3', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' } }} />
      <ProtectedApp />
    </BrowserRouter>
  );
}
