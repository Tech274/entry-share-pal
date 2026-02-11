-- Personnel & Clients Reference Tables
-- Agents, Account Managers, Clients, Solution Managers, Delivery Managers

-- 1. agents
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. account_managers
CREATE TABLE public.account_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. clients (with account_manager_id FK)
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  account_manager_id UUID REFERENCES public.account_managers(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. solution_managers (Requester for Solutions)
CREATE TABLE public.solution_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. delivery_managers (Requester for Delivery)
CREATE TABLE public.delivery_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Timestamp triggers
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_account_managers_updated_at BEFORE UPDATE ON public.account_managers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_solution_managers_updated_at BEFORE UPDATE ON public.solution_managers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_delivery_managers_updated_at BEFORE UPDATE ON public.delivery_managers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solution_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_managers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to agents" ON public.agents FOR SELECT USING (true);
CREATE POLICY "Allow insert access to agents" ON public.agents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update access to agents" ON public.agents FOR UPDATE USING (true);
CREATE POLICY "Allow delete access to agents" ON public.agents FOR DELETE USING (true);

CREATE POLICY "Allow read access to account_managers" ON public.account_managers FOR SELECT USING (true);
CREATE POLICY "Allow insert access to account_managers" ON public.account_managers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update access to account_managers" ON public.account_managers FOR UPDATE USING (true);
CREATE POLICY "Allow delete access to account_managers" ON public.account_managers FOR DELETE USING (true);

CREATE POLICY "Allow read access to clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Allow insert access to clients" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update access to clients" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Allow delete access to clients" ON public.clients FOR DELETE USING (true);

CREATE POLICY "Allow read access to solution_managers" ON public.solution_managers FOR SELECT USING (true);
CREATE POLICY "Allow insert access to solution_managers" ON public.solution_managers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update access to solution_managers" ON public.solution_managers FOR UPDATE USING (true);
CREATE POLICY "Allow delete access to solution_managers" ON public.solution_managers FOR DELETE USING (true);

CREATE POLICY "Allow read access to delivery_managers" ON public.delivery_managers FOR SELECT USING (true);
CREATE POLICY "Allow insert access to delivery_managers" ON public.delivery_managers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update access to delivery_managers" ON public.delivery_managers FOR UPDATE USING (true);
CREATE POLICY "Allow delete access to delivery_managers" ON public.delivery_managers FOR DELETE USING (true);

-- Grants (ensure anon/authenticated can use the tables with RLS)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agents TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.account_managers TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.solution_managers TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_managers TO anon, authenticated;

-- Add FK columns to lab_requests
ALTER TABLE public.lab_requests ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL;
ALTER TABLE public.lab_requests ADD COLUMN IF NOT EXISTS account_manager_id UUID REFERENCES public.account_managers(id) ON DELETE SET NULL;
ALTER TABLE public.lab_requests ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;
ALTER TABLE public.lab_requests ADD COLUMN IF NOT EXISTS requester_id UUID REFERENCES public.solution_managers(id) ON DELETE SET NULL;

-- Add FK columns to delivery_requests
ALTER TABLE public.delivery_requests ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL;
ALTER TABLE public.delivery_requests ADD COLUMN IF NOT EXISTS account_manager_id UUID REFERENCES public.account_managers(id) ON DELETE SET NULL;
ALTER TABLE public.delivery_requests ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;
ALTER TABLE public.delivery_requests ADD COLUMN IF NOT EXISTS requester_id UUID REFERENCES public.delivery_managers(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agents_name ON public.agents(name);
CREATE INDEX IF NOT EXISTS idx_account_managers_name ON public.account_managers(name);
CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_account_manager_id ON public.clients(account_manager_id);
CREATE INDEX IF NOT EXISTS idx_lab_requests_agent_id ON public.lab_requests(agent_id);
CREATE INDEX IF NOT EXISTS idx_lab_requests_account_manager_id ON public.lab_requests(account_manager_id);
CREATE INDEX IF NOT EXISTS idx_lab_requests_client_id ON public.lab_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_lab_requests_requester_id ON public.lab_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_delivery_requests_agent_id ON public.delivery_requests(agent_id);
CREATE INDEX IF NOT EXISTS idx_delivery_requests_account_manager_id ON public.delivery_requests(account_manager_id);
CREATE INDEX IF NOT EXISTS idx_delivery_requests_client_id ON public.delivery_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_delivery_requests_requester_id ON public.delivery_requests(requester_id);
