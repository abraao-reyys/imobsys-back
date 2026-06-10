import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Building2, FileText, LayoutDashboard, LogOut, Users } from 'lucide-react';
import Button from './Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { cn } from '../utils/cn.js';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/imoveis', label: 'Imóveis', icon: Building2 },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/propostas', label: 'Propostas', icon: FileText }
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-bold text-slate-950">ImobSys</p>
              <p className="text-xs text-slate-500">{user?.nome || user?.email || 'Corretor'}</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="lg:hidden"
              onClick={handleLogout}
              title="Sair"
              aria-label="Sair"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
          <nav className="flex gap-1 overflow-x-auto">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition',
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
          <Button
            variant="secondary"
            icon={LogOut}
            className="hidden lg:inline-flex"
            onClick={handleLogout}
            title="Sair"
          >
            Sair
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <Outlet />
      </main>
    </div>
  );
}
