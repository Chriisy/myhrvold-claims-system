import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Upload, Plus, LogOut, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useOptimizedAuth";
import { supabase } from "@/integrations/supabase/client";
import { DragDropZone } from "@/components/ui/drag-drop-zone";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { CustomerAutocomplete } from "@/components/ui/customer-autocomplete";
import { PartAutocomplete } from "@/components/ui/part-autocomplete";

interface UsedPart {
  partNumber: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

const ClaimsForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [usedParts, setUsedParts] = useState<UsedPart[]>([]);
  
  // Form data
  const [formData, setFormData] = useState({
    // Customer information
    customerName: "",
    customerNumber: "",
    customerContact: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    
    // Product information
    productName: "",
    productModel: "",
    serialNumber: "",
    purchaseDate: "",
    warrantyPeriod: "",
    supplier: "",
    
    // Issue details
    issueType: "",
    issueDescription: "",
    detailedDescription: "",
    solutionDescription: "",
    urgencyLevel: "normal",
    
    // Business fields
    technicianName: profile?.full_name || "",
    department: profile?.department || "",
    salesperson: "",
    evaticJobNumber: "",
    msJobNumber: "",
    
    // Cost breakdown
    workHours: 0,
    hourlyRate: 1250,
    workCost: 0,
    overtimeCost50: 0,
    overtimeCost100: 0,
    travelHours: 0,
    travelCost: 0,
    vehicleKm: 0,
    vehicleCostPerKm: 7.5,
    vehicleCost: 0,
    partsCost: 0,
    totalCost: 0,
    
    // Refund breakdown
    refundedWork: false,
    refundedParts: false,
    refundWorkAmount: 0,
    refundPartsAmount: 0,
    creditNoteNumber: "",
    refundDate: "",
    totalRefund: 0,
    netCost: 0,
    
    // Notes
    internalNotes: "",
    customerNotes: "",
  });
  
  const [files, setFiles] = useState<File[]>([]);

  // Keyboard shortcuts
  const shortcuts = [
    {
      key: 's',
      ctrl: true,
      action: () => {
        const form = document.querySelector('form') as HTMLFormElement;
        if (form) {
          form.requestSubmit();
        }
      },
      description: 'Lagre skjema (Ctrl+S)'
    }
  ];

  useKeyboardShortcuts({ shortcuts });

  useEffect(() => {
    fetchSuppliers();
    if (profile) {
      setFormData(prev => ({
        ...prev,
        technicianName: profile.full_name,
        department: profile.department,
      }));
    }
  }, [profile]);

  // Auto-calculate costs
  useEffect(() => {
    const workCost = formData.workHours * formData.hourlyRate;
    const vehicleCost = formData.vehicleKm * formData.vehicleCostPerKm;
    const usedPartsTotal = usedParts.reduce((sum, part) => sum + part.totalPrice, 0);
    const totalCost = workCost + formData.overtimeCost50 + formData.overtimeCost100 + 
                     formData.travelCost + vehicleCost + usedPartsTotal;
    const totalRefund = formData.refundWorkAmount + formData.refundPartsAmount;
    const netCost = totalCost - totalRefund;

    setFormData(prev => ({
      ...prev,
      workCost,
      vehicleCost,
      partsCost: usedPartsTotal,
      totalCost,
      totalRefund,
      netCost
    }));
  }, [formData.workHours, formData.hourlyRate, formData.overtimeCost50, formData.overtimeCost100, 
      formData.travelCost, formData.vehicleKm, formData.vehicleCostPerKm, 
      formData.refundWorkAmount, formData.refundPartsAmount, usedParts]);

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addUsedPart = () => {
    setUsedParts([...usedParts, {
      partNumber: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    }]);
  };

  const removeUsedPart = (index: number) => {
    setUsedParts(usedParts.filter((_, i) => i !== index));
  };

  const updateUsedPart = (index: number, field: keyof UsedPart, value: string | number) => {
    const newParts = [...usedParts];
    newParts[index] = { ...newParts[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      newParts[index].totalPrice = newParts[index].quantity * newParts[index].unitPrice;
    }
    
    setUsedParts(newParts);
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.customerName.trim()) {
      errors.push("Kunde navn");
    }
    if (!formData.productName.trim()) {
      errors.push("Produktnavn");
    }
    if (!formData.issueType) {
      errors.push("Sakstype");
    }
    if (!formData.issueDescription.trim()) {
      errors.push("Kort beskrivelse av problemet");
    }
    if (!formData.supplier.trim()) {
      errors.push("Leverandør");
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const errors = validateForm();
      if (errors.length > 0) {
        toast({
          title: "Manglende informasjon",
          description: `Du må fylle ut følgende felter: ${errors.join(', ')}`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const claimData = {
        claim_number: '',
        customer_name: formData.customerName,
        customer_contact: formData.customerContact || null,
        customer_email: formData.customerEmail || null,
        customer_phone: formData.customerPhone || null,
        customer_address: formData.customerAddress || null,
        customer_number: formData.customerNumber || null,
        product_name: formData.productName,
        product_model: formData.productModel || null,
        serial_number: formData.serialNumber || null,
        purchase_date: formData.purchaseDate || null,
        warranty_period: formData.warrantyPeriod || null,
        supplier: formData.supplier,
        issue_type: formData.issueType as 'warranty' | 'claim' | 'service_callback' | 'extended_warranty',
        issue_description: formData.issueDescription,
        detailed_description: formData.detailedDescription || null,
        solution_description: formData.solutionDescription || null,
        urgency_level: formData.urgencyLevel as 'low' | 'normal' | 'high' | 'critical',
        technician_name: formData.technicianName,
        department: formData.department as 'oslo' | 'bergen' | 'trondheim' | 'stavanger' | 'kristiansand' | 'nord_norge' | 'innlandet',
        evatic_job_number: formData.evaticJobNumber || null,
        ms_job_number: formData.msJobNumber || null,
        work_hours: formData.workHours || 0,
        hourly_rate: formData.hourlyRate || 0,
        parts_cost: formData.partsCost || 0,
        travel_cost: formData.travelCost || 0,
        internal_notes: formData.internalNotes || null,
        customer_notes: formData.customerNotes || null,
        created_by: user.id,
      };

      const { data: claimResult, error: claimError } = await supabase
        .from('claims')
        .insert(claimData)
        .select()
        .single();

      if (claimError) throw claimError;

      await supabase.from('claim_timeline').insert([{
        claim_id: claimResult.id,
        status: 'new',
        changed_by: user.id,
        notes: 'Reklamasjon opprettet'
      }]);

      toast({
        title: "Reklamasjon opprettet",
        description: `Reklamasjon ${claimResult.claim_number} er opprettet.`,
      });

      navigate(`/claims/${claimResult.id}`);
    } catch (error: any) {
      toast({
        title: "Feil ved opprettelse",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Tilbake
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-primary">Ny reklamasjon</h1>
                <p className="text-muted-foreground">Registrer en ny reklamasjon</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {profile?.full_name} ({profile?.department})
              </span>
              <Button variant="outline" onClick={signOut} size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logg ut
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Kundeinformasjon</CardTitle>
              <CardDescription>Informasjon om kunden som reklamerer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Kunde navn *</Label>
                  <Input
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    placeholder="Meny Øya"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerNumber">Kundenummer</Label>
                  <Input
                    value={formData.customerNumber}
                    onChange={(e) => handleInputChange('customerNumber', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Kontaktperson</Label>
                  <Input
                    value={formData.customerContact}
                    onChange={(e) => handleInputChange('customerContact', e.target.value)}
                    placeholder="Ola Nordmann"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    placeholder="+47 123 45 678"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-post</Label>
                  <Input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    placeholder="kontakt@rema1000.no"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    value={formData.customerAddress}
                    onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                    placeholder="Storgata 1, 4001 Stavanger"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle>Produktinformasjon</CardTitle>
              <CardDescription>Detaljer om produktet som reklameres</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Produktnavn *</Label>
                  <Input
                    value={formData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    placeholder="UBERT varmeslapp DCUCUT1 Cube (nette glass)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productModel">Produktmodell</Label>
                  <Input
                    value={formData.productModel}
                    onChange={(e) => handleInputChange('productModel', e.target.value)}
                    placeholder="Model X200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serienummer</Label>
                  <Input
                    value={formData.serialNumber}
                    onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                    placeholder="71-0324-120"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Kjøpsdato</Label>
                  <Input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warranty">Garantiperiode</Label>
                  <Input
                    value={formData.warrantyPeriod}
                    onChange={(e) => handleInputChange('warrantyPeriod', e.target.value)}
                    placeholder="1 år"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier">Leverandør *</Label>
                  <Input
                    value={formData.supplier}
                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                    placeholder="Velg leverandør"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Reference */}
          <Card>
            <CardHeader>
              <CardTitle>Jobbreferanse</CardTitle>
              <CardDescription>Evakic jobbnummer (hvis tilgjengelig) eller MS-nummer</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="evaticJobNumber">Evakic jobbnummer</Label>
                <Input
                  value={formData.evaticJobNumber}
                  onChange={(e) => handleInputChange('evaticJobNumber', e.target.value)}
                  placeholder="EV-2024-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="msJobNumber">MS-nummer</Label>
                <Input
                  value={formData.msJobNumber}
                  onChange={(e) => handleInputChange('msJobNumber', e.target.value)}
                  placeholder="538430"
                />
              </div>
            </CardContent>
          </Card>

          {/* Problem Description */}
          <Card>
            <CardHeader>
              <CardTitle>Problembeskrivelse</CardTitle>
              <CardDescription>Beskriv feilen eller problemet i detalj</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issueType">Sakstype *</Label>
                  <Select value={formData.issueType} onValueChange={(value) => handleInputChange('issueType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg sakstype" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warranty">Garanti</SelectItem>
                      <SelectItem value="repair">Reparasjon</SelectItem>
                      <SelectItem value="maintenance">Vedlikehold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urgencyLevel">Hastighetsgrad</Label>
                  <Select value={formData.urgencyLevel} onValueChange={(value) => handleInputChange('urgencyLevel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg hastighetsgrad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Lav</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Høy</SelectItem>
                      <SelectItem value="critical">Kritisk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="issueDescription">Kort beskrivelse *</Label>
                <Input
                  value={formData.issueDescription}
                  onChange={(e) => handleInputChange('issueDescription', e.target.value)}
                  placeholder="Temperature controller defective"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="detailedDescription">Detaljert beskrivelse</Label>
                <Textarea
                  value={formData.detailedDescription}
                  onChange={(e) => handleInputChange('detailedDescription', e.target.value)}
                  placeholder="Replaced the controller as it was not supplying power to the lower heating element. The unit was not programmed from the factory"
                  className="min-h-[100px]"
                />
              </div>

              {/* Used Parts Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">+ Reservedeler brukt</h4>
                  <Button type="button" variant="outline" size="sm" onClick={addUsedPart}>
                    <Plus className="h-4 w-4 mr-2" />
                    Legg til ny reservedel
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Logg til alle reservedeler som ble brukt i reparasjonen</p>

                {usedParts.map((part, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label>Delnummer</Label>
                      <Input
                        value={part.partNumber}
                        onChange={(e) => updateUsedPart(index, 'partNumber', e.target.value)}
                        placeholder="Ube342916"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pris (kr)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={part.unitPrice}
                        onChange={(e) => updateUsedPart(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Beskrivelse</Label>
                      <Input
                        value={part.description}
                        onChange={(e) => updateUsedPart(index, 'description', e.target.value)}
                        placeholder="Temperature controller with Ubert logo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Antall</Label>
                      <Input
                        type="number"
                        min="1"
                        value={part.quantity}
                        onChange={(e) => updateUsedPart(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Enhetspris (kr)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={part.totalPrice.toFixed(2)}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeUsedPart(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Slett
                      </Button>
                    </div>
                  </div>
                ))}

                {usedParts.length > 0 && (
                  <div className="text-right">
                    <p className="font-semibold">Total reservedeler: {usedParts.reduce((sum, part) => sum + part.totalPrice, 0).toFixed(2)} kr</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Economic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Økonomisk informasjon</CardTitle>
              <CardDescription>Detaljert kostnadsoversikt med automatisk beregning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-4">Arbeidskostnader</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Tekniske timer</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={formData.workHours}
                      onChange={(e) => handleInputChange('workHours', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Timesats (kr/time)</Label>
                    <Input
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => handleInputChange('hourlyRate', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Arbeidskostnad (kr)</Label>
                    <Input
                      type="number"
                      value={formData.workCost.toFixed(2)}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Overtid 50% timer</Label>
                    <Input type="number" step="0.5" defaultValue="0" />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-lg mb-2">TOTAL KOSTNAD</h4>
                <p className="text-2xl font-bold">{formData.totalCost.toFixed(2)} kr</p>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Refusjon fra leverandør</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.refundedWork}
                        onCheckedChange={(checked) => handleInputChange('refundedWork', checked)}
                      />
                      <span>Refundert arbeid</span>
                      <Input
                        type="number"
                        value={formData.refundWorkAmount}
                        onChange={(e) => handleInputChange('refundWorkAmount', parseFloat(e.target.value) || 0)}
                        className="w-20"
                      />
                      <span className="text-blue-600">kr</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.refundedParts}
                        onCheckedChange={(checked) => handleInputChange('refundedParts', checked)}
                      />
                      <span>Refunderte deler</span>
                      <Input
                        type="number"
                        value={formData.refundPartsAmount}
                        onChange={(e) => handleInputChange('refundPartsAmount', parseFloat(e.target.value) || 0)}
                        className="w-20"
                      />
                      <span className="text-blue-600">kr</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Kreditnota nummer</Label>
                    <Input
                      value={formData.creditNoteNumber}
                      onChange={(e) => handleInputChange('creditNoteNumber', e.target.value)}
                      placeholder="CN-2024-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Refusjon mottatt dato</Label>
                    <Input
                      type="date"
                      value={formData.refundDate}
                      onChange={(e) => handleInputChange('refundDate', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-semibold text-green-600">TOTAL REFUSJON</p>
                    <p className="text-xl font-bold text-green-600">{formData.totalRefund.toFixed(2)} kr</p>
                  </div>
                  <div>
                    <p className="font-semibold">NETTO KOSTNAD</p>
                    <p className="text-xl font-bold">{formData.netCost.toFixed(2)} kr</p>
                  </div>
                  <div>
                    <p className="font-semibold">STATUS</p>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      Delvis refundert
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organization Information */}
          <Card>
            <CardHeader>
              <CardTitle>Organisasjonsinformasjon</CardTitle>
              <CardDescription>Ansvarlige personer og avdelinger</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-4">Ansvarlige</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tekniker</Label>
                    <Input
                      value={formData.technicianName}
                      onChange={(e) => handleInputChange('technicianName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Avdeling</Label>
                    <Input
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Selger/Salgsperson</Label>
                    <Input
                      value={formData.salesperson}
                      onChange={(e) => handleInputChange('salesperson', e.target.value)}
                      placeholder="Navn på selger"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Selgers avdeling</Label>
                    <Input placeholder="Velg avdeling" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Notater</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Interne notater</Label>
                    <Textarea
                      value={formData.internalNotes}
                      onChange={(e) => handleInputChange('internalNotes', e.target.value)}
                      placeholder="Interne notater som ikke er synlige for kunden..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Kundenotater</Label>
                    <Textarea
                      value={formData.customerNotes}
                      onChange={(e) => handleInputChange('customerNotes', e.target.value)}
                      placeholder="Notater som kan deles med kunden..."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle>Vedlegg</CardTitle>
              <CardDescription>Last opp bilder, fakturaer eller andre relevante dokumenter</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">Dra og slipp filer her</p>
                <p className="text-sm text-gray-500">eller klikk for å velge filer</p>
                <p className="text-xs text-gray-400 mt-2">Maks 10MB per fil</p>
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      setFiles([...files, ...Array.from(e.target.files)]);
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Lagrer...' : 'Opprett reklamasjon'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ClaimsForm;