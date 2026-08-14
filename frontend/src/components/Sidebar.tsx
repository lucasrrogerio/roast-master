import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Sprout,
  BookOpen,
  Flame,
  PackagePlus,
  Search,
  LogOut,
  MapPin,
  Coffee,
  Boxes,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'ROAST_MASTER', 'STOCKIST'] },
    { id: 'origins', label: 'Origens / Fazendas', icon: MapPin, roles: ['ADMIN', 'STOCKIST'] },
    { id: 'green-beans', label: 'Estoque Grão Cru', icon: Sprout, roles: ['ADMIN', 'STOCKIST', 'ROAST_MASTER'] },
    { id: 'profiles', label: 'Perfis de Torra', icon: BookOpen, roles: ['ADMIN', 'ROAST_MASTER'] },
    { id: 'roasting', label: 'Batida de Torra', icon: Flame, roles: ['ADMIN', 'ROAST_MASTER'] },
    { id: 'products', label: 'Produtos (SKUs)', icon: Boxes, roles: ['ADMIN', 'STOCKIST'] },
    { id: 'packaging', label: 'Empacotamento', icon: PackagePlus, roles: ['ADMIN', 'STOCKIST'] },
    { id: 'traceability', label: 'Rastreabilidade', icon: Search, roles: ['ADMIN', 'ROAST_MASTER', 'STOCKIST'] },
  ];

  const roleLabel = {
    ADMIN: 'Administrador',
    ROAST_MASTER: 'Mestre de Torra',
    STOCKIST: 'Estoquista',
  }[user?.role || 'ADMIN'];

  return (
    <aside className="w-64 bg-stone-900 text-stone-300 flex flex-col shrink-0 border-r border-stone-800">
      {/* Brand */}
      <div className="p-5 border-b border-stone-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-950">
          <Flame className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-stone-100 text-lg leading-tight">Roast Master</h1>
          <p className="text-xs text-amber-500 font-semibold tracking-wide uppercase">Controle Fabril</p>
        </div>
      </div>

      {/* User Info */}
      <div className="px-5 py-4 border-b border-stone-800/60 bg-stone-950/40">
        <p className="text-xs text-stone-400 font-medium">Conectado como</p>
        <p className="font-semibold text-stone-200 truncate">{user?.name}</p>
        <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-stone-800 text-amber-400 font-medium border border-amber-900/40">
          {roleLabel}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems
          .filter((item) => user && item.roles.includes(user.role))
          .map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-colors text-left ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-sm shadow-amber-900 font-semibold'
                    : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-stone-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-stone-400 hover:text-red-400 hover:bg-stone-800/80 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Sair da conta</span>
        </button>
      </div>
    </aside>
  );
};
