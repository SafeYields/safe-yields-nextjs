import { useMemo } from 'react';
import { Config, useConnectorClient } from 'wagmi';
import { clientToSigner } from '../wagmi.ethers.adapter';

const useEthersSigner = ({ chainId }: { chainId?: number } = {}) => {
  const { data: client } = useConnectorClient<Config>({ chainId });
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
};

export default useEthersSigner;
