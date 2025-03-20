'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { balance$, plutoTradingHistroy$ } from '@/lib/store';
import {
  getMerkleProof,
  getUserAirdropAmount,
} from '@/services/blockchain/common';
import useEthersSigner from '@/services/blockchain/hooks/useEthersSigner';
import { useGetVaultData } from '@/services/blockchain/hooks/useGetVaultData';
import { useSafeYieldsContract } from '@/services/blockchain/safeyields.contracts';
import { observer, Show, use$ } from '@legendapp/state/react';
import { Root as Separator } from '@radix-ui/react-separator';
import { ethers, ZeroAddress } from 'ethers';
import { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { useAccount } from 'wagmi';
import { tradingHistroy$ } from './util';

const chartConfig = {
  pnlPerc: {
    label: 'PnlPerc',
    color: 'hsla(162, 95%, 64%, 1)',
  },
} satisfies ChartConfig;

function Dashboard() {
  const account = useAccount();
  const balance = use$(balance$);

  const [sayStaked, setSayStaked] = useState('0');

  const signer = useEthersSigner();

  const { sayStaker, sayAirdrop } = useSafeYieldsContract(signer);
  const apy = use$(() => plutoTradingHistroy$.apy.get());
  const todays_pnl = use$(() => tradingHistroy$.todays_pnl.get());
  const history = use$(() => tradingHistroy$.history.get());
  const latestData = history?.at(-1);

  const { userShares } = useGetVaultData(
    account.chainId,
    account.address,
    latestData,
  );

  useEffect(() => {
    //NB staking only on arbitrum
    if (!account.address || account.chainId !== 42161) return;
    sayStaker
      .userStake(account.address)
      .then((data) => {
        setSayStaked(ethers.formatEther(data.stakeAmount));
      })
      .catch(() => {});
  }, [account.address, sayStaker, account.chainId]);

  const airdropAmount =
    getUserAirdropAmount(account.address || ZeroAddress)?.amount ?? 0.0;

  const handleClaimAirdrop = async () => {
    if (!account.address) return;
    const data = getMerkleProof(account.address);
    console.log('user: ', account.address, 'proof: ', data);
    if (!data.proof.length) {
      console.log('user not eligible for airdrop');
    }
    if (await sayAirdrop.hasClaimed(account.address)) {
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
    <div
      id='main-bg'
      className='my-8 flex w-full flex-col items-center justify-center gap-8'
    >
      <div className='flex flex-col md:flex-row items-center justify-center w-full max-w-max lg:gap-2 md:h-28 max-h-fit'>
        <Separator
          decorative
          className='bg-brand-1 shrink-0 h-[1px] w-full md:h-full md:w-[1px] shadow-custom'
        />

        <div className='flex flex-row items-center text-brand-1 px-12 md:px-4 py-4 min-w-40'>
          <div className='flex w-full flex-col items-center'>
            <span className='text-sm font-medium text-white'>Staked $SAY</span>
            <span className='text-lg font-bold'>{sayStaked}</span>
            <span className='text-sm font-medium text-white'>Airdrop $SAY</span>
            <div className='flex flex-row gap-3'>
              <span className='text-lg font-bold'>
                {airdropAmount.toString()}
              </span>
              <button
                className='my-1 rounded-full bg-brand-1 px-5 text-xs font-bold text-black'
                onClick={handleClaimAirdrop}
              >
                Claim
              </button>
            </div>
          </div>
        </div>

        <Separator
          decorative
          className='bg-brand-1 shrink-0 h-[1px] w-full md:h-full md:w-[1px]  shadow-custom'
        />

        <div className='flex flex-col items-center gap-4 px-12 md:px-4 py-4 text-brand-1 min-w-40'>
          <span className='text-sm font-medium text-white'>
            Portfolio Balance
          </span>
          <span className='text-xl font-bold'>
            $
            <Show ifReady={balance}>
              {() =>
                Number(balance!.available_balance * +userShares).toFixed(2)
              }
            </Show>{' '}
          </span>
        </div>

        <Separator
          decorative
          className='bg-brand-1 shrink-0 h-[1px] w-full md:h-full md:w-[1px]  shadow-custom'
        />

        <div className='flex flex-col items-center gap-4 px-12 md:px-4 py-4 text-brand-1 min-w-40'>
          <span className='text-sm font-medium text-white'>Average APY</span>
          <span className='text-xl font-bold'>{apy?.toFixed(2)}%</span>
        </div>
        <Separator
          decorative
          className='bg-brand-1 shrink-0 h-[1px] w-full md:h-full md:w-[1px]  shadow-custom'
        />

        <div className='flex flex-col items-center gap-4  px-12 md:px-4 py-4 text-brand-1 min-w-40'>
          <span className='text-sm font-medium text-white'>PNL</span>
          <span className='text-xl font-bold'>
            ${Number((todays_pnl || 0) * +userShares).toFixed(2)}
          </span>
        </div>
        <Separator
          decorative
          className='bg-brand-1 shrink-0 h-[1px] w-full md:h-full md:w-[1px]  shadow-custom'
        />

        <div className='flex flex-col items-center gap-4  px-12 md:px-4 py-4 text-brand-1 min-w-40'>
          <span className='text-sm font-medium text-white'>
            Today&apos;s PNL
          </span>
          <span className='text-xl font-bold'>
            $
            <Show ifReady={todays_pnl} else='0'>
              {() => todays_pnl?.toFixed(2)}
            </Show>
          </span>
        </div>
        <Separator
          decorative
          className='bg-brand-1 shrink-0 h-[1px] w-full md:h-full md:w-[1px]  shadow-custom'
        />
      </div>
      <div className='xl:w-1/2 w-3/4 text-primary flex flex-col'>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Last 30 days</NavigationMenuTrigger>
              <NavigationMenuContent className='text-sm bg-[#F2ECE4] bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-25'>
                <ul className='flex flex-col w-max'>
                  <li className='cursor-pointer hover:text-brand-1 py-3 px-4'>
                    Last 3 months
                  </li>
                  <li className='cursor-pointer hover:text-brand-1 py-3 px-4'>
                    All time
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Show ifReady={history}>
          <Card className='w-full bg-transparent bg-chart rounded-2xl'>
            <CardContent className='py-4'>
              <ChartContainer config={chartConfig}>
                <LineChart
                  accessibilityLayer
                  data={history}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid />
                  <XAxis
                    dataKey='updateTime'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) =>
                      new Intl.DateTimeFormat('en-US').format(new Date(value))
                    }
                  />
                  <YAxis
                    dataKey={(item) => item.pnlPerc - item.unrealizedPnlPerc}
                    includeHidden
                    allowDataOverflow
                    tickMargin={8}
                    tickCount={7}
                    tickFormatter={(value) => value.toFixed(3)}
                    domain={([dataMin, dataMax]) => {
                      const range = dataMax - dataMin
                      const padding = range/3
                      return [dataMin - padding, dataMax];
                    }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />

                  <Line
                    dataKey='pnlPerc'
                    type='natural'
                    stroke='var(--color-pnlPerc)'
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </Show>
      </div>
    </div>
  );
}

export default observer(Dashboard)
