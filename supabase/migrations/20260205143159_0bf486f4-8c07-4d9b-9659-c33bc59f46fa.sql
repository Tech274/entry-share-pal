-- Create function to auto-remove solution when delivery is created
CREATE OR REPLACE FUNCTION public.auto_remove_solution_on_delivery()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete matching solution record based on potential_id or fresh_desk_ticket_number
  DELETE FROM public.lab_requests
  WHERE 
    (
      -- Match by potential_id if both have valid values
      (NEW.potential_id IS NOT NULL AND NEW.potential_id != '' AND potential_id = NEW.potential_id)
      OR
      -- Match by fresh_desk_ticket_number if both have valid values  
      (NEW.fresh_desk_ticket_number IS NOT NULL AND NEW.fresh_desk_ticket_number != '' AND fresh_desk_ticket_number = NEW.fresh_desk_ticket_number)
    );
  
  RETURN NEW;
END;
$$;

-- Create trigger on delivery_requests table
CREATE TRIGGER trigger_auto_remove_solution_on_delivery
AFTER INSERT ON public.delivery_requests
FOR EACH ROW
EXECUTE FUNCTION public.auto_remove_solution_on_delivery();