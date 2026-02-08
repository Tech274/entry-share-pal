-- Fix RLS policy: Restrict profile visibility to own profile + admin
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create more restrictive policy: Users can view their own profile OR admins can view all
CREATE POLICY "Users can view own profile or admin can view all"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR 
  public.has_role(auth.uid(), 'admin')
);

-- Also add policy for profiles to be viewable by the user themselves during signup flow
-- This ensures the profile can be read right after creation
