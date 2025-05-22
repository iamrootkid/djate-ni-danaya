
export interface Order {
  id: string;
  customer_name: string;
  total_amount: number;
  created_at: string;
  payment_method?: string;
  status?: 'completed' | 'pending' | 'cancelled';
}
