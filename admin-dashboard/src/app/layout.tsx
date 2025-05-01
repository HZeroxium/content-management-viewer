// src/app/layout.tsx
"use client";

import { Inter } from "next/font/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeContextProvider } from "@/contexts/theme-context";
import { ReduxProvider } from "@/contexts/redux-provider";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Create a client for React Query
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <ReduxProvider>
            <ThemeContextProvider>{children}</ThemeContextProvider>
          </ReduxProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
