import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Edit, Trash2, Mail, Phone, User, Building, Shield, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'technician';
  department: 'oslo' | 'bergen' | 'trondheim' | 'stavanger' | 'kristiansand' | 'nord_norge' | 'innlandet' | 'vestfold' | 'agder' | 'ekstern';
  phone?: string;
  is_active: boolean;
  created_date: string;
  last_login?: string;
}

interface UserManagementProps {
  onStatsUpdate: () => void;
}

const departments = [
  { value: 'oslo', label: 'Oslo' },
  { value: 'bergen', label: 'Bergen' },
  { value: 'trondheim', label: 'Trondheim' },
  { value: 'stavanger', label: 'Stavanger' },
  { value: 'kristiansand', label: 'Kristiansand' },
  { value: 'nord_norge', label: 'Nord-Norge' },
  { value: 'innlandet', label: 'Innlandet' },
  { value: 'vestfold', label: 'Vestfold' },
  { value: 'agder', label: 'Agder' },
  { value: 'ekstern', label: 'Ekstern' }
];

const UserManagement = ({ onStatsUpdate }: UserManagementProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    role: "technician" as "admin" | "technician",
    department: "oslo" as "oslo" | "bergen" | "trondheim" | "stavanger" | "kristiansand" | "nord_norge" | "innlandet" | "vestfold" | "agder" | "ekstern",
    phone: "",
    is_active: true,
    password: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_date', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      onStatsUpdate();
    } catch (error: any) {
      toast({
        title: "Feil ved henting av brukere",
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
      if (editingUser) {
        // Update existing user profile
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            role: formData.role,
            department: formData.department,
            phone: formData.phone,
            is_active: formData.is_active
          })
          .eq('id', editingUser.id);

        if (error) throw error;

        toast({
          title: "Bruker oppdatert",
          description: `${formData.full_name} er oppdatert.`,
        });
      } else {
        // Create new user via Supabase Auth Admin API
        // Note: This requires admin privileges and proper setup
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: formData.password || 'TempPassword123!',
          email_confirm: true,
          user_metadata: {
            full_name: formData.full_name,
            role: formData.role,
            department: formData.department
          }
        });

        if (authError) throw authError;

        // The profile will be created automatically via trigger

        toast({
          title: "Bruker opprettet",
          description: `${formData.full_name} er lagt til systemet.`,
        });
      }

      fetchUsers();
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

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email || "",
      full_name: user.full_name,
      role: user.role,
      department: user.department,
      phone: user.phone || "",
      is_active: user.is_active,
      password: ""
    });
    setDialogOpen(true);
  };

  const handleDeactivate = async (id: string, name: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: currentStatus ? "Bruker deaktivert" : "Bruker aktivert",
        description: `${name} er ${currentStatus ? 'deaktivert' : 'aktivert'}.`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Feil ved endring av status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      full_name: "",
      role: "technician",
      department: "oslo",
      phone: "",
      is_active: true,
      password: ""
    });
    setEditingUser(null);
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getDepartmentLabel = (dept: string) => {
    const department = departments.find(d => d.value === dept);
    return department ? department.label : dept;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Brukeradministrasjon</h2>
          <p className="text-muted-foreground">Administrer systembrukere, roller og tilganger</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <UserPlus className="h-4 w-4 mr-2" />
              Ny bruker
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Rediger bruker" : "Ny bruker"}
              </DialogTitle>
              <DialogDescription>
                {editingUser 
                  ? "Oppdater brukerinformasjon nedenfor." 
                  : "Legg til en ny bruker i systemet."
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="full_name">Fullt navn *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    required
                    placeholder="F.eks. Ola Nordmann"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-post *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    disabled={!!editingUser}
                    placeholder="ola.nordmann@myhrvold.no"
                  />
                </div>
                {!editingUser && (
                  <div>
                    <Label htmlFor="password">Midlertidig passord</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="La stå tom for auto-generert"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="role">Rolle *</Label>
                  <Select value={formData.role} onValueChange={(value: "admin" | "technician") => setFormData(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technician">Tekniker</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Avdeling *</Label>
                  <Select value={formData.department} onValueChange={(value: "oslo" | "bergen" | "trondheim" | "stavanger" | "kristiansand" | "nord_norge" | "innlandet" | "vestfold" | "agder" | "ekstern") => setFormData(prev => ({ ...prev, department: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg avdeling" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept.value} value={dept.value}>{dept.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+47 123 45 678"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Aktiv bruker</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Avbryt
                </Button>
                <Button type="submit">
                  {editingUser ? "Oppdater" : "Opprett"}
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
            Søk brukere
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Søk etter navn, e-post eller avdeling..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Brukere ({filteredUsers.length})
            <Badge variant="secondary" className="ml-2">
              {users.filter(u => u.is_active).length} aktive
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Laster brukere...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{user.full_name}</h3>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role === 'admin' ? 'Administrator' : 'Tekniker'}
                        </Badge>
                        <Badge variant={user.is_active ? "default" : "secondary"}>
                          {user.is_active ? "Aktiv" : "Inaktiv"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <span>{getDepartmentLabel(user.department)}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Rediger
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            {user.is_active ? "Deaktiver" : "Aktiver"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {user.is_active ? "Deaktiver" : "Aktiver"} bruker?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Er du sikker på at du vil {user.is_active ? 'deaktivere' : 'aktivere'} brukeren "{user.full_name}"?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Avbryt</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeactivate(user.id, user.full_name, user.is_active)}
                            >
                              {user.is_active ? "Deaktiver" : "Aktiver"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredUsers.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4" />
                  <p>
                    {searchTerm 
                      ? "Ingen brukere funnet med søkekriteriene." 
                      : "Ingen brukere registrert ennå."
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

export default UserManagement;