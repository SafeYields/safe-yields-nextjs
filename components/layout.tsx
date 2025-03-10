'use client';
import useGetTokenBalances from '@/hooks/use-get-token-blances';
import { useIsMobile } from '@/hooks/use-mobile';
import { account$, chainData } from '@/lib/store';
import { use$ } from '@legendapp/state/react';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { ReactNode } from 'react';
import { useSwitchChain } from 'wagmi';
import { arbitrum, flowMainnet } from 'wagmi/chains';
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
  const account = use$(account$);
  const data = chainData(account.chainId);
  const { switchChain } = useSwitchChain();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className='transform rounded-full text-base font-bold transition-transform duration-200 hover:scale-105'>
          {data ? (
            <>
              <Image src={data.src} width='16' height='16' alt='chain logo' />
              {data.name}
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
        <DropdownMenuRadioGroup value={account.chainId?.toString()}>
          <DropdownMenuRadioItem
            value={flowMainnet.id.toString()}
            className='flex justify-between hover:scale-95 focus:bg-[#4CFAC7]/20'
            onSelect={() => {
              switchChain({ chainId: flowMainnet.id });
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
          <DropdownMenuRadioItem
            value={arbitrum.id.toString()}
            className='flex justify-between hover:scale-95 focus:bg-[#4CFAC7]/20'
            onSelect={() => {
              switchChain({ chainId: arbitrum.id });
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
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function Layout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { address, chainId } = use$(account$.get());
  console.log(address);
  const { usdcBalance } = useGetTokenBalances(address!, 1);
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <AppSidebar />
      <SidebarInset>
        <header className='flex h-28 shrink-0 items-center gap-2'>
          <div className='flex w-full items-center gap-2 px-4'>
            <SidebarTrigger />
            <div className='ml-auto mt-2 flex flex-row items-start md:flex-row'>
              {address && <PickNetwork />}
              <div className='flex flex-col items-center gap-2'>
                <ConnectButton />
                {address && (
                  <span className="font-['Space Grotesk'] text-sm font-normal text-white/70">
                    Your balance: {usdcBalance.toFixed(2)}{' '}
                    {chainId == arbitrum.id ? 'USDC' : 'stgUSDC'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>
        <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
