
-- Add avatar_url column to players
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS avatar_url text;

-- Create storage bucket for player avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('player-avatars', 'player-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to player-avatars bucket
CREATE POLICY "Authenticated users can upload player avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'player-avatars');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update player avatars"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'player-avatars');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete player avatars"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'player-avatars');

-- Allow public read access to player avatars
CREATE POLICY "Public read access for player avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'player-avatars');
