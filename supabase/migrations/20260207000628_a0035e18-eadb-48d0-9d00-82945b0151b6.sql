-- Enable realtime for lab_requests table
ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_requests;

-- Enable realtime for delivery_requests table
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_requests;

-- Enable realtime for lab_catalog_entries table
ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_catalog_entries;

-- Enable realtime for lab_catalog_categories table
ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_catalog_categories;