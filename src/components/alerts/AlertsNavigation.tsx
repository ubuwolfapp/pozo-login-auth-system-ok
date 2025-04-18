
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle, BarChart3, FileText, Settings, ArrowLeft } from 'lucide-react';

const AlertsNavigation = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-[#1C2526]">
        <button onClick={() => navigate('/dashboard')} className="text-white">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-white">Alertas</h1>
        <div className="w-6" /> {/* Spacer for alignment */}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#1C2526] px-6 py-4">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <Home 
            className="text-gray-400 h-6 w-6 cursor-pointer hover:text-white transition-colors" 
            onClick={() => navigate('/dashboard')}
          />
          <AlertTriangle className="text-[#FF6200] h-6 w-6 cursor-pointer" />
          <BarChart3 className="text-gray-400 h-6 w-6 cursor-pointer hover:text-white transition-colors" />
          <FileText className="text-gray-400 h-6 w-6 cursor-pointer hover:text-white transition-colors" />
          <Settings className="text-gray-400 h-6 w-6 cursor-pointer hover:text-white transition-colors" />
        </div>
      </nav>
    </>
  );
};

export default AlertsNavigation;
