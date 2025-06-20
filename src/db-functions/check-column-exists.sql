
-- This SQL function would need to be executed in the Supabase SQL editor
-- It checks if a column exists in a table
CREATE OR REPLACE FUNCTION public.has_column(table_name text, column_name text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
   exists_bool BOOLEAN;
BEGIN
   SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = has_column.table_name
      AND column_name = has_column.column_name
   ) INTO exists_bool;
   
   RETURN exists_bool;
END;
$$;
