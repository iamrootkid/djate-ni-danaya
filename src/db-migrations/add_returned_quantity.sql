-- Add returned_quantity column to sale_items table
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS returned_quantity INTEGER DEFAULT 0;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_sale_items_returned_quantity ON sale_items(returned_quantity);

-- Update RLS policies to include the new column
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shop's sale items" ON sale_items
    FOR SELECT
    USING (
        sale_id IN (
            SELECT id FROM sales WHERE shop_id IN (
                SELECT shop_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update their own shop's sale items" ON sale_items
    FOR UPDATE
    USING (
        sale_id IN (
            SELECT id FROM sales WHERE shop_id IN (
                SELECT shop_id FROM profiles WHERE id = auth.uid()
            )
        )
    )
    WITH CHECK (
        sale_id IN (
            SELECT id FROM sales WHERE shop_id IN (
                SELECT shop_id FROM profiles WHERE id = auth.uid()
            )
        )
    );
