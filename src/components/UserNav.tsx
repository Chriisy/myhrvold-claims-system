import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const UserNav = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Force page reload to clear all state
      window.location.href = '/auth';
    } catch (error: any) {
      toast({
        title: "Feil ved utlogging",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getDepartmentLabel = (dept: string) => {
    const departments: { [key: string]: string } = {
      'oslo': 'Oslo',
      'bergen': 'Bergen',
      'trondheim': 'Trondheim',
      'stavanger': 'Stavanger',
      'kristiansand': 'Kristiansand',
      'nord_norge': 'Nord-Norge',
      'innlandet': 'Innlandet'
    };
    return departments[dept] || dept;
  };

  if (!user || !profile) {
    return (
      <Link to="/auth">
        <Button variant="outline">
          <User className="h-4 w-4 mr-2" />
          Logg inn
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium">{profile.full_name}</p>
              <p className="text-xs text-muted-foreground">{getDepartmentLabel(profile.department)}</p>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="p-3 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{profile.full_name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                  {profile.role === 'admin' ? (
                    <>
                      <Shield className="h-3 w-3 mr-1" />
                      Administrator
                    </>
                  ) : (
                    'Tekniker'
                  )}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getDepartmentLabel(profile.department)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        {profile.role === 'admin' && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/admin" className="flex items-center gap-2 w-full">
                <Settings className="h-4 w-4" />
                Administrator instillinger
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isLoggingOut}
          className="flex items-center gap-2 text-red-600 focus:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? 'Logger ut...' : 'Logg ut'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserNav;