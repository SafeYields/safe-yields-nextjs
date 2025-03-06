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
import { ChevronRight, Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';
import { useSwitchChain } from 'wagmi';
import { arbitrum, flowMainnet } from 'wagmi/chains';
import ConnectButton from './connect-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Navigation, { TLink } from './ui/navigation';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

const PickNetwork = () => {
  const account = use$(account$);
  const data = chainData(account.chainId);
  const { switchChain } = useSwitchChain();
  return (
    <div className='flex flex-row gap-2 hidden md:block'>
      {account.isConnected && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className='transform rounded-full text-base font-bold transition-transform duration-200 hover:scale-105 bg-[#4CFAC7] gap-4'>
              {data ? (
                <>
                  <Image
                    src={data.src}
                    width='16'
                    height='16'
                    alt='chain logo'
                  />
                  {data.name}
                </>
              ) : (
                'Choose Network'
              )}

              <ChevronRight className='rotate-90 w-8 h-12' />
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
      )}
      <ConnectButton />
    </div>
  );
};

const links: TLink[] = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Emma AI (beta)',
    href: '/chat',
  },
  {
    title: 'Vaults',
    href: '/vaults',
  },
  {
    title: 'Links',
    href: '#',
    items: [
      {
        title: 'Website',
        href: 'https://safeyields.io',
      },
      {
        title: 'Whitepaper',
        href: 'https://safeyields.io',
      },
    ],
  },
];

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
              <Navigation links={links} />
            </NavbarCenter>
            <NavbarRight>
              <PickNetwork />
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='shrink-0 md:hidden'
                  >
                    <Menu className='h-5 w-5' />
                    <span className='sr-only'>Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side='right'>
                  <nav className='grid gap-6 text-lg font-medium'>
                    {links.map(({ title, href }) => (
                      <Link
                        href={href}
                        className='flex items-center gap-2 text-xl font-bold'
                      >
                        <span>{title}</span>
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
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
