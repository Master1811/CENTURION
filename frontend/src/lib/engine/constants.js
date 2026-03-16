// Core constants for 100Cr Engine calculations

export const CRORE = 10_000_000; // ₹1 Crore = ₹10,000,000
export const LAKH = 100_000; // ₹1 Lakh = ₹100,000

export const DEFAULT_TARGET = 100 * CRORE; // ₹100 Crore

export const MILESTONE_VALUES = [
  CRORE,           // ₹1 Crore
  10 * CRORE,      // ₹10 Crore
  50 * CRORE,      // ₹50 Crore
  100 * CRORE,     // ₹100 Crore
];

export const MILESTONE_LABELS = {
  [CRORE]: '₹1 Crore',
  [10 * CRORE]: '₹10 Crore',
  [50 * CRORE]: '₹50 Crore',
  [100 * CRORE]: '₹100 Crore',
};

export const STAGES = {
  PRE_SEED: 'pre-seed',
  SEED: 'seed',
  SERIES_A: 'series-a',
};

// Default projection parameters
export const DEFAULT_MONTHS_TO_PROJECT = 120; // 10 years
export const MIN_GROWTH_RATE = 0;
export const MAX_GROWTH_RATE = 2.0; // 200%
export const MIN_REVENUE = 0;
export const MAX_REVENUE = 50 * CRORE; // ₹50 Crore MRR cap

/**
 * Format a number as Indian Rupees (₹)
 * Uses Indian numbering system: 1,00,000 for 1 Lakh
 */
export const formatINR = (n) => {
  if (n === null || n === undefined || isNaN(n)) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
};

/**
 * Format a number in Crore/Lakh notation
 * e.g., 10000000 -> "₹1 Crore", 500000 -> "₹5 Lakh"
 */
export const formatCrore = (n) => {
  if (n === null || n === undefined || isNaN(n)) return '₹0';
  
  if (n >= CRORE) {
    const crores = n / CRORE;
    if (crores >= 100) {
      return `₹${Math.round(crores)} Crore`;
    }
    return `₹${crores.toFixed(crores < 10 ? 2 : 1)} Crore`;
  }
  
  if (n >= LAKH) {
    const lakhs = n / LAKH;
    return `₹${lakhs.toFixed(lakhs < 10 ? 2 : 1)} Lakh`;
  }
  
  return formatINR(n);
};

/**
 * Format monthly revenue to yearly (ARR)
 */
export const monthlyToYearly = (mrr) => mrr * 12;

/**
 * Format percentage
 */
export const formatPercent = (decimal, decimals = 1) => {
  if (decimal === null || decimal === undefined || isNaN(decimal)) return '0%';
  return `${(decimal * 100).toFixed(decimals)}%`;
};

/**
 * Format a date as Month Year (e.g., "March 2027")
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

/**
 * Calculate months between two dates
 */
export const monthsBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
};
