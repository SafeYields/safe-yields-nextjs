'use client';

import Link from 'next/link';
import * as React from 'react';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from './navigation-menu';

export type TLink =
  | { title: string; href: string; disabled?: boolean }
  | {
      title: string;
      href?: string;
      items: TLink[];
      social?: { src: string; href: string; alt: string }[];
    };

export default function Navigation({ links }: { links: TLink[] }) {
  const path = usePathname();
  return (
    <NavigationMenu className='hidden md:flex'>
      <NavigationMenuList>
        {links.map((link) =>
          'items' in link ? (
            <NavigationMenuItem key={link.title}>
              <NavigationMenuTrigger>{link.title}</NavigationMenuTrigger>
              <NavigationMenuContent className='bg-[#F2ECE4] bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-25'>
                <ul className='flex flex-col w-max'>
                  {link.items.map((item) => (
                    <ListItem
                      key={item.title}
                      title={item.title}
                      href={item.href}
                      disabled={'disabled' in item && true}
                    ></ListItem>
                  ))}
                  {'social' in link && (
                    <div className='flex flex-row w-full gap-4 justify-center py-4 px-8'>
                      {link.social?.map(({ src, href, alt }) => (
                        <Link
                          href={href}
                          key={src}
                          className=' block bg-brand-1 rounded-full p-2'
                        >
                          <div className='w-4 h-4 relative'>
                            <Image
                              src={src}
                              alt={alt}
                              fill
                              className='w-full h-full object-contain'
                            />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ) : (
            <NavigationMenuItem key={link.title}>
              <NavigationMenuLink asChild active={path === link.href}>
                <Link href={link.href} className={navigationMenuTriggerStyle()}>
                  {link.title}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ),
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'> & { disabled: boolean }
>(({ className, title, children, disabled, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md leading-none no-underline outline-none transition-colors  hover:text-brand-1 focus:text-brand-1 py-4 px-8 aria-disabled:text-[#CBCBCB]',
            className,
          )}
          {...props}
          aria-disabled={disabled}
        >
          <div className='text-sm font-medium leading-none'>{title}</div>
          <p className='line-clamp-2 text-sm leading-snug text-muted-foreground'>
            {children}
          </p>
          {disabled && (
            <p className='line-clamp-2 text-sm leading-snug text-muted-foreground'>
              (Coming soon)
            </p>
          )}
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';
