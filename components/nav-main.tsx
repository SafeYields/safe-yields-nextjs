'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import clsx from 'clsx';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { FaDiscord, FaGithub } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  items?: {
    title: string;
    url: string;
  }[];
};

const Item = ({ item }: { item: NavItem }) => {
  const pathname = usePathname();

  const parentIsActive = pathname === item.url;
  const subItemIsActive = item.items?.some((sub) => pathname === sub.url);

  const isActive = parentIsActive || subItemIsActive;
  const [isOpen, setIsOpen] = useState(isActive);

  return (
    <Collapsible key={item.title} asChild defaultOpen={isActive} open={isOpen}>
      <SidebarMenuItem
        className={clsx(
          isActive &&
            !subItemIsActive &&
            'rounded-full border-2 border-[#4CFAC7]',
        )}
      >
        <SidebarMenuButton
          asChild
          tooltip={item.title}
          onClick={() => {
            setIsOpen((open) => !open);
          }}
        >
          <Link href={item.url}>
            <div className='flex flex-row items-center gap-3'>
              <item.icon />
              <span>{item.title}</span>
            </div>
          </Link>
        </SidebarMenuButton>
        {item.items?.length ? (
          <>
            <CollapsibleTrigger asChild>
              <SidebarMenuAction className='h-[33px] data-[state=open]:rotate-90'>
                <ChevronRight />
                <span className='sr-only'>Toggle</span>
              </SidebarMenuAction>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items.map((subItem) => {
                  const subIsActive = pathname === subItem.url;

                  return (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a
                          href={subItem.url}
                          className={clsx(
                            subIsActive &&
                              'font-medium text-[#47ecbb] hover:text-[#47ecbb]',
                          )}
                        >
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  );
                })}
              </SidebarMenuSub>
            </CollapsibleContent>
          </>
        ) : null}
      </SidebarMenuItem>
    </Collapsible>
  );
};

export function NavMain({ items }: { items: NavItem[] }) {
  return (
    <>
      <SidebarGroup>
        <SidebarMenu>
          {items.map((item) => (
            <Item item={item} key={item.title} />
          ))}
        </SidebarMenu>
      </SidebarGroup>

      {/* Footer & Social Icons */}
      <SidebarMenu className='flex h-full flex-col'>
        <div className='mt-auto'>
          <SidebarMenuItem className='mb-8 ml-6 pl-6'>
            <SidebarTrigger className='h-[33px] w-[33px] rounded-full text-black' />
          </SidebarMenuItem>

          <div className='mb-16 ml-6 mr-6 flex flex-1 flex-row items-center justify-between gap-2 pl-6 pr-6'>
            <a href='https://github.com/safeyields' target='_blank'>
              <div className='transform items-center rounded-full bg-[#9999FF] p-1 text-white transition-transform duration-200 hover:scale-125'>
                <FaGithub size={25} />
              </div>
            </a>

            <a href='https://discord.gg/rNV3rttJ' target='_blank'>
              <div className='transform items-center rounded-full bg-[#9999FF] p-1 text-white transition-transform duration-200 hover:scale-125'>
                <FaDiscord size={25} />
              </div>
            </a>

            <a href='https://x.com/SafeYields' target='_blank'>
              <div className='transform items-center rounded-full bg-[#9999FF] p-1 text-white transition-transform duration-200 hover:scale-125'>
                <FaXTwitter size={25} />
              </div>
            </a>
          </div>
        </div>
      </SidebarMenu>
    </>
  );
}
