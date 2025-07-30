import { memo } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import UserNav from "@/components/UserNav";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper = memo(({ children }: LayoutWrapperProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Global header with trigger */}
          <header className="h-12 flex items-center justify-between border-b bg-background px-4">
            <SidebarTrigger />
            <UserNav />
          </header>
          
          {/* Main content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
});

LayoutWrapper.displayName = 'LayoutWrapper';

export { LayoutWrapper };