'use client';
import { useState } from 'react';
import { chainData } from '@/app/dashboard/util';
import { Button } from '@/components/ui/button';
import {
  Navbar,
  NavbarCenter,
  NavbarLeft,
  NavbarRight,
} from '@/components/ui/navbar';
import { ChevronRight, Menu, ChevronDown } from 'lucide-react';
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
import clsx from 'clsx';

const PickNetwork = () => {
  const account = useAccount();
  const data = chainData(account.chainId);
  const { switchChain } = useSwitchChain();

  return (
    <div className='flex md:flex-row flex-col gap-2'>
      {account.isConnected && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className='min-w-fit w-48 transform rounded-full text-base font-bold transition-transform duration-200 hover:scale-105 bg-brand-1 gap-4'>
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
                className='flex justify-between hover:scale-95 focus:bg-brand-1/20'
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
                className='flex justify-between hover:scale-95 focus:bg-brand-1/20'
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
      <ConnectButton connectedClassName='w-48'/>
    </div>
  );
};

const MobileDropdown = ({ link, onLinkClick }: { link: TLink; onLinkClick: () => void }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex gap-4 justify-center items-center text-lg font-bold"
      >
        <span>{link.title}</span>
        <ChevronDown
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="flex flex-col items-center justify-center pt-3">
          {"items" in link &&
            link.items?.map((item) => (
              <Link
                href={item.href!}
                key={item.title}
                onClick={onLinkClick}
                className="p-2 text-base font-medium"
              >
                {item.title}
              </Link>
            ))
          }
        </div>
      )}
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
  const [open, setOpen] = useState(false);
  const closeSidebar = () => setOpen(false);

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
              <div className='md:flex hidden'>
                <PickNetwork />
              </div>
              <Sheet open={open} onOpenChange={setOpen}>
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
                <SheetContent side="right" className="bg-sidebar">
                  <nav className="mt-8 flex flex-col items-center gap-8 text-lg font-medium h-full mb-10 overflow-y-auto">
                    {links.map((link) => {
                      if ('items' in link && link.title !== 'Links') {
                        return (
                          <MobileDropdown
                            key={link.title}
                            link={link}
                            onLinkClick={closeSidebar}
                          />
                        );
                      } else if ('items' in link && link.title === 'Links') {
                        return (
                          <div
                            key={link.title}
                            className={clsx(
                              "flex flex-col items-center justify-center gap-8",
                              'mt-auto mb-10'
                            )}
                          >
                            {link.items.map((item) => (
                              <Link
                                href={item.href!}
                                key={item.title}
                                onClick={closeSidebar}
                                className="flex items-center gap-2 text-lg font-bold"
                              >
                                <span>{item.title}</span>
                              </Link>
                            ))}
                            {"social" in link && link.social && (
                              <>
                                <PickNetwork />
                                <div className="flex flex-row gap-4 justify-center py-4 px-8">
                                  {link.social.map(({ src, href, alt }) => (
                                    <Link
                                      href={href}
                                      key={src}
                                      onClick={closeSidebar}
                                      className="block bg-brand-1 rounded-full p-2"
                                    >
                                      <div className="w-4 h-4 relative">
                                        <Image
                                          src={src}
                                          alt={alt}
                                          fill
                                          className="w-full h-full object-contain"
                                        />
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      } else {
                        return (
                          <Link
                            href={link.href!}
                            key={link.title}
                            onClick={closeSidebar}
                            className="flex items-center gap-2 text-lg font-bold"
                          >
                            <span>{link.title}</span>
                          </Link>
                        );
                      }
                    })}
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
