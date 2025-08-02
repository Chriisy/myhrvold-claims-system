import React from 'react';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { MaintenanceWizard } from '@/components/maintenance/MaintenanceWizard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

const NewMaintenanceAgreementPage: React.FC = () => {
  const { isEnabled } = useFeatureFlags();

  if (!isEnabled('maintenance_enabled')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Vedlikeholdsmodul
            </CardTitle>
            <CardDescription>
              Denne funksjonen er ikke tilgjengelig ennå
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Vedlikeholdsmodulen er under utvikling og vil være tilgjengelig snart.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/vedlikehold">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tilbake
              </Button>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary">
                Opprett vedlikeholdsavtale
              </h1>
              <p className="text-sm text-muted-foreground">
                Registrer ny avtale med kunde, utstyr og serviceplan
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <MaintenanceWizard />
      </main>
    </div>
  );
};

export default NewMaintenanceAgreementPage;