
CREATE OR REPLACE FUNCTION public.create_pozos_usuarios_table()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.pozos_usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL,
    pozo_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(usuario_id, pozo_id)
  );

  COMMENT ON TABLE public.pozos_usuarios IS 'Tabla de relación entre usuarios y pozos';
  
  -- Add indexes for better performance
  CREATE INDEX IF NOT EXISTS idx_pozos_usuarios_usuario_id ON public.pozos_usuarios(usuario_id);
  CREATE INDEX IF NOT EXISTS idx_pozos_usuarios_pozo_id ON public.pozos_usuarios(pozo_id);
END;
$$;
