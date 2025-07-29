import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRights } from '@/components/gdpr/UserRights';
import { Separator } from '@/components/ui/separator';
import { Shield, Lock, Eye, Database, Mail, Phone } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">Personvernregler</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Vi tar ditt personvern på alvor og følger alle krav i GDPR. 
            Her kan du lese om hvordan vi behandler dine personopplysninger.
          </p>
          <p className="text-sm text-muted-foreground">
            Sist oppdatert: {new Date().toLocaleDateString('nb-NO')}
          </p>
        </div>

        <Separator />

        {/* Quick Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Kort oppsummering
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold">Sikker behandling</h4>
                  <p className="text-sm text-muted-foreground">
                    Alle data krypteres og behandles sikkert
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold">Begrenset lagring</h4>
                  <p className="text-sm text-muted-foreground">
                    Data slettes automatisk etter fastsatte frister
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Behandlingsansvarlig</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                <strong>Selskap:</strong> [Bedriftsnavn]<br />
                <strong>Organisasjonsnummer:</strong> [Org.nr]<br />
                <strong>Adresse:</strong> [Adresse]<br />
                <strong>E-post:</strong> personvern@bedrift.no<br />
                <strong>Telefon:</strong> [Telefonnummer]
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Hvilke personopplysninger behandler vi?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">Brukeropplysninger:</h4>
                  <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                    <li>Navn, e-postadresse, telefonnummer</li>
                    <li>Avdeling og rolle i organisasjonen</li>
                    <li>Innloggingsdata og aktivitet i systemet</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold">Reklamasjonsdata:</h4>
                  <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                    <li>Kundeopplysninger (navn, kontaktinfo, adresse)</li>
                    <li>Produktinformasjon og serienumre</li>
                    <li>Feilbeskrivelser og løsninger</li>
                    <li>Bilder og dokumenter knyttet til reklamasjoner</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Behandlingsgrunnlag</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p><strong>Kontraktsmessige forpliktelser:</strong> For å behandle reklamasjoner og garantisaker</p>
                <p><strong>Berettiget interesse:</strong> For å forbedre tjenesten og kvalitetssikring</p>
                <p><strong>Samtykke:</strong> For cookies og markedsføring (kan trekkes tilbake)</p>
                <p><strong>Lovpålagt:</strong> For regnskapsføring og arkivering</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Lagringstid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p><strong>Reklamasjonsdata:</strong> 7 år (regnskapsloven)</p>
                <p><strong>Brukerdata:</strong> Så lenge kontoen er aktiv + 1 år</p>
                <p><strong>Feillogger:</strong> 1 år</p>
                <p><strong>Varslinger:</strong> 3 måneder</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Sikkerhetstiltak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <ul className="list-disc list-inside space-y-1">
                  <li>Kryptering av data under lagring og overføring</li>
                  <li>Tilgangskontroll med roller og rettigheter</li>
                  <li>Automatisk logging av dataaktivitet</li>
                  <li>Regelmessige sikkerhetskopier</li>
                  <li>Sikkerhetsoppdateringer og overvåking</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card id="data-access">
            <CardHeader>
              <CardTitle>6. Deling av data</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Vi deler ikke personopplysninger med tredjeparter, bortsett fra når det er 
                nødvendig for å levere tjenesten (f.eks. leverandører i garantiprosesser) 
                eller når vi er lovpålagt til det.
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* User Rights Section */}
        <UserRights />

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Kontakt oss
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Hvis du har spørsmål om denne personvernerklæringen eller hvordan vi 
              behandler dine personopplysninger, kan du kontakte oss på:
            </p>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>personvern@bedrift.no</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>+47 [telefonnummer]</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;