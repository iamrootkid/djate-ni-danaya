
/**
 * Formats a number as currency (CFA Franc by default)
 * @param amount - The amount to format
 * @param currency - The currency code (defaults to XOF for CFA Franc)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'XOF'): string {
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${amount.toLocaleString('fr-FR')} F CFA`;
  }
}

/**
 * Formats a number as a percentage
 * @param value - The value to format as percentage
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value / 100);
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return `${value.toFixed(decimals)}%`;
  }
}
