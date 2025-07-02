import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const ClaimsForm = () => {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles([...files, ...Array.from(event.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <form className="space-y-6">
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
                  <Input id="customerName" placeholder="Rema 1000 Stavanger" required />
                </div>
                <div>
                  <Label htmlFor="contactPerson">Kontaktperson</Label>
                  <Input id="contactPerson" placeholder="Ola Nordmann" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">E-post</Label>
                  <Input id="email" type="email" placeholder="kontakt@rema1000.no" />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" placeholder="+47 123 45 678" />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" placeholder="Storgata 1, 4001 Stavanger" />
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
                  <Input id="productName" placeholder="Kjøleskap Model X200" required />
                </div>
                <div>
                  <Label htmlFor="serialNumber">Serienummer</Label>
                  <Input id="serialNumber" placeholder="SN123456789" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchaseDate">Kjøpsdato</Label>
                  <Input id="purchaseDate" type="date" />
                </div>
                <div>
                  <Label htmlFor="warranty">Garantiperiode</Label>
                  <Select>
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
              </div>
              <div>
                <Label htmlFor="supplier">Leverandør</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg leverandør" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electrolux">Electrolux</SelectItem>
                    <SelectItem value="bosch">Bosch</SelectItem>
                    <SelectItem value="siemens">Siemens</SelectItem>
                    <SelectItem value="miele">Miele</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Issue Description */}
          <Card>
            <CardHeader>
              <CardTitle>Problembesk­rivelse</CardTitle>
              <CardDescription>Beskriv feilen eller problemet i detalj</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="issueType">Type problem *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg problemtype" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mechanical">Mekanisk feil</SelectItem>
                    <SelectItem value="electrical">Elektrisk feil</SelectItem>
                    <SelectItem value="software">Programvarefeil</SelectItem>
                    <SelectItem value="damage">Skade</SelectItem>
                    <SelectItem value="other">Annet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Detaljert beskrivelse *</Label>
                <Textarea 
                  id="description" 
                  placeholder="Beskriv problemet i detalj..."
                  className="min-h-[120px]"
                  required
                />
              </div>
              <div>
                <Label htmlFor="urgency">Hastighetsgrad</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg hastighetsgrad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Lav</SelectItem>
                    <SelectItem value="medium">Middels</SelectItem>
                    <SelectItem value="high">Høy</SelectItem>
                    <SelectItem value="critical">Kritisk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Vedlegg</CardTitle>
              <CardDescription>Last opp bilder, fakturaer eller andre relevante dokumenter</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Klikk for å laste opp</span> eller dra og slipp
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, PDF (MAKS. 10MB)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleFileUpload}
                      multiple
                      accept="image/*,.pdf"
                    />
                  </label>
                </div>

                {/* File List */}
                {files.length > 0 && (
                  <div className="space-y-2">
                    <Label>Opplastede filer:</Label>
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{file.name}</span>
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          Fjern
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Opprett reklamasjon
            </Button>
            <Link to="/" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Avbryt
              </Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ClaimsForm;