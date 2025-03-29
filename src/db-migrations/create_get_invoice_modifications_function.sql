-- Create function to get invoice modifications
CREATE OR REPLACE FUNCTION get_invoice_modifications(invoice_id UUID)
RETURNS TABLE (
    id UUID,
    invoice_id UUID,
    modification_type TEXT,
    new_amount NUMERIC,
    reason TEXT,
    modified_by UUID,
    created_at TIMESTAMPTZ,
    returned_items JSONB,
    profiles JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.invoice_id,
        m.modification_type,
        m.new_amount,
        m.reason,
        m.modified_by,
        m.created_at,
        m.returned_items,
        jsonb_build_object(
            'email', p.email,
            'full_name', p.full_name
        ) as profiles
    FROM invoice_modifications m
    LEFT JOIN profiles p ON m.modified_by = p.id
    WHERE m.invoice_id = $1
    ORDER BY m.created_at DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_invoice_modifications(UUID) TO authenticated; 