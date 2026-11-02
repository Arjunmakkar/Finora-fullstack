import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const location = useLocation();

  return (
    <div className="flex h-[100dvh] min-h-[100dvh] w-full overflow-hidden relative bg-[#0A0A0A] text-[#F5F5F5]">
      <Sidebar />
      <MobileNav />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden h-full">
        <Topbar />
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 overscroll-contain"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
