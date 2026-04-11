-- Rollback: 0189_fix_billing_amount_column_name
-- Reverse column rename back to original name.

ALTER TABLE billing_history RENAME COLUMN amount_kobo TO amount_naira;
