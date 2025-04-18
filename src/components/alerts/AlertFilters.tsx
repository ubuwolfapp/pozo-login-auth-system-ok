
import React from 'react';
import { Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AlertType } from '@/types/alerts';

interface AlertFiltersProps {
  activeFilter: AlertType;
  onFilterChange: (filter: AlertType) => void;
}

const AlertFilters = ({ activeFilter, onFilterChange }: AlertFiltersProps) => {
  const handleFilterButtonClick = () => {
    toast({
      title: "Filtro",
      description: "Función de filtro no implementada",
    });
  };

  return (
    <>
      <div className="flex justify-between mb-4">
        <button
          onClick={() => onFilterChange('todas')}
          className={`flex-1 py-3 rounded-l-lg ${activeFilter === 'todas' ? 'bg-[#2E3A59]' : 'bg-[#1C2526]'}`}
        >
          Todas
        </button>
        <button
          onClick={() => onFilterChange('critica')}
          className={`flex-1 py-3 ${activeFilter === 'critica' ? 'bg-[#2E3A59]' : 'bg-[#1C2526]'}`}
        >
          Críticas
        </button>
        <button
          onClick={() => onFilterChange('resueltas')}
          className={`flex-1 py-3 rounded-r-lg ${activeFilter === 'resueltas' ? 'bg-[#2E3A59]' : 'bg-[#1C2526]'}`}
        >
          Resueltas
        </button>
      </div>
      <button onClick={handleFilterButtonClick} className="absolute right-4 top-4 text-white">
        <Filter className="h-6 w-6" />
      </button>
    </>
  );
};

export default AlertFilters;
