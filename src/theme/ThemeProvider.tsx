import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { Colors, type ColorScheme, type ThemeColors } from './colors';
import { Spacing, Radius } from './spacing';
import { FontSize, FontWeight, LineHeight, FontFamily } from './typography';

interface ThemeContextValue {
  scheme: ColorScheme;
  colors: ThemeColors;
  spacing: typeof Spacing;
  radius: typeof Radius;
  fontSize: typeof FontSize;
  fontWeight: typeof FontWeight;
  lineHeight: typeof LineHeight;
  fontFamily: typeof FontFamily;
  toggleScheme: () => void;
  setScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [override, setOverride] = useState<ColorScheme | null>(null);

  const scheme: ColorScheme =
    override ?? (systemScheme === 'dark' ? 'dark' : 'light');

  const toggleScheme = useCallback(() => {
    setOverride((prev) => {
      const current = prev ?? (systemScheme === 'dark' ? 'dark' : 'light');
      return current === 'dark' ? 'light' : 'dark';
    });
  }, [systemScheme]);

  const setScheme = useCallback((s: ColorScheme) => setOverride(s), []);

  const value = useMemo(
    () => ({
      scheme,
      colors: Colors[scheme],
      spacing: Spacing,
      radius: Radius,
      fontSize: FontSize,
      fontWeight: FontWeight,
      lineHeight: LineHeight,
      fontFamily: FontFamily,
      toggleScheme,
      setScheme,
    }),
    [scheme, toggleScheme, setScheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return ctx;
}
