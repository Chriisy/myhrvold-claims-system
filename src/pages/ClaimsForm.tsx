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
import { ArrowLeft, Upload, Plus, LogOut, Info, Calculator, Save, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useOptimizedAuth";
import { supabase } from "@/integrations/supabase/client";
import { DragDropZone } from "@/components/ui/drag-drop-zone";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

const ClaimsForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [supplierProfiles, setSupplierProfiles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("customer");
  
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
    solutionText: "",
    urgencyLevel: "normal",
    
    // Business fields
    technicianName: profile?.full_name || "",
    department: profile?.department || "",
    evaticJobNumber: "",
    msJobNumber: "",
    
    // Cost breakdown
    workHours: 0,
    hourlyRate: 1250, // Default Norwegian rate
    travelHours: 0,
    travelDistanceKm: 0,
    vehicleCostPerKm: 7.5, // Norwegian standard
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

  // Keyboard shortcuts for this form
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

  const calculateTotalCost = () => {
    return formData.workHours * formData.hourlyRate + formData.partsCost + formData.travelCost;
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

  const getTabStatus = (tab: string) => {
    switch (tab) {
      case "customer":
        return formData.customerName.trim() ? "complete" : "incomplete";
      case "product":
        return formData.productName.trim() && formData.supplier.trim() ? "complete" : "incomplete";
      case "problem":
        return formData.issueType && formData.issueDescription.trim() ? "complete" : "incomplete";
      case "economics":
        return "optional";
      default:
        return "incomplete";
    }
  };

  const TabIndicator = ({ status }: { status: string }) => {
    if (status === "complete") {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      // Validate required fields
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

      // Create claim record
      const claimData = {
        claim_number: '', // Will be auto-generated by trigger
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
        solution_text: formData.solutionText || null,
        urgency_level: formData.urgencyLevel as 'low' | 'normal' | 'high' | 'critical',
        technician_name: formData.technicianName,
        department: formData.department as 'oslo' | 'bergen' | 'trondheim' | 'stavanger' | 'kristiansand' | 'nord_norge' | 'innlandet',
        evatic_job_number: formData.evaticJobNumber || null,
        ms_job_number: formData.msJobNumber || null,
        work_hours: formData.workHours || 0,
        hourly_rate: formData.hourlyRate || 0,
        parts_cost: formData.partsCost || 0,
        travel_cost: formData.travelCost || 0,
        travel_hours: formData.travelHours || 0,
        travel_distance_km: formData.travelDistanceKm || 0,
        vehicle_cost_per_km: formData.vehicleCostPerKm || 7.5,
        consumables_cost: formData.consumablesCost || 0,
        external_services_cost: formData.externalServicesCost || 0,
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

      // Create timeline entry
      await supabase.from('claim_timeline').insert([{
        claim_id: claimResult.id,
        status: 'new',
        changed_by: user.id,
        notes: 'Reklamasjon opprettet'
      }]);

      toast({
        title: "Reklamasjon opprettet",
        description: `Reklamasjon ${claimResult.claim_number} er opprettet. Du kan fylle ut resten av informasjonen senere.`,
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
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="customer" className="flex items-center gap-2">
                <TabIndicator status={getTabStatus("customer")} />
                Kunde & Produkt
              </TabsTrigger>
              <TabsTrigger value="problem" className="flex items-center gap-2">
                <TabIndicator status={getTabStatus("problem")} />
                Problem & Løsning
              </TabsTrigger>
              <TabsTrigger value="economics" className="flex items-center gap-2">
                <TabIndicator status={getTabStatus("economics")} />
                Økonomi & Organisasjon
              </TabsTrigger>
              <TabsTrigger value="attachments" className="flex items-center gap-2">
                Vedlegg
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-2">
                Sammendrag
              </TabsTrigger>
            </TabsList>

            {/* Customer & Product Tab */}
            <TabsContent value="customer" className="space-y-6">
              {/* Customer Information */}
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
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPerson">Kontaktperson</Label>
                      <Input 
                        id="contactPerson" 
                        value={formData.customerContact}
                        onChange={(e) => handleInputChange('customerContact', e.target.value)}
                        placeholder="Ola Nordmann" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div>
                      <Label htmlFor="phone">Telefon</Label>
                      <Input 
                        id="phone" 
                        value={formData.customerPhone}
                        onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                        placeholder="+47 123 45 678" 
                      />
                    </div>
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
                      <Select value={formData.supplier} onValueChange={(value) => handleInputChange('supplier', value)}>
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Problem & Solution Tab */}
            <TabsContent value="problem" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Problembeskrivelse</CardTitle>
                  <CardDescription>Beskriv feilen eller problemet i detalj</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="issueType">Sakstype *</Label>
                      <Select value={formData.issueType} onValueChange={(value) => handleInputChange('issueType', value)}>
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
                  <div>
                    <Label htmlFor="solutionDescription">Løsning på problemet</Label>
                    <Input 
                      id="solutionDescription" 
                      value={formData.solutionDescription}
                      onChange={(e) => handleInputChange('solutionDescription', e.target.value)}
                      placeholder="Kort beskrivelse av løsningen"
                    />
                  </div>
                  <div>
                    <Label htmlFor="solutionText">Fri tekst - beskrivelse av løsning</Label>
                    <Textarea 
                      id="solutionText" 
                      value={formData.solutionText}
                      onChange={(e) => handleInputChange('solutionText', e.target.value)}
                      placeholder="Detaljert beskrivelse av hvordan problemet ble løst..."
                      className="min-h-[120px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Economics & Organization Tab */}
            <TabsContent value="economics" className="space-y-6">
              {/* Economic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Økonomisk informasjon</CardTitle>
                  <CardDescription>Kostnader og refusjonsforventninger</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="workHours">Arbeidstimer</Label>
                      <Input 
                        id="workHours" 
                        type="number" 
                        step="0.25"
                        value={formData.workHours}
                        onChange={(e) => handleInputChange('workHours', parseFloat(e.target.value) || 0)}
                        placeholder="0"
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
                      <Label htmlFor="workCostResult">Arbeidskostnad (kr)</Label>
                      <Input 
                        id="workCostResult" 
                        type="number"
                        value={(formData.workHours * formData.hourlyRate).toFixed(2)}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="partsCost">Reservedelskostnad (kr)</Label>
                      <Input 
                        id="partsCost" 
                        type="number"
                        value={formData.partsCost}
                        onChange={(e) => handleInputChange('partsCost', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="travelCost">Reiseutgifter (kr)</Label>
                      <Input 
                        id="travelCost" 
                        type="number"
                        value={formData.travelCost}
                        onChange={(e) => handleInputChange('travelCost', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="totalCost">Total kostnad (kr)</Label>
                      <Input 
                        id="totalCost" 
                        type="number"
                        value={calculateTotalCost().toFixed(2)}
                        readOnly
                        className="bg-muted font-bold"
                      />
                    </div>
                  </div>
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
                      <Label>Kontokode (genereres automatisk)</Label>
                      <div className="p-2 bg-muted rounded text-sm">
                        {formData.issueType && formData.productName && formData.customerName
                          ? `${formData.issueType === 'service_callback' ? '4506' : 
                              formData.issueType === 'warranty' ? '7550' : 
                              formData.issueType === 'claim' ? '7555' : '7566'};${formData.productName};${formData.customerName}`
                          : 'Vil genereres ved lagring'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Organization Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Organisasjonsinformasjon</CardTitle>
                  <CardDescription>Ansvarlig tekniker og avdeling</CardDescription>
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
            </TabsContent>

            {/* Attachments Tab */}
            <TabsContent value="attachments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vedlegg</CardTitle>
                  <CardDescription>Last opp bilder, fakturaer eller andre relevante dokumenter</CardDescription>
                </CardHeader>
                <CardContent>
                  <DragDropZone
                    onFilesAdded={(newFiles) => setFiles([...files, ...newFiles])}
                    files={files}
                    onFileRemove={removeFile}
                    accept="image/*,.pdf,.doc,.docx"
                    maxSize={10}
                    maxFiles={20}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Summary Tab */}
            <TabsContent value="summary" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sammendrag - Reklamasjon</CardTitle>
                  <CardDescription>Følgende oppsett for innsending</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Customer & Product Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-blue-600">Kunde & Produkt</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Kunde:</strong> {formData.customerName || '-'}</div>
                        <div><strong>Produkt:</strong> {formData.productName || '-'}</div>
                        <div><strong>Leverandør:</strong> {formData.supplier || '-'}</div>
                        <div><strong>Jobbreferanse:</strong> {formData.evaticJobNumber || '-'}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-blue-600">Problem</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Type:</strong> {formData.issueType || '-'}</div>
                        <div><strong>Hastighet:</strong> {formData.urgencyLevel || '-'}</div>
                        <div><strong>Beskrivelse:</strong> {formData.issueDescription || '-'}</div>
                        <div><strong>Reservedeler:</strong> {formData.partsCost > 0 ? `${formData.partsCost} kr` : '-'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Economic Overview */}
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Økonomisk oversikt</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{calculateTotalCost().toFixed(0)} kr</div>
                        <div className="text-sm text-muted-foreground">Total kostnad</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">0.00 kr</div>
                        <div className="text-sm text-muted-foreground">Total refusjon</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">{calculateTotalCost().toFixed(0)} kr</div>
                        <div className="text-sm text-muted-foreground">Netto kostnad</div>
                      </div>
                    </div>
                  </div>

                  {/* Organization */}
                  <div>
                    <h4 className="font-semibold mb-3">Organisasjon</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Tekniker:</strong> {formData.technicianName || '-'}</div>
                      <div><strong>Avdeling:</strong> {formData.department || '-'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

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
          </Tabs>
        </form>
      </main>
    </div>
  );
};

export default ClaimsForm;