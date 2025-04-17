
import React from 'react';

interface ForgotPasswordLinkProps {
  onClick?: () => void;
  className?: string;
}

const ForgotPasswordLink: React.FC<ForgotPasswordLinkProps> = ({ 
  onClick, 
  className = ""
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-white hover:underline text-center w-full py-2 ${className}`}
    >
      ¿Olvidaste tu contraseña?
    </button>
  );
};

export default ForgotPasswordLink;
