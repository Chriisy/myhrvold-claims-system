import React from 'react';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { MaintenanceTimeline } from '@/components/maintenance/MaintenanceTimeline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useOptimizedAuth';

const MaintenancePage: React.FC = () => {
  const { isEnabled } = useFeatureFlags();
  const { profile } = useAuth();

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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-2">
                <Wrench className="h-6 w-6" />
                Vedlikehold
              </h1>
              <p className="text-sm text-muted-foreground">
                Administrer vedlikeholdsavtaler og servicebesøk
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Link to="/vedlikehold/avtaler" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Calendar className="mr-2 h-4 w-4" />
                  Se alle avtaler
                </Button>
              </Link>
              {(profile?.role === 'admin' || profile?.role === 'technician') && (
                <Link to="/vedlikehold/avtaler/ny" className="w-full sm:w-auto">
                  <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Ny avtale
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <MaintenanceTimeline />
      </main>
    </div>
  );
};

export default MaintenancePage;