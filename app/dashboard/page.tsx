'use client';

import ConnectButton from '@/components/connect-button';
import { Button } from '@/components/ui/button';
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
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import {
  balance$,
  balanceOf$,
  increaseAllowance$,
  plutoTradingHistroy$,
} from '@/lib/store';
import {
  getMerkleProof,
  getUserAirdropAmount,
} from '@/services/blockchain/common';
import { SupportedChain } from '@/services/blockchain/constants/addresses';
import useEthersSigner from '@/services/blockchain/hooks/useEthersSigner';
import { useSafeYieldsContract } from '@/services/blockchain/safeyields.contracts';
import { observer, Show, use$, useObservable } from '@legendapp/state/react';
import { Root as Separator } from '@radix-ui/react-separator';
import clsx from 'clsx';
import { format } from 'date-fns';
import { ethers, ZeroAddress } from 'ethers';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
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
  const { toast } = useToast();
  const account = useAccount();
  const balance = use$(balance$);
  const userShares = useObservable(() => {
    const balanceOf = balanceOf$.get();
    const increaseAllowance = increaseAllowance$.get();
    if (
      balanceOf &&
      balanceOf.data &&
      increaseAllowance &&
      increaseAllowance.data
    ) {
      return +balanceOf.data / +increaseAllowance.data;
    }
    return 0;
  });

  const [sayStaked, setSayStaked] = useState('0');
  const [hasClaimedAirdrop, setHasClaimedAirdrop] = useState(false);
  const [isAirdropEligible, setIsAirdropEligible] = useState(false);
  const [daysCount, setDaysCount] = useState<number>(30);
  const [loader, setLoader] = useState(false);

  const signer = useEthersSigner();

  const { sayStaker, sayAirdrop } = useSafeYieldsContract(signer);
  const apy = use$(() => plutoTradingHistroy$.apy.get());
  const todays_pnl = use$(() => tradingHistroy$.todays_pnl.get());
  const history = use$(() => tradingHistroy$.history.get());

  useEffect(() => {
    //NB staking only on arbitrum
    if (!account.address || account.chainId !== 42161) return;
    sayStaker
      .userStake(account.address)
      .then((data) => {
        setSayStaked(ethers.formatEther(data.stakeAmount));
      })
      .catch(() => { });
  }, [account.address, sayStaker, account.chainId]);

  useEffect(() => {
    if (!account.address || account.chainId !== SupportedChain.Arbitrum) {
      setIsAirdropEligible(false);
      return;
    }
    const airdropData = getUserAirdropAmount(account.address);
    if (!airdropData || airdropData.amount === 0) {
      setIsAirdropEligible(false);
      return;
    } else {
      setIsAirdropEligible(true);
    }

    sayAirdrop.hasClaimed(account.address).then((data) => {
      setHasClaimedAirdrop(data);
    });
  }, [sayAirdrop, account.address, account.chainId]);

  const airdropAmount =
    getUserAirdropAmount(account.address || ZeroAddress)?.amount ?? 0.0;

  const handleClaimAirdrop = async () => {
    if (!account.address) return;
    const data = getMerkleProof(account.address);

    if (await sayAirdrop.hasClaimed(account.address)) {
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

      setHasClaimedAirdrop(true);

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
    } catch {
      return toast({
        title: 'Error claiming airdrop',
      });
    } finally {
      setLoader(false);
    }
  };
  // TODO: Refactor.
  const tickFormatter = (date: Date) => {
    if (daysCount === 1) {
      return format(date, 'HH:mm');
    } else if (daysCount === 7) {
      return format(date, 'dd-MMM HH:mm');
    } else if (daysCount > 7 && daysCount <= 365) {
      return format(date, 'dd-MMM');
    } else {
      return format(date, 'MMM-yyyy');
    }
  };

  // TODO: Refactor.
  let triggerText;
  if (daysCount === 1) {
    triggerText = 'Last 24 hours';
  } else if (daysCount === 7) {
    triggerText = 'Last week';
  } else if (daysCount === 30) {
    triggerText = 'Last month';
  } else if (daysCount === 90) {
    triggerText = 'Last 3 months';
  } else if (daysCount === 365) {
    triggerText = 'Last year';
  } else {
    triggerText = 'All time';
  }

  const filteredHistory = useMemo(() => {
    if (!history) return [];
    const now = new Date();
    return history.filter((item) => {
      const updateTime = new Date(item.updateTime);
      const diffInDays =
        (now.getTime() - updateTime.getTime()) / (1000 * 60 * 60 * 24);
      return diffInDays <= daysCount;
    });
  }, [history, daysCount]);

  return (
    <div
      id='main-bg'
      className='my-8 flex w-full flex-col items-center justify-center gap-8'
    >
      {account.address ? (
        <>
          <div className='flex flex-col md:flex-row items-center justify-center w-full max-w-max lg:gap-2 md:h-28 max-h-fit'>
            <Separator
              decorative
              className='bg-brand-1 shrink-0 h-[1px] w-full md:h-full md:w-[1px] shadow-custom'
            />

            <div className='flex flex-row items-center text-brand-1 px-12 md:px-4 py-4 min-w-40'>
              <div className='flex w-full flex-col items-center'>
                <span className='text-sm font-medium text-white'>
                  Staked $SAY
                </span>
                <span className='text-lg font-bold'>{sayStaked}</span>
                <span className='text-sm font-medium text-white'>
                  Airdrop $SAY
                </span>
                <div className='flex flex-row gap-3'>
                  <span className='text-lg font-bold'>
                    {airdropAmount.toString()}
                  </span>
                  <button
                    className={`my-1 rounded-full bg-brand-1 px-5 text-xs font-bold text-black ${!isAirdropEligible || hasClaimedAirdrop ? 'bg-brand-2 cursor-not-allowed' : 'bg-brand-1'}
                 ${loader ? 'px-9 py-2 text-sm' : 'px-7 py-2'} 
              `}
                    onClick={() => {
                      if (isAirdropEligible && !hasClaimedAirdrop) {
                        handleClaimAirdrop();
                      }
                    }}
                  >
                    {loader && <Loader2 className='animate-spin' />}
                    {!hasClaimedAirdrop ? 'Claim' : 'Claimed'}
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
                    Number(
                      balance!.available_balance * userShares.get(),
                    ).toFixed(2)
                  }
                </Show>{' '}
              </span>
            </div>

            <Separator
              decorative
              className='bg-brand-1 shrink-0 h-[1px] w-full md:h-full md:w-[1px]  shadow-custom'
            />

            <div className='flex flex-col items-center gap-4 px-12 md:px-4 py-4 text-brand-1 min-w-40'>
              <span className='text-sm font-medium text-white'>
                Average APY
              </span>
              <span className='text-xl font-bold'>{apy?.toFixed(2)}%</span>
            </div>
            <Separator
              decorative
              className='bg-brand-1 shrink-0 h-[1px] w-full md:h-full md:w-[1px]  shadow-custom'
            />

            <div className='flex flex-col items-center gap-4  px-12 md:px-4 py-4 text-brand-1 min-w-40'>
              <span className='text-sm font-medium text-white'>PNL</span>
              <span className='text-xl font-bold'>
                <Show if={todays_pnl}>
                  ${Number((todays_pnl || 0) * userShares.get()).toFixed(2)}
                </Show>
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
                  <NavigationMenuTrigger>{triggerText}</NavigationMenuTrigger>
                  <NavigationMenuContent className='text-sm bg-[#F2ECE4] bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-25'>
                    <ul className='flex flex-col w-max'>
                      <li
                        onClick={() => setDaysCount(1)}
                        className={clsx(
                          'cursor-pointer hover:text-brand-1 py-3 px-4',
                          daysCount === 1 && 'text-brand-1',
                        )}
                      >
                        Last 24 hours
                      </li>
                      <li
                        onClick={() => setDaysCount(7)}
                        className={clsx(
                          'cursor-pointer hover:text-brand-1 py-3 px-4',
                          daysCount === 7 && 'text-brand-1',
                        )}
                      >
                        Last week
                      </li>
                      <li
                        onClick={() => setDaysCount(30)}
                        className={clsx(
                          'cursor-pointer hover:text-brand-1 py-3 px-4',
                          daysCount === 30 && 'text-brand-1',
                        )}
                      >
                        Last month
                      </li>
                      <li
                        onClick={() => setDaysCount(90)}
                        className={clsx(
                          'cursor-pointer hover:text-brand-1 py-3 px-4',
                          daysCount === 90 && 'text-brand-1',
                        )}
                      >
                        Last 3 months
                      </li>
                      <li
                        onClick={() => setDaysCount(365)}
                        className={clsx(
                          'cursor-pointer hover:text-brand-1 py-3 px-4',
                          daysCount === 365 && 'text-brand-1',
                        )}
                      >
                        Last year
                      </li>
                      <li
                        onClick={() => setDaysCount(99999)}
                        className={clsx(
                          'cursor-pointer hover:text-brand-1 py-3 px-4',
                          daysCount > 365 && 'text-brand-1',
                        )}
                      >
                        All time
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <Show ifReady={filteredHistory}>
              {() => (
                <>
                  <Card className='w-full bg-transparent bg-chart rounded-2xl'>
                    <CardContent className='py-4'>
                      <ChartContainer config={chartConfig}>
                        <LineChart
                          accessibilityLayer
                          data={filteredHistory}
                          margin={{
                            left: 12,
                            right: 12,
                          }}
                        >
                          <CartesianGrid />
                          <XAxis
                            dataKey='updateTime'
                            //tickLine={false}
                            //axisLine={false}
                            tickMargin={8}
                            minTickGap={20}
                            tickFormatter={(value) =>
                              tickFormatter(new Date(value))
                            }
                          />
                          <YAxis
                            dataKey={(item) => parseFloat(item.pnlPerc)}
                            includeHidden
                            allowDataOverflow
                            tickMargin={8}
                            tickCount={7}
                            tickFormatter={(value) => value.toFixed(3)}
                            domain={([dataMin, dataMax]) => {
                              if (dataMin === dataMax) {
                                 return [dataMin - 1, dataMax + 1];
                               }
                              const range = dataMax - dataMin;
                              const padding = range / 3;
                              return [dataMin - padding, dataMax + padding];
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
                </>
              )}
            </Show>
          </div>
        </>
      ) : (
        <>
          <Image
            src='/images/Emma_ALPHA_SY_Emma_Info.png'
            width='500'
            height='500'
            alt='info'
            className='py-16'
          />
          <span className='font-semibold'>
            Please connect your wallet to continue
          </span>
          <div className='flex flex-row gap-4 mb-20'>
            {/* !bg-gradient-to-r !from-[hsl(240,43%,37%)] !to-[hsl(162,81%,32%)] */}
            <ConnectButton className='px-12 text-black bg-brand-1' />
            <a href="https://www.safeyields.io/_files/ugd/56bef1_808fc263b7d04a4bb420be7b40262e80.pdf" target="_blank" rel="noopener noreferrer">
              <Button
                variant='outline'
                className='px-12 rounded-full text-base font-semibold border border-brand-1 transition-transform duration-200 hover:scale-105'
              >
                Read our Docs
              </Button>
            </a>
          </div>
        </>
      )}
    </div>
  );
}

export default observer(Dashboard);
