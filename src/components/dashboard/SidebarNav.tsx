'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { LayoutDashboard, FileText, Settings, Users, Tv, Film, Wand2 } from 'lucide-react';

const menuItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/dashboard/api-documentation',
    label: 'API Docs',
    icon: FileText,
  },
  {
    href: '/dashboard/movies',
    label: 'Movies',
    icon: Film,
  },
  {
    href: '/dashboard/tv-shows',
    label: 'TV Shows',
    icon: Tv,
  },
   {
    href: '/dashboard/people',
    label: 'People',
    icon: Users,
  },
  {
    href: '/dashboard/api-configurator',
    label: 'API Configurator',
    icon: Wand2,
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings,
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
            <SidebarMenuButton
              isActive={pathname === item.href}
              tooltip={item.label}
            >
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
