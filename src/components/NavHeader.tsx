import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useOptimizedAuth";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface NavHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const NavHeader = ({ title, subtitle, children }: NavHeaderProps) => {
  const { profile, signOut } = useAuth();

  const getDepartmentName = (dept: string) => {
    const names: Record<string, string> = {
      oslo: "Oslo",
      bergen: "Bergen", 
      trondheim: "Trondheim",
      stavanger: "Stavanger",
      kristiansand: "Kristiansand",
      nord_norge: "Nord Norge",
      innlandet: "Innlandet"
    };
    return names[dept] || dept;
  };

  const getRoleName = (role: string) => {
    if (role === 'admin') return 'Administrator';
    if (role === 'saksbehandler') return 'Saksbehandler';
    return 'Tekniker';
  };

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {children}
            <div>
              <h1 className="text-2xl font-bold text-primary">{title}</h1>
              {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                {profile?.full_name}
              </div>
              <div className="text-xs text-muted-foreground">
                {getRoleName(profile?.role || '')} • {getDepartmentName(profile?.department || '')}
              </div>
            </div>
            <ThemeToggle />
            <Button variant="outline" onClick={signOut} size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logg ut
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavHeader;