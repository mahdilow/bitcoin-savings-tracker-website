-- Enable RLS on bitcoin_prices table
ALTER TABLE bitcoin_prices ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read (SELECT) bitcoin price data
CREATE POLICY "Anyone can read bitcoin prices"
  ON bitcoin_prices
  FOR SELECT
  USING (true);

-- Allow inserts from server (no auth required for the cron/server inserts)
CREATE POLICY "Server can insert bitcoin prices"
  ON bitcoin_prices
  FOR INSERT
  WITH CHECK (true);

-- Optional: Allow updates from server
CREATE POLICY "Server can update bitcoin prices"
  ON bitcoin_prices
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
