
-- Create an RPC function to handle invoice modifications
CREATE OR REPLACE FUNCTION create_invoice_modification(
  invoice_id UUID,
  modification_type TEXT,
  new_amount NUMERIC,
  reason TEXT,
  modified_by UUID,
  shop_id UUID,
  created_at TIMESTAMPTZ,
  returned_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Insert the modification
  INSERT INTO invoice_modifications (
    invoice_id,
    modification_type,
    new_amount,
    reason,
    modified_by,
    shop_id,
    created_at,
    returned_items
  ) VALUES (
    create_invoice_modification.invoice_id,
    create_invoice_modification.modification_type,
    create_invoice_modification.new_amount,
    create_invoice_modification.reason,
    create_invoice_modification.modified_by,
    create_invoice_modification.shop_id,
    create_invoice_modification.created_at,
    create_invoice_modification.returned_items
  )
  RETURNING to_jsonb(invoice_modifications.*) INTO result;

  RETURN result;
END;
$$;

-- Create a function to retrieve invoice modifications
CREATE OR REPLACE FUNCTION get_invoice_modifications(invoice_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', im.id,
      'invoice_id', im.invoice_id,
      'modification_type', im.modification_type,
      'new_amount', im.new_amount,
      'reason', im.reason,
      'modified_by', im.modified_by,
      'created_at', im.created_at,
      'shop_id', im.shop_id,
      'returned_items', im.returned_items,
      'profiles', jsonb_build_object(
        'email', p.email
      )
    )
  )
  FROM invoice_modifications im
  LEFT JOIN auth.users p ON im.modified_by = p.id
  WHERE im.invoice_id = get_invoice_modifications.invoice_id
  ORDER BY im.created_at DESC
  INTO result;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Grant execution permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_invoice_modification TO authenticated;
GRANT EXECUTE ON FUNCTION get_invoice_modifications TO authenticated;
