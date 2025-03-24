'use client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import {
  balance$,
  balanceOf$,
  increaseAllowance$,
  plutoTradingHistroy$,
} from '@/lib/store';
import { trimDecimalPlaces } from '@/lib/utils';
import { approveSpending, getAllowance } from '@/services/blockchain/common';
import useEthersSigner from '@/services/blockchain/hooks/useEthersSigner';
import { useSafeYieldsContract } from '@/services/blockchain/safeyields.contracts';
import { Show, use$, useObservable } from '@legendapp/state/react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import clsx from 'clsx';
import { format } from 'date-fns';
import { ethers } from 'ethers';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { useAccount } from 'wagmi';
import Info from './info';
import OpenPosition from './open-position';

const chartConfig = {
  pnlPerc: {
    label: 'Pnl',
    color: 'hsla(162, 95%, 64%, 1)',
  },
} satisfies ChartConfig;

export default function Vaults() {
  const { toast } = useToast();
  const { openConnectModal } = useConnectModal();
  const { address, isConnected } = useAccount();
  const signer = useEthersSigner()!;
  const [depositLoader, setDepostLoader] = useState(false);
  const [daysCount, setDaysCount] = useState<number>(30);
  const { usdc, emmaVault } = useSafeYieldsContract(signer);
  const data = use$(plutoTradingHistroy$);
  const [amounts, setAmounts] = useState({
    amountFormatted: '0',
    amountBigint: BigInt(0),
  });

  const userShares = useObservable(() => {
    const balanceOf = balanceOf$.get();
    const increaseAllowance = increaseAllowance$.get();
    if (
      balanceOf &&
      balanceOf.data &&
      increaseAllowance &&
      increaseAllowance.data
    ) {
      console.log(balanceOf);
      return +balanceOf.data / +increaseAllowance.data;
    }
    return 0;
  });

  const balance = use$(balance$);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;

    if (isNaN(+input)) return;

    input = trimDecimalPlaces(input, 3);

    const amountFormatted = input;
    const amountBigint = ethers.parseUnits(input, 6);

    setAmounts({ amountFormatted, amountBigint });
  };

  const handleEmmaVaultDeposit = async () => {
    //@Mohammed Screen loading, if used, can be turned off here
    setDepostLoader(true);
    if (!address) {
      setDepostLoader(false);
      return toast({
        title: 'You Need to Connect Your Wallet',
        action: (
          <ToastAction altText='connect wallet' onClick={openConnectModal}>
            Connect
          </ToastAction>
        ),
      });
    }

    if (amounts.amountBigint === BigInt(0)) {
      setDepostLoader(false);
      return toast({
        title: 'Please enter an amount',
      });
    }

    const allowance = await getAllowance(
      usdc,
      address,
      await emmaVault.getAddress(),
    );

    if (allowance < amounts.amountBigint) {
      try {
        const txHash = await approveSpending(
          usdc,
          await emmaVault.getAddress(),
          amounts.amountBigint,
        );
        console.log('approval hash: ', txHash);
        toast({
          title: 'Request approved',
        });
      } catch (error) {
        console.error('error approving spending: ', error);

        return toast({
          title: 'Request Failed',
        });
      } finally {
        setDepostLoader(false);
      }
    }

    try {
      const tx = await emmaVault.deposit(amounts.amountBigint, address);
      await tx.wait();
      // const txResponse = await tx.wait()
      // const txHash = txResponse!.hash

      setAmounts({
        amountFormatted: '0',
        amountBigint: BigInt(0),
      });

      //@Mohammed add toast message to user with txHash to view on explorer
    } catch (error) {
      console.error('error depositing into emma vault: ', error);
    } finally {
      setDepostLoader(false);
    }
  };

  const handleEmmaVaultWithdraw = async () => {
    setDepostLoader(true);
    if (!address) {
      setDepostLoader(false);
      return openConnectModal!();
    }
    if (amounts.amountBigint === BigInt(0)) {
      setDepostLoader(false);
      return toast({
        title: 'Please enter an amount',
      });
    }

    const userVaultShares = await emmaVault.balanceOf(address);
    const sharesPreviewed = await emmaVault.previewWithdraw(
      amounts.amountBigint,
    );

    if (userVaultShares < sharesPreviewed) {
      setDepostLoader(false);
      return toast({
        title: 'Insufficient Funds to Withdraw',
      });
    }

    try {
      const tx = await emmaVault.withdraw(
        amounts.amountBigint,
        address,
        address,
      );
      const txResponse = await tx.wait();
      const txHash = txResponse!.hash;

      console.log('withdraw hash: ', txHash);
      //@Mohammed add toast message to user with txHash to view on explorer
    } catch (error) {
      console.error('error withdrawing from emma vault: ', error);
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
    if (!data?.history) return [];
    const now = new Date();
    return data.history.filter((item) => {
      const updateTime = new Date(item.updateTime);
      const diffInDays =
        (now.getTime() - updateTime.getTime()) / (1000 * 60 * 60 * 24);
      return diffInDays <= daysCount;
    });
  }, [data, daysCount]);

  return (
    <div className='mt-8 py-4 grid grid-cols-1 gap-16 md:grid-cols-[28rem_2fr] justify-center items-start px-8 md:px-20'>
      <div className='flex min-w-md flex-grow flex-col gap-12'>
        <Alert className='bg-brand-2'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Deposits and Withdrawls paused until Epoch ends on April 1st 12:00
            UTC.
          </AlertDescription>
        </Alert>
        <div>
          <Tabs
            defaultValue='deposit'
            className='bg-[#F2ECE41F] rounded-xl py-4 px-2'
          >
            <TabsList className='justify-start w-full items-center bg-transparent flex flex-row px-6'>
              <TabsTrigger
                value='deposit'
                className='max-w-min data-[state=active]:bg-transparent data-[state=active]:text-brand-2'
              >
                Deposit
              </TabsTrigger>
              <TabsTrigger
                value='withdraw'
                disabled
                className='max-w-min data-[state=active]:bg-transparent data-[state=active]:text-brand-2'
              >
                Withdraw
              </TabsTrigger>
              <div className='w-full flex items-center justify-end px-4 text-white'>
                <RefreshCw className='w-6 h-6' />
              </div>
            </TabsList>
            <TabsContent value='deposit'>
              <Card className='bg-transparent space-y-4 mt-4 border-0'>
                <CardContent className='flex flex-col gap-3'>
                  <div className='relative'>
                    <Input
                      onChange={handleAmountChange}
                      type='number'
                      name='amount'
                      className='peer rounded-xl pe-12 ps-6 [appearance:textfield] focus-visible:ring-[1.5px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none bg-[#F2ECE41F] rounded-3xl py-4'
                    />
                    <span className='pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm text-white/90 peer-disabled:opacity-50'>
                      USDC
                    </span>
                  </div>
                  <div className='flex justify-between text-xs px-4'>
                    <span>Your current position</span>
                    <Show ifReady={balance}>
                      {() =>
                        Number(
                          balance!.available_balance * userShares.get(),
                        ).toFixed(2)
                      }
                    </Show>{' '}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleEmmaVaultDeposit}
                    className='w-full rounded-full bg-brand-2 text-white'
                    disabled={depositLoader || !isConnected}
                  >
                    {depositLoader && <Loader2 className='animate-spin' />}
                    {isConnected ? 'Deposit' : 'Connect Wallet'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value='withdraw'>
              <Card className='bg-transparent space-y-4 mt-4'>
                <CardContent>
                  <div className='relative'>
                    <Input
                      type='number'
                      name='amount'
                      onChange={handleAmountChange}
                      className='peer rounded-xl pe-12 ps-6 [appearance:textfield] focus-visible:ring-[1.5px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none bg-[#F2ECE41F] rounded-3xl py-4'
                    />
                    <span className='pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm text-white/90 peer-disabled:opacity-50'>
                      USDC
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleEmmaVaultWithdraw}
                    className='w-full rounded-full bg-brand-2 text-white'
                  >
                    Withdraw
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Tabs className='w-full max-w-2xl mx-auto' defaultValue='info'>
        <TabsList className='bg-transparent w-full items-center flex gap-16'>
          <TabsTrigger
            value='info'
            className='data-[state=active]:text-brand-1 data-[state=active]:font-bold font-normal text-xl'
          >
            Vault info
          </TabsTrigger>
          <TabsTrigger
            value='chart'
            className='data-[state=active]:text-brand-1 data-[state=active]:font-bold font-normal text-xl'
          >
            Performance Chart
          </TabsTrigger>
          <TabsTrigger
            value='position'
            className='data-[state=active]:text-brand-1 data-[state=active]:font-bold font-normal text-xl'
          >
            Open Positions
          </TabsTrigger>
        </TabsList>
        <TabsContent value='info' className='mt-12'>
          <Info />
        </TabsContent>
        <TabsContent value='chart' className='mt-12'>
          <div className='text-primary flex flex-col mx-auto'>
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
            <Show ifReady={data}>
              {() => (
                <Card className='w-full bg-transparent bg-chart rounded-2xl max-w-5x'>
                  <CardContent>
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
                          dataKey={(item) =>
                            item.pnlPerc - item.unrealizedPnlPerc
                          }
                          includeHidden
                          allowDataOverflow
                          tickMargin={8}
                          tickCount={7}
                          tickFormatter={(value) => value.toFixed(3)}
                          domain={([dataMin, dataMax]) => {
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
              )}
            </Show>
          </div>
        </TabsContent>
        <TabsContent value='position' className='mt-12'>
          <OpenPosition />
        </TabsContent>
      </Tabs>
    </div>
  );
}
