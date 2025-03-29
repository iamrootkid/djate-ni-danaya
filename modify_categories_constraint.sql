
-- Drop existing name unique constraint and add composite constraint with shop_id
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key;
ALTER TABLE categories ADD CONSTRAINT categories_name_shop_id_key UNIQUE (name, shop_id);
