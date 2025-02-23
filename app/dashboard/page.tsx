'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { calculateAPYFromHistory, formatMonthYear } from '@/lib/utils';
import { useGetDashboardData } from '@/services/api/hooks/useGetDashboardData';
import {
  getMerkleProof,
  getUserAirdropAmount,
} from '@/services/blockchain/common';
import useEthersSigner from '@/services/blockchain/hooks/useEthersSigner';
import { useGetVaultData } from '@/services/blockchain/hooks/useGetVaultData';
import { useSafeYieldsContract } from '@/services/blockchain/safeyields.contracts';
import { TradingHistory } from '@/types/dashboard.types';
import { ethers, ZeroAddress } from 'ethers';
import { DollarSign } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import { useAccount } from 'wagmi';

const chartConfig = {
  pnl: {
    label: 'Pnl',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const chartData = [
  { updateTime: 'Jan', pnl: 75 },
  { updateTime: 'Feb', pnl: 80 },
  { updateTime: 'Mar', pnl: 85 },
  { updateTime: 'Apr', pnl: 90 },
  { updateTime: 'May', pnl: 92 },
  { updateTime: 'Jun', pnl: 88 },
  { updateTime: 'Jul', pnl: 85 },
  { updateTime: 'Aug', pnl: 80 },
  { updateTime: 'Sep', pnl: 78 },
  { updateTime: 'Oct', pnl: 82 },
  { updateTime: 'Nov', pnl: 90 },
  { updateTime: 'Dec', pnl: 95 },
];

export default function Dashboard() {
  const [sayStaked, setSayStaked] = useState('0');
  const { address, chainId } = useAccount();
  const signer = useEthersSigner();

  const { sayStaker, sayAirdrop } = useSafeYieldsContract(signer);

  const dashboardData = useGetDashboardData(chainId);
  const dashboardHistory = useMemo(
    () => (dashboardData?.history ?? []) as TradingHistory[],
    [dashboardData],
  );
  console.log('dashboard data: ', dashboardData);
  const firstData = dashboardHistory[0] as TradingHistory | undefined;
  const latestData = dashboardHistory[dashboardHistory.length - 1] as
    | TradingHistory
    | undefined;
  console.log('latest data: ', latestData);

  const apy = useMemo(
    () => calculateAPYFromHistory(dashboardHistory),
    [dashboardHistory],
  );

  const { userEquity, userPnl } = useGetVaultData(chainId, address, latestData);

  useEffect(() => {
    //NB staking only on arbitrum
    if (!address || chainId !== 42161) return;
    sayStaker
      .userStake(address)
      .then((data) => {
        setSayStaked(ethers.formatEther(data.stakeAmount));
      })
      .catch(() => {});
  }, [address, sayStaker, chainId]);

  const airdropAmount =
    getUserAirdropAmount(address || ZeroAddress)?.amount ?? 0.0;

  const handleClaimAirdrop = async () => {
    if (!address) return;
    const data = getMerkleProof(address);
    console.log('user: ', address, 'proof: ', data);
    if (!data.proof.length) {
      console.log('user not eligible for airdrop');
    }
    if (await sayAirdrop.hasClaimed(address)) {
      console.error('user has already claimed airdrop');
      //TODO: show error message to user
      return;
    }
    //TODO: show loading spinner
    try {
      const tx = await sayAirdrop.stakeAndVestSayTokens(
        data.amount,
        data.proof,
      );
      const receipt = await tx.wait();
      const hash = receipt!.hash;
      console.log('tx hash: ', hash);
      //TODO show success message to user with tx hash
    } catch (error) {
      console.error('error claiming airdrop', error);
      //TODO show error message to user
    } finally {
      //TODO: hide loading spinner
    }
  };
  return (
    <div className='my-8 flex w-full flex-col items-center justify-center gap-8'>
      <div className='flex w-full max-w-lg flex-col justify-center gap-4 lg:flex-row lg:gap-2'>
        <div className='p-card flex h-32 min-w-48 flex-row items-center rounded-3xl border border-[#4CFAC7] bg-card text-[#4CFAC7]'>
          <div className='flex w-full flex-col items-center'>
            <span className='text-sm font-medium text-white'>Staked $SAY</span>
            <span className='text-lg font-bold'>{sayStaked}</span>
            <span className='text-sm font-medium text-white'>Airdrop $SAY</span>
            <div className='flex flex-row gap-3'>
              <span className='text-lg font-bold'>
                {airdropAmount.toString()}
              </span>
              <button
                onClick={handleClaimAirdrop}
                className='my-1 rounded-full bg-[#9999FF] px-5 text-xs font-bold text-white'
              >
                Claim
              </button>
            </div>
          </div>
        </div>

        <div className='p-card flex h-32 min-w-48 flex-row items-center gap-4 rounded-3xl border border-[#4CFAC7] bg-card px-4 text-[#4CFAC7]'>
          <div className='inline-block h-min w-min rounded-xl bg-card p-1.5'>
            <DollarSign className='h-8 w-8 stroke-2' />
          </div>
          <div className='flex flex-col gap-2'>
            <span className='text-sm font-medium text-white'>
              Account Balance
            </span>
            <span className='text-xl font-bold'>${userEquity || '0.00'}</span>
          </div>
        </div>

        <div className='p-card flex h-32 min-w-48 flex-row items-center gap-4 rounded-3xl border border-[#4CFAC7] bg-card px-4 text-[#4CFAC7]'>
          <div className='inline-block h-min w-min rounded-xl bg-card p-1.5'>
            <DollarSign className='h-8 w-8 stroke-2' />
          </div>
          <div className='flex flex-col gap-2'>
            <span className='text-sm font-medium text-white'>Average APY</span>
            <span className='text-xl font-bold'>
              {dashboardData?.apy?.toFixed(2) || apy.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className='p-card flex h-32 min-w-48 flex-row items-center gap-4 rounded-3xl border border-[#4CFAC7] bg-card px-4 text-[#4CFAC7]'>
          <div className='inline-block h-min w-min rounded-xl bg-card p-1.5'>
            <DollarSign className='h-8 w-8 stroke-2' />
          </div>
          <div className='flex flex-col gap-2'>
            <span className='text-sm font-medium text-white'>PNL</span>
            <span className='text-xl font-bold'>${userPnl || '0.00'}</span>
          </div>
        </div>
        <div className='p-card flex h-32 min-w-48 flex-row items-center gap-4 rounded-3xl border border-[#4CFAC7] bg-card px-4 text-[#4CFAC7]'>
          <div className='inline-block h-min w-min rounded-xl bg-card p-1.5'>
            <DollarSign className='h-8 w-8 stroke-2' />
          </div>
          <div className='flex flex-col gap-2'>
            <span className='text-sm font-medium text-white'>
              Today&apos;s PNL
            </span>
            <span className='text-xl font-bold'>
              ${Number(dashboardData?.todays_pnl)?.toFixed(3) || '0.00'}
            </span>
          </div>
        </div>
      </div>

      <Card className='bg-gradient w-full max-w-lg rounded-2xl text-primary'>
        <CardHeader>
          <CardTitle>Line Chart</CardTitle>
          <CardDescription>
            {formatMonthYear(firstData?.updateTime ?? new Date().toString())} -{' '}
            {formatMonthYear(latestData?.updateTime ?? new Date().toString())}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={dashboardHistory.length ? dashboardHistory : chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='updateTime'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey='pnl'
                type='natural'
                stroke='var(--color-pnl)'
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
