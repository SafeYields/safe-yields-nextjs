'use client';
import { Button } from '@/components/ui/button';
import {
  Navbar,
  NavbarCenter,
  NavbarLeft,
  NavbarRight,
} from '@/components/ui/navbar';
import { account$, chainData } from '@/lib/store';
import { use$ } from '@legendapp/state/react';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';
import { useSwitchChain } from 'wagmi';
import { arbitrum, flowMainnet } from 'wagmi/chains';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Navigation from './ui/navigation';

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
  return (
    <>
      <header className='sticky top-0 z-50 -mb-4 px-4 pb-4 shadow'>
        <div className='absolute left-0 h-24 w-full bg-background/15'></div>
        <div className='relative mx-auto max-w-container'>
          <Navbar>
            <NavbarLeft>
              <Link href='https://www.safeyields.io'>
                <Image
                  src='/images/safeYieldsLogo.png'
                  alt=''
                  width='180'
                  height='180'
                />
              </Link>
            </NavbarLeft>
            <NavbarCenter>
              <Navigation />
            </NavbarCenter>
            <NavbarRight>
              <PickNetwork />
            </NavbarRight>
          </Navbar>
        </div>
      </header>
      <div className='flex flex-1 flex-col gap-4 p-4 pt-0 h-full'>
        {children}
      </div>
    </>
  );
}
