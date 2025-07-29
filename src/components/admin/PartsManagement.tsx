import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Package, Plus, Edit, Trash2, Building2, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Part {
  id: string;
  part_number: string;
  description: string;
  unit_price: number;
  supplier_name?: string;
  category?: string;
  is_active: boolean;
  created_at: string;
}

interface PartsManagementProps {
  onStatsUpdate: () => void;
}

const PartsManagement = ({ onStatsUpdate }: PartsManagementProps) => {
  const [parts, setParts] = useState<Part[]>([]);
  const [suppliers, setSuppliers] = useState<{ name: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [formData, setFormData] = useState({
    part_number: "",
    description: "",
    unit_price: "",
    supplier_name: "",
    category: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchParts();
    fetchSuppliers();
  }, []);

  const fetchParts = async () => {
    try {
      const { data, error } = await supabase
        .from('parts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setParts(data || []);
    } catch (error: any) {
      toast({
        title: "Feil ved henting av deler",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error: any) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const partData = {
        part_number: formData.part_number,
        description: formData.description,
        unit_price: parseFloat(formData.unit_price),
        supplier_name: formData.supplier_name || null,
        category: formData.category || null
      };

      if (editingPart) {
        // Update existing part
        const { error } = await supabase
          .from('parts')
          .update(partData)
          .eq('id', editingPart.id);

        if (error) throw error;

        toast({
          title: "Del oppdatert",
          description: "Delen har blitt oppdatert",
        });
      } else {
        // Create new part
        const { error } = await supabase
          .from('parts')
          .insert([{
            ...partData,
            created_by: (await supabase.auth.getUser()).data.user?.id
          }]);

        if (error) throw error;

        toast({
          title: "Del opprettet",
          description: "Ny del har blitt opprettet",
        });
      }

      setDialogOpen(false);
      setEditingPart(null);
      resetForm();
      fetchParts();
      onStatsUpdate();
    } catch (error: any) {
      toast({
        title: "Feil",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (part: Part) => {
    setEditingPart(part);
    setFormData({
      part_number: part.part_number,
      description: part.description,
      unit_price: part.unit_price.toString(),
      supplier_name: part.supplier_name || "",
      category: part.category || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = async (part: Part) => {
    if (!confirm(`Er du sikker på at du vil slette delen "${part.part_number}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('parts')
        .update({ is_active: false })
        .eq('id', part.id);

      if (error) throw error;

      toast({
        title: "Del slettet",
        description: "Delen har blitt deaktivert",
      });

      fetchParts();
      onStatsUpdate();
    } catch (error: any) {
      toast({
        title: "Feil ved sletting",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingPart(null);
    setFormData({
      part_number: "",
      description: "",
      unit_price: "",
      supplier_name: "",
      category: ""
    });
  };

  const filteredParts = parts.filter(part =>
    part.is_active &&
    (part.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
     part.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
     part.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     part.category?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-gray-100 text-gray-800 border-gray-200';
    const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200'
    ];
    return colors[hash % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Deleadministrasjon</h2>
          <p className="text-muted-foreground">Administrer deler og reservedeler</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ny del
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingPart ? 'Rediger del' : 'Opprett ny del'}
              </DialogTitle>
              <DialogDescription>
                {editingPart ? 'Oppdater delinformasjon' : 'Legg til en ny del i systemet'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="part_number">Delenummer *</Label>
                  <Input
                    id="part_number"
                    value={formData.part_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, part_number: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unit_price">Pris (NOK) *</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit_price: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Beskrivelse *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier_name">Leverandør</Label>
                  <Select 
                    value={formData.supplier_name} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, supplier_name: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Velg leverandør" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Ingen leverandør</SelectItem>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.name} value={supplier.name}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Kategori</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="f.eks. Motor, Filter, Pumpe"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Avbryt
                </Button>
                <Button type="submit">
                  {editingPart ? 'Oppdater' : 'Opprett'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Søk deler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Søk etter delenummer, beskrivelse, leverandør eller kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Parts List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Deler ({filteredParts.length})
            <Badge variant="secondary" className="ml-2">
              {parts.filter(p => p.is_active).length} aktive
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Laster deler...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredParts.map((part) => (
                <div key={part.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{part.part_number}</h3>
                        <Badge variant="outline" className="font-mono">
                          {formatCurrency(part.unit_price)}
                        </Badge>
                        {part.category && (
                          <Badge className={getCategoryColor(part.category)}>
                            <Tag className="h-3 w-3 mr-1" />
                            {part.category}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm mb-2">{part.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        {part.supplier_name && (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span>{part.supplier_name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          <span>Opprettet: {new Date(part.created_at).toLocaleDateString('nb-NO')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(part)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Rediger
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(part)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Slett
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredParts.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4" />
                  <p>
                    {searchTerm 
                      ? "Ingen deler funnet med søkekriteriene." 
                      : "Ingen deler registrert ennå."
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

export default PartsManagement;