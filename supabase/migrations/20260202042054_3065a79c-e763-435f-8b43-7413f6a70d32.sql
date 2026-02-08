-- Create lab_requests table
CREATE TABLE public.lab_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  potential_id TEXT,
  fresh_desk_ticket_number TEXT,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  client TEXT NOT NULL,
  cloud TEXT,
  lab_name TEXT,
  requester TEXT,
  agent_name TEXT,
  account_manager TEXT,
  received_on TEXT,
  lab_start_date TEXT,
  lab_end_date TEXT,
  user_count INTEGER DEFAULT 0,
  duration_in_days INTEGER DEFAULT 0,
  input_cost_per_user NUMERIC DEFAULT 0,
  selling_cost_per_user NUMERIC DEFAULT 0,
  total_amount_for_training NUMERIC DEFAULT 0,
  margin NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Solution Pending',
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create delivery_requests table
CREATE TABLE public.delivery_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  potential_id TEXT,
  fresh_desk_ticket_number TEXT,
  training_name TEXT,
  number_of_users INTEGER DEFAULT 0,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  received_on TEXT,
  client TEXT NOT NULL,
  cloud TEXT,
  lab_name TEXT,
  requester TEXT,
  agent_name TEXT,
  account_manager TEXT,
  lab_status TEXT DEFAULT 'Pending',
  lab_type TEXT,
  start_date TEXT,
  end_date TEXT,
  lab_setup_requirement TEXT,
  input_cost_per_user NUMERIC DEFAULT 0,
  selling_cost_per_user NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on both tables
ALTER TABLE public.lab_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_requests ENABLE ROW LEVEL SECURITY;

-- Create public read/write policies (since no auth is required for this internal tool)
-- Lab Requests policies
CREATE POLICY "Allow public read access to lab_requests"
ON public.lab_requests
FOR SELECT
USING (true);

CREATE POLICY "Allow public insert access to lab_requests"
ON public.lab_requests
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update access to lab_requests"
ON public.lab_requests
FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete access to lab_requests"
ON public.lab_requests
FOR DELETE
USING (true);

-- Delivery Requests policies
CREATE POLICY "Allow public read access to delivery_requests"
ON public.delivery_requests
FOR SELECT
USING (true);

CREATE POLICY "Allow public insert access to delivery_requests"
ON public.delivery_requests
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update access to delivery_requests"
ON public.delivery_requests
FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete access to delivery_requests"
ON public.delivery_requests
FOR DELETE
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_lab_requests_month_year ON public.lab_requests(month, year);
CREATE INDEX idx_lab_requests_client ON public.lab_requests(client);
CREATE INDEX idx_lab_requests_status ON public.lab_requests(status);
CREATE INDEX idx_delivery_requests_month_year ON public.delivery_requests(month, year);
CREATE INDEX idx_delivery_requests_client ON public.delivery_requests(client);
CREATE INDEX idx_delivery_requests_lab_status ON public.delivery_requests(lab_status);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_lab_requests_updated_at
BEFORE UPDATE ON public.lab_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_delivery_requests_updated_at
BEFORE UPDATE ON public.delivery_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();