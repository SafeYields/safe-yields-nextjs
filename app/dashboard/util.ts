'use client';
import {
  arbitrumTradingHistroy$,
  chainId$,
  flowEVMTradingHistroy$,
} from '@/lib/store';
import { linked, observable } from '@legendapp/state';
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

export const tradingHistroy$ = observable(
  linked({
    get: () => {
      switch (chainId$.get()) {
        case arbitrum.id:
          return arbitrumTradingHistroy$.get();
        case flowMainnet.id:
          return flowEVMTradingHistroy$.get();
        default:
          return undefined;
      }
    },
    initial: undefined,
  }),
);
