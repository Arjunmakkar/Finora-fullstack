import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Settings, LogOut } from 'lucide-react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import NavList from './NavList';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/useAuth';

export default function MobileNav() {
  const open = useUIStore((s) => s.mobileNavOpen);
  const setOpen = useUIStore((s) => s.setMobileNavOpen);
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  // Automatically close mobile nav whenever the route changes
  useEffect(() => {
    if (open) {
      setOpen(false);
    }
  }, [location.pathname, location.search]);

  // Lock body scroll and handle Escape key when drawer is open
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, setOpen]);

  const onLogout = () => {
    setOpen(false);
    logout.mutate(undefined, {
      onSettled: () => navigate('/login'),
    });
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    navigate('/settings');
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-nav-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] md:hidden"
        >
          {/* Full-height backdrop overlay with high z-index */}
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-sm cursor-pointer touch-manipulation"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Full-height Drawer per FINORA Design Rules */}
          <motion.aside
            key="mobile-nav-drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="relative z-10 flex h-[100dvh] w-[280px] max-w-[85vw] flex-col bg-[#0A0A0A] border-r border-[#262626] shadow-2xl select-none"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation drawer"
          >
            {/* Header */}
            <div className="flex h-16 shrink-0 items-center justify-between px-5 border-b border-[#262626]">
              <div className="flex items-center gap-2.5">
                <div className="h-1.5 w-1.5 bg-[#D4FF3A] shrink-0" />
                <span className="font-display text-20 font-bold tracking-tight text-[#F5F5F5]">
                  FINORA
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#8A8A8A] hover:text-[#F5F5F5] active:text-[#F5F5F5] transition-colors rounded-[4px] touch-manipulation"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation List */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 overscroll-contain">
              <NavList onNavigate={() => setOpen(false)} expanded={true} />
            </div>

            {/* Footer User Profile & Settings */}
            <div className="shrink-0 p-3 space-y-2 border-t border-[#262626] bg-[#0A0A0A]">
              <button
                type="button"
                onClick={handleSettingsClick}
                className="min-h-[44px] w-full flex items-center gap-3 rounded-[4px] px-3 text-14 font-medium text-[#8A8A8A] hover:text-[#F5F5F5] hover:bg-[#111111] active:bg-[#161616] transition-colors touch-manipulation"
              >
                <Settings size={18} />
                <span>Settings</span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="min-h-[44px] w-full flex items-center gap-3 rounded-[4px] px-3 text-14 font-medium text-[#8A8A8A] hover:text-[#F5F5F5] hover:bg-[#111111] active:bg-[#161616] transition-colors touch-manipulation"
              >
                <LogOut size={18} />
                <span>Sign out ({user?.name ? user.name.split(' ')[0] : 'Rohit'})</span>
              </button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
