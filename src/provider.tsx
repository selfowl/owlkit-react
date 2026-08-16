"use client";

/** Wagmi + Query + kit context, lifecycle, and shipped modal. */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { WagmiProvider, type State } from "wagmi";
import { OwlKitContextProvider, OwlKitThemeRoot } from "./context";
import { OwlKitLifecycle } from "./lifecycle";
import { OwlKitModal } from "./modal";
import type { OwlKit } from "./kit";

type OwlKitProviderProps = {
  children: ReactNode;
  kit: OwlKit;
  initialState?: State;
};

export function OwlKitProvider({
  children,
  kit,
  initialState,
}: OwlKitProviderProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={kit.getConfig()} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <OwlKitContextProvider kit={kit}>
          <OwlKitLifecycle kit={kit} />
          <OwlKitThemeRoot kit={kit}>
            {children}
            <OwlKitModal />
          </OwlKitThemeRoot>
        </OwlKitContextProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
