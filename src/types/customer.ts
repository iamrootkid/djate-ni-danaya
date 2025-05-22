
export interface Customer {
  id: string;
  shop_id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  loyalty_points: number;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyActivity {
  id: string;
  customer_id: string;
  shop_id: string;
  activity_type: string;
  points: number;
  related_sale_id?: string | null;
  created_at: string;
}
