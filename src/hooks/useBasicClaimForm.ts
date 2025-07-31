import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useOptimizedAuth";
import { supabase } from "@/integrations/supabase/client";

export interface BasicFormData {
  // Customer information
  customerName: string;
  customerNumber: string;
  customerContact: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  
  // Product information
  productName: string;
  productModel: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyPeriod: string;
  supplier: string;
  
  // Issue details
  issueType: string;
  issueDescription: string;
  detailedDescription: string;
  solutionDescription: string;
  urgencyLevel: string;
  
  // Business fields
  technicianName: string;
  department: string;
  salesperson: string;
  evaticJobNumber: string;
  msJobNumber: string;
  
  // Cost breakdown
  workHours: number;
  hourlyRate: number;
  workCost: number;
  overtimeCost50: number;
  overtimeCost100: number;
  travelHours: number;
  travelCost: number;
  vehicleKm: number;
  vehicleCostPerKm: number;
  vehicleCost: number;
  partsCost: number;
  totalCost: number;
  
  // Refund breakdown
  refundedWork: boolean;
  refundedParts: boolean;
  refundWorkAmount: number;
  refundPartsAmount: number;
  creditNoteNumber: string;
  refundDate: string;
  totalRefund: number;
  netCost: number;
  
  // Notes
  internalNotes: string;
  customerNotes: string;
}

interface UsedPart {
  partNumber: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export const useBasicClaimForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [usedParts, setUsedParts] = useState<UsedPart[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  
  const [formData, setFormData] = useState<BasicFormData>({
    customerName: "",
    customerNumber: "",
    customerContact: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    productName: "",
    productModel: "",
    serialNumber: "",
    purchaseDate: "",
    warrantyPeriod: "",
    supplier: "",
    issueType: "",
    issueDescription: "",
    detailedDescription: "",
    solutionDescription: "",
    urgencyLevel: "normal",
    technicianName: profile?.full_name || "",
    department: profile?.department || "",
    salesperson: "",
    evaticJobNumber: "",
    msJobNumber: "",
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
    refundedWork: false,
    refundedParts: false,
    refundWorkAmount: 0,
    refundPartsAmount: 0,
    creditNoteNumber: "",
    refundDate: "",
    totalRefund: 0,
    netCost: 0,
    internalNotes: "",
    customerNotes: "",
  });

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
  }, [
    formData.workHours, 
    formData.hourlyRate, 
    formData.overtimeCost50, 
    formData.overtimeCost100, 
    formData.travelCost, 
    formData.vehicleKm, 
    formData.vehicleCostPerKm, 
    formData.refundWorkAmount, 
    formData.refundPartsAmount, 
    usedParts
  ]);

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

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const fillClaimForm = useCallback((scannedData: any) => {
    setFormData(prev => ({
      ...prev,
      customerName: scannedData.customerName || prev.customerName,
      customerNumber: scannedData.customerNumber || prev.customerNumber,
      customerContact: scannedData.contactPerson || prev.customerContact,
      customerEmail: scannedData.email || prev.customerEmail,
      customerPhone: scannedData.phone || prev.customerPhone,
      customerAddress: scannedData.address || prev.customerAddress,
      productName: scannedData.productName || prev.productName,
      productModel: scannedData.productModel || prev.productModel,
      serialNumber: scannedData.serialNumber || prev.serialNumber,
      issueDescription: scannedData.shortDescription || prev.issueDescription,
      detailedDescription: scannedData.detailedDescription || prev.detailedDescription,
      technicianName: scannedData.technician || prev.technicianName,
      workCost: scannedData.workCost || prev.workCost,
      travelCost: scannedData.travelTimeCost || prev.travelCost,
      partsCost: scannedData.partsCost || prev.partsCost,
      totalCost: scannedData.totalAmount || prev.totalCost,
      evaticJobNumber: scannedData.evaticJobNumber || prev.evaticJobNumber,
      workHours: scannedData.technicianHours || prev.workHours,
      hourlyRate: scannedData.hourlyRate || prev.hourlyRate
    }));
    
    toast({
      title: "Faktura skannet!",
      description: "Data fra fakturaen er fylt inn i skjemaet. Kontroller og juster etter behov.",
    });
  }, [toast]);

  const addUsedPart = useCallback(() => {
    setUsedParts(prev => [...prev, {
      partNumber: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    }]);
  }, []);

  const removeUsedPart = useCallback((index: number) => {
    setUsedParts(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateUsedPart = useCallback((index: number, field: keyof UsedPart, value: string | number) => {
    setUsedParts(prev => {
      const newParts = [...prev];
      newParts[index] = { ...newParts[index], [field]: value };
      
      if (field === 'quantity' || field === 'unitPrice') {
        newParts[index].totalPrice = newParts[index].quantity * newParts[index].unitPrice;
      }
      
      return newParts;
    });
  }, []);

  const validateForm = useCallback(() => {
    const errors: string[] = [];
    
    if (!formData.customerName.trim()) errors.push("Kunde navn");
    if (!formData.productName.trim()) errors.push("Produktnavn");
    if (!formData.issueType) errors.push("Sakstype");
    if (!formData.issueDescription.trim()) errors.push("Kort beskrivelse av problemet");
    if (!formData.supplier.trim()) errors.push("Leverandør");
    
    return errors;
  }, [formData]);

  return {
    formData,
    loading,
    suppliers,
    usedParts,
    files,
    handleInputChange,
    fillClaimForm,
    addUsedPart,
    removeUsedPart,
    updateUsedPart,
    validateForm,
    setLoading,
    setFiles,
    navigate,
    toast,
    user
  };
};