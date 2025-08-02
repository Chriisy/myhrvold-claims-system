import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Edit, FileText, Calendar, MapPin, User, Phone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

interface MaintenanceAgreement {
  id: string;
  avtale_nummer: string;
  kunde_navn: string;
  kunde_adresse: string | null;
  kontaktperson: string | null;
  telefon: string | null;
  epost: string | null;
  start_dato: string;
  slutt_dato: string | null;
  besok_per_ar: number;
  pris_grunnlag: number;
  pris_cpi_justerbar: boolean;
  status: 'planlagt' | 'pågår' | 'fullført' | 'avbrutt';
  department: string;
  beskrivelse: string | null;
  vilkar: string | null;
  garantivilkar: string | null;
  prosedyrer_ved_service: string | null;
  kontakt_info: string | null;
  created_at: string;
}

const MaintenanceAgreementDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [agreement, setAgreement] = useState<MaintenanceAgreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchAgreement = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('maintenance_agreements')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching agreement:', error);
        toast({
          title: "Feil",
          description: "Kunne ikke hente avtaledetaljer",
          variant: "destructive"
        });
        return;
      }

      setAgreement(data);
    } catch (error) {
      console.error('Error in fetchAgreement:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: 'planlagt' | 'pågår' | 'fullført' | 'avbrutt') => {
    if (!agreement) return;
    
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('maintenance_agreements')
        .update({ status: newStatus })
        .eq('id', agreement.id);

      if (error) {
        console.error('Error updating status:', error);
        toast({
          title: "Feil",
          description: "Kunne ikke oppdatere status",
          variant: "destructive"
        });
        return;
      }

      setAgreement({ ...agreement, status: newStatus });
      toast({
        title: "Suksess",
        description: "Status oppdatert"
      });
    } catch (error) {
      console.error('Error in updateStatus:', error);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchAgreement();
  }, [id]);

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

  const getDepartmentLabel = (dept: string) => {
    const labels = {
      oslo: 'Oslo',
      bergen: 'Bergen',
      trondheim: 'Trondheim',
      stavanger: 'Stavanger',
      kristiansand: 'Kristiansand',
      nord_norge: 'Nord-Norge',
      innlandet: 'Innlandet'
    };
    return labels[dept as keyof typeof labels] || dept;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">Avtale ikke funnet</h2>
              <p className="text-muted-foreground mb-4">
                Den forespurte avtalen kunne ikke finnes.
              </p>
              <Link to="/vedlikehold/avtaler">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Tilbake til avtaler
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
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
              <Link to="/vedlikehold/avtaler">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Tilbake
                </Button>
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-primary">
                  {agreement.avtale_nummer}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {agreement.kunde_navn}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(agreement.status)}
              <Badge variant="outline">
                <MapPin className="mr-1 h-3 w-3" />
                {getDepartmentLabel(agreement.department)}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Kundeinformasjon
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Kundenavn</label>
                  <p className="text-lg">{agreement.kunde_navn}</p>
                </div>
                {agreement.kunde_adresse && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Adresse</label>
                    <p>{agreement.kunde_adresse}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agreement.kontaktperson && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Kontaktperson</label>
                      <p>{agreement.kontaktperson}</p>
                    </div>
                  )}
                  {agreement.telefon && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Telefon</label>
                      <p className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {agreement.telefon}
                      </p>
                    </div>
                  )}
                </div>
                {agreement.epost && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">E-post</label>
                    <p className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {agreement.epost}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Agreement Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Avtaledetaljer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Startdato</label>
                    <p className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(agreement.start_dato), 'dd.MM.yyyy', { locale: nb })}
                    </p>
                  </div>
                  {agreement.slutt_dato && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Sluttdato</label>
                      <p className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(agreement.slutt_dato), 'dd.MM.yyyy', { locale: nb })}
                      </p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Besøk per år</label>
                    <p className="text-lg font-semibold">{agreement.besok_per_ar}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Årlig pris</label>
                    <p className="text-lg font-semibold">
                      {new Intl.NumberFormat('no-NO', { 
                        style: 'currency', 
                        currency: 'NOK' 
                      }).format(agreement.pris_grunnlag)}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">KPI-justering</label>
                  <p>{agreement.pris_cpi_justerbar ? 'Aktivert' : 'Deaktivert'}</p>
                </div>
                {agreement.beskrivelse && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Beskrivelse</label>
                    <p className="whitespace-pre-wrap">{agreement.beskrivelse}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Management */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
                <CardDescription>
                  Oppdater avtalestatus
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nåværende status</label>
                  <div className="mt-1">
                    {getStatusBadge(agreement.status)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Endre status</label>
                  <Select 
                    value={agreement.status} 
                    onValueChange={updateStatus}
                    disabled={updating}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planlagt">Planlagt</SelectItem>
                      <SelectItem value="pågår">Pågår</SelectItem>
                      <SelectItem value="fullført">Fullført</SelectItem>
                      <SelectItem value="avbrutt">Avbrutt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Handlinger</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full">
                  <Edit className="mr-2 h-4 w-4" />
                  Rediger avtale
                </Button>
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Last ned PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MaintenanceAgreementDetailPage;