import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Edit, FileText, Calendar, MapPin, User, Phone, Mail, Download, Trash2, Image as ImageIcon, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { generateMaintenancePDF } from '@/utils/maintenancePdfGenerator';
import { useAuth } from '@/hooks/useOptimizedAuth';
import { useNavigate } from 'react-router-dom';

interface MaintenanceAgreement {
  id: string;
  avtale_nummer: string;
  kunde_navn: string;
  kunde_nummer: string | null;
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
  tekniker_id: string | null;
  beskrivelse: string | null;
  vilkar: string | null;
  garantivilkar: string | null;
  prosedyrer_ved_service: string | null;
  kontakt_info: string | null;
  bilder: string[] | null;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string;
  role: string;
}

const MaintenanceAgreementDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState<MaintenanceAgreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [technicians, setTechnicians] = useState<Profile[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

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

      setAgreement({
        ...data,
        bilder: Array.isArray(data.bilder) ? data.bilder : (data.bilder ? [data.bilder] : [])
      } as MaintenanceAgreement);
    } catch (error) {
      console.error('Error in fetchAgreement:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('role', 'technician')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching technicians:', error);
        return;
      }

      setTechnicians(data || []);
    } catch (error) {
      console.error('Error in fetchTechnicians:', error);
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

  const updateTechnician = async (technicianId: string) => {
    if (!agreement) return;
    
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('maintenance_agreements')
        .update({ tekniker_id: technicianId })
        .eq('id', agreement.id);

      if (error) {
        console.error('Error updating technician:', error);
        toast({
          title: "Feil",
          description: "Kunne ikke oppdatere tekniker",
          variant: "destructive"
        });
        return;
      }

      setAgreement({ ...agreement, tekniker_id: technicianId });
      toast({
        title: "Suksess",
        description: "Tekniker oppdatert"
      });
    } catch (error) {
      console.error('Error in updateTechnician:', error);
    } finally {
      setUpdating(false);
    }
  };

  const downloadPDF = async () => {
    if (!agreement) return;
    
    setDownloading(true);
    try {
      await generateMaintenancePDF({
        agreement: {
          avtale_nummer: agreement.avtale_nummer,
          kunde_navn: agreement.kunde_navn,
          kunde_adresse: agreement.kunde_adresse || '',
          kontaktperson: agreement.kontaktperson || '',
          telefon: agreement.telefon || '',
          epost: agreement.epost || '',
          start_dato: agreement.start_dato,
          slutt_dato: agreement.slutt_dato || '',
          besok_per_ar: agreement.besok_per_ar,
          pris_grunnlag: agreement.pris_grunnlag,
          pris_cpi_justerbar: agreement.pris_cpi_justerbar,
          beskrivelse: agreement.beskrivelse || '',
          vilkar: agreement.vilkar || '',
          garantivilkar: agreement.garantivilkar || '',
          prosedyrer_ved_service: agreement.prosedyrer_ved_service || '',
          kontakt_info: agreement.kontakt_info || '',
          equipment: []
        }
      });
      
      toast({
        title: "Suksess",
        description: "PDF lastet ned"
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke laste ned PDF",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };

  const deleteAgreement = async () => {
    if (!agreement) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('maintenance_agreements')
        .delete()
        .eq('id', agreement.id);

      if (error) throw error;

      toast({
        title: "Suksess",
        description: "Avtalen ble slettet",
      });
      
      navigate('/vedlikehold/avtaler');
    } catch (error) {
      console.error('Error deleting agreement:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke slette avtalen",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchAgreement();
    fetchTechnicians();
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
                {agreement.kunde_nummer && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Kundenummer</label>
                    <p>{agreement.kunde_nummer}</p>
                  </div>
                )}
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

            {/* Image Gallery */}
            {agreement.bilder && agreement.bilder.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Bilder og dokumenter ({agreement.bilder.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {agreement.bilder.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="cursor-pointer rounded-lg overflow-hidden border hover:border-primary transition-colors">
                              <img
                                src={imageUrl}
                                alt={`Bilde ${index + 1}`}
                                className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNmMtMi4yIDAtNCAxLjgtNCA0czEuOCA0IDQgNCA0LTEuOCA0LTQtMS44LTQtNC00eiIgZmlsbD0iIzljYTNhZiIvPgo8L3N2Zz4K';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Eye className="h-6 w-6 text-white" />
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Bilde {index + 1}</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4">
                              <img
                                src={imageUrl}
                                alt={`Bilde ${index + 1}`}
                                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNmMtMi4yIDAtNCAxLjgtNCA0czEuOCA0IDQgNCA0LTEuOCA0LTQtMS44LTQtNC00eiIgZmlsbD0iIzljYTNhZiIvPgo8L3N2Zz4K';
                                }}
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
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
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tekniker</label>
                  <Select 
                    value={agreement.tekniker_id || "none"} 
                    onValueChange={(value) => updateTechnician(value === "none" ? "" : value)}
                    disabled={updating}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Velg tekniker" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ingen tekniker</SelectItem>
                      {technicians.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.full_name}
                        </SelectItem>
                      ))}
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
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Edit className="mr-2 h-4 w-4" />
                      Rediger avtale
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rediger avtale</DialogTitle>
                      <DialogDescription>
                        Denne funksjonen er under utvikling.
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={downloadPDF}
                  disabled={downloading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {downloading ? 'Laster ned...' : 'Last ned PDF'}
                </Button>
                {(profile?.role === 'admin' || profile?.role === 'saksbehandler') && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        disabled={deleting}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deleting ? 'Sletter...' : 'Slett avtale'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Dette vil permanent slette avtalen "{agreement?.avtale_nummer}" for {agreement?.kunde_navn}. 
                          Denne handlingen kan ikke angres.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Avbryt</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={deleteAgreement}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Slett avtale
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MaintenanceAgreementDetailPage;