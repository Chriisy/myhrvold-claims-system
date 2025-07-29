import { supabase } from '@/integrations/supabase/client';

export interface Part {
  id: string;
  part_number: string;
  description: string;
  unit_price: number;
  supplier_name?: string;
  category?: string;
}

export interface Customer {
  id: string;
  customer_name: string;
  customer_number: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// Parts service
export const partsService = {
  async searchParts(query: string, limit: number = 10): Promise<Part[]> {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .or(`part_number.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('is_active', true)
      .order('part_number')
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async createPart(part: Omit<Part, 'id'>): Promise<Part> {
    const { data, error } = await supabase
      .from('parts')
      .insert([{
        ...part,
        created_by: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPartByNumber(partNumber: string): Promise<Part | null> {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .eq('part_number', partNumber)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
};

// Customers service
export const customersService = {
  async searchCustomers(query: string, limit: number = 10): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`customer_name.ilike.%${query}%,customer_number.ilike.%${query}%`)
      .eq('is_active', true)
      .order('customer_name')
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async createCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert([{
        ...customer,
        created_by: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getCustomerByNumber(customerNumber: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('customer_number', customerNumber)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
};