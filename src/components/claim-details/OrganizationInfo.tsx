import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, FileText, Calendar } from "lucide-react";

interface OrganizationData {
  department: string;
  technicianName: string;
  msJobNumber?: string;
  evaticJobNumber?: string;
  accountCode?: string;
  accountString?: string;
  creditNoteNumber?: string;
  assignedAdmin?: string;
  approvedBy?: string;
  approvedDate?: string;
  createdDate: string;
  updatedDate: string;
}

interface OrganizationInfoProps {
  data: OrganizationData;
}

export const OrganizationInfo = ({ data }: OrganizationInfoProps) => {
  const getDepartmentName = (dept: string) => {
    const names: Record<string, string> = {
      oslo: "Oslo",
      bergen: "Bergen", 
      trondheim: "Trondheim",
      stavanger: "Stavanger",
      kristiansand: "Kristiansand",
      nord_norge: "Nord Norge",
      innlandet: "Innlandet"
    };
    return names[dept] || dept;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Ikke satt";
    return new Date(dateString).toLocaleDateString('no-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Organisasjonsinformasjon
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ansvarlige personer */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Ansvarlige
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Avdeling</label>
              <div className="mt-1">
                <Badge variant="outline" className="text-sm">
                  {getDepartmentName(data.department)}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tekniker</label>
              <p className="mt-1 text-sm">{data.technicianName}</p>
            </div>
            {data.assignedAdmin && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tildelt administrator</label>
                <p className="mt-1 text-sm">{data.assignedAdmin}</p>
              </div>
            )}
            {data.approvedBy && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Godkjent av</label>
                <p className="mt-1 text-sm">{data.approvedBy}</p>
              </div>
            )}
          </div>
        </div>

        {/* Jobbumre og referanser */}
        <div>
          <h4 className="font-medium mb-3">Jobbummer og referanser</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.msJobNumber && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">MS Jobbnummer</label>
                <p className="mt-1 text-sm font-mono">{data.msJobNumber}</p>
              </div>
            )}
            {data.evaticJobNumber && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Evatic Jobbnummer</label>
                <p className="mt-1 text-sm font-mono">{data.evaticJobNumber}</p>
              </div>
            )}
            {data.creditNoteNumber && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Kreditnotanummer</label>
                <p className="mt-1 text-sm font-mono">{data.creditNoteNumber}</p>
              </div>
            )}
          </div>
        </div>

        {/* Regnskapsinformasjon */}
        {(data.accountCode || data.accountString) && (
          <div>
            <h4 className="font-medium mb-3">Regnskapsinformasjon</h4>
            <div className="space-y-3">
              {data.accountCode && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Kontokode</label>
                  <p className="mt-1 text-sm font-mono">{data.accountCode}</p>
                </div>
              )}
              {data.accountString && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Kontostreng</label>
                  <p className="mt-1 text-sm font-mono break-all">{data.accountString}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Datoer */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Viktige datoer
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Opprettet</label>
              <p className="mt-1 text-sm">{formatDate(data.createdDate)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Sist oppdatert</label>
              <p className="mt-1 text-sm">{formatDate(data.updatedDate)}</p>
            </div>
            {data.approvedDate && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Godkjent dato</label>
                <p className="mt-1 text-sm">{formatDate(data.approvedDate)}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};