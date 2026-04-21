import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { to: '/', icon: 'dashboard', label: 'Dashboard' },
  { to: '/clientes', icon: 'group', label: 'Clientes' },
  { to: '/funcionarios', icon: 'badge', label: 'Colaboradores' },
  { to: '/orcamentos', icon: 'request_quote', label: 'Orçamentos' },
  { to: '/eventos', icon: 'event_available', label: 'Eventos' },
  { to: '/estoque', icon: 'inventory_2', label: 'Estoque' },
  { to: '/documentos', icon: 'description', label: 'Documentos' },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-full z-40 w-64 border-r border-outline-variant/30 bg-white flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm">
            <span className="material-symbols-outlined filled">celebration</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-on-surface leading-none font-headline">Mais Alegria</h1>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/70 mt-1">Festive Architect</p>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="space-y-1">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-full transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-primary text-on-primary font-bold shadow-md shadow-primary/20'
                    : 'text-on-surface-variant hover:bg-primary/10'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}>{icon}</span>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Profile */}
      <div className="mt-auto p-6 border-t border-outline-variant/30">
        <div className="flex items-center gap-3 p-3 bg-surface-container rounded-full">
          <div className="w-10 h-10 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center font-bold text-xs">
            {(user?.nome || 'Admin').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-bold text-on-surface truncate">{user?.nome || 'Admin'}</p>
            <p className="text-xs text-on-surface-variant truncate capitalize">{user?.role || 'admin'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
