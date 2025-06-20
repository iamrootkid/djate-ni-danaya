-- Drop the existing function first
DROP FUNCTION IF EXISTS create_invoice_modification;

-- Create the updated function
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
  original_quantity INTEGER;
  new_quantity INTEGER;
  quantity_difference INTEGER;
  current_stock INTEGER;
  sale_id UUID;
  employee_email TEXT;
BEGIN
  -- Get the sale_id and employee email from invoice
  SELECT 
    s.id,
    p.email
  INTO 
    sale_id,
    employee_email
  FROM invoices i
  JOIN sales s ON i.sale_id = s.id
  LEFT JOIN profiles p ON s.employee_id = p.id
  WHERE i.id = create_invoice_modification.invoice_id
  AND s.shop_id = create_invoice_modification.shop_id;

  -- Verify that we found a valid sale_id
  IF sale_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invoice_id or shop_id';
  END IF;

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
  UPDATE invoices i
  SET 
    is_modified = TRUE,
    modification_reason = create_invoice_modification.reason,
    new_total_amount = create_invoice_modification.new_amount,
    updated_at = NOW()
  WHERE i.id = create_invoice_modification.invoice_id;

  -- If this is a return or modification, update product stock
  IF (modification_type = 'return' OR modification_type = 'other') AND returned_items IS NOT NULL AND jsonb_array_length(returned_items) > 0 THEN
    -- Loop through each item
    FOR item_record IN SELECT * FROM jsonb_array_elements(returned_items)
    LOOP
      -- Get the sale item ID and ensure it's a valid UUID
      BEGIN
        sale_item_id := (item_record ->> 'id')::UUID;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Invalid sale_item_id format in returned items';
        CONTINUE;
      END;
      
      -- Get product_id and original quantity from sale_items
      SELECT 
        si.product_id,
        si.quantity - COALESCE(si.returned_quantity, 0)
      INTO 
        product_id,
        original_quantity
      FROM sale_items si
      JOIN sales s ON s.id = si.sale_id
      WHERE si.id = sale_item_id
      AND s.shop_id = create_invoice_modification.shop_id;
      
      IF product_id IS NOT NULL THEN
        -- Get the new quantity from the modification
        BEGIN
          new_quantity := (item_record ->> 'quantity')::integer;
        EXCEPTION WHEN OTHERS THEN
          RAISE NOTICE 'Invalid quantity format for sale_item_id: %', sale_item_id;
          CONTINUE;
        END;
        
        -- Calculate the difference (positive if stock should be increased)
        quantity_difference := original_quantity - new_quantity;
        
        -- Only process if there's a difference in quantity
        IF quantity_difference > 0 THEN
          -- Update sale_items to record returned quantity
          UPDATE sale_items si
          SET
            returned_quantity = COALESCE(si.returned_quantity, 0) + quantity_difference,
            updated_at = NOW()
          WHERE si.id = sale_item_id;
          
          -- Update stock in products table
          UPDATE products p
          SET 
            stock = p.stock + quantity_difference,
            updated_at = NOW()
          WHERE p.id = product_id 
          AND p.shop_id = create_invoice_modification.shop_id
          RETURNING p.stock INTO current_stock;
          
          -- Log the update with more details including employee email
          RAISE NOTICE 'Product % (sale item %) stock updated from % to % (returned: %) - Sold by: %', 
            product_id, 
            sale_item_id,
            current_stock - quantity_difference, 
            current_stock, 
            quantity_difference,
            COALESCE(employee_email, 'Email inconnu');
        ELSE
          RAISE NOTICE 'No stock update needed for product % (sale item %): difference is % - Sold by: %', 
            product_id, 
            sale_item_id,
            quantity_difference,
            COALESCE(employee_email, 'Email inconnu');
        END IF;
      ELSE
        RAISE NOTICE 'Product not found for sale_item_id: % - Sold by: %', 
          sale_item_id,
          COALESCE(employee_email, 'Email inconnu');
      END IF;
    END LOOP;
    
    -- Update sale total amount to reflect the return
    UPDATE sales s
    SET total_amount = create_invoice_modification.new_amount,
        updated_at = NOW()
    WHERE s.id = sale_id;
  END IF;

  RETURN result;
END;
$$;

-- Grant execution permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_invoice_modification TO authenticated; 