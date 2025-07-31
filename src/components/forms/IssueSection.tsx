import { memo } from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface IssueSectionProps {
  formData: {
    issueType: string;
    issueDescription: string;
    detailedDescription: string;
    urgencyLevel: string;
  };
  onFieldChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const issueTypes = [
  { value: "warranty", label: "Garanti" },
  { value: "claim", label: "Reklamasjon" },
  { value: "service_callback", label: "Service tilbakekall" },
  { value: "extended_warranty", label: "Utvidet garanti" }
];

const urgencyLevels = [
  { value: "low", label: "Lav" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "Høy" },
  { value: "critical", label: "Kritisk" }
];

export const IssueSection = memo<IssueSectionProps>(({ 
  formData, 
  onFieldChange, 
  disabled = false 
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Problembeskrivelse</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="issueType">Type problem *</Label>
          <Select 
            value={formData.issueType} 
            onValueChange={(value) => onFieldChange('issueType', value)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Velg type problem" />
            </SelectTrigger>
            <SelectContent>
              {issueTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="urgencyLevel">Prioritet</Label>
          <Select 
            value={formData.urgencyLevel} 
            onValueChange={(value) => onFieldChange('urgencyLevel', value)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Velg prioritet" />
            </SelectTrigger>
            <SelectContent>
              {urgencyLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="issueDescription">Problembeskrivelse *</Label>
          <Textarea
            id="issueDescription"
            value={formData.issueDescription}
            onChange={(e) => onFieldChange('issueDescription', e.target.value)}
            disabled={disabled}
            placeholder="Beskriv problemet kort og presist..."
            rows={3}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="detailedDescription">Detaljert beskrivelse</Label>
          <Textarea
            id="detailedDescription"
            value={formData.detailedDescription}
            onChange={(e) => onFieldChange('detailedDescription', e.target.value)}
            disabled={disabled}
            placeholder="Utfyllende beskrivelse, feilsøking utført, osv..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
});

IssueSection.displayName = 'IssueSection';