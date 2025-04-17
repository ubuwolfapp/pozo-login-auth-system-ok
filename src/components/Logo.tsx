
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="mr-3">
        <svg width="70" height="80" viewBox="0 0 70 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Pozo petrolero estilizado */}
          <path d="M31 10L39 15L39 50L31 45L31 10Z" fill="#FFFFFF" />
          <path d="M45 20L53 25L53 60L45 55L45 20Z" fill="#FFFFFF" />
          <path d="M25 60H55" stroke="#FFFFFF" strokeWidth="3" />
          <path d="M20 70H60" stroke="#FFFFFF" strokeWidth="5" />
          <path d="M10 25L60 50" stroke="#FF6200" strokeWidth="5" strokeLinecap="round" />
          <circle cx="10" cy="25" r="5" fill="#FF6200" />
        </svg>
      </div>
      <div className="text-white text-left">
        <div className="text-3xl font-bold">Monitoreo</div>
        <div className="text-3xl font-bold">de Pozos</div>
      </div>
    </div>
  );
};

export default Logo;
