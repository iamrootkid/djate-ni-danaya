
ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_key_key; ALTER TABLE settings ADD CONSTRAINT settings_key_shop_id_key UNIQUE (key, shop_id);
