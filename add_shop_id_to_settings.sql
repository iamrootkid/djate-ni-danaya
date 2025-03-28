ALTER TABLE settings ADD COLUMN shop_id UUID REFERENCES shops(id);
