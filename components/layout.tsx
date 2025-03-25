'use client';
import { chainData } from '@/app/dashboard/util';
import { Button } from '@/components/ui/button';
import {
  Navbar,
  NavbarCenter,
  NavbarLeft,
  NavbarRight,
} from '@/components/ui/navbar';
import { ChevronRight, Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
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
  const account = useAccount();
  const data = chainData(account.chainId);
  const { switchChain } = useSwitchChain();

  return (
    <div className='md:flex flex-row gap-2 hidden'>
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
    items: [
      {
        title: 'Delta Neutral',
        href: '/vaults',
      },
      {
        title: 'Triangular Arbitrage',
        href: '#',
        disabled: true,
      },
      {
        title: 'Classical Arbitrage',
        href: '#',
        disabled: true,
      },
    ],
  },
  {
    title: 'Links',
    items: [
      {
        title: 'Website',
        href: 'https://safeyields.io',
      },
      {
        title: 'Whitepaper',
        href: 'https://www.safeyields.io/_files/ugd/56bef1_808fc263b7d04a4bb420be7b40262e80.pdf',
      },
      {
        title: 'PitchDeck',
        href: 'https://www.safeyields.io/_files/ugd/56bef1_6a2fdda649d44ef0958596f9e8885f28.pdf',
      },
    ],
    social: [
      {
        src: '/images/discord.svg',
        href: 'https://discord.gg/rNV3rttJdiscord',
        alt: 'discord server',
      },
      {
        src: '/images/x.svg',
        href: 'https://x.com/SafeYields',
        alt: 'x account',
      },
      {
        src: '/images/telegram.svg',
        href: 'https://t.me/safeyields_official',
        alt: 'telegram channel',
      },
    ],
  },
];

export default function Layout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <section className='flex flex-col w-full h-screen'>
      <header id='header' className='sticky top-0 z-50 px-4'>
        <div className='absolute left-0 h-8 w-full'></div>
        <div className='relative mx-auto'>
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
                <SheetContent side='right' className='bg-sidebar'>
                  <nav className='mt-8 flex flex-col items-center justify-center gap-8 text-lg font-medium'>
                    {links.map((link) =>
                      'items' in link ? (
                        link.items.map((item) => (
                          <Link
                            href={item.href!}
                            key={item.title}
                            className='flex items-center gap-2 text-lg font-bold'
                          >
                            <span>{item.title}</span>
                          </Link>
                        ))
                      ) : (
                        <Link
                          href={link.href}
                          key={link.title}
                          className='flex items-center gap-2 text-lg font-bold'
                        >
                          <span>{link.title}</span>
                        </Link>
                      ),
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </NavbarRight>
          </Navbar>
        </div>
      </header>
      <section className='overflow-y-auto w-full h-full'>{children}</section>
    </section>
  );
}
