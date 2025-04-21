
CREATE OR REPLACE FUNCTION public.check_table_exists(p_table_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = p_table_name
  ) INTO v_exists;
  
  RETURN v_exists;
END;
$$;
