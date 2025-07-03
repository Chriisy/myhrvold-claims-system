import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Upload, Plus, LogOut, Info, Calculator, Trash2, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const ClaimsFormAdvanced = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [supplierProfiles, setSupplierProfiles] = useState<any[]>([]);
  const [selectedSupplierProfile, setSelectedSupplierProfile] = useState<any>(null);
  
  // Form data with advanced economics
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
    urgencyLevel: "normal",
    
    // Business fields - dual job number system
    technicianName: profile?.full_name || "",
    department: profile?.department || "",
    evaticJobNumber: "",
    msJobNumber: "",
    
    // Advanced cost breakdown
    workHours: 0,
    hourlyRate: 1250,
    travelHours: 0,
    travelDistanceKm: 0,
    vehicleCostPerKm: 7.5,
    partsCost: 0,
    consumablesCost: 0,
    externalServicesCost: 0,
    travelCost: 0,
    
    // Refund breakdown
    refundedWorkCost: 0,
    refundedTravelCost: 0,
    refundedVehicleCost: 0,
    refundedPartsCost: 0,
    refundedOtherCost: 0,
    creditNoteNumber: "",
    refundDateReceived: "",
    
    // Refund status checkboxes
    workCostRefunded: false,
    travelCostRefunded: false,
    vehicleCostRefunded: false,
    partsCostRefunded: false,
    otherCostRefunded: false,
    
    // Notes
    internalNotes: "",
    customerNotes: "",
  });
  
  const [files, setFiles] = useState<File[]>([]);
  const [currentTab, setCurrentTab] = useState("customer");
  const [parts, setParts] = useState<Array<{
    id: string;
    partNumber: string;
    description: string;
    price: number;
    refundRequested: boolean;
    refundApproved: boolean;
  }>>([]);

  useEffect(() => {
    fetchSuppliers();
    fetchSupplierProfiles();
    if (profile) {
      setFormData(prev => ({
        ...prev,
        technicianName: profile.full_name,
        department: profile.department,
      }));
    }
  }, [profile]);

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

  const fetchSupplierProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('supplier_refund_profiles')
        .select('*')
        .order('supplier_name');
      
      if (error) throw error;
      setSupplierProfiles(data || []);
    } catch (error) {
      console.error('Error fetching supplier profiles:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Update supplier profile when supplier changes
    if (field === 'supplier') {
      const profile = supplierProfiles.find(p => p.supplier_name === value);
      setSelectedSupplierProfile(profile);
      
      // Auto-suggest refund eligibility based on supplier business rules
      if (parts.length > 0) {
        autoSuggestRefunds(value);
      }
    }
  };

  // Auto-suggest refunds based on supplier policies
  const autoSuggestRefunds = (supplierName: string) => {
    const lowerSupplier = supplierName.toLowerCase();
    
    setParts(prevParts => prevParts.map(part => {
      let shouldRefund = false;
      
      // Business rules for different suppliers
      if (lowerSupplier.includes('rational')) {
        shouldRefund = true; // Rational typically refunds all parts under warranty
      } else if (lowerSupplier.includes('hobart')) {
        shouldRefund = true; // Hobart typically refunds parts only, not labor
      } else if (lowerSupplier.includes('comenda')) {
        shouldRefund = true; // Comenda refunds everything if under warranty
      } else if (lowerSupplier.includes('electrolux')) {
        shouldRefund = true; // Electrolux good refund policy
      } else if (lowerSupplier.includes('miele')) {
        shouldRefund = true; // Miele excellent warranty support
      } else {
        shouldRefund = false; // Conservative default for unknown suppliers
      }
      
      return { ...part, refundRequested: shouldRefund };
    }));
    
    // Show notification about auto-suggestions
    if (parts.length > 0) {
      toast({
        title: "Auto-forslag aktivert",
        description: `Refusjonsforslag basert på ${supplierName} sine retningslinjer er satt.`,
        duration: 3000,
      });
    }
  };

  const calculateWorkCost = () => formData.workHours * formData.hourlyRate;
  const calculateTravelTimeCost = () => formData.travelHours * formData.hourlyRate;
  const calculateVehicleCost = () => formData.travelDistanceKm * formData.vehicleCostPerKm;
  
  const calculateTotalCost = () => {
    return calculateWorkCost() + 
           calculateTravelTimeCost() + 
           calculateVehicleCost() + 
           formData.partsCost + 
           formData.consumablesCost + 
           formData.externalServicesCost + 
           formData.travelCost;
  };

  const calculateTotalRefund = () => {
    return formData.refundedWorkCost + 
           formData.refundedTravelCost + 
           formData.refundedVehicleCost + 
           formData.refundedPartsCost + 
           formData.refundedOtherCost;
  };

  const calculateNetCost = () => calculateTotalCost() - calculateTotalRefund();

  // Parts management functions
  const addPart = () => {
    const newPart = {
      id: Date.now().toString(),
      partNumber: "",
      description: "",
      price: 0,
      refundRequested: false,
      refundApproved: false
    };
    setParts([...parts, newPart]);
  };

  const removePart = (id: string) => {
    setParts(parts.filter(part => part.id !== id));
    updatePartsTotal();
  };

  const updatePart = (id: string, field: string, value: string | number | boolean) => {
    setParts(prevParts => {
      const updatedParts = prevParts.map(part => 
        part.id === id ? { ...part, [field]: value } : part
      );
      
      // Immediate calculation for parts cost
      const newTotal = updatedParts.reduce((sum, part) => sum + (part.price || 0), 0);
      handleInputChange('partsCost', newTotal);
      
      // Immediate calculation for refunded parts cost
      const refundedTotal = updatedParts.reduce((sum, part) => 
        part.refundRequested ? sum + part.price : sum, 0
      );
      handleInputChange('refundedPartsCost', refundedTotal);
      handleInputChange('partsCostRefunded', refundedTotal > 0);
      
      return updatedParts;
    });
  };

  const updatePartsTotal = () => {
    const total = parts.reduce((sum, part) => sum + (part.price || 0), 0);
    handleInputChange('partsCost', total);
  };

  const calculateRefundedPartsTotal = () => {
    return parts.reduce((sum, part) => 
      part.refundRequested ? sum + part.price : sum, 0
    );
  };

  // Use effect to update parts total whenever parts change
  useEffect(() => {
    updatePartsTotal();
    const refundedTotal = calculateRefundedPartsTotal();
    handleInputChange('refundedPartsCost', refundedTotal);
    handleInputChange('partsCostRefunded', refundedTotal > 0);
  }, [parts]);

  // Tab validation functions
  const isTabComplete = (tab: string) => {
    switch (tab) {
      case "customer":
        return formData.customerName && formData.customerNumber && formData.productName && formData.supplier;
      case "problem":
        return formData.issueType && formData.issueDescription;
      case "economics":
        return true; // Economics tab is optional fields
      case "organization":
        return formData.technicianName && formData.department;
      default:
        return true;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles([...files, ...Array.from(event.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.customerName || !formData.customerNumber) {
      toast({
        title: "Kundeinfo mangler",
        description: "Kundenavn og kundenummer er påkrevd",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.evaticJobNumber && !formData.msJobNumber) {
      toast({
        title: "Jobbreferanse mangler",
        description: "Enten Evatic jobbnummer eller MS-nummer må fylles ut",
        variant: "destructive",
      });
      return false;
    }

    // Validate refund amounts don't exceed costs
    if (formData.refundedWorkCost > calculateWorkCost()) {
      toast({
        title: "Ugyldig refusjon",
        description: "Refundert arbeid kan ikke overstige arbeidskostnad",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validateForm()) return;
    
    setLoading(true);
    try {
      const claimData = {
        claim_number: '',
        customer_name: formData.customerName,
        customer_number: formData.customerNumber,
        customer_contact: formData.customerContact,
        customer_email: formData.customerEmail,
        customer_phone: formData.customerPhone,
        customer_address: formData.customerAddress,
        product_name: formData.productName,
        product_model: formData.productModel,
        serial_number: formData.serialNumber,
        purchase_date: formData.purchaseDate || null,
        warranty_period: formData.warrantyPeriod,
        supplier: formData.supplier,
        issue_type: formData.issueType as 'warranty' | 'claim' | 'service_callback' | 'extended_warranty',
        issue_description: formData.issueDescription,
        detailed_description: formData.detailedDescription,
        urgency_level: formData.urgencyLevel as 'low' | 'normal' | 'high' | 'critical',
        technician_name: formData.technicianName,
        department: formData.department as 'oslo' | 'bergen' | 'trondheim' | 'stavanger' | 'kristiansand' | 'nord_norge' | 'innlandet',
        evatic_job_number: formData.evaticJobNumber,
        ms_job_number: formData.msJobNumber,
        work_hours: formData.workHours,
        hourly_rate: formData.hourlyRate,
        travel_hours: formData.travelHours,
        travel_distance_km: formData.travelDistanceKm,
        vehicle_cost_per_km: formData.vehicleCostPerKm,
        parts_cost: formData.partsCost,
        consumables_cost: formData.consumablesCost,
        external_services_cost: formData.externalServicesCost,
        travel_cost: formData.travelCost,
        refunded_work_cost: formData.refundedWorkCost,
        refunded_travel_cost: formData.refundedTravelCost,
        refunded_vehicle_cost: formData.refundedVehicleCost,
        refunded_parts_cost: formData.refundedPartsCost,
        refunded_other_cost: formData.refundedOtherCost,
        credit_note_number: formData.creditNoteNumber,
        refund_date_received: formData.refundDateReceived || null,
        work_cost_refunded: formData.workCostRefunded,
        travel_cost_refunded: formData.travelCostRefunded,
        vehicle_cost_refunded: formData.vehicleCostRefunded,
        parts_cost_refunded: formData.partsCostRefunded,
        other_cost_refunded: formData.otherCostRefunded,
        internal_notes: formData.internalNotes,
        customer_notes: formData.customerNotes,
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
                <p className="text-muted-foreground">Registrer en ny reklamasjon med avansert økonomi</p>
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
        <form onSubmit={handleSubmit}>
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="customer" className="flex items-center gap-2">
                {isTabComplete("customer") && <CheckCircle className="h-4 w-4" />}
                Kunde & Produkt
              </TabsTrigger>
              <TabsTrigger value="problem" className="flex items-center gap-2">
                {isTabComplete("problem") && <CheckCircle className="h-4 w-4" />}
                Problem & Løsning
              </TabsTrigger>
              <TabsTrigger value="economics" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Økonomi
              </TabsTrigger>
              <TabsTrigger value="organization" className="flex items-center gap-2">
                {isTabComplete("organization") && <CheckCircle className="h-4 w-4" />}
                Organisasjon
              </TabsTrigger>
              <TabsTrigger value="summary">
                Sammendrag
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Customer & Product */}
            <TabsContent value="customer" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Kundeinformasjon</CardTitle>
                  <CardDescription>Informasjon om kunden som reklamerer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerName">Kunde navn *</Label>
                      <Input 
                        id="customerName" 
                        value={formData.customerName}
                        onChange={(e) => handleInputChange('customerName', e.target.value)}
                        placeholder="Rema 1000 Stavanger" 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerNumber">Kundenummer *</Label>
                      <Input 
                        id="customerNumber" 
                        value={formData.customerNumber}
                        onChange={(e) => handleInputChange('customerNumber', e.target.value)}
                        placeholder="KN123456" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactPerson">Kontaktperson</Label>
                      <Input 
                        id="contactPerson" 
                        value={formData.customerContact}
                        onChange={(e) => handleInputChange('customerContact', e.target.value)}
                        placeholder="Ola Nordmann" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-post</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={formData.customerEmail}
                        onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                        placeholder="kontakt@rema1000.no" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Telefon</Label>
                      <Input 
                        id="phone" 
                        value={formData.customerPhone}
                        onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                        placeholder="+47 123 45 678" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Adresse</Label>
                      <Input 
                        id="address" 
                        value={formData.customerAddress}
                        onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                        placeholder="Storgata 1, 4001 Stavanger" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Produktinformasjon</CardTitle>
                  <CardDescription>Detaljer om produktet som reklameres</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="productName">Produktnavn *</Label>
                      <Input 
                        id="productName" 
                        value={formData.productName}
                        onChange={(e) => handleInputChange('productName', e.target.value)}
                        placeholder="Kjøleskap Model X200" 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="productModel">Produktmodell</Label>
                      <Input 
                        id="productModel" 
                        value={formData.productModel}
                        onChange={(e) => handleInputChange('productModel', e.target.value)}
                        placeholder="Model X200" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="serialNumber">Serienummer</Label>
                      <Input 
                        id="serialNumber" 
                        value={formData.serialNumber}
                        onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                        placeholder="SN123456789" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="purchaseDate">Kjøpsdato</Label>
                      <Input 
                        id="purchaseDate" 
                        type="date" 
                        value={formData.purchaseDate}
                        onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="warranty">Garantiperiode</Label>
                      <Select value={formData.warrantyPeriod} onValueChange={(value) => handleInputChange('warrantyPeriod', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Velg garantiperiode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1year">1 år</SelectItem>
                          <SelectItem value="2years">2 år</SelectItem>
                          <SelectItem value="3years">3 år</SelectItem>
                          <SelectItem value="5years">5 år</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="supplier">Leverandør *</Label>
                      <Select value={formData.supplier} onValueChange={(value) => handleInputChange('supplier', value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Velg leverandør" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.name}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {selectedSupplierProfile && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Leverandør refusjonsregler:</strong><br />
                        Arbeid: {selectedSupplierProfile.refunds_work ? '✅' : '❌'} | 
                        Deler: {selectedSupplierProfile.refunds_parts ? '✅' : '❌'} | 
                        Reisetid: {selectedSupplierProfile.refunds_travel ? '✅' : '❌'} | 
                        Kjøretøy: {selectedSupplierProfile.refunds_vehicle ? '✅' : '❌'}
                        {selectedSupplierProfile.travel_limit_km && (
                          <span> | Reisegrense: {selectedSupplierProfile.travel_limit_km}km</span>
                        )}
                        <br />
                        <small>{selectedSupplierProfile.notes}</small>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jobbreferanse</CardTitle>
                  <CardDescription>Evatic jobbnummer (hvis tilgjengelig) eller MS-nummer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="evaticJobNumber">Evatic jobbnummer</Label>
                      <Input 
                        id="evaticJobNumber" 
                        value={formData.evaticJobNumber}
                        onChange={(e) => handleInputChange('evaticJobNumber', e.target.value)}
                        placeholder="EV-2024-001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="msJobNumber">MS-nummer</Label>
                      <Input 
                        id="msJobNumber" 
                        value={formData.msJobNumber}
                        onChange={(e) => handleInputChange('msJobNumber', e.target.value)}
                        placeholder="MS-2024-001"
                      />
                    </div>
                  </div>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Merknad:</strong> Bruk Evatic jobbnummer hvis tilgjengelig, ellers MS-nummer
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Problem & Solution with Parts Management */}
            <TabsContent value="problem" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Problembesk­rivelse</CardTitle>
                  <CardDescription>Beskriv feilen eller problemet i detalj</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="issueType">Sakstype *</Label>
                      <Select value={formData.issueType} onValueChange={(value) => handleInputChange('issueType', value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Velg sakstype" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="warranty">Garanti</SelectItem>
                          <SelectItem value="claim">Reklamasjon</SelectItem>
                          <SelectItem value="service_callback">Service tilbakekall</SelectItem>
                          <SelectItem value="extended_warranty">Utvidet garanti</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="urgency">Hastighetsgrad</Label>
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
                  <div>
                    <Label htmlFor="issueDescription">Kort beskrivelse *</Label>
                    <Input 
                      id="issueDescription" 
                      value={formData.issueDescription}
                      onChange={(e) => handleInputChange('issueDescription', e.target.value)}
                      placeholder="Kort beskrivelse av problemet"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="detailedDescription">Detaljert beskrivelse</Label>
                    <Textarea 
                      id="detailedDescription" 
                      value={formData.detailedDescription}
                      onChange={(e) => handleInputChange('detailedDescription', e.target.value)}
                      placeholder="Beskriv problemet i detalj..."
                      className="min-h-[120px]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Parts Management Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Reservedeler brukt
                  </CardTitle>
                  <CardDescription>Legg til alle reservedeler som ble brukt i reparasjonen</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {parts.map((part, index) => (
                    <div key={part.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Del {index + 1}</h4>
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="sm"
                          onClick={() => removePart(part.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Slett
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Delnummer</Label>
                          <Input 
                            value={part.partNumber}
                            onChange={(e) => updatePart(part.id, 'partNumber', e.target.value)}
                            placeholder="ABC123-45"
                          />
                        </div>
                        <div>
                          <Label>Pris (kr)</Label>
                          <Input 
                            type="number"
                            value={part.price}
                            onChange={(e) => updatePart(part.id, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="2500.00"
                          />
                        </div>
                        <div className="md:col-span-1">
                          <Label>Beskrivelse</Label>
                          <Input 
                            value={part.description}
                            onChange={(e) => updatePart(part.id, 'description', e.target.value)}
                            placeholder="Vaskearm komplett for modell X200"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addPart}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Legg til ny reservedel
                  </Button>

                  {parts.length > 0 && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total reservedeler:</span>
                        <span className="text-xl font-bold text-primary">
                          {formData.partsCost.toFixed(2)} kr
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* File Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Vedlegg</CardTitle>
                  <CardDescription>Last opp bilder, fakturaer eller andre relevante dokumenter</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Klikk for å laste opp</span> eller dra og slipp
                          </p>
                          <p className="text-xs text-muted-foreground">PNG, JPG, PDF (MAKS. 10MB)</p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={handleFileUpload}
                          multiple
                          accept="image/*,.pdf"
                        />
                      </label>
                    </div>

                    {files.length > 0 && (
                      <div className="space-y-2">
                        <Label>Opplastede filer:</Label>
                        {files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">{file.name}</span>
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              Fjern
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Economics */}
            <TabsContent value="economics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Kostnadsoversikt
                  </CardTitle>
                  <CardDescription>Detaljert kostnadsoversikt med automatisk beregning</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Work Costs */}
                  <div>
                    <h4 className="font-semibold mb-3">Arbeidskostnader</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="workHours">Tekniker timer</Label>
                        <Input 
                          id="workHours" 
                          type="number" 
                          step="0.25"
                          value={formData.workHours}
                          onChange={(e) => handleInputChange('workHours', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hourlyRate">Timesats (kr/time)</Label>
                        <Input 
                          id="hourlyRate" 
                          type="number"
                          value={formData.hourlyRate}
                          onChange={(e) => handleInputChange('hourlyRate', parseFloat(e.target.value) || 0)}
                          placeholder="1250"
                        />
                      </div>
                      <div>
                        <Label>Arbeidskostnad</Label>
                        <Input 
                          value={`${calculateWorkCost().toFixed(2)} kr`}
                          readOnly
                          className="bg-muted font-semibold"
                        />
                      </div>
                      <div>
                        <Label htmlFor="travelHours">Reisetid timer</Label>
                        <Input 
                          id="travelHours" 
                          type="number" 
                          step="0.25"
                          value={formData.travelHours}
                          onChange={(e) => handleInputChange('travelHours', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                      <div>
                        <Label>Reisetid kostnad</Label>
                        <Input 
                          value={`${calculateTravelTimeCost().toFixed(2)} kr`}
                          readOnly
                          className="bg-muted font-semibold"
                        />
                      </div>
                      <div>
                        <Label htmlFor="travelDistanceKm">Kjøretøy (km)</Label>
                        <Input 
                          id="travelDistanceKm" 
                          type="number" 
                          step="0.1"
                          value={formData.travelDistanceKm}
                          onChange={(e) => handleInputChange('travelDistanceKm', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="vehicleCostPerKm">Kr per km</Label>
                        <Input 
                          id="vehicleCostPerKm" 
                          type="number" 
                          step="0.1"
                          value={formData.vehicleCostPerKm}
                          onChange={(e) => handleInputChange('vehicleCostPerKm', parseFloat(e.target.value) || 0)}
                          placeholder="7.5"
                        />
                      </div>
                      <div>
                        <Label>Kjøretøy kostnad</Label>
                        <Input 
                          value={`${calculateVehicleCost().toFixed(2)} kr`}
                          readOnly
                          className="bg-muted font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Material Costs with Individual Parts */}
                  <div>
                    <h4 className="font-semibold mb-3">Materialkostnader</h4>
                    
                    {/* Individual Parts Breakdown */}
                    {parts.length > 0 && (
                      <div className="mb-4">
                        <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                          Reservedeler (fra Problem & Løsning) - Read-only
                        </Label>
                        <div className="border rounded-lg p-4 bg-muted/50 space-y-2">
                          {parts.map((part, index) => (
                            <div key={part.id} className="flex justify-between items-center py-2 px-2 bg-background rounded border">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <span className="text-sm text-muted-foreground">#{index + 1}</span>
                                  <span className="font-medium text-primary">{part.partNumber}</span>
                                  <span className="text-muted-foreground">|</span>
                                  <span className="text-sm">{part.description}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-semibold">{part.price.toFixed(2)} kr</span>
                                {part.refundRequested && (
                                  <div className="text-xs text-green-600">✅ Merket for refusjon</div>
                                )}
                              </div>
                            </div>
                          ))}
                          <div className="border-t pt-3 mt-3 bg-primary/5 rounded p-2">
                            <div className="flex justify-between items-center font-bold">
                              <span>Total reservedeler:</span>
                              <span className="text-primary text-lg">{formData.partsCost.toFixed(2)} kr</span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {parts.length} del{parts.length !== 1 ? 'er' : ''} registrert
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          💡 For å endre deler, gå til "Problem & Løsning" fanen
                        </div>
                      </div>
                    )}

                    {parts.length === 0 && (
                      <div className="mb-4">
                        <Label>Reservedeler (auto-beregnet)</Label>
                        <Input 
                          value={`${formData.partsCost.toFixed(2)} kr`}
                          readOnly
                          className="bg-muted font-semibold"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          💡 Ingen reservedeler lagt til i "Problem & Løsning" fanen
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="consumablesCost">Forbruksmateriell (kr)</Label>
                        <Input 
                          id="consumablesCost" 
                          type="number"
                          value={formData.consumablesCost}
                          onChange={(e) => handleInputChange('consumablesCost', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="externalServicesCost">Eksterne tjenester (kr)</Label>
                        <Input 
                          id="externalServicesCost" 
                          type="number"
                          value={formData.externalServicesCost}
                          onChange={(e) => handleInputChange('externalServicesCost', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Total Cost Display */}
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-lg font-bold">TOTAL KOSTNAD</Label>
                        <Input 
                          value={`${calculateTotalCost().toFixed(2)} kr`}
                          readOnly
                          className="bg-primary/10 font-bold text-lg border-2"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Refund Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Refusjon fra leverandør</CardTitle>
                  <CardDescription>Detaljert refusjonsoversikt og kreditnota informasjon</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Refund Details with Individual Parts Tracking */}
                  <div>
                    <h4 className="font-semibold mb-3">Refunderte kostnader</h4>
                    
                    {/* Individual Parts Refund Tracking */}
                    {parts.length > 0 && (
                      <div className="mb-6">
                        <Label className="text-sm font-medium text-muted-foreground">Reservedeler refusjon (individuell tracking)</Label>
                        <div className="border rounded-lg p-4 bg-muted/50 space-y-3">
                          {parts.map((part) => (
                            <div key={part.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0">
                              <div className="flex items-center space-x-3 flex-1">
                                <Checkbox 
                                  checked={part.refundRequested}
                                  onCheckedChange={(checked) => updatePart(part.id, 'refundRequested', checked)}
                                />
                                <div className="flex-1">
                                  <span className="font-medium">{part.partNumber}:</span>
                                  <span className="ml-2">{part.description}</span>
                                </div>
                                <span className="font-semibold">{part.price.toFixed(2)} kr</span>
                                <span className={`text-sm px-2 py-1 rounded ${
                                  part.refundRequested 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {part.refundRequested ? '✅ Refundert' : '❌ Ikke refundert'}
                                </span>
                              </div>
                            </div>
                          ))}
                          <div className="border-t pt-3 mt-3 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Refunderte deler:</span>
                              <span className="font-bold text-green-600">{calculateRefundedPartsTotal().toFixed(2)} kr</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Ikke refunderte deler:</span>
                              <span className="font-bold text-red-600">{(formData.partsCost - calculateRefundedPartsTotal()).toFixed(2)} kr</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Other Refund Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="workCostRefunded"
                          checked={formData.workCostRefunded}
                          onCheckedChange={(checked) => handleInputChange('workCostRefunded', checked)}
                        />
                        <Label htmlFor="workCostRefunded">Refundert arbeid</Label>
                        <Input 
                          type="number"
                          value={formData.refundedWorkCost}
                          onChange={(e) => handleInputChange('refundedWorkCost', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground">kr</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="travelCostRefunded"
                          checked={formData.travelCostRefunded}
                          onCheckedChange={(checked) => handleInputChange('travelCostRefunded', checked)}
                        />
                        <Label htmlFor="travelCostRefunded">Refundert reisetid</Label>
                        <Input 
                          type="number"
                          value={formData.refundedTravelCost}
                          onChange={(e) => handleInputChange('refundedTravelCost', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground">kr</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="vehicleCostRefunded"
                          checked={formData.vehicleCostRefunded}
                          onCheckedChange={(checked) => handleInputChange('vehicleCostRefunded', checked)}
                        />
                        <Label htmlFor="vehicleCostRefunded">Refundert kjøretøy</Label>
                        <Input 
                          type="number"
                          value={formData.refundedVehicleCost}
                          onChange={(e) => handleInputChange('refundedVehicleCost', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground">kr</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="otherCostRefunded"
                          checked={formData.otherCostRefunded}
                          onCheckedChange={(checked) => handleInputChange('otherCostRefunded', checked)}
                        />
                        <Label htmlFor="otherCostRefunded">Refundert annet</Label>
                        <Input 
                          type="number"
                          value={formData.refundedOtherCost}
                          onChange={(e) => handleInputChange('refundedOtherCost', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground">kr</span>
                      </div>
                    </div>

                    {/* Parts refund summary (read-only, auto-calculated) */}
                    {parts.length > 0 && (
                      <div className="mt-4 p-3 bg-muted/30 rounded border">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            checked={formData.partsCostRefunded}
                            disabled
                          />
                          <Label className="text-muted-foreground">Refunderte deler (auto-beregnet)</Label>
                          <Input 
                            value={formData.refundedPartsCost.toFixed(2)}
                            readOnly
                            className="flex-1 bg-muted font-semibold"
                          />
                          <span className="text-sm text-muted-foreground">kr</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Credit Note Info */}
                  <div>
                    <h4 className="font-semibold mb-3">Kreditnota informasjon</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="creditNoteNumber">Kreditnota nummer</Label>
                        <Input 
                          id="creditNoteNumber" 
                          value={formData.creditNoteNumber}
                          onChange={(e) => handleInputChange('creditNoteNumber', e.target.value)}
                          placeholder="KN-2024-001"
                        />
                      </div>
                      <div>
                        <Label htmlFor="refundDateReceived">Dato mottatt</Label>
                        <Input 
                          id="refundDateReceived" 
                          type="date"
                          value={formData.refundDateReceived}
                          onChange={(e) => handleInputChange('refundDateReceived', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-lg font-bold">TOTAL REFUSJON</Label>
                        <Input 
                          value={`${calculateTotalRefund().toFixed(2)} kr`}
                          readOnly
                          className="bg-green-100 font-bold text-lg border-2 border-green-300"
                        />
                      </div>
                      <div>
                        <Label className="text-lg font-bold">NETTO KOSTNAD</Label>
                        <Input 
                          value={`${calculateNetCost().toFixed(2)} kr`}
                          readOnly
                          className={`font-bold text-lg border-2 ${calculateNetCost() < 0 ? 'bg-red-100 border-red-300' : 'bg-gray-100 border-gray-300'}`}
                        />
                      </div>
                      <div className="flex items-center">
                        {calculateNetCost() < 0 && (
                          <span className="text-red-600 font-semibold text-sm">⚠️ Tap på saken</span>
                        )}
                        {calculateNetCost() === 0 && (
                          <span className="text-green-600 font-semibold text-sm">✅ Break-even</span>
                        )}
                        {calculateNetCost() > 0 && (
                          <span className="text-orange-600 font-semibold text-sm">💰 Kostnad ikke dekket</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: Organization */}
            <TabsContent value="organization" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Organisatorisk informasjon</CardTitle>
                  <CardDescription>Tekniker og avdelingsinformasjon</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="technicianName">Tekniker</Label>
                      <Input 
                        id="technicianName" 
                        value={formData.technicianName}
                        onChange={(e) => handleInputChange('technicianName', e.target.value)}
                        readOnly={profile?.role === 'technician'}
                        className={profile?.role === 'technician' ? "bg-muted" : ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Avdeling</Label>
                      <Select 
                        value={formData.department} 
                        onValueChange={(value) => handleInputChange('department', value)}
                        disabled={profile?.role === 'technician'}
                      >
                        <SelectTrigger className={profile?.role === 'technician' ? "bg-muted" : ""}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="oslo">Oslo</SelectItem>
                          <SelectItem value="bergen">Bergen</SelectItem>
                          <SelectItem value="trondheim">Trondheim</SelectItem>
                          <SelectItem value="stavanger">Stavanger</SelectItem>
                          <SelectItem value="kristiansand">Kristiansand</SelectItem>
                          <SelectItem value="nord_norge">Nord Norge</SelectItem>
                          <SelectItem value="innlandet">Innlandet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notater</CardTitle>
                  <CardDescription>Interne og kundenotater</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="internalNotes">Interne notater</Label>
                    <Textarea 
                      id="internalNotes" 
                      value={formData.internalNotes}
                      onChange={(e) => handleInputChange('internalNotes', e.target.value)}
                      placeholder="Interne notater som ikke er synlige for kunden..."
                      className="min-h-[80px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerNotes">Kundenotater</Label>
                    <Textarea 
                      id="customerNotes" 
                      value={formData.customerNotes}
                      onChange={(e) => handleInputChange('customerNotes', e.target.value)}
                      placeholder="Notater som kan deles med kunden..."
                      className="min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 5: Summary */}
            <TabsContent value="summary" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sammendrag - Reklamasjon</CardTitle>
                  <CardDescription>Fullstendig oversikt før innsending</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Kunde & Produkt</h3>
                      <div className="space-y-1 text-sm">
                        <p><strong>Kunde:</strong> {formData.customerName} ({formData.customerNumber})</p>
                        <p><strong>Produkt:</strong> {formData.productName}</p>
                        <p><strong>Leverandør:</strong> {formData.supplier}</p>
                        <p><strong>Jobbreferanse:</strong> {formData.evaticJobNumber || formData.msJobNumber || 'Ikke angitt'}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Problem</h3>
                      <div className="space-y-1 text-sm">
                        <p><strong>Type:</strong> {formData.issueType}</p>
                        <p><strong>Hastighet:</strong> {formData.urgencyLevel}</p>
                        <p><strong>Beskrivelse:</strong> {formData.issueDescription}</p>
                        <p><strong>Reservedeler:</strong> {parts.length} stk</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-4">Økonomisk oversikt</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">
                          {calculateTotalCost().toFixed(2)} kr
                        </div>
                        <div className="text-sm text-blue-600">Total kostnad</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">
                          {calculateTotalRefund().toFixed(2)} kr
                        </div>
                        <div className="text-sm text-green-600">Total refusjon</div>
                      </div>
                      <div className={`text-center p-4 rounded-lg ${calculateNetCost() < 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                        <div className={`text-2xl font-bold ${calculateNetCost() < 0 ? 'text-red-700' : 'text-gray-700'}`}>
                          {calculateNetCost().toFixed(2)} kr
                        </div>
                        <div className={`text-sm ${calculateNetCost() < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          Netto kostnad
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Organisasjon</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Tekniker:</strong> {formData.technicianName}</p>
                      <p><strong>Avdeling:</strong> {formData.department}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <Button type="submit" className="flex-1" disabled={loading}>
                  <Plus className="mr-2 h-4 w-4" />
                  {loading ? "Oppretter..." : "Opprett reklamasjon"}
                </Button>
                <Link to="/" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Avbryt
                  </Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </main>
    </div>
  );
};

export default ClaimsFormAdvanced;
