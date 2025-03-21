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
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { calculateAPYFromHistory, formatMonthYear } from '@/lib/utils';
import { useGetDashboardData } from '@/services/api/hooks/useGetDashboardData';
import {
  getMerkleProof,
  getUserAirdropAmount,
} from '@/services/blockchain/common';
import { SupportedChain } from '@/services/blockchain/constants/addresses';
import useEthersSigner from '@/services/blockchain/hooks/useEthersSigner';
import { useGetVaultData } from '@/services/blockchain/hooks/useGetVaultData';
import { useSafeYieldsContract } from '@/services/blockchain/safeyields.contracts';
import { TradingHistory } from '@/types/dashboard.types';
import { ethers, ZeroAddress } from 'ethers';
import { DollarSign, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import { useAccount } from 'wagmi';
import { set } from 'zod';

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
  const { toast } = useToast();
  const [sayStaked, setSayStaked] = useState('0');
  const [hasClaimedAirdrop, setHasClaimedAirdrop] = useState(false);
  const [isAirdropEligible, setIsAirdropEligible] = useState(false);
  const { address, chainId } = useAccount();
  const [loader, setLoader] = useState(false);

  const signer = useEthersSigner();

  const { sayStaker, sayAirdrop } = useSafeYieldsContract(signer);

  const dashboardData = useGetDashboardData(chainId);
  const dashboardHistory = useMemo(
    () => (dashboardData?.history ?? []) as TradingHistory[],
    [dashboardData],
  );
  //console.log('dashboard data: ', dashboardData);
  const firstData = dashboardHistory[0] as TradingHistory | undefined;
  const latestData = dashboardHistory[dashboardHistory.length - 1] as
    | TradingHistory
    | undefined;
  // console.log('latest data: ', latestData);

  const apy = useMemo(
    () => calculateAPYFromHistory(dashboardHistory),
    [dashboardHistory],
  );

  const { userEquity, userPnl } = useGetVaultData(chainId, address, latestData);
  // console.log('user equity: ', userEquity, 'user pnl: ', userPnl);

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

  useEffect(() => { 
    if (!address || chainId !== SupportedChain.Arbitrum) {
      setIsAirdropEligible(false);
      return;
    }
    const airdropData = getUserAirdropAmount(address);
    if (!airdropData || airdropData.amount === 0) {
      setIsAirdropEligible(false);
      return
    } else {
      setIsAirdropEligible(true);
    }

    sayAirdrop.hasClaimed(address).then((data) => {
      setHasClaimedAirdrop(data);
    });
  }, [sayAirdrop, address, chainId]);

  const airdropAmount =
    getUserAirdropAmount(address || ZeroAddress)?.amount ?? 0.0;

  const handleClaimAirdrop = async () => {
    if (!address) return;
    const data = getMerkleProof(address);

    if (await sayAirdrop.hasClaimed(address)) {
      return toast({
        title: 'User has already claimed airdrop',
      });
    }
    setLoader(true);
    try {
      const tx = await sayAirdrop.stakeAndVestSayTokens(
        data.amount,
        data.proof,
      );
      const receipt = await tx.wait();
      const hash = receipt!.hash;
      console.log('tx hash: ', hash);
      return toast({
        title: 'Transaction Successful!',
        description: `Your transaction was successful. Tx Hash: ${hash}`, // Shortened hash for readability
        action: (
          <ToastAction
            altText='View on Explorer'
            onClick={() =>
              window.open(`https://arbiscan.io/tx/${hash}`, '_blank')
            }
          >
            View
          </ToastAction>
        ),
      });
      setHasClaimedAirdrop(true);
    } catch (error) {
      console.error('error claiming airdrop', error);
      return toast({
        title: 'Error claiming airdrop',
      });
    } finally {
      setLoader(false);
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
                onClick={(e) => {
                  if (isAirdropEligible && !hasClaimedAirdrop) {
                    //console.log('clicked');
                    handleClaimAirdrop();
                  }
                }}
                className={`my-1 flex items-center justify-center gap-2 rounded-full text-xs font-bold text-white transition-all duration-200
            ${!isAirdropEligible || hasClaimedAirdrop ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#9999FF]'} 
            ${loader ? 'px-9 py-2 text-sm' : 'px-7 py-2'}`}
              >
                {loader && <Loader2 className='animate-spin' />}
                {!hasClaimedAirdrop? "Claim" : "Claimed"}
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
