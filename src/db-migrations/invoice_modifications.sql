
-- Create table for invoice modifications
CREATE TABLE IF NOT EXISTS invoice_modifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  modification_type TEXT NOT NULL,
  new_amount DECIMAL(10, 2),
  reason TEXT NOT NULL,
  modified_by UUID REFERENCES auth.users(id),
  shop_id UUID REFERENCES shops(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  returned_items JSONB
);

-- Add RLS policies
ALTER TABLE invoice_modifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shop's invoice modifications" 
  ON invoice_modifications 
  FOR SELECT 
  USING (
    shop_id IN (
      SELECT shop_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create invoice modifications for their shop" 
  ON invoice_modifications 
  FOR INSERT 
  WITH CHECK (
    shop_id IN (
      SELECT shop_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Add new columns to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_modified BOOLEAN DEFAULT FALSE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS modification_reason TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS new_total_amount DECIMAL(10, 2);

-- Add new column to sale_items table
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS returned_quantity INTEGER DEFAULT 0;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_invoice_modifications_invoice_id ON invoice_modifications(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_modifications_shop_id ON invoice_modifications(shop_id);
CREATE INDEX IF NOT EXISTS idx_invoices_is_modified ON invoices(is_modified) WHERE is_modified = TRUE;
