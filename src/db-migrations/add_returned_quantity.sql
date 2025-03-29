
-- Add returned_quantity column to sale_items table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'sale_items' 
    AND column_name = 'returned_quantity'
  ) THEN
    ALTER TABLE sale_items ADD COLUMN returned_quantity INTEGER DEFAULT 0;
  END IF;
END
$$;

-- Create check_column_exists function if it doesn't exist
CREATE OR REPLACE FUNCTION check_column_exists(
  table_name TEXT,
  column_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = check_column_exists.table_name
    AND column_name = check_column_exists.column_name
  ) INTO column_exists;
  
  RETURN column_exists;
END;
$$;
