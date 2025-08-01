import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AgreementStep } from './wizard/AgreementStep';
import { EquipmentStep } from './wizard/EquipmentStep';
import { ScheduleStep } from './wizard/ScheduleStep';
import { SummaryStep } from './wizard/SummaryStep';
import { generateMaintenancePDF } from '@/utils/maintenancePdfGenerator';

const maintenanceSchema = z.object({
  // Agreement data
  kunde_navn: z.string().min(1, 'Kundenavn er påkrevd'),
  kunde_nummer: z.string().min(1, 'Kundenummer er påkrevd'),
  kunde_adresse: z.string().optional(),
  kontaktperson: z.string().optional(),
  telefon: z.string().optional(),
  epost: z.string().email('Ugyldig e-postadresse').optional().or(z.literal('')),
  start_dato: z.string().min(1, 'Startdato er påkrevd'),
  slutt_dato: z.string().optional(),
  besok_per_ar: z.number().min(1, 'Minst 1 besøk per år').max(12, 'Maksimalt 12 besøk per år'),
  pris_grunnlag: z.number().min(0, 'Pris må være positiv'),
  pris_cpi_justerbar: z.boolean().default(false),
  department: z.enum(['oslo', 'bergen', 'trondheim', 'stavanger', 'kristiansand', 'nord_norge', 'innlandet']).default('oslo'),
  beskrivelse: z.string().optional(),
  vilkar: z.string().optional(),
  garantivilkar: z.string().optional(),
  prosedyrer_ved_service: z.string().optional(),
  kontakt_info: z.string().optional(),
  
  // Equipment data
  equipment: z.array(z.object({
    produkt_navn: z.string().min(1, 'Produktnavn er påkrevd'),
    modell: z.string().optional(),
    serienummer: z.string().optional(),
    produsent: z.string().optional(),
    kategori: z.string().optional(),
    lokasjon: z.string().optional(),
    installasjon_dato: z.string().optional(),
    service_intervall_måneder: z.number().min(1).max(60).default(12),
  })).min(1, 'Minst ett utstyr må registreres'),
  
  // Images
  bilder: z.array(z.string()).optional(),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

export const MaintenanceWizard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('agreement');
  const [loading, setLoading] = useState(false);

  const form = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      kunde_navn: '',
      kunde_nummer: '',
      kunde_adresse: '',
      kontaktperson: '',
      telefon: '',
      epost: '',
      start_dato: '',
      slutt_dato: '',
      besok_per_ar: 2,
      pris_grunnlag: 0,
      pris_cpi_justerbar: true,
      department: 'oslo',
      beskrivelse: '',
      vilkar: '',
      garantivilkar: `Garantivilkår - Myhrvold Gruppen
Garantien er gjeldende hvis følgende betingelser er oppfylt:
• Produktet brukes til det formål som det er beregnet for
• Bruksanvisningen er fulgt
• Produktet er riktig installert, i henhold til produsentens instruksjoner
• Produktet vedlikeholdes av bruker i henhold til produsentens instruksjoner
• Regelmessig vedlikeholds service utføres og dokumenteres minst 1 gang i året eller i henhold til produsentens spesifikasjoner
• Service på produkt utføres av profesjonelle
• All hasteservice/reparasjon som dekkes av garanti blir utført av Myhrvold Gruppen eller dens servicepartnere
• All garanti/reklamasjonsarbeid utføres innen normal arbeidstid som er mandag-fredag mellom 08.00-16.00. Alt arbeid utenom dette tidsrom er overtidsberettiget

Hvis den oppståtte feilen kan utbedres ved noen av eksemplene nedenfor, gjelder ikke garantien:
• Normal vedlikeholds service
• Pakninger/O-ringer
• Glødelamper
• Avkalkning
• Normale slitedeler
• Forbruksmateriell, slik som dørpakninger, smøremiddel og avkalkningsmiddel
• Omprogrammering av parameter
• Ingen åpenbare/påvisbar feil
• Feil på trykk eller temperatur på tilførsel
• Sikring/glødelamper som kan skiftes uten verktøy
• Rengjøring av kondensor, vaskearmer, varmeveksler, siler, vannfilter, avkalkning, samt øvrig renhold
• Brukerfeil`,
      prosedyrer_ved_service: `Prosedyrer ved service:
Før man ringer burde man sjekke noen få ting:
• Er det strøm til maskinen?
• Hvis noe ikke virker prøv å ta strømmen på maskinen, for å la den stå strømløs i ca 1-3 min før man setter på strømmen og prøver igjen
• Hvis det gjelder en oppvaskmaskin må man påse at det er vann til maskinen

Når man må ringe etter service:
Før man ringer må man ha klart:
• Type maskin
• Produsent
• Serienummer / Maskin nummer
• Hva som er feil / eventuelle feilkoder som vises på display
• Hvor er maskinen plassert
• Når passer det at man kommer for service
• Haste grad

Disse punktene er av høy nødvendighet, slik at våre teknikere kan ha med seg relevante deler og dermed unngå unødvendig tidsforbruk.

Responstid:
Avtalekunder prioriteres i oppdragskøen.
Viktig at kunde opplyser om hastegrad på jobben når den meldes MG
Oppdrag som blir registrert før klokken 10:00, vil så godt det lar seg gjøre bli påbegynt samme dag.
Oppdrag registrert etter klokken 10:00, vil bli påbegynt snarest mulig.

Tilgjengelighet:
Servicetekniker fra MG skal ha full tilgjengelighet til maskinene når service skal gjennomføres.

Arbeidstid:
Arbeidstid er mandag til fredag 08:00 – 16:00, bortsett fra offentlige fridager. Service utenom disse tidene, er overtidsberettiget og tillegg belastes i henhold til priser og betingelser.`,
      kontakt_info: `Kontakt Info

Service:
Ved service 08:00-16:00 kontakter man servicemottaket på telefon: 400 03 900
Eller service@myhrvold.no

Vakttelefon:
400 03 900 (tastevalg vakt) (16:00-23:00 og 06:00-08:00)

Service Koordinator:
Cecilia Franklin - Cecilia.Franklin@myhrvold.no
Marija Keser - Marija.keser@myhrvold.no

Teknisk:
Christopher Strøm - 95 11 44 07 - Christopher.strøm@myhrvold.no

Stykksalg / Prosjekt:
Kontakt din selger eller: Post@myhrvold.no - 22 70 10 00

Regnskap:
22 70 10 00 - regnskap@myhrvold.no

Sentralbord:
22 70 10 00 - sentralbordet@myhrvold.no

Service sjef:
Kristian Rambøl - 95 26 16 23 - Kristian.Rambol@myhrvold.no`,
      equipment: [{
        produkt_navn: '',
        modell: '',
        serienummer: '',
        produsent: '',
        kategori: '',
        lokasjon: '',
        installasjon_dato: '',
        service_intervall_måneder: 12,
      }],
      bilder: [],
    },
  });

  const onSubmit = async (data: MaintenanceFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Feil",
          description: "Du må være logget inn for å opprette avtaler",
          variant: "destructive"
        });
        return;
      }

      // Create maintenance agreement (avtale_nummer is auto-generated by trigger)
      const agreementData = {
        kunde_navn: data.kunde_navn,
        kunde_nummer: data.kunde_nummer,
        kunde_adresse: data.kunde_adresse,
        kontaktperson: data.kontaktperson,
        telefon: data.telefon,
        epost: data.epost,
        start_dato: data.start_dato,
        slutt_dato: data.slutt_dato || null,
        besok_per_ar: data.besok_per_ar,
        pris_grunnlag: data.pris_grunnlag,
        pris_cpi_justerbar: data.pris_cpi_justerbar,
        department: data.department,
        beskrivelse: data.beskrivelse,
        vilkar: data.vilkar,
        garantivilkar: data.garantivilkar,
        prosedyrer_ved_service: data.prosedyrer_ved_service,
        kontakt_info: data.kontakt_info,
        bilder: data.bilder || [],
        created_by: user.id,
      };

      const { data: agreement, error: agreementError } = await supabase
        .from('maintenance_agreements')
        .insert(agreementData as any) // avtale_nummer auto-generated by trigger
        .select()
        .single();

      if (agreementError) {
        console.error('Error creating agreement:', agreementError);
        toast({
          title: "Feil",
          description: "Kunne ikke opprette vedlikeholdsavtale",
          variant: "destructive"
        });
        return;
      }

      // Create equipment records
      const equipmentData = data.equipment.map(eq => ({
        ...eq,
        avtale_id: agreement.id,
        installasjon_dato: eq.installasjon_dato || null,
      }));

      const { error: equipmentError } = await supabase
        .from('equipment')
        .insert(equipmentData);

      if (equipmentError) {
        console.error('Error creating equipment:', equipmentError);
        toast({
          title: "Advarsel",
          description: "Avtale opprettet, men kunne ikke registrere alt utstyr",
          variant: "destructive"
        });
      }

      // Generate scheduled visits
      const startDate = new Date(data.start_dato);
      const visits = [];
      
      for (let i = 0; i < data.besok_per_ar; i++) {
        const visitDate = new Date(startDate);
        visitDate.setMonth(visitDate.getMonth() + (12 / data.besok_per_ar) * i);
        
        visits.push({
          avtale_id: agreement.id,
          planlagt_tid: visitDate.toISOString(),
          beskrivelse: `Rutinebesøk ${i + 1}/${data.besok_per_ar}`,
          visit_type: 'rutine' as const,
        });
      }

      const { error: visitsError } = await supabase
        .from('service_visits')
        .insert(visits);

      if (visitsError) {
        console.error('Error creating visits:', visitsError);
        toast({
          title: "Advarsel", 
          description: "Avtale opprettet, men kunne ikke planlegge alle besøk",
          variant: "destructive"
        });
      }

      // Generate PDF
      try {
        await generateMaintenancePDF({
          agreement: {
            ...agreement,
            equipment: data.equipment,
          }
        });
      } catch (pdfError) {
        console.error('PDF generation failed:', pdfError);
        toast({
          title: "Advarsel",
          description: "Avtale opprettet, men PDF kunne ikke genereres",
          variant: "destructive"
        });
      }

      toast({
        title: "Suksess",
        description: `Vedlikeholdsavtale ${agreement.avtale_nummer} opprettet`,
      });

      // Reset form
      form.reset();
      setActiveTab('agreement');

    } catch (error) {
      console.error('Error in onSubmit:', error);
      toast({
        title: "Feil",
        description: "En uventet feil oppstod",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'agreement', label: 'Avtaledata', component: AgreementStep },
    { id: 'equipment', label: 'Utstyr', component: EquipmentStep },
    { id: 'schedule', label: 'Planlegging', component: ScheduleStep },
    { id: 'summary', label: 'Oppsummering', component: SummaryStep },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Opprett Vedlikeholdsavtale</CardTitle>
        <CardDescription>
          Følg stegene for å opprette en ny vedlikeholdsavtale med utstyr og serviceplan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="mt-6">
                  <tab.component form={form} onNext={() => {
                    const currentIndex = tabs.findIndex(t => t.id === activeTab);
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1].id);
                    }
                  }} />
                </TabsContent>
              ))}

              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const currentIndex = tabs.findIndex(t => t.id === activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(tabs[currentIndex - 1].id);
                    }
                  }}
                  disabled={activeTab === 'agreement'}
                >
                  Forrige
                </Button>

                {activeTab === 'summary' ? (
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Oppretter...' : 'Opprett Avtale'}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => {
                      const currentIndex = tabs.findIndex(t => t.id === activeTab);
                      if (currentIndex < tabs.length - 1) {
                        setActiveTab(tabs[currentIndex + 1].id);
                      }
                    }}
                  >
                    Neste
                  </Button>
                )}
              </div>
            </Tabs>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};