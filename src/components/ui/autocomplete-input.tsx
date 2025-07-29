import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AutocompleteOption {
  id: string;
  label: string;
  value: string;
  data?: any;
}

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string, selectedOption?: AutocompleteOption) => void;
  onSearch: (query: string) => Promise<AutocompleteOption[]>;
  onCreateNew?: (value: string) => Promise<AutocompleteOption>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowCreateNew?: boolean;
  createNewLabel?: string;
  debounceMs?: number;
  minSearchLength?: number;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  onSearch,
  onCreateNew,
  placeholder = "Start typing to search...",
  disabled = false,
  className,
  allowCreateNew = false,
  createNewLabel = "Create new",
  debounceMs = 300,
  minSearchLength = 1
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Debounced search
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (searchQuery.length >= minSearchLength) {
      timeoutRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const results = await onSearch(searchQuery);
          setOptions(results);
        } catch (error) {
          console.error('Search error:', error);
          setOptions([]);
        } finally {
          setLoading(false);
        }
      }, debounceMs);
    } else {
      setOptions([]);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchQuery, onSearch, debounceMs, minSearchLength]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    onChange(newValue);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const handleOptionSelect = (option: AutocompleteOption) => {
    onChange(option.value, option);
    setSearchQuery(option.value);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleCreateNew = async () => {
    if (!onCreateNew || !searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const newOption = await onCreateNew(searchQuery.trim());
      handleOptionSelect(newOption);
    } catch (error) {
      console.error('Create new error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < options.length - 1 + (allowCreateNew ? 1 : 0) ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : options.length - 1 + (allowCreateNew ? 1 : 0)
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < options.length) {
            handleOptionSelect(options[selectedIndex]);
          } else if (allowCreateNew && onCreateNew) {
            handleCreateNew();
          }
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const showCreateOption = allowCreateNew && 
    searchQuery.trim() && 
    !options.some(opt => opt.value.toLowerCase() === searchQuery.toLowerCase());

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setSearchQuery(value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={cn("pr-8", className)}
        />
        <ChevronDown 
          className={cn(
            "absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </div>

      {isOpen && (searchQuery.length >= minSearchLength || options.length > 0) && (
        <div
          ref={dropdownRef}
          className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95"
        >
          <div className="max-h-60 overflow-auto p-1">
            {loading && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Searching...
              </div>
            )}
            
            {!loading && options.length === 0 && searchQuery.length >= minSearchLength && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No results found
              </div>
            )}

            {!loading && options.map((option, index) => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option)}
                className={cn(
                  "relative flex w-full cursor-pointer items-center rounded-sm px-3 py-2 text-sm outline-none transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  selectedIndex === index && "bg-accent text-accent-foreground"
                )}
              >
                <Check 
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex-1 text-left">
                  <div className="font-medium">{option.label}</div>
                  {option.data?.description && (
                    <div className="text-xs text-muted-foreground">
                      {option.data.description}
                    </div>
                  )}
                </div>
                {option.data?.unit_price && (
                  <div className="text-xs text-muted-foreground ml-2">
                    {option.data.unit_price} kr
                  </div>
                )}
              </button>
            ))}

            {showCreateOption && (
              <button
                onClick={handleCreateNew}
                disabled={loading}
                className={cn(
                  "relative flex w-full cursor-pointer items-center rounded-sm px-3 py-2 text-sm outline-none transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  "border-t border-border",
                  selectedIndex === options.length && "bg-accent text-accent-foreground"
                )}
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>{createNewLabel}: "{searchQuery}"</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};