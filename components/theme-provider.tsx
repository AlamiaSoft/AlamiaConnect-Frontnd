"use client"
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
  useTheme, // Added useTheme import from next-themes
} from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export { useTheme }
