
import React from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';

interface ReportHeaderProps {
  onBack: () => void;
}

const ReportHeader = ({ onBack }: ReportHeaderProps) => {
  return (
    <header className="flex items-center justify-between px-4 pt-12 pb-4 border-b border-gray-700">
      <button onClick={onBack} className="p-2">
        <ChevronLeftIcon className="h-6 w-6" />
      </button>
      <h1 className="text-xl font-bold">Reportes</h1>
      <div className="w-10" />
    </header>
  );
};

export default ReportHeader;
