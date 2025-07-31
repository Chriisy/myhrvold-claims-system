import { memo, useMemo } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BusinessSectionProps {
  formData: {
    technicianName: string;
    department: string;
    evaticJobNumber: string;
    msJobNumber: string;
  };
  onFieldChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const departments = [
  { value: "oslo", label: "Oslo" },
  { value: "bergen", label: "Bergen" },
  { value: "trondheim", label: "Trondheim" },
  { value: "stavanger", label: "Stavanger" },
  { value: "kristiansand", label: "Kristiansand" },
  { value: "nord_norge", label: "Nord-Norge" },
  { value: "innlandet", label: "Innlandet" },
  { value: "vestfold", label: "Vestfold" },
  { value: "agder", label: "Agder" },
  { value: "ekstern", label: "Ekstern" }
];

export const BusinessSection = memo<BusinessSectionProps>(({ 
  formData, 
  onFieldChange, 
  disabled = false 
}) => {
  // Memoize sorted departments to prevent re-sorting on every render
  const sortedDepartments = useMemo(() => 
    departments.sort((a, b) => a.label.localeCompare(b.label, 'no')), 
    []
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Bedriftsinformasjon</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="technicianName">Tekniker *</Label>
          <Input
            id="technicianName"
            value={formData.technicianName}
            onChange={(e) => onFieldChange('technicianName', e.target.value)}
            disabled={disabled}
            placeholder="Navn på tekniker"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Avdeling *</Label>
          <Select 
            value={formData.department} 
            onValueChange={(value) => onFieldChange('department', value)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Velg avdeling" />
            </SelectTrigger>
            <SelectContent>
              {sortedDepartments.map((dept) => (
                <SelectItem key={dept.value} value={dept.value}>
                  {dept.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="evaticJobNumber">Evatic jobbnummer</Label>
          <Input
            id="evaticJobNumber"
            value={formData.evaticJobNumber}
            onChange={(e) => onFieldChange('evaticJobNumber', e.target.value)}
            disabled={disabled}
            placeholder="Evatic jobbnummer"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="msJobNumber">MS-nummer</Label>
          <Input
            id="msJobNumber"
            value={formData.msJobNumber}
            onChange={(e) => onFieldChange('msJobNumber', e.target.value)}
            disabled={disabled}
            placeholder="MS-nummer"
          />
        </div>
      </div>
    </div>
  );
});

BusinessSection.displayName = 'BusinessSection';