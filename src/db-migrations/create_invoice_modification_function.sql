
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
  item_record JSONB;
  sale_item_id UUID;
  product_id UUID;
  return_quantity INTEGER;
  current_stock INTEGER;
  sale_id UUID;
BEGIN
  -- Get the sale_id from invoice
  SELECT sales.id INTO sale_id
  FROM invoices
  JOIN sales ON invoices.sale_id = sales.id
  WHERE invoices.id = create_invoice_modification.invoice_id;

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

  -- Update the invoice record to mark it as modified
  UPDATE invoices
  SET 
    is_modified = TRUE,
    modification_reason = create_invoice_modification.reason,
    new_total_amount = create_invoice_modification.new_amount,
    updated_at = NOW()
  WHERE id = create_invoice_modification.invoice_id;

  -- If this is a return, update product stock
  IF modification_type = 'return' AND returned_items IS NOT NULL AND jsonb_array_length(returned_items) > 0 THEN
    -- Loop through each returned item
    FOR item_record IN SELECT * FROM jsonb_array_elements(returned_items)
    LOOP
      -- Only process selected items with reduced quantity
      IF (item_record->>'selected')::boolean = true AND (item_record->>'quantity')::integer < (item_record->>'originalQuantity')::integer THEN
        sale_item_id := (item_record->>'id')::UUID;
        
        -- Get product_id from sale_items
        SELECT product_id INTO product_id 
        FROM sale_items 
        WHERE id = sale_item_id;
        
        IF product_id IS NOT NULL THEN
          -- Calculate return quantity
          return_quantity := (item_record->>'originalQuantity')::integer - (item_record->>'quantity')::integer;
          
          -- Update sale_items to record returned quantity
          UPDATE sale_items
          SET
            returned_quantity = COALESCE(returned_quantity, 0) + return_quantity,
            updated_at = NOW()
          WHERE id = sale_item_id;
          
          -- Update stock in products table
          UPDATE products 
          SET 
            stock = stock + return_quantity,
            updated_at = NOW()
          WHERE id = product_id AND shop_id = create_invoice_modification.shop_id
          RETURNING stock INTO current_stock;
          
          -- Log the update
          RAISE NOTICE 'Product % stock updated to %', product_id, current_stock;
        END IF;
      END IF;
    END LOOP;
    
    -- Update sale total amount to reflect the return
    UPDATE sales
    SET total_amount = create_invoice_modification.new_amount,
        updated_at = NOW()
    WHERE id = sale_id;
  END IF;

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
