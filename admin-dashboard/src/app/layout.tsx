// src/app/layout.tsx
"use client";

import { ReactNode, createContext, useMemo } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { getPalette } from "@/theme/palette";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import { store, RootState } from "@/lib/store";
import { useDispatch, useSelector } from "react-redux";
import { toggleDarkMode } from "@/lib/store/slices/ui.slice";

export const ColorModeContext = createContext({ toggle: () => {} });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Provide Redux store first */}
        <ReduxProvider store={store}>
          {/* Then use a child component that can access Redux */}
          <ThemeWrapper>{children}</ThemeWrapper>
        </ReduxProvider>
      </body>
    </html>
  );
  // This component can now safely use Redux hooks because it's inside the Provider
  function ThemeWrapper({ children }: { children: ReactNode }) {
    // Now we can use Redux hooks here safely
    const dispatch = useDispatch();

    const darkMode = useSelector((state: RootState) => state.ui.darkMode);

    // Color mode context value
    const colorMode = useMemo(
      () => ({
        toggle: () => {
          dispatch(toggleDarkMode());
        },
      }),
      [dispatch]
    );

    // Create theme based on dark mode state
    const theme = useMemo(() => {
      const palette = getPalette(darkMode ? "dark" : "light");
      return createTheme({
        palette,
        // Add your theme customizations here
      });
    }, [darkMode]);

    // Create React Query client
    const queryClient = useMemo(() => new QueryClient(), []);

    return (
      <QueryClientProvider client={queryClient}>
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </ColorModeContext.Provider>
      </QueryClientProvider>
    );
  }
}
