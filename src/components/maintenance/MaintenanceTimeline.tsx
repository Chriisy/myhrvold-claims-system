import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, isWithinInterval } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, User, FileText, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useOptimizedAuth';

interface ServiceVisit {
  id: string;
  planlagt_tid: string;
  faktisk_starttid: string | null;
  faktisk_slutttid: string | null;
  tekniker_navn: string | null;
  visit_type: 'rutine' | 'reparasjon' | 'installasjon' | 'inspeksjon';
  status: 'planlagt' | 'pågår' | 'fullført' | 'avbrutt';
  beskrivelse: string | null;
  maintenance_agreements: {
    avtale_nummer: string;
    kunde_navn: string;
    kunde_adresse: string | null;
  } | null;
}

interface Filters {
  search: string;
  status: string;
  tekniker: string;
  department: string;
}

interface WeeklyVisits {
  thisWeek: ServiceVisit[];
  twoWeeks: ServiceVisit[];
  fourWeeks: ServiceVisit[];
}

export const MaintenanceTimeline: React.FC = () => {
  const { profile } = useAuth();
  const [visits, setVisits] = useState<ServiceVisit[]>([]);
  const [weeklyVisits, setWeeklyVisits] = useState<WeeklyVisits>({
    thisWeek: [],
    twoWeeks: [],
    fourWeeks: []
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: 'all',
    tekniker: 'all',
    department: 'all'
  });
  const [selectedVisit, setSelectedVisit] = useState<ServiceVisit | null>(null);
  const [technicians, setTechnicians] = useState<{id: string, full_name: string}[]>([]);

  const fetchTechnicians = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'technician')
        .eq('is_active', true);

      if (error) throw error;
      setTechnicians(data || []);
    } catch (error) {
      console.error('Error fetching technicians:', error);
    }
  };

  const fetchVisits = async () => {
    try {
      let query = supabase
        .from('service_visits')
        .select(`
          *,
          maintenance_agreements (
            avtale_nummer,
            kunde_navn,
            kunde_adresse,
            department
          )
        `)
        .order('planlagt_tid', { ascending: true });

      // Apply status filter
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status as 'planlagt' | 'pågår' | 'fullført' | 'avbrutt');
      }

      // Apply tekniker filter
      if (filters.tekniker !== 'all') {
        query = query.eq('tekniker_id', filters.tekniker);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching visits:', error);
        toast({
          title: "Feil",
          description: "Kunne ikke hente servicebesøk",
          variant: "destructive"
        });
        return;
      }

      let filteredData = data || [];

      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(visit =>
          visit.maintenance_agreements?.kunde_navn?.toLowerCase().includes(searchLower) ||
          visit.maintenance_agreements?.avtale_nummer?.toLowerCase().includes(searchLower) ||
          visit.beskrivelse?.toLowerCase().includes(searchLower)
        );
      }

      // Apply department filter (only if user is not admin/saksbehandler)
      if (profile?.role === 'technician' && profile?.department) {
        filteredData = filteredData.filter(visit =>
          visit.maintenance_agreements?.department === profile.department
        );
      } else if (filters.department !== 'all') {
        filteredData = filteredData.filter(visit =>
          visit.maintenance_agreements?.department === filters.department
        );
      }

      // Filter out past visits unless completed
      const now = new Date();
      filteredData = filteredData.filter(visit => {
        const plannedDate = new Date(visit.planlagt_tid);
        return plannedDate >= now || visit.status === 'fullført';
      });

      // Organize visits by week
      const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
      const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
      
      const twoWeeksStart = startOfWeek(addWeeks(now, 1), { weekStartsOn: 1 });
      const twoWeeksEnd = endOfWeek(addWeeks(now, 1), { weekStartsOn: 1 });
      
      const fourWeeksStart = startOfWeek(addWeeks(now, 2), { weekStartsOn: 1 });
      const fourWeeksEnd = endOfWeek(addWeeks(now, 3), { weekStartsOn: 1 });

      const weeklyData: WeeklyVisits = {
        thisWeek: filteredData.filter(visit => 
          isWithinInterval(new Date(visit.planlagt_tid), { start: thisWeekStart, end: thisWeekEnd })
        ),
        twoWeeks: filteredData.filter(visit => 
          isWithinInterval(new Date(visit.planlagt_tid), { start: twoWeeksStart, end: twoWeeksEnd })
        ),
        fourWeeks: filteredData.filter(visit => 
          isWithinInterval(new Date(visit.planlagt_tid), { start: fourWeeksStart, end: fourWeeksEnd })
        )
      };

      setVisits(filteredData);
      setWeeklyVisits(weeklyData);
    } catch (error) {
      console.error('Error in fetchVisits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
    fetchVisits();
  }, [filters, profile]);

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

  const getVisitTypeIcon = (type: string) => {
    switch (type) {
      case 'rutine':
        return <Calendar className="h-4 w-4" />;
      case 'reparasjon':
        return <FileText className="h-4 w-4" />;
      case 'installasjon':
        return <MapPin className="h-4 w-4" />;
      case 'inspeksjon':
        return <Clock className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const renderVisitsList = (visits: ServiceVisit[], emptyMessage: string) => {
    if (visits.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {visits.map((visit) => (
          <Sheet key={visit.id}>
            <SheetTrigger asChild>
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getVisitTypeIcon(visit.visit_type)}
                      <div>
                        <h3 className="font-medium">
                          {visit.maintenance_agreements?.kunde_navn || 'Ukjent kunde'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {visit.maintenance_agreements?.avtale_nummer}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusBadge(visit.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(visit.planlagt_tid), 'dd.MM.yyyy HH:mm', { locale: nb })}
                      </p>
                      {visit.tekniker_navn && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {visit.tekniker_navn}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SheetTrigger>
            
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Servicebesøk detaljer</SheetTitle>
                <SheetDescription>
                  {visit.maintenance_agreements?.avtale_nummer} - {visit.maintenance_agreements?.kunde_navn}
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Planlagt tid</h4>
                  <p className="text-sm">
                    {format(new Date(visit.planlagt_tid), 'EEEE dd.MM.yyyy \'kl.\' HH:mm', { locale: nb })}
                  </p>
                </div>
                
                {visit.beskrivelse && (
                  <div>
                    <h4 className="font-medium mb-2">Beskrivelse</h4>
                    <p className="text-sm">{visit.beskrivelse}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium mb-2">Type</h4>
                  <Badge variant="outline">
                    {visit.visit_type.charAt(0).toUpperCase() + visit.visit_type.slice(1)}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Status</h4>
                  {getStatusBadge(visit.status)}
                </div>
                
                {visit.maintenance_agreements?.kunde_adresse && (
                  <div>
                    <h4 className="font-medium mb-2">Adresse</h4>
                    <p className="text-sm">{visit.maintenance_agreements.kunde_adresse}</p>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Laster servicebesøk...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtrer servicebesøk
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Søk kunde, avtale eller beskrivelse..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <div>
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
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
          <div>
            <Select value={filters.tekniker} onValueChange={(value) => setFilters(prev => ({ ...prev, tekniker: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Velg tekniker" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle teknikere</SelectItem>
                {technicians.map(tech => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(profile?.role === 'admin' || profile?.role === 'saksbehandler') && (
            <div>
              <Select value={filters.department} onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg avdeling" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle avdelinger</SelectItem>
                  <SelectItem value="oslo">Oslo</SelectItem>
                  <SelectItem value="bergen">Bergen</SelectItem>
                  <SelectItem value="trondheim">Trondheim</SelectItem>
                  <SelectItem value="stavanger">Stavanger</SelectItem>
                  <SelectItem value="kristiansand">Kristiansand</SelectItem>
                  <SelectItem value="nord_norge">Nord-Norge</SelectItem>
                  <SelectItem value="innlandet">Innlandet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Kommende servicebesøk</CardTitle>
          <CardDescription>
            Organisert etter uke
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="thisWeek" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="thisWeek">
                Denne uka ({weeklyVisits.thisWeek.length})
              </TabsTrigger>
              <TabsTrigger value="twoWeeks">
                Om 2 uker ({weeklyVisits.twoWeeks.length})
              </TabsTrigger>
              <TabsTrigger value="fourWeeks">
                Om 2-4 uker ({weeklyVisits.fourWeeks.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="thisWeek" className="mt-6">
              {renderVisitsList(weeklyVisits.thisWeek, "Ingen besøk denne uka")}
            </TabsContent>
            
            <TabsContent value="twoWeeks" className="mt-6">
              {renderVisitsList(weeklyVisits.twoWeeks, "Ingen besøk neste uke")}
            </TabsContent>
            
            <TabsContent value="fourWeeks" className="mt-6">
              {renderVisitsList(weeklyVisits.fourWeeks, "Ingen besøk i uke 3-4")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};