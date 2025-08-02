import { useState, useEffect } from "react";
import { X, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const WELCOME_POPUP_KEY = "myhrvold-welcome-dismissed";

export function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem(WELCOME_POPUP_KEY);
    if (!isDismissed) {
      // Show popup after a short delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(WELCOME_POPUP_KEY, "true");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            🎉 Velkommen til Myhrvold Gruppens serviceportal!
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Lukk</span>
          </Button>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Portalen er fortsatt under utvikling, og vi vil fortløpende legge til nye funksjoner i tiden fremover.
          </p>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            Akkurat nå er reklamasjonsmodulen tilgjengelig og i drift. Det kan fortsatt forekomme enkelte feil eller ufullstendigheter.
          </p>
          
          <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-accent">
                  Fant du en feil eller har forslag?
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Dersom du oppdager noen bugger, setter vi stor pris på om du gir beskjed ved å sende en e-post til:
                </p>
                <p className="text-sm font-medium text-primary mt-2">
                  📧 christopher.strom@myhrvold.no
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            Vi tar også gjerne imot innspill til hva som kan gjøre systemet mer effektivt og brukervennlig for deg.
          </p>
          
          <p className="text-sm font-medium text-primary">
            Takk for at du tester løsningen! 🚀
          </p>
          
          <div className="flex justify-end pt-4">
            <Button onClick={handleClose} className="bg-primary hover:bg-primary/90">
              Kom i gang
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}