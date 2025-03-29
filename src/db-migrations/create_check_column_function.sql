-- Create function to check if a column exists
CREATE OR REPLACE FUNCTION check_column_exists(
    p_table_name TEXT,
    p_column_name TEXT
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
        WHERE table_schema = 'public'
        AND table_name = p_table_name
        AND column_name = p_column_name
    ) INTO column_exists;
    
    RETURN column_exists;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_column_exists(TEXT, TEXT) TO authenticated; 