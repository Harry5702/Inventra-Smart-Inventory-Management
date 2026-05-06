-- Run this in Supabase SQL Editor to fix the foreign key constraint
-- so that deleting a product doesn't block deletion of categories/subcategories

-- Step 1: Drop the existing strict FK
ALTER TABLE shop_order_items
  DROP CONSTRAINT IF EXISTS shop_order_items_product_id_fkey;

-- Step 2: Make product_id nullable (order history preserved even if product deleted)
ALTER TABLE shop_order_items
  ALTER COLUMN product_id DROP NOT NULL;

-- Step 3: Re-add FK with ON DELETE SET NULL
ALTER TABLE shop_order_items
  ADD CONSTRAINT shop_order_items_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
