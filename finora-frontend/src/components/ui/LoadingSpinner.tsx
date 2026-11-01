import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'teal' | 'cyan' | 'current';
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 28,
};

const variantMap = {
  teal: 'text-accent-teal',
  cyan: 'text-accent-cyan',
  current: 'text-current',
};

export default function LoadingSpinner({
  size = 'md',
  className,
  variant = 'teal',
}: LoadingSpinnerProps) {
  return (
    <Loader2
      size={sizeMap[size]}
      className={clsx('animate-spin shrink-0', variantMap[variant], className)}
      role="status"
      aria-label="Loading"
    />
  );
}
