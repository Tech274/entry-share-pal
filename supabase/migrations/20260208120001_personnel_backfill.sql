-- Backfill personnel reference tables from existing lab_requests and delivery_requests
-- Run after 20260208120000_personnel_reference_tables.sql

-- 1. Insert distinct agents
INSERT INTO public.agents (name)
SELECT t.n FROM (
  SELECT DISTINCT trim(agent_name) AS n FROM (
    SELECT agent_name FROM public.lab_requests WHERE agent_name IS NOT NULL AND trim(agent_name) != ''
    UNION
    SELECT agent_name FROM public.delivery_requests WHERE agent_name IS NOT NULL AND trim(agent_name) != ''
  ) u
) t
WHERE NOT EXISTS (SELECT 1 FROM public.agents a WHERE lower(trim(a.name)) = lower(t.n));

-- 2. Insert distinct account_managers
INSERT INTO public.account_managers (name)
SELECT t.n FROM (
  SELECT DISTINCT trim(account_manager) AS n FROM (
    SELECT account_manager FROM public.lab_requests WHERE account_manager IS NOT NULL AND trim(account_manager) != ''
    UNION
    SELECT account_manager FROM public.delivery_requests WHERE account_manager IS NOT NULL AND trim(account_manager) != ''
  ) u
) t
WHERE NOT EXISTS (SELECT 1 FROM public.account_managers am WHERE lower(trim(am.name)) = lower(t.n));

-- 3. Insert distinct solution_managers (from lab_requests.requester)
INSERT INTO public.solution_managers (name)
SELECT DISTINCT trim(requester) FROM public.lab_requests
WHERE requester IS NOT NULL AND trim(requester) != ''
AND NOT EXISTS (SELECT 1 FROM public.solution_managers sm WHERE lower(trim(sm.name)) = lower(trim(requester)));

-- 4. Insert distinct delivery_managers (from delivery_requests.requester)
INSERT INTO public.delivery_managers (name)
SELECT DISTINCT trim(requester) FROM public.delivery_requests
WHERE requester IS NOT NULL AND trim(requester) != ''
AND NOT EXISTS (SELECT 1 FROM public.delivery_managers dm WHERE lower(trim(dm.name)) = lower(trim(requester)));

-- 5. Insert clients with account_manager_id (most common AM per client)
WITH client_am_pairs AS (
  SELECT trim(client) AS client_name, trim(account_manager) AS am_name, count(*) AS cnt
  FROM (
    SELECT client, account_manager FROM public.lab_requests WHERE client IS NOT NULL AND trim(client) != ''
    UNION ALL
    SELECT client, account_manager FROM public.delivery_requests WHERE client IS NOT NULL AND trim(client) != ''
  ) t
  GROUP BY trim(client), trim(account_manager)
),
best_am_per_client AS (
  SELECT DISTINCT ON (lower(client_name)) client_name, am_name
  FROM client_am_pairs
  ORDER BY lower(client_name), cnt DESC
)
INSERT INTO public.clients (name, account_manager_id)
SELECT b.client_name, am.id
FROM best_am_per_client b
LEFT JOIN public.account_managers am ON am.name = b.am_name AND b.am_name IS NOT NULL AND b.am_name != ''
WHERE NOT EXISTS (SELECT 1 FROM public.clients c WHERE lower(trim(c.name)) = lower(b.client_name));

-- 6. Update lab_requests with FK IDs
UPDATE public.lab_requests lr SET
  agent_id = (SELECT id FROM public.agents a WHERE lower(trim(a.name)) = lower(trim(lr.agent_name)) LIMIT 1)
WHERE lr.agent_name IS NOT NULL AND trim(lr.agent_name) != '';

UPDATE public.lab_requests lr SET
  account_manager_id = (SELECT id FROM public.account_managers am WHERE lower(trim(am.name)) = lower(trim(lr.account_manager)) LIMIT 1)
WHERE lr.account_manager IS NOT NULL AND trim(lr.account_manager) != '';

UPDATE public.lab_requests lr SET
  client_id = (SELECT id FROM public.clients c WHERE lower(trim(c.name)) = lower(trim(lr.client)) LIMIT 1)
WHERE lr.client IS NOT NULL AND trim(lr.client) != '';

UPDATE public.lab_requests lr SET
  requester_id = (SELECT id FROM public.solution_managers sm WHERE lower(trim(sm.name)) = lower(trim(lr.requester)) LIMIT 1)
WHERE lr.requester IS NOT NULL AND trim(lr.requester) != '';

-- 7. Update delivery_requests with FK IDs
UPDATE public.delivery_requests dr SET
  agent_id = (SELECT id FROM public.agents a WHERE lower(trim(a.name)) = lower(trim(dr.agent_name)) LIMIT 1)
WHERE dr.agent_name IS NOT NULL AND trim(dr.agent_name) != '';

UPDATE public.delivery_requests dr SET
  account_manager_id = (SELECT id FROM public.account_managers am WHERE lower(trim(am.name)) = lower(trim(dr.account_manager)) LIMIT 1)
WHERE dr.account_manager IS NOT NULL AND trim(dr.account_manager) != '';

UPDATE public.delivery_requests dr SET
  client_id = (SELECT id FROM public.clients c WHERE lower(trim(c.name)) = lower(trim(dr.client)) LIMIT 1)
WHERE dr.client IS NOT NULL AND trim(dr.client) != '';

UPDATE public.delivery_requests dr SET
  requester_id = (SELECT id FROM public.delivery_managers dm WHERE lower(trim(dm.name)) = lower(trim(dr.requester)) LIMIT 1)
WHERE dr.requester IS NOT NULL AND trim(dr.requester) != '';
