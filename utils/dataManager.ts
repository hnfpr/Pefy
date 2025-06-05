// Data management utilities for financial dashboard
// Simulates backend database operations using localStorage

import { CurrencyFormatter, CURRENCIES, CurrencyConfig } from './currencyFormatter';
import { NumberFormatter } from './numberFormatter';

export interface SpendingEntry {
  id: string;
  date: string;
  amount: number;
  category: string;
  description?: string;
  accountId?: string; // Account to deduct from
  type: 'expense' | 'transfer'; // Type of transaction
  transferToAccountId?: string; // For transfer transactions
  createdAt: string;
  updatedAt: string;
}

export interface SavingsAccount {
  id: string;
  bankName: string;
  accountName: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Investment {
  id: string;
  name: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryColor {
  [category: string]: string;
}

export interface AppSettings {
  monthlyTarget: number;
  categories: string[];
  currency: string;
  darkMode: boolean;
  appTitle: string;
  logoUrl?: string;
  categoryColors: CategoryColor;
}

// Default categories for spending
const defaultCategories = [
  'Food',
  'Transport',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Healthcare',
  'Education',
  'Transfer',
  'Other'
];

// Default category colors
const defaultCategoryColors: CategoryColor = {
  'Food': '#ef4444',           // red-500
  'Transport': '#f97316',      // orange-500
  'Entertainment': '#eab308',  // yellow-500
  'Shopping': '#22c55e',       // green-500
  'Utilities': '#06b6d4',      // cyan-500
  'Healthcare': '#3b82f6',     // blue-500
  'Education': '#8b5cf6',      // violet-500
  'Transfer': '#f59e0b',       // amber-500
  'Other': '#6b7280'           // gray-500
};

// Currency options - now using the comprehensive currency formatter
export const CURRENCY_OPTIONS = CurrencyFormatter.getAllCurrencies().map(currency => ({
  code: currency.code,
  symbol: currency.symbol,
  name: currency.name
}));

// Default settings
const defaultSettings: AppSettings = {
  monthlyTarget: 1000,
  categories: defaultCategories,
  currency: 'USD',
  darkMode: false,
  appTitle: 'Personal Finance Dashboard',
  logoUrl: undefined,
  categoryColors: defaultCategoryColors
};

class DataManager {
  private getStorageKey(type: string): string {
    return `financial_dashboard_${type}`;
  }

  // Generic storage operations
  private getFromStorage<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(this.getStorageKey(key));
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from storage:`, error);
      return defaultValue;
    }
  }

  private saveToStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(this.getStorageKey(key), JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error);
      throw new Error(`Failed to save ${key}`);
    }
  }

  // Spending entries
  getSpendingEntries(): SpendingEntry[] {
    return this.getFromStorage('spending', []);
  }

  addSpendingEntry(entry: Omit<SpendingEntry, 'id' | 'createdAt' | 'updatedAt'>): SpendingEntry {
    const entries = this.getSpendingEntries();
    const newEntry: SpendingEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Handle account balance updates
    if (entry.type === 'expense' && entry.accountId) {
      // Deduct amount from specified account
      const account = this.getSavingsAccounts().find(acc => acc.id === entry.accountId);
      if (account && account.balance >= entry.amount) {
        this.updateSavingsAccount(entry.accountId, { 
          balance: account.balance - entry.amount 
        });
      } else {
        throw new Error('Insufficient balance in selected account');
      }
    } else if (entry.type === 'transfer' && entry.accountId && entry.transferToAccountId) {
      // Transfer between accounts
      const success = this.transferBetweenAccounts(entry.accountId, entry.transferToAccountId, entry.amount);
      if (!success) {
        throw new Error('Transfer failed: insufficient balance or invalid accounts');
      }
    }
    
    entries.push(newEntry);
    this.saveToStorage('spending', entries);
    return newEntry;
  }

  updateSpendingEntry(id: string, updates: Partial<SpendingEntry>): SpendingEntry | null {
    const entries = this.getSpendingEntries();
    const index = entries.findIndex(entry => entry.id === id);
    if (index === -1) return null;

    const originalEntry = entries[index];
    
    // Revert original account changes if they exist
    if (originalEntry.type === 'expense' && originalEntry.accountId) {
      const account = this.getSavingsAccounts().find(acc => acc.id === originalEntry.accountId);
      if (account) {
        this.updateSavingsAccount(originalEntry.accountId, { 
          balance: account.balance + originalEntry.amount 
        });
      }
    } else if (originalEntry.type === 'transfer' && originalEntry.accountId && originalEntry.transferToAccountId) {
      // Revert transfer
      this.transferBetweenAccounts(originalEntry.transferToAccountId, originalEntry.accountId, originalEntry.amount);
    }

    const updatedEntry = {
      ...originalEntry,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Apply new account changes
    if (updatedEntry.type === 'expense' && updatedEntry.accountId) {
      const account = this.getSavingsAccounts().find(acc => acc.id === updatedEntry.accountId);
      if (account && account.balance >= updatedEntry.amount) {
        this.updateSavingsAccount(updatedEntry.accountId, { 
          balance: account.balance - updatedEntry.amount 
        });
      } else {
        throw new Error('Insufficient balance in selected account');
      }
    } else if (updatedEntry.type === 'transfer' && updatedEntry.accountId && updatedEntry.transferToAccountId) {
      const success = this.transferBetweenAccounts(updatedEntry.accountId, updatedEntry.transferToAccountId, updatedEntry.amount);
      if (!success) {
        throw new Error('Transfer failed: insufficient balance or invalid accounts');
      }
    }

    entries[index] = updatedEntry;
    this.saveToStorage('spending', entries);
    return updatedEntry;
  }

  deleteSpendingEntry(id: string): boolean {
    const entries = this.getSpendingEntries();
    const entryIndex = entries.findIndex(entry => entry.id === id);
    if (entryIndex === -1) return false;

    const entry = entries[entryIndex];
    
    // Revert account changes
    if (entry.type === 'expense' && entry.accountId) {
      const account = this.getSavingsAccounts().find(acc => acc.id === entry.accountId);
      if (account) {
        this.updateSavingsAccount(entry.accountId, { 
          balance: account.balance + entry.amount 
        });
      }
    } else if (entry.type === 'transfer' && entry.accountId && entry.transferToAccountId) {
      // Revert transfer
      this.transferBetweenAccounts(entry.transferToAccountId, entry.accountId, entry.amount);
    }

    const filteredEntries = entries.filter(entry => entry.id !== id);
    this.saveToStorage('spending', filteredEntries);
    return true;
  }

  // Savings accounts
  getSavingsAccounts(): SavingsAccount[] {
    return this.getFromStorage('savings', []);
  }

  addSavingsAccount(account: Omit<SavingsAccount, 'id' | 'createdAt' | 'updatedAt'>): SavingsAccount {
    const accounts = this.getSavingsAccounts();
    const newAccount: SavingsAccount = {
      ...account,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    accounts.push(newAccount);
    this.saveToStorage('savings', accounts);
    return newAccount;
  }

  updateSavingsAccount(id: string, updates: Partial<SavingsAccount>): SavingsAccount | null {
    const accounts = this.getSavingsAccounts();
    const index = accounts.findIndex(account => account.id === id);
    if (index === -1) return null;

    accounts[index] = {
      ...accounts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveToStorage('savings', accounts);
    return accounts[index];
  }

  deleteSavingsAccount(id: string): boolean {
    const accounts = this.getSavingsAccounts();
    const filteredAccounts = accounts.filter(account => account.id !== id);
    if (filteredAccounts.length === accounts.length) return false;
    this.saveToStorage('savings', filteredAccounts);
    return true;
  }

  transferBetweenAccounts(fromId: string, toId: string, amount: number): boolean {
    const accounts = this.getSavingsAccounts();
    const fromAccount = accounts.find(acc => acc.id === fromId);
    const toAccount = accounts.find(acc => acc.id === toId);

    if (!fromAccount || !toAccount || fromAccount.balance < amount) {
      return false;
    }

    this.updateSavingsAccount(fromId, { balance: fromAccount.balance - amount });
    this.updateSavingsAccount(toId, { balance: toAccount.balance + amount });
    return true;
  }

  // Investments
  getInvestments(): Investment[] {
    return this.getFromStorage('investments', []);
  }

  addInvestment(investment: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>): Investment {
    const investments = this.getInvestments();
    const newInvestment: Investment = {
      ...investment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    investments.push(newInvestment);
    this.saveToStorage('investments', investments);
    return newInvestment;
  }

  updateInvestment(id: string, updates: Partial<Investment>): Investment | null {
    const investments = this.getInvestments();
    const index = investments.findIndex(investment => investment.id === id);
    if (index === -1) return null;

    investments[index] = {
      ...investments[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveToStorage('investments', investments);
    return investments[index];
  }

  deleteInvestment(id: string): boolean {
    const investments = this.getInvestments();
    const filteredInvestments = investments.filter(investment => investment.id !== id);
    if (filteredInvestments.length === investments.length) return false;
    this.saveToStorage('investments', filteredInvestments);
    return true;
  }

  // Settings
  getSettings(): AppSettings {
    const settings = this.getFromStorage('settings', defaultSettings);
    
    // Ensure all settings have proper defaults and no undefined values
    const mergedSettings: AppSettings = {
      monthlyTarget: settings.monthlyTarget ?? defaultSettings.monthlyTarget,
      categories: settings.categories ?? defaultSettings.categories,
      currency: settings.currency ?? defaultSettings.currency,
      darkMode: settings.darkMode ?? defaultSettings.darkMode,
      appTitle: settings.appTitle ?? defaultSettings.appTitle,
      logoUrl: settings.logoUrl ?? undefined,
      categoryColors: settings.categoryColors ?? defaultSettings.categoryColors
    };
    
    // Ensure all default categories have colors
    const updatedCategoryColors = { ...defaultCategoryColors };
    mergedSettings.categories.forEach(category => {
      if (!updatedCategoryColors[category]) {
        updatedCategoryColors[category] = '#6b7280'; // Default gray
      }
    });
    
    return {
      ...mergedSettings,
      categoryColors: updatedCategoryColors
    };
  }

  updateSettings(updates: Partial<AppSettings>): AppSettings {
    const currentSettings = this.getSettings();
    const newSettings = { ...currentSettings, ...updates };
    
    // If categories are updated, ensure colors exist for new categories
    if (updates.categories) {
      const updatedColors = { ...newSettings.categoryColors };
      updates.categories.forEach(category => {
        if (!updatedColors[category]) {
          updatedColors[category] = '#6b7280'; // Default gray
        }
      });
      newSettings.categoryColors = updatedColors;
    }
    
    this.saveToStorage('settings', newSettings);
    return newSettings;
  }

  // Currency helpers using new formatter
  getCurrencySymbol(): string {
    const settings = this.getSettings();
    return CurrencyFormatter.getSymbol(settings.currency);
  }

  getCurrency(): CurrencyConfig {
    const settings = this.getSettings();
    return CurrencyFormatter.getCurrency(settings.currency);
  }

  formatCurrency(amount: number): string {
    const settings = this.getSettings();
    return CurrencyFormatter.format(amount, settings.currency);
  }

  formatCurrencyWithoutSymbol(amount: number): string {
    const settings = this.getSettings();
    return CurrencyFormatter.formatWithoutSymbol(amount, settings.currency);
  }

  parseCurrency(formattedAmount: string): number {
    const settings = this.getSettings();
    return CurrencyFormatter.parse(formattedAmount, settings.currency);
  }

  // Number formatting helpers for charts and display
  formatNumberForChart(amount: number): string {
    const currencySymbol = this.getCurrencySymbol();
    return NumberFormatter.formatForChart(amount, currencySymbol);
  }

  abbreviateNumber(amount: number): string {
    return NumberFormatter.abbreviate(amount);
  }

  abbreviateCurrency(amount: number): string {
    const currencySymbol = this.getCurrencySymbol();
    return NumberFormatter.abbreviateCurrency(amount, currencySymbol);
  }

  // Analytics
  getMonthlySpending(year: number, month: number): number {
    const entries = this.getSpendingEntries();
    return entries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === year && 
               entryDate.getMonth() === month && 
               entry.type === 'expense'; // Only count expenses, not transfers
      })
      .reduce((total, entry) => total + entry.amount, 0);
  }

  getSpendingByCategory(startDate: string, endDate: string): Record<string, number> {
    const entries = this.getSpendingEntries();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return entries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= start && 
               entryDate <= end && 
               entry.type === 'expense'; // Only count expenses, not transfers
      })
      .reduce((acc, entry) => {
        acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
        return acc;
      }, {} as Record<string, number>);
  }

  getTotalSavings(): number {
    return this.getSavingsAccounts().reduce((total, account) => total + account.balance, 0);
  }

  getTotalInvestments(): number {
    return this.getInvestments().reduce((total, investment) => investment.amount, 0);
  }

  // Export functionality with proper currency formatting
  exportToCSV(type: 'spending' | 'savings' | 'investments'): string {
    let data: any[] = [];
    let headers: string[] = [];
    const settings = this.getSettings();

    switch (type) {
      case 'spending':
        data = this.getSpendingEntries();
        headers = ['Date', 'Type', 'Amount', 'Category', 'Description', 'Account', 'Transfer To'];
        break;
      case 'savings':
        data = this.getSavingsAccounts();
        headers = ['Bank Name', 'Account Name', 'Balance'];
        break;
      case 'investments':
        data = this.getInvestments();
        headers = ['Name', 'Amount', 'Date', 'Notes'];
        break;
    }

    const csvContent = [
      headers.join(','),
      ...data.map(item => {
        switch (type) {
          case 'spending':
            const accounts = this.getSavingsAccounts();
            const fromAccount = accounts.find(acc => acc.id === item.accountId);
            const toAccount = accounts.find(acc => acc.id === item.transferToAccountId);
            const formattedAmount = CurrencyFormatter.format(item.amount, settings.currency);
            return `${item.date},${item.type},"${formattedAmount}",${item.category},"${item.description || ''}","${fromAccount?.accountName || ''}","${toAccount?.accountName || ''}"`;
          case 'savings':
            const formattedBalance = CurrencyFormatter.format(item.balance, settings.currency);
            return `${item.bankName},${item.accountName},"${formattedBalance}"`;
          case 'investments':
            const formattedInvestmentAmount = CurrencyFormatter.format(item.amount, settings.currency);
            return `${item.name},"${formattedInvestmentAmount}",${item.date},"${item.notes || ''}"`;
          default:
            return '';
        }
      })
    ].join('\n');

    return csvContent;
  }

  downloadCSV(type: 'spending' | 'savings' | 'investments'): void {
    const csvContent = this.exportToCSV(type);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `financial_${type}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const dataManager = new DataManager();