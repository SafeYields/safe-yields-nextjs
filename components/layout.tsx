'use client';
import useGetTokenBalances from '@/hooks/use-get-token-blances';
import { switchChain } from '@wagmi/core';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { ReactNode, useCallback, useState } from 'react';
import { useAccount } from 'wagmi';
import { arbitrum, flowMainnet } from 'wagmi/chains';
import { config } from '../app/providers';
import { AppSidebar } from './app-sidebar';
import ConnectButton from './connect-button';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { SidebarInset, SidebarProvider, SidebarTrigger } from './ui/sidebar';

const PickNetwork = () => {
  const [network, setNetwork] = useState<string | undefined>('Arbitrum');
  const src = useCallback(
    () => (network == 'Arbitrum' ? '/images/arbitrum.svg' : '/images/flow.svg'),
    [network],
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className='transform rounded-full text-base font-bold transition-transform duration-200 hover:scale-105'>
          {network ? (
            <>
              <Image src={src()} width='16' height='16' alt='chain logo' />
              {network}
            </>
          ) : (
            'Choose Network'
          )}

          <ChevronRight className='rotate-90' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-44 rounded-xl shadow-[0_0_8px_#4CFAC7]'>
        <DropdownMenuLabel>Networks</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={network} onValueChange={setNetwork}>
          <DropdownMenuRadioItem
            value='Arbitrum'
            className='flex justify-between hover:scale-95 focus:bg-[#4CFAC7]/20'
            onSelect={async () => {
              setNetwork('Arbitrum');
              await switchChain(config, { chainId: arbitrum.id });
            }}
          >
            <span>Arbitrum</span>
            <Image
              src='/images/arbitrum.svg'
              width='16'
              height='16'
              alt='arbitrum chain logo'
            />
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value='Flow EVM'
            className='flex justify-between hover:scale-95 focus:bg-[#4CFAC7]/20'
            onSelect={async () => {
              setNetwork('Flow EVM');
              await switchChain(config, { chainId: flowMainnet.id });
            }}
          >
            <span>Flow EVM</span>
            <Image
              src='/images/flow.svg'
              width='16'
              height='16'
              alt='flow chain logo'
            />
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function Layout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { address } = useAccount();
  const { usdcBalance } = useGetTokenBalances(address!, 1);
  console.log(usdcBalance, 'usdc bal');

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <header className='flex h-28 shrink-0 items-center gap-2'>
          <div className='flex w-full items-center gap-2 px-4'>
            <SidebarTrigger onlyShowWhen='closed' />
            <div className='ml-auto mt-2 flex flex-row items-start md:flex-row'>
              {address ? <PickNetwork /> : null}
              <div className='flex flex-col items-center gap-2'>
                <ConnectButton />
                <span className="font-['Space Grotesk'] text-sm font-normal text-white/70">
                  Your balance: {usdcBalance} USDC
                </span>
              </div>
            </div>
          </div>
        </header>
        <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
