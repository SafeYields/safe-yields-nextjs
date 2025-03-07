import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Bot, Home, LayoutDashboard } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const data = {
  navMain: [
    {
      title: 'Home',
      url: '/',
      icon: Home,
      isActive: true,
    },
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Emma AI',
      url: '#',
      icon: Bot,
      items: [
        {
          title: 'Chat (beta)',
          url: '/chat',
        },
        {
          title: 'Portfolios',
          url: '/portfolio',
        },
      ],
    },
    /* {
      title: "Buy Safe",
      url: "/buy-safe",
      icon: File,
    }  */
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      variant='inset'
      {...props}
      className='max-w-[18rem] border-r-2 border-[#D9D9D940]'
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <div className='my-10 grid flex-1 text-left text-sm'>
                <div className='flex flex-row items-center justify-center'>
                  <Link href='https://www.safeyields.io'>
                    <Image
                      src='/images/safeYieldsLogo.png'
                      alt=''
                      width='180'
                      height='180'
                    />
                  </Link>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  );
}
