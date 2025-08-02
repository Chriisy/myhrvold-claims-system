import React, { useState, useEffect } from 'react';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Wrench, FileText, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

interface MaintenanceAgreement {
  id: string;
  avtale_nummer: string;
  kunde_navn: string;
  kunde_adresse: string | null;
  start_dato: string;
  slutt_dato: string | null;
  besok_per_ar: number;
  pris_grunnlag: number;
  status: 'planlagt' | 'pågår' | 'fullført' | 'avbrutt';
  created_at: string;
}

const MaintenanceAgreementsPage: React.FC = () => {
  const { isEnabled } = useFeatureFlags();
  const [agreements, setAgreements] = useState<MaintenanceAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchAgreements = async () => {
    try {
      let query = supabase
        .from('maintenance_agreements')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as 'planlagt' | 'pågår' | 'fullført' | 'avbrutt');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching agreements:', error);
        toast({
          title: "Feil",
          description: "Kunne ikke hente vedlikeholdsavtaler",
          variant: "destructive"
        });
        return;
      }

      let filteredData = data || [];

      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredData = filteredData.filter(agreement =>
          agreement.kunde_navn.toLowerCase().includes(searchLower) ||
          agreement.avtale_nummer.toLowerCase().includes(searchLower)
        );
      }

      setAgreements(filteredData);
    } catch (error) {
      console.error('Error in fetchAgreements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEnabled('maintenance_enabled')) {
      fetchAgreements();
    }
  }, [searchTerm, statusFilter, isEnabled]);

  const getStatusBadge = (status: string) => {
    const variants = {
      planlagt: 'default',
      pågår: 'secondary',
      fullført: 'secondary', 
      avbrutt: 'destructive'
    } as const;

    const labels = {
      planlagt: 'Planlagt',
      pågår: 'Pågår',
      fullført: 'Fullført',
      avbrutt: 'Avbrutt'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

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
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/vedlikehold">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Tilbake
                </Button>
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-primary">
                  Vedlikeholdsavtaler
                </h1>
                <p className="text-sm text-muted-foreground">
                  Oversikt over alle vedlikeholdsavtaler
                </p>
              </div>
            </div>
            <Link to="/vedlikehold/avtaler/ny">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Ny avtale
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Søk og filtrer
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                placeholder="Søk kunde eller avtalenummer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle statuser</SelectItem>
                  <SelectItem value="planlagt">Planlagt</SelectItem>
                  <SelectItem value="pågår">Pågår</SelectItem>
                  <SelectItem value="fullført">Fullført</SelectItem>
                  <SelectItem value="avbrutt">Avbrutt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Agreements List */}
        <Card>
          <CardHeader>
            <CardTitle>Avtaler</CardTitle>
            <CardDescription>
              {agreements.length} avtaler funnet
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : agreements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ingen avtaler funnet</p>
                <Link to="/vedlikehold/avtaler/ny" className="mt-4 inline-block">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Opprett første avtale
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {agreements.map((agreement) => (
                  <Card key={agreement.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <h3 className="font-medium">{agreement.avtale_nummer}</h3>
                            <p className="text-sm text-muted-foreground">
                              {agreement.kunde_navn}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusBadge(agreement.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {agreement.besok_per_ar} besøk/år
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Intl.NumberFormat('no-NO', { 
                              style: 'currency', 
                              currency: 'NOK' 
                            }).format(agreement.pris_grunnlag)}/år
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>
                            Start: {format(new Date(agreement.start_dato), 'dd.MM.yyyy', { locale: nb })}
                          </span>
                          {agreement.slutt_dato && (
                            <span>
                              Slutt: {format(new Date(agreement.slutt_dato), 'dd.MM.yyyy', { locale: nb })}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MaintenanceAgreementsPage;