import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx';

export interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function Dropdown({ options, value, onChange, className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className={clsx('relative', className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          'flex h-9 items-center gap-2 rounded-[4px] px-3 text-14 text-[#F5F5F5] transition-colors duration-150',
          'bg-[#111111] border border-[#262626]',
          'hover:bg-[#161616] hover:border-[#333333]',
          open && 'border-[#D4FF3A] bg-[#161616]'
        )}
      >
        <span>{selected?.label ?? 'Select'}</span>
        <ChevronDown size={13} className={clsx('text-[#8A8A8A] transition-transform duration-150', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-30 mt-1 min-w-full overflow-hidden rounded-[4px] bg-[#111111] border border-[#262626] shadow-card py-1"
          >
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={clsx(
                    'flex w-full items-center justify-between whitespace-nowrap px-3 py-2 text-left text-12 transition-colors',
                    'hover:bg-[#161616] hover:text-[#F5F5F5]',
                    opt.value === value ? 'text-[#D4FF3A] bg-[#161616] font-medium' : 'text-[#8A8A8A]'
                  )}
                >
                  <span>{opt.label}</span>
                  {opt.value === value && <Check size={12} className="text-[#D4FF3A] ml-2" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
