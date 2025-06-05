import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { dataManager, AppSettings, CURRENCY_OPTIONS } from '../utils/dataManager';
import { Upload, Palette, Type, DollarSign, Moon, Sun, Image } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

export function Settings({ open, onOpenChange, settings, onSettingsChange }: SettingsProps) {
  // Initialize localSettings with proper defaults to avoid undefined values
  const [localSettings, setLocalSettings] = useState<AppSettings>({
    monthlyTarget: settings.monthlyTarget || 1000,
    categories: settings.categories || [],
    currency: settings.currency || 'USD',
    darkMode: settings.darkMode || false,
    appTitle: settings.appTitle || 'Personal Finance Dashboard',
    logoUrl: settings.logoUrl || undefined,
    categoryColors: settings.categoryColors || {}
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Ensure all settings have proper defaults
    setLocalSettings({
      monthlyTarget: settings.monthlyTarget || 1000,
      categories: settings.categories || [],
      currency: settings.currency || 'USD',
      darkMode: settings.darkMode || false,
      appTitle: settings.appTitle || 'Personal Finance Dashboard',
      logoUrl: settings.logoUrl || undefined,
      categoryColors: settings.categoryColors || {}
    });
  }, [settings]);

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    if (!localSettings.appTitle || !localSettings.appTitle.trim()) {
      newErrors.appTitle = 'App title is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix the errors and try again');
      return;
    }

    try {
      // Handle logo upload if file is selected
      if (logoFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const logoUrl = e.target?.result as string;
          const updatedSettings = dataManager.updateSettings({
            ...localSettings,
            logoUrl
          });
          onSettingsChange(updatedSettings);
          toast.success('Settings saved successfully! Changes will apply immediately.');
          
          // Small delay to ensure settings are fully applied before closing modal
          setTimeout(() => {
            onOpenChange(false);
          }, 500);
        };
        reader.readAsDataURL(logoFile);
      } else {
        const updatedSettings = dataManager.updateSettings(localSettings);
        onSettingsChange(updatedSettings);
        toast.success('Settings saved successfully! Changes will apply immediately.');
        
        // Small delay to ensure settings are fully applied before closing modal
        setTimeout(() => {
          onOpenChange(false);
        }, 500);
      }
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleColorChange = (category: string, color: string) => {
    setLocalSettings(prev => ({
      ...prev,
      categoryColors: {
        ...prev.categoryColors,
        [category]: color
      }
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('Logo file size must be less than 2MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      setLogoFile(file);
    }
  };

  const removeLogo = () => {
    setLocalSettings(prev => ({
      ...prev,
      logoUrl: undefined
    }));
    setLogoFile(null);
  };

  const resetColors = () => {
    const defaultColors = {
      'Food': '#ef4444',
      'Transport': '#f97316',
      'Entertainment': '#eab308',
      'Shopping': '#22c55e',
      'Utilities': '#06b6d4',
      'Healthcare': '#3b82f6',
      'Education': '#8b5cf6',
      'Other': '#6b7280'
    };
    
    setLocalSettings(prev => ({
      ...prev,
      categoryColors: defaultColors
    }));
    toast.success('Colors reset to default');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Application Settings</DialogTitle>
          <DialogDescription>
            Customize your financial dashboard to match your preferences.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Currency Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={localSettings.currency || 'USD'} 
                    onValueChange={(value) => setLocalSettings(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    This currency will be used throughout the application for all financial displays.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Moon className="w-5 h-5" />
                  <span>Theme Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle between light and dark themes
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sun className="w-4 h-4" />
                    <Switch
                      checked={localSettings.darkMode || false}
                      onCheckedChange={(checked) => setLocalSettings(prev => ({ 
                        ...prev, 
                        darkMode: checked 
                      }))}
                    />
                    <Moon className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Color Settings */}
          <TabsContent value="colors" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="w-5 h-5" />
                  <span>Category Colors</span>
                </CardTitle>
                <Button variant="outline" size="sm" onClick={resetColors}>
                  Reset to Default
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(localSettings.categories || []).map((category) => (
                    <div key={category} className="flex items-center justify-between">
                      <Label className="flex-1">{category}</Label>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: localSettings.categoryColors?.[category] || '#6b7280' }}
                        />
                        <Input
                          type="color"
                          value={localSettings.categoryColors?.[category] || '#6b7280'}
                          onChange={(e) => handleColorChange(category, e.target.value)}
                          className="w-12 h-8 p-0 border-0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  These colors will be used in charts and category displays throughout the app.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Settings */}
          <TabsContent value="branding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Type className="w-5 h-5" />
                  <span>App Title</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="appTitle">Application Title</Label>
                  <Input
                    id="appTitle"
                    value={localSettings.appTitle || ''}
                    onChange={(e) => setLocalSettings(prev => ({ 
                      ...prev, 
                      appTitle: e.target.value 
                    }))}
                    placeholder="Enter your app title"
                    className={errors.appTitle ? 'border-red-500' : ''}
                  />
                  {errors.appTitle && (
                    <Alert className="mt-1">
                      <AlertDescription className="text-sm text-red-600">
                        {errors.appTitle}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Image className="w-5 h-5" />
                  <span>Logo</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(localSettings.logoUrl || logoFile) && (
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={logoFile ? URL.createObjectURL(logoFile) : localSettings.logoUrl} 
                        alt="Logo preview" 
                        className="w-10 h-10 object-contain rounded"
                      />
                      <span className="text-sm font-medium">
                        {logoFile ? logoFile.name : 'Current logo'}
                      </span>
                    </div>
                    <Button variant="outline" size="sm" onClick={removeLogo}>
                      Remove
                    </Button>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-muted-foreground/50 transition-colors">
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload logo (Max 2MB)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, GIF up to 2MB
                        </p>
                      </div>
                    </div>
                  </Label>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}