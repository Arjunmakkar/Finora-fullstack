import type { HTMLAttributes } from 'react';
import clsx from 'clsx';

export default function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-[4px] bg-[#161616] animate-pulse',
        className
      )}
      {...props}
    />
  );
}
