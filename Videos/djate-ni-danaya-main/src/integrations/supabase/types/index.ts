
import { Json } from './auth';
import type { ProfilesTable } from './auth';
import type { CategoriesTable, ProductsTable } from './inventory';
import type { SalesTable, SaleItemsTable, InvoicesTable, InvoiceModificationsTable } from './sales';
import type { DatabaseFunctions } from './functions';

export type Database = {
  public: {
    Tables: {
      categories: CategoriesTable;
      products: ProductsTable;
      profiles: ProfilesTable;
      sales: SalesTable;
      sale_items: SaleItemsTable;
      invoices: InvoicesTable;
      invoice_modifications: InvoiceModificationsTable;
      shops: ShopsTable;
    };
    Functions: DatabaseFunctions;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export interface ShopsTable {
  Row: {
    id: string;
    name: string;
    address: string | null;
    owner_id: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    name: string;
    address?: string | null;
    owner_id?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    name?: string;
    address?: string | null;
    owner_id?: string | null;
    created_at?: string;
    updated_at?: string;
  };
}

export type { Json };
export * from './auth';
export * from './inventory';
export * from './sales';
export * from './functions';
