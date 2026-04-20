import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Images, FileText, Users, LogOut, PaintBucket, Menu, X } from 'lucide-react';
import { useState } from 'react';
import type { AuthUser } from '../hooks/useAuth';

const NAV = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/portfolio', icon: Images,          label: 'Portfólio'  },
  { to: '/orcamentos',icon: FileText,        label: 'Orçamentos' },
  { to: '/usuarios',  icon: Users,           label: 'Usuários'   },
];

export function Layout({ children, user, onLogout }: { children: React.ReactNode; user: AuthUser; onLogout: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0a0a0f]">
      {/* Sidebar overlay (mobile) */}
      {open && <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#111118] border-r border-white/5 z-30 flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
            <PaintBucket size={18} className="text-black" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 leading-none">Painel Admin</p>
            <p className="text-sm font-bold text-white leading-tight">A.C & T.C Pinturas</p>
          </div>
          <button onClick={() => setOpen(false)} className="ml-auto lg:hidden text-zinc-500 hover:text-white"><X size={18} /></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                 ${isActive
                   ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                   : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'}`
              }>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
              <span className="text-amber-400 font-bold text-sm">{user.name[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-200 truncate">{user.name}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
            </div>
            <button onClick={onLogout} className="text-zinc-500 hover:text-red-400 transition-colors" title="Sair">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[#111118] border-b border-white/5 sticky top-0 z-10">
          <button onClick={() => setOpen(true)} className="text-zinc-400 hover:text-white"><Menu size={20} /></button>
          <span className="text-sm font-bold text-white">Painel Admin</span>
        </header>

        <main className="flex-1 p-5 lg:p-7 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
