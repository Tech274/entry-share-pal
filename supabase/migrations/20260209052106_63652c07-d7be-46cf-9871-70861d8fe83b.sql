-- Add foreign key ID columns to lab_requests (optional, keeping existing text columns for backwards compatibility)
ALTER TABLE public.lab_requests 
  ADD COLUMN IF NOT EXISTS agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS account_manager_id uuid REFERENCES public.account_managers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;

-- Add foreign key ID columns to delivery_requests (optional, keeping existing text columns for backwards compatibility)
ALTER TABLE public.delivery_requests 
  ADD COLUMN IF NOT EXISTS agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS account_manager_id uuid REFERENCES public.account_managers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lab_requests_agent_id ON public.lab_requests(agent_id);
CREATE INDEX IF NOT EXISTS idx_lab_requests_account_manager_id ON public.lab_requests(account_manager_id);
CREATE INDEX IF NOT EXISTS idx_lab_requests_client_id ON public.lab_requests(client_id);

CREATE INDEX IF NOT EXISTS idx_delivery_requests_agent_id ON public.delivery_requests(agent_id);
CREATE INDEX IF NOT EXISTS idx_delivery_requests_account_manager_id ON public.delivery_requests(account_manager_id);
CREATE INDEX IF NOT EXISTS idx_delivery_requests_client_id ON public.delivery_requests(client_id);

-- Add comments for documentation
COMMENT ON COLUMN public.lab_requests.agent_id IS 'Foreign key to agents table (optional, agent_name is kept for backwards compatibility)';
COMMENT ON COLUMN public.lab_requests.account_manager_id IS 'Foreign key to account_managers table (optional, account_manager is kept for backwards compatibility)';
COMMENT ON COLUMN public.lab_requests.client_id IS 'Foreign key to clients table (optional, client is kept for backwards compatibility)';

COMMENT ON COLUMN public.delivery_requests.agent_id IS 'Foreign key to agents table (optional, agent_name is kept for backwards compatibility)';
COMMENT ON COLUMN public.delivery_requests.account_manager_id IS 'Foreign key to account_managers table (optional, account_manager is kept for backwards compatibility)';
COMMENT ON COLUMN public.delivery_requests.client_id IS 'Foreign key to clients table (optional, client is kept for backwards compatibility)';