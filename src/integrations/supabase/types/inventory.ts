
import { Json } from './auth';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  shop_id: string;  // Make shop_id required in the type
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
}

export interface CategoriesTable {
  Row: Category;
  Insert: {
    id?: string;
    name: string;
    description?: string | null;
    shop_id: string;  // Make shop_id required for inserts
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    name?: string;
    description?: string | null;
    shop_id?: string;
    created_at?: string;
    updated_at?: string;
  };
}

export interface ProductsTable {
  Row: Product;
  Insert: {
    id?: string;
    name: string;
    description?: string | null;
    price: number;
    stock?: number;
    category_id?: string | null;
    shop_id?: string | null;
    created_at?: string;
    updated_at?: string;
    image_url?: string | null;
  };
  Update: {
    id?: string;
    name?: string;
    description?: string | null;
    price?: number;
    stock?: number;
    category_id?: string | null;
    shop_id?: string | null;
    created_at?: string;
    updated_at?: string;
    image_url?: string | null;
  };
}
