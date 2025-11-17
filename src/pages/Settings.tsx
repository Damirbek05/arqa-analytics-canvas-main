import { useTranslation } from 'react-i18next';
import { Monitor, Sun, Moon, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();

  const currentTheme = localStorage.getItem('theme') || 'system';
  const currentLanguage = i18n.language;

  const handleThemeChange = (theme: string) => {
    localStorage.setItem('theme', theme);
    
    // Apply theme
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    toast({
      title: "Theme updated",
      description: `Theme changed to ${theme}`,
    });
  };

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
    
    toast({
      title: "Language updated",
      description: `Language changed to ${language === 'en' ? 'English' : 'Русский'}`,
    });
  };

  // Initialize theme on component mount
  React.useEffect(() => {
    const theme = localStorage.getItem('theme') || 'system';
    handleThemeChange(theme);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground">
          Manage your application preferences and appearance
        </p>
      </div>

      <div className="grid gap-6">
        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              {t('settings.theme')}
            </CardTitle>
            <CardDescription>
              Choose how ARQA Mini Analytics looks to you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={currentTheme}
              onValueChange={handleThemeChange}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label 
                  htmlFor="light" 
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Sun className="h-4 w-4" />
                  {t('settings.light')}
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label 
                  htmlFor="dark" 
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Moon className="h-4 w-4" />
                  {t('settings.dark')}
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label 
                  htmlFor="system" 
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Monitor className="h-4 w-4" />
                  System
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('settings.language')}
            </CardTitle>
            <CardDescription>
              Choose your preferred language for the interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="language">{t('settings.language')}</Label>
              <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full md:w-48" id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🇺🇸</span>
                      English
                    </div>
                  </SelectItem>
                  <SelectItem value="ru">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🇷🇺</span>
                      Русский
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Application Info */}
        <Card>
          <CardHeader>
            <CardTitle>Application Information</CardTitle>
            <CardDescription>
              Version and build information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Version:</span>
                <p className="text-muted-foreground">1.0.0</p>
              </div>
              <div>
                <span className="font-medium">Build:</span>
                <p className="text-muted-foreground">Production</p>
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>
                <p className="text-muted-foreground">{new Date().toLocaleDateString('ru-RU')}</p>
              </div>
              <div>
                <span className="font-medium">Tech Stack:</span>
                <p className="text-muted-foreground">React + TypeScript + Vite</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Add React import at the top
import * as React from 'react';