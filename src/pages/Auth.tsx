import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("technician");
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkSession();
  }, [navigate]);

  const cleanupAuthState = () => {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up existing state first
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Innlogget",
          description: "Du er nå logget inn i systemet.",
        });
        // Force page reload for clean state
        window.location.href = '/';
      }
    } catch (error: any) {
      toast({
        title: "Feil ved innlogging",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up existing state first
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            role,
            department,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Bruker opprettet",
        description: "Sjekk e-posten din for bekreftelseslenke.",
      });
      setIsSignUp(false);
    } catch (error: any) {
      toast({
        title: "Feil ved registrering",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "E-post påkrevd",
        description: "Vennligst skriv inn e-postadressen din.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Reset-lenke sendt",
        description: "Sjekk e-posten din for passord reset-lenke.",
      });
      setIsResetMode(false);
    } catch (error: any) {
      toast({
        title: "Feil ved sending",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md" key="auth-container">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Myhrvoldgruppen</h1>
          <p className="text-muted-foreground">Reklamasjonssystem</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {isResetMode ? "Reset passord" : isSignUp ? "Opprett bruker" : "Logg inn"}
            </CardTitle>
            <CardDescription>
              {isResetMode
                ? "Skriv inn e-postadressen din for å få reset-lenke"
                : isSignUp
                ? "Opprett en ny brukerkonto for å få tilgang til systemet"
                : "Logg inn med din e-post og passord"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isResetMode ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <Label htmlFor="resetEmail">E-post *</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="din@email.no"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sender..." : "Send reset-lenke"}
                </Button>
                
                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsResetMode(false)}
                    className="text-sm"
                  >
                    Tilbake til innlogging
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <Label htmlFor="fullName">Fullt navn *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ola Nordmann"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Avdeling *</Label>
                    <Select value={department} onValueChange={setDepartment} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg avdeling" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oslo">Oslo</SelectItem>
                        <SelectItem value="bergen">Bergen</SelectItem>
                        <SelectItem value="trondheim">Trondheim</SelectItem>
                        <SelectItem value="stavanger">Stavanger</SelectItem>
                        <SelectItem value="kristiansand">Kristiansand</SelectItem>
                        <SelectItem value="nord_norge">Nord Norge</SelectItem>
                        <SelectItem value="innlandet">Innlandet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="role">Rolle</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technician">Tekniker</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              
              <div>
                <Label htmlFor="email">E-post *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="din@email.no"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Passord *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ditt passord"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? "Arbeider..."
                  : isSignUp
                  ? "Opprett bruker"
                  : "Logg inn"}
              </Button>

              <div className="text-center space-y-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm"
                >
                  {isSignUp
                    ? "Har du allerede en konto? Logg inn"
                    : "Trenger du en konto? Opprett bruker"}
                </Button>
                
                {!isSignUp && (
                  <div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsResetMode(true)}
                      className="text-sm text-muted-foreground"
                    >
                      Glemt passord?
                    </Button>
                  </div>
                )}
              </div>
            </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;