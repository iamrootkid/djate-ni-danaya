
-- Add foreign key from sales.employee_id to profiles.id
-- First, we need to create a named foreign key constraint
ALTER TABLE sales 
ADD CONSTRAINT sales_employee_id_fkey 
FOREIGN KEY (employee_id) 
REFERENCES profiles(id);

-- Create an index to improve query performance
CREATE INDEX IF NOT EXISTS idx_sales_employee_id ON sales(employee_id);
