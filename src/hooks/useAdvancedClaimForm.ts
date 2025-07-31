import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useOptimizedAuth";
import { supabase } from "@/integrations/supabase/client";
import { useUpdateClaim } from '@/hooks/useClaimMutations';
import { Currency } from '@/services/currencyService';

export interface AdvancedFormData {
  // Customer information
  customerName: string;
  customerNumber: string;
  customerContact: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  
  // Product information
  productName: string;
  productNumber: string;
  productModel: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyPeriod: string;
  supplier: string;
  supplierReferenceNumber: string;
  
  // Issue details
  issueType: string;
  issueDescription: string;
  detailedDescription: string;
  urgencyLevel: string;
  
  // Business fields
  technicianName: string;
  department: string;
  salesperson: string;
  salespersonDepartment: string;
  evaticJobNumber: string;
  msJobNumber: string;
  
  // Advanced cost breakdown
  workHours: number;
  hourlyRate: number;
  overtime50Hours: number;
  overtime100Hours: number;
  travelHours: number;
  travelDistanceKm: number;
  vehicleCostPerKm: number;
  partsCost: number;
  consumablesCost: number;
  externalServicesCost: number;
  travelCost: number;
  inputCurrency: Currency;
  
  // Refund breakdown
  refundedWorkCost: number;
  refundedTravelCost: number;
  refundedVehicleCost: number;
  refundedPartsCost: number;
  refundedOtherCost: number;
  creditNoteNumber: string;
  refundDateReceived: string;
  
  // Refund status checkboxes
  workCostRefunded: boolean;
  travelCostRefunded: boolean;
  vehicleCostRefunded: boolean;
  partsCostRefunded: boolean;
  otherCostRefunded: boolean;
  
  // Notes
  internalNotes: string;
  customerNotes: string;
}

export const useAdvancedClaimForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const { id: claimId } = useParams();
  const isEditing = !!claimId;
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [supplierProfiles, setSupplierProfiles] = useState<any[]>([]);
  const [selectedSupplierProfile, setSelectedSupplierProfile] = useState<any>(null);
  const updateClaimMutation = useUpdateClaim();
  
  const [formData, setFormData] = useState<AdvancedFormData>({
    customerName: "",
    customerNumber: "",
    customerContact: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    productName: "",
    productNumber: "",
    productModel: "",
    serialNumber: "",
    purchaseDate: "",
    warrantyPeriod: "",
    supplier: "",
    supplierReferenceNumber: "",
    issueType: "",
    issueDescription: "",
    detailedDescription: "",
    urgencyLevel: "normal",
    technicianName: profile?.full_name || "",
    department: profile?.department || "",
    salesperson: "",
    salespersonDepartment: "",
    evaticJobNumber: "",
    msJobNumber: "",
    workHours: 0,
    hourlyRate: 1250,
    overtime50Hours: 0,
    overtime100Hours: 0,
    travelHours: 0,
    travelDistanceKm: 0,
    vehicleCostPerKm: 7.5,
    partsCost: 0,
    consumablesCost: 0,
    externalServicesCost: 0,
    travelCost: 0,
    inputCurrency: 'NOK' as Currency,
    refundedWorkCost: 0,
    refundedTravelCost: 0,
    refundedVehicleCost: 0,
    refundedPartsCost: 0,
    refundedOtherCost: 0,
    creditNoteNumber: "",
    refundDateReceived: "",
    workCostRefunded: false,
    travelCostRefunded: false,
    vehicleCostRefunded: false,
    partsCostRefunded: false,
    otherCostRefunded: false,
    internalNotes: "",
    customerNotes: "",
  });

  const [parts, setParts] = useState<Array<{
    id: string;
    partNumber: string;
    description: string;
    price: number;
    refundRequested: boolean;
    refundApproved: boolean;
  }>>([]);

  const [customLineItems, setCustomLineItems] = useState<Array<{
    id: string;
    partNumber: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }>>([]);

  // Initialize form data
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
    
    // Auto-save and load logic for new claims
    if (!isEditing) {
      const savedData = localStorage.getItem('claimFormAutoSave');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setFormData(prev => ({ 
            ...prev, 
            ...parsedData,
            salesperson: parsedData.salesperson || "",
            salespersonDepartment: parsedData.salespersonDepartment || "",
          }));
          toast({
            title: "Lagret data gjenopprettet",
            description: "Tidligere lagret skjemadata er lastet inn",
          });
        } catch (error) {
          console.error('Error parsing saved form data:', error);
        }
      }
    }
  }, [profile, isEditing, toast]);

  // Auto-save functionality
  useEffect(() => {
    if (!isEditing && formData.customerName) {
      const autoSaveInterval = setInterval(() => {
        localStorage.setItem('claimFormAutoSave', JSON.stringify(formData));
      }, 30 * 1000);

      return () => clearInterval(autoSaveInterval);
    }
  }, [formData, isEditing]);

  // Load existing claim for editing
  useEffect(() => {
    if (isEditing && claimId) {
      loadClaim();
    }
  }, [isEditing, claimId]);

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

  const loadClaim = async () => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('id', claimId)
        .maybeSingle();
      
      if (error) {
        throw new Error(`Feil ved henting av reklamasjon: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('Reklamasjon ikke funnet');
      }
      
      // Map database fields to form data
      setFormData({
        customerName: data.customer_name || "",
        customerNumber: data.customer_number || "",
        customerContact: data.customer_contact || "",
        customerEmail: data.customer_email || "",
        customerPhone: data.customer_phone || "",
        customerAddress: data.customer_address || "",
        productName: data.product_name || "",
        productNumber: data.product_number || "",
        productModel: data.product_model || "",
        serialNumber: data.serial_number || "",
        purchaseDate: data.purchase_date || "",
        warrantyPeriod: data.warranty_period || "",
        supplier: data.supplier || "",
        supplierReferenceNumber: data.supplier_reference_number || "",
        issueType: data.issue_type || "",
        issueDescription: data.issue_description || "",
        detailedDescription: data.detailed_description || "",
        urgencyLevel: data.urgency_level || "normal",
        technicianName: data.technician_name || "",
        department: data.department || "",
        salesperson: "",
        salespersonDepartment: "",
        evaticJobNumber: data.evatic_job_number || "",
        msJobNumber: data.ms_job_number || "",
        workHours: data.work_hours || 0,
        hourlyRate: data.hourly_rate || 0,
        overtime50Hours: data.overtime_50_hours || 0,
        overtime100Hours: data.overtime_100_hours || 0,
        travelHours: data.travel_hours || 0,
        travelDistanceKm: data.travel_distance_km || 0,
        vehicleCostPerKm: data.vehicle_cost_per_km || 7.5,
        partsCost: data.parts_cost || 0,
        consumablesCost: data.consumables_cost || 0,
        externalServicesCost: data.external_services_cost || 0,
        travelCost: data.travel_cost || 0,
        refundedWorkCost: data.refunded_work_cost || 0,
        refundedTravelCost: data.refunded_travel_cost || 0,
        refundedVehicleCost: data.refunded_vehicle_cost || 0,
        refundedPartsCost: data.refunded_parts_cost || 0,
        refundedOtherCost: data.refunded_other_cost || 0,
        creditNoteNumber: data.credit_note_number || "",
        refundDateReceived: data.refund_date_received || "",
        workCostRefunded: data.work_cost_refunded || false,
        travelCostRefunded: data.travel_cost_refunded || false,
        vehicleCostRefunded: data.vehicle_cost_refunded || false,
        partsCostRefunded: data.parts_cost_refunded || false,
        otherCostRefunded: data.other_cost_refunded || false,
        internalNotes: data.internal_notes || "",
        customerNotes: data.customer_notes || "",
        inputCurrency: 'NOK' as Currency
      });

      // Load custom line items
      const customLineItems = data.custom_line_items;
      if (customLineItems) {
        try {
          let parsedItems = [];
          if (Array.isArray(customLineItems)) {
            parsedItems = customLineItems;
          } else if (typeof customLineItems === 'string') {
            parsedItems = JSON.parse(customLineItems);
          }
          
          const partsItems = parsedItems.filter(item => item.category === 'parts');
          const customItems = parsedItems.filter(item => item.category !== 'parts');
          
          const itemsWithPartNumber = customItems.map(item => ({
            id: item.id || Date.now().toString(),
            partNumber: item.partNumber || "",
            description: item.description || "",
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0
          }));
          setCustomLineItems(itemsWithPartNumber);
          
          const partsFromItems = partsItems.map(item => ({
            id: item.id || Date.now().toString(),
            partNumber: item.partNumber || "",
            description: item.description || "",
            price: item.unitPrice || 0,
            refundRequested: false,
            refundApproved: false
          }));
          setParts(partsFromItems);
        } catch (error) {
          console.error('Error parsing custom line items:', error);
          setCustomLineItems([]);
          setParts([]);
        }
      } else {
        setCustomLineItems([]);
        setParts([]);
      }
    } catch (error) {
      console.error('Error loading claim:', error);
      toast({
        title: "Feil ved lasting",
        description: "Kunne ikke laste reklamasjon",
        variant: "destructive",
      });
      navigate('/claims');
    }
  };

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Update supplier profile when supplier changes
    if (field === 'supplier') {
      const profile = supplierProfiles.find(p => p.supplier_name === value);
      setSelectedSupplierProfile(profile);
      
      if (parts.length > 0) {
        autoSuggestRefunds(value);
      }
    }
  }, [supplierProfiles, parts]);

  const autoSuggestRefunds = (supplierName: string) => {
    const lowerSupplier = supplierName.toLowerCase();
    
    setParts(prevParts => prevParts.map(part => {
      let shouldRefund = false;
      
      if (lowerSupplier.includes('rational')) {
        shouldRefund = true;
      } else if (lowerSupplier.includes('hobart')) {
        shouldRefund = true;
      } else if (lowerSupplier.includes('comenda')) {
        shouldRefund = true;
      }
      
      return {
        ...part,
        refundRequested: shouldRefund
      };
    }));
  };

  const handleOCRDataExtracted = useCallback((ocrData: any) => {
    const updates: any = {};
    
    if (ocrData.customerName) updates.customerName = ocrData.customerName;
    if (ocrData.customerNumber) updates.customerNumber = ocrData.customerNumber;
    if (ocrData.productName) updates.productName = ocrData.productName;
    if (ocrData.productModel) updates.productModel = ocrData.productModel;
    if (ocrData.serialNumber) updates.serialNumber = ocrData.serialNumber;
    if (ocrData.evaticJobNumber) updates.evaticJobNumber = ocrData.evaticJobNumber;
    if (ocrData.invoiceNumber) updates.msJobNumber = ocrData.invoiceNumber;
    if (ocrData.technician) updates.technician = ocrData.technician;
    
    if (ocrData.technicianHours > 0) {
      updates.workHours = ocrData.technicianHours;
    }
    if (ocrData.hourlyRate > 0) {
      updates.hourlyRate = ocrData.hourlyRate;
    }
    
    const workCost = ocrData.workCost || ocrData.laborCost || 0;
    const partsCost = ocrData.partsCost || 0;
    const travelTimeCost = ocrData.travelTimeCost || 0;
    
    if (workCost > 0) updates.workCost = workCost;
    if (partsCost > 0) updates.partsCost = partsCost;
    if (ocrData.travelTimeHours > 0) updates.travelHours = ocrData.travelTimeHours;
    if (travelTimeCost > 0) updates.travelCost = travelTimeCost;
    if (ocrData.vehicleKm > 0) updates.travelDistanceKm = ocrData.vehicleKm;
    if (ocrData.vehicleCost > 0) updates.vehicleCost = ocrData.vehicleCost;

    if (ocrData.invoiceDate) {
      try {
        let dateStr = ocrData.invoiceDate;
        if (dateStr.includes('.')) {
          const [day, month, year] = dateStr.split('.');
          dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          updates.purchaseDate = date.toISOString().split('T')[0];
        }
      } catch (e) {
        console.warn('Could not parse invoice date:', ocrData.invoiceDate);
      }
    }
    
    setFormData(prev => ({ ...prev, ...updates }));

    toast({
      title: "OCR Data importert",
      description: `${Object.keys(updates).length} felter ble automatisk fyllt ut fra fakturaen`,
    });
  }, [toast]);

  return {
    formData,
    loading,
    suppliers,
    supplierProfiles,
    selectedSupplierProfile,
    parts,
    customLineItems,
    isEditing,
    handleInputChange,
    handleOCRDataExtracted,
    setLoading,
    setParts,
    setCustomLineItems,
    updateClaimMutation,
    navigate,
    toast,
    user
  };
};