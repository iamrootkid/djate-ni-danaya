
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string | null;
  category_id?: string | null;
  categories?: {
    id: string;
    name: string;
  } | null;
}

export interface CartItem extends Product {
  quantity: number;
}
