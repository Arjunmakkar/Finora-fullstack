import { NavLink, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import NavList from './NavList';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/useAuth';

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();

  const initials = (user?.name || '?')
    .split(' ')
    .map((p: string) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const onLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => navigate('/login'),
    });
  };

  return (
    <aside
      className="hidden md:flex flex-col h-screen shrink-0 relative z-20 w-[240px] bg-[#0A0A0A] border-r border-[#262626] select-none"
    >
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center px-5 gap-2.5 border-b border-[#262626]">
        <div className="h-1.5 w-1.5 bg-[#D4FF3A] shrink-0" />
        <span className="font-display text-20 font-bold tracking-tight text-[#F5F5F5]">
          FINORA
        </span>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <NavList expanded={true} />
      </div>

      {/* Footer User Profile & Settings */}
      <div className="shrink-0 p-3 space-y-1.5 border-t border-[#262626] bg-[#0A0A0A]">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-[4px] px-3 py-2 text-14 font-medium transition-colors ${
              isActive
                ? 'bg-[#161616] text-[#D4FF3A]'
                : 'text-[#8A8A8A] hover:bg-[#111111] hover:text-[#F5F5F5]'
            }`
          }
          title="Settings"
        >
          <Icons.Settings size={16} className="shrink-0" />
          <span>Settings</span>
        </NavLink>

        {/* User Card with Logout */}
        <div className="flex items-center justify-between rounded-[4px] bg-[#111111] border border-[#262626] p-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-7 w-7 rounded-[2px] bg-[#161616] border border-[#333333] flex items-center justify-center text-12 font-medium text-[#F5F5F5] shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-12 font-medium text-[#F5F5F5]">{user?.name || 'Rohit Kumar'}</p>
              <p className="truncate text-[11px] text-[#8A8A8A]">{user?.email || 'demo@finora.app'}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 text-[#8A8A8A] hover:text-[#F5F5F5] transition-colors rounded-[2px]"
            aria-label="Sign out"
            title="Sign out"
          >
            <Icons.LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
