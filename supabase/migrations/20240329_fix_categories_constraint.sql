-- First, drop any existing constraints
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key;
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_shop_id_key;

-- Then add the correct composite unique constraint
ALTER TABLE categories ADD CONSTRAINT categories_name_shop_id_key UNIQUE (name, shop_id);

-- Add an index to improve query performance
CREATE INDEX IF NOT EXISTS idx_categories_shop_id ON categories(shop_id); 