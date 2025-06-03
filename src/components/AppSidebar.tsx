
import { useState } from 'react';
import { 
  Home, 
  Users, 
  UserCheck, 
  MessageSquare, 
  Calendar, 
  UserPlus, 
  Package, 
  BarChart3,
  Settings,
  FileText,
  Cake
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-blue-100 text-blue-700 font-medium border-r-2 border-blue-600" : "hover:bg-gray-100 text-gray-700";

  // Menu items for professors - simplified
  const professorMenuItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Presença", url: "/attendance", icon: UserCheck },
    { title: "Avisos", url: "/announcements", icon: MessageSquare },
    { title: "Aniversários", url: "/birthdays", icon: Cake },
    { title: "Visitantes", url: "/visitors", icon: UserPlus },
    { title: "Inventário", url: "/inventory", icon: Package },
    { title: "Calendário", url: "/calendar", icon: Calendar },
  ];

  // Menu items for secretaries - full control
  const secretaryMenuItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Avisos", url: "/announcements", icon: MessageSquare },
    { title: "Presença Geral", url: "/attendance", icon: UserCheck },
    { title: "Aniversários", url: "/birthdays", icon: Cake },
    { title: "Visitantes", url: "/visitors", icon: UserPlus },
    { title: "Inventário", url: "/inventory", icon: Package },
    { title: "Relatórios", url: "/reports", icon: BarChart3 },
    { title: "Cadastros", url: "/users", icon: Users },
    { title: "Calendário", url: "/calendar", icon: Calendar },
  ];

  const menuItems = user?.type === 'professor' ? professorMenuItems : secretaryMenuItems;

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} border-r bg-white shadow-lg transition-all duration-300`}
      collapsible="icon"
    >
      <SidebarTrigger className="m-4 self-end lg:hidden" />

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className={`${collapsed ? "sr-only" : ""} text-gray-500 uppercase tracking-wide text-xs font-semibold mb-4`}>
            {user?.type === 'professor' ? 'Menu Professor' : 'Menu Secretário'}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-gray-50 rounded-lg transition-colors">
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className={`${collapsed ? "mx-auto" : "mr-3"} h-5 w-5 flex-shrink-0`} />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.type === 'secretario' && (
          <SidebarGroup className="mt-8">
            <SidebarGroupLabel className={`${collapsed ? "sr-only" : ""} text-gray-500 uppercase tracking-wide text-xs font-semibold mb-4`}>
              Administração
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="hover:bg-gray-50 rounded-lg transition-colors">
                    <NavLink to="/admin" className={getNavCls}>
                      <Settings className={`${collapsed ? "mx-auto" : "mr-3"} h-5 w-5 flex-shrink-0`} />
                      {!collapsed && <span className="font-medium">Configurações</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
