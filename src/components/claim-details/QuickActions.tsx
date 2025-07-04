import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Mail } from "lucide-react";

interface QuickActionsProps {
  onSendToSupplier: () => void;
}

export const QuickActions = ({ onSendToSupplier }: QuickActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hurtighandlinger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button className="w-full" variant="outline">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Marker som løst
        </Button>
        <Button 
          className="w-full" 
          variant="outline"
          onClick={onSendToSupplier}
        >
          <Mail className="h-4 w-4 mr-2" />
          Send til leverandør
        </Button>
        <Button className="w-full" variant="outline">
          Kontakt kunde
        </Button>
      </CardContent>
    </Card>
  );
};