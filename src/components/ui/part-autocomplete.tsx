import React from 'react';
import { AutocompleteInput, AutocompleteOption } from './autocomplete-input';
import { partsService, Part } from '@/services/autocompleteService';
import { useToast } from '@/hooks/use-toast';

interface PartAutocompleteProps {
  value: string;
  onChange: (value: string, part?: Part) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowCreateNew?: boolean;
  onPartSelect?: (part: Part) => void;
}

export const PartAutocomplete: React.FC<PartAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Search part number or description...",
  disabled = false,
  className,
  allowCreateNew = true,
  onPartSelect
}) => {
  const { toast } = useToast();

  const handleSearch = async (query: string): Promise<AutocompleteOption[]> => {
    try {
      const parts = await partsService.searchParts(query);
      return parts.map(part => ({
        id: part.id,
        label: part.part_number,
        value: part.part_number,
        data: part
      }));
    } catch (error) {
      console.error('Part search error:', error);
      return [];
    }
  };

  const handleCreateNew = async (partNumber: string): Promise<AutocompleteOption> => {
    try {
      // Check if part already exists
      const existing = await partsService.getPartByNumber(partNumber);
      if (existing) {
        toast({
          title: "Part already exists",
          description: `Part ${partNumber} is already in the database`,
          variant: "destructive"
        });
        throw new Error("Part already exists");
      }

      // Create basic part entry
      const newPart = await partsService.createPart({
        part_number: partNumber,
        description: `New part: ${partNumber}`,
        unit_price: 0,
        supplier_name: '',
        category: ''
      });

      toast({
        title: "New part created",
        description: `Part ${partNumber} has been added to the database`,
      });

      return {
        id: newPart.id,
        label: newPart.part_number,
        value: newPart.part_number,
        data: newPart
      };
    } catch (error) {
      console.error('Create part error:', error);
      throw error;
    }
  };

  const handleChange = (newValue: string, option?: AutocompleteOption) => {
    onChange(newValue, option?.data as Part);
    
    if (option?.data && onPartSelect) {
      onPartSelect(option.data as Part);
    }
  };

  return (
    <AutocompleteInput
      value={value}
      onChange={handleChange}
      onSearch={handleSearch}
      onCreateNew={allowCreateNew ? handleCreateNew : undefined}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      allowCreateNew={allowCreateNew}
      createNewLabel="Create new part"
      minSearchLength={2}
    />
  );
};