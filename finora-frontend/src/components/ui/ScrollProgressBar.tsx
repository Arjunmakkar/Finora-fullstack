import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 35,
    restDelta: 0.001,
  });

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[3px] z-[100] pointer-events-none bg-border-subtle/30"
      aria-hidden="true"
    >
      <motion.div
        className="h-full w-full origin-left"
        style={{
          scaleX,
          background: 'linear-gradient(90deg, #00d4b4 0%, #0ea5e9 100%)',
          boxShadow: '0 0 10px rgba(0, 212, 180, 0.5)',
        }}
      />
    </div>
  );
}
