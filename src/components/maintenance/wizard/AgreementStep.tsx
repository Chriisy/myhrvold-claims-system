import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AgreementStepProps {
  form: UseFormReturn<any>;
  onNext: () => void;
}

export const AgreementStep: React.FC<AgreementStepProps> = ({ form, onNext }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Kundeopplysninger</CardTitle>
          <CardDescription>
            Grunnleggende informasjon om kunden som avtalen gjelder
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="kunde_navn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kundenavn *</FormLabel>
                <FormControl>
                  <Input placeholder="Firmanavn eller privatperson" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kunde_adresse"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse</FormLabel>
                <FormControl>
                  <Input placeholder="Gateadresse, postnummer og sted" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="kontaktperson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kontaktperson</FormLabel>
                  <FormControl>
                    <Input placeholder="Navn på kontaktperson" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon</FormLabel>
                  <FormControl>
                    <Input placeholder="+47 000 00 000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="epost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-post</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="kunde@eksempel.no" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avtalevilkår</CardTitle>
          <CardDescription>
            Periode, pris og øvrige betingelser for vedlikeholdsavtalen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="start_dato"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Startdato *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slutt_dato"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sluttdato</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="besok_per_ar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Besøk per år *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      max="12" 
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pris_grunnlag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Årlig pris (NOK) *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="pris_cpi_justerbar"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">KPI-justering</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Skal prisen justeres årlig basert på konsumprisindeksen?
                  </div>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="beskrivelse"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beskrivelse av tjenester</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Beskriv hvilke tjenester som inngår i avtalen..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vilkar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Spesielle vilkår</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Eventuelle spesielle vilkår eller merknader..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="garantivilkar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Garantivilkår</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Garantivilkår og betingelser..."
                    className="min-h-32"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prosedyrer_ved_service"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prosedyrer ved service</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Prosedyrer og instruksjoner for service..."
                    className="min-h-32"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kontakt_info"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kontaktinformasjon</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Kontaktinformasjon for service og support..."
                    className="min-h-32"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="button" onClick={onNext}>
          Neste: Registrer utstyr
        </Button>
      </div>
    </div>
  );
};