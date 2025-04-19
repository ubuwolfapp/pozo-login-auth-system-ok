
import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

interface WellSelectorProps {
  wellName: string;
  onSelect: () => void;
}

const WellSelector = ({ wellName, onSelect }: WellSelectorProps) => {
  return (
    <div 
      onClick={onSelect}
      className="bg-[#2A3441] p-4 rounded-lg flex justify-between items-center cursor-pointer"
    >
      <span>{wellName || "Seleccionar pozo"}</span>
      <ChevronDownIcon className="h-5 w-5" />
    </div>
  );
};

export default WellSelector;
