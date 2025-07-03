import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Database, Mail, Shield, Info } from "lucide-react";

const SystemSettings = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Systeminnstillinger</h2>
        <p className="text-muted-foreground">Oversikt over systemkonfigurasjon og status</p>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 border-green-200">Aktiv</Badge>
              <span className="text-sm text-muted-foreground">Supabase PostgreSQL</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Autentisering</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 border-green-200">Aktiv</Badge>
              <span className="text-sm text-muted-foreground">Supabase Auth</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">E-post</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Planlagt</Badge>
              <span className="text-sm text-muted-foreground">Phase B</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Systeminformasjon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Funksjoner</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Reklamasjonsbehandling</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">Aktiv</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Brukeradministrasjon</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">Aktiv</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Leverandøradministrasjon</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">Aktiv</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Automatisk kontokodering</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">Aktiv</Badge>
                </div>
                <div className="flex justify-between">
                  <span>E-post automatisering</span>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Phase B</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Avansert rapportering</span>
                  <Badge className="bg-gray-100 text-gray-800 border-gray-200">Phase C</Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Implementerte faser</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Phase A - Core Business</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">Fullført</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Phase B - Automatisering</span>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pågår</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Phase C - Intelligence</span>
                  <Badge className="bg-gray-100 text-gray-800 border-gray-200">Planlagt</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounting Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Automatisk kontokodering</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Service callback:</span>
                <span className="ml-2 text-muted-foreground">4506 - Intern service reklamasjon + GW</span>
              </div>
              <div>
                <span className="font-medium">Warranty:</span>
                <span className="ml-2 text-muted-foreground">7550 - Ekstern garantikostnad</span>
              </div>
              <div>
                <span className="font-medium">Claim:</span>
                <span className="ml-2 text-muted-foreground">7555 - Intern garantikostnad</span>
              </div>
              <div>
                <span className="font-medium">Extended warranty:</span>
                <span className="ml-2 text-muted-foreground">7566 - Utvidet garanti</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Avdelingskonfigurasjon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Kristiansand', 'Nord-Norge', 'Innlandet'].map(dept => (
              <div key={dept} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>{dept}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;