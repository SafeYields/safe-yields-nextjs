'use client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { trimDecimalPlaces } from '@/lib/utils';
import { approveSpending, getAllowance } from '@/services/blockchain/common';
import useEthersSigner from '@/services/blockchain/hooks/useEthersSigner';
import { useSafeYieldsContract } from '@/services/blockchain/safeyields.contracts';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import { useAccount } from 'wagmi';

const chartConfig = {
  pnl: {
    label: 'Pnl',
    color: 'hsla(162, 95%, 64%, 1)',
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

export default function Vaults() {
  const { toast } = useToast();
  const { openConnectModal } = useConnectModal();
  const { address } = useAccount();
  const signer = useEthersSigner()!;
  const [depositLoader, setDepostLoader] = useState(false);
  const { usdc, emmaVault } = useSafeYieldsContract(signer);

  const [amounts, setAmounts] = useState({
    amountFormatted: '0',
    amountBigint: BigInt(0),
  });

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

  return (
    <div className='mt-8 py-4 grid grid-cols-1 gap-16 md:grid-cols-[350px_2fr] items-start px-8'>
      <div className='flex flex-grow flex-col gap-12'>
        <Alert className='bg-[#99f]'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Your funds will remain locked until the next epoch on March 16th.
          </AlertDescription>
        </Alert>
        <div>
          <Tabs
            defaultValue='deposit'
            className='bg-[#F2ECE41F] rounded-xl px-4'
          >
            <TabsList className='w-full justify-start bg-transparent py-6'>
              <TabsTrigger
                value='deposit'
                className='max-w-min data-[state=active]:bg-transparent data-[state=active]:text-[#99f]'
              >
                Deposit
              </TabsTrigger>
              <TabsTrigger
                value='withdraw'
                disabled
                className='max-w-min data-[state=active]:bg-transparent data-[state=active]:text-[#99f]'
              >
                Withdraw
              </TabsTrigger>
            </TabsList>
            <TabsContent value='deposit'>
              <Card className='bg-transparent space-y-4 mt-4'>
                <CardContent>
                  <div className='relative'>
                    <Input
                      onChange={handleAmountChange}
                      type='number'
                      name='amount'
                      className='peer rounded-xl pe-12 ps-6 [appearance:textfield] focus-visible:ring-[1.5px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none bg-[#F2ECE41F] rounded-3xl'
                    />
                    <span className='pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm text-white/90 peer-disabled:opacity-50'>
                      USDC
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleEmmaVaultDeposit}
                    className='w-full rounded-full bg-[#99f] text-white'
                    disabled={depositLoader}
                  >
                    {depositLoader && <Loader2 className='animate-spin' />}
                    Deposit
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
                      className='peer rounded-xl pe-12 ps-6 [appearance:textfield] focus-visible:ring-[1.5px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none bg-[#F2ECE41F] rounded-3xl'
                    />
                    <span className='pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm text-white/90 peer-disabled:opacity-50'>
                      USDC
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleEmmaVaultWithdraw}
                    className='w-full rounded-full bg-[#99f] text-white'
                  >
                    Withdraw
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Tabs className='w-full' defaultValue='info'>
        <TabsList className='bg-transparent items-center flex'>
          <TabsTrigger
            value='info'
            className='data-[state=active]:text-[#4CFAC7] data-[state=active]:font-bold text-lg'
          >
            Vault info
          </TabsTrigger>
          <TabsTrigger
            value='chart'
            className='data-[state=active]:text-[#4CFAC7] data-[state=active]:font-bold text-lg'
          >
            Historical Performance Chart
          </TabsTrigger>
        </TabsList>
        <TabsContent value='info'>
          <h3 className='scroll-m-20 text-2xl font-semibold tracking-tight'>
            Delta Neutral Funding Rate Arbitrage
          </h3>
          <p className='leading-7 [&:not(:first-child)]:mt-6'>
            Unlock potential with our Delta-neutral Funding Rate Arbitrage
            strategy, designed to exploit funding rate differentials across
            exchanges, while maintaining a neutral position in the market.
          </p>
          <ul className='my-6 ml-6 list-disc [&>li]:mt-2'>
            <li>
              <span className='font-bold'>Automatic Adjustments:</span> Responds
              dynamically to market changes to ensure optimal positioning.
            </li>
            <li>
              <span className='font-bold'>Data-Driven Decisions:</span> Uses
              real-time market data for enhanced decision-making on entries and
              exits.
            </li>
            <li>
              <span className='font-bold'>Enhanced Risk Management:</span>{' '}
              Employs stringent risk controls to mitigate exposure and enhance
              security.
            </li>
          </ul>
          <p className='leading-7 [&:not(:first-child)]:mt-6'>
            his strategy integrates advanced trading techniques with
            straightforward execution, providing a reliable tool for{' '}
            <span className='text-[#99f] font-bold '>
              diversifying your portfolio
            </span>{' '}
            and{' '}
            <span className='text-[#99f] font-bold'>
              achieving consistent returns.
            </span>
          </p>
          <div className='grid grid-cols-3 mt-4'>
            <div className='flex flex-col justify-center items-center border-l-2 border-[#4CFAC7] h-18 gap-2'>
              <span className='font-medium text-xs'>Average APY</span>
              <span className='font-bold text-[#4CFAC7]'>34%</span>
            </div>
            <div className='flex flex-col justify-center items-center border-l-2 border-[#4CFAC7] h-18 gap-2'>
              <span className='font-medium text-xs'>Total Value Locked</span>
              <span className='font-bold text-[#4CFAC7]'>34USDC</span>
            </div>
            <div className='flex flex-col justify-center items-center border-x-2 border-[#4CFAC7] h-18 gap-2'>
              <span className='font-medium text-xs'>
                Historical Max. Downdrawn
              </span>
              <span className='font-bold text-[#4CFAC7]'>34%</span>
            </div>
          </div>
        </TabsContent>
        <TabsContent value='chart'>
          <Card className='bg-gradient w-3/4 rounded-2xl text-primary bg-chart mx-auto'>
            <CardHeader>
              <CardTitle></CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <LineChart
                  accessibilityLayer
                  data={chartData}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
