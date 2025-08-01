import { useAdvancedClaimForm } from '@/hooks/useAdvancedClaimForm';
import { AdvancedFormWrapper } from '@/components/forms/AdvancedFormWrapper';
import { logger } from '@/utils/logger';
import { supabase } from "@/integrations/supabase/client";

const ClaimsFormAdvanced = () => {
  const {
    formData,
    loading,
    suppliers,
    supplierProfiles,
    selectedSupplierProfile,
    parts,
    customLineItems,
    newEquipmentItems,
    isEditing,
    handleInputChange,
    handleOCRDataExtracted,
    setLoading,
    setParts,
    setCustomLineItems,
    setNewEquipmentItems,
    updateClaimMutation,
    navigate,
    toast,
    user,
    handleAddPart,
    handleRemovePart,
    handleUpdatePart,
    handleAddCustomLineItem,
    handleRemoveCustomLineItem,
    handleUpdateCustomLineItem,
    handleAddNewEquipment,
    handleRemoveNewEquipment,
    handleUpdateNewEquipment
  } = useAdvancedClaimForm();

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.customerName.trim()) errors.push("Kunde navn");
    if (!formData.productName.trim()) errors.push("Produktnavn");
    if (!formData.issueType) errors.push("Sakstype");
    if (!formData.issueDescription.trim()) errors.push("Kort beskrivelse av problemet");
    if (!formData.supplier.trim()) errors.push("Leverandør");
    
    return errors;
  };

  const calculateCosts = () => {
    const workCost = formData.workHours * formData.hourlyRate;
    const overtime50Cost = formData.overtime50Hours * formData.hourlyRate * 1.5;
    const overtime100Cost = formData.overtime100Hours * formData.hourlyRate * 2;
    const travelHoursCost = formData.travelHours * formData.hourlyRate;
    const vehicleCost = formData.travelDistanceKm * formData.vehicleCostPerKm;
    const partsTotal = parts.reduce((sum, part) => sum + part.price, 0);
    const customLineItemsTotal = customLineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const newEquipmentTotal = newEquipmentItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    
    return {
      workCost,
      overtime50Cost,
      overtime100Cost,
      travelHoursCost,
      vehicleCost,
      totalCost: workCost + overtime50Cost + overtime100Cost + travelHoursCost + 
                 vehicleCost + formData.consumablesCost + formData.externalServicesCost + 
                 formData.travelCost + partsTotal + customLineItemsTotal + newEquipmentTotal,
      totalRefunded: formData.refundedWorkCost + formData.refundedTravelCost + 
                    formData.refundedVehicleCost + formData.refundedPartsCost + formData.refundedOtherCost
    };
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

      const costs = calculateCosts();
      
      // Prepare custom line items with parts, custom items, and new equipment combined
      const allLineItems = [
        ...parts.map(part => ({
          id: part.id,
          partNumber: part.partNumber,
          description: part.description,
          quantity: part.quantity,
          unitPrice: part.unitPrice,
          category: 'parts'
        })),
        ...customLineItems.map(item => ({
          ...item,
          category: 'custom'
        })),
        ...newEquipmentItems.map(item => ({
          id: item.id,
          partNumber: item.equipmentNumber,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          category: 'new_equipment'
        }))
      ];

      // Base claim data without claim_number
      const baseClaimData = {
        customer_name: formData.customerName,
        customer_contact: formData.customerContact || null,
        customer_email: formData.customerEmail || null,
        customer_phone: formData.customerPhone || null,
        customer_address: formData.customerAddress || null,
        customer_number: formData.customerNumber || null,
        product_name: formData.productName,
        product_number: formData.productNumber || null,
        product_model: formData.productModel || null,
        serial_number: formData.serialNumber || null,
        purchase_date: formData.purchaseDate || null,
        warranty_period: formData.warrantyPeriod || null,
        supplier: formData.supplier,
        supplier_reference_number: formData.supplierReferenceNumber || null,
        issue_type: formData.issueType as 'warranty' | 'claim' | 'service_callback' | 'extended_warranty',
        issue_description: formData.issueDescription,
        detailed_description: formData.detailedDescription || null,
        urgency_level: formData.urgencyLevel as 'low' | 'normal' | 'high' | 'critical',
        technician_name: formData.technicianName,
        department: formData.department as any,
        evatic_job_number: formData.evaticJobNumber || null,
        ms_job_number: formData.msJobNumber || null,
        work_hours: formData.workHours,
        hourly_rate: formData.hourlyRate,
        overtime_50_hours: formData.overtime50Hours,
        overtime_100_hours: formData.overtime100Hours,
        travel_hours: formData.travelHours,
        travel_distance_km: formData.travelDistanceKm,
        vehicle_cost_per_km: formData.vehicleCostPerKm,
        parts_cost: costs.totalCost,
        consumables_cost: formData.consumablesCost,
        external_services_cost: formData.externalServicesCost,
        travel_cost: formData.travelCost,
        refunded_work_cost: formData.refundedWorkCost,
        refunded_travel_cost: formData.refundedTravelCost,
        refunded_vehicle_cost: formData.refundedVehicleCost,
        refunded_parts_cost: formData.refundedPartsCost,
        refunded_other_cost: formData.refundedOtherCost,
        credit_note_number: formData.creditNoteNumber || null,
        refund_date_received: formData.refundDateReceived || null,
        expected_refund: formData.expectedRefund || 0,
        actual_refund: formData.actualRefund || 0,
        refund_status: formData.refundStatus as any,
        work_cost_refunded: formData.workCostRefunded,
        travel_cost_refunded: formData.travelCostRefunded,
        vehicle_cost_refunded: formData.vehicleCostRefunded,
        parts_cost_refunded: formData.partsCostRefunded,
        other_cost_refunded: formData.otherCostRefunded,
        internal_notes: formData.internalNotes || null,
        customer_notes: formData.customerNotes || null,
        custom_line_items: JSON.stringify(allLineItems),
        created_by: user.id,
      };

      if (isEditing) {
        await updateClaimMutation.mutateAsync({
          claimId: window.location.pathname.split('/')[2],
          claimData: baseClaimData
        });
        
        toast({
          title: "Reklamasjon oppdatert",
          description: "Reklamasjonen har blitt oppdatert.",
        });
      } else {
        // For new claims, add the claim_number field
        const newClaimData = {
          claim_number: '', // Will be auto-generated by database trigger
          ...baseClaimData
        };

        const { data: claimResult, error: claimError } = await supabase
          .from('claims')
          .insert(newClaimData)
          .select()
          .maybeSingle();

        if (claimError) {
          throw new Error(`Feil ved opprettelse av reklamasjon: ${claimError.message}`);
        }
        
        if (!claimResult) {
          throw new Error('Ingen data returnert fra database');
        }

        // Clear auto-save data
        localStorage.removeItem('claimFormAutoSave');

        toast({
          title: "Reklamasjon opprettet",
          description: `Reklamasjon ${claimResult.claim_number} er opprettet.`,
        });

        navigate(`/claims/${claimResult.id}`);
      }
    } catch (error: any) {
      logger.error('Feil ved lagring av reklamasjon', error);
      toast({
        title: "Feil ved lagring",
        description: error.message || "Ukjent feil oppstod",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <AdvancedFormWrapper
      formData={formData}
      isEditing={isEditing}
      loading={loading}
      suppliers={suppliers}
      supplierProfiles={supplierProfiles}
      selectedSupplierProfile={selectedSupplierProfile}
      parts={parts}
      customLineItems={customLineItems}
      newEquipmentItems={newEquipmentItems}
      onInputChange={handleInputChange}
      onSubmit={handleSubmit}
      onOCRDataExtracted={handleOCRDataExtracted}
      onAddPart={handleAddPart}
      onRemovePart={handleRemovePart}
      onUpdatePart={handleUpdatePart}
      onAddCustomLineItem={handleAddCustomLineItem}
      onRemoveCustomLineItem={handleRemoveCustomLineItem}
      onUpdateCustomLineItem={handleUpdateCustomLineItem}
      onAddNewEquipment={handleAddNewEquipment}
      onRemoveNewEquipment={handleRemoveNewEquipment}
      onUpdateNewEquipment={handleUpdateNewEquipment}
    />
  );
};

export default ClaimsFormAdvanced;