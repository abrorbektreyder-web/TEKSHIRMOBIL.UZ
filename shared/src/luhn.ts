/**
 * IMEI Luhn validation and formatting utilities
 */

/**
 * Strips all non-digit characters from string.
 */
export function cleanImei(imei: string): string {
  if (!imei) return '';
  return imei.replace(/\D/g, '');
}

/**
 * Standard Luhn algorithm implementation for 15-digit IMEI.
 * Formula:
 * From right to left, double every second digit (starting with the second-to-last digit).
 * If doubling results in a number greater than 9, sum its digits (or subtract 9).
 * Sum all digits. The total must be divisible by 10.
 */
export function isValidLuhn(digits: string): boolean {
  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (isNaN(digit)) return false;

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Validates whether the given string is a valid 15-digit IMEI.
 */
export function isValidImei(imei: string): boolean {
  const cleaned = cleanImei(imei);
  if (cleaned.length !== 15) {
    return false;
  }
  return isValidLuhn(cleaned);
}

/**
 * Calculates the Luhn check digit (15th digit) for a 14-digit IMEI prefix.
 */
export function calculateImeiCheckDigit(first14: string): number {
  const cleaned = cleanImei(first14).slice(0, 14);
  if (cleaned.length !== 14) {
    throw new Error('Prefix must contain exactly 14 digits');
  }

  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(cleaned[i], 10);
    // 0-indexed: index 1, 3, 5, 7, 9, 11, 13 (2nd, 4th, 6th...) are doubled
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
  }

  return (10 - (sum % 10)) % 10;
}

/**
 * Masks an IMEI for display to protect privacy and adhere to security rules.
 * Example: 356123456789012 -> **** **** **** 9012
 */
export function maskImei(imei: string): string {
  const cleaned = cleanImei(imei);
  if (cleaned.length < 4) {
    return '****';
  }
  const last4 = cleaned.slice(-4);
  return `**** **** **** ${last4}`;
}

/**
 * Formats a 15-digit IMEI with grouping for better readability.
 * Example: 356123456789012 -> 3561 2345 6789 012
 */
export function formatImeiDisplay(imei: string): string {
  const cleaned = cleanImei(imei);
  if (cleaned.length !== 15) return cleaned;
  return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8, 12)} ${cleaned.slice(12, 15)}`;
}
