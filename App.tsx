import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { SpendingTracker } from './components/SpendingTracker';
import { SavingsManager } from './components/SavingsManager';
import { InvestmentTracker } from './components/InvestmentTracker';
import { Toaster } from './components/ui/sonner';
import { dataManager, AppSettings } from './utils/dataManager';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settings, setSettings] = useState(() => dataManager.getSettings());
  const [currencySymbol, setCurrencySymbol] = useState(() => dataManager.getCurrencySymbol());
  const [settingsKey, setSettingsKey] = useState(0); // Force re-render when settings change

  // Comprehensive settings update effect
  useEffect(() => {
    // Apply dark mode class to document
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Update currency symbol when settings change
    const newCurrencySymbol = dataManager.getCurrencySymbol();
    setCurrencySymbol(newCurrencySymbol);

    // Update document title
    document.title = settings.appTitle || 'Personal Finance Dashboard';

    // Update favicon if logo is available (optional enhancement)
    if (settings.logoUrl) {
      let favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(favicon);
      }
      favicon.href = settings.logoUrl;
    }
  }, [settings, settingsKey]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleDarkModeToggle = () => {
    const newSettings = dataManager.updateSettings({ darkMode: !settings.darkMode });
    setSettings(newSettings);
    setCurrencySymbol(dataManager.getCurrencySymbol());
    setSettingsKey(prev => prev + 1); // Force re-render
  };

  const handleUpdateTarget = (target: number) => {
    const newSettings = dataManager.updateSettings({ monthlyTarget: target });
    setSettings(newSettings);
    setCurrencySymbol(dataManager.getCurrencySymbol());
    setSettingsKey(prev => prev + 1); // Force re-render
  };

  const handleUpdateCategories = (categories: string[]) => {
    const newSettings = dataManager.updateSettings({ categories });
    setSettings(newSettings);
    setCurrencySymbol(dataManager.getCurrencySymbol());
    setSettingsKey(prev => prev + 1); // Force re-render
  };

  const handleSettingsChange = (newSettings: AppSettings) => {
    // Update the settings state
    setSettings(newSettings);
    
    // Immediately reload settings from dataManager to ensure consistency
    const reloadedSettings = dataManager.getSettings();
    setSettings(reloadedSettings);
    
    // Update currency symbol to ensure it reflects the new currency
    const newCurrencySymbol = dataManager.getCurrencySymbol();
    setCurrencySymbol(newCurrencySymbol);
    
    // Force complete re-render of all components
    setSettingsKey(prev => prev + 1);
    
    // Small delay to ensure all state updates are processed
    setTimeout(() => {
      // Trigger another update to catch any missed updates
      const finalSettings = dataManager.getSettings();
      const finalCurrencySymbol = dataManager.getCurrencySymbol();
      setSettings(finalSettings);
      setCurrencySymbol(finalCurrencySymbol);
    }, 100);
  };

  const handleExport = (type: 'spending' | 'savings' | 'investments') => {
    try {
      dataManager.downloadCSV(type);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Currency formatting functions to pass to components
  const formatCurrency = (amount: number) => dataManager.formatCurrency(amount);
  const formatCurrencyWithoutSymbol = (amount: number) => dataManager.formatCurrencyWithoutSymbol(amount);
  const parseCurrency = (formattedAmount: string) => dataManager.parseCurrency(formattedAmount);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            key={`dashboard-${settingsKey}`} // Force re-render on settings change
            onUpdateTarget={handleUpdateTarget}
            monthlyTarget={settings.monthlyTarget}
            currencySymbol={currencySymbol}
            formatCurrency={formatCurrency}
            categoryColors={settings.categoryColors}
          />
        );
      case 'spending':
        return (
          <SpendingTracker 
            key={`spending-${settingsKey}`} // Force re-render on settings change
            categories={settings.categories}
            onUpdateCategories={handleUpdateCategories}
            currencySymbol={currencySymbol}
            formatCurrency={formatCurrency}
            formatCurrencyWithoutSymbol={formatCurrencyWithoutSymbol}
            parseCurrency={parseCurrency}
          />
        );
      case 'savings':
        return (
          <SavingsManager 
            key={`savings-${settingsKey}`} // Force re-render on settings change
            currencySymbol={currencySymbol}
            formatCurrency={formatCurrency}
            formatCurrencyWithoutSymbol={formatCurrencyWithoutSymbol}
            parseCurrency={parseCurrency}
          />
        );
      case 'investments':
        return (
          <InvestmentTracker 
            key={`investments-${settingsKey}`} // Force re-render on settings change
            currencySymbol={currencySymbol}
            formatCurrency={formatCurrency}
            formatCurrencyWithoutSymbol={formatCurrencyWithoutSymbol}
            parseCurrency={parseCurrency}
          />
        );
      default:
        return (
          <Dashboard 
            key={`dashboard-default-${settingsKey}`} // Force re-render on settings change
            onUpdateTarget={handleUpdateTarget}
            monthlyTarget={settings.monthlyTarget}
            currencySymbol={currencySymbol}
            formatCurrency={formatCurrency}
            categoryColors={settings.categoryColors}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground" key={`app-${settingsKey}`}>
      <Layout
        key={`layout-${settingsKey}`} // Force re-render on settings change
        activeTab={activeTab}
        onTabChange={handleTabChange}
        darkMode={settings.darkMode}
        onDarkModeToggle={handleDarkModeToggle}
        onExport={handleExport}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      >
        {renderActiveTab()}
      </Layout>
      <Toaster 
        key={`toaster-${settingsKey}`} // Force re-render on settings change
        position="top-right"
        expand={true}
        richColors
        closeButton
        theme={settings.darkMode ? 'dark' : 'light'}
      />
    </div>
  );
}