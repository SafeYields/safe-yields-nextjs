'use client';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { arbitrum, flowMainnet } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'SafeYields',
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
  chains: [flowMainnet, arbitrum],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
const queryClient = new QueryClient();

export default function Providers({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
