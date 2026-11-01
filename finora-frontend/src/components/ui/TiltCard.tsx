import { useState, useRef, useEffect } from 'react';
import type { HTMLAttributes } from 'react';
import clsx from 'clsx';

interface TiltCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxTilt?: number; // max tilt degrees (strictly capped at 6 per FINORA design rules)
}

export default function TiltCard({
  children,
  className,
  maxTilt = 6,
  ...props
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [canTilt, setCanTilt] = useState(true);

  useEffect(() => {
    // Disable tilt on touch devices or if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
    setCanTilt(!prefersReducedMotion && !isTouchDevice);

    const onResize = () => {
      setCanTilt(!prefersReducedMotion && window.innerWidth >= 768 && !window.matchMedia('(pointer: coarse)').matches);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normalizedX = (x / rect.width) * 2 - 1; // -1 to 1
    const normalizedY = (y / rect.height) * 2 - 1; // -1 to 1

    // Strictly limit tilt to max 6 degrees
    const rotateY = Math.max(-maxTilt, Math.min(maxTilt, normalizedX * maxTilt));
    const rotateX = Math.max(-maxTilt, Math.min(maxTilt, -normalizedY * maxTilt));

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: canTilt
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
          : 'none',
        transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform',
      }}
      className={clsx(
        'rounded-[4px] border border-[#262626] bg-[#111111] p-5 text-[#F5F5F5]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
