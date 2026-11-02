import { useNavigate, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { routes } from '@/app/routes';

const navRoutes = routes.filter((r) => r.layout === 'app' && r.navLabel && r.path !== '/settings');

interface NavListProps {
  onNavigate?: () => void;
  expanded?: boolean;
}

export default function NavList({ onNavigate, expanded = true }: NavListProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleItemClick = (path: string) => {
    if (onNavigate) {
      onNavigate();
    }
    navigate(path);
  };

  return (
    <nav className="space-y-1 py-1 select-none" aria-label="Main Navigation">
      {navRoutes.map((r) => {
        const Icon = (Icons as any)[r.navIcon ?? 'Circle'] ?? Icons.Circle;
        const isActive = location.pathname === r.path;
        return (
          <button
            key={r.path}
            type="button"
            data-path={r.path}
            onClick={() => handleItemClick(r.path)}
            className={[
              'group relative flex w-full items-center gap-3 rounded-[4px] px-3 py-2.5 min-h-[44px] text-14 font-medium transition-colors duration-150 text-left touch-manipulation cursor-pointer',
              isActive
                ? 'bg-[#161616] text-[#D4FF3A] border-l-2 border-[#D4FF3A]'
                : 'text-[#8A8A8A] hover:bg-[#111111] hover:text-[#F5F5F5] active:bg-[#141414]',
            ].join(' ')}
          >
            <Icon size={18} className="shrink-0" />
            {expanded && (
              <span className="truncate whitespace-nowrap">
                {r.navLabel}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
