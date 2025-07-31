import React from 'react';
import { AutocompleteInput, AutocompleteOption } from './autocomplete-input';
import { customersService, Customer } from '@/services/autocompleteService';
import { useToast } from '@/hooks/use-toast';

interface CustomerAutocompleteProps {
  value: string;
  onChange: (value: string, customer?: Customer) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowCreateNew?: boolean;
  onCustomerSelect?: (customer: Customer) => void;
  searchBy?: 'name' | 'number';
}

export const CustomerAutocomplete: React.FC<CustomerAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Search customer name or number...",
  disabled = false,
  className,
  allowCreateNew = true,
  onCustomerSelect,
  searchBy = 'name'
}) => {
  const { toast } = useToast();

  const handleSearch = async (query: string): Promise<AutocompleteOption[]> => {
    try {
      const customers = await customersService.searchCustomers(query);
      return customers.map(customer => ({
        id: customer.id,
        label: searchBy === 'name' ? customer.customer_name : customer.customer_number,
        value: searchBy === 'name' ? customer.customer_name : customer.customer_number,
        data: customer
      }));
    } catch (error) {
      console.error('Customer search error:', error);
      return [];
    }
  };

  const handleCreateNew = async (searchValue: string): Promise<AutocompleteOption> => {
    try {
      // For customer creation, we need both name and number
      // This is a simplified version - in real app you might want a dialog
      const customerData: Omit<Customer, 'id'> = searchBy === 'name' 
        ? {
            customer_name: searchValue,
            customer_number: `AUTO-${Date.now()}`, // Auto-generated number
            contact_person: '',
            email: '',
            phone: '',
            address: ''
          }
        : {
            customer_name: `Customer ${searchValue}`, // Auto-generated name
            customer_number: searchValue,
            contact_person: '',
            email: '',
            phone: '',
            address: ''
          };

      const newCustomer = await customersService.createCustomer(customerData);

      toast({
        title: "New customer created",
        description: `Customer ${searchBy === 'name' ? newCustomer.customer_name : newCustomer.customer_number} has been added`,
      });

      return {
        id: newCustomer.id,
        label: searchBy === 'name' ? newCustomer.customer_name : newCustomer.customer_number,
        value: searchBy === 'name' ? newCustomer.customer_name : newCustomer.customer_number,
        data: newCustomer
      };
    } catch (error) {
      console.error('Create customer error:', error);
      toast({
        title: "Error creating customer",
        description: "Could not create new customer. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleChange = (newValue: string, option?: AutocompleteOption) => {
    onChange(newValue, option?.data as Customer);
    
    if (option?.data && onCustomerSelect) {
      onCustomerSelect(option.data as Customer);
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
      createNewLabel={`Create new ${searchBy === 'name' ? 'customer' : 'customer number'}`}
      minSearchLength={1}
    />
  );
};