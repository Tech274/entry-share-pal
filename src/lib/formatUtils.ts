/**
 * Format utilities for INR currency and percentage display
 */

/**
 * Format a number as INR currency
 * @param value - The numeric value to format
 * @returns Formatted string with ₹ symbol
 */
export const formatINR = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format a number as percentage
 * @param value - The numeric value (0-100)
 * @returns Formatted string with % symbol
 */
export const formatPercentage = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '0.00%';
  return `${value.toFixed(2)}%`;
};

/**
 * Parse a currency string to number
 * Removes ₹ symbol and commas, returns the numeric value
 */
export const parseINR = (value: string): number => {
  const cleaned = value.replace(/[₹,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
};

/**
 * Validate and clamp percentage value to 0-100 range
 */
export const validatePercentage = (value: number): number => {
  return Math.min(100, Math.max(0, value));
};

/**
 * Validate positive integer (greater than zero)
 */
export const validatePositiveInteger = (value: number): number => {
  return Math.max(1, Math.floor(value));
};

/**
 * Validate non-negative currency value with 2 decimal places
 */
export const validateCurrency = (value: number): number => {
  return Math.max(0, Math.round(value * 100) / 100);
};
