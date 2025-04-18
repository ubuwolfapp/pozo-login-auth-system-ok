
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import NavigationBar from '@/components/NavigationBar';

const AlertsNavigation = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-[#1C2526]">
        <button onClick={() => navigate('/dashboard')} className="text-white">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-white">Alertas</h1>
        <div className="w-6" /> {/* Espaciador para alineación */}
      </div>

      <NavigationBar />
    </>
  );
};

export default AlertsNavigation;
