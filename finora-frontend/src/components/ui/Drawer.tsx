import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

export default function Drawer({ open, onClose, title, children }: DrawerProps) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(8,9,16,0.9)' }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-surface shadow-elevated border-l border-border-subtle"
          >
            {/* Gradient accent left edge */}
            <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-accent-teal/50 to-transparent" />
            
            <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
              <h2 className="font-display text-base font-semibold text-ink-primary">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-card p-1.5 text-ink-secondary hover:bg-elevated hover:text-ink-primary transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5" style={{ height: 'calc(100% - 57px)' }}>
              {children}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
