import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useGDPR } from '@/hooks/useGDPR';
import { Download, Trash2, Eye, Shield, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useOptimizedAuth';

export const UserRights = () => {
  const { exportData, requestDeletion, loading } = useGDPR();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDataExport = async () => {
    await exportData();
  };

  const handleDataDeletion = async () => {
    setIsDeleting(true);
    try {
      await requestDeletion();
    } finally {
      setIsDeleting(false);
    }
  };

  const rights = [
    {
      icon: Eye,
      title: "Rett til innsyn",
      description: "Du har rett til å få vite hvilke personopplysninger vi behandler om deg.",
      action: "Se mine data",
      onClick: () => window.open('/privacy-policy#data-access', '_blank')
    },
    {
      icon: Download,
      title: "Rett til dataportabilitet",
      description: "Du kan få utlevert dine personopplysninger i et strukturert format.",
      action: "Last ned mine data",
      onClick: handleDataExport,
      loading: loading
    },
    {
      icon: FileText,
      title: "Rett til retting",
      description: "Du kan be om at feil informasjon om deg blir rettet.",
      action: "Rediger profil",
      onClick: () => window.location.href = '/profile'
    },
    {
      icon: Trash2,
      title: "Rett til sletting",
      description: "Du kan be om at personopplysningene dine blir slettet.",
      action: "Slett mine data",
      onClick: handleDataDeletion,
      loading: isDeleting,
      variant: "destructive" as const,
      requiresConfirmation: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Dine rettigheter</h2>
        <p className="text-muted-foreground">
          I henhold til GDPR har du følgende rettigheter angående dine personopplysninger
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {rights.map((right, index) => (
          <Card key={index} className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <right.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{right.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-sm">
                {right.description}
              </CardDescription>
              
              {right.requiresConfirmation ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant={right.variant || "default"} 
                      disabled={right.loading}
                      className="w-full"
                    >
                      <right.icon className="h-4 w-4 mr-2" />
                      {right.action}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Dette vil anonymisere alle dine personopplysninger permanent. 
                        Handlingen kan ikke angres. Dine reklamasjoner vil beholdes for 
                        forretningsformål, men personidentifiserbare opplysninger vil bli fjernet.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Avbryt</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={right.onClick}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Ja, slett mine data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button 
                  variant={right.variant || "default"} 
                  onClick={right.onClick}
                  disabled={right.loading}
                  className="w-full"
                >
                  <right.icon className="h-4 w-4 mr-2" />
                  {right.action}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-muted-foreground/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Kontakt personvernombud</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Hvis du har spørsmål om behandling av personopplysninger eller ønsker å klage, 
            kan du kontakte vårt personvernombud.
          </p>
          <Button variant="outline">
            Send e-post til personvernombud
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};