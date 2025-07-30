import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Target, Copy } from "lucide-react";
import { useCreateBudgetTarget, useUpdateBudgetTarget, useBudgetTargetsByYear } from "@/hooks/useBudget";
import { useAuth } from "@/hooks/useOptimizedAuth";
import type { BudgetTarget } from "@/services/budgetService";

const budgetTargetSchema = z.object({
  year: z.number().min(2020).max(2050),
  target_amount: z.number().min(0, "Beløp må være større enn 0"),
  department: z.enum(["oslo", "bergen", "trondheim", "stavanger", "kristiansand", "nord_norge", "innlandet", "vestfold", "agder", "ekstern"]).optional().nullable(),
  supplier_name: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type BudgetTargetFormData = z.infer<typeof budgetTargetSchema>;

interface BudgetTargetFormProps {
  editTarget?: BudgetTarget;
  defaultYear?: number;
  trigger?: React.ReactNode;
}

export const BudgetTargetForm = ({ editTarget, defaultYear, trigger }: BudgetTargetFormProps) => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const createMutation = useCreateBudgetTarget();
  const updateMutation = useUpdateBudgetTarget();
  const { data: previousYearTargets } = useBudgetTargetsByYear((defaultYear || new Date().getFullYear()) - 1);

  const form = useForm<BudgetTargetFormData>({
    resolver: zodResolver(budgetTargetSchema),
    defaultValues: {
      year: editTarget?.year || defaultYear || new Date().getFullYear(),
      target_amount: editTarget?.target_amount || 0,
      department: editTarget?.department || undefined,
      supplier_name: editTarget?.supplier_name || undefined,
      notes: editTarget?.notes || "",
    },
  });

  const onSubmit = async (data: BudgetTargetFormData) => {
    if (!user) return;

    try {
      if (editTarget) {
        await updateMutation.mutateAsync({
          id: editTarget.id,
          updates: {
            ...data,
            updated_by: user.id,
          },
        });
      } else {
        await createMutation.mutateAsync({
          year: data.year,
          target_amount: data.target_amount,
          department: data.department || null,
          supplier_name: data.supplier_name || null,
          notes: data.notes || null,
          created_by: user.id,
        });
      }
      setOpen(false);
      form.reset();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const copyFromPreviousYear = () => {
    if (previousYearTargets && previousYearTargets.length > 0) {
      const generalTarget = previousYearTargets.find(t => !t.department && !t.supplier_name);
      if (generalTarget) {
        form.setValue("target_amount", generalTarget.target_amount);
        form.setValue("notes", `Kopiert fra ${generalTarget.year}: ${generalTarget.notes || ""}`);
      }
    }
  };

  const departments = [
    { value: "oslo", label: "Oslo" },
    { value: "bergen", label: "Bergen" },
    { value: "trondheim", label: "Trondheim" },
    { value: "stavanger", label: "Stavanger" },
    { value: "kristiansand", label: "Kristiansand" },
    { value: "nord_norge", label: "Nord-Norge" },
    { value: "innlandet", label: "Innlandet" },
    { value: "vestfold", label: "Vestfold" },
    { value: "agder", label: "Agder" },
    { value: "ekstern", label: "Ekstern" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nytt budsjettmål
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {editTarget ? "Rediger budsjettmål" : "Opprett budsjettmål"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>År</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    Målbeløp (NOK)
                    {previousYearTargets && previousYearTargets.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={copyFromPreviousYear}
                        className="h-6 px-2 text-xs"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Kopier fra {(form.watch("year") || new Date().getFullYear()) - 1}
                      </Button>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avdeling (valgfritt)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg avdeling eller la stå tom for generelt mål" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Generelt mål (alle avdelinger)</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplier_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leverandør (valgfritt)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="La stå tom for generelt mål eller spesifiser leverandør"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notater</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Tilleggsnotater om budsjettmålet..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Avbryt
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editTarget ? "Oppdater" : "Opprett"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};