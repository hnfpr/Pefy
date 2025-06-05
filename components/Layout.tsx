import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Settings } from './Settings';
import { 
  PieChart, 
  TrendingUp, 
  Wallet, 
  CreditCard, 
  Moon, 
  Sun,
  Download,
  Settings as SettingsIcon
} from 'lucide-react';
import { AppSettings } from '../utils/dataManager';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  darkMode: boolean;
  onDarkModeToggle: () => void;
  onExport: (type: 'spending' | 'savings' | 'investments') => void;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

export function Layout({ 
  children, 
  activeTab, 
  onTabChange, 
  darkMode, 
  onDarkModeToggle,
  onExport,
  settings,
  onSettingsChange
}: LayoutProps) {
  const [showSettings, setShowSettings] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: PieChart },
    { id: 'spending', label: 'Spending', icon: CreditCard },
    { id: 'savings', label: 'Accounts', icon: Wallet },
    { id: 'investments', label: 'Investments', icon: TrendingUp },
  ];

  return (
    <div className={`min-h-screen bg-background transition-colors duration-200 ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <div className="px-6 py-4">
          {/* Responsive Header Layout */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            {/* Logo and Title */}
            <div className="flex items-center justify-center sm:justify-start">
              <div className="flex items-center space-x-3">
                {settings.logoUrl && (
                  <img 
                    src={settings.logoUrl} 
                    alt="Logo" 
                    className="w-8 h-8 object-contain"
                  />
                )}
                <h1 className="text-xl font-semibold text-center sm:text-left">{settings.appTitle}</h1>
              </div>
            </div>
            
            {/* Actions Section */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              {/* Export Buttons - Stack on mobile, inline on larger screens */}
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onExport('spending')}
                    className="text-xs justify-center"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    <span className="sm:hidden">Spending</span>
                    <span className="hidden sm:inline">Export Spending</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onExport('savings')}
                    className="text-xs justify-center"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    <span className="sm:hidden">Savings</span>
                    <span className="hidden sm:inline">Export Savings</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onExport('investments')}
                    className="text-xs justify-center"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    <span className="sm:hidden">Investments</span>
                    <span className="hidden sm:inline">Export Investments</span>
                  </Button>
                </div>
              </div>

              {/* Settings and Dark Mode - Horizontal row */}
              <div className="flex items-center justify-center space-x-4 sm:justify-end">
                {/* Dark Mode Toggle */}
                <div className="flex items-center space-x-2">
                  <Sun className="w-4 h-4" />
                  <Switch
                    checked={darkMode}
                    onCheckedChange={onDarkModeToggle}
                  />
                  <Moon className="w-4 h-4" />
                </div>

                {/* Settings Gear Icon */}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSettings(true)}
                >
                  <SettingsIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Navigation - Always horizontal but with better mobile spacing */}
          <div className="flex flex-wrap justify-center gap-1 mt-4 sm:justify-start sm:space-x-1 sm:flex-nowrap">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange(tab.id)}
                  className="flex items-center space-x-2 min-w-0 flex-shrink-0"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden xs:inline sm:inline">{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </Card>

      <Separator />

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        {children}
      </main>

      {/* Settings Modal */}
      <Settings
        open={showSettings}
        onOpenChange={setShowSettings}
        settings={settings}
        onSettingsChange={onSettingsChange}
      />
    </div>
  );
}