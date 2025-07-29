import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { partsService, customersService, Part, Customer } from '@/services/autocompleteService';
import { useToast } from '@/hooks/use-toast';

// Parts hooks
export const usePartsSearch = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['parts', 'search', query],
    queryFn: () => partsService.searchParts(query),
    enabled: enabled && query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes  
  });
};

export const useCreatePart = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (part: Omit<Part, 'id'>) => partsService.createPart(part),
    onSuccess: (newPart) => {
      // Invalidate parts search queries to include the new part
      queryClient.invalidateQueries({
        queryKey: ['parts', 'search'],
      });
      
      toast({
        title: "New part created",
        description: `Part ${newPart.part_number} has been added to the database`,
      });
    },
    onError: (error) => {
      console.error('Create part error:', error);
      toast({
        title: "Error creating part",
        description: "Could not create new part. Please try again.",
        variant: "destructive"
      });
    }
  });
};

// Customers hooks
export const useCustomersSearch = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['customers', 'search', query],
    queryFn: () => customersService.searchCustomers(query),
    enabled: enabled && query.length >= 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (customer: Omit<Customer, 'id'>) => customersService.createCustomer(customer),
    onSuccess: (newCustomer) => {
      // Invalidate customer search queries to include the new customer
      queryClient.invalidateQueries({
        queryKey: ['customers', 'search'],
      });
      
      toast({
        title: "New customer created",
        description: `Customer ${newCustomer.customer_name} has been added`,
      });
    },
    onError: (error) => {
      console.error('Create customer error:', error);
      toast({
        title: "Error creating customer",
        description: "Could not create new customer. Please try again.",
        variant: "destructive"
      });
    }
  });
};