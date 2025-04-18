
import React from 'react';
import { 
  ExclamationTriangleIcon, 
  ThermometerHalfIcon, 
  LanguageIcon, 
  PlusIcon 
} from '@heroicons/react/24/solid';

interface ParameterSummaryProps {
  parameter: string;
  value: string;
  status: string;
  onAddStatus?: () => void;
}

const ParameterSummary: React.FC<ParameterSummaryProps> = ({ parameter, value, status, onAddStatus }) => {
  const renderIcon = () => {
    if (parameter === 'presion') {
      return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
    } else if (parameter === 'temperatura') {
      return <ThermometerHalfIcon className="h-5 w-5 text-cyan-400" />;
    } else if (parameter === 'idioma') {
      return <LanguageIcon className="h-5 w-5 text-cyan-400" />;
    }
    return null;
  };

  const getValueColor = () => {
    if (parameter === 'presion') {
      return 'text-red-500';
    }
    return 'text-white';
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-700">
      <div className="flex items-center space-x-3">
        {renderIcon()}
        <div>
          <div className="flex space-x-2">
            <span className="text-white capitalize">{parameter}</span>
            <span className={getValueColor()}>{value}</span>
          </div>
        </div>
      </div>
      <div>
        {status ? (
          <span className="text-white text-sm">{status}</span>
        ) : (
          <button 
            onClick={onAddStatus}
            className="flex items-center space-x-1 bg-gray-700 rounded-md px-3 py-1"
          >
            <PlusIcon className="h-4 w-4 text-white" />
            <span className="text-white text-sm">Agregar Estado</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ParameterSummary;
