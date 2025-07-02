import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Upload, Plus, LogOut, Info, Calculator } from "lucide-react";
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information with Customer Number */}
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

          {/* Product Information */}
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
              
              {/* Supplier Intelligence */}
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

          {/* Issue Description */}
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

          {/* Job Reference System */}
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

          {/* Advanced Cost Breakdown */}
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

              {/* Material Costs */}
              <div>
                <h4 className="font-semibold mb-3">Materialkostnader</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="partsCost">Reservedeler (kr)</Label>
                    <Input 
                      id="partsCost" 
                      type="number"
                      value={formData.partsCost}
                      onChange={(e) => handleInputChange('partsCost', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
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
              {/* Refund Details */}
              <div>
                <h4 className="font-semibold mb-3">Refunderte kostnader</h4>
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
                      id="partsCostRefunded"
                      checked={formData.partsCostRefunded}
                      onCheckedChange={(checked) => handleInputChange('partsCostRefunded', checked)}
                    />
                    <Label htmlFor="partsCostRefunded">Refunderte deler</Label>
                    <Input 
                      type="number"
                      value={formData.refundedPartsCost}
                      onChange={(e) => handleInputChange('refundedPartsCost', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">kr</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
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

          {/* Organizational Information */}
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

          {/* Notes */}
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

                {/* File List */}
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
        </form>
      </main>
    </div>
  );
};

export default ClaimsFormAdvanced;
