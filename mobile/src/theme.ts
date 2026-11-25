/** PhoneNap tokens — Instagram-inspired black/white chrome, teal accent. */

export type Appearance = "system" | "light" | "dark";

export type ThemeColors = {
  ink: string;
  inkSoft: string;
  sea: string;
  seaDeep: string;
  bg: string;
  surface: string;
  fog: string;
  border: string;
  onPrimary: string;
  dusk: string;
  duskMid: string;
  moon: string;
  moonGlow: string;
  white: string;
  danger: string;
  status: "dark" | "light";
};

/** Light: pure white canvas, near-black type (IG feed). */
export const lightColors: ThemeColors = {
  ink: "#262626",
  inkSoft: "#8e8e8e",
  sea: "#2a6f6b",
  seaDeep: "#1a4543",
  bg: "#ffffff",
  surface: "#ffffff",
  fog: "#fafafa",
  border: "#dbdbdb",
  onPrimary: "#ffffff",
  dusk: "#0f2a32",
  duskMid: "#163a42",
  moon: "#f0d9a8",
  moonGlow: "#ffe8b8",
  white: "#ffffff",
  danger: "#ed4956",
  status: "dark",
};

/** Dark: pure black canvas (IG dark mode). */
export const darkColors: ThemeColors = {
  ink: "#f5f5f5",
  inkSoft: "#a8a8a8",
  sea: "#5cb3ad",
  seaDeep: "#8fd4cf",
  bg: "#000000",
  surface: "#121212",
  fog: "#1a1a1a",
  border: "#262626",
  onPrimary: "#000000",
  dusk: "#000000",
  duskMid: "#121212",
  moon: "#f0d9a8",
  moonGlow: "#ffe8b8",
  white: "#ffffff",
  danger: "#ed4956",
  status: "light",
};

/** Boot / pre-provider fallback (light). */
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export function paletteFor(
  appearance: Appearance,
  systemDark: boolean
): ThemeColors {
  const dark =
    appearance === "dark" || (appearance === "system" && systemDark);
  return dark ? darkColors : lightColors;
}

export function isDarkPalette(c: ThemeColors): boolean {
  return c.bg === darkColors.bg;
}
