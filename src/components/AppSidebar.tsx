import { memo, useState } from "react";
import { Home, FileText, BarChart3, Users, Settings, Award, Building, Shield, Wrench } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useOptimizedAuth";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
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
} from "@/components/ui/sidebar";

interface NavigationItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const navigationItems: NavigationItem[] = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Reklamasjoner", url: "/claims", icon: FileText },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Vedlikehold", url: "/vedlikehold", icon: Wrench },
  { title: "Leverandører", url: "/suppliers", icon: Building },
  { title: "Scorecard", url: "/suppliers/scorecard", icon: Award, adminOnly: true },
  { title: "Administrasjon", url: "/admin", icon: Settings, adminOnly: true },
];

const AppSidebar = memo(() => {
  const { state } = useSidebar();
  const location = useLocation();
  const { profile } = useAuth();
  const { isEnabled } = useFeatureFlags();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const getNavClasses = (isActiveRoute: boolean) =>
    isActiveRoute 
      ? "bg-muted text-primary font-medium" 
      : "hover:bg-muted/50 transition-colors";

  const filteredItems = navigationItems.filter(item => {
    // Filter admin-only items
    if (item.adminOnly && profile?.role !== 'admin') return false;
    
    // Filter maintenance module if feature flag is disabled
    if (item.url === '/vedlikehold' && !isEnabled('maintenance_enabled')) return false;
    
    return true;
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Myhrvoldgruppen
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className={({ isActive }) => getNavClasses(isActive)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions Group */}
        <SidebarGroup>
            <SidebarGroupLabel>Hurtighandlinger</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/claims/new" className="hover:bg-muted/50">
                      <FileText className="h-4 w-4" />
                      <span>Ny reklamasjon</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
});

AppSidebar.displayName = 'AppSidebar';

export { AppSidebar };