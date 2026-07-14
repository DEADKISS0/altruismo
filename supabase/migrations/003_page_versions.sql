-- Tool Versioning: page_versions table
-- Stores historical versions of tools for rollback and change tracking

CREATE TABLE IF NOT EXISTS page_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  source_code TEXT,
  file_url TEXT,
  title TEXT,
  description TEXT,
  change_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Index for fast lookups by page
CREATE INDEX IF NOT EXISTS idx_page_versions_page_id ON page_versions(page_id);
CREATE INDEX IF NOT EXISTS idx_page_versions_created_at ON page_versions(created_at DESC);

-- Unique constraint: one version number per page
CREATE UNIQUE INDEX IF NOT EXISTS idx_page_versions_page_version ON page_versions(page_id, version_number);

-- RLS policies
ALTER TABLE page_versions ENABLE ROW LEVEL SECURITY;

-- Anyone can read versions (tools are public)
CREATE POLICY "Public read access" ON page_versions
  FOR SELECT USING (true);

-- Only authenticated users can insert versions for their own pages
CREATE POLICY "Insert own versions" ON page_versions
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM pages WHERE pages.id = page_id AND pages.author_id = auth.uid()
    )
  );

-- RPC function to create a new version
CREATE OR REPLACE FUNCTION create_page_version(
  p_page_id UUID,
  p_source_code TEXT,
  p_file_url TEXT,
  p_title TEXT,
  p_description TEXT,
  p_change_summary TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_version_number INTEGER;
  v_new_id UUID;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_version_number
  FROM page_versions WHERE page_id = p_page_id;

  -- Insert new version
  INSERT INTO page_versions (page_id, version_number, source_code, file_url, title, description, change_summary, created_by)
  VALUES (p_page_id, v_version_number, p_source_code, p_file_url, p_title, p_description, p_change_summary, auth.uid())
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to get versions for a page
CREATE OR REPLACE FUNCTION get_page_versions(p_page_id UUID)
RETURNS TABLE (
  id UUID,
  version_number INTEGER,
  title TEXT,
  description TEXT,
  change_summary TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT pv.id, pv.version_number, pv.title, pv.description, pv.change_summary, pv.created_at
  FROM page_versions pv
  WHERE pv.page_id = p_page_id
  ORDER BY pv.version_number DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- RPC function to restore a version
CREATE OR REPLACE FUNCTION restore_page_version(
  p_version_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_page_id UUID;
  v_source_code TEXT;
  v_file_url TEXT;
  v_title TEXT;
  v_description TEXT;
BEGIN
  -- Get version data
  SELECT page_id, source_code, file_url, title, description
  INTO v_page_id, v_source_code, v_file_url, v_title, v_description
  FROM page_versions WHERE id = p_version_id;

  IF NOT FOUND THEN RETURN FALSE; END IF;

  -- Update the current page
  UPDATE pages SET
    source_code = COALESCE(v_source_code, source_code),
    file_url = COALESCE(v_file_url, file_url),
    title = COALESCE(v_title, title),
    description = COALESCE(v_description, description),
    updated_at = now()
  WHERE id = v_page_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
