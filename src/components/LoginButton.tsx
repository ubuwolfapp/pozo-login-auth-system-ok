
import React from 'react';

interface LoginButtonProps {
  onClick?: () => void;
  loading?: boolean;
  className?: string;
}

const LoginButton: React.FC<LoginButtonProps> = ({ 
  onClick, 
  loading = false, 
  className = ""
}) => {
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={loading}
      className={`w-full bg-pozo-orange hover:bg-opacity-90 text-white font-medium py-3 px-4 rounded-md transition-colors ${className}`}
    >
      {loading ? "Cargando..." : "Iniciar Sesión"}
    </button>
  );
};

export default LoginButton;
