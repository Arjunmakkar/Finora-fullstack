import type { HTMLAttributes } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export default function Card({
  className,
  interactive = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-[4px] border border-[#262626] bg-[#111111] text-[#F5F5F5]',
        interactive && 'transition-colors duration-150 hover:bg-[#161616] hover:border-[#333333]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
