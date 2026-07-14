-- Collections: allow users to create tool collections/playlists

CREATE TABLE IF NOT EXISTS collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS collection_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(collection_id, page_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_is_public ON collections(is_public);
CREATE INDEX IF NOT EXISTS idx_collection_items_collection_id ON collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_page_id ON collection_items(page_id);

-- RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

-- Collections policies
CREATE POLICY "Public collections are readable" ON collections
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own collections" ON collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections" ON collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections" ON collections
  FOR DELETE USING (auth.uid() = user_id);

-- Collection items policies
CREATE POLICY "Items readable via collection" ON collection_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM collections c
      WHERE c.id = collection_id AND (c.is_public = true OR c.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage own collection items" ON collection_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections c
      WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own collection items" ON collection_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM collections c
      WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );

-- Function to get collections with item count
CREATE OR REPLACE FUNCTION get_user_collections(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  is_public BOOLEAN,
  item_count BIGINT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.description, c.is_public,
    (SELECT COUNT(*) FROM collection_items ci WHERE ci.collection_id = c.id) as item_count,
    c.created_at
  FROM collections c
  WHERE c.user_id = p_user_id
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;
