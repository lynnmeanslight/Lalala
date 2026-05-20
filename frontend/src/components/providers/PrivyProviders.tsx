'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { activeChain } from '@/lib/chain';

export function PrivyProviders({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? 'placeholder-app-id'}
      config={{
        defaultChain: activeChain,
        supportedChains: [activeChain],
        appearance: {
          theme: 'light',
          accentColor: '#f97316',
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
        loginMethods: ['email'],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
