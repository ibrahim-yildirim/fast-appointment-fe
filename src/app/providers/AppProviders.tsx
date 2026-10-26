import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

import { ThemeProvider } from "@/app/providers/ThemeProvider"
import { Toaster } from "@/components/ui/sonner"
import { useTokenRefreshTimer } from "@/features/auth/hooks/useTokenRefreshTimer"

export function AppProviders({ children }: { children: React.ReactNode }) {
  useTokenRefreshTimer()
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false } } }),
  )

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
