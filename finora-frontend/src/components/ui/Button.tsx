import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  // Primary: The single accent #D4FF3A with dark text #0A0A0A
  primary: 'bg-[#D4FF3A] text-[#0A0A0A] font-semibold hover:bg-[#C2ED28] focus-visible:outline-2 focus-visible:outline-[#D4FF3A] focus-visible:outline-offset-2',
  secondary: 'bg-[#111111] text-[#F5F5F5] border border-[#262626] hover:bg-[#161616] hover:border-[#333333]',
  ghost: 'bg-transparent text-[#8A8A8A] hover:text-[#F5F5F5] hover:bg-[#111111]',
  danger: 'bg-[#111111] text-[#F5F5F5] border border-[#333333] hover:border-[#8A8A8A]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 min-h-[40px] px-4 text-sm',
  lg: 'h-11 min-h-[44px] px-6 text-sm',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={clsx(
          'relative inline-flex items-center justify-center gap-2 rounded-[4px] font-sans transition-colors duration-150',
          'disabled:opacity-30 disabled:pointer-events-none cursor-pointer',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...(props as any)}
      >
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
