import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type ThemeType = 'default' | 'ocean' | 'dark' | 'yellow';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeType>('default');

  useEffect(() => {
    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem('theme') as ThemeType | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, []);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Apply theme classes to document
    document.documentElement.classList.remove('theme-default', 'theme-ocean', 'theme-dark', 'theme-yellow');
    document.documentElement.classList.add(`theme-${newTheme}`);

    // Update colors for mobile browsers
    updateThemeMetaTags(newTheme);
  };

  useEffect(() => {
    // Apply current theme when it changes
    document.documentElement.classList.remove('theme-default', 'theme-ocean', 'theme-dark', 'theme-yellow');
    document.documentElement.classList.add(`theme-${theme}`);
    updateThemeMetaTags(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Helper function to update theme meta tags for mobile browsers
function updateThemeMetaTags(theme: ThemeType) {
  let color = '#4f46e5'; // default primary color
  
  switch (theme) {
    case 'ocean':
      color = '#0ea5e9';
      break;
    case 'dark':
      color = '#18181b';
      break;
    case 'yellow':
      color = '#eab308';
      break;
  }

  // Update theme-color meta tag
  let metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (!metaThemeColor) {
    metaThemeColor = document.createElement('meta');
    metaThemeColor.setAttribute('name', 'theme-color');
    document.head.appendChild(metaThemeColor);
  }
  metaThemeColor.setAttribute('content', color);
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}