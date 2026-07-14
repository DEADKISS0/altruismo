-- Activity Feed: activity table
-- Tracks user actions for the activity feed

CREATE TABLE IF NOT EXISTS activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'upload', 'like', 'comment', 'follow', 'challenge_join', 'challenge_complete'
  target_type TEXT NOT NULL, -- 'page', 'user', 'challenge'
  target_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON activity(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_action ON activity(action);

-- RLS policies
ALTER TABLE activity ENABLE ROW LEVEL SECURITY;

-- Anyone can read activity (public feed)
CREATE POLICY "Public read access" ON activity
  FOR SELECT USING (true);

-- Only authenticated users can insert their own activity
CREATE POLICY "Insert own activity" ON activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'new_follower', 'new_comment', 'new_like', 'achievement_earned'
  title TEXT NOT NULL,
  message TEXT,
  target_type TEXT,
  target_id UUID,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only read their own notifications
CREATE POLICY "Read own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- System can insert notifications for any user
CREATE POLICY "Insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- RPC functions
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_action TEXT,
  p_target_type TEXT,
  p_target_id UUID,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO activity (user_id, action, target_type, target_id, metadata)
  VALUES (p_user_id, p_action, p_target_type, p_target_id, p_metadata)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT DEFAULT NULL,
  p_target_type TEXT DEFAULT NULL,
  p_target_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, target_type, target_id)
  VALUES (p_user_id, p_type, p_title, p_message, p_target_type, p_target_id)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_activity(
  p_user_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
) RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_name TEXT,
  user_avatar TEXT,
  action TEXT,
  target_type TEXT,
  target_id UUID,
  target_title TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.user_id,
    p.name as user_name,
    p.avatar_url as user_avatar,
    a.action,
    a.target_type,
    a.target_id,
    CASE
      WHEN a.target_type = 'page' THEN (SELECT title FROM pages WHERE id = a.target_id)
      WHEN a.target_type = 'challenge' THEN (SELECT title FROM challenges WHERE id = a.target_id)
      ELSE NULL
    END as target_title,
    a.metadata,
    a.created_at
  FROM activity a
  JOIN profiles p ON p.id = a.user_id
  WHERE (p_user_id IS NULL OR a.user_id = p_user_id)
  ORDER BY a.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;
