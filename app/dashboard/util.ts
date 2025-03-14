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
