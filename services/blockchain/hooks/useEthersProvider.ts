import { useMemo } from 'react';
import { Config, useAccount, useClient } from 'wagmi';
import { clientToProvider } from '../wagmi.ethers.adapter';

export function useEthersProvider() {
  const { chainId } = useAccount();

  const client = useClient<Config>({ chainId });
  return useMemo(
    () => (client ? clientToProvider(client) : undefined),
    [client],
  );
}

export default useEthersProvider;
