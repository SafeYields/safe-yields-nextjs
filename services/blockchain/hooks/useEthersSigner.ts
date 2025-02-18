import { useMemo } from 'react';
import { clientToSigner } from '../wagmi.ethers.adapter';
import { useConnectorClient, Config } from 'wagmi';

const useEthersSigner = ({ chainId }: { chainId?: number } = {}) => {
  const { data: client } = useConnectorClient<Config>({ chainId });
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
};

export default useEthersSigner;
