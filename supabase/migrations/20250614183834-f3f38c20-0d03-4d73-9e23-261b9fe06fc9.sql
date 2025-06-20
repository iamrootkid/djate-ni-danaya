
-- Add super_admin role to the profiles table (if not already supported)
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'super_admin';

-- Update the profiles table to support super_admin role
-- (The role column already exists, so we just need to ensure super_admin is allowed)

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  is_super_admin BOOLEAN;
BEGIN
  SELECT (role = 'super_admin') INTO is_super_admin
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(is_super_admin, FALSE);
END;
$function$;

-- Create function to get all shops with statistics
CREATE OR REPLACE FUNCTION public.get_all_shops()
RETURNS TABLE(
  id uuid,
  name text,
  address text,
  pin_code character varying,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  owner_id uuid,
  total_sales bigint,
  total_revenue numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is super admin
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: Super admin required';
  END IF;

  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.address,
    s.pin_code,
    s.created_at,
    s.updated_at,
    s.owner_id,
    COALESCE(COUNT(sales.id), 0) as total_sales,
    COALESCE(SUM(sales.total_amount), 0) as total_revenue
  FROM public.shops s
  LEFT JOIN public.sales ON s.id = sales.shop_id
  GROUP BY s.id, s.name, s.address, s.pin_code, s.created_at, s.updated_at, s.owner_id
  ORDER BY s.created_at DESC;
END;
$function$;

-- Create function to get all users with their shops
CREATE OR REPLACE FUNCTION public.get_all_users_with_shops()
RETURNS TABLE(
  user_id uuid,
  email text,
  first_name text,
  last_name text,
  role text,
  shop_id uuid,
  shop_name text,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is super admin
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: Super admin required';
  END IF;

  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    p.shop_id,
    s.name as shop_name,
    p.created_at
  FROM public.profiles p
  LEFT JOIN public.shops s ON p.shop_id = s.id
  ORDER BY p.created_at DESC;
END;
$function$;

-- Create function for super admin to create shops
CREATE OR REPLACE FUNCTION public.create_shop_super_admin(
  shop_name text,
  shop_address text DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  name text,
  address text,
  pin_code character varying,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_pin_code VARCHAR(6);
  new_shop_id UUID;
BEGIN
  -- Check if user is super admin
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: Super admin required';
  END IF;

  -- Generate unique PIN code
  SELECT public.generate_unique_pin_code() INTO new_pin_code;
  
  -- Insert new shop
  INSERT INTO public.shops (name, address, pin_code)
  VALUES (shop_name, shop_address, new_pin_code)
  RETURNING shops.id INTO new_shop_id;
  
  -- Return shop information
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.address,
    s.pin_code,
    s.created_at
  FROM public.shops s
  WHERE s.id = new_shop_id;
END;
$function$;

-- Create function to assign users to shops
CREATE OR REPLACE FUNCTION public.assign_user_to_shop(
  user_id_param uuid,
  shop_id_param uuid,
  role_param text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is super admin
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: Super admin required';
  END IF;

  -- Validate role
  IF role_param NOT IN ('admin', 'employee') THEN
    RAISE EXCEPTION 'Invalid role: %', role_param;
  END IF;

  -- Update user profile
  UPDATE public.profiles
  SET 
    shop_id = shop_id_param,
    role = role_param,
    updated_at = NOW()
  WHERE id = user_id_param;

  -- Update or insert into staff table
  INSERT INTO public.staff (id, email, first_name, last_name, role, shop_id)
  SELECT 
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    role_param,
    shop_id_param
  FROM public.profiles p
  WHERE p.id = user_id_param
  ON CONFLICT (id) 
  DO UPDATE SET
    role = role_param,
    shop_id = shop_id_param,
    updated_at = NOW();

  RETURN TRUE;
END;
$function$;

-- Generate unique PIN code function (if not exists)
CREATE OR REPLACE FUNCTION public.generate_unique_pin_code()
RETURNS character varying
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    new_pin VARCHAR(6);
    pin_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate random 6-digit PIN
        new_pin := LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');
        
        -- Avoid simple PINs
        IF new_pin NOT IN ('000000', '111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888', '999999', '123456', '654321', '000001', '123123') THEN
            -- Check if PIN already exists
            SELECT EXISTS(SELECT 1 FROM public.shops WHERE pin_code = new_pin) INTO pin_exists;
            
            IF NOT pin_exists THEN
                EXIT;
            END IF;
        END IF;
    END LOOP;
    
    RETURN new_pin;
END;
$function$;
