import { config } from '@/app/providers';
import { batch, linked, observable, when } from '@legendapp/state';
import { watchAccount } from '@wagmi/core';
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
const chainId$ = observable<ChainId | undefined>(undefined);

watchAccount(config, {
  onChange(account) {
    chainId$.set(account.chainId as ChainId);
  },
});
const arbitrumTradingHistroy$ = observable(() =>
  ky<TradingHistory>(
    'https://trading-data.alphacube.io:8086/api/v1/history',
  ).json(),
);
const flowEVMTradingHistroy$ = observable(() =>
  ky<TradingHistory>(
    'https://trading-data.alphacube.io:8085/api/v1/history',
  ).json(),
);

export const plutoExposure$ = observable(() =>
  ky<{ exposures: Exposure[] }>(
    'https://trading-data.alphacube.io:8084/api/v1/exposure',
  )
    .json()
    .then((res) => res.exposures),
);

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
