-- Add IRT price column to bitcoin_prices table if it doesn't exist
ALTER TABLE bitcoin_prices 
ADD COLUMN IF NOT EXISTS irt_price DECIMAL(20, 2);

-- Add comment for documentation
COMMENT ON COLUMN bitcoin_prices.irt_price IS 'Bitcoin price in Iranian Toman (IRT)';
