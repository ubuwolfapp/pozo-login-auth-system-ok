
CREATE OR REPLACE FUNCTION public.run_sql(sql_query TEXT, params JSONB DEFAULT '{}')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE sql_query INTO result USING params;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Error executing SQL: %', SQLERRM;
END;
$$;

COMMENT ON FUNCTION public.run_sql IS 'Function to run SQL queries from the client (security definer means it runs with the privileges of the creator)';
