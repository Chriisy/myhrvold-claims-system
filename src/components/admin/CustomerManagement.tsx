import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, UserCheck, Building, Mail, Phone, Eye, MapPin, Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Customer {
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_contact?: string;
  customer_number?: string;
  claimCount: number;
  latestClaim: string;
  totalCost: number;
}

interface DbCustomer {
  id: string;
  customer_name: string;
  customer_number: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
}

interface CustomerManagementProps {
  onStatsUpdate: () => void;
}

const CustomerManagement = ({ onStatsUpdate }: CustomerManagementProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [dbCustomers, setDbCustomers] = useState<DbCustomer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<DbCustomer | null>(null);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_number: "",
    contact_person: "",
    email: "",
    phone: "",
    address: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
    fetchDbCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      // Fetch unique customers with aggregated data from claims
      const { data: claims, error } = await supabase
        .from('claims')
        .select(`
          customer_name,
          customer_email,
          customer_phone,
          customer_address,
          customer_contact,
          customer_number,
          created_date,
          total_cost
        `)
        .order('created_date', { ascending: false });

      if (error) throw error;

      // Aggregate customer data
      const customerMap = new Map<string, Customer>();
      
      claims?.forEach(claim => {
        const customerName = claim.customer_name;
        
        if (customerMap.has(customerName)) {
          const existing = customerMap.get(customerName)!;
          existing.claimCount += 1;
          existing.totalCost += claim.total_cost || 0;
          // Keep the latest claim date
          if (new Date(claim.created_date) > new Date(existing.latestClaim)) {
            existing.latestClaim = claim.created_date;
          }
          // Update contact info if missing
          if (!existing.customer_email && claim.customer_email) {
            existing.customer_email = claim.customer_email;
          }
          if (!existing.customer_phone && claim.customer_phone) {
            existing.customer_phone = claim.customer_phone;
          }
          if (!existing.customer_address && claim.customer_address) {
            existing.customer_address = claim.customer_address;
          }
          if (!existing.customer_contact && claim.customer_contact) {
            existing.customer_contact = claim.customer_contact;
          }
          if (!existing.customer_number && claim.customer_number) {
            existing.customer_number = claim.customer_number;
          }
        } else {
          customerMap.set(customerName, {
            customer_name: customerName,
            customer_email: claim.customer_email || undefined,
            customer_phone: claim.customer_phone || undefined,
            customer_address: claim.customer_address || undefined,
            customer_contact: claim.customer_contact || undefined,
            customer_number: claim.customer_number || undefined,
            claimCount: 1,
            latestClaim: claim.created_date,
            totalCost: claim.total_cost || 0
          });
        }
      });

      const customersArray = Array.from(customerMap.values()).sort((a, b) => 
        new Date(b.latestClaim).getTime() - new Date(a.latestClaim).getTime()
      );
      
      setCustomers(customersArray);
      onStatsUpdate();
    } catch (error: any) {
      toast({
        title: "Feil ved henting av kunder",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDbCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDbCustomers(data || []);
    } catch (error: any) {
      toast({
        title: "Feil ved henting av kunder",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCustomer) {
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update(formData)
          .eq('id', editingCustomer.id);

        if (error) throw error;

        toast({
          title: "Kunde oppdatert",
          description: "Kunden har blitt oppdatert",
        });
      } else {
        // Create new customer
        const { error } = await supabase
          .from('customers')
          .insert([{
            ...formData,
            created_by: (await supabase.auth.getUser()).data.user?.id
          }]);

        if (error) throw error;

        toast({
          title: "Kunde opprettet",
          description: "Ny kunde har blitt opprettet",
        });
      }

      setDialogOpen(false);
      setEditingCustomer(null);
      setFormData({
        customer_name: "",
        customer_number: "",
        contact_person: "",
        email: "",
        phone: "",
        address: ""
      });
      
      fetchDbCustomers();
      onStatsUpdate();
    } catch (error: any) {
      toast({
        title: "Feil",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (customer: DbCustomer) => {
    setEditingCustomer(customer);
    setFormData({
      customer_name: customer.customer_name,
      customer_number: customer.customer_number,
      contact_person: customer.contact_person || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = async (customer: DbCustomer) => {
    if (!confirm(`Er du sikker på at du vil slette kunden "${customer.customer_name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('customers')
        .update({ is_active: false })
        .eq('id', customer.id);

      if (error) throw error;

      toast({
        title: "Kunde slettet",
        description: "Kunden har blitt deaktivert",
      });

      fetchDbCustomers();
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
    setEditingCustomer(null);
    setFormData({
      customer_name: "",
      customer_number: "",
      contact_person: "",
      email: "",
      phone: "",
      address: ""
    });
  };

  const filteredCustomers = customers.filter(customer =>
    customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customer_contact?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDbCustomers = dbCustomers.filter(customer =>
    customer.is_active &&
    (customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     customer.customer_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
     customer.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     customer.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getClaimCountColor = (count: number) => {
    if (count >= 10) return 'bg-red-100 text-red-800 border-red-200';
    if (count >= 5) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Kundeadministrasjon</h2>
          <p className="text-muted-foreground">Administrer kunder og reklamasjonshistorikk</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ny kunde
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? 'Rediger kunde' : 'Opprett ny kunde'}
              </DialogTitle>
              <DialogDescription>
                {editingCustomer ? 'Oppdater kundeinformasjon' : 'Legg til en ny kunde i systemet'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name">Firmanavn *</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customer_number">Kundenummer *</Label>
                  <Input
                    id="customer_number"
                    value={formData.customer_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_number: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_person">Kontaktperson</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-post</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Avbryt
                </Button>
                <Button type="submit">
                  {editingCustomer ? 'Oppdater' : 'Opprett'}
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
            Søk kunder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Søk etter firmanavn, e-post eller kontaktperson..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Database Customers */}
      <Card>
        <CardHeader>
          <CardTitle>
            Registrerte kunder ({filteredDbCustomers.length})
            <Badge variant="secondary" className="ml-2">
              Database
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Laster kunder...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDbCustomers.map((customer) => (
                <div key={customer.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{customer.customer_name}</h3>
                        <Badge variant="outline">
                          {customer.customer_number}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        {customer.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                        {customer.contact_person && (
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            <span>{customer.contact_person}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                        {customer.address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{customer.address}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-xs">
                            Opprettet: {new Date(customer.created_at).toLocaleDateString('nb-NO')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(customer)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Rediger
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(customer)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Slett
                      </Button>
                      <Link to={`/claims?customer=${encodeURIComponent(customer.customer_name)}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Se reklamasjoner
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredDbCustomers.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCheck className="h-12 w-12 mx-auto mb-4" />
                  <p>
                    {searchTerm 
                      ? "Ingen registrerte kunder funnet med søkekriteriene." 
                      : "Ingen kunder registrert ennå."
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Claims-based Customers */}
      <Card>
        <CardHeader>
          <CardTitle>
            Kunder fra reklamasjoner ({filteredCustomers.length})
            <Badge variant="secondary" className="ml-2">
              Totalt {customers.reduce((sum, c) => sum + c.claimCount, 0)} reklamasjoner
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Laster kunder...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCustomers.map((customer, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{customer.customer_name}</h3>
                        <Badge className={getClaimCountColor(customer.claimCount)}>
                          {customer.claimCount} reklamasjon{customer.claimCount !== 1 ? 'er' : ''}
                        </Badge>
                        {customer.totalCost > 0 && (
                          <Badge variant="outline">
                            {formatCurrency(customer.totalCost)} totalt
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        {customer.customer_email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{customer.customer_email}</span>
                          </div>
                        )}
                        {customer.customer_contact && (
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            <span>{customer.customer_contact}</span>
                          </div>
                        )}
                        {customer.customer_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{customer.customer_phone}</span>
                          </div>
                        )}
                        {customer.customer_address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{customer.customer_address}</span>
                          </div>
                        )}
                        {customer.customer_number && (
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <span>Kundenr: {customer.customer_number}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-xs">
                            Siste reklamasjon: {new Date(customer.latestClaim).toLocaleDateString('nb-NO')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/claims?customer=${encodeURIComponent(customer.customer_name)}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Se reklamasjoner
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredCustomers.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCheck className="h-12 w-12 mx-auto mb-4" />
                  <p>
                    {searchTerm 
                      ? "Ingen kunder funnet med søkekriteriene." 
                      : "Ingen kunder registrert ennå."
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

export default CustomerManagement;
