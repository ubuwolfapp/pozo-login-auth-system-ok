
import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

interface ParameterSelectorProps {
  onSelect: () => void;
}

const ParameterSelector = ({ onSelect }: ParameterSelectorProps) => {
  return (
    <div 
      onClick={onSelect}
      className="bg-[#2A3441] p-4 rounded-lg flex justify-between items-center cursor-pointer"
    >
      <span>Parámetros</span>
      <div className="flex items-center">
        <span className="mr-2">Producción</span>
        <ChevronRightIcon className="h-5 w-5" />
      </div>
    </div>
  );
};

export default ParameterSelector;
