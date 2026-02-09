-- Personnel Tables Migration
-- Create agents table
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create account_managers table
CREATE TABLE IF NOT EXISTS public.account_managers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    account_manager_id UUID REFERENCES public.account_managers(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create solution_managers table
CREATE TABLE IF NOT EXISTS public.solution_managers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create delivery_managers table
CREATE TABLE IF NOT EXISTS public.delivery_managers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create dashboard_config table for role-based dashboard configuration
CREATE TABLE IF NOT EXISTS public.dashboard_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL,
    dashboard_key TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(role, dashboard_key)
);

-- Create cloud_billing_details table
CREATE TABLE IF NOT EXISTS public.cloud_billing_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL CHECK (provider IN ('aws', 'azure', 'gcp')),
    vendor_name TEXT NOT NULL,
    month TEXT NOT NULL,
    year INTEGER NOT NULL,
    overall_business NUMERIC DEFAULT 0,
    cloud_cost NUMERIC DEFAULT 0,
    margins NUMERIC GENERATED ALWAYS AS (overall_business - cloud_cost) STORED,
    margin_percentage NUMERIC GENERATED ALWAYS AS (
        CASE WHEN overall_business > 0 
        THEN ROUND(((overall_business - cloud_cost) / overall_business) * 100, 2)
        ELSE 0 END
    ) STORED,
    invoiced_to_customer NUMERIC DEFAULT 0,
    yet_to_be_billed NUMERIC GENERATED ALWAYS AS (overall_business - invoiced_to_customer) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS on all new tables
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solution_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cloud_billing_details ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agents
CREATE POLICY "Authenticated users can view agents"
ON public.agents FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and ops_leads can manage agents"
ON public.agents FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ops_lead'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ops_lead'));

-- RLS Policies for account_managers
CREATE POLICY "Authenticated users can view account_managers"
ON public.account_managers FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and ops_leads can manage account_managers"
ON public.account_managers FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ops_lead'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ops_lead'));

-- RLS Policies for clients
CREATE POLICY "Authenticated users can view clients"
ON public.clients FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and ops_leads can manage clients"
ON public.clients FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ops_lead'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ops_lead'));

-- RLS Policies for solution_managers
CREATE POLICY "Authenticated users can view solution_managers"
ON public.solution_managers FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and ops_leads can manage solution_managers"
ON public.solution_managers FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ops_lead'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ops_lead'));

-- RLS Policies for delivery_managers
CREATE POLICY "Authenticated users can view delivery_managers"
ON public.delivery_managers FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and ops_leads can manage delivery_managers"
ON public.delivery_managers FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ops_lead'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'ops_lead'));

-- RLS Policies for dashboard_config
CREATE POLICY "Authenticated users can view dashboard_config"
ON public.dashboard_config FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage dashboard_config"
ON public.dashboard_config FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for cloud_billing_details
CREATE POLICY "Finance, admins, and ops_leads can view cloud_billing"
ON public.cloud_billing_details FOR SELECT
USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'finance') OR 
    has_role(auth.uid(), 'ops_lead')
);

CREATE POLICY "Finance and admins can manage cloud_billing"
ON public.cloud_billing_details FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'finance'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'finance'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_account_manager ON public.clients(account_manager_id);
CREATE INDEX IF NOT EXISTS idx_cloud_billing_provider ON public.cloud_billing_details(provider);
CREATE INDEX IF NOT EXISTS idx_cloud_billing_month_year ON public.cloud_billing_details(month, year);
CREATE INDEX IF NOT EXISTS idx_dashboard_config_role ON public.dashboard_config(role);

-- Add triggers for updated_at
CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON public.agents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_account_managers_updated_at
    BEFORE UPDATE ON public.account_managers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_solution_managers_updated_at
    BEFORE UPDATE ON public.solution_managers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_delivery_managers_updated_at
    BEFORE UPDATE ON public.delivery_managers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboard_config_updated_at
    BEFORE UPDATE ON public.dashboard_config
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cloud_billing_updated_at
    BEFORE UPDATE ON public.cloud_billing_details
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default dashboard config
INSERT INTO public.dashboard_config (role, dashboard_key, display_order, is_enabled) VALUES
('admin', 'overview', 1, true),
('admin', 'user_management', 2, true),
('admin', 'lab_catalog', 3, true),
('admin', 'personnel_clients', 4, true),
('admin', 'dashboard_config', 5, true),
('ops_lead', 'overview', 1, true),
('ops_lead', 'team_workload', 2, true),
('ops_lead', 'lab_catalog', 3, true),
('ops_lead', 'personnel_clients', 4, true),
('ops_engineer', 'my_tasks', 1, true),
('ops_engineer', 'assigned_requests', 2, true),
('finance', 'overview', 1, true),
('finance', 'reports', 2, true),
('finance', 'cloud_billing', 3, true)
ON CONFLICT (role, dashboard_key) DO NOTHING;