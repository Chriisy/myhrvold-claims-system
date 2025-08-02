import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';

interface EquipmentStepProps {
  form: UseFormReturn<any>;
  onNext: () => void;
}

export const EquipmentStep: React.FC<EquipmentStepProps> = ({ form, onNext }) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "equipment"
  });

  const addEquipment = () => {
    append({
      produkt_navn: '',
      kategori: 'kjøl',
      service_intervall_måneder: 12,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Utstyr og maskiner</CardTitle>
          <CardDescription>
            Registrer alt utstyr som skal inkluderes i vedlikeholdsavtalen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {fields.map((field, index) => (
              <Card key={field.id} className="relative">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Utstyr #{index + 1}</CardTitle>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`equipment.${index}.produkt_navn`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Produktnavn *</FormLabel>
                          <FormControl>
                            <Input placeholder="F.eks. Kjøleskap, Fryser..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`equipment.${index}.modell`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modell</FormLabel>
                          <FormControl>
                            <Input placeholder="Modellnummer eller navn" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`equipment.${index}.serienummer`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Serienummer</FormLabel>
                          <FormControl>
                            <Input placeholder="Unikt serienummer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`equipment.${index}.produsent`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Produsent</FormLabel>
                          <FormControl>
                            <Input placeholder="Merke/produsent" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`equipment.${index}.kategori`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Velg kategori" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="kjøl">Kjøl</SelectItem>
                              <SelectItem value="frys">Frys</SelectItem>
                              <SelectItem value="annet">Annet</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`equipment.${index}.lokasjon`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lokasjon</FormLabel>
                          <FormControl>
                            <Input placeholder="Rom, avdeling etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`equipment.${index}.service_intervall_måneder`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service-intervall (måneder)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="60"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || 12)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`equipment.${index}.installasjon_dato`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Installasjonsdato</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addEquipment}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Legg til utstyr
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="button" onClick={onNext}>
          Neste: Planlegg besøk
        </Button>
      </div>
    </div>
  );
};