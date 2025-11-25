-- Create table for storing Bitcoin price data
CREATE TABLE IF NOT EXISTS public.bitcoin_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price_usd NUMERIC NOT NULL,
  price_change_24h NUMERIC DEFAULT 0,
  price_change_7d NUMERIC DEFAULT 0,
  price_change_30d NUMERIC DEFAULT 0,
  market_cap NUMERIC DEFAULT 0,
  volume_24h NUMERIC DEFAULT 0,
  circulating_supply NUMERIC DEFAULT 0,
  total_supply NUMERIC DEFAULT 0,
  ath NUMERIC DEFAULT 0,
  ath_date TEXT DEFAULT '',
  atl NUMERIC DEFAULT 0,
  atl_date TEXT DEFAULT '',
  dominance NUMERIC DEFAULT 0,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_bitcoin_prices_fetched_at ON public.bitcoin_prices(fetched_at DESC);

-- Enable RLS (everyone can read, but only service role can insert/update)
ALTER TABLE public.bitcoin_prices ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read
CREATE POLICY "Anyone can view bitcoin prices"
  ON public.bitcoin_prices
  FOR SELECT
  TO public
  USING (true);

-- Policy: Only service role can insert/update (via API route)
CREATE POLICY "Service role can insert bitcoin prices"
  ON public.bitcoin_prices
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update bitcoin prices"
  ON public.bitcoin_prices
  FOR UPDATE
  TO service_role
  USING (true);
