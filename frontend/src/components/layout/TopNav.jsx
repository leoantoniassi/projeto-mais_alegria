import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TopNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex justify-between items-center w-full px-8 h-16 sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-outline-variant/30">
      {/* Search */}
      <div className="flex items-center bg-surface-container-low px-4 py-2 rounded-full w-96 group focus-within:ring-2 focus-within:ring-primary transition-all">
        <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
        <input
          className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-full placeholder:text-on-surface-variant/60"
          placeholder="Pesquisar eventos, clientes..."
          type="text"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-on-surface-variant">
          <button className="hover:text-tertiary transition-all relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-white" />
          </button>
          <button className="hover:text-tertiary transition-all">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
        <div className="h-8 w-[1px] bg-outline-variant/30" />
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs">
            {(user?.nome || 'Admin').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <span className="font-bold text-on-surface font-headline text-sm">{(user?.nome || 'Admin').split(' ')[0]}</span>
          <button onClick={handleLogout} className="text-on-surface-variant hover:text-error transition-colors" title="Sair">
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
