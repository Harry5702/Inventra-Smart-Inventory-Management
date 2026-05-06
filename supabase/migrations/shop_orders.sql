-- Run this in your Supabase SQL editor to create shop_orders tables

CREATE TABLE IF NOT EXISTS shop_orders (
  id           BIGSERIAL PRIMARY KEY,
  shop_name    TEXT        NOT NULL,
  total_price  NUMERIC     NOT NULL DEFAULT 0,
  total_profit NUMERIC     NOT NULL DEFAULT 0,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shop_order_items (
  id          BIGSERIAL PRIMARY KEY,
  order_id    BIGINT      NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
  product_id  BIGINT      NOT NULL REFERENCES products(id),
  product_name TEXT       NOT NULL,
  unit_price  NUMERIC     NOT NULL,
  cost_price  NUMERIC     NOT NULL DEFAULT 0,
  quantity    INT         NOT NULL,
  subtotal    NUMERIC     NOT NULL,
  profit      NUMERIC     NOT NULL DEFAULT 0
);

-- Enable Row Level Security (same pattern as other tables)
ALTER TABLE shop_orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on shop_orders"      ON shop_orders      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on shop_order_items" ON shop_order_items FOR ALL USING (true) WITH CHECK (true);
