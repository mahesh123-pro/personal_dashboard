import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'blue' | 'purple' | 'emerald' | 'rose' | 'amber' | 'cyan';
export type FontFamily = 'inter' | 'outfit' | 'roboto' | 'jetbrains';
export type FontSize = 'compact' | 'normal' | 'comfortable' | 'large';
export type UiDensity = 'compact' | 'normal' | 'spacious';
export type LabelStyle = 'pill' | 'chip' | 'dot';

export interface UIPreferences {
  fontFamily: FontFamily;
  fontSize: FontSize;
  uiDensity: UiDensity;
  labelStyle: LabelStyle;
  showPriorityBadges: boolean;
  showCategoryIcons: boolean;
  dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MMM DD, YYYY';
  timeFormat: '12h' | '24h';
}

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
  isDark: boolean;
  preferences: UIPreferences;
  updatePreferences: (updates: Partial<UIPreferences>) => void;
}

const defaultPreferences: UIPreferences = {
  fontFamily: 'inter',
  fontSize: 'normal',
  uiDensity: 'normal',
  labelStyle: 'pill',
  showPriorityBadges: true,
  showCategoryIcons: true,
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '12h'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('personal_os_theme') as ThemeMode) || 'system';
  });

  const [accent, setAccentState] = useState<AccentColor>(() => {
    return (localStorage.getItem('personal_os_accent') as AccentColor) || 'blue';
  });

  const [preferences, setPreferencesState] = useState<UIPreferences>(() => {
    try {
      const saved = localStorage.getItem('personal_os_ui_prefs');
      if (saved) {
        return { ...defaultPreferences, ...JSON.parse(saved) };
      }
    } catch (e) {}
    return defaultPreferences;
  });

  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (t: ThemeMode, a: AccentColor, prefs: UIPreferences) => {
      let dark = false;
      if (t === 'dark') {
        dark = true;
      } else if (t === 'light') {
        dark = false;
      } else {
        dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      setIsDark(dark);
      if (dark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      root.setAttribute('data-accent', a);
      root.setAttribute('data-font', prefs.fontFamily);
      root.setAttribute('data-font-size', prefs.fontSize);
      root.setAttribute('data-density', prefs.uiDensity);
      root.setAttribute('data-label-style', prefs.labelStyle);
    };

    applyTheme(theme, accent, preferences);
    localStorage.setItem('personal_os_theme', theme);
    localStorage.setItem('personal_os_accent', accent);
    localStorage.setItem('personal_os_ui_prefs', JSON.stringify(preferences));

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light', accent, preferences);
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme, accent, preferences]);

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
  };

  const setAccent = (a: AccentColor) => {
    setAccentState(a);
  };

  const updatePreferences = (updates: Partial<UIPreferences>) => {
    setPreferencesState((prev) => ({ ...prev, ...updates }));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        accent,
        setAccent,
        isDark,
        preferences,
        updatePreferences
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
