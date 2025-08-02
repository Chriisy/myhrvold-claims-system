import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Wrench } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { nb } from 'date-fns/locale';

interface ScheduleStepProps {
  form: UseFormReturn<any>;
  onNext: () => void;
}

export const ScheduleStep: React.FC<ScheduleStepProps> = ({ form, onNext }) => {
  const formData = form.watch();
  
  const generateSchedule = () => {
    if (!formData.start_dato || !formData.besok_per_ar) return [];
    
    const startDate = new Date(formData.start_dato);
    const intervalMonths = 12 / formData.besok_per_ar;
    const schedule = [];
    
    for (let i = 0; i < formData.besok_per_ar; i++) {
      const visitDate = addMonths(startDate, Math.floor(intervalMonths * i));
      schedule.push({
        id: i + 1,
        date: visitDate,
        type: 'rutine',
        equipment: formData.equipment?.length || 0
      });
    }
    
    return schedule;
  };

  const schedule = generateSchedule();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Planlegging av servicebesøk</CardTitle>
          <CardDescription>
            Basert på avtalevilkårene genereres automatisk en serviceplan for første år
          </CardDescription>
        </CardHeader>
        <CardContent>
          {schedule.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Fyll ut avtaledata for å generere serviceplan</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{schedule.length}</p>
                        <p className="text-sm text-muted-foreground">Besøk per år</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <Wrench className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{formData.equipment?.length || 0}</p>
                        <p className="text-sm text-muted-foreground">Utstyr registrert</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">
                          {schedule.length > 0 ? Math.round(12 / schedule.length) : 0}
                        </p>
                        <p className="text-sm text-muted-foreground">Måneder mellom besøk</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Planlagte besøk</h3>
                <div className="space-y-3">
                  {schedule.map((visit) => (
                    <Card key={visit.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {visit.id}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium">
                                Rutinebesøk #{visit.id}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {format(visit.date, 'EEEE dd. MMMM yyyy', { locale: nb })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {visit.equipment} utstyr
                            </Badge>
                            <Badge variant="secondary">
                              Rutine
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">📋 Merk:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Besøkstider kan justeres etter behov</li>
                  <li>• Tekniker tildeles automatisk basert på kapasitet</li>
                  <li>• Påminnelser sendes 4 uker, 2 uker, 1 uke og samme dag</li>
                  <li>• Ekstra besøk kan legges til ved behov</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="button" onClick={onNext} disabled={schedule.length === 0}>
          Neste: Oppsummering
        </Button>
      </div>
    </div>
  );
};