import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import clsx from 'clsx';
import { useUIStore } from '@/store/uiStore';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const isDark = theme === 'dark';

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileTap={{ scale: 0.94 }}
      whileHover={{ y: -1 }}
      className={clsx(
        'relative inline-flex items-center justify-center gap-2 rounded-card border border-border-strong bg-surface text-ink-primary transition-colors hover:bg-elevated hover:border-accent-teal focus:outline-none',
        showLabel ? 'h-9 px-3 text-xs font-semibold' : 'h-9 w-9',
        className
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -45, opacity: 0, scale: 0.8 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 45, opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Sun size={16} className="text-accent-amber" />
        ) : (
          <Moon size={16} className="text-accent-cyan" />
        )}
      </motion.div>
      {showLabel && (
        <span className="label-caps text-ink-primary">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </motion.button>
  );
}
