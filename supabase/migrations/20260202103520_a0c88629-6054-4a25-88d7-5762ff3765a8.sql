-- Create enum for application roles
CREATE TYPE public.app_role AS ENUM ('ops_engineer', 'ops_lead', 'finance', 'admin');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'ops_engineer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- User roles policies - users can only see their own role, admins can see all
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
  ON public.user_roles
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
  ON public.user_roles
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to handle new user signup - creates profile and assigns default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Assign default role (ops_engineer)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'ops_engineer');
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-create profile and role on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update profiles timestamp trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add assigned_to column to lab_requests for ops engineer assignment
ALTER TABLE public.lab_requests ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);

-- Add assigned_to column to delivery_requests for ops engineer assignment
ALTER TABLE public.delivery_requests ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);

-- Update RLS policies for lab_requests based on roles
DROP POLICY IF EXISTS "Allow public read access to lab_requests" ON public.lab_requests;
DROP POLICY IF EXISTS "Allow public insert access to lab_requests" ON public.lab_requests;
DROP POLICY IF EXISTS "Allow public update access to lab_requests" ON public.lab_requests;
DROP POLICY IF EXISTS "Allow public delete access to lab_requests" ON public.lab_requests;

-- Lab requests: Ops Engineers see only assigned, Ops Leads see team, Finance sees cost fields only, Admin sees all
CREATE POLICY "Role-based read access to lab_requests"
  ON public.lab_requests
  FOR SELECT
  USING (
    -- Admin can see all
    public.has_role(auth.uid(), 'admin')
    OR
    -- Ops Lead can see all
    public.has_role(auth.uid(), 'ops_lead')
    OR
    -- Finance can see all (but will filter columns in app)
    public.has_role(auth.uid(), 'finance')
    OR
    -- Ops Engineer sees only assigned requests
    (public.has_role(auth.uid(), 'ops_engineer') AND (assigned_to = auth.uid() OR assigned_to IS NULL))
  );

CREATE POLICY "Role-based insert access to lab_requests"
  ON public.lab_requests
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'ops_lead')
    OR public.has_role(auth.uid(), 'ops_engineer')
  );

CREATE POLICY "Role-based update access to lab_requests"
  ON public.lab_requests
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'ops_lead')
    OR (public.has_role(auth.uid(), 'ops_engineer') AND assigned_to = auth.uid())
  );

CREATE POLICY "Role-based delete access to lab_requests"
  ON public.lab_requests
  FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'ops_lead')
  );

-- Update RLS policies for delivery_requests based on roles
DROP POLICY IF EXISTS "Allow public read access to delivery_requests" ON public.delivery_requests;
DROP POLICY IF EXISTS "Allow public insert access to delivery_requests" ON public.delivery_requests;
DROP POLICY IF EXISTS "Allow public update access to delivery_requests" ON public.delivery_requests;
DROP POLICY IF EXISTS "Allow public delete access to delivery_requests" ON public.delivery_requests;

CREATE POLICY "Role-based read access to delivery_requests"
  ON public.delivery_requests
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'ops_lead')
    OR public.has_role(auth.uid(), 'finance')
    OR (public.has_role(auth.uid(), 'ops_engineer') AND (assigned_to = auth.uid() OR assigned_to IS NULL))
  );

CREATE POLICY "Role-based insert access to delivery_requests"
  ON public.delivery_requests
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'ops_lead')
    OR public.has_role(auth.uid(), 'ops_engineer')
  );

CREATE POLICY "Role-based update access to delivery_requests"
  ON public.delivery_requests
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'ops_lead')
    OR (public.has_role(auth.uid(), 'ops_engineer') AND assigned_to = auth.uid())
  );

CREATE POLICY "Role-based delete access to delivery_requests"
  ON public.delivery_requests
  FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'ops_lead')
  );