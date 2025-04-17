
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoginButtonProps {
  loading?: boolean;
  className?: string;
}

const LoginButton: React.FC<LoginButtonProps> = ({ 
  loading = false, 
  className = ""
}) => {
  return (
    <Button
      type="submit"
      disabled={loading}
      className={`w-full bg-pozo-orange hover:bg-opacity-90 text-white font-medium py-3 px-4 rounded-md transition-colors ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Cargando...
        </>
      ) : (
        "Iniciar Sesión"
      )}
    </Button>
  );
};

export default LoginButton;
