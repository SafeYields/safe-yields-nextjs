import { config, queryClient } from '@/app/providers';
import { batch, linked, observable, when } from '@legendapp/state';
import { syncedQuery } from '@legendapp/state/sync-plugins/tanstack-query';
import { call, watchAccount } from '@wagmi/core';
import { ethers } from 'ethers';
import ky from 'ky';
import { arbitrum, flowMainnet } from 'wagmi/chains';

export type Exposure = {
  updateTime: string;
  exchange: string;
  pair: string;
  size: string;
  sizeUsd: string;
  currentPrice: string;
  liquidationPrice: string;
  fundingPnlUsd: string;
};

export type TradingHistory = {
  todays_pnl: number;
  max_daily_volatility: number;
  average_daily_volatility: number;
  max_drawdown: number;
  history: HistoryItem[];
  sharpe_ratio: number;
  apy: number;
  daily_stddev: number;
};

export type HistoryItem = {
  updateTime: string;
  updateReason: string;
  initialBalance: string;
  equity: string;
  unrealizedPnl: string;
  unrealizedPnlPerc: string;
  pnl: string;
  pnlPerc: string;
};

type ChainId = (typeof config.chains)[number]['id'];
export const chainId$ = observable<ChainId | undefined>(undefined);
const address$ = observable<`0x${string}` | undefined>(undefined);

watchAccount(config, {
  onChange(account) {
    batch(() => {
      chainId$.set(account.chainId as ChainId);
      address$.set(account.address);
    });
  },
});

export const arbitrumTradingHistroy$ = observable(
  syncedQuery({
    queryClient,
    query: {
      queryKey: ['arbitrum:trading:histroy'],
      queryFn: async () => {
        return ky<TradingHistory>(
          'https://trading-data.alphacube.io:8086/api/v1/history',
        ).json();
      },
    },
  }),
);

export const flowEVMTradingHistroy$ = observable(
  syncedQuery({
    queryClient,
    query: {
      queryKey: ['flowEVM:trading:histroy'],
      queryFn: async () => {
        return ky<TradingHistory>(
          'https://trading-data.alphacube.io:8085/api/v1/history',
        ).json();
      },
    },
  }),
);

export const plutoTradingHistroy$ = observable(
  syncedQuery({
    queryClient,
    query: {
      queryKey: ['pluto:trading:histroy'],
      queryFn: async () => {
        return ky<TradingHistory>(
          'https://trading-data.alphacube.io:8084/api/v1/history',
        ).json();
      },
    },
  }),
);

const plutoExposure$ = observable(() =>
  ky<{ exposures: Exposure[] }>(
    'https://trading-data.alphacube.io:8084/api/v1/exposure',
  )
    .json()
    .then((res) => res.exposures),
);

export const plutoExposurePaginated$ = observable({
  hasNext: false,
  hasPrev: false,
  page: 1,
  pageSize: 10,
  items: async () => {
    const page = plutoExposurePaginated$.page.get();
    const pageSize = plutoExposurePaginated$.pageSize.get();
    const exposures = await when(plutoExposure$);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    plutoExposurePaginated$.hasNext.set(endIndex < exposures.length);
    plutoExposurePaginated$.hasPrev.set(page > 1);
    return exposures.slice(startIndex, endIndex);
  },
});

const plutoBalance$ = observable(() =>
  ky<{ profit: number; available_balance: number }>(
    'https://trading-data.alphacube.io:8084/api/v1/balance',
  ).json(),
);

const flowEVMBalance$ = observable(() =>
  ky<{ profit: number; available_balance: number }>(
    'https://trading-data.alphacube.io:8085/api/v1/balance',
  ).json(),
);

const arbitrumBalance$ = observable(() =>
  ky<{ profit: number; available_balance: number }>(
    'https://trading-data.alphacube.io:8086/api/v1/balance',
  ).json(),
);

export const balance$ = observable(
  linked({
    get: () => {
      switch (chainId$.get()) {
        case arbitrum.id:
          return arbitrumBalance$.get();
        case flowMainnet.id:
          return flowEVMBalance$.get();
        default:
          return undefined;
      }
    },
  }),
);

export const totalLockedValue$ = observable<{ value: number | undefined }>({
  value: undefined,
});

export const balanceOf$ = observable(
  linked({
    get() {
      const chainId = chainId$.get();
      if (!chainId) {
        return undefined;
      }

      const to =
        chainId == arbitrum.id
          ? '0x3dc49d34704386d301c4e407b40b3ecf05225cd5'
          : '0x80a7660824ee5abdd347fbf0acfb0373785f2660';

      const address = address$.get();
      const encodedAddress = ethers.AbiCoder.defaultAbiCoder().encode(
        ['address'],
        [address],
      );

      return call(config, {
        to: to,
        data: `0x70a08231${encodedAddress.slice(2)}`,
        chainId: chainId,
        blockTag: 'latest',
      });
    },
  }),
);

export const increaseAllowance$ = observable(
  linked({
    get() {
      const chainId = chainId$.get();
      if (!chainId) {
        return undefined;
      }

      const to =
        chainId == arbitrum.id
          ? '0x3dc49d34704386d301c4e407b40b3ecf05225cd5'
          : '0x80a7660824ee5abdd347fbf0acfb0373785f2660';

      return call(config, {
        to: to,
        data: '0x18160ddd',
        chainId: chainId,
        blockTag: 'latest',
      });
    },
  }),
);

batch(async () => {
  const pluto = await when(plutoBalance$);
  const arbitrum = await when(arbitrumBalance$);
  const flowEVM = await when(flowEVMBalance$);

  totalLockedValue$.value.set(
    pluto.available_balance +
      arbitrum.available_balance +
      flowEVM.available_balance,
  );
});
