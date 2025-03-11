'use client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { trimDecimalPlaces } from '@/lib/utils';
import { approveSpending, getAllowance } from '@/services/blockchain/common';
import useEthersSigner from '@/services/blockchain/hooks/useEthersSigner';
import { useSafeYieldsContract } from '@/services/blockchain/safeyields.contracts';
import { Root as Separator } from '@radix-ui/react-separator';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Line, LineChart } from 'recharts';
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

const openPositions = [
  {
    pair: 'HBAR-USDT',
    exchange: 'Binance',
    sizeUSD: 6874.17,
    currentPrice: 0.2342,
    fundingPNL: undefined,
  },
  {
    pair: 'HBAR-USDT',
    exchange: 'Hyperliquid',
    sizeUSD: -6874.17,
    currentPrice: 0.2342,
    fundingPNL: undefined,
  },
  {
    pair: 'CELO-USDT',
    exchange: 'Binance',
    sizeUSD: 6874.17,
    currentPrice: 0.2342,
    fundingPNL: undefined,
  },
  {
    pair: 'HBAR-USDT',
    exchange: 'Hyperliquid',
    sizeUSD: -6874.17,
    currentPrice: 0.2342,
    fundingPNL: undefined,
  },
];

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

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
      <div className='flex min-w-lg flex-grow flex-col gap-12'>
        <Alert className='bg-brand-2'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Your funds will remain locked until the next epoch on March 16th.
          </AlertDescription>
        </Alert>
        <div>
          <Tabs defaultValue='deposit' className='bg-[#F2ECE41F] rounded-xl'>
            <TabsList className='w-full justify-start bg-transparent py-6'>
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
            </TabsList>
            <TabsContent value='deposit'>
              <Card className='bg-transparent space-y-4 mt-4 border-0'>
                <CardContent>
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
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleEmmaVaultDeposit}
                    className='w-full rounded-full bg-brand-2 text-white'
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
        <TabsList className='bg-transparent items-center flex'>
          <TabsTrigger
            value='info'
            className='data-[state=active]:text-brand-1 data-[state=active]:font-bold text-xl'
          >
            Vault info
          </TabsTrigger>
          <TabsTrigger
            value='chart'
            className='data-[state=active]:text-brand-1 data-[state=active]:font-bold text-xl'
          >
            Historical Performance Chart
          </TabsTrigger>
          <TabsTrigger
            value='position'
            className='data-[state=active]:text-brand-1 data-[state=active]:font-bold text-xl'
          >
            Open Position
          </TabsTrigger>
        </TabsList>
        <TabsContent value='info'>
          <h3 className='scroll-m-20 text-xl font-semibold tracking-tight flex items-center gap-2'>
            <div>
              <svg
                width='22'
                height='22'
                viewBox='0 0 22 22'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <circle cx='10' cy='13' r='9' fill='#9999FF' />
                <path
                  d='M9.05021 8.01215L7.85239 5.40356C5.21718 10.674 2.60859 15.9178 0 21.1882C0.77193 21.1882 1.464 21.2148 2.15608 21.1882C2.28917 21.1882 2.50212 21.0551 2.58197 20.922C3.11434 19.8839 3.62008 18.8458 4.15245 17.8077C5.74955 14.5869 7.37326 11.3927 8.97036 8.17186C8.97036 8.09201 9.02359 8.06539 9.05021 8.01215Z'
                  fill='#F2ECE4'
                />
                <path
                  d='M13.9744 18.8457C13.8146 18.8457 13.6816 18.8457 13.5485 18.8457C11.073 18.8457 8.59747 18.8191 6.12197 18.8191C5.93564 18.8191 5.64284 18.9522 5.56299 19.1119C5.21695 19.7773 4.95077 20.4428 4.63135 21.2414C8.11834 21.2414 11.5787 21.2414 15.0657 21.2414L13.9744 18.8457Z'
                  fill='#F2ECE4'
                />
                <path
                  d='M7.98535 5.03085L10.5407 0L21.1614 21.1349L15.332 21.0817L7.98535 5.03085Z'
                  fill='#F2ECE4'
                />
              </svg>
            </div>
            Delta Neutral Funding Rate Arbitrage
          </h3>
          <p className='leading-7 [&:not(:first-child)]:mt-6 text-base'>
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
            <span className='text-brand-2 font-bold '>
              diversifying your portfolio
            </span>{' '}
            and{' '}
            <span className='text-brand-2 font-bold'>
              achieving consistent returns.
            </span>
          </p>
          <div className='flex flex-col md:flex-row mt-4 md:h-20 max-h-fit max-w-fit items-center mx-auto gap-4'>
            <Separator
              decorative
              className='bg-brand-1 shrink-0 h-[1px] w-full md:h-full md:w-[1px] hidden md:block shadow-custom'
            />
            <div className='flex flex-col justify-center items-center gap-2 flex-1 py-2 min-w-max'>
              <div className='flex flex-row gap-4'>
                <span className='font-medium text-xs'>Average APY</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <svg
                      width='11'
                      height='11'
                      viewBox='0 0 11 11'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M0.5 5.5C0.5 2.73858 2.73858 0.5 5.5 0.5C8.26142 0.5 10.5 2.73858 10.5 5.5C10.5 8.26142 8.26142 10.5 5.5 10.5H0.5V5.5Z'
                        stroke='#F2ECE4'
                      />
                      <path
                        d='M6.17772 2.57294C6.17772 2.7321 6.11406 2.87533 6.00265 3.00265C5.89125 3.11406 5.74801 3.17772 5.58886 3.17772C5.50928 3.17772 5.44562 3.1618 5.36605 3.12997C5.30239 3.09814 5.23873 3.0504 5.17507 3.00265C5.12732 2.95491 5.07958 2.89125 5.04775 2.81167C5.01592 2.7321 5 2.66843 5 2.57294C5 2.49337 5.01592 2.42971 5.04775 2.36605C5.07958 2.30239 5.12732 2.23873 5.17507 2.17507C5.22281 2.12732 5.28647 2.07958 5.36605 2.04775C5.42971 2.01591 5.50928 2 5.58886 2C5.66844 2 5.7321 2.01591 5.81167 2.04775C5.87533 2.07958 5.93899 2.12732 6.00265 2.17507C6.06631 2.22281 6.09814 2.28647 6.12997 2.35013C6.1618 2.41379 6.17772 2.49337 6.17772 2.57294ZM6.11406 7.42706C6.11406 7.60212 6.06631 7.74536 5.97082 7.84085C5.87533 7.95225 5.74801 8 5.58886 8C5.42971 8 5.30239 7.95225 5.2069 7.84085C5.11141 7.72944 5.06366 7.60212 5.06366 7.42706V4.56233C5.06366 4.38727 5.11141 4.24403 5.2069 4.14854C5.30239 4.03714 5.42971 3.98939 5.58886 3.98939C5.74801 3.98939 5.87533 4.03714 5.97082 4.14854C6.06631 4.25995 6.11406 4.38727 6.11406 4.56233V7.42706Z'
                        fill='#F2ECE4'
                      />
                    </svg>
                  </PopoverTrigger>
                  <PopoverContent
                    align='start'
                    className='bg-[#F2ECE4] text-xs text-black rounded-e-3xl rounded-b-3xl'
                  >
                    Represents the rate of return over a year, accounting for
                    the effect of compounding interest and it&apos;s calculated from
                    all time historical data.
                  </PopoverContent>
                </Popover>
              </div>
              <span className='font-bold text-brand-1'>34%</span>
            </div>
            <Separator
              decorative
              className='bg-brand-1 shrink-0 h-[1px] w-full md:h-full md:w-[1px] shadow-custom'
            />

            <div className='flex flex-col justify-center items-center gap-2 flex-1 py-2 min-w-max'>
              <span className='font-medium text-xs'>Total Value Locked</span>
              <span className='font-bold text-brand-1'>34USDC</span>
            </div>
            <Separator
              decorative
              className='bg-brand-1 shrink-0 h-[1px] w-full md:h-full md:w-[1px] shadow-custom'
            />
            <div className='flex flex-col justify-center items-center gap-2 flex-1 py-2 min-w-max'>
              <div className='flex flex-row gap-4'>
                <span className='font-medium text-xs'>
                  Historical Max. Downdrawn
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <svg
                      width='11'
                      height='11'
                      viewBox='0 0 11 11'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M0.5 5.5C0.5 2.73858 2.73858 0.5 5.5 0.5C8.26142 0.5 10.5 2.73858 10.5 5.5C10.5 8.26142 8.26142 10.5 5.5 10.5H0.5V5.5Z'
                        stroke='#F2ECE4'
                      />
                      <path
                        d='M6.17772 2.57294C6.17772 2.7321 6.11406 2.87533 6.00265 3.00265C5.89125 3.11406 5.74801 3.17772 5.58886 3.17772C5.50928 3.17772 5.44562 3.1618 5.36605 3.12997C5.30239 3.09814 5.23873 3.0504 5.17507 3.00265C5.12732 2.95491 5.07958 2.89125 5.04775 2.81167C5.01592 2.7321 5 2.66843 5 2.57294C5 2.49337 5.01592 2.42971 5.04775 2.36605C5.07958 2.30239 5.12732 2.23873 5.17507 2.17507C5.22281 2.12732 5.28647 2.07958 5.36605 2.04775C5.42971 2.01591 5.50928 2 5.58886 2C5.66844 2 5.7321 2.01591 5.81167 2.04775C5.87533 2.07958 5.93899 2.12732 6.00265 2.17507C6.06631 2.22281 6.09814 2.28647 6.12997 2.35013C6.1618 2.41379 6.17772 2.49337 6.17772 2.57294ZM6.11406 7.42706C6.11406 7.60212 6.06631 7.74536 5.97082 7.84085C5.87533 7.95225 5.74801 8 5.58886 8C5.42971 8 5.30239 7.95225 5.2069 7.84085C5.11141 7.72944 5.06366 7.60212 5.06366 7.42706V4.56233C5.06366 4.38727 5.11141 4.24403 5.2069 4.14854C5.30239 4.03714 5.42971 3.98939 5.58886 3.98939C5.74801 3.98939 5.87533 4.03714 5.97082 4.14854C6.06631 4.25995 6.11406 4.38727 6.11406 4.56233V7.42706Z'
                        fill='#F2ECE4'
                      />
                    </svg>
                  </PopoverTrigger>
                  <PopoverContent
                    align='end'
                    className='bg-[#F2ECE4] text-xs text-black rounded-s-3xl rounded-b-3xl'
                  >
                    Measures the largest single drop from peak to through, indicating the highest potential loss.
                  </PopoverContent>
                </Popover>
              </div>
              <span className='font-bold text-brand-1'>34%</span>
            </div>
            <Separator
              decorative
              className='bg-brand-1 shrink-0 h-[1px] w-full md:h-full md:w-[1px] hidden md:block shadow-custom'
            />
          </div>
        </TabsContent>
        <TabsContent value='chart'>
          <div className='w-3/4 text-primary flex flex-col'>
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
            <Card className='w-full bg-transparent bg-chart rounded-2xl max-w-5x'>
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
        </TabsContent>
        <TabsContent value='position'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pair</TableHead>
                <TableHead>Exchange</TableHead>
                <TableHead>Size USD</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Funding Pnl</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {openPositions.map((position, idx) => (
                <>
                  <TableRow
                    key={`${idx}-${position.pair}`}
                    className='even:text-brand-2 relative after:bottom-0 after:left-0 after:block after:absolute after:bg-brand-1  after:h-[1px] after:w-full shadow-brand-1 after:shadow-custom'
                  >
                    <TableCell className='font-bold'>{position.pair}</TableCell>
                    <TableCell>{position.exchange}</TableCell>
                    <TableCell>
                      {currencyFormatter.format(position.sizeUSD)}
                    </TableCell>
                    <TableCell>
                      {currencyFormatter.format(position.currentPrice)}
                    </TableCell>
                    <TableCell>{position.fundingPNL || 'N/A'}</TableCell>
                  </TableRow>
                </>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
