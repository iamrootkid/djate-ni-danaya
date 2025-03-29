-- Add stock_quantity column to products table
ALTER TABLE products 
    ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON products(stock_quantity);

-- Update RLS policies to allow updating stock_quantity
CREATE POLICY "Users can update stock_quantity in their shop's products" 
    ON products 
    FOR UPDATE 
    TO authenticated 
    USING (
        shop_id IN (
            SELECT id FROM shops 
            WHERE id = products.shop_id 
            AND owner_id = auth.uid()
        )
    )
    WITH CHECK (
        shop_id IN (
            SELECT id FROM shops 
            WHERE id = products.shop_id 
            AND owner_id = auth.uid()
        )
    );

-- Grant necessary permissions
GRANT UPDATE ON products TO authenticated; 