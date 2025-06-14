
-- Insert only the super admin shop record with PIN 128076
INSERT INTO public.shops (id, name, address, pin_code, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'SUPER ADMIN SYSTEM',
  'System Administration',
  '128076',
  NOW(),
  NOW()
)
ON CONFLICT (pin_code) DO NOTHING;
