-- Enable RLS on purchases table
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own purchases
CREATE POLICY "Users can view own purchases"
  ON purchases
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own purchases
CREATE POLICY "Users can insert own purchases"
  ON purchases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own purchases
CREATE POLICY "Users can update own purchases"
  ON purchases
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own purchases
CREATE POLICY "Users can delete own purchases"
  ON purchases
  FOR DELETE
  USING (auth.uid() = user_id);
