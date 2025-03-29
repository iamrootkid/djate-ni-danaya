-- Create invoice_modifications table
CREATE TABLE IF NOT EXISTS invoice_modifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    modification_type TEXT NOT NULL CHECK (modification_type IN ('price', 'return', 'other')),
    new_amount NUMERIC,
    reason TEXT NOT NULL,
    modified_by UUID NOT NULL REFERENCES auth.users(id),
    shop_id UUID NOT NULL REFERENCES shops(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    returned_items JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_invoice_modifications_invoice_id ON invoice_modifications(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_modifications_shop_id ON invoice_modifications(shop_id);
CREATE INDEX IF NOT EXISTS idx_invoice_modifications_modified_by ON invoice_modifications(modified_by);

-- Add RLS policies
ALTER TABLE invoice_modifications ENABLE ROW LEVEL SECURITY;

-- Policy for inserting modifications (users can only insert for their shop)
CREATE POLICY invoice_modifications_insert_policy ON invoice_modifications
    FOR INSERT
    TO authenticated
    WITH CHECK (
        shop_id IN (
            SELECT id FROM shops
            WHERE id = invoice_modifications.shop_id
            AND owner_id = auth.uid()
        )
    );

-- Policy for selecting modifications (users can only see their shop's modifications)
CREATE POLICY invoice_modifications_select_policy ON invoice_modifications
    FOR SELECT
    TO authenticated
    USING (
        shop_id IN (
            SELECT id FROM shops
            WHERE id = invoice_modifications.shop_id
            AND owner_id = auth.uid()
        )
    );

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT ON invoice_modifications TO authenticated; 