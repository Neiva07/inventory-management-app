import Decimal from 'decimal.js';

// Configure Decimal.js with custom rounding behavior
// ROUND_HALF_UP: rounds up when the digit to be rounded is 5 or greater
// This means 40.45 rounds to 40, 40.55 rounds to 41
Decimal.set({
  precision: 20, // High precision for calculations
  rounding: Decimal.ROUND_HALF_UP, // Round up when >= 0.5
  toExpNeg: -7,
  toExpPos: 21,
  maxE: 9e15,
  minE: -9e15
});

/**
 * Creates a Decimal instance with proper configuration
 * @param value - The value to convert to Decimal
 * @returns Decimal instance
 */
function createDecimal(value: number | string | Decimal): Decimal {
  return new Decimal(value);
}

/**
 * Rounds a number to 2 decimal places using the configured rounding behavior
 * @param value - The value to round
 * @returns Rounded value as number
 */
function roundToTwoDecimals(value: number | string | Decimal): number {
  const decimal = createDecimal(value);
  return decimal.toDecimalPlaces(2).toNumber();
}

/**
 * Performs addition with proper rounding to 2 decimal places
 * @param args - Operands to add
 * @returns Result rounded to 2 decimal places
 */
export function add(...args: (number | string | Decimal)[]): number {
  if (args.length === 0) return 0;
  if (args.length === 1) return roundToTwoDecimals(args[0]);
  
  const result = args.reduce((acc, curr) => createDecimal(acc).plus(curr));
  return roundToTwoDecimals(result);
}

/**
 * Performs subtraction with proper rounding to 2 decimal places
 * @param a - First operand
 * @param b - Second operand
 * @returns Result rounded to 2 decimal places
 */
export function subtract(a: number | string | Decimal, b: number | string | Decimal): number {
  const result = createDecimal(a).minus(b);
  return roundToTwoDecimals(result);
}

/**
 * Performs multiplication with proper rounding to 2 decimal places
 * @param args - Operands to multiply
 * @returns Result rounded to 2 decimal places
 */
export function multiply(...args: (number | string | Decimal)[]): number {
  if (args.length === 0) return 0;
  if (args.length === 1) return roundToTwoDecimals(args[0]);
  
  const result = args.reduce((acc, curr) => createDecimal(acc).times(curr));
  return roundToTwoDecimals(result);
}

/**
 * Performs division with proper rounding to 2 decimal places
 * @param a - First operand
 * @param b - Second operand
 * @returns Result rounded to 2 decimal places
 */
export function divide(a: number | string | Decimal, b: number | string | Decimal): number {
  const result = createDecimal(a).dividedBy(b);
  return roundToTwoDecimals(result);
}
