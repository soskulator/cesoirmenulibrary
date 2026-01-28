-- Create storage bucket for admin assets (menu photos, spreadsheets, recipes)
INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-assets', 'admin-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow admins to upload files to admin-assets bucket
CREATE POLICY "Admins can upload admin assets"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'admin-assets' 
  AND public.is_admin(auth.uid())
);

-- Allow admins to update files in admin-assets bucket
CREATE POLICY "Admins can update admin assets"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'admin-assets' 
  AND public.is_admin(auth.uid())
);

-- Allow admins to delete files in admin-assets bucket
CREATE POLICY "Admins can delete admin assets"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'admin-assets' 
  AND public.is_admin(auth.uid())
);

-- Allow public read access to admin assets (for menu photos etc)
CREATE POLICY "Public can view admin assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'admin-assets');