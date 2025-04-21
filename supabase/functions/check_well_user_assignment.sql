
CREATE OR REPLACE FUNCTION public.check_well_user_assignment(
  p_usuario_id UUID,
  p_pozo_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM pozos_usuarios
    WHERE usuario_id = p_usuario_id AND pozo_id = p_pozo_id
  ) INTO v_exists;
  
  RETURN v_exists;
END;
$$;
