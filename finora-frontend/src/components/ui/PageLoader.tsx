import { motion } from 'framer-motion';

export default function PageLoader() {
  return (
    <div className="flex min-h-[60vh] h-full w-full flex-col items-center justify-center bg-void p-6 text-center">
      <div className="relative mb-6 flex items-center justify-center">
        {/* Glowing pulse aura */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute h-20 w-20 rounded-xl bg-accent-teal/15 blur-xl pointer-events-none"
        />

        {/* Ambient spinning ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="h-16 w-16 rounded-card border-2 border-border-subtle border-t-accent-teal border-r-accent-cyan"
        />

        {/* Center wordmark initial */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-14 font-bold text-[#F5F5F5]">F</span>
        </div>
      </div>

      <motion.p
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="label-caps tracking-widest text-[11px] text-ink-secondary"
      >
        Loading Finora Intelligence...
      </motion.p>
    </div>
  );
}
