import { memo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, LogOut, Camera } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useOptimizedAuth";
import { useToast } from "@/hooks/use-toast";
import InvoiceScanner from "@/components/InvoiceScanner";
import { CustomerSection } from "./CustomerSection";
import { ProductSection } from "./ProductSection";
import { IssueSection } from "./IssueSection";
import { BusinessSection } from "./BusinessSection";
import { CostSection } from "./CostSection";

interface AdvancedFormWrapperProps {
  formData: any;
  isEditing: boolean;
  loading: boolean;
  suppliers: any[];
  supplierProfiles: any[];
  selectedSupplierProfile: any;
  parts: any[];
  customLineItems: any[];
  newEquipmentItems: any[];
  onInputChange: (field: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onOCRDataExtracted: (data: any) => void;
  onAddPart: () => void;
  onRemovePart: (index: number) => void;
  onUpdatePart: (index: number, field: string, value: any) => void;
  onAddCustomLineItem: () => void;
  onRemoveCustomLineItem: (index: number) => void;
  onUpdateCustomLineItem: (index: number, field: string, value: any) => void;
  onAddNewEquipment: () => void;
  onRemoveNewEquipment: (index: number) => void;
  onUpdateNewEquipment: (index: number, field: string, value: any) => void;
}

export const AdvancedFormWrapper = memo<AdvancedFormWrapperProps>(({
  formData,
  isEditing,
  loading,
  suppliers,
  supplierProfiles,
  selectedSupplierProfile,
  parts,
  customLineItems,
  newEquipmentItems,
  onInputChange,
  onSubmit,
  onOCRDataExtracted,
  onAddPart,
  onRemovePart,
  onUpdatePart,
  onAddCustomLineItem,
  onRemoveCustomLineItem,
  onUpdateCustomLineItem,
  onAddNewEquipment,
  onRemoveNewEquipment,
  onUpdateNewEquipment
}) => {
  const { profile, signOut } = useAuth();
  const [currentTab, setCurrentTab] = useState("customer");
  const [ocrDialogOpen, setOcrDialogOpen] = useState(false);

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
                <h1 className="text-2xl font-bold text-primary">
                  {isEditing ? "Rediger reklamasjon" : "Ny avansert reklamasjon"}
                </h1>
                <p className="text-muted-foreground">
                  {isEditing ? "Oppdater reklamasjon med detaljert kostnadsanalyse" : "Detaljert skjema med kostnadsanalyse"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setOcrDialogOpen(true)}
                size="sm"
              >
                <Camera className="h-4 w-4 mr-2" />
                Skann faktura
              </Button>
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
        <form onSubmit={onSubmit} className="space-y-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="customer">Kunde</TabsTrigger>
              <TabsTrigger value="product">Produkt</TabsTrigger>
              <TabsTrigger value="issue">Problem</TabsTrigger>
              <TabsTrigger value="business">Forretning</TabsTrigger>
              <TabsTrigger value="costs">Kostnader</TabsTrigger>
            </TabsList>

            <TabsContent value="customer">
              <Card>
                <CardHeader>
                  <CardTitle>Kundeinformasjon</CardTitle>
                  <CardDescription>Detaljer om kunden som reklamerer</CardDescription>
                </CardHeader>
                <CardContent>
                  <CustomerSection
                    formData={formData}
                    onFieldChange={onInputChange}
                    disabled={loading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="product">
              <Card>
                <CardHeader>
                  <CardTitle>Produktinformasjon</CardTitle>
                  <CardDescription>Detaljer om produktet som reklameres</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductSection
                    formData={formData}
                    suppliers={suppliers}
                    onFieldChange={onInputChange}
                    disabled={loading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="issue">
              <Card>
                <CardHeader>
                  <CardTitle>Problembeskrivelse</CardTitle>
                  <CardDescription>Beskriv problemet og løsningen</CardDescription>
                </CardHeader>
                <CardContent>
                  <IssueSection
                    formData={formData}
                    onFieldChange={onInputChange}
                    disabled={loading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="business">
              <Card>
                <CardHeader>
                  <CardTitle>Forretningsinformasjon</CardTitle>
                  <CardDescription>Jobnumre og forretningsdetaljer</CardDescription>
                </CardHeader>
                <CardContent>
                  <BusinessSection
                    formData={formData}
                    onFieldChange={onInputChange}
                    disabled={loading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="costs">
              <CostSection
                formData={formData}
                parts={parts}
                customLineItems={customLineItems}
                newEquipmentItems={newEquipmentItems}
                onFieldChange={onInputChange}
                onAddPart={onAddPart}
                onRemovePart={onRemovePart}
                onUpdatePart={onUpdatePart}
                onAddCustomLineItem={onAddCustomLineItem}
                onRemoveCustomLineItem={onRemoveCustomLineItem}
                onUpdateCustomLineItem={onUpdateCustomLineItem}
                onAddNewEquipment={onAddNewEquipment}
                onRemoveNewEquipment={onRemoveNewEquipment}
                onUpdateNewEquipment={onUpdateNewEquipment}
                disabled={loading}
              />
            </TabsContent>
          </Tabs>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Avbryt
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Lagrer..." : isEditing ? "Oppdater reklamasjon" : "Opprett reklamasjon"}
            </Button>
          </div>
        </form>
      </main>

      {/* OCR Scanner Dialog */}
      <InvoiceScanner
        open={ocrDialogOpen}
        onOpenChange={setOcrDialogOpen}
        onDataExtracted={onOCRDataExtracted}
      />
    </div>
  );
});

AdvancedFormWrapper.displayName = 'AdvancedFormWrapper';