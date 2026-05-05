-- ============================================================
--  INVENTRA — Full Supabase Schema
--  Run these in order inside the Supabase SQL Editor
-- ============================================================

-- ─── 1. CATEGORIES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT        NOT NULL,
  is_predefined BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 2. SUBCATEGORIES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subcategories (
  id          BIGSERIAL PRIMARY KEY,
  category_id BIGINT      NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 3. PRODUCTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id             BIGSERIAL PRIMARY KEY,
  subcategory_id BIGINT      NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
  name           TEXT        NOT NULL,
  selling_price  NUMERIC     NOT NULL DEFAULT 0,
  cost_price     NUMERIC     NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 4. INVENTORY ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory (
  id         BIGSERIAL PRIMARY KEY,
  product_id BIGINT      NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  quantity   INTEGER     NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 5. SALES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sales (
  id            BIGSERIAL PRIMARY KEY,
  product_id    BIGINT      NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity      INTEGER     NOT NULL,
  selling_price NUMERIC     NOT NULL,
  date          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
--  TRIGGERS
-- ============================================================

-- Auto-restore inventory when a sale is DELETED
CREATE OR REPLACE FUNCTION restore_inventory_on_sale_delete()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE inventory
  SET quantity   = quantity + OLD.quantity,
      updated_at = NOW()
  WHERE product_id = OLD.product_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_restore_inventory ON sales;
CREATE TRIGGER trg_restore_inventory
  AFTER DELETE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION restore_inventory_on_sale_delete();

-- ============================================================
--  ROW LEVEL SECURITY (enable for production)
-- ============================================================

ALTER TABLE categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory     ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales         ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon key (adjust for production auth)
CREATE POLICY "allow_all_categories"    ON categories    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_subcategories" ON subcategories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_products"      ON products      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_inventory"     ON inventory     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_sales"         ON sales         FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
--  USEFUL QUERIES
-- ============================================================

-- View all products with stock and category path
-- SELECT
--   c.name  AS category,
--   s.name  AS subcategory,
--   p.name  AS product,
--   p.selling_price,
--   i.quantity AS stock
-- FROM products p
-- JOIN subcategories s ON s.id = p.subcategory_id
-- JOIN categories    c ON c.id = s.category_id
-- LEFT JOIN inventory i ON i.product_id = p.id
-- ORDER BY c.name, s.name, p.name;

-- Sales summary per product (last 30 days)
-- SELECT
--   p.name,
--   SUM(sl.quantity)                        AS units_sold,
--   SUM(sl.quantity * sl.selling_price)     AS revenue
-- FROM sales sl
-- JOIN products p ON p.id = sl.product_id
-- WHERE sl.date >= NOW() - INTERVAL '30 days'
-- GROUP BY p.name
-- ORDER BY units_sold DESC;
