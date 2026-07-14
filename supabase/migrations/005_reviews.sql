-- Reviews table: written reviews with ratings
-- This extends the existing feedback table with text reviews

CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page_id, user_id)  -- One review per user per tool
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_page_id ON reviews(page_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Function to get rating distribution
CREATE OR REPLACE FUNCTION get_rating_distribution(p_page_id UUID)
RETURNS TABLE (
  rating INTEGER,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT r.rating, COUNT(*) as count
  FROM reviews r
  WHERE r.page_id = p_page_id
  GROUP BY r.rating
  ORDER BY r.rating DESC;
END;
$$ LANGUAGE plpgsql STABLE;
