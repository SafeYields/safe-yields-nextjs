import { TradingHistory } from '@/types/dashboard.types';
import { type ClassValue, clsx } from 'clsx';
import { customAlphabet } from 'nanoid';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789');
export const trimDecimalPlaces = (
  numStr: string,
  decimalPlaces: number,
): string => {
  // Check if the number string contains a decimal point
  const decimalIndex = numStr.indexOf('.');

  // If there's no decimal point or the number has fewer or equal decimal places, return the original string
  if (decimalIndex === -1 || numStr.length - decimalIndex - 1 <= decimalPlaces)
    return numStr;

  // Otherwise, slice the string to the desired decimal places
  return numStr.slice(0, decimalIndex + decimalPlaces + 1);
};

const calculateAPY = (apr: number, compoundingPeriods = 365) => {
  const aprDecimal = apr > 1 ? apr / 100 : apr;

  // For continuous compounding
  if (compoundingPeriods === Infinity) {
    return (Math.exp(aprDecimal) - 1) * 100;
  }

  return (
    (Math.pow(
      1 + aprDecimal / compoundingPeriods,
      Math.min(compoundingPeriods, apr),
    ) -
      1) *
    100
  );
};

// Helper function to calculate APY from trading history
export const calculateAPYFromHistory = (history: TradingHistory[]) => {
  const n = 365;
  if (!history || history.length < 2) return 0;

  const firstEntry = history[0];
  const lastEntry = history[history.length - 1];

  const totalReturnDecimal =
    (+lastEntry.equity - +firstEntry.initialBalance) /
    +firstEntry.initialBalance;

  const firstDate = new Date(firstEntry.updateTime).getTime();
  const lastDate = new Date(lastEntry.updateTime).getTime();
  const tradingDays = Math.max(
    1,
    Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)),
  );

  const apr = (totalReturnDecimal / tradingDays) * n;

  return calculateAPY(apr, n);
};

export function formatMonthYear(dateString: string): string {
  const date = new Date(dateString);

  // Optional: Validate the date
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date string');
  }

  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    year: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}
