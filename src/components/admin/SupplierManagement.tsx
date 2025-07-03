import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Edit, Trash2, Building2, Mail, Phone, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Supplier {
  id: string;
  name: string;
  email?: string;
  contact_person?: string;
  phone?: string;
  is_active: boolean;
}

interface SupplierManagementProps {
  onStatsUpdate: () => void;
}

const SupplierManagement = ({ onStatsUpdate }: SupplierManagementProps) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact_person: "",
    phone: "",
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (error) throw error;
      setSuppliers(data || []);
      onStatsUpdate();
    } catch (error: any) {
      toast({
        title: "Feil ved henting av leverandører",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSupplier) {
        // Update existing supplier
        const { error } = await supabase
          .from('suppliers')
          .update(formData)
          .eq('id', editingSupplier.id);

        if (error) throw error;

        toast({
          title: "Leverandør oppdatert",
          description: `${formData.name} er oppdatert.`,
        });
      } else {
        // Create new supplier
        const { error } = await supabase
          .from('suppliers')
          .insert(formData);

        if (error) throw error;

        toast({
          title: "Leverandør opprettet",
          description: `${formData.name} er lagt til.`,
        });
      }

      fetchSuppliers();
      resetForm();
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Feil ved lagring",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      email: supplier.email || "",
      contact_person: supplier.contact_person || "",
      phone: supplier.phone || "",
      is_active: supplier.is_active
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Leverandør slettet",
        description: `${name} er slettet.`,
      });

      fetchSuppliers();
    } catch (error: any) {
      toast({
        title: "Feil ved sletting",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      contact_person: "",
      phone: "",
      is_active: true
    });
    setEditingSupplier(null);
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Leverandøradministrasjon</h2>
          <p className="text-muted-foreground">Administrer leverandører og kontaktinformasjon</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Ny leverandør
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? "Rediger leverandør" : "Ny leverandør"}
              </DialogTitle>
              <DialogDescription>
                {editingSupplier 
                  ? "Oppdater leverandørinformasjon nedenfor." 
                  : "Legg til en ny leverandør i systemet."
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="name">Leverandørnavn *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="F.eks. Rational"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-post</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="service@leverandor.no"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_person">Kontaktperson</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                    placeholder="F.eks. Service Team"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+47 12 34 56 78"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Aktiv leverandør</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Avbryt
                </Button>
                <Button type="submit">
                  {editingSupplier ? "Oppdater" : "Opprett"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Søk leverandører
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Søk etter navn, e-post eller kontaktperson..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Suppliers List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Leverandører ({filteredSuppliers.length})
            <Badge variant="secondary" className="ml-2">
              {suppliers.filter(s => s.is_active).length} aktive
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Laster leverandører...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSuppliers.map((supplier) => (
                <div key={supplier.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{supplier.name}</h3>
                        <Badge variant={supplier.is_active ? "default" : "secondary"}>
                          {supplier.is_active ? "Aktiv" : "Inaktiv"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        {supplier.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{supplier.email}</span>
                          </div>
                        )}
                        {supplier.contact_person && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{supplier.contact_person}</span>
                          </div>
                        )}
                        {supplier.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{supplier.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(supplier)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Rediger
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Slett
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Dette vil permanent slette leverandøren "{supplier.name}". 
                              Denne handlingen kan ikke angres.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Avbryt</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(supplier.id, supplier.name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Slett leverandør
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredSuppliers.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4" />
                  <p>
                    {searchTerm 
                      ? "Ingen leverandører funnet med søkekriteriene." 
                      : "Ingen leverandører registrert ennå."
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierManagement;