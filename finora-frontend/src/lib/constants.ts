export const CATEGORIES = [
  'Food',
  'Shopping',
  'Transport',
  'Entertainment',
  'Bills',
  'Rent',
  'Healthcare',
  'Education',
  'Travel',
  'Subscriptions',
  'Investments',
  'Salary',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const DATE_RANGES = ['7D', '1M', '3M', '6M', '1Y'] as const;
export type DateRange = (typeof DATE_RANGES)[number];

/** Category -> accent token, used consistently across donut charts, chips, and transaction rows */
export const CATEGORY_COLOR: Record<Category, string> = {
  Food: 'var(--accent-amber)',
  Shopping: 'var(--accent-violet)',
  Transport: 'var(--accent-cyan)',
  Entertainment: 'var(--accent-violet)',
  Bills: 'var(--accent-rose)',
  Rent: 'var(--accent-rose)',
  Healthcare: 'var(--accent-cyan)',
  Education: 'var(--accent-blue)',
  Travel: 'var(--accent-cyan)',
  Subscriptions: 'var(--accent-amber)',
  Investments: 'var(--accent-emerald)',
  Salary: 'var(--accent-emerald)',
  Other: 'var(--text-tertiary)',
};
