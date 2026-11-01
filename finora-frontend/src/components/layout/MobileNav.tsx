import { AnimatePresence, motion } from 'framer-motion';
import { X, Settings, LogOut } from 'lucide-react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate } from 'react-router-dom';
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

  const onLogout = () => {
    setOpen(false);
    logout.mutate(undefined, {
      onSettled: () => navigate('/login'),
    });
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="md:hidden">
          {/* Full-height backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Full-height Drawer */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="fixed left-0 top-0 z-50 flex h-full w-[280px] max-w-[85vw] flex-col bg-[#0A0A0A] border-r border-[#262626]"
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
                onClick={() => setOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#8A8A8A] hover:text-[#F5F5F5]"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation List */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              <NavList onNavigate={() => setOpen(false)} expanded={true} />
            </div>

            {/* Footer */}
            <div className="shrink-0 p-3 space-y-2 border-t border-[#262626] bg-[#0A0A0A]">
              <NavLink
                to="/settings"
                onClick={() => setOpen(false)}
                className="min-h-[44px] flex items-center gap-3 rounded-[4px] px-3 text-14 font-medium text-[#8A8A8A] hover:text-[#F5F5F5] hover:bg-[#111111]"
              >
                <Settings size={18} />
                <span>Settings</span>
              </NavLink>
              <button
                onClick={onLogout}
                className="min-h-[44px] w-full flex items-center gap-3 rounded-[4px] px-3 text-14 font-medium text-[#8A8A8A] hover:text-[#F5F5F5] hover:bg-[#111111]"
              >
                <LogOut size={18} />
                <span>Sign out ({user?.name || 'Rohit'})</span>
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
