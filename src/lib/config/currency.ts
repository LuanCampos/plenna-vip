/**
 * Currency configuration for the application
 * Centralized to prepare for multi-currency support
 */

export const CURRENCY_SYMBOL = 'R$';
export const CURRENCY_CODE = 'BRL';
export const CURRENCY_LOCALE = 'pt-BR';

/**
 * Formats a number as currency
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: 'currency',
    currency: CURRENCY_CODE,
  }).format(value);
};

/**
 * Parses a currency string to number
 */
export const parseCurrency = (value: string): number => {
  const cleaned = value
    .replace(CURRENCY_SYMBOL, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};
