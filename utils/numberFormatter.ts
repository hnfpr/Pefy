/**
 * Utility functions for formatting numbers with abbreviations (K, M, B, T)
 * Designed to work with the currency formatting system
 */

export interface NumberAbbreviation {
  value: number;
  suffix: string;
  decimals: number;
}

export class NumberFormatter {
  private static abbreviations = [
    { threshold: 1e12, suffix: 'T', decimals: 1 }, // Trillion
    { threshold: 1e9, suffix: 'B', decimals: 1 },  // Billion
    { threshold: 1e6, suffix: 'M', decimals: 1 },  // Million
    { threshold: 1e3, suffix: 'K', decimals: 1 },  // Thousand
  ];

  /**
   * Format a number with appropriate abbreviation (K, M, B, T)
   * @param value - The number to format
   * @param forceDecimals - Force showing decimals even for whole numbers
   * @returns Formatted string with abbreviation
   */
  static abbreviate(value: number, forceDecimals: boolean = false): string {
    // Handle zero and very small numbers
    if (Math.abs(value) < 1000) {
      return forceDecimals ? value.toFixed(1) : value.toString();
    }

    // Find the appropriate abbreviation
    for (const abbrev of this.abbreviations) {
      if (Math.abs(value) >= abbrev.threshold) {
        const abbreviated = value / abbrev.threshold;
        
        // Determine if we should show decimals
        const showDecimals = forceDecimals || (abbreviated % 1 !== 0 && abbreviated < 100);
        
        if (showDecimals) {
          return `${abbreviated.toFixed(abbrev.decimals)}${abbrev.suffix}`;
        } else {
          return `${Math.round(abbreviated)}${abbrev.suffix}`;
        }
      }
    }

    // Fallback (shouldn't reach here)
    return value.toString();
  }

  /**
   * Format a number with abbreviation and currency symbol
   * @param value - The number to format
   * @param currencySymbol - Currency symbol to prepend
   * @param forceDecimals - Force showing decimals
   * @returns Formatted currency string with abbreviation
   */
  static abbreviateCurrency(value: number, currencySymbol: string, forceDecimals: boolean = false): string {
    const abbreviated = this.abbreviate(value, forceDecimals);
    return `${currencySymbol}${abbreviated}`;
  }

  /**
   * Format a number with abbreviation for chart display
   * Optimized for chart readability with smart decimal handling
   * @param value - The number to format
   * @param currencySymbol - Currency symbol to prepend
   * @returns Formatted string optimized for charts
   */
  static formatForChart(value: number, currencySymbol: string = ''): string {
    // Handle zero
    if (value === 0) {
      return `${currencySymbol}0`;
    }

    // For numbers less than 1000, show as-is (no decimals for whole numbers)
    if (Math.abs(value) < 1000) {
      return `${currencySymbol}${Math.round(value)}`;
    }

    // Find the appropriate abbreviation
    for (const abbrev of this.abbreviations) {
      if (Math.abs(value) >= abbrev.threshold) {
        const abbreviated = value / abbrev.threshold;
        
        // Smart decimal handling for chart readability
        let formatted: string;
        if (abbreviated >= 100) {
          // For 100+ (like 150M), no decimals needed
          formatted = `${Math.round(abbreviated)}${abbrev.suffix}`;
        } else if (abbreviated >= 10) {
          // For 10-99 (like 15.5M), show 1 decimal if needed
          formatted = abbreviated % 1 === 0 
            ? `${Math.round(abbreviated)}${abbrev.suffix}`
            : `${abbreviated.toFixed(1)}${abbrev.suffix}`;
        } else {
          // For 1-9.9 (like 2.5M), always show 1 decimal for precision
          formatted = `${abbreviated.toFixed(1)}${abbrev.suffix}`;
        }
        
        return `${currencySymbol}${formatted}`;
      }
    }

    // Fallback
    return `${currencySymbol}${Math.round(value)}`;
  }

  /**
   * Get readable range suggestion for chart axes
   * @param maxValue - Maximum value in the dataset
   * @returns Suggested nice round numbers for chart range
   */
  static suggestChartRange(maxValue: number): { min: number; max: number; step: number } {
    if (maxValue === 0) {
      return { min: 0, max: 100, step: 20 };
    }

    // Add 20% padding to max value
    const paddedMax = maxValue * 1.2;
    
    // Find appropriate scale
    const magnitude = Math.pow(10, Math.floor(Math.log10(paddedMax)));
    const normalizedMax = paddedMax / magnitude;
    
    let niceMax: number;
    let step: number;
    
    if (normalizedMax <= 1) {
      niceMax = 1;
      step = 0.2;
    } else if (normalizedMax <= 2) {
      niceMax = 2;
      step = 0.5;
    } else if (normalizedMax <= 5) {
      niceMax = 5;
      step = 1;
    } else {
      niceMax = 10;
      step = 2;
    }
    
    const actualMax = niceMax * magnitude;
    const actualStep = step * magnitude;
    
    return {
      min: 0,
      max: actualMax,
      step: actualStep
    };
  }

  /**
   * Format number for tooltip display (full precision with currency formatting)
   * @param value - The number to format
   * @param formatCurrency - Currency formatting function
   * @returns Formatted string for tooltip
   */
  static formatForTooltip(value: number, formatCurrency: (amount: number) => string): string {
    return formatCurrency(value);
  }
}

export default NumberFormatter;