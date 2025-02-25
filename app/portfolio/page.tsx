'use client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
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
import { useAccount } from 'wagmi';

export default function Wallet() {
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
    <>
      <div className='my-8 flex flex-grow flex-col items-center gap-6'>
        <h1 className='text-center text-4xl font-bold text-white'>
          Funding rate delta-neutral portfolio
        </h1>
        <Alert className='max-w-md bg-[#99f]'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Your funds will remain locked until the next epoch on March 16th.
          </AlertDescription>
        </Alert>
        <div className='my-6 w-full max-w-[400px] rounded-3xl shadow-[0_0_15px_#4CFAC7]'>
          <Tabs defaultValue='deposit' className='w-full max-w-[400px]'>
            <TabsList className='grid w-full grid-cols-2 rounded-b-none rounded-t-3xl bg-[#4CFAC7]/20 px-14 pt-3'>
              <TabsTrigger value='deposit'>Deposit</TabsTrigger>
              <TabsTrigger value='withdraw' disabled>
                Withdraw (cooming soon)
              </TabsTrigger>
            </TabsList>
            <TabsContent value='deposit'>
              <Card className='rounded-b-3xl rounded-t-none bg-[#4CFAC7]/20'>
                <CardContent className='space-y-2 pt-10'>
                  <div className='space-y-2'>
                    <div className='relative'>
                      <Input
                        onChange={handleAmountChange}
                        type='number'
                        name='amount'
                        className='peer rounded-xl pe-12 ps-6 [appearance:textfield] focus-visible:ring-[1.5px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                      />
                      <span className='pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm text-white/90 peer-disabled:opacity-50'>
                        USDC
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleEmmaVaultDeposit}
                    className='w-full rounded-full'
                    disabled={depositLoader}
                  >
                    {depositLoader && <Loader2 className='animate-spin' />}
                    Deposit
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value='withdraw'>
              <Card className='rounded-b-3xl rounded-t-none bg-[#4CFAC7]/20'>
                <CardContent className='space-y-2 pt-10'>
                  <div className='space-y-2'>
                    <div className='relative'>
                      <Input
                        type='number'
                        name='amount'
                        onChange={handleAmountChange}
                        className='peer rounded-xl pe-12 ps-6 [appearance:textfield] focus-visible:ring-[1.5px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                      />
                      <span className='pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm text-white/90 peer-disabled:opacity-50'>
                        USDC
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleEmmaVaultWithdraw}
                    className='w-full rounded-full'
                  >
                    Withdraw
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <span className='text-center text-xl font-medium text-white/80'>
          This is our only available strategy at the moment, read its thesis{' '}
          <a
            href='https://www.safeyields.io/_files/ugd/56bef1_15c6024a4b094ad09ce1b21b8a14e5fb.pdf'
            className='text-[#4CFAC7] underline transition-colors hover:text-[#3AD9A9]'
            target='_blank'
            rel='noopener noreferrer'
          >
            here
          </a>
          .
        </span>
        <span className='-mt-4 text-center text-xl font-medium text-white/80'>
          More strategies to come soon!
        </span>
      </div>
    </>
  );
}
