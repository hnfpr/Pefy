export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  decimals: number;
  symbolPosition: 'before' | 'after';
  thousandsSeparator: string;
  decimalSeparator: string;
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
    decimals: 2,
    symbolPosition: 'after',
    thousandsSeparator: '.',
    decimalSeparator: ','
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    locale: 'ja-JP',
    decimals: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  IDR: {
    code: 'IDR',
    symbol: 'Rp',
    name: 'Indonesian Rupiah',
    locale: 'id-ID',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: '.',
    decimalSeparator: ','
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    locale: 'en-IN',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    locale: 'zh-CN',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  KRW: {
    code: 'KRW',
    symbol: '₩',
    name: 'South Korean Won',
    locale: 'ko-KR',
    decimals: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    locale: 'en-AU',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    locale: 'en-CA',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  CHF: {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss Franc',
    locale: 'de-CH',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: "'",
    decimalSeparator: '.'
  },
  SEK: {
    code: 'SEK',
    symbol: 'kr',
    name: 'Swedish Krona',
    locale: 'sv-SE',
    decimals: 2,
    symbolPosition: 'after',
    thousandsSeparator: ' ',
    decimalSeparator: ','
  },
  NOK: {
    code: 'NOK',
    symbol: 'kr',
    name: 'Norwegian Krone',
    locale: 'nb-NO',
    decimals: 2,
    symbolPosition: 'after',
    thousandsSeparator: ' ',
    decimalSeparator: ','
  },
  DKK: {
    code: 'DKK',
    symbol: 'kr',
    name: 'Danish Krone',
    locale: 'da-DK',
    decimals: 2,
    symbolPosition: 'after',
    thousandsSeparator: '.',
    decimalSeparator: ','
  },
  PLN: {
    code: 'PLN',
    symbol: 'zł',
    name: 'Polish Zloty',
    locale: 'pl-PL',
    decimals: 2,
    symbolPosition: 'after',
    thousandsSeparator: ' ',
    decimalSeparator: ','
  },
  RUB: {
    code: 'RUB',
    symbol: '₽',
    name: 'Russian Ruble',
    locale: 'ru-RU',
    decimals: 2,
    symbolPosition: 'after',
    thousandsSeparator: ' ',
    decimalSeparator: ','
  },
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    name: 'Brazilian Real',
    locale: 'pt-BR',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: '.',
    decimalSeparator: ','
  },
  MXN: {
    code: 'MXN',
    symbol: '$',
    name: 'Mexican Peso',
    locale: 'es-MX',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    locale: 'en-ZA',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: ' ',
    decimalSeparator: ','
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    locale: 'en-SG',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  HKD: {
    code: 'HKD',
    symbol: 'HK$',
    name: 'Hong Kong Dollar',
    locale: 'en-HK',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  TWD: {
    code: 'TWD',
    symbol: 'NT$',
    name: 'Taiwan Dollar',
    locale: 'zh-TW',
    decimals: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  THB: {
    code: 'THB',
    symbol: '฿',
    name: 'Thai Baht',
    locale: 'th-TH',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  MYR: {
    code: 'MYR',
    symbol: 'RM',
    name: 'Malaysian Ringgit',
    locale: 'ms-MY',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  PHP: {
    code: 'PHP',
    symbol: '₱',
    name: 'Philippine Peso',
    locale: 'en-PH',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  VND: {
    code: 'VND',
    symbol: '₫',
    name: 'Vietnamese Dong',
    locale: 'vi-VN',
    decimals: 0,
    symbolPosition: 'after',
    thousandsSeparator: '.',
    decimalSeparator: ','
  },
  AED: {
    code: 'AED',
    symbol: 'AED',
    name: 'UAE Dirham',
    locale: 'ar-AE',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  SAR: {
    code: 'SAR',
    symbol: 'SR',
    name: 'Saudi Riyal',
    locale: 'ar-SA',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  EGP: {
    code: 'EGP',
    symbol: 'E£',
    name: 'Egyptian Pound',
    locale: 'ar-EG',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  ILS: {
    code: 'ILS',
    symbol: '₪',
    name: 'Israeli Shekel',
    locale: 'he-IL',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  TRY: {
    code: 'TRY',
    symbol: '₺',
    name: 'Turkish Lira',
    locale: 'tr-TR',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: '.',
    decimalSeparator: ','
  }
};

export class CurrencyFormatter {
  private static formatNumber(
    amount: number,
    config: CurrencyConfig
  ): string {
    // Handle the special case for Indonesian Rupiah and similar currencies
    if (config.code === 'IDR') {
      const parts = amount.toFixed(config.decimals).split('.');
      const integerPart = parts[0];
      const decimalPart = parts[1];
      
      // Add thousands separators (dots for IDR)
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandsSeparator);
      
      if (config.decimals > 0 && decimalPart) {
        return `${formattedInteger}${config.decimalSeparator}${decimalPart}`;
      }
      return formattedInteger;
    }

    // Handle Indian Rupee special formatting (lac/crore system)
    if (config.code === 'INR') {
      const parts = amount.toFixed(config.decimals).split('.');
      let integerPart = parts[0];
      const decimalPart = parts[1];
      
      // Indian number system: last 3 digits, then groups of 2
      if (integerPart.length > 3) {
        const lastThree = integerPart.slice(-3);
        const remaining = integerPart.slice(0, -3);
        const formattedRemaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
        integerPart = `${formattedRemaining},${lastThree}`;
      }
      
      if (config.decimals > 0 && decimalPart) {
        return `${integerPart}${config.decimalSeparator}${decimalPart}`;
      }
      return integerPart;
    }

    // Standard formatting for most currencies
    const parts = amount.toFixed(config.decimals).split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    
    // Add thousands separators
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandsSeparator);
    
    if (config.decimals > 0 && decimalPart) {
      return `${formattedInteger}${config.decimalSeparator}${decimalPart}`;
    }
    return formattedInteger;
  }

  static format(amount: number, currencyCode: string = 'USD'): string {
    const config = CURRENCIES[currencyCode] || CURRENCIES.USD;
    const formattedNumber = this.formatNumber(amount, config);
    
    if (config.symbolPosition === 'before') {
      return `${config.symbol}${formattedNumber}`;
    } else {
      return `${formattedNumber} ${config.symbol}`;
    }
  }

  static formatWithoutSymbol(amount: number, currencyCode: string = 'USD'): string {
    const config = CURRENCIES[currencyCode] || CURRENCIES.USD;
    return this.formatNumber(amount, config);
  }

  static getSymbol(currencyCode: string = 'USD'): string {
    const config = CURRENCIES[currencyCode] || CURRENCIES.USD;
    return config.symbol;
  }

  static getCurrency(currencyCode: string = 'USD'): CurrencyConfig {
    return CURRENCIES[currencyCode] || CURRENCIES.USD;
  }

  static getAllCurrencies(): CurrencyConfig[] {
    return Object.values(CURRENCIES);
  }

  static isValidCurrency(currencyCode: string): boolean {
    return currencyCode in CURRENCIES;
  }

  // Parse a formatted currency string back to number
  static parse(formattedAmount: string, currencyCode: string = 'USD'): number {
    const config = CURRENCIES[currencyCode] || CURRENCIES.USD;
    
    // Remove currency symbol
    let cleaned = formattedAmount.replace(config.symbol, '').trim();
    
    // Replace thousands separators with empty string
    if (config.thousandsSeparator !== '.') {
      cleaned = cleaned.replace(new RegExp(`\\${config.thousandsSeparator}`, 'g'), '');
    }
    
    // Replace decimal separator with standard decimal point
    if (config.decimalSeparator !== '.') {
      cleaned = cleaned.replace(config.decimalSeparator, '.');
    }
    
    // Special handling for IDR where thousands separator is dot
    if (config.code === 'IDR') {
      // Split by comma (decimal separator for IDR)
      const parts = cleaned.split(',');
      if (parts.length === 2) {
        // Remove dots from integer part, keep decimal part
        const integerPart = parts[0].replace(/\./g, '');
        cleaned = `${integerPart}.${parts[1]}`;
      } else {
        // No decimal part, just remove dots
        cleaned = cleaned.replace(/\./g, '');
      }
    }
    
    return parseFloat(cleaned) || 0;
  }
}

export default CurrencyFormatter;