import { NavLink } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { routes } from '@/app/routes';

const navRoutes = routes.filter((r) => r.layout === 'app' && r.navLabel && r.path !== '/settings');

interface NavListProps {
  onNavigate?: () => void;
  expanded?: boolean;
}

export default function NavList({ onNavigate, expanded = true }: NavListProps) {
  return (
    <nav className="space-y-1 py-1">
      {navRoutes.map((r) => {
        const Icon = (Icons as any)[r.navIcon ?? 'Circle'] ?? Icons.Circle;
        return (
          <NavLink
            key={r.path}
            to={r.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                'group relative flex items-center gap-3 rounded-[4px] px-3 py-2 text-14 font-medium transition-colors duration-150',
                isActive
                  ? 'bg-[#161616] text-[#D4FF3A] border-l-2 border-[#D4FF3A]'
                  : 'text-[#8A8A8A] hover:bg-[#111111] hover:text-[#F5F5F5]',
              ].join(' ')
            }
          >
            <Icon size={16} className="shrink-0" />
            {expanded && (
              <span className="truncate whitespace-nowrap">
                {r.navLabel}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
