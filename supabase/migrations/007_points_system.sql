-- Points system: award points for actions and level up

-- Add points_earned column to track point history
CREATE TABLE IF NOT EXISTS points_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_points_log_user_id ON points_log(user_id);
CREATE INDEX IF NOT EXISTS idx_points_log_created_at ON points_log(created_at DESC);

-- RLS
ALTER TABLE points_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own points" ON points_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert points" ON points_log
  FOR INSERT WITH CHECK (true);

-- Function to add points and update level
CREATE OR REPLACE FUNCTION add_points(
  p_user_id UUID,
  p_points INTEGER,
  p_action TEXT,
  p_metadata JSONB DEFAULT '{}'
) RETURNS void AS $$
DECLARE
  v_new_total INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Insert points log
  INSERT INTO points_log (user_id, points, action, metadata)
  VALUES (p_user_id, p_points, p_action, p_metadata);

  -- Update user points
  UPDATE profiles
  SET points = points + p_points
  WHERE id = p_user_id
  RETURNING points INTO v_new_total;

  -- Calculate new level (every 100 points = 1 level)
  v_new_level := GREATEST(1, FLOOR(v_new_total / 100) + 1);

  -- Update level if changed
  UPDATE profiles
  SET level = v_new_level
  WHERE id = p_user_id AND level != v_new_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get points history
CREATE OR REPLACE FUNCTION get_points_history(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20
) RETURNS TABLE (
  id UUID,
  points INTEGER,
  action TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT pl.id, pl.points, pl.action, pl.metadata, pl.created_at
  FROM points_log pl
  WHERE pl.user_id = p_user_id
  ORDER BY pl.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;
