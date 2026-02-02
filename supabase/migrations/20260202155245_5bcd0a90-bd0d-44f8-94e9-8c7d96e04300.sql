-- Create storage bucket for request attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('request-attachments', 'request-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload files to the bucket
CREATE POLICY "Anyone can upload request attachments"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'request-attachments');

-- Allow anyone to view request attachments (public bucket)
CREATE POLICY "Anyone can view request attachments"
ON storage.objects
FOR SELECT
USING (bucket_id = 'request-attachments');

-- Allow users to delete their own uploads (by path pattern)
CREATE POLICY "Users can delete their own attachments"
ON storage.objects
FOR DELETE
USING (bucket_id = 'request-attachments');