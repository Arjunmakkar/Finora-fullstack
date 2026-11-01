/** 
 * FINORA Formatters
 * Rule: Convert paise to rupees only in the formatter, never in components.
 * Rule: Indian grouping and the ₹ symbol, for example ₹1,23,456.78.
 * Rule: Use a minus sign (−), not a hyphen.
 */

export function formatINR(
  paise: number,
  opts: { compact?: boolean; decimals?: boolean; showSign?: boolean } = {}
): string {
  const isNegative = paise < 0;
  const absPaise = Math.abs(paise);
  const rupees = absPaise / 100;

  let formatted = '';
  if (opts.compact) {
    formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(rupees);
  } else {
    formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: opts.decimals ? 2 : (absPaise % 100 !== 0 ? 2 : 0),
      maximumFractionDigits: 2,
    }).format(rupees);
  }

  if (opts.showSign) {
    return isNegative ? `−${formatted}` : `+${formatted}`;
  }

  return isNegative ? `−${formatted}` : formatted;
}

export function formatPercent(value: number, digits = 1): string {
  const isNegative = value < 0;
  const absVal = Math.abs(value);
  return `${isNegative ? '−' : '+'}${absVal.toFixed(digits)}%`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}
