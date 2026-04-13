-- Rollback: 0187_fix_p9_inventory_real_columns
-- Reverse column renames and value conversions for P9 inventory fix.

UPDATE cleaning_supplies SET
  quantity_in_stock_x1000 = CAST(quantity_in_stock_x1000 / 1000.0 AS REAL);

ALTER TABLE cleaning_supplies RENAME COLUMN quantity_in_stock_x1000 TO quantity_in_stock;

UPDATE bakery_ingredients SET
  quantity_in_stock_x1000 = CAST(quantity_in_stock_x1000 / 1000.0 AS REAL),
  reorder_level_x1000     = CAST(reorder_level_x1000 / 1000.0 AS REAL);

ALTER TABLE bakery_ingredients RENAME COLUMN reorder_level_x1000 TO reorder_level;
ALTER TABLE bakery_ingredients RENAME COLUMN quantity_in_stock_x1000 TO quantity_in_stock;
