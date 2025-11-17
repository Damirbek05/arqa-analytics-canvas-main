import { BarChart3, ShoppingBag, Users, Settings } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigation = [
  {
    name: 'nav.dashboard',
    href: '/',
    icon: BarChart3,
  },
  {
    name: 'nav.orders',
    href: '/orders',
    icon: ShoppingBag,
  },
  {
    name: 'nav.customers',
    href: '/customers',
    icon: Users,
  },
  {
    name: 'nav.settings',
    href: '/settings',
    icon: Settings,
  },
];

export function AppSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <div className="p-4">
          <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <BarChart3 className="h-4 w-4 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold">ARQA</span>
                <span className="text-xs text-muted-foreground">Mini Analytics</span>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? 'sr-only' : ''}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild
                      isActive={active}
                      tooltip={isCollapsed ? t(item.name) : undefined}
                    >
                      <NavLink to={item.href} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && (
                          <span className="text-sm">{t(item.name)}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}