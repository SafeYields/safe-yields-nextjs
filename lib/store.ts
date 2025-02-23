import { config } from '@/app/providers';
import { toast } from '@/hooks/use-toast';
import { observable } from '@legendapp/state';
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage';
import { syncObservable } from '@legendapp/state/sync';
import { getChainId, switchChain } from '@wagmi/core';
import { arbitrum, flowMainnet } from 'wagmi/chains';

const chains: Record<TChain, { name: string; src: string }> = {
  [arbitrum.id]: {
    name: 'Arbitrum',
    src: '/images/arbitrum.svg',
  },
  [flowMainnet.id]: {
    name: 'Flow EVM',
    src: '/images/flow.svg',
  },
};

type TChain = 42_161 | 747;

interface IChainStore {
  chainId: TChain | undefined;
  setChainId: (chain: TChain) => void;
}

export function chainData(chain: TChain | undefined) {
  if (chain) {
    return chains[chain];
  }
  return undefined;
}

export const chain$ = observable<IChainStore>({
  chainId: getChainId(config),
  setChainId: async (chain) => {
    switchChain(config, { chainId: chain })
      .then(() => chain$.chainId.set(chain))
      .catch(() =>
        toast({
          title: 'Sorry. Failed to change network',
        }),
      );
  },
});

syncObservable(chain$, {
  persist: {
    name: 'chainId',
    plugin: ObservablePersistLocalStorage,
  },
});
