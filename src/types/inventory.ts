
export interface Category {
  id: string;
  name: string;
  description: string | null;
  shop_id: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category_id: string | null;
  shop_id: string | null;
  created_at: string;
  updated_at: string;
  image_url: string | null;
  categories?: {
    name: string | null;
  } | null;
}
