-- Drop existing function first
DROP FUNCTION IF EXISTS create_invoice_modification(UUID, TEXT, NUMERIC, TEXT, UUID, UUID, TIMESTAMPTZ, JSONB);

-- Create function to handle invoice modifications
CREATE OR REPLACE FUNCTION create_invoice_modification(
    invoice_id UUID,
    modification_type TEXT,
    new_amount NUMERIC,
    reason TEXT,
    modified_by UUID,
    shop_id UUID,
    created_at TIMESTAMPTZ,
    returned_items JSONB
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_modification_id UUID;
    v_item JSONB;
    v_returned_quantity INTEGER;
    v_current_returned INTEGER;
    v_original_amount NUMERIC;
    v_total_returned_amount NUMERIC := 0;
BEGIN
    -- Get the original invoice amount
    SELECT sales.total_amount INTO v_original_amount
    FROM invoices i
    JOIN sales ON i.sale_id = sales.id
    WHERE i.id = invoice_id;

    -- Insert the modification record
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
        invoice_id,
        modification_type,
        new_amount,
        reason,
        modified_by,
        shop_id,
        created_at,
        returned_items
    ) RETURNING id INTO v_modification_id;

    -- If this is a return, process returned items
    IF modification_type = 'return' AND returned_items IS NOT NULL THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(returned_items)
        LOOP
            -- Only process if item is selected
            IF (v_item->>'selected')::BOOLEAN THEN
                -- Calculate returned quantity
                v_returned_quantity := (v_item->>'originalQuantity')::INTEGER - (v_item->>'quantity')::INTEGER;
                
                IF v_returned_quantity > 0 THEN
                    -- Get current returned quantity
                    SELECT COALESCE(returned_quantity, 0) INTO v_current_returned
                    FROM sale_items
                    WHERE id = (v_item->>'id')::UUID;
                    
                    -- Update sale_items returned quantity
                    UPDATE sale_items SET
                        returned_quantity = v_current_returned + v_returned_quantity,
                        updated_at = NOW()
                    WHERE id = (v_item->>'id')::UUID;

                    -- Update product stock
                    UPDATE products SET
                        stock_quantity = COALESCE(stock_quantity, 0) + v_returned_quantity,
                        updated_at = NOW()
                    WHERE id = (
                        SELECT product_id 
                        FROM sale_items 
                        WHERE id = (v_item->>'id')::UUID
                    );

                    -- Calculate returned amount for this item
                    v_total_returned_amount := v_total_returned_amount + (v_returned_quantity * (v_item->>'price')::NUMERIC);
                END IF;
            END IF;
        END LOOP;

        -- Calculate new amount after returns
        new_amount := v_original_amount - v_total_returned_amount;
    END IF;

    -- Update the invoice with the new amount
    UPDATE invoices SET
        is_modified = TRUE,
        modification_reason = reason,
        new_total_amount = new_amount,
        updated_at = NOW()
    WHERE id = invoice_id;

    RETURN v_modification_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION create_invoice_modification(UUID, TEXT, NUMERIC, TEXT, UUID, UUID, TIMESTAMPTZ, JSONB) TO authenticated; 