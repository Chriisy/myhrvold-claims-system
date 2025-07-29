import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGDPR } from '@/hooks/useGDPR';
import { X, Cookie, Settings } from 'lucide-react';

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { hasConsent, updateConsent, loading } = useGDPR();

  useEffect(() => {
    // Show banner if no cookie consent has been given yet
    const cookieConsent = hasConsent('cookies');
    
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, [hasConsent]);

  const handleAcceptAll = async () => {
    await updateConsent('cookies', true);
    await updateConsent('data_processing', true);
    setIsVisible(false);
  };

  const handleAcceptNecessary = async () => {
    await updateConsent('cookies', false);
    await updateConsent('data_processing', true);
    setIsVisible(false);
  };

  const handleCustomize = async (cookies: boolean, marketing: boolean) => {
    await updateConsent('cookies', cookies);
    await updateConsent('data_processing', true); // Always required
    await updateConsent('marketing', marketing);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="mx-auto max-w-4xl border-border bg-background shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Cookie className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Vi respekterer ditt personvern
                </h3>
                <p className="text-sm text-muted-foreground">
                  Vi bruker cookies og lignende teknologier for å forbedre din opplevelse, 
                  analysere trafikk og tilpasse innhold. Du kan velge hvilke cookies du godtar.
                </p>
              </div>

              {showDetails && (
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Nødvendige cookies</p>
                        <p className="text-xs text-muted-foreground">
                          Kreves for grunnleggende funksjonalitet
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">Påkrevd</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Analyse cookies</p>
                        <p className="text-xs text-muted-foreground">
                          Hjelper oss å forstå hvordan nettsiden brukes
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCustomize(true, false)}
                        disabled={loading}
                      >
                        Godta
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Markedsføring</p>
                        <p className="text-xs text-muted-foreground">
                          For tilpasset innhold og markedsføring
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCustomize(false, true)}
                        disabled={loading}
                      >
                        Godta
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleAcceptAll}
                  disabled={loading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Godta alle
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAcceptNecessary}
                  disabled={loading}
                >
                  Kun nødvendige
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  disabled={loading}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Tilpass
                </Button>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};