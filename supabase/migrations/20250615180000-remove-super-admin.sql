
-- Drop functions related to super admin
DROP FUNCTION IF EXISTS public.is_super_admin();
DROP FUNCTION IF EXISTS public.get_all_shops();
DROP FUNCTION IF EXISTS public.get_all_users_with_shops();
DROP FUNCTION IF EXISTS public.create_shop_super_admin(text, text);
DROP FUNCTION IF EXISTS public.assign_user_to_shop(uuid, uuid, text);

-- Remove the super admin shop record
DELETE FROM public.shops WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;

-- Note: We are not removing the 'super_admin' value from the 'app_role' enum
-- as this can cause issues if it's still referenced in the database.
-- It is safe to leave it.
