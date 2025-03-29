-- Add customer_phone column to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own shop's invoices" ON invoices;
DROP POLICY IF EXISTS "Authenticated users can create invoices for their shop" ON invoices;

-- Create new policies
CREATE POLICY "Users can view their own shop's invoices" ON invoices
    FOR SELECT
    USING (shop_id IN (
        SELECT shop_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Authenticated users can create invoices for their shop" ON invoices
    FOR INSERT
    WITH CHECK (shop_id IN (
        SELECT shop_id FROM profiles WHERE id = auth.uid()
    ));

-- Create index for customer_phone
CREATE INDEX IF NOT EXISTS idx_invoices_customer_phone ON invoices(customer_phone); 