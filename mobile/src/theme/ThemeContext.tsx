import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import { SettingsStore } from "../stores/settingsStore";
import {
  isDarkPalette,
  paletteFor,
  type Appearance,
  type ThemeColors,
} from "../theme";

type ThemeContextValue = {
  appearance: Appearance;
  setAppearance: (a: Appearance) => Promise<void>;
  colors: ThemeColors;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const systemDark = system === "dark";
  const [appearance, setAppearanceState] = useState<Appearance>("dark");

  useEffect(() => {
    let cancelled = false;
    void SettingsStore.getAppearance().then((a) => {
      if (cancelled) return;
      setAppearanceState(a);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setAppearance = useCallback(async (a: Appearance) => {
    setAppearanceState(a);
    await SettingsStore.setAppearance(a);
  }, []);

  const colors = useMemo(
    () => paletteFor(appearance, systemDark),
    [appearance, systemDark]
  );

  const value = useMemo(
    () => ({
      appearance,
      setAppearance,
      colors,
      isDark: isDarkPalette(colors),
    }),
    [appearance, setAppearance, colors]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
