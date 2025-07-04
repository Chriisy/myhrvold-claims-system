import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ClaimCustomer } from "@/types/claim";

interface CustomerInfoProps {
  customer: ClaimCustomer;
}

export const CustomerInfo = ({ customer }: CustomerInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kundeinformasjon</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="font-medium">{customer.name}</p>
          <p className="text-sm text-muted-foreground">Kontaktperson: {customer.contactPerson}</p>
        </div>
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium">E-post:</p>
            <p className="text-muted-foreground">{customer.email}</p>
          </div>
          <div>
            <p className="font-medium">Telefon:</p>
            <p className="text-muted-foreground">{customer.phone}</p>
          </div>
        </div>
        <div className="text-sm">
          <p className="font-medium">Adresse:</p>
          <p className="text-muted-foreground">{customer.address}</p>
        </div>
      </CardContent>
    </Card>
  );
};