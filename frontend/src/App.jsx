import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ClientesPage from './pages/Clientes/ClientesPage';
import FuncionariosPage from './pages/Funcionarios/FuncionariosPage';
import EventosPage from './pages/Eventos/EventosPage';
import EstoquePage from './pages/Estoque/EstoquePage';
import OrcamentosPage from './pages/Orcamentos/OrcamentosPage';
import DocumentosPage from './pages/Documentos/DocumentosPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#fdfcf5' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#FEDC57', color: '#402d00' }}>
            <span className="material-symbols-outlined filled">celebration</span>
          </div>
          <p style={{ color: '#4a4639', fontSize: '14px' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function LoginRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  // Se já está logado, redireciona para o dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <LoginPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="funcionarios" element={<FuncionariosPage />} />
        <Route path="eventos" element={<EventosPage />} />
        <Route path="estoque" element={<EstoquePage />} />
        <Route path="orcamentos" element={<OrcamentosPage />} />
        <Route path="documentos" element={<DocumentosPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
