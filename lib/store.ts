import { config } from '@/app/providers';
import { observable } from '@legendapp/state';
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage';
import { syncObservable } from '@legendapp/state/sync';
import { getAccount, watchAccount } from '@wagmi/core';
import { arbitrum, flowMainnet } from 'wagmi/chains';

const chains: Record<number, { name: string; src: string }> = {
  [arbitrum.id]: {
    name: 'Arbitrum',
    src: '/images/arbitrum.svg',
  },
  [flowMainnet.id]: {
    name: 'Flow EVM',
    src: '/images/flow.svg',
  },
};

export function chainData(chain: number | undefined) {
  if (chain) {
    return chains[chain];
  }
  return undefined;
}

export const account$ = observable(getAccount(config));

watchAccount(config, {
  onChange(account) {
    account$.assign(account);
  },
});

syncObservable(account$, {
  persist: {
    name: 'account',
    plugin: ObservablePersistLocalStorage,
  },
});
