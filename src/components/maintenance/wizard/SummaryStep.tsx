import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, User, Calendar, Wrench, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

interface SummaryStepProps {
  form: UseFormReturn<any>;
  onNext: () => void;
}

export const SummaryStep: React.FC<SummaryStepProps> = ({ form }) => {
  const formData = form.watch();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Oppsummering av vedlikeholdsavtale</CardTitle>
          <CardDescription>
            Kontroller alle opplysninger før avtalen opprettes og PDF genereres
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Kunde informasjon */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Kundeopplysninger</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Navn:</span> {formData.kunde_navn}
              </div>
              {formData.kunde_adresse && (
                <div>
                  <span className="font-medium">Adresse:</span> {formData.kunde_adresse}
                </div>
              )}
              {formData.kontaktperson && (
                <div>
                  <span className="font-medium">Kontaktperson:</span> {formData.kontaktperson}
                </div>
              )}
              {formData.telefon && (
                <div>
                  <span className="font-medium">Telefon:</span> {formData.telefon}
                </div>
              )}
              {formData.epost && (
                <div>
                  <span className="font-medium">E-post:</span> {formData.epost}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Avtalevilkår */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Avtalevilkår</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Startdato:</span> {
                  formData.start_dato ? format(new Date(formData.start_dato), 'dd.MM.yyyy', { locale: nb }) : 'Ikke angitt'
                }
              </div>
              {formData.slutt_dato && (
                <div>
                  <span className="font-medium">Sluttdato:</span> {
                    format(new Date(formData.slutt_dato), 'dd.MM.yyyy', { locale: nb })
                  }
                </div>
              )}
              <div>
                <span className="font-medium">Besøk per år:</span> {formData.besok_per_ar}
              </div>
              <div>
                <span className="font-medium">Årlig pris:</span> {
                  new Intl.NumberFormat('no-NO', { 
                    style: 'currency', 
                    currency: 'NOK' 
                  }).format(formData.pris_grunnlag || 0)
                }
              </div>
              <div className="md:col-span-2">
                <span className="font-medium">KPI-justering:</span>{' '}
                <Badge variant={formData.pris_cpi_justerbar ? "default" : "secondary"}>
                  {formData.pris_cpi_justerbar ? 'Aktivert' : 'Deaktivert'}
                </Badge>
              </div>
            </div>
            
            {formData.beskrivelse && (
              <div className="mt-4">
                <span className="font-medium">Beskrivelse:</span>
                <p className="text-sm text-muted-foreground mt-1">{formData.beskrivelse}</p>
              </div>
            )}
            
            {formData.vilkar && (
              <div className="mt-4">
                <span className="font-medium">Spesielle vilkår:</span>
                <p className="text-sm text-muted-foreground mt-1">{formData.vilkar}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Utstyr */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Registrert utstyr</h3>
            </div>
            <div className="space-y-3">
              {formData.equipment?.map((eq: any, index: number) => (
                <Card key={index} className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{eq.produkt_navn}</h4>
                        {eq.modell && (
                          <p className="text-sm text-muted-foreground">Modell: {eq.modell}</p>
                        )}
                        {eq.serienummer && (
                          <p className="text-sm text-muted-foreground">S/N: {eq.serienummer}</p>
                        )}
                        {eq.lokasjon && (
                          <p className="text-sm text-muted-foreground">Lokasjon: {eq.lokasjon}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          {eq.kategori || 'Ukjent'}
                        </Badge>
                        {eq.service_intervall_måneder && (
                          <p className="text-xs text-muted-foreground">
                            Service: {eq.service_intervall_måneder} mnd
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) || (
                <p className="text-sm text-muted-foreground">Ingen utstyr registrert</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Serviceoversikt */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Serviceoversikt</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {formData.besok_per_ar || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Besøk per år</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {formData.equipment?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Utstyr totalt</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {formData.besok_per_ar > 0 ? Math.round(12 / formData.besok_per_ar) : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Mnd mellom besøk</div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Økonomisk oversikt */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Økonomisk oversikt</h3>
            </div>
            <div className="bg-primary/5 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Årlig grunnpris:</span>{' '}
                  {new Intl.NumberFormat('no-NO', { 
                    style: 'currency', 
                    currency: 'NOK' 
                  }).format(formData.pris_grunnlag || 0)}
                </div>
                <div>
                  <span className="font-medium">Pris per besøk:</span>{' '}
                  {new Intl.NumberFormat('no-NO', { 
                    style: 'currency', 
                    currency: 'NOK' 
                  }).format(formData.besok_per_ar > 0 ? (formData.pris_grunnlag || 0) / formData.besok_per_ar : 0)}
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium">KPI-justering:</span>{' '}
                  {formData.pris_cpi_justerbar 
                    ? 'Prisen justeres årlig basert på konsumprisindeksen' 
                    : 'Fast pris gjennom hele avtaleperioden'
                  }
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};